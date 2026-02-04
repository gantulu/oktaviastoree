
import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  isLoading: boolean;
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading, onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timer: number;
    if (progress < 100) {
      // Logic: Stall at 90% if API is still loading, rush to 100% when loading is done.
      const increment = isLoading ? (progress < 90 ? 1 : 0) : 5;
      timer = window.setTimeout(() => {
        setProgress(prev => Math.min(prev + increment, 100));
      }, progress < 90 ? 40 : 20);
    } else {
      // Automatically show welcome popup once progress reaches 100%
      const popupTimer = setTimeout(() => {
        setShowPopup(true);
      }, 300);
      return () => clearTimeout(popupTimer);
    }
    return () => clearTimeout(timer);
  }, [progress, isLoading]);

  const handleEnter = () => {
    setIsClosing(true);
    // Allow animation to finish before calling onFinish
    setTimeout(() => {
      onFinish();
    }, 600);
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="w-32 h-32 mb-6">
          <img 
            src="https://uploads.onecompiler.io/43ruvewfy/3x8jsfjch/Gemini_Generated_Image_rioqsurioqsurioq%20(1).png" 
            alt="OktaviaStore Logo" 
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <h1 className="text-2xl font-black text-blue-900 tracking-tight mb-2">Oktavia Store Mobile</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Premium Shopping Experience</p>
        
        <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-black text-blue-800 mt-2 tracking-tighter">{progress}%</span>
      </div>

      {/* Welcome Popup */}
      <div className={`fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center px-8 transition-opacity duration-500 ${showPopup ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white rounded-[40px] p-8 w-full max-w-[340px] text-center shadow-2xl transition-all duration-500 transform ${showPopup ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
          <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-200">
            <img 
              src="https://uploads.onecompiler.io/43ruvewfy/3x8jsfjch/Gemini_Generated_Image_rioqsurioqsurioq%20(1).png" 
              alt="Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <h2 className="text-xl font-black text-slate-950 mb-3 tracking-tight">Selamat Datang!</h2>
          <p className="text-sm text-slate-600 font-bold leading-relaxed mb-8 px-2">
            Nikmati pengalaman belanja premium dengan koleksi terbaik dari Oktavia Store Mobile.
          </p>
          <button 
            onClick={handleEnter}
            className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/30 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Masuk Oktavia Mobile
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
