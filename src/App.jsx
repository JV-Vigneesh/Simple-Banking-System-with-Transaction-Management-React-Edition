import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import TransactionLogs from './pages/TransactionLogs';
import SimulateCrash from './pages/SimulateCrash';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="flex h-screen bg-background-secondary">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/logs" element={<TransactionLogs />} />
            <Route path="/simulate" element={<SimulateCrash />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;