import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';

function TransactionLogs() {
  const { transactionLogs, accounts } = useBanking();
  const [filter, setFilter] = useState('all'); // all, deposit, withdrawal, transfer, system, recovery
  const [statusFilter, setStatusFilter] = useState('all'); // all, success, error, pending, warning, info
  const [showDetails, setShowDetails] = useState({});
  
  // Filter logs by type
  const getTypeFilteredLogs = () => {
    if (filter === 'all') return transactionLogs;
    
    return transactionLogs.filter(log => {
      const logType = log.type.toLowerCase();
      
      if (filter === 'deposit') {
        return logType.includes('deposit');
      } else if (filter === 'withdrawal') {
        return logType.includes('withdraw');
      } else if (filter === 'transfer') {
        return logType.includes('transfer');
      } else if (filter === 'system') {
        return logType.includes('system');
      } else if (filter === 'recovery') {
        return logType.includes('recovery') || logType.includes('rollback');
      }
      
      return false;
    });
  };
  
  // Filter logs by status
  const getStatusFilteredLogs = (logs) => {
    if (statusFilter === 'all') return logs;
    
    return logs.filter(log => {
      // Map status values to consistent terms
      const status = log.status.toLowerCase();
      
      if (statusFilter === 'success') {
        return status === 'success' || status === 'completed';
      } else if (statusFilter === 'error') {
        return status === 'error' || status === 'failed';
      } else {
        return status === statusFilter;
      }
    });
  };
  
  // Combine filters and sort by timestamp (newest first)
  const filteredLogs = getStatusFilteredLogs(getTypeFilteredLogs())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Get account name by ID
  const getAccountName = (accountId) => {
    if (!accountId) return null;
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown Account';
  };
  
  // Toggle showing details for a log
  const toggleDetails = (logId) => {
    setShowDetails(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'success' || statusLower === 'completed') {
      return 'bg-secondary bg-opacity-20 text-secondary';
    } else if (statusLower === 'error' || statusLower === 'failed') {
      return 'bg-error bg-opacity-20 text-error';
    } else if (statusLower === 'warning') {
      return 'bg-warning bg-opacity-20 text-warning';
    } else if (statusLower === 'pending') {
      return 'bg-primary-light bg-opacity-20 text-primary-light';
    } else if (statusLower === 'info') {
      return 'bg-primary bg-opacity-20 text-primary';
    } else {
      return 'bg-gray-200 text-text-secondary';
    }
  };

  return (
    <div className="container mx-auto fade-in">
      <h2 className="text-2xl font-bold mb-6">Transaction Logs</h2>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-background-secondary text-text-secondary hover:bg-gray-300'
              }`}
            >
              All Logs
            </button>
            <button
              onClick={() => setFilter('deposit')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'deposit' 
                  ? 'bg-secondary text-white' 
                  : 'bg-background-secondary text-text-secondary hover:bg-gray-300'
              }`}
            >
              Deposits
            </button>
            <button
              onClick={() => setFilter('withdrawal')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'withdrawal' 
                  ? 'bg-error text-white' 
                  : 'bg-background-secondary text-text-secondary hover:bg-gray-300'
              }`}
            >
              Withdrawals
            </button>
            <button
              onClick={() => setFilter('transfer')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'transfer' 
                  ? 'bg-primary-light text-white' 
                  : 'bg-background-secondary text-text-secondary hover:bg-gray-300'
              }`}
            >
              Transfers
            </button>
            <button
              onClick={() => setFilter('system')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'system' 
                  ? 'bg-warning text-white' 
                  : 'bg-background-secondary text-text-secondary hover:bg-gray-300'
              }`}
            >
              System Events
            </button>
            <button
              onClick={() => setFilter('recovery')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'recovery' 
                  ? 'bg-warning-dark text-white' 
                  : 'bg-background-secondary text-text-secondary hover:bg-gray-300'
              }`}
            >
              Recovery Events
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm p-1"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success/Completed</option>
              <option value="pending">Pending</option>
              <option value="error">Error/Failed</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">System Logs</h3>
          <p className="text-text-secondary text-sm mt-1">
            Showing {filteredLogs.length} logs
          </p>
        </div>
        
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-background-secondary transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{log.type}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeStyle(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleDetails(log.id)}
                    className="text-primary hover:text-primary-dark text-sm"
                  >
                    {showDetails[log.id] ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                
                {showDetails[log.id] && (
                  <div className="mt-3 bg-background-secondary p-3 rounded-md text-sm slide-in">
                    <p className="mb-2">{log.details}</p>
                    
                    {/* Transaction Details */}
                    {log.transactionId && (
                      <div className="mb-2">
                        <span className="font-medium">Transaction ID: </span>
                        <span className="font-mono">{log.transactionId}</span>
                      </div>
                    )}
                    
                    {/* Account Details */}
                    {log.accountId && getAccountName(log.accountId) && (
                      <div className="mb-2">
                        <span className="font-medium">Account: </span>
                        {getAccountName(log.accountId)}
                      </div>
                    )}
                    
                    {/* Transfer Details */}
                    {log.sourceAccountId && log.destinationAccountId && (
                      <div className="mb-2">
                        <div>
                          <span className="font-medium">From: </span>
                          {getAccountName(log.sourceAccountId)}
                        </div>
                        <div>
                          <span className="font-medium">To: </span>
                          {getAccountName(log.destinationAccountId)}
                        </div>
                      </div>
                    )}
                    
                    {/* Amount */}
                    {log.amount && (
                      <div className="mb-2">
                        <span className="font-medium">Amount: </span>
                        ${log.amount.toFixed(2)}
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <div>
                      <span className="font-medium">Timestamp: </span>
                      {log.timestamp}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-text-tertiary">
            No logs found with the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionLogs;