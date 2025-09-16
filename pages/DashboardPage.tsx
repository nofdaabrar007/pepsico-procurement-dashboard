import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CanonicalRow, GroupedPo, SortConfig } from '../types.ts';
import { LOCAL_STORAGE_KEY } from '../constants.ts';
import { formatCurrency, formatDateForInput, exportToCsv } from '../utils/dataUtils.ts';
import MetricCard from '../components/MetricCard.tsx';
import DataTable from '../components/DataTable.tsx';
import BarChart from '../components/BarChart.tsx';
import { ChartIcon, TableIcon, ExportIcon, ResetIcon, FilterIcon, SearchIcon } from '../components/Icons.tsx';


const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [allRows, setAllRows] = useState<CanonicalRow[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [marketerFilter, setMarketerFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    // UI states
    const [showChart, setShowChart] = useState(true);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    useEffect(() => {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!storedData) {
                alert('No data found. Please upload a file first.');
                navigate('/upload');
                return;
            }
            const parsedRows: CanonicalRow[] = JSON.parse(storedData, (key, value) => {
                if (key.toLowerCase().includes('date') && typeof value === 'string') {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) return date;
                }
                return value;
            });
            
            if (parsedRows.length === 0) {
                 alert('Stored data is empty. Please upload a new file.');
                 navigate('/upload');
                 return;
            }

            setAllRows(parsedRows);
            const minDate = parsedRows.reduce((min, row) => {
              if (row.creationDate && row.creationDate < min) return row.creationDate;
              return min;
            }, new Date());
            setStartDate(formatDateForInput(minDate));

        } catch (error) {
            console.error('Failed to load or parse data from localStorage', error);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            alert('Could not read stored data. It might be corrupted. Please upload again.');
            navigate('/upload');
        } finally {
            setIsDataLoaded(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const filteredRows = useMemo(() => {
        const marketers = marketerFilter.toLowerCase().split(',').map(m => m.trim()).filter(Boolean);
        return allRows.filter(row => {
            if (!row.creationDate || row.creationDate < new Date(startDate)) return false;
            if (marketers.length > 0 && !marketers.some(m => row.marketerName.toLowerCase().includes(m))) return false;
            if (statusFilter !== 'All' && row.status.toLowerCase() !== statusFilter.toLowerCase()) return false; // Simple status check
            return true;
        });
    }, [allRows, startDate, marketerFilter, statusFilter]);
    
    const groupedData = useMemo((): GroupedPo[] => {
        const poMap = new Map<string, CanonicalRow[]>();
        filteredRows.forEach(row => {
            if (!poMap.has(row.poNumber)) {
                poMap.set(row.poNumber, []);
            }
            poMap.get(row.poNumber)!.push(row);
        });

        const result: GroupedPo[] = [];
        poMap.forEach((rows, poNumber) => {
            const poAmount = Math.max(...rows.map(r => r.poAmount));
            const invoiceSum = rows.reduce((sum, r) => sum + r.invoiceAmount, 0);
            
            // Determine team name by majority
            const teamCounts = rows.reduce((acc, r) => {
                acc[r.teamName] = (acc[r.teamName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            let maxCount = 0;
            let majorityTeams: string[] = [];
            Object.entries(teamCounts).forEach(([team, count]) => {
                if(count > maxCount) {
                    maxCount = count;
                    majorityTeams = [team];
                } else if (count === maxCount) {
                    majorityTeams.push(team);
                }
            });

            result.push({
                poNumber,
                creationDate: rows[0]?.creationDate || null,
                marketerName: rows[0]?.marketerName || 'N/A', // Assuming same marketer per PO
                vendorName: rows[0]?.vendorName || 'N/A', // Assuming same vendor per PO
                teamName: majorityTeams.join(' / '),
                poAmount,
                invoiceSum,
                amountLeft: poAmount - invoiceSum,
                rows,
            });
        });
        return result;
    }, [filteredRows]);

    const searchedData = useMemo(() => {
        if (!searchQuery.trim()) {
            return groupedData;
        }
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        return groupedData.filter(po => {
            const hasMatchingInvoice = po.rows.some(row => 
                row.invoiceNumber.toLowerCase().includes(lowercasedQuery)
            );

            return (
                po.poNumber.toLowerCase().includes(lowercasedQuery) ||
                po.marketerName.toLowerCase().includes(lowercasedQuery) ||
                po.vendorName.toLowerCase().includes(lowercasedQuery) ||
                po.teamName.toLowerCase().includes(lowercasedQuery) ||
                hasMatchingInvoice
            );
        });
    }, [groupedData, searchQuery]);
    
     const sortedData = useMemo(() => {
        let sortableItems = [...searchedData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                // Handle nulls to avoid errors and push them to the end
                if (aVal === null) return 1;
                if (bVal === null) return -1;
                
                if (aVal instanceof Date && bVal instanceof Date) {
                    return sortConfig.direction === 'ascending'
                        ? aVal.getTime() - bVal.getTime()
                        : bVal.getTime() - aVal.getTime();
                }
                
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
                }

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortConfig.direction === 'ascending' 
                        ? aVal.localeCompare(bVal) 
                        : bVal.localeCompare(aVal);
                }
                return 0;
            });
        }
        return sortableItems;
    }, [searchedData, sortConfig]);

    const metrics = useMemo(() => {
        const uniquePOs = new Set(filteredRows.map(r => r.poNumber));
        const invoicesGRd = filteredRows.filter(r => r.grDate).length;
        const totalPOAmount = groupedData.reduce((sum, po) => sum + po.poAmount, 0);
        const totalAmountLeft = groupedData.reduce((sum, po) => sum + po.amountLeft, 0);
        return { uniquePOs: uniquePOs.size, invoicesGRd, totalPOAmount, totalAmountLeft };
    }, [filteredRows, groupedData]);

    const chartData = useMemo(() => {
        const marketerCounts = new Map<string, Set<string>>();
        filteredRows.forEach(row => {
            if (!marketerCounts.has(row.marketerName)) {
                marketerCounts.set(row.marketerName, new Set());
            }
            marketerCounts.get(row.marketerName)!.add(row.poNumber);
        });
        
        const labels = Array.from(marketerCounts.keys());
        const data = labels.map(label => marketerCounts.get(label)!.size);

        return {
            labels,
            datasets: [{
                label: 'Unique PO Count',
                data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }]
        };
    }, [filteredRows]);

    const handleResetFilters = () => {
         const minDate = allRows.reduce((min, row) => {
              if (row.creationDate && row.creationDate < min) return row.creationDate;
              return min;
            }, new Date());
        setStartDate(formatDateForInput(minDate));
        setMarketerFilter('');
        setStatusFilter('All');
        setSearchQuery('');
    };

    if (!isDataLoaded) {
        return <div className="text-center p-10">Loading data...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><FilterIcon/> Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"/>
                    </div>
                    <div>
                        <label htmlFor="marketer" className="block text-sm font-medium text-gray-700">Marketer (comma-sep)</label>
                        <input type="text" id="marketer" value={marketerFilter} onChange={e => setMarketerFilter(e.target.value)} placeholder="e.g. Smith, Jones" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"/>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                         <select id="status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                            <option>All</option>
                            <option>Open</option>
                            <option>Closed</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleResetFilters} className="flex items-center justify-center gap-2 w-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium py-2 px-4 rounded-md text-sm">
                           <ResetIcon/> Reset
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                    <label htmlFor="table-search" className="sr-only">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="text-gray-500" />
                        </div>
                        <input 
                            type="text" 
                            id="table-search"
                            className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="Search by PO, Marketer, Vendor, Team, Invoice..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Unique POs" value={metrics.uniquePOs.toLocaleString()} />
                <MetricCard title="Invoices GR'd" value={metrics.invoicesGRd.toLocaleString()} />
                <MetricCard title="Total PO Amount" value={formatCurrency(metrics.totalPOAmount)} />
                <MetricCard title="Total Amount Left" value={formatCurrency(metrics.totalAmountLeft)} isNegative={metrics.totalAmountLeft < 0} />
            </div>

            {/* Content Area */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Analysis</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowChart(!showChart)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
                           {showChart ? <TableIcon title="Show Table"/> : <ChartIcon title="Show Chart"/>}
                        </button>
                         <button onClick={() => exportToCsv(sortedData, 'procurement_data.csv')} className="flex items-center gap-2 text-sm bg-blue-500 text-white font-semibold py-2 px-3 rounded-md hover:bg-blue-600">
                           <ExportIcon/> Export CSV
                        </button>
                    </div>
                </div>
                {showChart ? <BarChart chartData={chartData}/> : <DataTable data={sortedData} sortConfig={sortConfig} setSortConfig={setSortConfig} />}
            </div>
        </div>
    );
};

export default DashboardPage;