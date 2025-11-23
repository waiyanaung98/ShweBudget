import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Tracker from './components/Tracker';
import Calculator from './components/Calculator';
import Analytics from './components/Analytics';
import Tools from './components/Tools';
import { Transaction, TransactionType, MarketRates, CalculatorData } from './types';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Settings } from 'lucide-react';

// Mock Initial Data
const INITIAL_DATA: Transaction[] = [
  { id: '1', date: '2024-09-15', description: 'Salary', amount: 18000, type: TransactionType.INCOME, category: 'Salary', currency: 'THB' },
  { id: '2', date: '2024-09-16', description: 'Housing Savings', amount: 15000, type: TransactionType.SAVING, category: 'Investment', currency: 'THB' },
  { id: '3', date: '2024-09-20', description: 'Food & Dining', amount: 3700, type: TransactionType.EXPENSE, category: 'Food', currency: 'THB' },
  { id: '4', date: '2024-10-01', description: 'Salary', amount: 18000, type: TransactionType.INCOME, category: 'Salary', currency: 'THB' },
  { id: '5', date: '2024-10-05', description: 'Monthly Saving', amount: 15000, type: TransactionType.SAVING, category: 'Investment', currency: 'THB' },
  { id: '6', date: '2024-10-12', description: 'Utilities', amount: 3700, type: TransactionType.EXPENSE, category: 'Housing', currency: 'THB' },
];

const INITIAL_RATES: MarketRates = {
  THB: 124,
  USD: 4500,
  SGD: 3300, 
  Gold: 6500000 
};

