import { test, expect } from '@playwright/test'

test.describe('Terminal Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display terminal interface', async ({ page }) => {
    await expect(page.locator('text=Handsome')).toBeVisible()
    await expect(page.locator('text=Terminal')).toBeVisible()
  })

  test('should open AI Assistant', async ({ page }) => {
    await page.click('button:has-text("AI Assistant")')
    await expect(page.locator('text=AI Assistant')).toBeVisible()
  })

  test('should open Settings', async ({ page }) => {
    await page.click('button:has([class*="icon"])')
    await expect(page.locator('text=Settings')).toBeVisible()
  })

  test('should create new terminal tab', async ({ page }) => {
    const initialTabs = await page.locator('[class*="tab"]').count()
    await page.click('button:has([class*="plus"])')
    const newTabs = await page.locator('[class*="tab"]').count()
    expect(newTabs).toBe(initialTabs + 1)
  })

  test('should close terminal tab', async ({ page }) => {
    await page.click('button:has([class*="plus"])')
    const initialTabs = await page.locator('[class*="tab"]').count()

    await page.locator('[class*="tab"]').first().hover()
    await page.locator('button:has([class*="close"])').click()

    const newTabs = await page.locator('[class*="tab"]').count()
    expect(newTabs).toBe(initialTabs - 1)
  })

  test('should toggle sidebar', async ({ page }) => {
    const sidebar = page.locator('[class*="sidebar"]')
    await expect(sidebar).toBeVisible()

    await page.keyboard.press('Control+b')
    await expect(sidebar).not.toBeVisible()

    await page.keyboard.press('Control+b')
    await expect(sidebar).toBeVisible()
  })
})

test.describe('AI Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should open AI chat panel', async ({ page }) => {
    await page.click('button:has-text("AI Assistant")')
    await expect(page.locator('text=AI Assistant')).toBeVisible()
  })

  test('should send message to AI', async ({ page }) => {
    await page.click('button:has-text("AI Assistant")')

    await page.fill('input[placeholder*="Ask AI"]', 'Hello!')
    await page.click('button:has([class*="send"])')

    await expect(page.locator('text=You: Hello!')).toBeVisible()
  })

  test('should display AI response', async ({ page }) => {
    await page.click('button:has-text("AI Assistant")')

    await page.fill('input[placeholder*="Ask AI"]', 'test')
    await page.click('button:has([class*="send"])')

    await page.waitForTimeout(1000)
    await expect(page.locator('text=AI:')).toBeVisible()
  })
})

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should open settings panel', async ({ page }) => {
    await page.click('button[aria-label*="settings"]')
    await expect(page.locator('text=Settings')).toBeVisible()
  })

  test('should change theme', async ({ page }) => {
    await page.click('button[aria-label*="settings"]')
    await page.click('text=Appearance')

    await page.click('button:has-text("midnight")')
    await expect(page.locator('button[aria-pressed="true"]')).toBeVisible()
  })

  test('should change font size', async ({ page }) => {
    await page.click('button[aria-label*="settings"]')
    await page.click('text=Terminal')

    const slider = page.locator('input[type="range"]')
    await slider.fill('16')

    await expect(slider).toHaveValue('16')
  })
})

test.describe('Plugin Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should open plugin manager', async ({ page }) => {
    await page.click('button[aria-label*="plugins"]')
    await expect(page.locator('text=Plugin Marketplace')).toBeVisible()
  })

  test('should display plugins', async ({ page }) => {
    await page.click('button[aria-label*="plugins"]')

    await expect(page.locator('text=Docker Integration')).toBeVisible()
    await expect(page.locator('text=Kubernetes Dashboard')).toBeVisible()
    await expect(page.locator('text=Network Monitor Pro')).toBeVisible()
  })

  test('should search plugins', async ({ page }) => {
    await page.click('button[aria-label*="plugins"]')

    await page.fill('input[placeholder*="Search plugins"]', 'Docker')

    await expect(page.locator('text=Docker Integration')).toBeVisible()
    await expect(page.locator('text=Kubernetes Dashboard')).not.toBeVisible()
  })
})
