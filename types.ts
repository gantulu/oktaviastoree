
export interface Product {
  title: string;
  price: string;
  sale_price: string;
  image_link: string;
  additional_image_link?: string;
  discount_percentage: string;
  rating: string;
  sold: string;
  item_group_id: string;
  flashsale: string;
  event_tag?: string; 
  category?: string;
  description?: string;
  color?: string;
  size?: string;
  connectivity?: string;
  band_color?: string;
  band_type?: string;
  quantity_to_sell_on_facebook?: string;
}

export interface UserAccount {
  id?: string; // Airtable Record ID
  nama: string;
  phone: string;
  avatar: string;
  membership_points: number;
  membership_balance: number;
  orders: string;
  wishlist: string;
  paymentMethods: string;
  shippingAddresses: string;
  notifications: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PaymentDetails {
  bank: string;
  vaNumber: string;
  amount: number;
}

export type View = 'home' | 'detail' | 'checkout' | 'profile' | 'login' | 'register' | 'payment';

export interface AppState {
  view: View;
  selectedProduct: Product | null;
  cart: CartItem[];
  currentUser: UserAccount | null;
  pendingPayment?: PaymentDetails;
}
