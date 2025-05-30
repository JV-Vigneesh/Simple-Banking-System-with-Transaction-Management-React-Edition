import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';

function SimulateCrash() {
  const { 
    systemStatus, 
    accounts, 
    crashSystem, 
    recoverSystem, 
    resetSystem,
    processDeposit,
    processWithdrawal,
    processTransfer,
    pendingTransactions
  } = useBanking();
  
  const [selectedAccount, setSelectedAccount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [amount, setAmount] = useState(100);
  const [transactionType, setTransactionType] = useState('deposit');
  const [crashAfter, setCrashAfter] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleSimulateCrash = async () => {
    if (!selectedAccount) {
      setResult({
        success: false,
        message: 'Please select an account'
      });
      return;
    }
    
    if (transactionType === 'transfer' && !destinationAccount) {
      setResult({
        success: false,
        message: 'Please select a destination account'
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    let transactionResult;
    
    // Process the selected transaction type
    if (transactionType === 'deposit') {
      transactionResult = processDeposit(selectedAccount, parseFloat(amount));
    } else if (transactionType === 'withdrawal') {
      transactionResult = processWithdrawal(selectedAccount, parseFloat(amount));
    } else if (transactionType === 'transfer') {
      transactionResult = processTransfer(selectedAccount, destinationAccount, parseFloat(amount));
    }
    
    if (!transactionResult.success) {
      setResult({
        success: false,
        message: `Transaction failed: ${transactionResult.error}`
      });
      setIsLoading(false);
      return;
    }
    
    // After transaction is started, set timeout to crash the system
    setTimeout(() => {
      crashSystem();
      
      setResult({
        success: true,
        message: 'System crashed during transaction processing!'
      });
      
      setIsLoading(false);
    }, crashAfter);
  };
  
  return (
    <div className="container mx-auto fade-in">
      <h2 className="text-2xl font-bold mb-6">Simulate System Crash</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Control Panel */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-semibold mb-4">Crash Simulation</h3>
          
          <div className="mb-4">
            <p className="text-text-secondary mb-4">
              This panel lets you simulate a system crash during a transaction to demonstrate 
              recovery mechanisms. The system will start a transaction and then crash at the 
              specified time, allowing you to see how the system recovers when restarted.
            </p>
            
            {result && (
              <div className={`p-4 rounded-md mb-4 ${
                result.success ? 'bg-warning bg-opacity-10 border border-warning' : 'bg-error bg-opacity-10 border border-error'
              }`}>
                <p className={result.success ? 'text-warning-dark' : 'text-error'}>
                  {result.message}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={isLoading || systemStatus !== 'online'}
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            
            {/* Source Account */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Source Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={isLoading || systemStatus !== 'online'}
              >
                <option value="">Select an account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} (Balance: ${account.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Destination Account (for transfers only) */}
            {transactionType === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Destination Account
                </label>
                <select
                  value={destinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={isLoading || systemStatus !== 'online'}
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
            
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="1"
                step="0.01"
                disabled={isLoading || systemStatus !== 'online'}
              />
            </div>
            
            {/* Crash After (ms) */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Crash After (milliseconds)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  value={crashAfter}
                  onChange={(e) => setCrashAfter(parseInt(e.target.value))}
                  className="w-full"
                  min="500"
                  max="5000"
                  step="500"
                  disabled={isLoading || systemStatus !== 'online'}
                />
                <span className="ml-2 text-sm font-medium w-16">{crashAfter}ms</span>
              </div>
              <p className="text-sm text-text-tertiary mt-1">
                This controls how long to wait before crashing the system after the transaction starts.
              </p>
            </div>
            
            {/* Actions */}
            <div className="pt-4 flex flex-col space-y-3">
              <button
                onClick={handleSimulateCrash}
                disabled={isLoading || systemStatus !== 'online' || !selectedAccount}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isLoading || systemStatus !== 'online' || !selectedAccount
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-warning hover:bg-warning-dark'
                }`}
              >
                {isLoading ? 'Processing...' : 'Simulate Crash During Transaction'}
              </button>
              
              {systemStatus === 'crashed' && (
                <button
                  onClick={recoverSystem}
                  className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-md font-medium"
                >
                  Recover System
                </button>
              )}
              
              <button
                onClick={resetSystem}
                className="px-4 py-2 bg-error hover:bg-error-dark text-white rounded-md font-medium"
              >
                Reset System (Clear All Data)
              </button>
            </div>
          </div>
        </div>
        
        {/* System State & Visualization */}
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          
          <div className="mb-6">
            <div className={`p-4 rounded-md ${
              systemStatus === 'online' ? 'bg-secondary bg-opacity-10 border border-secondary' :
              systemStatus === 'crashed' ? 'bg-error bg-opacity-10 border border-error' :
              'bg-warning bg-opacity-10 border border-warning'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  systemStatus === 'online' ? 'bg-secondary' : 
                  systemStatus === 'crashed' ? 'bg-error pulse' : 
                  'bg-warning pulse'
                }`}></div>
                <span className={`font-semibold ${
                  systemStatus === 'online' ? 'text-secondary' : 
                  systemStatus === 'crashed' ? 'text-error' : 
                  'text-warning'
                }`}>
                  System is {systemStatus.toUpperCase()}
                </span>
              </div>
              
              <p className="mt-2 text-sm">
                {systemStatus === 'online' 
                  ? 'The system is running normally and ready to process transactions.' 
                  : systemStatus === 'crashed'
                  ? 'The system has crashed and requires recovery to continue operation. Use the "Recover System" button to start the recovery process.'
                  : 'The system is currently in recovery mode, rolling back incomplete transactions to restore data consistency.'}
              </p>
            </div>
          </div>
          
          {/* Pending Transactions */}
          <div>
            <h4 className="font-semibold mb-3">Pending Transactions</h4>
            
            {pendingTransactions.length > 0 ? (
              <div className="space-y-2">
                {pendingTransactions.map(tx => (
                  <div key={tx.id} className="p-3 bg-background-secondary rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{tx.type}</p>
                        <p className="text-sm text-text-secondary">
                          ID: {tx.id.slice(0, 8)}... • Amount: ${tx.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-text-secondary mt-1">
                          Stage: <span className="font-medium">{tx.stage}</span>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-warning bg-opacity-20 text-warning">
                        pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-tertiary text-center py-4">
                No pending transactions
              </p>
            )}
          </div>
          
          {/* Explanation */}
          <div className="mt-6 p-4 bg-background-secondary rounded-md">
            <h4 className="font-semibold mb-2">How Recovery Works</h4>
            <p className="text-sm text-text-secondary mb-2">
              When the system crashes during a transaction, it may leave the database in an inconsistent state.
              The recovery process:
            </p>
            <ol className="text-sm text-text-secondary list-decimal pl-5 space-y-1">
              <li>Identifies incomplete transactions from the transaction log</li>
              <li>Rolls back any partial changes to maintain ACID properties</li>
              <li>Restores the system to a consistent state</li>
              <li>Ensures no money is lost or duplicated during failures</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulateCrash;