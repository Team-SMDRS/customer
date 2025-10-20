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

  if (isLoading || !customerData) {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  const data = customerData;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="Bank Logo" className="h-16 mr-4 rounded-lg" />
            <div>
              <h1 className="text-4xl font-bold mb-2">BTrust Bank</h1>
              <h2 className="text-3xl mb-2 font-bold">Welcome, {data.customer_profile.full_name}</h2>
              {/* <p className="text-sm opacity-90">Customer ID: {data.customer_profile.customer_id}</p> */}
            </div>
          </div>
          <button className="px-6 py-2 bg-white/20 border-2 border-white text-white rounded-lg cursor-pointer font-semibold transition-all hover:bg-white hover:text-indigo-500" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="text-3xl mb-4">💰</div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-black">Total Balance</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.total_balance)}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="text-3xl mb-4">🏦</div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-black">Active Accounts</h3>
            <p className="text-2xl font-bold text-blue-600">{data.summary.active_accounts}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="text-3xl mb-4">📊</div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-black">Fixed Deposits</h3>
            <p className="text-2xl font-bold text-purple-600">{data.summary.active_fixed_deposits}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="text-3xl mb-4">💸</div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-black">Transactions</h3>
            <p className="text-2xl font-bold text-orange-600">{data.summary.total_transactions}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 flex gap-2 border-b-2 border-gray-200 mb-8">
        <button
          className={`px-6 py-3 bg-none border-none text-base font-semibold cursor-pointer relative text-gray-500 transition-colors hover:text-indigo-500 ${activeTab === "overview" ? "text-indigo-500 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`px-6 py-3 bg-none border-none text-base font-semibold cursor-pointer relative text-gray-500 transition-colors hover:text-indigo-500 ${activeTab === "accounts" ? "text-indigo-500 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500" : ""}`}
          onClick={() => setActiveTab("accounts")}
        >
          Accounts
        </button>
        <button
          className={`px-6 py-3 bg-none border-none text-base font-semibold cursor-pointer relative text-gray-500 transition-colors hover:text-indigo-500 ${activeTab === "transactions" ? "text-indigo-500 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
        <button
          className={`px-6 py-3 bg-none border-none text-base font-semibold cursor-pointer relative text-gray-500 transition-colors hover:text-indigo-500 ${activeTab === "fixed-deposits" ? "text-indigo-500 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500" : ""}`}
          onClick={() => setActiveTab("fixed-deposits")}
        >
          Fixed Deposits
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6">
        {activeTab === "overview" && (
          <div className="grid gap-6">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h2 className="mb-6 text-2xl text-gray-900">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">Full Name:</span>
                  <span className="text-base text-gray-900 font-semibold">{data.customer_profile.full_name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">NIC:</span>
                  <span className="text-base text-gray-900 font-semibold">{data.customer_profile.nic}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">Phone:</span>
                  <span className="text-base text-gray-900 font-semibold">{data.customer_profile.phone_number}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">Date of Birth:</span>
                  <span className="text-base text-gray-900 font-semibold">{data.customer_profile.dob}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500 font-medium">Address:</span>
                  <span className="text-base text-gray-900 font-semibold">{data.customer_profile.address}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md">
              <h2 className="mb-6 text-2xl text-gray-900">Recent Transactions</h2>
              <div className="flex flex-col gap-4">
                {data.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.transaction_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
                    <div className="text-2xl w-12 h-12 flex items-center justify-center bg-white rounded-lg">
                      {transaction.type.includes("Deposit") || transaction.type.includes("Interest") ? "📥" : "📤"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{transaction.type}</p>
                      <p className="text-sm text-gray-500 mb-1">{transaction.description}</p>
                      <p className="text-xs text-gray-400">{new Date(transaction.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-lg font-bold">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.accounts.map((account) => (
              <div key={account.acc_id} className="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 flex justify-between items-center">
                  <h3 className="text-xl font-normal">{account.savings_plan} Account</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${account.status === "active" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                    {account.status}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex flex-col gap-2 mb-6 pb-6 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Balance</span>
                    <span className="text-3xl font-bold text-gray-900">{formatCurrency(account.balance)}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Account No:</span>
                      <span className="font-semibold text-gray-900">{account.account_no}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Branch:</span>
                      <span className="font-semibold text-gray-900">{account.branch_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Opened:</span>
                      <span className="font-semibold text-gray-900">{new Date(account.opened_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Download Transaction Report</h3>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={downloadTransactionReport}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Download PDF
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b-2 border-gray-200">Date</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b-2 border-gray-200">Reference No</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b-2 border-gray-200">Type</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b-2 border-gray-200">Description</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b-2 border-gray-200">Account</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b-2 border-gray-200">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((transaction) => (
                    <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                      <td className="p-4 border-b border-gray-200 text-sm text-gray-700">{new Date(transaction.created_at).toLocaleString()}</td>
                      <td className="p-4 border-b border-gray-200 text-sm text-gray-700">{transaction.reference_no}</td>
                      <td className="p-4 border-b border-gray-200 text-sm text-gray-700">
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600">{transaction.type}</span>
                      </td>
                      <td className="p-4 border-b border-gray-200 text-sm text-gray-700">{transaction.description}</td>
                      <td className="p-4 border-b border-gray-200 text-sm text-gray-700">{transaction.account_no}</td>
                      <td className="p-4 border-b border-gray-200 text-sm text-gray-700">
                        <span className={transaction.type.includes("Deposit") || transaction.type.includes("Interest") ? "text-green-600" : "text-red-600"}>
                          {transaction.type.includes("Deposit") || transaction.type.includes("Interest") ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "fixed-deposits" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.fixed_deposits.map((fd) => (
              <div key={fd.fd_id} className="bg-white rounded-xl overflow-hidden shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 flex justify-between items-center">
                  <h3 className="text-xl font-normal">Fixed Deposit</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${fd.status === "active" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                    {fd.status}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex flex-col gap-2 mb-6 pb-6 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Balance</span>
                    <span className="text-3xl font-bold text-gray-900">{formatCurrency(fd.balance)}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">FD Account No:</span>
                      <span className="font-semibold text-gray-900">{fd.fd_account_no}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Interest Rate:</span>
                      <span className="font-semibold text-green-600">{fd.interest_rate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-semibold text-gray-900">{fd.duration} months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Opened Date:</span>
                      <span className="font-semibold text-gray-900">{new Date(fd.opened_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Maturity Date:</span>
                      <span className="font-semibold text-gray-900">{new Date(fd.maturity_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Linked Account:</span>
                      <span className="font-semibold text-gray-900">{fd.linked_savings_account}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Branch:</span>
                      <span className="font-semibold text-gray-900">{fd.branch_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
