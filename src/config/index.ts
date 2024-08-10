import puppeteer from "puppeteer";
import path from "path";

export const configPuppeteer = async (args: {
  downloadPath?: string;
  headless: boolean;
}) => {
  const { downloadPath, headless } = args;

  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();

  await page.setViewport({ width: 1600, height: 1024 });

  const defaultDownloadPath = path.join(__dirname, "downloads");
  const client = await page.createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath || defaultDownloadPath,
  });

  return { browser, page };
};
