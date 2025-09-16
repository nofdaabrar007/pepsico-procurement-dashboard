
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { processWorkbook, getHeaderDetectionPreview } from '../services/excelParser.ts';
import { LOCAL_STORAGE_KEY } from '../constants.ts';
import type { HeaderDetectionResult } from '../types.ts';
import Spinner from '../components/Spinner.tsx';
import { UploadIcon, ClearIcon, PreviewIcon, DashboardIcon } from '../components/Icons.tsx';

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<HeaderDetectionResult | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setError(null);
      setPreview(null);
    }
  };

  const handleParse = useCallback(async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setPreview(null);
    try {
      const rows = await processWorkbook(file);
      if (rows.length === 0) {
        setError('No valid data rows found. Please check the file for correct headers (e.g., "PO Number", "Creation Date") and ensure data exists below the header row.');
        setIsLoading(false);
        return;
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rows, (key, value) => {
        // Custom replacer for Date objects
        if(key.toLowerCase().includes('date') && value) {
            const date = new Date(value);
            if(!isNaN(date.getTime())) return date.toISOString();
        }
        return value;
      }));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to parse file. The file might be corrupted or in an unsupported format. Try re-saving it as .xlsx in Excel. Check the console for more details.');
    } finally {
      setIsLoading(false);
    }
  }, [file, navigate]);
  
  const handlePreview = useCallback(async () => {
      if (!file) {
          setError('Please select a file to preview.');
          return;
      }
      setIsLoading(true);
      setError(null);
      try {
          const previewData = await getHeaderDetectionPreview(file);
          setPreview(previewData);
      } catch (err) {
          console.error(err);
          setError('Could not generate preview. The file might be invalid.');
      } finally {
          setIsLoading(false);
      }
  }, [file]);

  const handleClearData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    alert('Stored procurement data has been cleared.');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Upload Procurement Data</h1>
        <p className="text-gray-500 mt-2">Select an Excel workbook (.xlsx or .xls) to get started.</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Excel File</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx,.xls" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">{file ? file.name : 'XLSX, XLS up to 50MB'}</p>
            </div>
          </div>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={handlePreview} disabled={!file || isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed">
            <PreviewIcon className="h-5 w-5" />
            {isLoading ? 'Loading...' : 'Preview Headers'}
          </button>
          <button onClick={handleParse} disabled={!file || isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed">
             {isLoading ? <Spinner /> : <DashboardIcon className="h-5 w-5" />}
             {isLoading ? 'Parsing...' : 'Parse & Open Dashboard'}
          </button>
        </div>
        
        {preview && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-bold text-lg mb-2 text-gray-700">Header Detection Preview (First Sheet)</h3>
                <p className="text-sm text-gray-600 mb-4">Detected header in <span className="font-semibold">row {preview.headerRowIndex + 1}</span>. The app will map these headers to its internal fields.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                            <tr>
                                {preview.headers.map((h, i) => <th key={i} className="px-4 py-2 font-semibold">{h || `Column ${i+1}`}</th>)}
                            </tr>
                            <tr>
                                {preview.headers.map((h, i) => <th key={i} className="px-4 py-1 text-indigo-600 font-normal italic">{preview.mappedHeaders[h] || 'unmapped'}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {preview.previewRows.map((row, i) => (
                                <tr key={i} className="bg-white border-b">
                                    {preview.headers.map((_, j) => <td key={j} className="px-4 py-2 truncate max-w-[150px]">{String(row[j] === null ? '' : row[j])}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
        
        <div className="pt-4 border-t border-gray-200 text-center">
            <button onClick={handleClearData} className="text-sm text-gray-500 hover:text-red-600 hover:underline flex items-center justify-center mx-auto gap-2">
                <ClearIcon className="h-4 w-4" />
                Clear stored data
            </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;