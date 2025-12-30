import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
  page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`))
  page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`))

  // Mock window.electronAPI
  await page.addInitScript(() => {
    window.electronAPI = {
      terminal: {
        create: async () => ({ 
          id: 'test-session', 
          cols: 80, 
          rows: 24,
          title: 'Test Terminal',
          cwd: '/home/user',
          shell: '/bin/bash',
          pid: 1234,
          createdAt: new Date(),
          isActive: true
        }),
        write: async () => {},
        resize: async () => {},
        close: async () => {},
        list: async () => [],
        onOutput: () => {},
        onClose: () => {}
      },
      llm: {
        connect: async () => ({ success: true }),
        generate: async () => ({ content: 'AI response', model: 'test' }),
        chat: async () => ({ content: 'AI response', model: 'test' }),
        status: async () => ({ connected: true })
      },
      plugin: {
        list: async () => [],
        load: async () => ({ success: true }),
        unload: async () => ({ success: true }),
        enable: async () => ({ success: true }),
        disable: async () => ({ success: true })
      },
      ssh: {
        connect: async () => ({ sessionId: 'ssh-session' }),
        disconnect: async () => {},
        write: async () => {},
        resize: async () => {},
        list: async () => []
      },
      settings: {
        get: async () => ({ theme: 'dark', fontSize: 14 }),
        set: async () => ({ success: true }),
        reset: async () => ({ success: true })
      },
      window: {
        focus: async () => {},
        minimize: async () => {},
        maximize: async () => {},
        close: async () => {}
      }
    } as any
  })
})

test('should render application layout', async ({ page }) => {
  await page.goto('/')
  
  // Check Sidebar
  await expect(page.locator('text=Handsome')).toBeVisible()
  await expect(page.locator('text=Terminal v1.0')).toBeVisible()
  
  // Check Terminal View
  await expect(page.locator('.xterm-screen')).toBeVisible()

  // Accessibility Check
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})

test('should toggle panels', async ({ page }) => {
  await page.goto('/')
  
  // Open AI Assistant
  await page.click('button:has-text("AI Assistant")')
  await expect(page.locator('h2:has-text("AI Assistant")')).toBeVisible()
  
  // Close AI Assistant
  await page.click('button:has(svg.lucide-x)')
  await expect(page.locator('h2:has-text("AI Assistant")')).not.toBeVisible()

  // Open Settings - Need to find the button, likely by icon or test id
  // The header has a settings button
  // Let's assume we can find it by icon class if we knew it, or position
  // For now, let's stick to text or aria-label if available. 
  // Code shows <Settings size={18} /> inside a button.
})
