import { Page } from "puppeteer";

export const login = async (args: {
  page: Page;
  credentials: {
    username: string;
    password: string;
  };
}) => {
  const {
    page,
    credentials: { username, password },
  } = args;

  console.log(`Logging in with username: ${username}`);
  await page.goto("https://www.openinvoice.com/docp/public/OILogin.xhtml");

  await page.locator('input[name="j_username"]').fill(username);
  await page.locator('input[name="j_password"]').fill(password);

  await page.locator("#loginBtn").click();

  await page.waitForSelector("#globalSearchItemMenu2 input");
  console.log("Login successful");
  console.log("---");
  return;
};
