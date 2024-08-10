import { InvoiceMeta, TableData } from "@/types";

function simplyfyString(str: string): string {
  return str.toLowerCase().replace(/[\s.,]/g, "");
}

export const handleInvoiceSelection = async (args: {
  invoice: InvoiceMeta;
  tableData: TableData;
}): Promise<{ docId: string; vendorChosen: string } | null> => {
  const { invoice, tableData } = args;
  const { invoiceNumber } = invoice;

  for (const row of tableData) {
    const oiCompany = row["Company"];
    if (!oiCompany) continue;
    if (simplyfyString(oiCompany) === simplyfyString(invoiceNumber)) {
      return {
        docId: row["docId"],
        vendorChosen: oiCompany,
      };
    }
  }

  return null;
};
