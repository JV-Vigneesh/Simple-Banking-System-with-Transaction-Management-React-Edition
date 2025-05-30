import React from 'react';
import { useBanking } from '../context/BankingContext';

function Header() {
  const { systemStatus, recoverSystem } = useBanking();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-secondary text-white';
      case 'crashed':
        return 'bg-error animate-pulse text-white';
      case 'recovering':
        return 'bg-warning text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'System Online';
      case 'crashed':
        return 'System Crashed';
      case 'recovering':
        return 'System Recovering';
      default:
        return 'Status Unknown';
    }
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-semibold">
            Banking System
            <span className="text-sm ml-2 text-primary-light">v1.0</span>
          </h1>
        </div>
        
        <div className="flex items-center">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus)}`}>
            {getStatusText(systemStatus)}
          </div>
          
          {systemStatus === 'crashed' && (
            <button
              onClick={recoverSystem}
              className="ml-4 px-4 py-1 bg-secondary hover:bg-secondary-dark text-white rounded-md transition-colors duration-300 text-sm"
            >
              Recover System
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;