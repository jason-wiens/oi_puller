import { InvoiceMeta, TableData, VendorMap } from "../types";

function checkForExactMatch(args: {
  vendorName: string;
  tableData: TableData;
}): { docId: string; vendorChosen: string } | null {
  const { vendorName, tableData } = args;

  const simplyfyString = (str: string): string => {
    return str.toLowerCase().replace(/[\s.,]/g, "");
  };

  for (const row of tableData) {
    const oiCompany = row["Company"];
    if (!oiCompany) continue;
    if (simplyfyString(oiCompany) === simplyfyString(vendorName)) {
      return {
        docId: row["docId"],
        vendorChosen: oiCompany,
      };
    }
  }

  return null;
}

function checkMapperForMatch(args: {
  vendorName: string;
  mapper: VendorMap;
  tableData: TableData;
}): { docId: string; vendorChosen: string } | null {
  const { vendorName, mapper, tableData } = args;

  const simplyfyString = (str: string): string => {
    return str.toLowerCase().replace(/[\s.,]/g, "");
  };

  const possibleVendorNames = mapper[vendorName.trim().toLocaleLowerCase()];
  if (!possibleVendorNames || possibleVendorNames.length === 0) return null;

  for (const row of tableData) {
    const oiCompany = row["Company"];
    if (!oiCompany) continue;
    for (const vendorName of possibleVendorNames) {
      if (simplyfyString(oiCompany) === simplyfyString(vendorName)) {
        return {
          docId: row["docId"],
          vendorChosen: oiCompany,
        };
      }
    }
  }

  return null;
}

export const handleInvoiceSelection = async (args: {
  invoice: InvoiceMeta;
  tableData: TableData;
  mapper: VendorMap;
}): Promise<{ docId: string; vendorChosen: string } | null> => {
  const { invoice, tableData, mapper } = args;
  const { vendorName } = invoice;

  // check for exact match
  const exactMatchResult = checkForExactMatch({ vendorName, tableData });
  if (!!exactMatchResult) return exactMatchResult;

  // check vendor mapping for a match
  const mapperResult = checkMapperForMatch({ vendorName, mapper, tableData });
  if (mapperResult) return mapperResult;

  // TODO: Add AI feature to find a match

  return null;
};
