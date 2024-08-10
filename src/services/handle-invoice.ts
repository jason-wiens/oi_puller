import { handleInvoiceSelection } from "./handle-invoice-selection";

import type { InvoiceMeta, ReportRow, TableData } from "@/types";
import type { ElementHandle, Page } from "puppeteer";
import { downloadAttachment } from "./download-attachment.service";

export const handleInvoice = async (args: {
  invoice: InvoiceMeta;
  page: Page;
}): Promise<ReportRow> => {
  const { invoice, page } = args;
  const { invoiceNumber, vendorName } = invoice;

  try {
    // search for invoice number
    let input = await page.$("#globalSearchItemMenu2 input");
    if (!input) {
      input = await page.$("input#globalSearchInputField");
      if (!input) {
        throw new Error("Could not find search input field)");
      }
    }
    await input.type(invoiceNumber);
    await page.keyboard.press("Enter");

    // wait for search results
    await page.waitForSelector("#documentListTableId");

    // search results will display in a table.
    const rows = await page.$$("#documentListTableId tbody tr");

    // if there are no rows then there is no attachements to download
    // so we can exit early
    if (rows.length === 0) {
      return {
        invoiceNumber,
        vendorName,
        success: false,
        docId: "",
        vendorChosen: "",
        numberOfAttachments: 0,
        fileNames: [],
        comments: "The invoice search did not return any results",
      };
    }

    // Let's convert the table data into a more usable format
    const tableData: TableData = [];
    const headers = await rows[0].$$eval("td", (ths) =>
      ths.map((th) => th.textContent)
    );
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = await row.$$eval("td", (tds) =>
        tds.map((td) => td.textContent)
      );
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
      rowObj["docId"] =
        (await row.evaluate((el) => el.getAttribute("id"))) || "";
      tableData.push(rowObj);
    }

    // select the correct invoice from the search results
    const res = await handleInvoiceSelection({ invoice, tableData });

    // if no docId was returned it means that an appropriate vendor name was not
    // found in the list of search results, so we can exit early
    if (!res) {
      return {
        invoiceNumber,
        vendorName,
        success: false,
        docId: "",
        vendorChosen: "",
        numberOfAttachments: 0,
        fileNames: [],
        comments:
          "The invoice search results did not contain a match for the vendor name",
      };
    }
    const { docId, vendorChosen } = res;
    // navigate to the selected invoice document and wait for the attachments to load
    await page.locator(`#${docId} a`).click();
    await page.waitForSelector("#DIV_JOURNAL_attachments");

    // the attachment list will display in a table. Let's iterate over the rows and
    // if the row contains a PDF link, download it
    // await page.locator("#DIV_JOURNAL_attachments").wait();
    const attachmentRows = await page.$$("#DIV_JOURNAL_attachments tbody tr");
    const fileNames: string[] = [];
    let comments = "";
    for (const row of attachmentRows) {
      const anchor = await row.$("td a");
      if (!anchor) {
        continue;
      }
      const link = await row.$eval(
        "td a",
        (a) => a.getAttribute("href")?.split("&action")[0]
      );
      if (link) {
        if (link.includes("pdf")) {
          const attachmentId = link.split("attachmentId=")[1];
          const filename = `${docId}_${attachmentId}.pdf`;
          try {
            await downloadAttachment({ link, page, filename });
            fileNames.push(filename);
          } catch (error) {
            comments += `Error downloading attachment: ${filename}. `;
          }
        }
      }
    }

    // if we have made it this far then everything was successful and we can return the
    // results for the report
    return {
      invoiceNumber,
      vendorName,
      success: true,
      docId,
      vendorChosen,
      numberOfAttachments: fileNames.length,
      fileNames,
      comments,
    };
  } catch (error) {
    console.error(error);
    return {
      invoiceNumber,
      vendorName,
      success: false,
      docId: "",
      vendorChosen: "",
      numberOfAttachments: 0,
      fileNames: [],
      comments:
        "An unforseen error occurred. Please check the logs for more information",
    };
  }
};
