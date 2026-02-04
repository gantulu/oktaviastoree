
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, AlertCircle, Save, X, Truck, ChevronDown, Clock, CreditCard } from 'lucide-react';
import { CartItem, UserAccount, PaymentDetails } from '../types';

interface CheckoutViewProps {
  cart: CartItem[];
  user: UserAccount | null;
  onBack: () => void;
  onSuccess: (payment: PaymentDetails) => void;
  onNavigateToProfile: () => void;
  onUpdateUser: (data: Partial<UserAccount>) => Promise<void>;
}

const SHIPPING_DATA = [
  { "type_pengiriman": "JNE", "metode_pengiriman": "JNE REG", "biaya_kirim": 30000, "estimasi": "2-3 hari" },
  { "type_pengiriman": "JNE", "metode_pengiriman": "JNE YES", "biaya_kirim": 50000, "estimasi": "1 hari" },
  { "type_pengiriman": "J&T", "metode_pengiriman": "J&T REG", "biaya_kirim": 24000, "estimasi": "2-3 hari" },
  { "type_pengiriman": "J&T", "metode_pengiriman": "J&T YES", "biaya_kirim": 44000, "estimasi": "1 hari" },
  { "type_pengiriman": "POS", "metode_pengiriman": "POS Indonesia REG", "biaya_kirim": 20000, "estimasi": "3-5 hari" },
  { "type_pengiriman": "SiCepat", "metode_pengiriman": "SiCepat REG", "biaya_kirim": 24000, "estimasi": "2-3 hari" },
  { "type_pengiriman": "SiCepat", "metode_pengiriman": "SiCepat BEST", "biaya_kirim": 44000, "estimasi": "1 hari" },
  { "type_pengiriman": "TIKI", "metode_pengiriman": "TIKI REG", "biaya_kirim": 30000, "estimasi": "2-4 hari" },
  { "type_pengiriman": "TIKI", "metode_pengiriman": "TIKI ONS", "biaya_kirim": 50000, "estimasi": "1 hari" },
  { "type_pengiriman": "Grab", "metode_pengiriman": "GrabExpress", "biaya_kirim": 36000, "estimasi": "1 hari" },
  { "type_pengiriman": "Gojek", "metode_pengiriman": "Gojek Instant", "biaya_kirim": 40000, "estimasi": "1 hari" },
  { "type_pengiriman": "AnterAja", "metode_pengiriman": "AnterAja REG", "biaya_kirim": 24000, "estimasi": "2-3 hari" },
  { "type_pengiriman": "AnterAja", "metode_pengiriman": "AnterAja YES", "biaya_kirim": 44000, "estimasi": "1 hari" }
];

const PROVINSI_LIST = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Bengkulu", 
  "Sumatera Selatan", "Kepulauan Bangka Belitung", "Lampung", "Banten", "Jawa Barat", 
  "DKI Jakarta", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat", 
  "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", 
  "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", 
  "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Maluku Utara", 
  "Papua Barat", "Papua"
];

const BANK_LIST = [
  {"bank": "BNI", "va_number": "8848066554909394"},
  {"bank": "BRIVA", "va_number": "7878925554909394"},
  {"bank": "Mandiri", "va_number": "8804925554909394"},
  {"bank": "BCA", "va_number": "11717081350968308"},
  {"bank": "CIMB Niaga", "va_number": "5919025554909394"},
  {"bank": "Permata", "va_number": "8625025554909394"},
  {"bank": "Danamon", "va_number": "7915025554909394"}
];

