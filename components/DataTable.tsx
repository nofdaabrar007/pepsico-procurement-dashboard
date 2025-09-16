import React, { useState, useMemo } from 'react';
import type { GroupedPo, SortConfig } from '../types.ts';
import { formatCurrency, formatDateForDisplay } from '../utils/dataUtils.ts';
import { ArrowUpIcon, ArrowDownIcon } from './Icons.tsx';

interface DataTableProps {
    data: GroupedPo[];
    sortConfig: SortConfig;
    setSortConfig: (config: SortConfig) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, sortConfig, setSortConfig }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    }, [data, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(data.length / itemsPerPage);

    const handleSort = (key: keyof GroupedPo) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const renderSortArrow = (key: keyof GroupedPo) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUpIcon /> : <ArrowDownIcon />;
    };

    const headers: { key: keyof GroupedPo; label: string }[] = [
        { key: 'poNumber', label: 'PO Number' },
        { key: 'creationDate', label: 'Date' },
        { key: 'marketerName', label: 'Marketer' },
        { key: 'vendorName', label: 'Vendor Name' },
        { key: 'teamName', label: 'Team' },
        { key: 'poAmount', label: 'PO Amount' },
        { key: 'invoiceSum', label: 'Invoice Sum' },
        { key: 'amountLeft', label: 'Amount Left' },
    ];

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            {headers.map(({ key, label }) => (
                                <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort(key)}>
                                    <div className="flex items-center gap-1">{label} {renderSortArrow(key)}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((po) => (
                            <tr key={po.poNumber} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.poNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateForDisplay(po.creationDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.marketerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.vendorName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.teamName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(po.poAmount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(po.invoiceSum)}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${po.amountLeft < 0 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                    {formatCurrency(po.amountLeft)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {paginatedData.length === 0 && <div className="text-center py-10 text-gray-500">No data matches the current filters.</div>}
            </div>
            {/* Pagination */}
            <div className="py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, data.length)}</span> of{' '}
                            <span className="font-medium">{data.length}</span> results
                        </p>
                    </div>
                     <div>
                        <label className="text-sm text-gray-700 mr-2">Rows per page:</label>
                        <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="p-1 rounded-md border-gray-300 text-sm">
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={250}>250</option>
                        </select>
                    </div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                         <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                            Previous
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                         <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                            Next
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default DataTable;