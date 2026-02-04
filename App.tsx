
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, User, ArrowLeft, ChevronRight, Star, Plus, Minus, Trash2, CheckCircle, Filter } from 'lucide-react';
import { Product, CartItem, View, AppState, UserAccount, PaymentDetails } from './types';
import Header from './components/Header';
import BannerCarousel from './components/BannerCarousel';
import FlashSale from './components/FlashSale';
import ProductGrid from './components/ProductGrid';
import DetailView from './components/DetailView';
import CheckoutView from './components/CheckoutView';
import CartDrawer from './components/CartDrawer';
import ProfileView from './components/ProfileView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import PaymentCompletionView from './components/PaymentCompletionView';
import SplashScreen from './components/SplashScreen';

const LOCAL_STORAGE_KEY = 'oktavia_cart';
const USER_STORAGE_KEY = 'oktavia_user';
const AUTH_LOGIN_KEY = 'authLogin';

const AIRTABLE_API_KEY = 'patsOC1DfB0tSGj71.39d3ea7bd41b74b424e8392bd353e4dfe874eff92321a629a4319d2f6716c718';
const AIRTABLE_BASE_ID = 'appBGOCgeMmRfLAHj';
const AIRTABLE_TABLE_NAME = 'user';

const App: React.FC = () => {
  const [isSplashing, setIsSplashing] = useState(true);
  const [state, setState] = useState<AppState>(() => {
    const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const hasAuth = localStorage.getItem(AUTH_LOGIN_KEY);
    
    return {
      view: hasAuth ? 'home' : 'login',
      selectedProduct: null,
      cart: savedCart ? JSON.parse(savedCart) : [],
      currentUser: savedUser ? JSON.parse(savedUser) : null,
    };
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://opensheet.elk.sh/1x2Rtyeyq3WR6yFybA8stGP0mdI2dlKvBz6fhx7FIjhQ/Sheet1');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const autoLogin = async () => {
      const auth = localStorage.getItem(AUTH_LOGIN_KEY);
      if (!auth) {
        if (state.view === 'profile' || state.view === 'checkout') {
          setState(prev => ({ ...prev, view: 'login' }));
        }
        return;
      }

      try {
        const { phone, password } = JSON.parse(auth);
        const formula = `AND({phone}='${phone}', {password}='${password}')`;
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(formula)}`;
        
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.records && data.records.length > 0) {
            const userFields = data.records[0].fields;
            const user: UserAccount = {
              id: data.records[0].id,
              nama: userFields.nama,
              phone: userFields.phone,
              avatar: userFields.avatar,
              membership_points: Number(userFields.membership_points || 0),
              membership_balance: Number(userFields.membership_balance || 0),
              orders: userFields.orders || '[]',
              wishlist: userFields.wishlist || '',
              paymentMethods: userFields.paymentMethods || '',
              shippingAddresses: userFields.shippingAddresses || '',
              notifications: userFields.notifications || '[]',
            };
            setState(prev => ({ ...prev, currentUser: user }));
          } else {
            localStorage.removeItem(AUTH_LOGIN_KEY);
            setState(prev => ({ ...prev, currentUser: null, view: 'login' }));
          }
        }
      } catch (err) {
        console.error('Auto-login error:', err);
      }
    };

    if (!state.currentUser) {
      autoLogin();
    }
  }, [state.view]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [state.currentUser]);

  const groupedProducts = useMemo(() => {
    const seen = new Set<string>();
    const unique = products.filter(p => {
      if (!p.item_group_id) return true;
      if (seen.has(p.item_group_id)) return false;
      seen.add(p.item_group_id);
      return true;
    });

    if (selectedCategory === 'All') return unique;
    return unique.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean) as string[];
    return ['All', ...Array.from(new Set(cats))];
  }, [products]);

  const navigateTo = (view: View, product: Product | null = null, payment?: PaymentDetails) => {
    const hasAuth = localStorage.getItem(AUTH_LOGIN_KEY);
    if ((view === 'profile' || view === 'checkout' || view === 'payment') && !hasAuth) {
      setState(prev => ({ ...prev, view: 'login', selectedProduct: product }));
    } else {
      setState(prev => ({ ...prev, view, selectedProduct: product, pendingPayment: payment }));
    }
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setState(prev => ({ ...prev, currentUser: user, view: 'home' }));
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_LOGIN_KEY);
    setState(prev => ({ ...prev, currentUser: null, view: 'login' }));
  };

  const handleToggleWishlist = async (product: Product) => {
    if (!state.currentUser) {
      navigateTo('login', product);
      return;
    }

    const currentWishlistStr = state.currentUser.wishlist || '';
    const wishlistItems = currentWishlistStr ? currentWishlistStr.split('|').filter(Boolean) : [];
    
    const isMatch = (jsonStr: string) => {
      try {
        const item = JSON.parse(jsonStr);
        return item.title === product.title && item.color === product.color && item.size === product.size;
      } catch {
        return false;
      }
    };

    const existingIndex = wishlistItems.findIndex(isMatch);
    let newWishlistStr = '';

    if (existingIndex > -1) {
      // Remove
      const filtered = wishlistItems.filter((_, i) => i !== existingIndex);
      newWishlistStr = filtered.join('|');
    } else {
      // Add
      const newItem = {
        title: product.title,
        image_link: product.image_link,
        price: product.price,
        sale_price: product.sale_price,
        color: product.color,
        size: product.size
      };
      const newItemStr = JSON.stringify(newItem);
      newWishlistStr = wishlistItems.length > 0 ? `${currentWishlistStr}|${newItemStr}` : newItemStr;
    }

    const updatedUser = { ...state.currentUser, wishlist: newWishlistStr };
    setState(prev => ({ ...prev, currentUser: updatedUser }));

    try {
      if (updatedUser.id) {
        await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            records: [{
              id: updatedUser.id,
              fields: { wishlist: newWishlistStr }
            }]
          })
        });
      }
    } catch (err) {
      console.error('Failed to sync wishlist to Airtable:', err);
    }
  };

  const handleUpdateUser = async (data: Partial<UserAccount>) => {
    if (!state.currentUser?.id) return;

    const updatedUser = { ...state.currentUser, ...data };
    setState(prev => ({ ...prev, currentUser: updatedUser }));

    try {
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            id: state.currentUser.id,
            fields: data
          }]
        })
      });
    } catch (err) {
      console.error('Failed to sync user data to Airtable:', err);
    }
  };

  const handleSavePaymentMethod = async (methodStr: string) => {
    await handleUpdateUser({ paymentMethods: methodStr });
  };

  const handleSaveShippingAddress = async (addressStr: string) => {
    await handleUpdateUser({ shippingAddresses: addressStr });
  };

  const isProductInWishlist = (product: Product) => {
    if (!state.currentUser || !state.currentUser.wishlist) return false;
    const wishlistItems = state.currentUser.wishlist.split('|').filter(Boolean);
    return wishlistItems.some(jsonStr => {
      try {
        const item = JSON.parse(jsonStr);
        return item.title === product.title && item.color === product.color && item.size === product.size;
      } catch {
        return false;
      }
    });
  };

  const addToCartInternal = (product: Product) => {
    setState(prev => {
      const isMatch = (item: CartItem) => 
        item.title === product.title && 
        item.color === product.color && 
        item.size === product.size &&
        item.connectivity === product.connectivity &&
        item.band_color === product.band_color &&
        item.band_type === product.band_type;

      const existingIndex = prev.cart.findIndex(isMatch);
      
      if (existingIndex > -1) {
        const newCart = [...prev.cart];
        newCart[existingIndex] = { 
          ...newCart[existingIndex], 
          quantity: newCart[existingIndex].quantity + 1 
        };
        return { ...prev, cart: newCart };
      }

      const cartItem: CartItem = {
        ...product,
        quantity: 1
      };

      return { ...prev, cart: [...prev.cart, cartItem] };
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCartInternal(product);
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product) => {
    addToCartInternal(product);
    navigateTo('checkout');
  };

  const updateCartQuantity = (id: string, title: string, delta: number) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.map(item => 
        (item.item_group_id === id && item.title === title) 
          ? { ...item, quantity: Math.max(0, item.quantity + delta) } 
          : item
      ).filter(item => item.quantity > 0)
    }));
  };

  const removeFromCart = (id: string, title: string) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => !(item.item_group_id === id && item.title === title))
    }));
  };

  const renderContent = () => {
    if (loading && !isSplashing) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
          <p className="mt-4 text-slate-700 font-bold">Refreshing data...</p>
        </div>
      );
    }

    const hasAuth = localStorage.getItem(AUTH_LOGIN_KEY);
    if ((state.view === 'profile' || state.view === 'checkout' || state.view === 'payment') && !hasAuth) {
      return <LoginView 
        onBack={() => navigateTo('home')} 
        onNavigateToRegister={() => navigateTo('register')}
        onLoginSuccess={handleLoginSuccess}
      />;
    }

    switch (state.view) {
      case 'home':
        return (
          <div className="pb-20">
            <BannerCarousel />
            <FlashSale 
              products={products.filter(p => p.event_tag === 'flashsale')} 
              onProductClick={(p) => navigateTo('detail', p)}
            />
            
            <div className="mt-4">
              <div className="px-4 flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-slate-900">Recommendations</h2>
                <span className="text-xs text-slate-600 font-bold">{groupedProducts.length} Items</span>
              </div>

              <div className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 mb-4 shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                  <div className="flex-shrink-0 bg-white border border-slate-300 p-2 rounded-xl text-slate-600 shadow-sm">
                    <Filter size={18} />
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex-shrink-0 px-5 py-2 rounded-xl text-xs font-black transition-all border ${
                        selectedCategory === cat 
                          ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white border-transparent shadow-md shadow-blue-900/20 scale-105' 
                          : 'bg-white text-slate-700 border-slate-300 hover:border-blue-700 hover:text-blue-700 shadow-sm'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4">
                <ProductGrid 
                  products={groupedProducts} 
                  onProductClick={(p) => navigateTo('detail', p)}
                />
              </div>
            </div>
          </div>
        );
      case 'detail':
        return state.selectedProduct ? (
          <DetailView 
            product={state.selectedProduct} 
            variants={products.filter(p => p.item_group_id === state.selectedProduct?.item_group_id)}
            onBack={() => navigateTo('home')} 
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectVariant={(p) => setState(prev => ({ ...prev, selectedProduct: p }))}
            onToggleWishlist={handleToggleWishlist}
            isInWishlist={isProductInWishlist(state.selectedProduct)}
            onCartClick={() => setIsCartOpen(true)}
          />
        ) : null;
      case 'checkout':
        return (
          <CheckoutView 
            cart={state.cart} 
            user={state.currentUser}
            onBack={() => navigateTo('home')} 
            onSuccess={(payment) => {
              navigateTo('payment', null, payment);
              setState(prev => ({ ...prev, cart: [] }));
            }}
            onNavigateToProfile={() => navigateTo('profile')}
            onUpdateUser={handleUpdateUser}
          />
        );
      case 'payment':
        return state.pendingPayment ? (
          <PaymentCompletionView 
            payment={state.pendingPayment} 
            onBackToHome={() => navigateTo('home')} 
          />
        ) : null;
      case 'profile':
        return (
          <ProfileView 
            onBack={() => navigateTo('home')} 
            onLoginRequired={() => navigateTo('login')} 
            user={state.currentUser}
            onLogout={handleLogout}
            onRemoveFromWishlist={handleToggleWishlist}
            onSavePaymentMethod={handleSavePaymentMethod}
            onSaveShippingAddress={handleSaveShippingAddress}
          />
        );
      case 'login':
        return <LoginView 
          onBack={() => navigateTo('home')} 
          onNavigateToRegister={() => navigateTo('register')}
          onLoginSuccess={handleLoginSuccess}
        />;
      case 'register':
        return <RegisterView 
          onBack={() => navigateTo('home')} 
          onNavigateToLogin={() => navigateTo('login')}
          onRegisterSuccess={() => navigateTo('login')}
        />;
      default:
        return null;
    }
  };

  const handleSplashFinish = () => {
    setIsSplashing(false);
    
    // Attempt Fullscreen API to maximize real estate
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen denied or failed', err);
      });
    }

    // Intercept back button to prevent accidental exit
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, "", window.location.href);
    };
  };

  return (
    <div className="max-w-[500px] mx-auto min-h-screen bg-slate-50 relative shadow-xl overflow-x-hidden">
      {isSplashing && <SplashScreen isLoading={loading} onFinish={handleSplashFinish} />}
      
      {!isSplashing && state.view !== 'login' && state.view !== 'register' && state.view !== 'payment' && (
        <Header 
          cartCount={state.cart.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
          onProfileClick={() => navigateTo('profile')}
          onLogoClick={() => navigateTo('home')}
        />
      )}
      
      {!isSplashing && (
        <main className={state.view === 'login' || state.view === 'register' ? "" : "pt-16"}>
          {renderContent()}
        </main>
      )}

      {!isSplashing && (
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={state.cart}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
          onCheckout={() => {
            setIsCartOpen(false);
            navigateTo('checkout');
          }}
        />
      )}
    </div>
  );
};

export default App;
