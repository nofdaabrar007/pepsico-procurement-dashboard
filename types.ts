export interface CanonicalRow {
  poNumber: string;
  creationDate: Date | null;
  marketerName: string;
  vendorName: string;
  teamName: string;
  poAmount: number;
  invoiceNumber: string;
  invoiceAmount: number;
  grDate: Date | null;
  status: string;
}

export interface GroupedPo {
  poNumber: string;
  creationDate: Date | null;
  marketerName: string;
  vendorName: string;
  teamName: string;
  poAmount: number;
  invoiceSum: number;
  amountLeft: number;
  rows: CanonicalRow[];
}

export type SortConfig = {
  key: keyof GroupedPo;
  direction: 'ascending' | 'descending';
} | null;

export interface HeaderDetectionResult {
  headerRowIndex: number;
  headers: string[];
  mappedHeaders: Record<string, keyof CanonicalRow | null>;
  previewRows: (string | number | null)[][];
}