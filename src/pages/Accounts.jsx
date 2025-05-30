import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';

function Accounts() {
  const { 
    accounts, 
    createAccount, 
    processDeposit, 
    processWithdrawal,
    processTransfer 
  } = useBanking();
  
  const [newAccountName, setNewAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [destinationAccount, setDestinationAccount] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // deposit, withdraw, transfer
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!newAccountName.trim()) {
      setError('Account name is required');
      return;
    }
    
    createAccount(newAccountName, parseFloat(initialBalance) || 0);
    setNewAccountName('');
    setInitialBalance(0);
    setSuccess('Account created successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };
  
  const openModal = (accountId, type) => {
    setSelectedAccount(accountId);
    setModalType(type);
    setTransactionAmount(0);
    setDestinationAccount('');
    setError('');
    setModalOpen(true);
  };
  
  const closeModal = () => {
    setModalOpen(false);
    setError('');
  };
  
  const handleTransaction = (e) => {
    e.preventDefault();
    
    if (!transactionAmount || transactionAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    const amount = parseFloat(transactionAmount);
    
    if (modalType === 'deposit') {
      const result = processDeposit(selectedAccount, amount);
      if (result.success) {
        closeModal();
        setSuccess(`Deposit of $${amount} initiated`);
      } else {
        setError(result.error);
      }
    } else if (modalType === 'withdraw') {
      const result = processWithdrawal(selectedAccount, amount);
      if (result.success) {
        closeModal();
        setSuccess(`Withdrawal of $${amount} initiated`);
      } else {
        setError(result.error);
      }
    } else if (modalType === 'transfer') {
      if (!destinationAccount) {
        setError('Please select a destination account');
        return;
      }
      
      if (selectedAccount === destinationAccount) {
        setError('Cannot transfer to the same account');
        return;
      }
      
      const result = processTransfer(selectedAccount, destinationAccount, amount);
      if (result.success) {
        closeModal();
        setSuccess(`Transfer of $${amount} initiated`);
      } else {
        setError(result.error);
      }
    }
    
    // Clear success message after 5 seconds
    if (success) {
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  return (
    <div className="container mx-auto fade-in">
      <h2 className="text-2xl font-bold mb-6">Accounts</h2>
      
      {/* Error/Success messages */}
      {error && (
        <div className="bg-error bg-opacity-10 border border-error text-error px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-secondary bg-opacity-10 border border-secondary text-secondary px-4 py-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      {/* Create Account Form */}
      <div className="bg-white p-6 rounded-lg shadow-card mb-6">
        <h3 className="text-lg font-semibold mb-4">Create New Account</h3>
        <form onSubmit={handleCreateAccount} className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-text-secondary mb-1">
              Account Name
            </label>
            <input
              type="text"
              id="accountName"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder="e.g., John's Savings"
            />
          </div>
          
          <div>
            <label htmlFor="initialBalance" className="block text-sm font-medium text-text-secondary mb-1">
              Initial Balance ($)
            </label>
            <input
              type="number"
              id="initialBalance"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors duration-300"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
      
      {/* Accounts List */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Your Accounts</h3>
        </div>
        
        {accounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-background-secondary border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Account ID
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="py-3 px-6 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map(account => (
                  <tr key={account.id} className="hover:bg-background-secondary transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-medium text-text-primary">{account.name}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">{account.id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-semibold text-text-primary">${account.balance.toFixed(2)}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">
                        {new Date(account.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <button
                        onClick={() => openModal(account.id, 'deposit')}
                        className="text-primary hover:text-primary-dark mr-3 transition-colors"
                      >
                        Deposit
                      </button>
                      <button
                        onClick={() => openModal(account.id, 'withdraw')}
                        className="text-primary hover:text-primary-dark mr-3 transition-colors"
                      >
                        Withdraw
                      </button>
                      <button
                        onClick={() => openModal(account.id, 'transfer')}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-text-tertiary">
            No accounts found. Create your first account above.
          </div>
        )}
      </div>
      
      {/* Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md slide-in">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {modalType === 'deposit' ? 'Deposit Funds' : 
                 modalType === 'withdraw' ? 'Withdraw Funds' : 
                 'Transfer Funds'}
              </h3>
            </div>
            
            <form onSubmit={handleTransaction} className="p-6">
              {error && (
                <div className="bg-error bg-opacity-10 border border-error text-error px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-text-secondary mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              
              {modalType === 'transfer' && (
                <div className="mb-4">
                  <label htmlFor="destinationAccount" className="block text-sm font-medium text-text-secondary mb-1">
                    Destination Account
                  </label>
                  <select
                    id="destinationAccount"
                    value={destinationAccount}
                    onChange={(e) => setDestinationAccount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select destination account</option>
                    {accounts
                      .filter(account => account.id !== selectedAccount)
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} (Balance: ${account.balance.toFixed(2)})
                        </option>
                      ))}
                  </select>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-text-secondary rounded-md transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors duration-300"
                >
                  {modalType === 'deposit' ? 'Deposit' : 
                   modalType === 'withdraw' ? 'Withdraw' : 
                   'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;