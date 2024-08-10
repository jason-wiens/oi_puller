export type InvoiceMeta = {
  invoiceNumber: string;
  vendorName: string;
};

export type InvoiceList = InvoiceMeta[];

export type ReportRow = {
  invoiceNumber: string;
  vendorName: string;
  success: boolean;
  docId: string;
  vendorChosen: string;
  numberOfAttachments: number;
  fileNames: string[];
  comments: string;
};

export type VendorMap = Record<string, string>;

export type TableData = Record<string, string>[];
