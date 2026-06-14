export type UserRole = "BUYER" | "SELLER" | "AGENT" | "RIDER";

export interface Listing {
  listing_id: string;
  title: string;
  description: string;
  suggested_price: number;
  category: string;
  location: string;
  distance_km: number;
  seller_id: string;
  video_url: string;
  thumbnail: string;
  views: number;
  likes: number;
  shares: number;
  provenance?: string;
  freshness?: string;
  recommended_use?: string;
  status?: "live" | "draft" | "paused";
  cover_frame?: string;
  seo_tags?: string[];
  image_url?: string;
  transition_effect?: "Fade" | "Slide" | "Zoom";
  noise_reduction?: boolean;
  narration_text?: string;
  narration_audio_url?: string;
  bg_music_track?: string;
  bg_music_url?: string;
  subtitles?: Array<{ text: string; start: number; end: number }>;
  viral_score?: number;
  viral_report?: {
    viralScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  metrics?: {
    watchTimeSec: number;
    completionRate: number;
    completions: number;
    replays: number;
    shares: number;
    purchases: number;
    likes: number;
    commentsCount: number;
    wishlists: number;
    profileVisits: number;
    totalPauseSec: number;
    pauses: number;
  };
  comments_list?: Array<{
    user_id: string;
    comment_text: string;
    timestamp: string;
  }>;
}

export interface BehaviourEvent {
  event_id: string;
  event_type: "view" | "like" | "share" | "skip" | "buy" | "purchase" | "comment" | "wishlist" | "profile_visit" | "pause" | "replay" | "watch_time";
  user_id: string;
  listing_id: string;
  watch_time_sec?: number;
  pause_time_sec?: number;
  comment_text?: string;
  timestamp: string;
}

export interface Rider {
  rider_id: string;
  name: string;
  phone: string;
  bike_plate: string;
  photo: string;
  rating: number;
  status: "online" | "offline";
  tier: "Starter" | "Rising" | "Hero" | "Ambassador";
  social_fund_balance: number;
  zone: string;
}

export interface Order {
  order_id: string;
  listing_id: string;
  buyer_id: string;
  buyer_name: string;
  product_title: string;
  seller_id: string;
  quantity: number;
  product_price: number;
  delivery_fee: number;
  mobile_money_operator: "Airtel" | "MTN" | "Zamtel";
  escrow_status: "locked" | "collected" | "releasing" | "completed" | "released" | "refunded";
  transit_status: "pending_seller_confirmation" | "rider_assigned" | "picked_up" | "out_for_delivery" | "delivered" | "cancelled";
  rider?: Rider;
  created_at: string;
  delivery_address: string;
  shipping_address?: string;
  address_details?: string;
  cancellation_reason?: string;
  escrow_returned?: boolean;
  buyer_rating?: number;
  rider_distance_km?: number;
  rider_eta_mins?: number;
  seller_name?: string;
  pickup_distance_km?: number;
  dropoff_distance_km?: number;
  total_distance_km?: number;
  rider_tip?: number;
}

export interface LedgerRecord {
  tx_id: string;
  order_id: string;
  amount_zmw: number;
  action: string;
  payout_destination?: string;
  product_title?: string;
  social_fund_topup?: number;
  fees?: {
    escrow_mobile_money: number;
    platform_listing: number;
    rider_share: number;
    social_fund: number;
    platform_rider_commission: number;
  };
  timestamp: string;
}

export interface StateSnapshot {
  metrics: {
    total_listings: number;
    behavioral_events_recorded: number;
    active_orders: number;
    escrow_locked_volume_zmw: number;
    total_payouts_completed: number;
  };
  ledger: LedgerRecord[];
  orders: Order[];
  riders: Rider[];
  seller_balance?: number;
  auto_settle?: boolean;
  auto_settle_wallet?: string;
  conversations?: ChatConversation[];
  notifications?: PlatformNotification[];
}

export interface ChatMessage {
  message_id: string;
  sender: "buyer" | "seller" | "system";
  text: string;
  timestamp: string;
  referenced_listing_id?: string;
  referenced_listing_title?: string;
  referenced_order_id?: string;
}

export interface ChatConversation {
  conversation_id: string;
  buyer_name: string;
  buyer_initials: string;
  order_id: string;
  unread_count: number;
  messages: ChatMessage[];
  last_message_time: string;
}

export interface AdminConfig {
  parcelPlatformFee: number;
  parcelDeliveryFeePerKm: number;
  paymentProcessingPct: number;
  riderPlatformFeePct: number;
  riderSocialFundPct: number;
  smsTemplate: string;
  jobTimeoutSec: number;
  smsDispatchFee?: number;
}

export interface SavedLocation {
  location_id: string;
  nickname: string;
  address_string: string;
  landmark_note?: string;
  latitude: number;
  longitude: number;
  city: string;
  zone: string;
  usage_count: number;
  last_used_at: string;
  is_default?: boolean;
}

export interface ParcelJob {
  parcel_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "BUYER" | "SELLER" | "AGENT";
  sender_seller_id?: string; // used when Agent sends on behalf of portfolio seller
  description: string;
  weight_kg: number;
  collection_address: string;
  collection_landmark?: string;
  delivery_address: string;
  delivery_landmark?: string;
  delivery_city: "Lusaka" | "Ndola" | "Kitwe" | string;
  recipient_name: string;
  recipient_phone: string;
  is_registered_recipient: boolean;
  delivery_fee: number;
  platform_fee: number;
  processing_fee: number;
  grand_total: number;
  payment_wallet: "Airtel" | "MTN" | "Zamtel";
  status: "searching_rider" | "rider_assigned" | "collected" | "delivered" | "cancelled";
  rider_id?: string;
  rider_name?: string;
  rider_phone?: string;
  rider_photo?: string;
  rider_eta_mins?: number;
  pickup_photo?: string;
  delivery_photo?: string;
  created_at: string;
  collected_at?: string;
  delivered_at?: string;
  rating?: number;
  sms_sent?: boolean;
  distance_km: number;
}

export interface PlatformNotification {
  notification_id: string;
  title: string;
  body: string;
  type: "trending" | "payout_confirmation" | "low_stock" | "new_review";
  timestamp: string;
  read: boolean;
}


