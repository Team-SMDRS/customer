import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';

interface CustomerProfile {
  customer_id: string;
  full_name: string;
  nic: string;
  address: string;
  phone_number: string;
  dob: string;
  created_at: string;
}

interface Account {
  acc_id: string;
  account_no: string;
  balance: number;
  status: string;
  opened_date: string;
  branch_name: string;
  branch_id: string;
  savings_plan: string;
}

interface Transaction {
  transaction_id: string;
  reference_no: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  account_no: string;
}

interface FixedDeposit {
  fd_id: string;
  fd_account_no: string;
  balance: number;
  opened_date: string;
  maturity_date: string;
  status: string;
  linked_savings_account: string;
  duration: number;
  interest_rate: number;
  branch_name: string;
}

interface Summary {
  total_accounts: number;
  active_accounts: number;
  total_savings_balance: number;
  total_fd_balance: number;
  total_balance: number;
  total_transactions: number;
  total_fixed_deposits: number;
  active_fixed_deposits: number;
}

interface CustomerData {
  customer_profile: CustomerProfile;
  accounts: Account[];
  transactions: Transaction[];
  fixed_deposits: FixedDeposit[];
  summary: Summary;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "accounts" | "transactions" | "fixed-deposits">("overview");
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");

      console.log("Dashboard - Checking token...");
      console.log("Dashboard - Token exists:", !!token);

