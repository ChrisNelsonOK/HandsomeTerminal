import { EventEmitter } from 'eventemitter3'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '../services/Logger'

const execAsync = promisify(exec)

export class NetworkManager extends EventEmitter {
  private connections: Map<string, NetworkConnection> = new Map()

  async getActiveConnections(): Promise<NetworkConnection[]> {
    try {
      const { stdout } = await execAsync('netstat -an | grep ESTABLISHED')
      const lines = stdout.trim().split('\n').filter(line => line && !line.startsWith('Proto'))
      const connections = lines.map(line => {
        const parts = line.trim().split(/\s+/)
        return {
          protocol: parts[0],
          localAddress: parts[3],
          foreignAddress: parts[4],
          state: parts[5],
          pid: parts[6]
        }
      })

      connections.forEach(conn => {
        this.connections.set(`${conn.localAddress}-${conn.foreignAddress}`, conn)
      })

      this.emit('connections-updated', Array.from(this.connections.values()))
      return connections
    } catch (error) {
      logger.error('Failed to get network connections', error as Error)
      return []
    }
  }

  async ping(host: string, count = 4): Promise<PingResult> {
    try {
      const { stdout } = await execAsync(`ping -c ${count} ${host}`)
      const lines = stdout.trim().split('\n')
      const result = {
        host,
        success: true,
        statistics: {
          packetsSent: count,
          packetsReceived: 0,
          packetLoss: '0%',
          minTime: 0,
          maxTime: 0,
          avgTime: 0
        }
      }

      lines.forEach(line => {
        const match = line.match(/(\d+) packets transmitted, (\d+) packets received, (\d+)% packet loss/)
        if (match) {
          result.statistics.packetsReceived = parseInt(match[2], 10)
          result.statistics.packetLoss = match[3]
        }

        const timeMatch = line.match(/min\/avg\/max\/mdev = ([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+) ms/)
        if (timeMatch) {
          result.statistics.minTime = parseFloat(timeMatch[1])
          result.statistics.avgTime = parseFloat(timeMatch[2])
          result.statistics.maxTime = parseFloat(timeMatch[3])
        }
      })

      return result
    } catch (error) {
      logger.error('Failed to ping host', error as Error, { host, count })
      return {
        host,
        success: false,
        statistics: {
          packetsSent: count,
          packetsReceived: 0,
          packetLoss: '100%',
          minTime: 0,
          maxTime: 0,
          avgTime: 0
        }
      }
    }
  }

  async portScan(host: string, ports: number[]): Promise<PortScanResult> {
    const results: PortStatus[] = []

    for (const port of ports) {
      try {
        const { stdout } = await execAsync(`nc -zv ${host} ${port} 2>&1 || true`)
        const isOpen = stdout.includes('succeeded') || stdout.includes('open')
        results.push({
          port,
          status: isOpen ? 'open' : 'closed'
        })
      } catch {
        results.push({
          port,
          status: 'closed'
        })
      }
    }

    return {
      host,
      ports: results
    }
  }

  async traceroute(host: string): Promise<TracerouteHop[]> {
    try {
      const { stdout } = await execAsync(`traceroute ${host}`)
      const lines = stdout.trim().split('\n').filter(line => line)
      const hops: TracerouteHop[] = []

      lines.forEach(line => {
        const match = line.match(/^\s*(\d+)\s+(.+?)\s+(\d+\.\d+)+\s*ms/)
        if (match) {
          hops.push({
            hop: parseInt(match[1], 10),
            hostname: match[2].trim(),
            rtt: match[3].split(' ').map(parseFloat)
          })
        }
      })

      return hops
    } catch (error) {
      logger.error('Failed to traceroute', error as Error, { host })
      return []
    }
  }

  async getDNSInfo(domain: string): Promise<DNSInfo> {
    try {
      const { stdout } = await execAsync(`nslookup ${domain}`)
      const records: string[] = []

      const lines = stdout.split('\n')
      lines.forEach(line => {
        if (line.includes('Address:') || line.includes('AAAA')) {
          const match = line.match(/Address:\s*(.+)/)
          if (match) {
            records.push(match[1].trim())
          }
        }
      })

      return {
        domain,
        records
      }
    } catch (error) {
      logger.error('Failed to get DNS info', error as Error, { domain })
      return {
        domain,
        records: []
      }
    }
  }
}

export interface NetworkConnection {
  protocol: string
  localAddress: string
  foreignAddress: string
  state: string
  pid?: string
}

export interface PingResult {
  host: string
  success: boolean
  statistics: {
    packetsSent: number
    packetsReceived: number
    packetLoss: string
    minTime: number
    maxTime: number
    avgTime: number
  }
}

export interface PortScanResult {
  host: string
  ports: PortStatus[]
}

export interface PortStatus {
  port: number
  status: 'open' | 'closed' | 'filtered'
}

export interface TracerouteHop {
  hop: number
  hostname: string
  rtt: number[]
}

export interface DNSInfo {
  domain: string
  records: string[]
}
