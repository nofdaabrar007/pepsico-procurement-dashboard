import type { GroupedPo } from '../types.ts';

export const exportToCsv = (data: GroupedPo[], fileName: string) => {
  const headers = [
    'PO Number',
    'Creation Date',
    'Marketer Name',
    'Vendor Name',
    'Team Name',
    'PO Amount',
    'Invoice Sum',
    'Amount Left',
  ];

  const csvRows = [headers.join(',')];

  data.forEach(row => {
    const values = [
      `"${row.poNumber}"`,
      `"${formatDateForDisplay(row.creationDate)}"`,
      `"${row.marketerName}"`,
      `"${row.vendorName}"`,
      `"${row.teamName}"`,
      row.poAmount,
      row.invoiceSum,
      row.amountLeft,
    ];
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return 'N/A';
    if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }
    return 'Invalid Date';
};


export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};