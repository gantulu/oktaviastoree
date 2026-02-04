
import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, title: string, delta: number) => void;
  onRemove: (id: string, title: string) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onCheckout }) => {
  const totalPrice = cart.reduce((sum, item) => {
    const priceNum = parseInt((item.sale_price || item.price).replace(/\./g, ''));
    return sum + (priceNum * item.quantity);
  }, 0);

  const renderVariants = (item: CartItem) => {
    const variants = [
      { label: 'Color', value: item.color },
      { label: 'Size', value: item.size },
      { label: 'Conn', value: item.connectivity },
      { label: 'Band', value: item.band_color },
      { label: 'Type', value: item.band_type },
    ].filter(v => v.value);

    if (variants.length === 0) return <span className="text-[10px] text-slate-600 font-bold italic">Standard Edition</span>;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {variants.map((v, i) => (
          <span key={i} className="text-[9px] font-black bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300 uppercase tracking-tight">
            {v.value}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`fixed right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-slate-50 z-[60] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl border border-blue-200">
              <ShoppingBag size={20} className="text-blue-800" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950 leading-tight">My Cart</h2>
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{cart.length} Items</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 text-slate-600 hover:text-slate-950 transition-colors bg-slate-100 rounded-full border border-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-10">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4 border border-slate-300">
                <ShoppingBag size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-950 font-black text-base">Your cart is empty</p>
              <p className="text-slate-700 font-medium text-xs mt-1">Looks like you haven't added anything to your cart yet.</p>
              <button 
                onClick={onClose}
                className="mt-6 text-blue-800 font-black text-sm flex items-center gap-2 hover:underline"
              >
                Start Shopping <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="group relative bg-white p-3 rounded-2xl border border-slate-200 shadow-sm transition-all">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                    <img src={item.image_link} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col min-w-0 py-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-black text-slate-900 line-clamp-1 leading-tight">{item.title}</h4>
                      <button 
                        onClick={() => onRemove(item.item_group_id, item.title)}
                        className="text-slate-400 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-1 mb-2">
                      {renderVariants(item)}
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-blue-800 font-black text-sm tracking-tight">Rp {item.sale_price || item.price}</span>
                        {item.sale_price && item.price !== item.sale_price && (
                          <span className="text-[10px] text-slate-500 font-bold line-through">Rp {item.price}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded-lg p-0.5">
                        <button 
                          onClick={() => onUpdateQuantity(item.item_group_id, item.title, -1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-blue-800 hover:bg-white rounded-md transition-all active:scale-90"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-black w-6 text-center text-slate-950">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.item_group_id, item.title, 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-blue-800 hover:bg-white rounded-md transition-all active:scale-90"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="bg-white border-t border-slate-200 p-5 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] rounded-t-[32px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Subtotal</span>
                <span className="text-sm font-black text-slate-900">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Shipping</span>
                <span className="text-[10px] font-black text-emerald-700 uppercase">Calculated at checkout</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between px-1">
                <span className="text-sm font-black text-slate-950 uppercase tracking-tight">Grand Total</span>
                <span className="text-xl font-black text-blue-900 tracking-tighter">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full bg-gradient-to-br from-blue-900 to-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              Checkout Now
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;