import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Tracker from './components/Tracker';
import Calculator from './components/Calculator';
import Analytics from './components/Analytics';
import Tools from './components/Tools';
import { Transaction, TransactionType, MarketRates, CalculatorData, UserProfile, BackupData } from './types';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Settings } from 'lucide-react';

// Firebase Imports
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';

// --- INITIAL DATA & CONSTANTS ---
const INITIAL_DATA: Transaction[] = [
  { id: '1', date: '2024-09-15', description: 'Salary', amount: 18000, type: TransactionType.INCOME, category: 'Salary', currency: 'THB' },
  { id: '2', date: '2024-09-16', description: 'Housing Savings', amount: 15000, type: TransactionType.SAVING, category: 'Investment', currency: 'THB' },
  { id: '3', date: '2024-09-20', description: 'Food & Dining', amount: 3700, type: TransactionType.EXPENSE, category: 'Food', currency: 'THB' },
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

// Keys for Guest Mode (LocalStorage)
const KEY_THEME = 'theme';
const KEY_GUEST_TRANSACTIONS = 'shwebudget_guest_transactions';
const KEY_GUEST_RATES = 'shwebudget_guest_rates';
const KEY_GUEST_CALC = 'shwebudget_guest_calc';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- THEME ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(KEY_THEME);
    return saved === 'dark';
  });

  // --- AUTH STATE (Firebase) ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // --- DATA STATES ---
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_DATA);
  const [marketRates, setMarketRates] = useState<MarketRates>(INITIAL_RATES);
  const [calculatorData, setCalculatorData] = useState<CalculatorData>(INITIAL_CALCULATOR_DATA);

  // 1. Auth Listener
  useEffect(() => {
    if (!auth) {
        // If Firebase isn't configured, stop loading auth and stay in guest mode
        setIsAuthLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
        });
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Loading Logic (Cloud vs Local)
  useEffect(() => {
    if (isAuthLoading) return;

    if (user && db) {
        // --- CLOUD MODE: Firestore Listeners ---
        
        // A. Settings (Rates & Calculator)
        const settingsRef = doc(db, 'users', user.id, 'settings', 'config');
        const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.rates) setMarketRates(data.rates);
            if (data.calculator) setCalculatorData(data.calculator);
          } else {
            // Initialize User Data if empty
            setDoc(settingsRef, { rates: INITIAL_RATES, calculator: INITIAL_CALCULATOR_DATA }, { merge: true });
          }
        });

        // B. Transactions
        const transRef = collection(db, 'users', user.id, 'transactions');
        const unsubTrans = onSnapshot(transRef, (snapshot) => {
             const tData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
             // Sort by date desc
             tData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
             setTransactions(tData);
        });

        return () => {
            unsubSettings();
            unsubTrans();
        };

    } else {
        // --- GUEST MODE: LocalStorage ---
        const savedT = localStorage.getItem(KEY_GUEST_TRANSACTIONS);
        const savedR = localStorage.getItem(KEY_GUEST_RATES);
        const savedC = localStorage.getItem(KEY_GUEST_CALC);

        setTransactions(savedT ? JSON.parse(savedT) : INITIAL_DATA);
        setMarketRates(savedR ? JSON.parse(savedR) : INITIAL_RATES);
        setCalculatorData(savedC ? JSON.parse(savedC) : INITIAL_CALCULATOR_DATA);
    }
  }, [user, isAuthLoading]);

  // 3. Save Data (Only for Guest Mode - Cloud saves instantly on action)
  useEffect(() => {
      if (!user) {
          localStorage.setItem(KEY_GUEST_TRANSACTIONS, JSON.stringify(transactions));
      }
  }, [transactions, user]);

  useEffect(() => {
    if (!user) {
        localStorage.setItem(KEY_GUEST_RATES, JSON.stringify(marketRates));
    }
  }, [marketRates, user]);

  useEffect(() => {
    if (!user) {
        localStorage.setItem(KEY_GUEST_CALC, JSON.stringify(calculatorData));
    }
  }, [calculatorData, user]);


  // --- ACTIONS ---

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem(KEY_THEME, newTheme ? 'dark' : 'light');
    if (newTheme) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };
  
  // Theme Init
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);


  // AUTH ACTIONS
  const handleLogin = async () => {
    if (!auth || !googleProvider) {
        alert("Firebase Configuration Missing.\nPlease set up 'firebase.ts' with your API keys to enable Google Login.");
        return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/configuration-not-found' || error.code === 'auth/api-key-not-valid') {
          alert("Login Failed: Invalid Firebase Configuration. Please check your API Keys.");
      } else if (error.code === 'auth/popup-closed-by-user') {
          // Ignore user closing popup
      } else {
          alert("Login failed. Check console for details.");
      }
    }
  };

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
        setActiveTab('dashboard');
        window.location.reload(); // Refresh to ensure clean state switch to Guest
    }
  };


  // DATA ACTIONS
  const addTransaction = async (t: Transaction) => {
      if (user && db) {
          const { id, ...data } = t; 
          await addDoc(collection(db, 'users', user.id, 'transactions'), data);
      } else {
          setTransactions(prev => [...prev, t]);
      }
  };

  const deleteTransaction = async (id: string) => {
      if (user && db) {
          await deleteDoc(doc(db, 'users', user.id, 'transactions', id));
      } else {
          setTransactions(prev => prev.filter(item => item.id !== id));
      }
  };

  const updateRates = async (newRates: MarketRates) => {
      setMarketRates(newRates); // Optimistic Update
      if (user && db) {
          const ref = doc(db, 'users', user.id, 'settings', 'config');
          await setDoc(ref, { rates: newRates }, { merge: true });
      }
  };

  const updateCalculatorData = async (newData: CalculatorData) => {
      setCalculatorData(newData); // Optimistic Update
      if (user && db) {
          const ref = doc(db, 'users', user.id, 'settings', 'config');
          await setDoc(ref, { calculator: newData }, { merge: true });
      }
  };


  // BACKUP ACTIONS
  const handleExportData = () => {
    const data: BackupData = {
      profile: user || { id: 'guest', name: 'Guest', createdAt: new Date().toISOString() },
      transactions,
      rates: marketRates,
      calculator: calculatorData,
      budgets: [],
      recurring: [],
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ShweBudget_${user ? user.name : 'Guest'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target?.result as string) as BackupData;
            if (json.transactions && json.rates) {
                 if(confirm(`Restore data? This will OVERWRITE current data.`)) {
                     
                     if (user && db) {
                        alert("Restoring to Cloud... This may take a few seconds.");
                        const batch = writeBatch(db);
                        const settingsRef = doc(db, 'users', user.id, 'settings', 'config');
                        batch.set(settingsRef, { rates: json.rates, calculator: json.calculator || INITIAL_CALCULATOR_DATA });
                        await batch.commit();

                        // Add Transactions (Simple loop)
                        for (const t of json.transactions) {
                             const { id, ...tData } = t;
                             await addDoc(collection(db, 'users', user.id, 'transactions'), tData);
                        }
                        alert("Cloud restore complete.");
                     } else {
                        // Guest Restore
                        setTransactions(json.transactions);
                        setMarketRates(json.rates);
                        if(json.calculator) setCalculatorData(json.calculator);
                        alert('Data restored successfully!');
                     }
                 }
            } else {
                alert('Invalid backup file.');
            }
        } catch (err) {
            alert('Error parsing backup file.');
        }
    };
    reader.readAsText(file);
  };

  // SUMMARY CALCULATION
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

  // --- RENDER ---
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
    // Do not show loading for Auth if in Guest mode
    if (isAuthLoading && auth) return <div className="h-full flex items-center justify-center text-[#D4AF37] animate-pulse">Connecting...</div>;

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
                        Current available wealth
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
                    <p className="text-xs text-gray-400">Rates & Backup</p>
                </div>
             </div>

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
        return <Calculator rates={marketRates} data={calculatorData} onUpdate={updateCalculatorData} />;
      case 'analytics':
        return <Analytics transactions={transactions} rates={marketRates} />;
      case 'tools':
        return <Tools 
          rates={marketRates} 
          updateRates={updateRates} 
          onExportData={handleExportData}
          onImportData={handleImportData}
        />;
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isDarkMode={isDarkMode} 
      toggleTheme={toggleTheme}
      user={user}
      onLogin={handleLogin}
      onLogout={handleLogout}
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E2A38] dark:text-white tracking-tight transition-colors">
          {activeTab === 'dashboard' && (user ? `Hello, ${user.name}` : 'Dashboard (Guest Mode)')}
          {activeTab === 'tools' && 'Tools & Settings'}
          {activeTab === 'tracker' && 'Income & Expenses'}
          {activeTab === 'calculator' && 'Financial Calculators'}
          {activeTab === 'analytics' && 'Financial Analytics'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium text-sm md:text-base transition-colors">
          {user ? <span className="text-green-500 font-bold">● Cloud Sync Active</span> : 'Guest Mode (Local Storage)'}
          {' | '}{activeTab === 'dashboard' && 'Welcome to your premium dashboard.'}
          {activeTab === 'tools' && 'Manage rates, gold prices and backup.'}
          {activeTab === 'tracker' && 'Track transactions in multiple currencies.'}
          {activeTab === 'calculator' && 'Advanced financial planning tools.'}
        </p>
      </div>
      {renderContent()}
    </Layout>
  );
};

export default App;