const INITIAL_CALCULATOR_DATA: CalculatorData = {
  targetAmount: 100000000,
  years: 4,
  interestRate: 8,
  monthlyDeposit: 500000,
  fvYears: 3,
  fvRate: 8,
  loanAmount: 30000000,
  loanTermYears: 5,
  loanRate: 10,
  monthlyExpense: 500000,
  fundMonths: 6
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Toggle class on document element for global tailwind support (optional but good practice)
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Sync theme on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // Market Rates State
  const [marketRates, setMarketRates] = useState<MarketRates>(() => {
    const saved = localStorage.getItem('marketRates');
    return saved ? JSON.parse(saved) : INITIAL_RATES;
  });

  // Calculator Data State (Persisted)
  const [calculatorData, setCalculatorData] = useState<CalculatorData>(() => {
    const saved = localStorage.getItem('calculatorData');
    return saved ? JSON.parse(saved) : INITIAL_CALCULATOR_DATA;
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('marketRates', JSON.stringify(marketRates));
  }, [marketRates]);

  useEffect(() => {
    localStorage.setItem('calculatorData', JSON.stringify(calculatorData));
  }, [calculatorData]);

  const addTransaction = (t: Transaction) => {
    setTransactions([...transactions, t]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Dashboard Summary Calculation (Normalized to MMK based on current rates)
  const calculateSummary = () => {
    let income = 0;
    let expense = 0;
    let saving = 0;

    transactions.forEach(t => {
        let val = t.amount;
        if (t.currency === 'THB') val = t.amount * marketRates.THB;
        if (t.currency === 'USD') val = t.amount * marketRates.USD;
        if (t.currency === 'SGD') val = t.amount * marketRates.SGD;
        
        if (t.type === TransactionType.INCOME) income += val;
        if (t.type === TransactionType.EXPENSE) expense += val;
        if (t.type === TransactionType.SAVING) saving += val;
    });

    return { income, expense, saving, balance: income - expense };
  };

  const summary = calculateSummary();

  const DashboardCard = ({ title, amount, icon: Icon, colorClass, bgClass, trend }: any) => (
    <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 transition-transform hover:-translate-y-1 duration-300 min-w-0">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon size={24} className={colorClass} />
        </div>
        {trend && (
             <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 px-2 py-1 rounded-full whitespace-nowrap">This Month</span>
        )}
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold tracking-wide uppercase truncate">{title}</p>
        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-2 break-all leading-none">
          {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(amount)} 
          <span className="text-sm text-gray-400 font-normal ml-1">MMK</span>
        </h3>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-fade-in w-full">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-[#0F172A] to-[#020617] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden xl:col-span-4 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#D4AF37]/30">
                   <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                   <div className="relative z-10 max-w-full">
                      <p className="text-[#94A3B8] text-sm font-bold uppercase tracking-wider mb-2">Total Net Balance</p>
                      <h3 className="text-4xl md:text-5xl font-bold bg-gold-text bg-clip-text text-transparent tracking-tight break-all drop-shadow-sm">
                        {new Intl.NumberFormat('en-US').format(summary.balance)} 
                        <span className="text-lg text-gray-400 font-normal ml-2">MMK</span>
                      </h3>
                      <p className="text-gray-400 mt-3 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] flex-shrink-0 animate-pulse"></span>
                        Current available wealth (Income - Expenses)
                      </p>
                   </div>
                   <div className="hidden md:block p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex-shrink-0">
                      <div className="flex gap-8 text-center">
                          <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">Income</p>
                              <p className="font-bold text-lg text-white break-all">{new Intl.NumberFormat('en-US', { notation: "compact" }).format(summary.income)}</p>
                          </div>
                          <div className="w-px bg-white/10"></div>
                          <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">Expenses</p>
                              <p className="font-bold text-lg text-white break-all">{new Intl.NumberFormat('en-US', { notation: "compact" }).format(summary.expense)}</p>
                          </div>
                      </div>
                   </div>
                </div>

                {/* Updated Income to Green (Emerald) */}
                <DashboardCard 
                  title="Total Income" 
                  amount={summary.income} 
                  icon={ArrowUpCircle} 
                  colorClass="text-emerald-500 dark:text-emerald-400" 
                  bgClass="bg-emerald-50 dark:bg-emerald-900/20"
                />
                <DashboardCard 
                  title="Total Savings" 
                  amount={summary.saving} 
                  icon={Wallet} 
                  colorClass="text-[#D4AF37] dark:text-[#FCD34D]" 
                  bgClass="bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20"
                />
                <DashboardCard 
                  title="Total Expenses" 
                  amount={summary.expense} 
                  icon={ArrowDownCircle} 
                  colorClass="text-red-600 dark:text-red-400" 
                  bgClass="bg-red-50 dark:bg-red-900/20"
                />
                <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center text-center group cursor-pointer hover:border-[#D4AF37] dark:hover:border-[#D4AF37] transition-all" onClick={() => setActiveTab('tools')}>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full group-hover:bg-gold-gradient transition-all mb-3 shadow-sm">
                        <Settings className="text-gray-400 dark:text-gray-300 group-hover:text-[#0F172A] transition-colors" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">App Settings</p>
                    <p className="text-xs text-gray-400">Rates & Converters</p>
                </div>
             </div>

             {/* Mini Analytics Preview */}
             <div className="bg-white dark:bg-[#0F172A] p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#1E2A38] dark:text-[#FCD34D]">Financial Overview</h3>
                    <button onClick={() => setActiveTab('analytics')} className="text-sm text-[#D4AF37] dark:text-[#FCD34D] font-bold hover:underline">View Full Report</button>
                </div>
                <Analytics transactions={transactions} rates={marketRates} />
             </div>
          </div>
        );
      case 'tracker':
        return <Tracker transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} />;
      case 'calculator':
        return <Calculator rates={marketRates} data={calculatorData} onUpdate={setCalculatorData} />;
      case 'analytics':
        return <Analytics transactions={transactions} rates={marketRates} />;
      case 'tools':
        return <Tools rates={marketRates} updateRates={setMarketRates} />;
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E2A38] dark:text-white tracking-tight transition-colors">
          {activeTab === 'dashboard' && 'Dashboard'}
          {activeTab === 'tools' && 'Tools & Settings'}
          {activeTab === 'tracker' && 'Income & Expenses'}
          {activeTab === 'calculator' && 'Financial Calculators'}
          {activeTab === 'analytics' && 'Financial Analytics'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium text-sm md:text-base transition-colors">
          {activeTab === 'dashboard' && 'Welcome back to your financial overview.'}
          {activeTab === 'tools' && 'Manage app exchange rates, calculate gold prices and conversions.'}
          {activeTab === 'tracker' && 'Track every kyat, baht, and dollar.'}
          {activeTab === 'calculator' && 'Plan your loans, savings, and safety nets.'}
          {activeTab === 'analytics' && 'Visualize your financial health over time.'}
        </p>
      </div>
      {renderContent()}
    </Layout>
  );
};

export default App;