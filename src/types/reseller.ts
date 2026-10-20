export type ResellerStatus = 'active' | 'suspended' | 'pending';
export type PayoutMethod = 'upi' | 'bank';
export type ListingStatus = 'active' | 'paused' | 'suspended' | 'rejected';

export interface PayoutDetails {
  upiId?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
}

export interface ResellerProfile {
  userId: string;
  displayName: string;
  email: string;
  phone?: string;
  status: ResellerStatus;
  payoutMethod?: PayoutMethod;
  payoutDetails?: PayoutDetails;
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResellerListing {
  id: string;
  slug: string;
  resellerId: string;
  resellerName: string;
  originalProductId: string;
  originalProductSlug: string;
  basePrice: number;
  resalePrice: number;
  grossMargin: number;
  customTitle: string;
  customSubtitle?: string;
  customShortDescription?: string;
  customDescription?: string;
  coverImage?: string;
  status: ListingStatus;
  viewsCount: number;
  salesCount: number;
  totalRevenue: number;
  totalEarned: number;
  createdAt: string;
  updatedAt: string;
}

export type WalletTransactionType =
  | 'sale_available'
  | 'sale_pending'
  | 'withdrawal_requested'
  | 'withdrawal_paid'
  | 'withdrawal_rejected'
  | 'refund_reversal'
  | 'chargeback_reversal'
  | 'admin_adjustment';

export type WalletTransactionStatus = 'completed' | 'pending' | 'reversed' | 'failed';

export interface WalletTransaction {
  id: string;
  resellerId: string;
  orderId?: string;
  listingId?: string;
  type: WalletTransactionType;
  amount: number;
  currency: 'INR';
  status: WalletTransactionStatus;
  description: string;
  createdAt: string;
}

export interface WalletAccount {
  resellerId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  updatedAt: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  resellerId: string;
  resellerName: string;
  resellerEmail: string;
  amount: number;
  payoutMethod: PayoutMethod;
  payoutDetails: PayoutDetails;
  status: WithdrawalStatus;
  adminNotes?: string;
  payoutReference?: string;
  createdAt: string;
  processedAt?: string;
}

export interface AttributedOrder {
  orderId: string;
  orderNumber: string;
  resellerId: string;
  listingId: string;
  listingSlug: string;
  originalProductId: string;
  productTitle: string;
  basePrice: number;
  resalePrice: number;
  earningAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderStatus: 'pending' | 'completed' | 'refunded' | 'failed';
  earningStatus: 'pending' | 'available' | 'reversed';
  createdAt: string;
  paidAt?: string;
}
