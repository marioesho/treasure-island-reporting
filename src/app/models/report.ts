export interface ReportItem {
  UPC: string;
  Name: string;
  'Total Qty': string;
  'Total Amount': string;
}

export interface ReportTotals {
  UPC: string;
  Name: string;
  'Total Qty': number;
  'Total Amount': number;
}
