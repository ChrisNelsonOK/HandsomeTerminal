import { EventEmitter } from 'eventemitter3'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '../services/Logger'

const execAsync = promisify(exec)

export class DockerManager extends EventEmitter {
  private containers: Map<string, DockerContainer> = new Map()
  private images: Map<string, DockerImage> = new Map()

  async listContainers(): Promise<DockerContainer[]> {
    try {
      const { stdout } = await execAsync('docker ps --format "{{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"')
      const lines = stdout.trim().split('\n').filter(line => line)
      const containers = lines.map(line => {
        const [id, names, status, ports] = line.split('\t')
        return {
          id,
          names: names.split(','),
          status,
          ports
        }
      })

      containers.forEach(container => {
        this.containers.set(container.id, container)
      })

      this.emit('containers-updated', Array.from(this.containers.values()))
      return containers
    } catch (error) {
      logger.error('Failed to list Docker containers', error as Error)
      return []
    }
  }

  async listImages(): Promise<DockerImage[]> {
    try {
      const { stdout } = await execAsync('docker images --format "{{.ID}}\t{{.Repository}}\t{{.Tag}}\t{{.Size}}"')
      const lines = stdout.trim().split('\n').filter(line => line)
      const images = lines.map(line => {
        const [id, repository, tag, size] = line.split('\t')
        return {
          id,
          repository,
          tag,
          size
        }
      })

      images.forEach(image => {
        this.images.set(image.id, image)
      })

      this.emit('images-updated', Array.from(this.images.values()))
      return images
    } catch (error) {
      logger.error('Failed to list Docker images', error as Error)
      return []
    }
  }

  async startContainer(containerId: string): Promise<boolean> {
    try {
      await execAsync(`docker start ${containerId}`)
      await this.listContainers()
      return true
    } catch (error) {
      logger.error('Failed to start container', error as Error, { containerId })
      return false
    }
  }

  async stopContainer(containerId: string): Promise<boolean> {
    try {
      await execAsync(`docker stop ${containerId}`)
      await this.listContainers()
      return true
    } catch (error) {
      logger.error('Failed to stop container', error as Error, { containerId })
      return false
    }
  }

  async removeContainer(containerId: string): Promise<boolean> {
    try {
      await execAsync(`docker rm -f ${containerId}`)
      this.containers.delete(containerId)
      this.emit('containers-updated', Array.from(this.containers.values()))
      return true
    } catch (error) {
      logger.error('Failed to remove container', error as Error, { containerId })
      return false
    }
  }

  async runContainer(image: string, name?: string): Promise<string | null> {
    try {
      const command = name ? `docker run -d --name ${name} ${image}` : `docker run -d ${image}`
      const { stdout } = await execAsync(command)
      await this.listContainers()
      return stdout.trim()
    } catch (error) {
      logger.error('Failed to run container', error as Error, { image, name })
      return null
    }
  }

  async getContainerLogs(containerId: string, tail = 100): Promise<string> {
    try {
      const { stdout } = await execAsync(`docker logs --tail ${tail} ${containerId}`)
      return stdout
    } catch (error) {
      logger.error('Failed to get container logs', error as Error, { containerId, tail })
      return ''
    }
  }

  async getContainerStats(containerId: string): Promise<DockerStats | null> {
    try {
      const { stdout } = await execAsync(`docker stats --no-stream --format "{{.CPUPerc}}\t{{.MemUsage}}" ${containerId}`)
      const [cpu, mem] = stdout.trim().split('\t')
      return {
        cpu: parseFloat(cpu),
        memory: mem
      }
    } catch (error) {
      logger.error('Failed to get container stats', error as Error, { containerId })
      return null
    }
  }
}

export interface DockerContainer {
  id: string
  names: string[]
  status: string
  ports: string
}

export interface DockerImage {
  id: string
  repository: string
  tag: string
  size: string
}

export interface DockerStats {
  cpu: number
  memory: string
}
