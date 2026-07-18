// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Regression for the Topics mega-menu hover-gap bug (reported 2026-07-18):
 * "as soon as your mouse tries to mouse over the expanded topics, the frame
 * disappears." The trigger closed on mouseleave with NO delay, and the dropdown
 * is portaled to <body> with an 8px gap below the header — so moving the cursor
 * from the trigger toward the dropdown crossed dead space, fired the trigger's
 * mouseleave, and unmounted the portal before the cursor ever reached it.
 *
 * RED on the immediate-close version; GREEN once a close-delay bridges the gap.
 */

test.describe('Topics mega-menu — hover-gap', () => {
  test('survives the mouse crossing the trigger→dropdown gap and is clickable', async ({ page }) => {
    const isMobile = (page.viewportSize()?.width ?? 1280) < 1024;
    test.skip(isMobile, 'mega-menu is a desktop hover UI; mobile uses the collapsible Topics section');

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const trigger = page.getByRole('button', { name: 'Topics' });
    await expect(trigger).toBeVisible();
    await trigger.hover();

    const menu = page.locator('#topics-mega-menu');
    await expect(menu).toBeVisible();

    const tbox = await trigger.boundingBox();
    const mbox = await menu.boundingBox();
    if (!tbox || !mbox) throw new Error('missing boxes');

    // Trace the real cursor path: on the trigger → through the GAP → onto the menu.
    await page.mouse.move(tbox.x + tbox.width / 2, tbox.y + tbox.height / 2, { steps: 3 });
    await page.mouse.move(mbox.x + mbox.width / 2, tbox.y + tbox.height + 4, { steps: 4 }); // in the gap
    await page.mouse.move(mbox.x + mbox.width / 2, mbox.y + 24, { steps: 6 });               // onto the menu

    // The frame must NOT have vanished mid-move.
    await expect(menu, 'menu must stay open while moving onto it').toBeVisible();

    // And a topic must actually be clickable → navigates.
    const topic = menu.getByRole('link').first();
    await expect(topic).toBeVisible();
    const href = await topic.getAttribute('href');
    await topic.click();
    await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/^\//, '/') + '$'));
  });

  test('stays open when the cursor rests on the dropdown, closes shortly after leaving', async ({ page }) => {
    const isMobile = (page.viewportSize()?.width ?? 1280) < 1024;
    test.skip(isMobile, 'desktop hover UI');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Topics' }).hover();
    const menu = page.locator('#topics-mega-menu');
    await expect(menu).toBeVisible();
    await menu.hover();
    await page.waitForTimeout(400);
    await expect(menu, 'stays open while hovered').toBeVisible();
    // Move far away → it should close (not stick open forever).
    await page.mouse.move(20, 400, { steps: 4 });
    await expect(menu).toBeHidden({ timeout: 2000 });
  });
});
