import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Initial state
const initialState = {
  accounts: [],
  transactions: [],
  transactionLogs: [],
  currentlyProcessing: null,
  systemStatus: 'online', // 'online', 'crashed', 'recovering'
  pendingTransactions: [],
  deductedAmounts: [] // Track deducted amounts for crash recovery
};

// Load state from localStorage
const loadState = () => {
  try {
    const savedState = localStorage.getItem('bankingState');
    if (savedState === null) {
      return initialState;
    }
    return JSON.parse(savedState);
  } catch (error) {
    console.error('Error loading state:', error);
    return initialState;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    localStorage.setItem('bankingState', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

// Store timeouts globally so they can be cleared on crash
const transactionTimeouts = new Map();

// Action types
const ActionTypes = {
  CREATE_ACCOUNT: 'CREATE_ACCOUNT',
  UPDATE_BALANCE: 'UPDATE_BALANCE',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  ADD_TRANSACTION_LOG: 'ADD_TRANSACTION_LOG',
  SET_PROCESSING: 'SET_PROCESSING',
  SET_SYSTEM_STATUS: 'SET_SYSTEM_STATUS',
  CRASH_SYSTEM: 'CRASH_SYSTEM',
  RECOVER_SYSTEM: 'RECOVER_SYSTEM',
  ADD_PENDING_TRANSACTION: 'ADD_PENDING_TRANSACTION',
  CLEAR_PENDING_TRANSACTION: 'CLEAR_PENDING_TRANSACTION',
  ADD_DEDUCTED_AMOUNT: 'ADD_DEDUCTED_AMOUNT',
  CLEAR_DEDUCTED_AMOUNT: 'CLEAR_DEDUCTED_AMOUNT',
  RESET: 'RESET'
};

// Reducer function
const bankingReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.CREATE_ACCOUNT:
      return {
        ...state,
        accounts: [...state.accounts, action.payload]
      };
    
    case ActionTypes.UPDATE_BALANCE:
      return {
        ...state,
        accounts: state.accounts.map(account => 
          account.id === action.payload.id 
            ? { ...account, balance: action.payload.balance } 
            : account
        )
      };
    
    case ActionTypes.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };

    case ActionTypes.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.id
            ? { ...tx, ...action.payload }
            : tx
        )
      };
    
    case ActionTypes.ADD_TRANSACTION_LOG:
      return {
        ...state,
        transactionLogs: [...state.transactionLogs, action.payload]
      };
    
    case ActionTypes.SET_PROCESSING:
      return {
        ...state,
        currentlyProcessing: action.payload
      };
    
    case ActionTypes.SET_SYSTEM_STATUS:
      return {
        ...state,
        systemStatus: action.payload
      };
    
    case ActionTypes.CRASH_SYSTEM:
      return {
        ...state,
        systemStatus: 'crashed',
        currentlyProcessing: null
      };
    
    case ActionTypes.RECOVER_SYSTEM:
      return {
        ...state,
        systemStatus: 'online',
        deductedAmounts: [] // Clear deducted amounts after recovery
      };
    
    case ActionTypes.ADD_PENDING_TRANSACTION:
      return {
        ...state,
        pendingTransactions: [...state.pendingTransactions, action.payload]
      };
    
    case ActionTypes.CLEAR_PENDING_TRANSACTION:
      return {
        ...state,
        pendingTransactions: state.pendingTransactions.filter(
          tx => tx.id !== action.payload
        )
      };

    case ActionTypes.ADD_DEDUCTED_AMOUNT:
      return {
        ...state,
        deductedAmounts: [...state.deductedAmounts, action.payload]
      };

    case ActionTypes.CLEAR_DEDUCTED_AMOUNT:
      return {
        ...state,
        deductedAmounts: state.deductedAmounts.filter(
          da => da.transactionId !== action.payload
        )
      };
    
    case ActionTypes.RESET:
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const BankingContext = createContext();

