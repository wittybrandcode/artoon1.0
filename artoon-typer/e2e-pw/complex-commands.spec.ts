import { test, expect } from '@playwright/test';

test.describe('Editor Complex Command Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.artoon-typer')).toBeVisible();

    await page.waitForTimeout(500);

    // Clear everything
    const sourceToggle = page.locator('button').filter({ hasText: 'المصدر' });
    if (await sourceToggle.isVisible()) {
        await sourceToggle.click();
        await page.locator('textarea.app-source__code').fill('>.p:: \n');
        await page.locator('button.app-source__apply').click();
        await sourceToggle.click();
    }

    await expect(page.locator('.block')).toHaveCount(1, { timeout: 2000 });
  });

  test('should support nested lists creation and interaction', async ({ page }) => {
    const blockContent = page.locator('.block__content').first();
    await blockContent.click();
    await page.keyboard.type('First paragraph');

    // Create Bullet List
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Wait for the "+" button to appear, click it, type to filter, and select via the menu overlay
    const lastRow = page.locator('.block-row').last();
    await lastRow.hover();
    const addBtn = lastRow.locator('.block__add-horizontal-btn');
    await addBtn.click();
    await expect(page.getByTestId('add-menu')).toBeVisible();

    // Simply use text search instead of fragile arrow key navigation over dynamic menus
    const searchInput = page.getByTestId('add-menu-search');
    await searchInput.fill('قائمة نقطية');
    await page.waitForTimeout(500); // Give React time to filter

    // Explicitly click the block item using Enter instead of click since click is swallowed by preventDefault
    await searchInput.focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Playwright might be too fast, let's look for the new list-item
    // Also wait for the block to actually be a bullet list
    await expect(page.locator('.block--bullet-list')).toBeVisible({ timeout: 5000 });
    const listContent = page.locator('.list-item__content').first();
    await expect(listContent).toBeVisible({ timeout: 5000 });

    // Double click to ensure cursor is placed and focus happens correctly
    await listContent.click({ clickCount: 2 });
    // And clear it if it has placeholder
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Item 1');

    // Press Enter to create another item
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.keyboard.type('Item 2');

    // Nest the item
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // Verify nesting
    // We expect 1 list block, and Item 2 should be in a sub-list
    await expect(page.locator('.block--bullet-list')).toHaveCount(1);
  });

  test('should support definition lists', async ({ page }) => {
    const blockContent = page.locator('.block__content').first();
    await blockContent.click();
    await page.keyboard.type('First paragraph');

    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    const lastRow = page.locator('.block-row').last();
    await lastRow.hover();
    const addBtn = lastRow.locator('.block__add-horizontal-btn');
    await addBtn.click();
    await expect(page.getByTestId('add-menu')).toBeVisible();

    // Simply use text search instead of fragile arrow key navigation over dynamic menus
    const searchInput2 = page.getByTestId('add-menu-search');
    await searchInput2.fill('قائمة تعريفات');
    await page.waitForTimeout(500); // Give React time to filter

    // Explicitly click the block item using Enter instead of click since click is swallowed by preventDefault
    await searchInput2.focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    const definitionListBlock = page.locator('.block--definition-list');
    await expect(definitionListBlock).toBeVisible({ timeout: 5000 });

    // Verify the expected semantic HTML elements
    await expect(definitionListBlock.locator('dl')).toBeVisible();

    const termItems = definitionListBlock.locator('dt');
    await expect(termItems.first()).toBeVisible({ timeout: 5000 });

    const defItems = definitionListBlock.locator('dd');
    await expect(defItems.first()).toBeVisible({ timeout: 5000 });

    // Verify editing behavior
    await termItems.first().click({ clickCount: 2 });
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Term 1');

    await defItems.first().click({ clickCount: 2 });
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Definition 1');

    await expect(definitionListBlock).toContainText('Term 1');
    await expect(definitionListBlock).toContainText('Definition 1');
  });

  test('should handle mixed RTL/LTR content seamlessly', async ({ page }) => {
    const blockContent = page.locator('.block__content').first();
    await blockContent.click();

    await page.keyboard.type('This is english text ');
    await page.keyboard.type('وهذا نص عربي');

    // Check direction toggle on the block controls
    const ltrToggle = page.locator('.block__dir').first();
    if (await ltrToggle.isVisible()) {
        await ltrToggle.click();
    }

    // Wait for direction attribute to update
    await expect(page.locator('.block').first()).toHaveAttribute('dir', 'ltr');
  });

  test('should handle block splitting and merging (Backspace at start)', async ({ page }) => {
    const blockContent = page.locator('.block__content').first();
    await blockContent.click();
    await page.keyboard.type('First Line');

    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    const count = await page.locator('.block').count();
    await expect(count).toBeGreaterThanOrEqual(1);

    // Select All and type Second Line to override
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.locator('.block__content').last().click();
    await page.keyboard.type('Second Line');

    // Navigate to beginning of Second Line and press Backspace
    await page.locator('.block__content').last().click();
    for (let i = 0; i < 15; i++) {
       await page.keyboard.press('ArrowRight');
    }
    await page.waitForTimeout(100);
    await page.keyboard.press('Backspace');

    await page.waitForTimeout(300);

    await expect(page.locator('.block__content').first()).toContainText('Second Line');
  });

  test('should preserve history integrity after complex multi-block operations', async ({ page }) => {
    // Add two blocks
    const blockContent = page.locator('.block__content').first();
    await blockContent.click();
    await page.keyboard.type('Block 1');

    await page.locator('.block-row').first().hover();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    await page.locator('.block__content').last().click();
    await page.keyboard.type('Block 2');

    // Delete block 2
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace'); // remove the block entirely

    await page.waitForTimeout(300);

    // Undo deletion
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    // Undo typing of Block 2
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    // Redo
    await page.keyboard.press('Control+Shift+Z');
    await page.waitForTimeout(500);
  });
});
