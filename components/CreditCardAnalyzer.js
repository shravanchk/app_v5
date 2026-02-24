import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  Trash2, 
  Target,
  ShoppingCart,
  Coffee,
  Car,
  Gamepad2,
  Heart,
  GraduationCap,
  Plane,
  Calendar,
  PieChart,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Download,
  AlertCircle,
  Globe
} from 'lucide-react';
import HomeButton from './HomeButton';

const CreditCardAnalyzer = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Shopping',
    date: new Date().toISOString().split('T')[0]
  });
  const [budgets, setBudgets] = useState({
    'Shopping': 500,
    'Food': 400,
    'Transportation': 200,
    'Entertainment': 150,
    'Healthcare': 100,
    'Education': 200,
    'Travel': 300
  });
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});

  // Currency definitions
  const currencies = {
    'USD': { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    'EUR': { name: 'Euro', symbol: '€', flag: '🇪🇺' },
    'GBP': { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    'INR': { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    'CAD': { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    'AUD': { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    'JPY': { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    'CHF': { name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    'CNY': { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    'SGD': { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' }
  };

  const categories = [
    {
      name: 'Shopping',
      icon: ShoppingCart,
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      name: 'Food',
      icon: Coffee,
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      name: 'Transportation',
      icon: Car,
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      name: 'Entertainment',
      icon: Gamepad2,
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    },
    {
      name: 'Healthcare',
      icon: Heart,
      color: '#ef4444',
      bgColor: '#fee2e2'
    },
    {
      name: 'Education',
      icon: GraduationCap,
      color: '#06b6d4',
      bgColor: '#cffafe'
    },
    {
      name: 'Travel',
      icon: Plane,
      color: '#84cc16',
      bgColor: '#ecfccb'
    }
  ];

  // Load data from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem('creditCardExpenses');
    const savedBudgets = localStorage.getItem('creditCardBudgets');
    const savedCurrency = localStorage.getItem('selectedCurrency');
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        // Fallback exchange rates
        setExchangeRates({
          USD: 1,
          EUR: 0.85,
          GBP: 0.73,
          INR: 74.5,
          CAD: 1.25,
          AUD: 1.35,
          JPY: 110,
          CHF: 0.92,
          CNY: 6.45,
          SGD: 1.35
        });
      }
    };

    fetchExchangeRates();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('creditCardExpenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('creditCardBudgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  // Convert amount from source currency to target currency
  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    
    const usdAmount = fromCurrency === 'USD' ? amount : amount / (exchangeRates[fromCurrency] || 1);
    const convertedAmount = toCurrency === 'USD' ? usdAmount : usdAmount * (exchangeRates[toCurrency] || 1);
    
    return convertedAmount;
  };

  // Format currency display
  const formatCurrency = (amount, currency = selectedCurrency) => {
    const symbol = currencies[currency]?.symbol || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const addExpense = () => {
    if (newExpense.description && newExpense.amount && newExpense.category) {
      const expense = {
        id: Date.now(),
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        currency: selectedCurrency
      };
      
      setExpenses([...expenses, expense]);
      setNewExpense({
        description: '',
        amount: '',
        category: 'Shopping',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const getCategoryTotal = (category) => {
    return expenses
      .filter(exp => exp.category === category && exp.date.startsWith(selectedMonth))
      .reduce((total, exp) => {
        const convertedAmount = convertCurrency(exp.amount, exp.currency || 'USD', selectedCurrency);
        return total + convertedAmount;
      }, 0);
  };

  const getTotalSpending = () => {
    return expenses
      .filter(exp => exp.date.startsWith(selectedMonth))
      .reduce((total, exp) => {
        const convertedAmount = convertCurrency(exp.amount, exp.currency || 'USD', selectedCurrency);
        return total + convertedAmount;
      }, 0);
  };

  const getTotalBudget = () => {
    return Object.values(budgets).reduce((total, budget) => total + budget, 0);
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : ShoppingCart;
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#3b82f6';
  };

  const getCategoryBgColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.bgColor : '#dbeafe';
  };

  const changeCurrency = (newCurrency) => {
    setSelectedCurrency(newCurrency);
  };

  // Chart Components
  const PieChartComponent = ({ title, data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return null;

    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    const slices = data.map((item) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      currentAngle += angle;
      
      return {
        ...item,
        pathData,
        percentage: percentage.toFixed(1)
      };
    });

    return (
      <div className="chart-container">
        <h4 className="chart-title">
          <PieChart className="h-5 w-5" />
          {title}
        </h4>
        <div className="flex items-center justify-between">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {slices.map((slice, index) => (
              <path
                key={index}
                d={slice.pathData}
                fill={slice.color}
                stroke="#fff"
                strokeWidth="2"
              />
            ))}
          </svg>
          <div className="chart-legend ml-4">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: slice.color }}
                ></div>
                <span className="text-sm font-medium">{slice.name}</span>
                <span className="text-sm text-gray-600">{slice.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const BarChartComponent = ({ title, data }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(item => item.value));
    const barHeight = 30;
    const chartHeight = data.length * (barHeight + 10) + 20;

    return (
      <div className="chart-container">
        <h4 className="chart-title">
          <BarChart3 className="h-5 w-5" />
          {title}
        </h4>
        <svg width="100%" height={chartHeight} viewBox={`0 0 400 ${chartHeight}`}>
          {data.map((item, index) => {
            const barWidth = (item.value / maxValue) * 300;
            const y = index * (barHeight + 10) + 10;
            
            return (
              <g key={index}>
                <rect
                  x="80"
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color}
                  rx="4"
                />
                <text
                  x="75"
                  y={y + barHeight / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="#374151"
                >
                  {item.name}
                </text>
                <text
                  x={85 + barWidth}
                  y={y + barHeight / 2}
                  dominantBaseline="middle"
                  fontSize="11"
                  fill="#6b7280"
                >
                  {formatCurrency(item.value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const DonutChartComponent = ({ title, spent, budget }) => {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="chart-container">
        <h4 className="chart-title">
          <Target className="h-5 w-5" />
          {title}
        </h4>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={percentage > 100 ? "#ef4444" : "#3b82f6"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 90 90)"
                style={{
                  transition: 'stroke-dashoffset 0.3s ease-in-out'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {percentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Used</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center space-y-1">
          <div className="text-sm text-gray-600">
            Spent: <span className="font-semibold text-gray-900">{formatCurrency(spent)}</span>
          </div>
          <div className="text-sm text-gray-600">
            Budget: <span className="font-semibold text-gray-900">{formatCurrency(budget)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Credit Card Expense Analyzer | Multi-Currency Budget Tracker | Upaman</title>
        <meta
          name="description"
          content="Track and analyze credit card spending with category budgets, monthly insights, charts, and multi-currency conversion in one free tool."
        />
        <meta
          name="keywords"
          content="credit card expense tracker, budget tracker, spending analyzer, multi currency expense tracker, credit card budget tool"
        />
        <link rel="canonical" href="https://upaman.com/credit-card-analyzer" />
        <meta property="og:title" content="Credit Card Expense Analyzer | Upaman" />
        <meta
          property="og:description"
          content="Track category-wise spending, compare budget vs actual, and manage expenses in multiple currencies."
        />
        <meta property="og:url" content="https://upaman.com/credit-card-analyzer" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Credit Card Expense Analyzer | Upaman" />
        <meta
          name="twitter:description"
          content="Free multi-currency expense tracker with category budgets, charts, and monthly insights."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Credit Card Expense Analyzer',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              url: 'https://upaman.com/credit-card-analyzer',
              description: 'Track credit card expenses, category budgets, and monthly spending insights across currencies.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
      </Head>

      <div className="max-w-6xl mx-auto">
        <HomeButton />
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
                <p className="text-gray-600">Track and manage your spending across currencies</p>
              </div>
            </div>
            
            {/* Currency Selector */}
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCurrency}
                onChange={(e) => changeCurrency(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(currencies).map(([code, details]) => (
                  <option key={code} value={code}>
                    {details.flag} {code} - {details.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-2">
          <div className="flex space-x-1">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: PieChart },
              { key: 'charts', label: 'Charts', icon: BarChart3 },
              { key: 'add', label: 'Add Expense', icon: Plus },
              { key: 'budget', label: 'Budget', icon: Target },
              { key: 'insights', label: 'Insights', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <style jsx>{`
          .chart-container {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
          }
          .chart-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #374151;
            margin: 0 0 1rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .chart-legend {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
        `}</style>

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution Pie Chart */}
              <PieChartComponent
                title="Spending by Category"
                data={categories.map(category => ({
                  name: category.name,
                  value: getCategoryTotal(category.name),
                  color: category.color
                })).filter(item => item.value > 0)}
              />

              {/* Budget vs Spending Donut Chart */}
              <DonutChartComponent
                title="Budget Usage"
                spent={getTotalSpending()}
                budget={getTotalBudget()}
              />
            </div>

            {/* Category Comparison Bar Chart */}
            <BarChartComponent
              title="Category Breakdown"
              data={categories.map(category => ({
                name: category.name,
                value: getCategoryTotal(category.name),
                color: category.color
              })).filter(item => item.value > 0)}
            />

            {/* Monthly Trend */}
            <div className="chart-container">
              <h4 className="chart-title">
                <TrendingUp className="h-5 w-5" />
                Monthly Overview
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalSpending())}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(getTotalBudget())}</div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{formatCurrency(getTotalBudget() - getTotalSpending())}</div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalSpending())}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalBudget())}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalBudget() - getTotalSpending())}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
              <div className="space-y-4">
                {categories.map(category => {
                  const spent = getCategoryTotal(category.name);
                  const budget = budgets[category.name];
                  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                  const Icon = category.icon;
                  
                  return (
                    <div key={category.name} className="flex items-center gap-4">
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: category.bgColor }}
                      >
                        <Icon 
                          className="h-5 w-5" 
                          style={{ color: category.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">{category.name}</span>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(spent)} / {formatCurrency(budget)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: category.color
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{percentage.toFixed(0)}% used</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      "Date,Description,Category,Amount,Currency\n" +
                      expenses.map(exp => 
                        `${exp.date},${exp.description},${exp.category},${exp.amount},${exp.currency || 'USD'}`
                      ).join("\n");
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "expenses.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {expenses
                  .filter(exp => exp.date.startsWith(selectedMonth))
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(expense => {
                    const Icon = getCategoryIcon(expense.category);
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ backgroundColor: getCategoryBgColor(expense.category) }}
                          >
                            <Icon 
                              className="h-4 w-4" 
                              style={{ color: getCategoryColor(expense.category) }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{expense.description}</p>
                            <p className="text-sm text-gray-500">{expense.date} • {expense.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{formatCurrency(expense.amount, expense.currency)}</div>
                            {expense.currency && expense.currency !== selectedCurrency && (
                              <div className="text-xs text-gray-500">
                                {currencies[expense.currency]?.symbol}{expense.amount.toFixed(2)} {expense.currency}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Add Expense Tab */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Expense</h3>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Grocery shopping"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({currencies[selectedCurrency]?.symbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.name}
                        onClick={() => setNewExpense({...newExpense, category: category.name})}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                          newExpense.category === category.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="p-1 rounded-full"
                          style={{ backgroundColor: category.bgColor }}
                        >
                          <Icon 
                            className="h-4 w-4" 
                            style={{ color: category.color }}
                          />
                        </div>
                        <span className="text-sm font-medium">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={addExpense}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Add Expense
              </button>
            </div>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Budget Settings</h3>
            <div className="max-w-2xl mx-auto space-y-4">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <div key={category.name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div 
                      className="p-3 rounded-full"
                      style={{ backgroundColor: category.bgColor }}
                    >
                      <Icon 
                        className="h-5 w-5" 
                        style={{ color: category.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-medium text-gray-900 mb-1">{category.name}</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{currencies[selectedCurrency]?.symbol}</span>
                        <input
                          type="number"
                          value={budgets[category.name]}
                          onChange={(e) => setBudgets({
                            ...budgets,
                            [category.name]: parseFloat(e.target.value) || 0
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Insights</h3>
              <div className="space-y-3">
                {(() => {
                  const insights = [];
                  const totalSpent = getTotalSpending();
                  const totalBudget = getTotalBudget();
                  
                  if (totalSpent > totalBudget) {
                    insights.push({
                      type: 'warning',
                      message: `You've exceeded your budget by ${formatCurrency(totalSpent - totalBudget)} this month.`
                    });
                  } else {
                    insights.push({
                      type: 'success',
                      message: `Great job! You're within budget with ${formatCurrency(totalBudget - totalSpent)} remaining.`
                    });
                  }
                  
                  categories.forEach(category => {
                    const spent = getCategoryTotal(category.name);
                    const budget = budgets[category.name];
                    if (spent > budget) {
                      insights.push({
                        type: 'warning',
                        message: `${category.name}: Over budget by ${formatCurrency(spent - budget)}`
                      });
                    }
                  });
                  
                  return insights.map((insight, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg flex items-center gap-3 ${
                        insight.type === 'warning' 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p>{insight.message}</p>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {((getTotalSpending() / getTotalBudget()) * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-600">Used</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  You've spent <span className="font-semibold text-gray-900">{formatCurrency(getTotalSpending())}</span> out of your <span className="font-semibold text-gray-900">{formatCurrency(getTotalBudget())}</span> monthly budget.
                </p>
              </div>
            </div>

            {/* Currency Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(currencies).map(([code, details]) => (
                  <div key={code} className={`p-3 rounded-lg border-2 ${selectedCurrency === code ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{details.flag} {code}</div>
                        <div className="text-sm text-gray-600">{details.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{details.symbol}</div>
                        <div className="text-sm text-gray-600">
                          {exchangeRates[code] ? `1 USD = ${exchangeRates[code].toFixed(2)} ${code}` : 'Loading...'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCardAnalyzer;