      if (!token) {
        console.log("Dashboard - No token found, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("Dashboard - Token found:", token.substring(0, 20) + "...");

      try {
        console.log("Dashboard - Fetching customer data...");
        const response = await fetch("http://127.0.0.1:8000/customer_data/customers_details", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "accept": "application/json",
          },
        });

        console.log("Dashboard - API response status:", response.status);

        if (!response.ok) {
          console.log("Dashboard - API failed, clearing token and redirecting to login");
          localStorage.clear();
          navigate("/login");
          return;
        }

        const data: CustomerData = await response.json();
        console.log("Dashboard - Data loaded successfully:", data);
        setCustomerData(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Dashboard - Error:", err);
        setIsLoading(false);
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.clear();
    navigate("/login");
  };

  const downloadTransactionReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/pdf-reports/customers/my_transactions_report/pdf?start_date=${startDate}&end_date=${endDate}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${startDate}_to_${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download the report. Please try again.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    // Calculate percentage of time passed
    const totalDuration = end - start;
    const elapsed = now - start;
    
    // Return percentage with bounds checking (0-100)
    return Math.max(0, Math.min(100, Math.floor((elapsed / totalDuration) * 100)));
  };

  if (isLoading || !customerData) {
    return (
      <div className="min-h-screen bg-[#F5F9FD] pb-10">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-[#0A4DA6] border-b-[#FFC107] border-l-[#84B9E8] border-r-[#001F5B] rounded-full animate-spin mb-4"></div>
            <h2 className="text-[#001F5B] text-xl font-semibold">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  const data = customerData;

  return (
    <div className="min-h-screen bg-[#F5F9FD] pb-10">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#001F5B] to-[#0A4DA6] text-white py-6 md:py-8 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center text-center md:text-left">
            <img src={logo} alt="Bank Logo" className="h-12 sm:h-16 mb-2 sm:mb-0 sm:mr-4 rounded-lg shadow-md transition-transform duration-300 hover:scale-105" />
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-[#FFC107] drop-shadow-sm">BTrust Bank</h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl mb-2 font-bold transition-all duration-300 hover:text-[#84B9E8] truncate max-w-xs sm:max-w-md">Welcome, {data.customer_profile.full_name}</h2>
              {/* <p className="text-sm opacity-90">Customer ID: {data.customer_profile.customer_id}</p> */}
            </div>
          </div>
          <button className="w-full sm:w-auto px-6 py-2 bg-[#FFC107] text-[#001F5B] rounded-lg cursor-pointer font-semibold shadow-md transition-all duration-300 hover:bg-[#FFD54F] hover:shadow-lg" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-b-4 border-[#001F5B] hover:translate-y-[-5px] transition-all duration-300">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-4 text-[#0A4DA6]">💰</div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-[#001F5B]">Total Balance</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#001F5B] break-words">{formatCurrency(data.summary.total_balance)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-b-4 border-[#0A4DA6] hover:translate-y-[-5px] transition-all duration-300">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-4 text-[#0A4DA6]">🏦</div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-[#001F5B]">Active Accounts</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#0A4DA6]">{data.summary.active_accounts}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-b-4 border-[#FFC107] hover:translate-y-[-5px] transition-all duration-300">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-4 text-[#0A4DA6]">📊</div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-[#001F5B]">Fixed Deposits</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#0A4DA6]">{data.summary.active_fixed_deposits}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-b-4 border-[#84B9E8] hover:translate-y-[-5px] transition-all duration-300">
          <div className="text-2xl sm:text-3xl mb-2 sm:mb-4 text-[#0A4DA6]">💸</div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-[#001F5B]">Transactions</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#0A4DA6]">{data.summary.total_transactions}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
        <div className="flex gap-1 sm:gap-2 border-b-2 border-[#E6EFF9] mb-8 min-w-max">
          <button
            className={`px-3 sm:px-6 py-2 sm:py-3 bg-none border-none text-sm sm:text-base font-semibold cursor-pointer relative text-gray-500 transition-all duration-300 hover:text-[#0A4DA6] ${activeTab === "overview" ? "text-[#001F5B] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#FFC107] after:transition-all after:duration-300 after:ease-in-out" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Info</span>
            </span>
          </button>
          <button
            className={`px-3 sm:px-6 py-2 sm:py-3 bg-none border-none text-sm sm:text-base font-semibold cursor-pointer relative text-gray-500 transition-all duration-300 hover:text-[#0A4DA6] ${activeTab === "accounts" ? "text-[#001F5B] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#FFC107] after:transition-all after:duration-300 after:ease-in-out" : ""}`}
            onClick={() => setActiveTab("accounts")}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="hidden sm:inline">Accounts</span>
              <span className="sm:hidden">Acct</span>
            </span>
          </button>
          <button
            className={`px-3 sm:px-6 py-2 sm:py-3 bg-none border-none text-sm sm:text-base font-semibold cursor-pointer relative text-gray-500 transition-all duration-300 hover:text-[#0A4DA6] ${activeTab === "transactions" ? "text-[#001F5B] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#FFC107] after:transition-all after:duration-300 after:ease-in-out" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="hidden sm:inline">Transactions</span>
              <span className="sm:hidden">Trans</span>
            </span>
          </button>
          <button
            className={`px-3 sm:px-6 py-2 sm:py-3 bg-none border-none text-sm sm:text-base font-semibold cursor-pointer relative text-gray-500 transition-all duration-300 hover:text-[#0A4DA6] ${activeTab === "fixed-deposits" ? "text-[#001F5B] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#FFC107] after:transition-all after:duration-300 after:ease-in-out" : ""}`}
            onClick={() => setActiveTab("fixed-deposits")}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Fixed Deposits</span>
              <span className="sm:hidden">FDs</span>
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6">
        {activeTab === "overview" && (
          <div className="grid gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-8 shadow-lg border-l-4 border-[#001F5B] transition-all duration-300 hover:shadow-xl">
              <h2 className="mb-3 sm:mb-6 text-lg sm:text-2xl text-[#001F5B] font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7 mr-2 text-[#0A4DA6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="truncate">Profile Information</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-5">
                <div className="flex flex-col gap-1 p-2 sm:p-3 bg-[#F5F9FD]/50 hover:bg-[#F5F9FD] rounded-lg transition-colors duration-300">
                  <span className="text-xs sm:text-sm text-[#0A4DA6] font-medium">Full Name:</span>
                  <span className="text-sm sm:text-base text-[#001F5B] font-semibold break-words">{data.customer_profile.full_name}</span>
                </div>
                <div className="flex flex-col gap-1 p-2 sm:p-3 bg-[#F5F9FD]/50 hover:bg-[#F5F9FD] rounded-lg transition-colors duration-300">
                  <span className="text-xs sm:text-sm text-[#0A4DA6] font-medium">NIC:</span>
                  <span className="text-sm sm:text-base text-[#001F5B] font-semibold">{data.customer_profile.nic}</span>
                </div>
                <div className="flex flex-col gap-1 p-2 sm:p-3 bg-[#F5F9FD]/50 hover:bg-[#F5F9FD] rounded-lg transition-colors duration-300">
                  <span className="text-xs sm:text-sm text-[#0A4DA6] font-medium">Phone:</span>
                  <span className="text-sm sm:text-base text-[#001F5B] font-semibold">{data.customer_profile.phone_number}</span>
                </div>
                <div className="flex flex-col gap-1 p-2 sm:p-3 bg-[#F5F9FD]/50 hover:bg-[#F5F9FD] rounded-lg transition-colors duration-300">
                  <span className="text-xs sm:text-sm text-[#0A4DA6] font-medium">Date of Birth:</span>
                  <span className="text-sm sm:text-base text-[#001F5B] font-semibold">{data.customer_profile.dob}</span>
                </div>
                <div className="flex flex-col gap-1 p-2 sm:p-3 bg-[#F5F9FD]/50 hover:bg-[#F5F9FD] rounded-lg transition-colors duration-300 sm:col-span-2">
                  <span className="text-xs sm:text-sm text-[#0A4DA6] font-medium">Address:</span>
                  <span className="text-sm sm:text-base text-[#001F5B] font-semibold break-words">{data.customer_profile.address}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-8 shadow-lg border-l-4 border-[#FFC107] transition-all duration-300 hover:shadow-xl">
              <h2 className="mb-3 sm:mb-6 text-lg sm:text-2xl text-[#001F5B] font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7 mr-2 text-[#0A4DA6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="truncate">Recent Transactions</span>
              </h2>
              <div className="flex flex-col gap-2 sm:gap-4 overflow-hidden">
                {data.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.transaction_id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-[#F5F9FD] rounded-lg transition-all duration-300 hover:bg-white hover:shadow-md border-l-2 border-transparent hover:border-l-[#0A4DA6]">
                    <div className={`text-lg sm:text-2xl w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center ${transaction.type.includes("Deposit") || transaction.type.includes("Interest") ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FEF2F2] text-[#EF4444]"} rounded-full shadow-sm transition-transform duration-300 hover:scale-110 shrink-0`}>
                      {transaction.type.includes("Deposit") || transaction.type.includes("Interest") ? "📥" : "📤"}
                    </div>
                    <div className="flex-1 min-w-0 order-3 sm:order-2 w-full sm:w-auto mt-1 sm:mt-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1 truncate">{transaction.type}</p>
                      <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1 truncate">{transaction.description}</p>
                      <p className="text-xs text-gray-400">{new Date(transaction.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                    </div>
                    <div className="text-base sm:text-lg font-bold shrink-0 ml-auto sm:ml-2 order-2 sm:order-3">
                      <span className={transaction.type.includes("Deposit") || transaction.type.includes("Interest") ? "text-green-600" : "text-red-600"}>
                        {transaction.type.includes("Deposit") || transaction.type.includes("Interest") ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "accounts" && (
          <div>
            <div className="mb-6 flex flex-wrap items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-[#0A4DA6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-[#001F5B]">Your Accounts</h2>
              <span className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 bg-[#84B9E8]/20 text-[#0A4DA6] text-xs sm:text-sm rounded-full">{data.accounts.length} Total</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {data.accounts.map((account) => (
                <div key={account.acc_id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <div className={`bg-gradient-to-br ${account.status === "active" ? "from-[#001F5B] to-[#0A4DA6]" : "from-gray-500 to-gray-600"} text-white p-3 sm:p-5 flex flex-wrap sm:flex-nowrap justify-between items-center`}>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 bg-white/20 p-1 sm:p-1.5 rounded-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h3 className="text-lg sm:text-xl font-semibold truncate">{account.savings_plan} Account</h3>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase ${account.status === "active" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"} shadow-sm mt-1 sm:mt-0`}>
                      {account.status}
                    </span>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-1 sm:gap-2 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                      <span className="text-sm text-[#0A4DA6] font-medium">Balance</span>
                      <span className="text-2xl sm:text-3xl font-bold text-[#001F5B]">{formatCurrency(account.balance)}</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <div className="flex justify-between text-xs sm:text-sm items-center p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F9FD] transition-colors duration-200">
                        <span className="text-[#84B9E8] flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          Account No:
                        </span>
                        <span className="font-semibold text-[#001F5B]">{account.account_no}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm items-center p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F9FD] transition-colors duration-200">
                        <span className="text-[#84B9E8] flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Branch:
                        </span>
                        <span className="font-semibold text-[#001F5B] truncate max-w-[150px] sm:max-w-none">{account.branch_name}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm items-center p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F9FD] transition-colors duration-200">
                        <span className="text-[#84B9E8] flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Opened:
                        </span>
                        <span className="font-semibold text-[#001F5B]">{new Date(account.opened_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-[#FFC107]">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-[#0A4DA6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg sm:text-xl font-bold text-[#001F5B]">Transaction Report</h3>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
                <div className="w-full sm:w-auto">
                  <label htmlFor="start-date" className="block text-xs sm:text-sm font-medium text-[#0A4DA6] mb-1">Start Date</label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-[#001F5B] border border-[#84B9E8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4DA6] focus:border-[#0A4DA6] transition-all duration-200"
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label htmlFor="end-date" className="block text-xs sm:text-sm font-medium text-[#0A4DA6] mb-1">End Date</label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-[#001F5B] border border-[#84B9E8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4DA6] focus:border-[#0A4DA6] transition-all duration-200"
                  />
                </div>
                <button
                  onClick={downloadTransactionReport}
                  className="w-full sm:w-auto mt-2 sm:mt-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FFC107] text-[#001F5B] font-semibold rounded-md hover:bg-[#FFD54F] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-lg border-t-4 border-[#0A4DA6]">
              <div className="p-4 bg-[#F5F9FD]">
                <h3 className="font-bold text-lg text-[#001F5B] flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Transaction History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#E6EFF9]">
                    <tr>
                      <th className="p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#001F5B] border-b-2 border-[#84B9E8]">Date</th>
                      <th className="p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#001F5B] border-b-2 border-[#84B9E8]">Reference</th>
                      <th className="p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#001F5B] border-b-2 border-[#84B9E8]">Type</th>
                      <th className="p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#001F5B] border-b-2 border-[#84B9E8]">Description</th>
                      <th className="p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#001F5B] border-b-2 border-[#84B9E8]">Account</th>
                      <th className="p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#001F5B] border-b-2 border-[#84B9E8]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((transaction) => (
                      <tr key={transaction.transaction_id} className="hover:bg-[#F5F9FD] transition-colors duration-150">
                        <td className="p-2 sm:p-4 border-b border-[#E6EFF9] text-xs sm:text-sm text-[#4B5563]">{new Date(transaction.created_at).toLocaleDateString()}</td>
                        <td className="p-2 sm:p-4 border-b border-[#E6EFF9] text-xs sm:text-sm text-[#4B5563] font-medium max-w-[60px] sm:max-w-none truncate">{transaction.reference_no}</td>
                        <td className="p-2 sm:p-4 border-b border-[#E6EFF9] text-xs sm:text-sm">
                          <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                            transaction.type.includes("Deposit") || transaction.type.includes("Interest") 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="p-2 sm:p-4 border-b border-[#E6EFF9] text-xs sm:text-sm text-[#4B5563] max-w-[80px] sm:max-w-none truncate">{transaction.description}</td>
                        <td className="p-2 sm:p-4 border-b border-[#E6EFF9] text-xs sm:text-sm text-[#4B5563] font-medium">{transaction.account_no}</td>
                        <td className="p-2 sm:p-4 border-b border-[#E6EFF9] text-xs sm:text-sm font-semibold">
                          <span className={`flex items-center ${
                            transaction.type.includes("Deposit") || transaction.type.includes("Interest") 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}>
                            {transaction.type.includes("Deposit") || transaction.type.includes("Interest") 
                              ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg> 
                              : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                </svg>
                            }
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "fixed-deposits" && (
          <div>
            <div className="mb-6 flex flex-wrap items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-[#0A4DA6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-[#001F5B]">Fixed Deposits</h2>
              <span className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 bg-[#84B9E8]/20 text-[#0A4DA6] text-xs sm:text-sm rounded-full">{data.fixed_deposits.length} Total</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {data.fixed_deposits.map((fd) => (
                <div key={fd.fd_id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group">
                  <div className={`bg-gradient-to-br ${fd.status === "active" ? "from-[#FFC107] to-[#FFB000]" : "from-gray-500 to-gray-600"} text-white p-3 sm:p-5 flex flex-wrap sm:flex-nowrap justify-between items-center group-hover:shadow-md transition-all duration-300`}>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 bg-white/20 p-1 sm:p-1.5 rounded-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg sm:text-xl font-semibold truncate">Fixed Deposit</h3>
                    </div>
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold uppercase ${fd.status === "active" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"} shadow-sm mt-1 sm:mt-0`}>
                      {fd.status}
                    </span>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-1 sm:gap-2 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                      <div className="flex flex-wrap justify-between items-center">
                        <span className="text-xs sm:text-sm text-[#0A4DA6] font-medium">Balance</span>
                        {fd.status === "active" && (
                          <div className="flex items-center text-xs font-medium text-[#FFC107] mt-1 sm:mt-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">Maturing {new Date(fd.maturity_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xl sm:text-3xl font-bold text-[#001F5B]">{formatCurrency(fd.balance)}</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <div className="flex justify-between text-xs sm:text-sm items-center p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F9FD] transition-colors duration-200">
                        <span className="text-[#84B9E8] flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          FD Account No:
                        </span>
                        <span className="font-semibold text-[#001F5B]">{fd.fd_account_no}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm items-center p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F9FD] transition-colors duration-200">
                        <span className="text-[#84B9E8] flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          Interest Rate:
                        </span>
                        <span className="font-semibold text-green-600">{fd.interest_rate}% p.a.</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm items-center p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F9FD] transition-colors duration-200">
                        <span className="text-[#84B9E8] flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Duration:
                        </span>
                        <span className="font-semibold text-[#001F5B]">{fd.duration} months</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm items-center p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F9FD] transition-colors duration-200">
                        <span className="text-[#84B9E8] flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Opened Date:
                        </span>
                        <span className="font-semibold text-[#001F5B]">{new Date(fd.opened_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm items-center p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F9FD] transition-colors duration-200">
                        <span className="text-[#84B9E8] flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Linked Account:
                        </span>
                        <span className="font-semibold text-[#001F5B] truncate max-w-[120px] sm:max-w-none">{fd.linked_savings_account}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm items-center p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F9FD] transition-colors duration-200">
                        <span className="text-[#84B9E8] flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Branch:
                        </span>
                        <span className="font-semibold text-[#001F5B] truncate max-w-[120px] sm:max-w-none">{fd.branch_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                    <div className={`w-full h-1.5 sm:h-2 rounded-full overflow-hidden ${fd.status === "active" ? "bg-gray-200" : "bg-red-100"}`}>
                      {fd.status === "active" && (
                        <div 
                          className="h-full bg-gradient-to-r from-[#FFC107] to-[#FFD54F]" 
                          style={{ 
                            width: `${calculateProgress(fd.opened_date, fd.maturity_date)}%`
                          }}
                        ></div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-1 px-1 text-[10px] sm:text-xs">
                      <span className="text-[#0A4DA6]">Start: {new Date(fd.opened_date).toLocaleDateString()}</span>
                      <span className="text-[#0A4DA6]">Matures: {new Date(fd.maturity_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
