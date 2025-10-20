import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/customer_data/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FD] flex items-center justify-center p-4">
      <div className="bg-white p-8 w-full max-w-md rounded-xl shadow-lg border-t-4 border-[#001F5B] transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Bank Logo" className="h-24 w-auto mb-4 rounded-lg shadow-md transition-all duration-300 hover:scale-105" />
          <h1 className="text-3xl font-bold text-[#001F5B] mb-2">BTrust Bank</h1>
          <h2 className="text-xl font-medium text-[#0A4DA6]">Customer Login</h2>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium text-[#0A4DA6] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="px-4 py-3 text-[#001F5B] border border-[#84B9E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4DA6] focus:border-[#0A4DA6] transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-[#0A4DA6] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-3 text-[#001F5B] border border-[#84B9E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4DA6] focus:border-[#0A4DA6] transition-all duration-200"
            />
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border-l-4 border-red-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="px-4 py-3 mt-2 font-semibold text-[#001F5B] bg-[#FFC107] rounded-lg shadow-md hover:bg-[#FFD54F] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-t-[#001F5B] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 border-t border-[#E6EFF9] pt-6">
          <p className="text-sm text-[#84B9E8]">Need assistance? Contact your branch for account setup</p>
          <p className="text-lg font-medium text-[#001F5B] mt-4 italic">Smart Banking, Built on Trust.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
