import { Workbook } from "exceljs";
import path from "path";
import { InvoiceList, ReportRow } from "../types";

export const getInvoiceList = async (): Promise<InvoiceList> => {
  const { DOCUMENT_LIST_FILE } = process.env;

  if (!DOCUMENT_LIST_FILE) {
    throw new Error("Please provide DOCUMENT_LIST_FILE in .env file");
  }

  const wb = new Workbook();
  await wb.xlsx.readFile(path.join("src", "assets", DOCUMENT_LIST_FILE));

  const ws = wb.worksheets[0];

  const totalRows = ws.rowCount;

  const rows: InvoiceList = [];
  for (let rowNumber = 2; rowNumber <= totalRows; rowNumber++) {
    rows.push({
      invoiceNumber: ws.getCell(`A${rowNumber}`).value?.toString() || "",
      vendorName: ws.getCell(`B${rowNumber}`).value?.toString() || "",
    });
  }

  return rows;
};

export const writeReportToFile = async (args: {
  report: ReportRow[];
  outputFilename: string;
}): Promise<void> => {
  const { report, outputFilename } = args;

  const wb = new Workbook();
  const ws = wb.addWorksheet("OI_Puller_Report");

  const headers = Object.keys(report[0]);

  ws.addRow(headers);

  for (const row of report) {
    ws.addRow(Object.values(row));
  }

  await wb.xlsx.writeFile(outputFilename);
};
