import type { CanonicalRow } from './types.ts';

export const LOCAL_STORAGE_KEY = 'procurement.rows.v2';
export const MAX_HEADER_SEARCH_ROWS = 8;

export const HEADER_SYNONYMS: Record<keyof CanonicalRow, string[]> = {
  poNumber: ["po number", "po no", "po #", "purchase order no", "po"],
  creationDate: ["creation date", "created on", "po date", "date", "po request sent", "request date", "po sent date"],
  marketerName: ["marketer", "marketer name", "owner", "requestor"],
  vendorName: ["vendor", "supplier", "vendor name"],
  teamName: [], // This is derived from sheet name, not a header
  poAmount: ["Estimate Amt.","po amount", "amount", "total amount", "$ amount", "est. amount", "estimate amount", "po amt", "est amt", "estimated amount", "value"],
  invoiceNumber: ["invoice no", "inv #", "invoice number"],
  invoiceAmount: ["invoice amount", "inv amount"],
  grDate: ["gr date", "goods received date", "receipt date"],
  status: ["po open or closed", "open/closed", "status", "$ left on po"],
};