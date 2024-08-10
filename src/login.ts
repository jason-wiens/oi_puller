import { Page } from "puppeteer";

export const login = async (args: { page: Page }) => {
  const { page } = args;

  const { OI_USERNAME: username, OI_PASSWORD: password } = process.env;

  if (!username || !password) {
    throw new Error("Please provide USERNAME and PASSWORD in .env file");
  }

  await page.goto("https://www.openinvoice.com/docp/public/OILogin.xhtml");

  await page.locator('input[name="j_username"]').fill(username);
  await page.locator('input[name="j_password"]').fill(password);

  await page.locator("#loginBtn").click();

  await page.waitForSelector("#globalSearchItemMenu2 input");

  return;
};
