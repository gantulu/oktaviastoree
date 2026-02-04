
import React, { useState, useEffect } from 'react';

const banners = [
  { id: 1, image: 'https://picsum.photos/seed/shop1/800/400', title: 'Tech Mega Sale', subtitle: 'Up to 70% Off' },
  { id: 2, image: 'https://picsum.photos/seed/shop2/800/400', title: 'Fashion Week', subtitle: 'New Arrivals' },
  { id: 3, image: 'https://picsum.photos/seed/shop3/800/400', title: 'Home Decor', subtitle: 'Special Discounts' },
];

const BannerCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-48 overflow-hidden bg-slate-200">
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full relative h-full">
            <img 
              src={banner.image} 
              alt={banner.title} 
              className="w-full h-full object-cover brightness-75"
            />
            <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
              <h3 className="text-2xl font-bold mb-1 drop-shadow-md">{banner.title}</h3>
              <p className="text-sm font-medium opacity-90">{banner.subtitle}</p>
              <button className="mt-4 w-fit px-4 py-1.5 bg-gradient-to-r from-blue-900 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {banners.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all ${current === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
