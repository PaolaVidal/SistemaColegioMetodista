import { expect, test } from '@playwright/test';

test('shows the login page on desktop and mobile', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Sistema Colegio Metodista');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sistema Colegio Metodista' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.getByLabel('Correo o nombre de usuario')).toBeVisible();
});
