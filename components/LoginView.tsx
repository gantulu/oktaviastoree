
import React, { useState } from 'react';
import { ArrowLeft, Phone, Lock, Eye, EyeOff, Chrome, Apple, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types';

interface LoginViewProps {
  onBack: () => void;
  onNavigateToRegister: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

const AIRTABLE_API_KEY = 'patsOC1DfB0tSGj71.39d3ea7bd41b74b424e8392bd353e4dfe874eff92321a629a4319d2f6716c718';
const AIRTABLE_BASE_ID = 'appBGOCgeMmRfLAHj';
const AIRTABLE_TABLE_NAME = 'user';

const LoginView: React.FC<LoginViewProps> = ({ onBack, onNavigateToRegister, onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formula = `AND({phone}='${phone}', {password}='${password}')`;
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(formula)}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`
        }
      });

      if (!response.ok) throw new Error('Network error. Please try again.');

      const data = await response.json();

      if (data.records && data.records.length > 0) {
        const userFields = data.records[0].fields;
        const user: UserAccount = {
          id: data.records[0].id,
          nama: userFields.nama,
          phone: userFields.phone,
          avatar: userFields.avatar,
          membership_points: Number(userFields.membership_points || 0),
          membership_balance: Number(userFields.membership_balance || 0),
          orders: userFields.orders || '[]',
          wishlist: userFields.wishlist || '',
          paymentMethods: userFields.paymentMethods || '[]',
          shippingAddresses: userFields.shippingAddresses || '[]',
          notifications: userFields.notifications || '[]',
        };

        localStorage.setItem('authLogin', JSON.stringify({ phone, password }));
        onLoginSuccess(user);
      } else {
        setError('Invalid phone number or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-12 pb-8">
      <button onClick={onBack} className="p-2 -ml-2 w-fit text-slate-950 mb-8 active:scale-90 transition-transform">
        <ArrowLeft size={24} />
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-950 mb-2">Welcome Back!</h1>
        <p className="text-slate-700 font-bold">Log in to your account with your phone number.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-2xl flex items-center gap-3 text-red-800 shadow-sm">
          <AlertCircle size={20} />
          <p className="text-sm font-black">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Phone Number</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <Phone size={18} />
            </div>
            <input 
              type="tel" 
              placeholder="08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Password</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <Lock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-4 pl-12 pr-12 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" className="text-xs font-black text-blue-800 hover:text-blue-900 hover:underline">
            Forgot Password?
          </button>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/30 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-10 mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200"></div>
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Or login with</span>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 flex items-center justify-center gap-2 border border-slate-300 py-3.5 rounded-2xl bg-white hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
          <Chrome size={20} className="text-red-600" />
          <span className="text-sm font-black text-slate-800">Google</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 border border-slate-300 py-3.5 rounded-2xl bg-white hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
          <Apple size={20} className="text-slate-950" />
          <span className="text-sm font-black text-slate-800">Apple</span>
        </button>
      </div>

      <div className="mt-auto pt-8 text-center">
        <p className="text-sm text-slate-700 font-bold">
          Don't have an account?{' '}
          <button 
            onClick={onNavigateToRegister}
            className="text-blue-800 font-black hover:underline ml-1"
          >
            Register Now
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginView;