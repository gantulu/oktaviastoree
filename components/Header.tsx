
import React from 'react';
import { ShoppingCart, User } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onProfileClick: () => void;
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartCount, onCartClick, onProfileClick, onLogoClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 max-w-[500px] mx-auto bg-white/80 backdrop-blur-md z-40 border-b border-slate-100 px-4 h-16 flex items-center justify-between">
      <div 
        onClick={onLogoClick}
        className="cursor-pointer flex items-center h-full py-2"
      >
        <img 
          src="https://uploads.onecompiler.io/43ruvewfy/3x8jsfjch/Gemini_Generated_Image_rioqsurioqsurioq%20(1).png" 
          alt="OktaviaStore Logo" 
          className="h-full object-contain"
        />
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onCartClick}
          className="relative p-2 text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ShoppingCart size={24} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-gradient-to-r from-blue-900 to-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
        <button 
          onClick={onProfileClick}
          className="p-2 text-slate-600 hover:text-blue-700 transition-colors"
        >
          <User size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
