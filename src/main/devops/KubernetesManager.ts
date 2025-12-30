import { EventEmitter } from 'eventemitter3'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '../services/Logger'

const execAsync = promisify(exec)

export class KubernetesManager extends EventEmitter {
  private pods: Map<string, K8sPod> = new Map()
  private services: Map<string, K8sService> = new Map()
  private deployments: Map<string, K8sDeployment> = new Map()

  async listPods(namespace = 'default'): Promise<K8sPod[]> {
    try {
      const { stdout } = await execAsync(`kubectl get pods -n ${namespace} --format "{{.metadata.name}}\t{{.status.phase}}\t{{.spec.nodeName}}"`)
      const lines = stdout.trim().split('\n').filter(line => line)
      const pods = lines.map(line => {
        const [name, phase, node] = line.split('\t')
        return {
          name,
          namespace,
          phase,
          node
        }
      })

      pods.forEach(pod => {
        this.pods.set(`${namespace}/${pod.name}`, pod)
      })

      this.emit('pods-updated', Array.from(this.pods.values()))
      return pods
    } catch (error) {
      logger.error('Failed to list Kubernetes pods', error as Error, { namespace })
      return []
    }
  }

  async listServices(namespace = 'default'): Promise<K8sService[]> {
    try {
      const { stdout } = await execAsync(`kubectl get services -n ${namespace} --format "{{.metadata.name}}\t{{.spec.type}}\t{{.spec.clusterIP}}\t{{.spec.ports}}"`)
      const lines = stdout.trim().split('\n').filter(line => line)
      const services = lines.map(line => {
        const [name, type, clusterIP, ports] = line.split('\t')
        return {
          name,
          namespace,
          type,
          clusterIP,
          ports
        }
      })

      services.forEach(service => {
        this.services.set(`${namespace}/${service.name}`, service)
      })

      this.emit('services-updated', Array.from(this.services.values()))
      return services
    } catch (error) {
      logger.error('Failed to list Kubernetes services', error as Error, { namespace })
      return []
    }
  }

  async listDeployments(namespace = 'default'): Promise<K8sDeployment[]> {
    try {
      const { stdout } = await execAsync(`kubectl get deployments -n ${namespace} --format "{{.metadata.name}}\t{{.spec.replicas}}\t{{.status.readyReplicas}}"`)
      const lines = stdout.trim().split('\n').filter(line => line)
      const deployments = lines.map(line => {
        const [name, replicas, readyReplicas] = line.split('\t')
        return {
          name,
          namespace,
          replicas: parseInt(replicas, 10),
          readyReplicas: parseInt(readyReplicas, 10)
        }
      })

      deployments.forEach(deployment => {
        this.deployments.set(`${namespace}/${deployment.name}`, deployment)
      })

      this.emit('deployments-updated', Array.from(this.deployments.values()))
      return deployments
    } catch (error) {
      logger.error('Failed to list Kubernetes deployments', error as Error, { namespace })
      return []
    }
  }

  async getPodLogs(podName: string, namespace = 'default', tail = 100): Promise<string> {
    try {
      const { stdout } = await execAsync(`kubectl logs -n ${namespace} --tail=${tail} ${podName}`)
      return stdout
    } catch (error) {
      logger.error('Failed to get pod logs', error as Error, { podName, namespace, tail })
      return ''
    }
  }

  async describeResource(resource: string, name: string, namespace = 'default'): Promise<string> {
    try {
      const { stdout } = await execAsync(`kubectl describe ${resource} ${name} -n ${namespace}`)
      return stdout
    } catch (error) {
      logger.error('Failed to describe resource', error as Error, { resource, name, namespace })
      return ''
    }
  }

  async scaleDeployment(name: string, replicas: number, namespace = 'default'): Promise<boolean> {
    try {
      await execAsync(`kubectl scale deployment ${name} --replicas=${replicas} -n ${namespace}`)
      await this.listDeployments(namespace)
      return true
    } catch (error) {
      logger.error('Failed to scale deployment', error as Error, { name, replicas, namespace })
      return false
    }
  }

  async applyManifest(manifestPath: string): Promise<boolean> {
    try {
      await execAsync(`kubectl apply -f ${manifestPath}`)
      return true
    } catch (error) {
      logger.error('Failed to apply manifest', error as Error, { manifestPath })
      return false
    }
  }
}

export interface K8sPod {
  name: string
  namespace: string
  phase: string
  node: string
}

export interface K8sService {
  name: string
  namespace: string
  type: string
  clusterIP: string
  ports: string
}

export interface K8sDeployment {
  name: string
  namespace: string
  replicas: number
  readyReplicas: number
}
