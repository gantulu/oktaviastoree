
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle, Info, Home, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { PaymentDetails } from '../types';

interface PaymentCompletionViewProps {
  payment: PaymentDetails;
  onBackToHome: () => void;
}

const PaymentCompletionView: React.FC<PaymentCompletionViewProps> = ({ payment, onBackToHome }) => {
  const [copied, setCopied] = useState(false);
  const [activeInstruction, setActiveInstruction] = useState<number | null>(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(payment.vaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const instructions = [
    {
      title: "ATM Transfer",
      steps: [
        "Masukkan kartu ATM dan PIN Anda.",
        "Pilih menu 'Transaksi Lainnya'.",
        "Pilih menu 'Transfer'.",
        "Pilih 'Ke Rekening Virtual Account'.",
        `Masukkan nomor VA: ${payment.vaNumber}`,
        "Konfirmasi tagihan dan tekan 'Ya' untuk membayar."
      ]
    },
    {
      title: "Mobile Banking",
      steps: [
        "Login ke aplikasi mobile banking Anda.",
        "Pilih menu 'Transfer' atau 'Pembayaran'.",
        "Pilih 'Virtual Account'.",
        `Input nomor VA: ${payment.vaNumber}`,
        "Periksa nominal tagihan yang muncul.",
        "Masukkan PIN mobile banking Anda untuk memproses."
      ]
    },
    {
      title: "Internet Banking",
      steps: [
        "Login ke portal internet banking Anda.",
        "Navigasi ke menu 'Transfer' > 'Virtual Account'.",
        `Masukkan kode Virtual Account: ${payment.vaNumber}`,
        "Pilih rekening sumber dana.",
        "Verifikasi detail pembayaran.",
        "Gunakan token/OTP Anda untuk menyelesaikan transaksi."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 pt-6 pb-24 px-4 text-white relative overflow-hidden">
        <div className="relative z-20 flex items-center justify-between mb-4">
          <button 
            onClick={onBackToHome}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-90 border border-white/20"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black tracking-tight">Payment Details</h1>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>

        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-blue-400/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 text-center">
          <p className="text-blue-100 font-bold text-[10px] uppercase tracking-widest opacity-80 mb-1">Transaction Status</p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-wider">Awaiting Payment</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-16 space-y-4 relative z-10">
        {/* Main Payment Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-blue-900/5 border border-slate-100">
          {/* Countdown Timer */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <Clock size={16} />
              <span className="text-sm font-black tracking-widest">{formatTime(timeLeft)}</span>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mb-4 border border-blue-200">
              <span className="text-blue-900 font-black text-xl">{payment.bank}</span>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Payment</p>
            <h2 className="text-3xl font-black text-blue-900 tracking-tighter">Rp {payment.amount.toLocaleString('id-ID')}</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Virtual Account Number</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 tracking-wider">{payment.vaNumber}</span>
                <button 
                  onClick={handleCopy}
                  className={`p-2 rounded-xl transition-all active:scale-90 flex items-center gap-2 ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-800'}`}
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  <span className="text-xs font-black uppercase">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <Info size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-orange-800 font-bold leading-relaxed">
                Harap selesaikan pembayaran sebelum waktu habis untuk menghindari pembatalan otomatis.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Payment Instructions</h3>
          </div>
          <div className="space-y-2">
            {instructions.map((inst, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button 
                  onClick={() => setActiveInstruction(activeInstruction === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 active:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-black text-slate-900">{inst.title}</span>
                  {activeInstruction === idx ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>
                {activeInstruction === idx && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                    <ol className="space-y-3">
                      {inst.steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex gap-3">
                          <span className="w-5 h-5 flex-shrink-0 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-[10px] font-black border border-blue-200">
                            {sIdx + 1}
                          </span>
                          <span className="text-xs text-slate-700 font-bold leading-tight">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Home Button (Moved to bottom secondary action if needed, otherwise header is enough) */}
        <div className="pt-4 text-center">
            <button 
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-blue-800 transition-colors"
            >
              <Home size={14} />
              Return to Homepage
            </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCompletionView;
