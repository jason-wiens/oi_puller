import { configPuppeteer } from "./config/puppeteer";
import ProgressBar from "progress";

import { login } from "./services/login.service";
import { getConfig, writeReportToFile } from "./services/excel.service";

import { ReportRow } from "./types";
import path from "path";
import { handleInvoice } from "./services/handle-invoice";

import { OUTPUT_REPORT_FILE, DOWNLOADS_FOLDER } from "./constants";

async function main() {
  const { page, browser } = await configPuppeteer({
    downloadPath: DOWNLOADS_FOLDER,
    headless: true,
  });

  const bar = new ProgressBar("Invoice :current/:total [:bar] :percent :etas", {
    total: 1,
    width: 40,
  });

  try {
    const { invoiceList, credentials, mapper } = await getConfig();

    await login({ page, credentials });

    bar.total = invoiceList.length;

    const report: ReportRow[] = [];
    for (const invoice of invoiceList) {
      const row = await handleInvoice({ invoice, page, mapper });
      report.push(row);
      bar.tick();
    }

    await writeReportToFile({
      report,
      outputFilename: OUTPUT_REPORT_FILE,
    });
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
    bar.terminate();
  }
}

main()
  .then(() => console.log("Done! Make sure you buy Jason a beer!"))
  .catch(console.error);
