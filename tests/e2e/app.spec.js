import { expect, test } from '@playwright/test';

test('sample team opens, switches views, and keeps browser data', async ({ page }) => {
  await page.goto('.');
  await expect(page.getByRole('heading', { name: 'Courtside' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Sample Team/ }).first()).toBeVisible();
  await expect(page.locator('footer.privacy-note')).toContainText('saved in this browser');

  await page.locator('.tcard [data-team]').first().click();
  await expect(page.getByRole('tab', { name: 'Board' })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Rotations' }).click();
  await expect(page.getByRole('tab', { name: 'Rotations' })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Roster' }).click();
  await expect(page.getByRole('tab', { name: 'Roster' })).toHaveAttribute('aria-selected', 'true');
  await page.reload();
  await expect(page.getByRole('heading', { name: /Starting six/ })).toBeVisible();
  await expect(page.locator('footer.privacy-note')).toContainText('live set data');
});

test('backup can be downloaded from the home screen', async ({ page }) => {
  await page.goto('.');
  await page.locator('.home .more summary').click();
  await page.getByRole('button', { name: 'Backup & restore' }).click();
  await expect(page.getByRole('dialog', { name: 'Backup' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /All my teams/ }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/courtside-backup.*\.json$/);
});