const CheckoutView: React.FC<CheckoutViewProps> = ({ cart, user, onBack, onSuccess, onNavigateToProfile, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [shippingType, setShippingType] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');

  const addressParts = user?.shippingAddresses ? user.shippingAddresses.split(',') : [];
  const hasAddress = addressParts.length === 6;

  const [editForm, setEditForm] = useState({
    nama: user?.nama || '',
    phone: user?.phone || '',
    provinsi: addressParts[0] || '',
    kabupaten: addressParts[1] || '',
    kecamatan: addressParts[2] || '',
    kelurahan: addressParts[3] || '',
    kodepos: addressParts[4] || '',
    jalan: addressParts[5] || ''
  });

  useEffect(() => {
    if (user) {
      const parts = user.shippingAddresses ? user.shippingAddresses.split(',') : [];
      setEditForm({
        nama: user.nama,
        phone: user.phone,
        provinsi: parts[0] || '',
        kabupaten: parts[1] || '',
        kecamatan: parts[2] || '',
        kelurahan: parts[3] || '',
        kodepos: parts[4] || '',
        jalan: parts[5] || ''
      });
    }
  }, [user]);

  const totalPrice = cart.reduce((sum, item) => {
    const priceNum = parseInt((item.sale_price || item.price).replace(/\./g, ''));
    return sum + (priceNum * item.quantity);
  }, 0);

  const selectedShipping = SHIPPING_DATA.find(s => s.metode_pengiriman === shippingMethod);
  const shippingFee = selectedShipping ? selectedShipping.biaya_kirim : 0;
  const platformFee = 2000;
  const grandTotal = totalPrice + shippingFee + platformFee;

  const formattedAddress = hasAddress 
    ? `${addressParts[5]}, ${addressParts[3]}, ${addressParts[2]}, ${addressParts[1]}, ${addressParts[0]} (${addressParts[4]})`
    : 'No shipping address set yet.';

  const handleSaveAddress = async () => {
    if (!editForm.nama || !editForm.phone || !editForm.provinsi || !editForm.jalan) {
      alert('Please fill in the required fields (Name, Phone, Province, and Full Address).');
      return;
    }
    setSavingAddress(true);
    const shippingAddresses = `${editForm.provinsi},${editForm.kabupaten},${editForm.kecamatan},${editForm.kelurahan},${editForm.kodepos},${editForm.jalan}`;
    await onUpdateUser({
      nama: editForm.nama,
      phone: editForm.phone,
      shippingAddresses
    });
    setSavingAddress(false);
    setIsDrawerOpen(false);
  };

  const handlePay = () => {
    if (!hasAddress) {
      alert('Please set your shipping address.');
      return;
    }
    if (!shippingMethod) {
      alert('Please select a shipping method.');
      return;
    }
    if (!selectedBank) {
      alert('Please select a payment method (Bank VA).');
      return;
    }
    
    const bankInfo = BANK_LIST.find(b => b.bank === selectedBank);
    if (!bankInfo) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        bank: selectedBank,
        vaNumber: bankInfo.va_number,
        amount: grandTotal
      });
    }, 2000);
  };

  const shippingTypes = Array.from(new Set(SHIPPING_DATA.map(s => s.type_pengiriman)));
  const availableMethods = SHIPPING_DATA.filter(s => s.type_pengiriman === shippingType);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="fixed top-0 left-0 right-0 max-w-[500px] mx-auto h-16 bg-white border-b border-slate-200 flex items-center px-4 z-40">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-950 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 text-lg font-black text-slate-950">Checkout</h2>
      </div>

      <div className="pt-5 px-4 space-y-4">
        {/* Shipping Address Section (Moved to TOP) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl text-orange-800 border border-orange-200">
                <MapPin size={20} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Shipping Address</h3>
            </div>
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="text-blue-800 text-xs font-black hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors border border-blue-200"
            >
              {hasAddress ? 'Edit' : 'Add'}
            </button>
          </div>
          
          {hasAddress ? (
            <div className="space-y-1.5">
              <p className="text-xs font-black text-slate-950">{user?.nama} | {user?.phone}</p>
              <p className="text-xs text-slate-700 font-bold leading-relaxed">{formattedAddress}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-2xl border border-dashed border-slate-300">
              <AlertCircle size={18} className="text-slate-500" />
              <p className="text-[11px] font-black text-slate-600">Please set your shipping address.</p>
            </div>
          )}
        </div>

        {/* Order Summary Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Order Summary</h3>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1 -mr-1 hide-scrollbar">
            {cart.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <img src={item.image_link} alt={item.title} className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-xs font-black text-slate-950 line-clamp-1">{item.title}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-tight">Qty: {item.quantity}</p>
                    <p className="text-sm font-black text-blue-800">Rp {item.sale_price || item.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Selection Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-800 border border-blue-200">
              <Truck size={20} />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Shipping Selection</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">Shipping Provider</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none appearance-none cursor-pointer"
                  value={shippingType}
                  onChange={(e) => {
                    setShippingType(e.target.value);
                    setShippingMethod('');
                  }}
                >
                  <option value="">Select Provider</option>
                  {shippingTypes.map((type, i) => (
                    <option key={i} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              </div>
            </div>

            {shippingType && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">Shipping Service</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none appearance-none cursor-pointer"
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                  >
                    <option value="">Select Service</option>
                    {availableMethods.map((method, i) => (
                      <option 
                        key={i} 
                        value={method.metode_pengiriman} 
                        disabled={method.estimasi === "1 hari"}
                      >
                        {method.metode_pengiriman} - Rp {method.biaya_kirim.toLocaleString('id-ID')} {method.estimasi === "1 hari" ? "(Unavailable)" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Section (ADDED) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-800 border border-indigo-200">
              <CreditCard size={20} />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Payment Method</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">Virtual Account Bank</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none appearance-none cursor-pointer"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                >
                  <option value="">Select Bank</option>
                  {BANK_LIST.map((b, i) => (
                    <option key={i} value={b.bank}>{b.bank} Virtual Account</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Billing Details Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Subtotal</span>
            <span className="text-xs font-black text-slate-950">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Shipping Fee</span>
            <span className="text-xs font-black text-slate-950">Rp {shippingFee.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Platform Fee</span>
            <span className="text-xs font-black text-slate-950">Rp {platformFee.toLocaleString('id-ID')}</span>
          </div>
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm font-black text-slate-950 uppercase tracking-tight">Total Payment</span>
            <span className="text-xl font-black text-blue-900 tracking-tighter">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Payment Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto p-4 bg-white border-t border-slate-200 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[32px]">
        <button 
          onClick={handlePay}
          disabled={loading || !hasAddress || isDrawerOpen || !shippingMethod || !selectedBank}
          className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            `Pay Rp ${grandTotal.toLocaleString('id-ID')}`
          )}
        </button>
      </div>

      {/* Shipping Address Bottom Drawer */}
      <div 
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isDrawerOpen ? 'bg-slate-900/70 backdrop-blur-sm opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsDrawerOpen(false)}
      />
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[70] max-w-[500px] mx-auto bg-white rounded-t-[32px] shadow-2xl transition-transform duration-500 ease-out transform ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-2" />
        <div className="p-6 max-h-[90vh] overflow-y-auto hide-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-800 border border-blue-200">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">Shipping Address</h3>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Recipient Information</p>
              </div>
            </div>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-90 transition-transform">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">Recipient Name</label>
                <input 
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => setEditForm({...editForm, nama: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">Phone Number</label>
                <input 
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-700"
                  placeholder="08xxxxxxxx"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">Province</label>
                <div className="relative">
                  <select 
                    value={editForm.provinsi}
                    onChange={(e) => setEditForm({...editForm, provinsi: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select Province</option>
                    {PROVINSI_LIST.map((p, i) => (
                      <option key={i} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">City/Regency</label>
                <input 
                  type="text"
                  value={editForm.kabupaten}
                  onChange={(e) => setEditForm({...editForm, kabupaten: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-700"
                  placeholder="City"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">District</label>
                <input 
                  type="text"
                  value={editForm.kecamatan}
                  onChange={(e) => setEditForm({...editForm, kecamatan: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-700"
                  placeholder="District"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">Sub-District</label>
                <input 
                  type="text"
                  value={editForm.kelurahan}
                  onChange={(e) => setEditForm({...editForm, kelurahan: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-700"
                  placeholder="Sub-district"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">Postcode</label>
              <input 
                type="number"
                value={editForm.kodepos}
                onChange={(e) => setEditForm({...editForm, kodepos: e.target.value})}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-700"
                placeholder="e.g. 12345"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-wider">Full Address Details</label>
              <textarea 
                rows={3}
                value={editForm.jalan}
                onChange={(e) => setEditForm({...editForm, jalan: e.target.value})}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-xs font-black text-slate-900 outline-none resize-none focus:ring-2 focus:ring-blue-700"
                placeholder="Street name, building number, house number..."
              />
            </div>
          </div>

          <div className="flex gap-3 sticky bottom-0 bg-white pt-2">
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm border border-slate-300 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveAddress}
              disabled={savingAddress}
              className="flex-[2] bg-blue-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {savingAddress ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><Save size={18} /> Save Address</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
