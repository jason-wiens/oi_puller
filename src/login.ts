import { Page } from "puppeteer";

export const login = async (args: {
  username: string;
  password: string;
  page: Page;
}) => {
  const { username, password, page } = args;

  await page.goto("https://www.openinvoice.com/docp/public/OILogin.xhtml");

  await page.locator('input[name="j_username"]').fill(username);
  await page.locator('input[name="j_password"]').fill(password);

  await page.locator("#loginBtn").click();

  return;
};
