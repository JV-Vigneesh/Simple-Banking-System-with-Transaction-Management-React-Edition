import React, { useState, useEffect } from 'react';
import { useBanking } from '../context/BankingContext';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { 
    accounts, 
    transactions, 
    transactionLogs,
    systemStatus,
    currentlyProcessing,
    pendingTransactions
  } = useBanking();
  
  const [totalBalance, setTotalBalance] = useState(0);
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    failedTransactions: 0
  });
  
  useEffect(() => {
    // Calculate total balance across all accounts
    const total = accounts.reduce((sum, account) => sum + account.balance, 0);
    setTotalBalance(total);
    
    // Calculate other stats
    setStats({
      totalAccounts: accounts.length,
      totalTransactions: transactions.length,
      pendingTransactions: transactions.filter(tx => tx.status === 'pending').length,
      completedTransactions: transactions.filter(tx => tx.status === 'completed').length,
      failedTransactions: transactions.filter(tx => tx.status === 'failed').length
    });
  }, [accounts, transactions]);
  
  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
  
  // Recent logs (last 5)
  const recentLogs = [...transactionLogs]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="container mx-auto fade-in">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {/* System Status */}
      <div className="bg-white p-4 rounded-lg shadow-card mb-6">
        <h3 className="text-lg font-semibold mb-3">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background-secondary p-4 rounded-md">
            <p className="text-text-secondary">Current Status</p>
            <div className="flex items-center mt-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                systemStatus === 'online' ? 'bg-secondary' : 
                systemStatus === 'crashed' ? 'bg-error' : 
                'bg-warning'
              }`}></div>
              <p className="font-semibold">{systemStatus.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="bg-background-secondary p-4 rounded-md">
            <p className="text-text-secondary">Processing Transaction</p>
            <p className="font-semibold mt-2">
              {currentlyProcessing ? (
                <span className="text-primary">Transaction in progress</span>
              ) : (
                <span className="text-text-tertiary">None</span>
              )}
            </p>
          </div>
          
          <div className="bg-background-secondary p-4 rounded-md">
            <p className="text-text-secondary">Pending Transactions</p>
            <p className="font-semibold mt-2">{pendingTransactions.length}</p>
          </div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-card">
          <h3 className="text-text-secondary text-sm">Total Balance</h3>
          <p className="text-2xl font-bold text-primary mt-2">${totalBalance.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-card">
          <h3 className="text-text-secondary text-sm">Total Accounts</h3>
          <p className="text-2xl font-bold text-primary mt-2">{stats.totalAccounts}</p>
          <Link to="/accounts" className="text-primary-light text-sm hover:underline mt-2 inline-block">
            View All Accounts
          </Link>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-card">
          <h3 className="text-text-secondary text-sm">Total Transactions</h3>
          <p className="text-2xl font-bold text-primary mt-2">{stats.totalTransactions}</p>
          <div className="flex space-x-2 mt-2 text-sm">
            <span className="text-secondary">{stats.completedTransactions} completed</span>
            <span>•</span>
            <span className="text-warning">{stats.pendingTransactions} pending</span>
            <span>•</span>
            <span className="text-error">{stats.failedTransactions} failed</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-card">
          <h3 className="text-text-secondary text-sm">System Logs</h3>
          <p className="text-2xl font-bold text-primary mt-2">{transactionLogs.length}</p>
          <Link to="/logs" className="text-primary-light text-sm hover:underline mt-2 inline-block">
            View All Logs
          </Link>
        </div>
      </div>
      
      {/* Recent Transactions and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Link to="/transactions" className="text-primary-light text-sm hover:underline">
              View All
            </Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map(tx => {
                const account = accounts.find(a => 
                  a.id === tx.accountId || 
                  a.id === tx.sourceAccountId || 
                  a.id === tx.destinationAccountId
                );
                
                return (
                  <div key={tx.id} className="flex justify-between p-2 hover:bg-background-secondary rounded-md transition-colors">
                    <div>
                      <p className="font-medium">
                        {tx.type} {tx.type === 'TRANSFER' ? 'to ' + (accounts.find(a => a.id === tx.destinationAccountId)?.name || 'Unknown') : ''}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {account ? account.name : 'Unknown Account'} • {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`font-medium ${
                        tx.type === 'DEPOSIT' ? 'text-secondary' : 
                        tx.type === 'WITHDRAWAL' ? 'text-error' : 
                        'text-primary'
                      }`}>
                        {tx.type === 'DEPOSIT' ? '+' : tx.type === 'WITHDRAWAL' ? '-' : ''} 
                        ${tx.amount.toFixed(2)}
                      </span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        tx.status === 'completed' ? 'bg-secondary bg-opacity-20 text-secondary' : 
                        tx.status === 'failed' ? 'bg-error bg-opacity-20 text-error' : 
                        'bg-warning bg-opacity-20 text-warning'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-tertiary py-4 text-center">No transactions yet</p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Activity Logs</h3>
            <Link to="/logs" className="text-primary-light text-sm hover:underline">
              View All
            </Link>
          </div>
          
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div key={log.id} className="flex justify-between p-2 hover:bg-background-secondary rounded-md transition-colors">
                  <div>
                    <p className="font-medium">{log.type}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      log.status === 'completed' || log.status === 'success' ? 'bg-secondary bg-opacity-20 text-secondary' : 
                      log.status === 'error' ? 'bg-error bg-opacity-20 text-error' : 
                      log.status === 'warning' ? 'bg-warning bg-opacity-20 text-warning' : 
                      'bg-primary bg-opacity-20 text-primary'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-tertiary py-4 text-center">No activity logs yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;