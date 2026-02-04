
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ArrowLeft, Star, ShoppingCart, ShieldCheck, Truck, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, Heart } from 'lucide-react';

interface DetailViewProps {
  product: Product;
  variants: Product[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onSelectVariant: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: boolean;
  onCartClick?: () => void;
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

const DetailView: React.FC<DetailViewProps> = ({ 
  product, 
  variants, 
  onBack, 
  onAddToCart, 
  onBuyNow, 
  onSelectVariant, 
  onToggleWishlist,
  isInWishlist,
  onCartClick
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = React.useMemo(() => {
    const imgs = [product.image_link];
    if (product.additional_image_link) {
      const additional = product.additional_image_link.split(',').map(s => s.trim()).filter(Boolean);
      imgs.push(...additional);
    }
    return imgs;
  }, [product.image_link, product.additional_image_link]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));
  const connectivityOpts = Array.from(new Set(variants.map(v => v.connectivity).filter(Boolean)));
  const bandColorOpts = Array.from(new Set(variants.map(v => v.band_color).filter(Boolean)));
  const bandTypeOpts = Array.from(new Set(variants.map(v => v.band_type).filter(Boolean)));

  const handleVariantSelect = (attribute: keyof Product, newValue: string) => {
    const target = {
      color: product.color,
      size: product.size,
      connectivity: product.connectivity,
      band_color: product.band_color,
      band_type: product.band_type,
      [attribute]: newValue
    };

    const possibleVariants = variants.filter(v => v[attribute] === newValue);

    if (possibleVariants.length > 0) {
      const bestMatch = possibleVariants.reduce((best, current) => {
        const calculateScore = (v: Product) => {
          let score = 0;
          if (v.color === target.color) score++;
          if (v.size === target.size) score++;
          if (v.connectivity === target.connectivity) score++;
          if (v.band_color === target.band_color) score++;
          if (v.band_type === target.band_type) score++;
          return score;
        };
        
        return calculateScore(current) > calculateScore(best) ? current : best;
      }, possibleVariants[0]);

      onSelectVariant(bestMatch);
      setCurrentImageIndex(0); 
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="fixed top-0 left-0 right-0 max-w-[500px] mx-auto h-16 px-4 flex items-center justify-between bg-white/80 backdrop-blur-md z-40 border-b border-slate-200">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-950 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-1">
          <button onClick={onCartClick} className="p-2 text-slate-950 relative active:scale-90 transition-transform">
            <ShoppingCart size={24} />
          </button>
        </div>
      </div>

      <div className="pt-4">
        <div className="relative aspect-square w-full bg-slate-100 overflow-hidden group border-b border-slate-100">
          <div 
            className="flex transition-transform duration-500 ease-out h-full w-full"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {images.map((img, idx) => (
              <div key={idx} className="min-w-full h-full">
                <img 
                  src={img} 
                  alt={`${product.title} view ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentImageIndex === i ? 'w-6 bg-blue-800' : 'w-1.5 bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {images.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/40 backdrop-blur-sm p-1.5 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/40 backdrop-blur-sm p-1.5 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-blue-800">Rp {product.sale_price || product.price}</span>
              {product.sale_price && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 line-through text-sm font-bold">Rp {product.price}</span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-blue-200 uppercase">
                    {product.discount_percentage}% OFF
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Star size={14} className="fill-yellow-400 text-yellow-500" />
              <span className="text-sm font-black text-slate-900">{formatRating(product.rating)}</span>
              <span className="text-xs text-slate-700 font-bold ml-1">({formatSold(product.sold)})</span>
            </div>
          </div>
          <h1 className="text-lg font-black text-slate-900 leading-snug">{product.title}</h1>
        </div>

        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {colors.length > 0 && (
              <div className="flex flex-col">
                <label className="text-xs font-black text-slate-900 mb-2 uppercase tracking-wide">Color</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-800 outline-none appearance-none cursor-pointer pr-8 text-slate-900"
                    value={product.color || ''}
                    onChange={(e) => handleVariantSelect('color', e.target.value)}
                  >
                    <option value="" disabled>Select Color</option>
                    {colors.map((color, i) => (
                      <option key={i} value={color as string}>{color}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="flex flex-col">
                <label className="text-xs font-black text-slate-900 mb-2 uppercase tracking-wide">Size</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-800 outline-none appearance-none cursor-pointer pr-8 text-slate-900"
                    value={product.size || ''}
                    onChange={(e) => handleVariantSelect('size', e.target.value)}
                  >
                    <option value="" disabled>Select Size</option>
                    {sizes.map((size, i) => (
                      <option key={i} value={size as string}>{size}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4 border-b border-slate-50">
          <div className="flex items-start gap-3">
            <Truck size={18} className="text-blue-700 mt-0.5" />
            <div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Free Shipping</p>
              <p className="text-[11px] text-slate-700 font-medium">Free shipping for minimum purchase of Rp 50.000</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-emerald-700 mt-0.5" />
            <div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">100% Original</p>
              <p className="text-[11px] text-slate-700 font-medium">Full refund if the product is not authentic</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RefreshCw size={18} className="text-blue-700 mt-0.5" />
            <div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">15 Days Return</p>
              <p className="text-[11px] text-slate-700 font-medium">Easy returns if you change your mind</p>
            </div>
          </div>
        </div>

        <div className="p-4 mt-2">
          <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Product Description</h3>
          <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
            {product.description || "This premium product is designed for comfort and durability. Featuring high-quality materials and exquisite craftsmanship, it's perfect for daily use and special occasions alike. Get yours today at OktaviaStore."}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto p-4 bg-white border-t border-slate-200 flex gap-3 z-40 items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => onToggleWishlist(product)}
          className={`p-3.5 rounded-xl border transition-all active:scale-90 ${isInWishlist ? 'text-rose-600 bg-rose-100 border-rose-300' : 'text-slate-600 bg-slate-100 border-slate-300'}`}
          title="Wishlist"
        >
          <Heart size={22} className={isInWishlist ? 'fill-rose-600' : ''} />
        </button>
        <button 
          onClick={() => onAddToCart(product)}
          className="flex-1 border-2 border-blue-800 text-blue-800 font-black py-3 rounded-xl active:scale-95 transition-transform"
        >
          Add to Cart
        </button>
        <button 
          onClick={() => onBuyNow(product)}
          className="flex-[1.5] bg-gradient-to-r from-blue-900 to-blue-700 text-white font-black py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default DetailView;