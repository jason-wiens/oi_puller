import puppeteer from "puppeteer";
import { config } from "dotenv";

import { login } from "./login";
import { getInvoiceList } from "./get-invoice-list";

import { TableData } from "./types";
import { downloadAttachment } from "./download-attachment";
import path from "path";

config();

async function main() {
  const { OI_USERNAME, OI_PASSWORD } = process.env;

  if (!OI_USERNAME || !OI_PASSWORD) {
    throw new Error("Please provide USERNAME and PASSWORD in .env file");
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1024 });
  const downloadPath = path.join(__dirname, "downloads");
  console.log(downloadPath);
  const client = await page.createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });

  try {
    console.log("Getting invoice list");
    const invoices = await getInvoiceList();
    console.log(`Got ${invoices.length} invoices to pull.`);

    await login({ username: OI_USERNAME, password: OI_PASSWORD, page });

    const { invoiceNumber, vendorName } = invoices[0];

    await page.locator("#globalSearchItemMenu2 input").fill(invoiceNumber);
    await page.keyboard.press("Enter");

    await page.waitForSelector("#documentListTableId");

    const rows = await page.$$("#documentListTableId tbody tr");

    const tableData: TableData = [];

    const headers = await rows[0].$$eval("td", (ths) =>
      ths.map((th) => th.textContent)
    );

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = await row.$$eval("td", (tds) =>
        tds.map((td) => td.textContent)
      );

      const href = await row.$eval("td a", (a) => a.getAttribute("href"));
      console.log(href);

      const docId = await row.evaluate((el) => el.getAttribute("id"));

      const rowObj = headers.reduce((obj, header, index) => {
        if (!header) {
          // @ts-ignore
          obj[`blank_${index}`] = cells[index];
        } else {
          // @ts-ignore
          obj[header] = cells[index];
        }
        return obj;
      }, {} as Record<string, string>);

      rowObj["docId"] = docId || "";

      tableData.push(rowObj);
    }

    await page.locator(`#${tableData[0].docId} a`).click();

    await page.waitForSelector("#DIV_JOURNAL_attachments");
    const attachmentRows = await page.$$("#DIV_JOURNAL_attachments tbody tr");

    for (let i = 1; i < attachmentRows.length; i++) {
      const row = attachmentRows[i];
      const link = await row.$eval(
        "td a",
        (a) => a.getAttribute("href")?.split("&action")[0]
      );
      if (link) {
        if (link.includes("pdf")) {
          await downloadAttachment({ link, page });
        }
      }
    }

    console.log(tableData);
  } catch (error) {
    console.error(error);
  } finally {
    // await browser.close();
  }
}

main()
  .then(() => console.log("Done"))
  .catch(console.error);