// Provider component
export const BankingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bankingReducer, loadState());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Clear all timeouts for a transaction
  const clearTransactionTimeouts = (transactionId) => {
    const timeouts = transactionTimeouts.get(transactionId);
    if (timeouts) {
      timeouts.forEach(clearTimeout);
      transactionTimeouts.delete(transactionId);
    }
  };

  // Add deducted amount
  const addDeductedAmount = (deductedAmount) => {
    dispatch({ type: ActionTypes.ADD_DEDUCTED_AMOUNT, payload: deductedAmount });
  };

  // Clear deducted amount
  const clearDeductedAmount = (transactionId) => {
    dispatch({ type: ActionTypes.CLEAR_DEDUCTED_AMOUNT, payload: transactionId });
  };

  // Create a new account
  const createAccount = (name, initialBalance = 0) => {
    const account = {
      id: uuidv4(),
      name,
      balance: initialBalance,
      createdAt: new Date().toISOString()
    };
    
    dispatch({ type: ActionTypes.CREATE_ACCOUNT, payload: account });
    
    addTransactionLog({
      type: 'ACCOUNT_CREATED',
      accountId: account.id,
      details: `Account ${name} created with initial balance of $${initialBalance}`,
      status: 'completed'
    });
    
    return account;
  };

  // Update account balance
  const updateBalance = (accountId, newBalance) => {
    dispatch({ 
      type: ActionTypes.UPDATE_BALANCE, 
      payload: { id: accountId, balance: newBalance } 
    });
  };

  // Add a transaction
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: transaction.id || uuidv4(),
      timestamp: transaction.timestamp || new Date().toISOString()
    };
    
    dispatch({ type: ActionTypes.ADD_TRANSACTION, payload: newTransaction });
    return newTransaction;
  };

  // Update a transaction
  const updateTransaction = (transactionId, updates) => {
    dispatch({
      type: ActionTypes.UPDATE_TRANSACTION,
      payload: { id: transactionId, ...updates }
    });
  };

  // Add a transaction log entry
  const addTransactionLog = (log) => {
    const newLog = {
      ...log,
      id: log.id || uuidv4(),
      timestamp: log.timestamp || new Date().toISOString()
    };
    
    dispatch({ type: ActionTypes.ADD_TRANSACTION_LOG, payload: newLog });
    return newLog;
  };

  // Set the currently processing transaction
  const setProcessing = (transactionId) => {
    dispatch({ type: ActionTypes.SET_PROCESSING, payload: transactionId });
  };

  // Set system status
  const setSystemStatus = (status) => {
    dispatch({ type: ActionTypes.SET_SYSTEM_STATUS, payload: status });
  };

  // Process a deposit
  const processDeposit = (accountId, amount) => {
    if (state.systemStatus !== 'online') {
      addTransactionLog({
        type: 'DEPOSIT_REJECTED',
        accountId,
        amount,
        details: `Deposit rejected: System is ${state.systemStatus}`,
        status: 'error'
      });
      return { success: false, error: `System is ${state.systemStatus}` };
    }

    const account = state.accounts.find(a => a.id === accountId);
    
    if (!account) {
      addTransactionLog({
        type: 'DEPOSIT_REJECTED',
        accountId,
        amount,
        details: 'Deposit rejected: Account not found',
        status: 'error'
      });
      return { success: false, error: 'Account not found' };
    }

    const transaction = {
      id: uuidv4(),
      type: 'DEPOSIT',
      accountId,
      amount,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    setProcessing(transaction.id);
    addTransaction(transaction);
    addPendingTransaction(transaction);

    addTransactionLog({
      type: 'DEPOSIT_STARTED',
      accountId,
      transactionId: transaction.id,
      amount,
      details: `Starting deposit of $${amount} to account ${accountId}`,
      status: 'pending'
    });

    const timeoutId = setTimeout(() => {
      if (state.systemStatus === 'online') {
        const newBalance = account.balance + amount;
        updateBalance(accountId, newBalance);

        updateTransaction(transaction.id, { status: 'completed' });

        addTransactionLog({
          type: 'DEPOSIT_COMPLETED',
          accountId,
          transactionId: transaction.id,
          amount,
          details: `Successfully deposited $${amount} to account ${accountId}`,
          status: 'success'
        });

        clearPendingTransaction(transaction.id);
        setProcessing(null);
      }
    }, 2000);

    transactionTimeouts.set(transaction.id, [timeoutId]);

    return {
      success: true,
      transaction
    };
  };

  // Process a withdrawal
  const processWithdrawal = (accountId, amount) => {
    if (state.systemStatus !== 'online') {
      addTransactionLog({
        type: 'WITHDRAWAL_REJECTED',
        accountId,
        amount,
        details: `Withdrawal rejected: System is ${state.systemStatus}`,
        status: 'error'
      });
      return { success: false, error: `System is ${state.systemStatus}` };
    }

    const account = state.accounts.find(a => a.id === accountId);
    
    if (!account) {
      addTransactionLog({
        type: 'WITHDRAWAL_REJECTED',
        accountId,
        amount,
        details: 'Withdrawal rejected: Account not found',
        status: 'error'
      });
      return { success: false, error: 'Account not found' };
    }

    if (account.balance < amount) {
      addTransactionLog({
        type: 'WITHDRAWAL_REJECTED',
        accountId,
        amount,
        details: 'Withdrawal rejected: Insufficient funds',
        status: 'error'
      });
      return { success: false, error: 'Insufficient funds' };
    }

    const transaction = {
      id: uuidv4(),
      type: 'WITHDRAWAL',
      accountId,
      amount,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    setProcessing(transaction.id);
    addTransaction(transaction);
    addPendingTransaction(transaction);

    addTransactionLog({
      type: 'WITHDRAWAL_STARTED',
      accountId,
      transactionId: transaction.id,
      amount,
      details: `Starting withdrawal of $${amount} from account ${accountId}`,
      status: 'pending'
    });

    // Track the deducted amount
    addDeductedAmount({
      transactionId: transaction.id,
      sourceAccountId: accountId,
      amount
    });

    // Immediately deduct from account
    const newBalance = account.balance - amount;
    updateBalance(accountId, newBalance);

    const timeoutId = setTimeout(() => {
      if (state.systemStatus === 'online') {
        updateTransaction(transaction.id, { status: 'completed' });

        addTransactionLog({
          type: 'WITHDRAWAL_COMPLETED',
          accountId,
          transactionId: transaction.id,
          amount,
          details: `Successfully withdrew $${amount} from account ${accountId}`,
          status: 'success'
        });

        clearDeductedAmount(transaction.id);
        clearPendingTransaction(transaction.id);
        setProcessing(null);
      }
    }, 2000);

    transactionTimeouts.set(transaction.id, [timeoutId]);

    return {
      success: true,
      transaction
    };
  };

  // Simulate a system crash
  const crashSystem = () => {
    // Clear all pending transaction timeouts
    for (const [transactionId] of transactionTimeouts) {
      clearTransactionTimeouts(transactionId);
    }
    
    dispatch({ type: ActionTypes.CRASH_SYSTEM });
    
    addTransactionLog({
      type: 'SYSTEM_CRASH',
      details: 'System crashed during transaction processing',
      status: 'error'
    });
  };

  // Recover system from crash
  const recoverSystem = () => {
    // Process any pending transactions that weren't completed
    const pendingTxs = [...state.pendingTransactions];
    
    // Log recovery start
    addTransactionLog({
      type: 'RECOVERY_STARTED',
      details: `Recovery process started with ${pendingTxs.length} pending transactions`,
      status: 'info'
    });
    
    // First, mark the system as recovering
    dispatch({ type: ActionTypes.SET_SYSTEM_STATUS, payload: 'recovering' });
    
    // Process pending transactions
    pendingTxs.forEach(tx => {
      addTransactionLog({
        type: 'TRANSACTION_ROLLBACK',
        transactionId: tx.id,
        details: `Rolling back transaction ${tx.type} with ID ${tx.id}`,
        status: 'warning'
      });
      
      // Check if amount was deducted
      const deductedAmount = state.deductedAmounts.find(
        da => da.transactionId === tx.id
      );

      if (deductedAmount) {
        // If amount was deducted but transaction didn't complete,
        // return the money to the source account
        const sourceAccount = state.accounts.find(
          a => a.id === deductedAmount.sourceAccountId
        );

        if (sourceAccount) {
          updateBalance(
            deductedAmount.sourceAccountId, 
            sourceAccount.balance + deductedAmount.amount
          );

          addTransactionLog({
            type: `${tx.type}_ROLLBACK`,
            accountId: deductedAmount.sourceAccountId,
            transactionId: tx.id,
            amount: deductedAmount.amount,
            details: `Rolled back ${tx.type.toLowerCase()} of $${deductedAmount.amount}`,
            status: 'completed'
          });
        }

        clearDeductedAmount(tx.id);
      }
      
      updateTransaction(tx.id, { status: 'failed' });
      dispatch({ type: ActionTypes.CLEAR_PENDING_TRANSACTION, payload: tx.id });
    });
    
    // Mark the system as recovered
    dispatch({ type: ActionTypes.RECOVER_SYSTEM });
    
    addTransactionLog({
      type: 'RECOVERY_COMPLETED',
      details: 'System successfully recovered from crash',
      status: 'success'
    });
  };

  // Add pending transaction
  const addPendingTransaction = (transaction) => {
    dispatch({ type: ActionTypes.ADD_PENDING_TRANSACTION, payload: transaction });
  };

  // Clear pending transaction
  const clearPendingTransaction = (transactionId) => {
    dispatch({ type: ActionTypes.CLEAR_PENDING_TRANSACTION, payload: transactionId });
  };

  // Reset the system
  const resetSystem = () => {
    // Clear all timeouts
    for (const [transactionId] of transactionTimeouts) {
      clearTransactionTimeouts(transactionId);
    }
    
    dispatch({ type: ActionTypes.RESET });
    
    addTransactionLog({
      type: 'SYSTEM_RESET',
      details: 'System has been reset and all data cleared',
      status: 'info'
    });
  };

  // Process a transfer with transaction safety
  const processTransfer = (sourceAccountId, destinationAccountId, amount) => {
    if (state.systemStatus !== 'online') {
      addTransactionLog({
        type: 'TRANSFER_REJECTED',
        sourceAccountId,
        destinationAccountId,
        amount,
        details: `Transfer rejected: System is ${state.systemStatus}`,
        status: 'error'
      });
      return { success: false, error: `System is ${state.systemStatus}` };
    }
    
    const sourceAccount = state.accounts.find(a => a.id === sourceAccountId);
    const destinationAccount = state.accounts.find(a => a.id === destinationAccountId);
    
    if (!sourceAccount) {
      addTransactionLog({
        type: 'TRANSFER_REJECTED',
        sourceAccountId,
        destinationAccountId,
        amount,
        details: 'Transfer rejected: Source account not found',
        status: 'error'
      });
      return { success: false, error: 'Source account not found' };
    }
    
    if (!destinationAccount) {
      addTransactionLog({
        type: 'TRANSFER_REJECTED',
        sourceAccountId,
        destinationAccountId,
        amount,
        details: 'Transfer rejected: Destination account not found',
        status: 'error'
      });
      return { success: false, error: 'Destination account not found' };
    }
    
    if (sourceAccount.balance < amount) {
      addTransactionLog({
        type: 'TRANSFER_REJECTED',
        sourceAccountId,
        destinationAccountId,
        amount,
        details: 'Transfer rejected: Insufficient funds',
        status: 'error'
      });
      return { success: false, error: 'Insufficient funds' };
    }
    
    const transaction = {
      id: uuidv4(),
      type: 'TRANSFER',
      sourceAccountId,
      destinationAccountId,
      amount,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    setProcessing(transaction.id);
    addTransaction(transaction);
    addPendingTransaction(transaction);
    
    addTransactionLog({
      type: 'TRANSFER_STARTED',
      sourceAccountId,
      destinationAccountId,
      transactionId: transaction.id,
      amount,
      details: `Starting transfer of $${amount} from account ${sourceAccountId} to account ${destinationAccountId}`,
      status: 'pending'
    });
    
    // Immediately deduct from source account
    const newSourceBalance = sourceAccount.balance - amount;
    updateBalance(sourceAccountId, newSourceBalance);
    
    // Track the deducted amount
    addDeductedAmount({
      transactionId: transaction.id,
      sourceAccountId,
      amount
    });
    
    addTransactionLog({
      type: 'TRANSFER_SOURCE_DEBITED',
      sourceAccountId,
      destinationAccountId,
      transactionId: transaction.id,
      amount,
      details: `Debited $${amount} from source account ${sourceAccountId}`,
      status: 'pending'
    });
    
    const timeoutId = setTimeout(() => {
      if (state.systemStatus === 'online') {
        // Credit destination account
        const newDestBalance = destinationAccount.balance + amount;
        updateBalance(destinationAccountId, newDestBalance);
        
        updateTransaction(transaction.id, { status: 'completed' });
        
        addTransactionLog({
          type: 'TRANSFER_COMPLETED',
          sourceAccountId,
          destinationAccountId,
          transactionId: transaction.id,
          amount,
          details: `Successfully transferred $${amount} from account ${sourceAccountId} to account ${destinationAccountId}`,
          status: 'success'
        });
        
        clearPendingTransaction(transaction.id);
        clearDeductedAmount(transaction.id);
        setProcessing(null);
      }
    }, 2000);
    
    transactionTimeouts.set(transaction.id, [timeoutId]);
    
    return {
      success: true,
      transaction
    };
  };

  // Value object to be provided to consumers
  const value = {
    // State
    accounts: state.accounts,
    transactions: state.transactions,
    transactionLogs: state.transactionLogs,
    currentlyProcessing: state.currentlyProcessing,
    systemStatus: state.systemStatus,
    pendingTransactions: state.pendingTransactions,
    
    // Methods
    createAccount,
    updateBalance,
    addTransaction,
    addTransactionLog,
    setProcessing,
    setSystemStatus,
    crashSystem,
    recoverSystem,
    processDeposit,
    processWithdrawal,
    processTransfer,
    resetSystem
  };

  return (
    <BankingContext.Provider value={value}>
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (context === undefined) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};