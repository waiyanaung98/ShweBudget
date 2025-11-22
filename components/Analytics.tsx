import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Transaction, TransactionType, MarketRates } from '../types';
import { PieChart as PieIcon, Activity } from 'lucide-react';

interface AnalyticsProps {
  transactions: Transaction[];
  rates: MarketRates;
}

type Timeframe = 'daily' | 'monthly' | 'yearly';

// Updated Palette: Green for Income, Red for Expense, Gold for Net/Others
const COLORS = ['#D4AF37', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];
const INCOME_COLOR = '#10B981'; // Emerald 500
const EXPENSE_COLOR = '#EF4444'; // Red 500
const NET_COLOR = '#D4AF37'; // Gold

const Analytics: React.FC<AnalyticsProps> = ({ transactions, rates }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Helper: Convert any amount to MMK based on global rates
  const toMMK = (amount: number, currency: string) => {
    if (currency === 'THB') return amount * rates.THB;
    if (currency === 'USD') return amount * rates.USD;
    if (currency === 'SGD') return amount * rates.SGD;
    return amount;
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>(transactions.map(t => new Date(t.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const chartData = useMemo(() => {
    const data: Record<string, any> = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      
      if (timeframe !== 'yearly' && year !== selectedYear) return;

      let key = '';
      let label = '';

      if (timeframe === 'daily') {
        key = t.date; 
        label = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (timeframe === 'monthly') {
        key = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        label = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      } else {
        key = year.toString();
        label = year.toString();
      }

      const amountMMK = toMMK(t.amount, t.currency);

      if (!data[key]) {
        data[key] = { name: label, fullDate: key, Income: 0, Expense: 0, Saving: 0, Net: 0 };
      }

      if (t.type === TransactionType.INCOME) {
          data[key].Income += amountMMK;
          data[key].Net += amountMMK;
      }
      else if (t.type === TransactionType.EXPENSE) {
          data[key].Expense += amountMMK;
          data[key].Net -= amountMMK;
      }
      else if (t.type === TransactionType.SAVING) {
          data[key].Saving += amountMMK;
          // Savings don't reduce Net Wealth in this calculation, they are retained assets.
      }
    });

    return Object.values(data).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [transactions, timeframe, selectedYear, rates]);

  // Category Data for Pie Chart
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .filter(t => timeframe === 'yearly' || new Date(t.date).getFullYear() === selectedYear)
      .forEach(t => {
        const amountMMK = toMMK(t.amount, t.currency);
        catMap[t.category] = (catMap[t.category] || 0) + amountMMK;
      });
    
    return Object.keys(catMap).map(name => ({ name, value: catMap[name] }));
  }, [transactions, timeframe, selectedYear, rates]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { notation: "compact" }).format(val);

  return (
    <div className="space-y-8 animate-fade-in w-full">
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-gray-200 dark:border-gray-800 gap-4 transition-colors duration-300">
         <h2 className="text-lg font-bold text-[#1E2A38] dark:text-[#FCD34D] flex items-center gap-2">
            <Activity size={20} className="text-[#D4AF37]"/>
            Analytics Dashboard
         </h2>
         <div className="flex gap-3">
            {timeframe !== 'yearly' && (
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="pl-4 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {(['daily', 'monthly', 'yearly'] as Timeframe[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${
                    timeframe === t
                      ? 'bg-white dark:bg-gray-600 text-[#1E2A38] dark:text-white shadow-sm border border-gray-200 dark:border-gray-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
         </div>
      </div>

      {/* 1. Income vs Expense Bar Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-lg border border-[#D4AF37]/20 transition-colors duration-300 relative overflow-hidden">
             {/* Glow Effect */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             
             <div className="mb-6 relative z-10">
                <h3 className="font-bold text-[#1E2A38] dark:text-white">Cash Flow (Income vs Expense)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Green = Income, Red = Expense</p>
             </div>
             <div className="h-[300px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af'}} tickFormatter={formatCurrency} />
                      <Tooltip 
                         cursor={{fill: 'rgba(255,255,255,0.05)'}}
                         contentStyle={{borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: '#0F172A', color: '#fff'}}
                         itemStyle={{color: '#fff'}}
                         formatter={(value: number) => new Intl.NumberFormat('en-US').format(Math.round(value))}
                      />
                      <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                      <Bar dataKey="Income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} name="Income (ဝင်ငွေ)" barSize={20} />
                      <Bar dataKey="Expense" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} name="Expense (ထွက်ငွေ)" barSize={20} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* 2. Net Balance Trend */}
          <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-lg border border-[#D4AF37]/20 transition-colors duration-300 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             
             <div className="mb-6 relative z-10">
                <h3 className="font-bold text-[#1E2A38] dark:text-white">Net Wealth Growth</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Savings Accumulation</p>
             </div>
             <div className="h-[300px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af'}} tickFormatter={formatCurrency} />
                      <Tooltip 
                         contentStyle={{borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: '#0F172A', color: '#fff'}}
                         itemStyle={{color: '#fff'}}
                         formatter={(value: number) => new Intl.NumberFormat('en-US').format(Math.round(value))}
                      />
                      <Legend iconType="plainline" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                      <Line type="monotone" dataKey="Net" stroke={NET_COLOR} strokeWidth={3} dot={{r: 4, fill: NET_COLOR, strokeWidth: 0}} name="Net Saved (စုမိသောငွေ)" activeDot={{r: 6, stroke: '#fff', strokeWidth: 2}} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
      </div>

      {/* 3. Expense Breakdown */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-lg border border-[#D4AF37]/20 transition-colors duration-300">
         <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="font-bold text-[#1E2A38] dark:text-white">Expense Breakdown</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Where are you spending the most?</p>
            </div>
            <PieIcon className="text-gray-300 dark:text-gray-600" />
         </div>
         
         <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="h-[300px] w-full md:w-1/2">
               {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#0F172A', color: '#fff'}}
                            itemStyle={{color: '#fff'}}
                            formatter={(value: number) => new Intl.NumberFormat('en-US').format(Math.round(value)) + ' MMK'} 
                        />
                    </PieChart>
                </ResponsiveContainer>
               ) : (
                   <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">No expenses yet</div>
               )}
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoryData.sort((a,b) => b.value - a.value).map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{cat.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(cat.value)}</span>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;