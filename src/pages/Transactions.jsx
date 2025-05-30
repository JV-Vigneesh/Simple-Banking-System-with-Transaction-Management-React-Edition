import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';

function Transactions() {
  const { transactions, accounts } = useBanking();
  const [filter, setFilter] = useState('all'); // all, deposit, withdrawal, transfer
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest
  
  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type.toLowerCase() === filter;
  });
  
  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });
  
  // Get account name by ID
  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown Account';
  };
  
  // Format transaction type for display
  const formatTransactionType = (type) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-secondary bg-opacity-20 text-secondary';
      case 'pending':
        return 'bg-warning bg-opacity-20 text-warning';
      case 'failed':
        return 'bg-error bg-opacity-20 text-error';
      default:
        return 'bg-gray-200 text-text-secondary';
    }
  };

  return (
    <div className="container mx-auto fade-in">
      <h2 className="text-2xl font-bold mb-6">Transactions</h2>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-card mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex space-x-2 mb-2 md:mb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-background-secondary text-text-secondary hover:bg-gray-300'
              }`}
            >
              All
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
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-md text-sm p-1"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <p className="text-text-secondary text-sm mt-1">
            Showing {sortedTransactions.length} transactions
          </p>
        </div>
        
        {sortedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-background-secondary border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Account
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-background-secondary transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-text-secondary font-mono">{tx.id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className={`font-medium ${
                        tx.type === 'DEPOSIT' ? 'text-secondary' : 
                        tx.type === 'WITHDRAWAL' ? 'text-error' : 
                        'text-primary'
                      }`}>
                        {formatTransactionType(tx.type)}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {tx.type === 'TRANSFER' ? (
                        <div>
                          <div className="text-sm font-medium">
                            From: {getAccountName(tx.sourceAccountId)}
                          </div>
                          <div className="text-sm text-text-secondary">
                            To: {getAccountName(tx.destinationAccountId)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium">
                          {getAccountName(tx.accountId)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-semibold">
                        ${tx.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-text-tertiary">
            No transactions found with the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;