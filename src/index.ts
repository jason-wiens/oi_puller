import { configPuppeteer } from "./config";
import { config } from "dotenv";

import { login } from "./login";
import { getInvoiceList, writeReportToFile } from "./services/excel.service";

import { ReportRow } from "./types";
import path from "path";
import { handleInvoice } from "./services/handle-invoice";

config();

async function main() {
  const { page, browser } = await configPuppeteer({
    downloadPath: path.join(__dirname, "downloads"),
    headless: false,
  });

  try {
    const invoices = await getInvoiceList();
    await login({ page });

    const report: ReportRow[] = [];
    for (const invoice of invoices) {
      const row = await handleInvoice({ invoice, page });
      report.push(row);
    }

    await writeReportToFile({
      report,
      outputFilename: path.join(__dirname, "report.xlsx"),
    });
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
}

main()
  .then(() => console.log("Done"))
  .catch(console.error);
