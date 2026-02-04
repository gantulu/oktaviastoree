
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Settings, ShoppingBag, Heart, MapPin, Bell, Shield, LogOut, 
  ChevronRight, Star, CreditCard, HelpCircle, LogIn, X, Trash2, Check, 
  ChevronDown, Key, Mail, MessageCircle, Globe, Moon, Eye, EyeOff, Info
} from 'lucide-react';
import { UserAccount, Product } from '../types';

interface ProfileViewProps {
  onBack: () => void;
  onLoginRequired: () => void;
  user: UserAccount | null;
  onLogout: () => void;
  onRemoveFromWishlist: (product: any) => void;
  onSavePaymentMethod: (methodStr: string) => Promise<void>;
  onSaveShippingAddress: (addressStr: string) => Promise<void>;
}

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number | null;
  color: string;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  onBack, 
  onLoginRequired, 
  user, 
  onLogout, 
  onRemoveFromWishlist, 
  onSavePaymentMethod,
  onSaveShippingAddress
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [settingToggles, setSettingToggles] = useState({
    dark: false,
    notifications: true,
    promo: true,
    twoFactor: false
  });

  const getWishlistItems = () => {
    if (!user || !user.wishlist) return [];
    return user.wishlist.split('|').filter(Boolean).map(str => {
      try {
        return JSON.parse(str);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  };

  const wishlistItems = getWishlistItems();
  const wishlistCount = wishlistItems.length;

  const menuSections = [
    {
      title: "",
      items: [
        { id: 'orders', icon: <ShoppingBag size={20} />, label: 'My Orders', badge: user ? JSON.parse(user.orders || '[]').length : null, color: 'text-blue-800' },
        { id: 'wishlist', icon: <Heart size={20} />, label: 'Wishlist', badge: user ? wishlistCount : null, color: 'text-rose-700' },
      ]
    },
    {
      title: "Account Settings",
      items: [
        { id: 'addresses', icon: <MapPin size={20} />, label: 'Shipping Addresses', color: 'text-orange-800' },
        { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications', badge: user ? 'new' : null, color: 'text-amber-800' },
        { id: 'privacy', icon: <Shield size={20} />, label: 'Privacy & Security', color: 'text-indigo-800' },
      ]
    },
    {
      title: "Support",
      items: [
        { id: 'help', icon: <HelpCircle size={20} />, label: 'Help Center', color: 'text-slate-800' },
        { id: 'settings', icon: <Settings size={20} />, label: 'App Settings', color: 'text-slate-800' },
      ]
    }
  ];

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSaving(false);
  };

  const renderWishlist = () => {
    const items = getWishlistItems();
    if (items.length === 0) {
      return (
        <div className="bg-slate-50 rounded-3xl p-8 flex flex-col items-center text-center border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-slate-200">
            <Heart size={32} className="text-slate-400" />
          </div>
          <p className="text-sm font-black text-slate-900 mb-1">Your wishlist is empty</p>
          <p className="text-xs text-slate-700 font-bold leading-relaxed max-w-[200px]">
            Explore products and tap the heart icon to save them here.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 -mr-1 hide-scrollbar">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="bg-white border border-slate-200 p-3 rounded-2xl flex gap-3 shadow-sm hover:border-pink-300 transition-colors">
            <img src={item.image_link} alt={item.title} className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200" />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="text-xs font-black text-slate-900 line-clamp-1 mb-1">{item.title}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-blue-800">Rp {item.sale_price || item.price}</span>
                {(item.color || item.size) && (
                  <span className="text-[9px] font-black text-slate-600 uppercase">
                    {item.color} {item.size ? `| ${item.size}` : ''}
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromWishlist(item);
              }}
              className="p-2 text-slate-400 hover:text-rose-700 transition-colors active:scale-90"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 pt-6 pb-20 px-4 overflow-hidden">
        <div className="relative z-10 flex items-center justify-between mb-8">
          <button 
            onClick={onBack} 
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-90 border border-white/20"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white font-black tracking-tight">My Profile</h1>
          <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all border border-white/20">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white/40 p-1 bg-white/10 backdrop-blur-sm shadow-xl">
              <img 
                src={user?.avatar || "https://picsum.photos/seed/user123/200"} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover shadow-inner" 
              />
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <h2 className="text-xl font-black text-white tracking-tight">{user?.nama || 'Guest User'}</h2>
            <p className="text-blue-100 font-bold text-xs mt-0.5 tracking-wide">{user?.phone || 'Login to access full features'}</p>
          </div>

          {user && (
            <div className="mt-5 flex gap-3">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-2xl flex items-center gap-2">
                <span className="text-[10px] font-black text-white tracking-widest">{user.membership_points.toLocaleString()} PTS</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-2xl flex items-center gap-2">
                <span className="text-[10px] font-black text-white tracking-widest">Rp {user.membership_balance.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 -mt-10 pb-12 relative z-20">
        <div className="space-y-6">
          {!user && (
            <button 
              onClick={onLoginRequired}
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-800 to-blue-600 rounded-3xl shadow-lg shadow-blue-900/20 text-white active:scale-[0.98] transition-all border border-blue-400"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 rounded-xl">
                  <LogIn size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black tracking-tight uppercase">Login Required</p>
                  <p className="text-[10px] font-bold text-blue-50">Manage your orders & wishlist</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </button>
          )}

          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-2">
              <h3 className="px-2 text-[11px] font-black text-slate-700 uppercase tracking-widest">{section.title}</h3>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {section.items.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleItemClick(item)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-all active:bg-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl bg-slate-100 ${item.color} border border-slate-200`}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-black text-slate-900">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(item.badge !== null && item.badge !== undefined) && (
                        <span className={`px-2 py-0.5 ${item.badge === 'new' ? 'bg-red-700 text-white' : 'bg-blue-800 text-white'} text-[9px] font-black rounded-full uppercase tracking-tighter`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {user && (
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 py-4 text-red-700 font-black text-sm bg-white rounded-3xl border border-red-200 shadow-sm active:scale-[0.98] transition-all hover:bg-red-50"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          )}
        </div>
        
        <div className="mt-10 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 opacity-40">
             <div className="h-px w-8 bg-slate-600"></div>
             <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Version 2.4.0</span>
             <div className="h-px w-8 bg-slate-600"></div>
          </div>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">© 2025 OktaviaStore Mobile. All rights reserved.</p>
        </div>
      </div>

      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${drawerOpen ? 'bg-slate-900/80 backdrop-blur-sm pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={closeDrawer}
      />
      <div 
        className={`fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto z-[60] bg-white rounded-t-[32px] shadow-2xl transition-transform duration-500 ease-out transform ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-2" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-slate-100 ${selectedItem?.color} border border-slate-200`}>
                {selectedItem?.icon}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">{selectedItem?.label}</h2>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Profile Management</p>
              </div>
            </div>
            <button 
              onClick={closeDrawer}
              className="p-2 bg-slate-100 border border-slate-200 rounded-full text-slate-600 active:scale-90 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 pb-8">
            {selectedItem?.id === 'wishlist' ? renderWishlist() : renderWishlist()}

            <button 
              onClick={closeDrawer}
              className="w-full bg-slate-950 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;