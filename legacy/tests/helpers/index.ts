import config from '../../playwright.config';
import { expect, Page } from '@playwright/test';

export const LEDGER_SLUG = 'voo-89084995';
export const baseURL = config!.use!.baseURL;

export const getFrontendRoute = (route: string): string =>
  `${baseURL}/${route}`;

export const expectNavbarToNotBeDisplayed = async (page: Page) => {
  await expect(await page.locator('.MuiDrawer-root')).toBeHidden();
};
