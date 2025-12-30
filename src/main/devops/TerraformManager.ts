import { EventEmitter } from 'eventemitter3'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '../services/Logger'

const execAsync = promisify(exec)

export class TerraformManager extends EventEmitter {
  private workspaces: Map<string, TerraformWorkspace> = new Map()
  private states: Map<string, TerraformState> = new Map()

  async listWorkspaces(directory: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`cd ${directory} && terraform workspace list`, {
        cwd: directory
      })
      const workspaces = stdout.trim().split('\n').filter(w => w && !w.startsWith('*')).map(w => w.trim())
      const current = stdout.trim().split('\n').find(w => w.startsWith('*'))?.substring(2) || 'default'
      
      workspaces.forEach(ws => {
        this.workspaces.set(ws, {
          name: ws,
          directory,
          current: ws === current
        })
      })

      this.emit('workspaces-updated', Array.from(this.workspaces.values()))
      return workspaces
    } catch (error) {
      logger.error('Failed to list Terraform workspaces', error as Error, { directory })
      return []
    }
  }

  async getState(directory: string): Promise<TerraformState | null> {
    try {
      const { stdout } = await execAsync(`cd ${directory} && terraform show -json`, {
        cwd: directory
      })
      const state = JSON.parse(stdout)
      const parsedState: TerraformState = {
        directory,
        resources: state.values?.root_module?.resources?.length || 0,
        outputs: state.values?.outputs || {},
        version: state.format_version || 'unknown'
      }

      this.states.set(directory, parsedState)
      this.emit('state-updated', parsedState)
      return parsedState
    } catch (error) {
      logger.error('Failed to get Terraform state', error as Error, { directory })
      return null
    }
  }

  async plan(directory: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`cd ${directory} && terraform plan`, {
        cwd: directory
      })
      return stdout
    } catch (error) {
      logger.error('Failed to run terraform plan', error as Error, { directory })
      throw error
    }
  }

  async apply(directory: string, autoApprove = false): Promise<boolean> {
    try {
      const command = autoApprove ? 'terraform apply -auto-approve' : 'terraform apply'
      await execAsync(`cd ${directory} && ${command}`, {
        cwd: directory
      })
      await this.getState(directory)
      return true
    } catch (error) {
      logger.error('Failed to run terraform apply', error as Error, { directory, autoApprove })
      return false
    }
  }

  async destroy(directory: string, autoApprove = false): Promise<boolean> {
    try {
      const command = autoApprove ? 'terraform destroy -auto-approve' : 'terraform destroy'
      await execAsync(`cd ${directory} && ${command}`, {
        cwd: directory
      })
      await this.getState(directory)
      return true
    } catch (error) {
      logger.error('Failed to run terraform destroy', error as Error, { directory, autoApprove })
      return false
    }
  }

  async validate(directory: string): Promise<boolean> {
    try {
      await execAsync(`cd ${directory} && terraform validate`, {
        cwd: directory
      })
      return true
    } catch (error) {
      logger.error('Failed to validate Terraform configuration', error as Error, { directory })
      return false
    }
  }

  async format(directory: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`cd ${directory} && terraform fmt -`, {
        cwd: directory
      })
      return stdout
    } catch (error) {
      logger.error('Failed to format Terraform configuration', error as Error, { directory })
      return ''
    }
  }
}

export interface TerraformWorkspace {
  name: string
  directory: string
  current: boolean
}

export interface TerraformState {
  directory: string
  resources: number
  outputs: Record<string, unknown>
  version: string
}
