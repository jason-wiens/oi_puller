import { Workbook } from "exceljs";
import { InvoiceList, ReportRow, VendorMap } from "../types";
import {
  DOC_LIST_CONFIG_FILE,
  CONFIG_TAB,
  VENDOR_MAPPER_TAB,
  DOC_LIST_TAB,
  INVOICE_NUMBER_COLUMN,
  VENDOR_NAME_COLUMN,
  OPEN_AI_API_KEY_CELL,
  USERNAME_CELL,
  PASSWORD_CELL,
  OPERATOR_CELL,
  OPERATOR_COLUMN,
  VENDOR_JADE_COLUMN,
  VENDOR_OI_COLUMN,
} from "../constants";
import path from "path";

export const getConfig = async (): Promise<{
  invoiceList: InvoiceList;
  credentials: {
    username: string;
    password: string;
  };
  mapper: VendorMap;
}> => {
  console.log(`Reading Config file: ${DOC_LIST_CONFIG_FILE}`);

  const wb = new Workbook();
  await wb.xlsx.readFile(DOC_LIST_CONFIG_FILE);

  const wsDocList = wb.getWorksheet(DOC_LIST_TAB);
  const wsConfig = wb.getWorksheet(CONFIG_TAB);
  const wsVendorMapper = wb.getWorksheet(VENDOR_MAPPER_TAB);

  if (!wsDocList || !wsConfig || !wsVendorMapper) {
    throw new Error(`Invalid config file: ${DOC_LIST_CONFIG_FILE}`);
  }

  // get invoice list
  const totalDocListRows = wsDocList.rowCount;
  const rows: InvoiceList = [];
  for (let rowNumber = 2; rowNumber <= totalDocListRows; rowNumber++) {
    rows.push({
      invoiceNumber:
        wsDocList
          .getCell(`${INVOICE_NUMBER_COLUMN}${rowNumber}`)
          .value?.toString() || "",
      vendorName:
        wsDocList
          .getCell(`${VENDOR_NAME_COLUMN}${rowNumber}`)
          .value?.toString() || "",
    });
  }
  console.log(`${rows.length} invoices identified in ${DOC_LIST_CONFIG_FILE}`);
  console.log("---");

  // get vendor mapper
  const totalVendorMapperRows = wsVendorMapper.rowCount;
  const mapper: VendorMap = {};
  const currentOperator =
    wsConfig.getCell(OPERATOR_CELL).value?.toString().trim().toLowerCase() ||
    "";
  if (!currentOperator) {
    throw new Error(
      `Operator not found in config file: ${DOC_LIST_CONFIG_FILE}`
    );
  }

  for (let rowNumber = 2; rowNumber <= totalVendorMapperRows; rowNumber++) {
    const operator =
      wsVendorMapper
        .getCell(`${OPERATOR_COLUMN}${rowNumber}`)
        .value?.toString()
        .trim()
        .toLowerCase() || "";
    if (!operator || !(operator === currentOperator)) continue;
    const vendorJade =
      wsVendorMapper
        .getCell(`${VENDOR_JADE_COLUMN}${rowNumber}`)
        .value?.toString()
        .trim()
        .toLocaleLowerCase() || "";
    const vendorOI =
      wsVendorMapper
        .getCell(`${VENDOR_OI_COLUMN}${rowNumber}`)
        .value?.toString() || "";
    if (vendorJade in mapper) {
      mapper[vendorJade].push(vendorOI);
    } else {
      mapper[vendorJade] = [vendorOI];
    }
  }

  return {
    invoiceList: rows,
    credentials: {
      username: wsConfig.getCell(USERNAME_CELL).value?.toString() || "",
      password: wsConfig.getCell(PASSWORD_CELL).value?.toString() || "",
    },
    mapper,
  };
};

export const writeReportToFile = async (args: {
  report: ReportRow[];
  outputFilename: string;
}): Promise<void> => {
  const { report, outputFilename } = args;

  console.log("---");
  console.log(`Writing report to file: ${outputFilename}`);

  const wb = new Workbook();
  const ws = wb.addWorksheet("OI_Puller_Report");

  const headers = Object.keys(report[0]);

  ws.addRow(headers);

  for (const row of report) {
    ws.addRow(Object.values(row));
  }

  await wb.xlsx.writeFile(path.join(".", outputFilename));
  console.log(`Report successfully written to file: ${outputFilename}`);
};
