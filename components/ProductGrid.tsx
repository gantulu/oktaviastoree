
import React from 'react';
import { Product } from '../types';
import { Star } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const formatRating = (rating: string | number) => {
  const r = parseFloat(String(rating));
  if (isNaN(r)) return '5.00';
  return (r / 100).toFixed(2);
};

const formatSold = (sold: string | number) => {
  const s = parseInt(String(sold).replace(/\D/g, ''));
  if (isNaN(s)) return '0 Terjual';
  return new Intl.NumberFormat('id-ID').format(s) + ' Terjual';
};

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => {
  return (
    <div className="grid grid-cols-2 gap-3 pb-8">
      {products.map((product, idx) => (
        <div 
          key={idx} 
          onClick={() => onProductClick(product)}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="aspect-square relative">
            <img 
              src={product.image_link} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
            {product.discount_percentage && product.discount_percentage !== '0' && (
              <div className="absolute top-2 left-2 bg-blue-800 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                {product.discount_percentage}% OFF
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 leading-tight">
              {product.title}
            </h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <span className="text-blue-800 font-black text-sm">Rp {product.sale_price || product.price}</span>
                {product.sale_price && (
                  <span className="text-slate-500 line-through text-[10px] font-bold">Rp {product.price}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-0.5">
                <Star size={10} className="fill-yellow-400 text-yellow-500" />
                <span className="text-[10px] text-slate-800 font-bold">
                  {formatRating(product.rating)}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">|</span>
              <span className="text-[10px] text-slate-600 font-bold">
                {formatSold(product.sold)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;