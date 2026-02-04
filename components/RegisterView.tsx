
import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Phone, Check, AlertCircle } from 'lucide-react';

interface RegisterViewProps {
  onBack: () => void;
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

const AIRTABLE_API_KEY = 'patsOC1DfB0tSGj71.39d3ea7bd41b74b424e8392bd353e4dfe874eff92321a629a4319d2f6716c718';
const AIRTABLE_BASE_ID = 'appBGOCgeMmRfLAHj';
const AIRTABLE_TABLE_NAME = 'user';

const RegisterView: React.FC<RegisterViewProps> = ({ onBack, onNavigateToLogin, onRegisterSuccess }) => {
  const [nama, setNama] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    
    setLoading(true);
    setError(null);

    try {
      // 1. Check if phone already exists
      const checkFormula = `{phone}='${phone}'`;
      const checkUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(checkFormula)}`;
      
      const checkRes = await fetch(checkUrl, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
      });

      if (!checkRes.ok) throw new Error('Gagal memeriksa data pengguna.');
      
      const checkData = await checkRes.json();
      if (checkData.records && checkData.records.length > 0) {
        setError('nomor ponsel sudah terdaftar');
        setLoading(false);
        return;
      }

      // 2. Create new record
      const createUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
      const payload = {
        fields: {
          nama: nama,
          phone: phone,
          password: password,
          avatar: `https://picsum.photos/seed/${phone}/200`, // Default avatar based on phone seed
          membership_points: 0,
          membership_balance: 0,
          orders: '[]',
          wishlist: '',
          paymentMethods: '[]',
          shippingAddresses: '[]',
          notifications: '[]'
        }
      };

      const createRes = await fetch(createUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!createRes.ok) throw new Error('Gagal membuat akun. Silakan coba lagi.');

      // Save for autologin
      localStorage.setItem('authLogin', JSON.stringify({ phone, password }));

      // Success
      onRegisterSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-12 pb-8">
      <button onClick={onBack} className="p-2 -ml-2 w-fit text-slate-900 mb-8">
        <ArrowLeft size={24} />
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Create Account</h1>
        <p className="text-slate-500 font-medium">Join us and start your premium shopping experience.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <User size={18} />
            </div>
            <input 
              type="text" 
              placeholder="John Doe"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Phone size={18} />
            </div>
            <input 
              type="tel" 
              placeholder="08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2">
          <button 
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={`w-5 h-5 rounded flex items-center justify-center transition-all ${agreed ? 'bg-blue-700 border-transparent' : 'bg-slate-50 border border-slate-200'}`}
          >
            {agreed && <Check size={14} className="text-white" />}
          </button>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            By creating an account, you agree to our <span className="text-blue-700 font-bold">Terms of Service</span> and <span className="text-blue-700 font-bold">Privacy Policy</span>.
          </p>
        </div>

        <button 
          type="submit"
          disabled={loading || !agreed}
          className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 mt-4"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Register'}
        </button>
      </form>

      <div className="mt-auto pt-8 text-center">
        <p className="text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <button 
            onClick={onNavigateToLogin}
            className="text-blue-700 font-black hover:underline"
          >
            Login Here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterView;
