
import type { CanonicalRow, HeaderDetectionResult } from '../types.ts';
import { HEADER_SYNONYMS, MAX_HEADER_SEARCH_ROWS } from '../constants.ts';

// This is to make TypeScript happy with the SheetJS library loaded from CDN
declare const XLSX: any;

const normalizeHeader = (header: string): string => {
    // Keep '#' for distinguishing headers like 'Vendor' from 'Vendor#'
    return (header || '').toString().toLowerCase().replace(/[^a-z0-9#]/g, '');
};

const CANONICAL_MAP: Map<string, keyof CanonicalRow> = new Map();
Object.entries(HEADER_SYNONYMS).forEach(([canonicalKey, synonyms]) => {
    synonyms.forEach(synonym => {
        CANONICAL_MAP.set(normalizeHeader(synonym), canonicalKey as keyof CanonicalRow);
    });
});

const parseNumeric = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
        const originalValue = value;
        // Remove common currency symbols, thousands separators (commas), and spaces first.
        let str = value.replace(/[$,€£₹,]/g, '').trim();

        // Now check for accounting negative format, e.g., (1000)
        const isAccountingNegative = str.startsWith('(') && str.endsWith(')');
        if (isAccountingNegative) {
            str = '-' + str.slice(1, -1);
        }

        const num = parseFloat(str);

        if (isNaN(num)) {
            console.warn(`Could not parse numeric value: "${originalValue}". Coerced to 0.`);
            return 0;
        }
        return num;
    }

    console.warn(`Unexpected type for numeric parsing: ${typeof value}. Value: "${value}". Coerced to 0.`);
    return 0;
};


const parseDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
        // Handle Excel serial date number
        try {
            const dateObj = XLSX.SSF.parse_date_code(value);
            if(dateObj) {
                // Month is 1-based in dateObj, so subtract 1 for JS Date constructor
                return new Date(dateObj.y, dateObj.m - 1, dateObj.d, dateObj.H, dateObj.M, dateObj.S);
            }
        } catch (e) {
             console.warn(`Failed to parse Excel date serial number: ${value}`, e);
             return null;
        }
    }
     if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    console.warn(`Could not parse date value: "${value}".`);
    return null;
};

const readFile = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
        reader.onerror = (e) => reject(new Error('File reading error: ' + e.target?.error));
        reader.readAsArrayBuffer(file);
    });
};

const detectHeaderRow = (data: (string | number | null)[][]): { headerRowIndex: number, headers: string[] } => {
    let bestMatch = { score: 0, index: 0, headers: data[0] ? data[0].map(String) : [] };
    
    const rowsToScan = data.slice(0, MAX_HEADER_SEARCH_ROWS);

    rowsToScan.forEach((row, rowIndex) => {
        let score = 0;
        const currentHeaders = row.map(cell => String(cell || ''));
        currentHeaders.forEach(header => {
            if (CANONICAL_MAP.has(normalizeHeader(header))) {
                score++;
            }
        });

        if (score > bestMatch.score) {
            bestMatch = { score, index: rowIndex, headers: currentHeaders };
        }
    });
    
    if (bestMatch.score === 0) {
        console.warn('Could not detect a header row with known synonyms. Defaulting to the first row.');
    }
    
    return { headerRowIndex: bestMatch.index, headers: bestMatch.headers };
};

export const getHeaderDetectionPreview = async (file: File): Promise<HeaderDetectionResult> => {
    const fileBuffer = await readFile(file);
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data: (string|number|null)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: null });
    
    const { headerRowIndex, headers } = detectHeaderRow(data);

    const mappedHeaders: Record<string, keyof CanonicalRow | null> = {};
    headers.forEach(h => {
        mappedHeaders[h] = CANONICAL_MAP.get(normalizeHeader(h)) || null;
    });

    const previewRows = data.slice(headerRowIndex + 1, headerRowIndex + 4);

    return { headerRowIndex, headers, mappedHeaders, previewRows };
};

export const processWorkbook = async (file: File): Promise<CanonicalRow[]> => {
    const fileBuffer = await readFile(file);
    const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: true });
    
    let allRows: CanonicalRow[] = [];
    console.log('Processing workbook sheets:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (sheetData.length === 0) return;
        
        const { headerRowIndex, headers } = detectHeaderRow(sheetData);
        const dataRows = sheetData.slice(headerRowIndex + 1);

        const headerMap: (keyof CanonicalRow | null)[] = headers.map(h => CANONICAL_MAP.get(normalizeHeader(String(h))) || null);

        dataRows.forEach((row) => {
             // Skip completely empty rows
            if (row.every(cell => cell === null || cell === '' || cell === undefined)) {
                return;
            }

            const rawRow: Partial<CanonicalRow> = {};
            
            headerMap.forEach((canonicalKey, index) => {
                if (canonicalKey) {
                    (rawRow as any)[canonicalKey] = row[index];
                }
            });
            
            // Validation and Normalization
            const creationDate = parseDate(rawRow.creationDate);
            const poNumber = String(rawRow.poNumber || '').trim();

            if (!poNumber || !creationDate) {
                 if (!poNumber) console.warn('Skipping row due to missing PO Number. Raw data:', row);
                 if (!creationDate) console.warn('Skipping row due to missing or invalid Creation Date. Raw data:', row);
                return;
            }

            const poAmount = parseNumeric(rawRow.poAmount);
            
            if (allRows.length < 5) {
                console.log(`Parsed PO Amount (sample ${allRows.length + 1}):`, poAmount, `(from raw value: "${rawRow.poAmount}")`);
            }

            allRows.push({
                poNumber,
                creationDate,
                marketerName: String(rawRow.marketerName || '').trim(),
                vendorName: String(rawRow.vendorName || '').trim(),
                teamName: sheetName.trim(), // Derive from sheet name
                poAmount,
                invoiceNumber: String(rawRow.invoiceNumber || '').trim(),
                invoiceAmount: parseNumeric(rawRow.invoiceAmount),
                grDate: parseDate(rawRow.grDate),
                status: String(rawRow.status || 'N/A').trim(),
            });
        });
        console.log(`Processed sheet "${sheetName}": Found ${dataRows.length} data rows.`);
    });
    
    console.log(`Finished processing. Total normalized rows: ${allRows.length}`);
    if (allRows.length > 0) {
        console.log('Sample of first 5 normalized rows:', allRows.slice(0, 5));
    }
    return allRows;
};