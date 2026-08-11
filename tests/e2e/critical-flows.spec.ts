import { expect, test, type Page } from '@playwright/test';
import { installSupabaseMock } from './supabaseMock';

// Playwright cannot intercept requests originated by a service worker in WebKit.
// PWA registration is exercised separately in pwa.spec.ts.
test.use({ serviceWorkers: 'block' });

async function openLogin(page: Page) {
  await page.goto('/dia-a-dia-ens/');
  await page.getByRole('button', { name: 'Começar' }).click();
  await page.getByRole('button', { name: 'Criar minha conta' }).click();
  await expect(page.getByRole('heading', { name: 'Criar sua conta' })).toBeVisible();
}

test('login, spouse connection, PCE navigation and logout', async ({ page }) => {
  const state = await installSupabaseMock(page);
  await openLogin(page);

  await page.getByRole('button', { name: 'Já tem conta? Entrar' }).click();
  await page.getByPlaceholder('Seu e-mail').fill('pessoa@example.com');
  await page.getByPlaceholder('Senha (mínimo 8 caracteres)').fill('senha-segura');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Conecte seu cônjuge' })).toBeVisible();
  await page.getByPlaceholder('email-do-conjuge@exemplo.com').fill('conjuge@example.com');
  await page.getByRole('button', { name: 'Conectar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Aguardando seu cônjuge' })).toBeVisible();
  expect(state.spouseEmail).toBe('conjuge@example.com');

  await page.getByRole('button', { name: 'Entrar no App' }).click();
  await expect(page.getByRole('heading', { name: 'ENS DIA A DIA' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pontos Concretos de Esforço' })).toBeVisible();

  await page.getByRole('button', { name: /Oração Pessoal Diária/ }).click();
  await expect(page).toHaveURL(/\/oracao-pessoal$/);
  await expect(page.getByRole('heading', { name: 'Leitura Orante do Evangelho' })).toBeVisible();

  await page.goBack();
  const remainingPces = [
    { button: /Oração Conjugal Diária/, route: '/oracao-conjugal', heading: 'Oração Conjugal Diária' },
    { button: /Dever de Sentar-se/, route: '/dever-sentar', heading: 'Dever de Sentar-se' },
    { button: /Regra de Vida/, route: '/regra-vida', heading: 'Regra de Vida' },
    { button: /Retiro Anual/, route: '/retiro-anual', heading: 'Retiro Anual' },
  ];

  for (const pce of remainingPces) {
    await page.getByRole('button', { name: pce.button }).click();
    await expect(page).toHaveURL(new RegExp(`${pce.route}$`));
    await expect(page.getByRole('heading', { name: pce.heading }).first()).toBeVisible();
    await page.goBack();
  }

  await page.getByRole('button', { name: 'Ajustes' }).click();
  await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();

  await expect(page.getByRole('button', { name: 'Começar' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (
    Object.keys(window.localStorage).some(key => key.includes('auth-token'))
  ))).toBe(false);
});

test('password recovery normalizes the address and confirms delivery', async ({ page }) => {
  const state = await installSupabaseMock(page);
  await openLogin(page);

  await page.getByRole('button', { name: 'Já tem conta? Entrar' }).click();
  await page.getByRole('button', { name: 'Esqueci minha senha' }).click();
  await page.getByPlaceholder('Seu e-mail').fill('PESSOA@EXAMPLE.COM');
  await page.getByRole('button', { name: 'Enviar link' }).click();

  await expect(page.getByText('Enviamos um link de recuperação para o seu e-mail.')).toBeVisible();
  expect(state.recoveryEmail).toBe('pessoa@example.com');
});
