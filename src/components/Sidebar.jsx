import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const links = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/accounts', label: 'Accounts', icon: '👤' },
    { to: '/transactions', label: 'Transactions', icon: '💸' },
    { to: '/logs', label: 'Transaction Logs', icon: '📋' },
    { to: '/simulate', label: 'Simulate Crash', icon: '⚠️' }
  ];

  return (
    <div className="h-screen w-16 md:w-64 bg-primary shadow-lg flex-shrink-0">
      <div className="p-4 text-white">
        <div className="hidden md:flex items-center justify-center mb-8 mt-2">
          <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="white" fillOpacity="0.2"/>
            <path d="M12 4L4 8L12 12L20 8L12 4Z" fill="white"/>
            <path d="M4 12L12 16L20 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 16L12 20L20 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-lg font-semibold">Banking</span>
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                      isActive 
                        ? 'bg-white bg-opacity-20 text-white' 
                        : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white'
                    }`
                  }
                >
                  <span className="mr-3">{link.icon}</span>
                  <span className="hidden md:block">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;