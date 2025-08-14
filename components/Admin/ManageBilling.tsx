import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { 
    apiFetchBillingRecords, 
    apiDeleteBillingRecord,
    apiFetchAllUsers,
    apiFetchProjects,
    apiAddBillingRecord
} from '../../services/api';
import { BillingRecord, BillingStatus, User, Project } from '../../types';
import { THEME } from '../../constants';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, XMarkIcon, ArrowUpTrayIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/dateUtils';
import { parseCSVToObjects } from '../../utils/csvParser'; // Ensure this path is correct


const ManageBilling: React.FC = () => {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BillingRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState<BillingRecord | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importFeedback, setImportFeedback] = useState<{ success: string[], errors: string[] }>({ success: [], errors: [] });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedRecords, fetchedUsers, fetchedProjects] = await Promise.all([
        apiFetchBillingRecords(),
        apiFetchAllUsers(),
        apiFetchProjects()
      ]);
      setBillingRecords(fetchedRecords);
      // setFilteredRecords(fetchedRecords); // Handled by useEffect
      setUsers(fetchedUsers);
      setProjects(fetchedProjects);
    } catch (err: any) {
      setError(err.message || 'Failed to load billing data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = billingRecords.filter(record => {
        const userName = getUserName(record.userId).toLowerCase();
        const projectName = record.projectName?.toLowerCase() || '';
        const clientName = record.clientName.toLowerCase();
        return userName.includes(lowercasedFilter) || 
               projectName.includes(lowercasedFilter) ||
               clientName.includes(lowercasedFilter);
    });
    setFilteredRecords(filteredData);
  }, [searchTerm, billingRecords, users]); // users dependency added for getUserName


  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this billing record?')) {
      try {
        await apiDeleteBillingRecord(recordId);
        setBillingRecords(prevRecords => prevRecords.filter(r => r.id !== recordId));
        alert('Billing record deleted successfully.');
      } catch (err: any) {
        setError(err.message || 'Failed to delete billing record.');
        alert(`Error: ${err.message || 'Failed to delete billing record.'}`);
      }
    }
  };

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const getStatusColor = (status: BillingStatus) => {
    switch (status) {
      case BillingStatus.PAID: return 'bg-green-100 text-green-800';
      case BillingStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case BillingStatus.OVERDUE: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openDetailsModal = (record: BillingRecord) => {
    setSelectedRecordForDetails(record);
    setIsDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRecordForDetails(null);
  };

  // CSV Import Handlers
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCsvFile(event.target.files[0]);
      setImportFeedback({ success: [], errors: [] }); // Clear previous feedback
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      alert("Please select a CSV file to import.");
      return;
    }
    setIsImporting(true);
    setImportFeedback({ success: [], errors: [] });
    const reader = new FileReader();
    reader.onload = async (event) => {
        const csvString = event.target?.result as string;
        const parseOutput = parseCSVToObjects(csvString);

        if ('error' in parseOutput) {
            setImportFeedback(prev => ({ ...prev, errors: [parseOutput.error] }));
            setIsImporting(false);
            return;
        }

        const { headers, data: csvData } = parseOutput;
        const requiredHeaders = ['employeeIdentifier', 'projectIdentifier', 'clientName', 'date', 'status', 'isCountBased'];
        const missingHeaders = requiredHeaders.filter(h => !headers.map(header => header.toLowerCase()).includes(h.toLowerCase()));
        if (missingHeaders.length > 0) {
            setImportFeedback(prev => ({ ...prev, errors: [`Missing required CSV headers: ${missingHeaders.join(', ')}`] }));
            setIsImporting(false);
            return;
        }
        
        let localSuccess: string[] = [];
        let localErrors: string[] = [];

        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            const rowIndex = i + 2; 
            try {
                const getVal = (headerName: string) => Object.entries(row).find(([key, _]) => key.toLowerCase() === headerName.toLowerCase())?.[1]?.trim() || '';

                const employeeIdentifier = getVal('employeeIdentifier');
                const projectIdentifier = getVal('projectIdentifier');
                const clientName = getVal('clientName');
                const date = getVal('date');
                const statusStr = getVal('status');
                const isCountBasedStr = getVal('isCountBased')?.toLowerCase();

                if (!employeeIdentifier || !projectIdentifier || !clientName || !date || !statusStr || isCountBasedStr === '') {
                    localErrors.push(`Row ${rowIndex}: Missing required fields (employeeIdentifier, projectIdentifier, clientName, date, status, isCountBased).`);
                    continue;
                }

                const user = users.find(u => u.id === employeeIdentifier || u.username.toLowerCase() === employeeIdentifier.toLowerCase() || `${u.firstName.toLowerCase()} ${u.lastName.toLowerCase()}` === employeeIdentifier.toLowerCase());
                const project = projects.find(p => p.id === projectIdentifier || p.name.toLowerCase() === projectIdentifier.toLowerCase());

                if (!user) { localErrors.push(`Row ${rowIndex}: Employee "${employeeIdentifier}" not found.`); continue; }
                if (!project) { localErrors.push(`Row ${rowIndex}: Project "${projectIdentifier}" not found.`); continue; }

                const status = statusStr.toLowerCase() as BillingStatus;
                if (!Object.values(BillingStatus).includes(status)) {
                     localErrors.push(`Row ${rowIndex}: Invalid status "${statusStr}". Must be one of: ${Object.values(BillingStatus).join(', ')}.`); continue;
                }
                
                let recordPayload: Partial<BillingRecord>;

                if (isCountBasedStr === 'true') {
                    const calculatedAmountStr = getVal('calculatedAmount');
                    if (calculatedAmountStr === '' || isNaN(parseFloat(calculatedAmountStr))) {
                        localErrors.push(`Row ${rowIndex}: 'calculatedAmount' is required and must be a number for count-based records.`); continue;
                    }
                    const achievedCountTotalStr = getVal('achievedCountTotal');
                    const countMetricLabelUsed = getVal('countMetricLabelUsed') || project.countMetricLabel;

                    recordPayload = {
                        userId: user.id, projectId: project.id, clientName, date, status, isCountBased: true,
                        calculatedAmount: parseFloat(calculatedAmountStr),
                        achievedCountTotal: achievedCountTotalStr !== '' ? parseFloat(achievedCountTotalStr) : undefined,
                        countMetricLabelUsed: countMetricLabelUsed, notes: getVal('notes'),
                    };
                } else { // Hourly
                    const hoursBilledStr = getVal('hoursBilled');
                    const rateAppliedStr = getVal('rateApplied');

                    if (hoursBilledStr === '' || isNaN(parseFloat(hoursBilledStr)) || parseFloat(hoursBilledStr) <=0) {
                        localErrors.push(`Row ${rowIndex}: 'hoursBilled' is required and must be a positive number for hourly records.`); continue;
                    }
                    const rate = rateAppliedStr !== '' ? parseFloat(rateAppliedStr) : project.ratePerHour;
                    if (rate === undefined || rate === null || isNaN(rate) || rate <= 0) {
                         localErrors.push(`Row ${rowIndex}: 'rateApplied' is required and must be a positive number (or project default rate) for hourly records.`); continue;
                    }
                    const hoursBilled = parseFloat(hoursBilledStr);
                    const rateApplied = rate;

                    recordPayload = {
                        userId: user.id, projectId: project.id, clientName, date, status, isCountBased: false,
                        hoursBilled, rateApplied, calculatedAmount: hoursBilled * rateApplied, notes: getVal('notes'),
                    };
                }
                await apiAddBillingRecord(recordPayload);
                localSuccess.push(`Row ${rowIndex}: Record for ${user.username} / ${project.name} imported.`);

            } catch (apiErr: any) {
                localErrors.push(`Row ${rowIndex}: API Error - ${apiErr.message || 'Failed to add record.'}`);
            }
        }
        setImportFeedback({ success: localSuccess, errors: localErrors });
        if (localSuccess.length > 0) loadData(); 
    };
    reader.onerror = () => {
        setImportFeedback({ success:[], errors: ["Failed to read the CSV file."]});
        setIsImporting(false);
    };
    reader.onloadend = () => {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; 
    };
    reader.readAsText(csvFile);
  };

  const inputBaseClasses = `mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-${THEME.secondary} focus:border-${THEME.secondary} sm:text-sm placeholder-gray-400`;
  const buttonPrimaryClasses = `inline-flex items-center px-4 py-2 bg-${THEME.primary} text-${THEME.primaryText} text-sm font-medium rounded-md hover:bg-opacity-85 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${THEME.primary}`;


  if (loading && billingRecords.length === 0) {
    return (
      <div className={`p-6 bg-white rounded-xl shadow-lg text-center text-${THEME.accentText}`}>
        <svg className={`animate-spin h-8 w-8 text-${THEME.primary} mx-auto mb-2`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading billing records...
      </div>
    );
  }

  if (error) {
    return <div className={`p-6 bg-red-100 text-red-700 rounded-xl shadow-lg`}>Error: {error}</div>;
  }
  
  return (
    <div className={`p-6 bg-white rounded-xl shadow-lg`}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className={`text-2xl font-semibold text-${THEME.primary}`}>Manage Billing Records</h2>
        <input
            type="text"
            placeholder="Filter by employee, project, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputBaseClasses} sm:w-64 w-full`}
        />
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
                onClick={() => setIsImportModalOpen(true)} 
                className={`${buttonPrimaryClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500 w-full sm:w-auto justify-center`}
            >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" /> Import CSV
            </button>
            <Link
              to="/app/admin/billing/add"
              className={`${buttonPrimaryClasses} w-full sm:w-auto justify-center`}
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add New Record
            </Link>
        </div>
      </div>
      
      {loading && <p className={`text-sm text-${THEME.accentText} my-2`}>Refreshing records...</p>}
      {filteredRecords.length === 0 ? (
        <p className={`text-center text-gray-500 py-8`}>{searchTerm ? 'No records match your search.' : 'No billing records found.'}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className={`bg-gray-50 border-b-2 border-${THEME.primary}`}>
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Amount</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Type</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700">{formatDate(record.date)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{getUserName(record.userId)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{record.projectName || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{record.clientName}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-right font-semibold">{formatCurrency(record.calculatedAmount)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 text-center">
                    {record.isCountBased ? 'Count-Based' : 'Hourly'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-right">
                    {(record.details && record.details.length > 0) || record.attendanceSummary ? (
                        <button
                          onClick={() => openDetailsModal(record)}
                          className={`p-1.5 text-blue-500 hover:text-blue-700 transition-colors mr-1`}
                          title="View Details"
                        >
                          <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    ): <span className="inline-block w-7 mr-1"></span>} {/* Placeholder for alignment */}
                    <Link to={`/admin/billing/edit/${record.id}`} className={`p-1.5 text-gray-500 hover:text-${THEME.secondary} transition-colors mr-1`} title="Edit Record">
                      <PencilSquareIcon className="h-5 w-5" />
                    </Link>
                    <button onClick={() => handleDeleteRecord(record.id)} className={`p-1.5 text-gray-500 hover:text-red-600 transition-colors`} title="Delete Record">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

        {/* Details Modal */}
        {isDetailsModalOpen && selectedRecordForDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl my-8">
                <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-semibold text-${THEME.primary}`}>
                    Billing Details for {getUserName(selectedRecordForDetails.userId)}
                </h3>
                <button onClick={closeDetailsModal} className={`text-gray-400 hover:text-gray-600`}>
                    <XMarkIcon className="h-6 w-6" />
                </button>
                </div>
                <div className="text-sm space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    <p><strong>Period:</strong> {selectedRecordForDetails.billingPeriodStartDate ? `${formatDate(selectedRecordForDetails.billingPeriodStartDate)} to ${formatDate(selectedRecordForDetails.billingPeriodEndDate || selectedRecordForDetails.date)}` : formatDate(selectedRecordForDetails.date)}</p>
                    <p><strong>Client:</strong> {selectedRecordForDetails.clientName}</p>
                    <p><strong>Total Amount:</strong> {formatCurrency(selectedRecordForDetails.calculatedAmount)}</p>
                    
                    {selectedRecordForDetails.attendanceSummary && (
                        <div className="mt-3 p-3 border rounded-md bg-indigo-50">
                        <h4 className="text-xs font-semibold text-indigo-700 mb-1">Attendance Summary:</h4>
                        <p className="text-xs text-indigo-600">Days Present: {selectedRecordForDetails.attendanceSummary.daysPresent}</p>
                        <p className="text-xs text-indigo-600">Days on Leave (Approved): {selectedRecordForDetails.attendanceSummary.daysOnLeave}</p>
                        </div>
                    )}

                    {selectedRecordForDetails.details && selectedRecordForDetails.details.length > 0 && (
                        <div className="mt-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1">Project Earnings Breakdown:</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                            <thead className="bg-gray-100">
                                <tr>
                                <th className="py-1 px-2 text-left font-medium text-gray-600">Project</th>
                                <th className="py-1 px-2 text-left font-medium text-gray-600">Achieved</th>
                                <th className="py-1 px-2 text-left font-medium text-gray-600">Metric</th>
                                <th className="py-1 px-2 text-right font-medium text-gray-600">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRecordForDetails.details.map(detail => (
                                <tr key={detail.projectId} className="border-b border-gray-200 last:border-b-0">
                                    <td className="py-1 px-2 text-gray-600">{detail.projectName}</td>
                                    <td className="py-1 px-2 text-gray-600">{detail.totalAchievedCount}</td>
                                    <td className="py-1 px-2 text-gray-600">{detail.metricLabel}</td>
                                    <td className="py-1 px-2 text-gray-600 text-right font-medium">{formatCurrency(detail.calculatedAmountForProject)}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        </div>
                    )}
                    {selectedRecordForDetails.notes && (
                        <div className="mt-3 pt-2 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-600">Notes:</p>
                            <p className="text-xs text-gray-500 whitespace-pre-wrap">{selectedRecordForDetails.notes}</p>
                        </div>
                    )}
                     {(!selectedRecordForDetails.details || selectedRecordForDetails.details.length === 0) && !selectedRecordForDetails.attendanceSummary && (
                         <p className="text-xs text-gray-500 italic">No detailed breakdown available for this record.</p>
                     )}
                </div>
                <div className="mt-6 text-right">
                    <button type="button" onClick={closeDetailsModal} className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50`}>Close</button>
                </div>
            </div>
            </div>
        )}
         {/* CSV Import Modal */}
        {isImportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-semibold text-${THEME.primary}`}>Import Billing Records from CSV</h3>
                <button onClick={() => setIsImportModalOpen(false)} className={`text-gray-400 hover:text-gray-600`}>
                    <XMarkIcon className="h-6 w-6" />
                </button>
                </div>
                <div className="space-y-4">
                <div>
                    <label htmlFor="csvFile" className={`block text-sm font-medium text-${THEME.accentText}`}>Upload CSV File</label>
                    <input
                        type="file"
                        id="csvFile"
                        ref={fileInputRef}
                        accept=".csv"
                        onChange={handleFileChange}
                        className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-${THEME.accent} file:text-${THEME.accentText} hover:file:bg-opacity-80`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Required headers: employeeIdentifier, projectIdentifier, clientName, date, status, isCountBased. <br/>
                        Conditional: hoursBilled, rateApplied (if not count-based); calculatedAmount (if count-based).
                    </p>
                </div>

                {isImporting && <p className="text-sm text-blue-600">Importing records, please wait...</p>}
                
                {importFeedback.errors.length > 0 && (
                    <div className="max-h-40 overflow-y-auto mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs">
                    <p className="font-semibold text-red-700 mb-1">Import Errors:</p>
                    <ul className="list-disc list-inside text-red-600">
                        {importFeedback.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                    </div>
                )}
                {importFeedback.success.length > 0 && (
                    <div className="max-h-40 overflow-y-auto mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-xs">
                    <p className="font-semibold text-green-700 mb-1">Successfully Imported:</p>
                    <ul className="list-disc list-inside text-green-600">
                        {importFeedback.success.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                    <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50`}
                    >
                    Cancel
                    </button>
                    <button
                    type="button"
                    onClick={handleImportCSV}
                    disabled={!csvFile || isImporting}
                    className={`px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50`}
                    >
                    {isImporting ? 'Processing...' : 'Import Records'}
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}
    </div>
  );
};

export default ManageBilling;
