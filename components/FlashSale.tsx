
import React from 'react';
import { Product } from '../types';

interface FlashSaleProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const FlashSale: React.FC<FlashSaleProps> = ({ products, onProductClick }) => {
  if (products.length === 0) return null;

  return (
    <div className="mt-6 bg-white py-4 shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
      <div className="px-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-900 to-blue-600 text-white p-1.5 rounded-lg shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-slate-900 leading-none">Flash Sale</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 font-black uppercase tracking-tight">Ends In</span>
              <div className="flex items-center gap-1">
                <span className="bg-slate-900 text-white text-[10px] px-1 rounded font-bold">02</span>
                <span className="text-slate-900 text-[10px] font-bold">:</span>
                <span className="bg-slate-900 text-white text-[10px] px-1 rounded font-bold">45</span>
                <span className="text-slate-900 text-[10px] font-bold">:</span>
                <span className="bg-slate-900 text-white text-[10px] px-1 rounded font-bold">12</span>
              </div>
            </div>
          </div>
        </div>
        <button className="text-blue-800 text-xs font-black hover:text-blue-900 flex items-center gap-1">
          View All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-4 px-4">
        {products.map((product, idx) => {
          const progressVal = product.quantity_to_sell_on_facebook ? parseInt(product.quantity_to_sell_on_facebook.replace('%', '')) : 78;
          const progress = isNaN(progressVal) ? 0 : Math.min(Math.max(progressVal, 0), 100);
          
          return (
            <div 
              key={idx} 
              onClick={() => onProductClick(product)}
              className="min-w-[150px] max-w-[150px] group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200 mb-2">
                <img 
                  src={product.image_link} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-bl from-red-700 to-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl shadow-md">
                    {product.discount_percentage}%
                  </div>
                </div>
              </div>
              
              <div className="px-1">
                <div className="flex flex-col mb-2">
                  <span className="text-blue-800 font-black text-base">Rp {product.sale_price}</span>
                  <span className="text-slate-500 line-through text-[11px] font-bold">Rp {product.price}</span>
                </div>
                
                <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-800 to-blue-500 rounded-full flex items-center justify-center transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                  >
                    <span className="text-[8px] text-white font-black whitespace-nowrap px-2">
                      {progress}% SOLD
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-end pr-2 pointer-events-none">
                    <span className="text-[8px] text-slate-600 font-black">
                      {progress > 90 ? 'REMAINING' : 'LIMITED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlashSale;