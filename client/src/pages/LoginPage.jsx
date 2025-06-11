import { GoogleLogin } from '@react-oauth/google';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false); 
  const [googleLoading, setGoogleLoading] = useState(false); 

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5050/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      console.error('Email login failed:', err);
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    setErrorMsg(''); 
    setGoogleLoading(true); 

    try {
      const token = response.credential;

      const res = await fetch('http://localhost:5050/api/v1/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      console.error('Google login failed:', err);
      setErrorMsg(err.message || 'Google login failed');
    } finally {
      setGoogleLoading(false); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full space-y-8 border border-gray-200">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6">Welcome Back!</h2>

        {errorMsg && (
          <p className="text-red-600 bg-red-100 border border-red-200 rounded-md py-2 px-4 text-sm">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-lg"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-lg shadow-md"
          >
            {loading ? 'Logging in...' : 'Login Securely'}
          </button>
        </form>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-base font-medium">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Login Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.log('Google Login Failed');
              setErrorMsg('Google login failed. Please try again.');
              setGoogleLoading(false);
            }}
            disabled={googleLoading}
            text={googleLoading ? 'Signing in with Google...' : 'Sign in with Google'}
            size="large" 
            theme="filled_blue" 
          />
        </div>
      </div>
    </div>
  );
}