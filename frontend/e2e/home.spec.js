import { expect, test } from '@playwright/test';

test('loads the home page on desktop and mobile', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Sistema Colegio Metodista');
  await expect(page.getByRole('heading', { name: 'Sistema Colegio Metodista' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inicio' })).toBeVisible();
  await expect(page.getByText(/Bienvenido al esqueleto/i)).toBeVisible();
});
