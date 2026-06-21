import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  ShoppingBag, 
  User, 
  Truck, 
  ArrowRight, 
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  Lock,
  LogOut,
  RefreshCw,
  Plus,
  Mic,
  MicOff,
  Captions,
  Filter,
  Compass,
  FileText,
  BadgeAlert,
  Coins,
  Shield,
  CoinsIcon,
  MessageSquare,
  ChevronRight,
  Database,
  MapPin,
  Clock,
  ThumbsUp,
  Share2,
  Video,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  Sprout,
  Shirt,
  Smartphone,
  Sofa,
  Wrench,
  HeartPulse,
  ShoppingCart,
  AlertTriangle,
  X,
  Navigation2,
  Package,
  Utensils,
  Sun,
  Moon,
  Volume2,
  Music
} from "lucide-react";
import { 
  Edit, 
  Trash2, 
  Search, 
  Settings, 
  Bell, 
  Eye, 
  Activity, 
  BarChart2, 
  AlertCircle, 
  Users, 
  TrendingUp, 
  PhoneCall, 
  Wallet, 
  CheckSquare, 
  ChevronUp, 
  ArrowLeft, 
  MessageCircle, 
  Calendar, 
  Map, 
  Globe, 
  Check,
  Edit2,
  Phone,
  Trash
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Listing, Order, LedgerRecord, Rider, SavedLocation, ParcelJob, AdminConfig } from "./types";
import SellerPortalRoot from "./components/seller/SellerPortalRoot";
import { RiderPortal } from "./components/rider/RiderPortal";
import ParcelsModule from "./components/ParcelsModule";
import AgentPortal from "./components/agent/AgentPortal";

// ==========================================
// INITIAL MOCK DATA SEED
// ==========================================
const INITIAL_LISTINGS: Listing[] = [
  {
    listing_id: "lst-001",
    title: "Chisamba Sweet Maize",
    description: "Harvested fresh at sunrise! Extra sugary, pesticide-free. Great for roasting or custom mealie meal.",
    suggested_price: 45,
    category: "Fresh produce",
    location: "Chisamba, Lusaka",
    distance_km: 3.4,
    seller_id: "sel-chipo",
    video_url: "https://example.com/maize.mp4",
    thumbnail: "🌽",
    views: 450,
    likes: 120,
    shares: 32,
    provenance: "Chisamba Cooperative",
    freshness: "98% Fresh Rated",
    recommended_use: "Boiling / Roasting",
    status: "live",
    narration_text: "Muli bwanji! Sourced fresh and extra sugary from Chisamba farms this morning, roasting-grade at just K45! Squeeze-tested and top grade. Tap Buy Now!",
    narration_audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    subtitles: [
      { text: "Muli bwanji Zambian buyers! 🇿🇲", start: 0.0, end: 3.5 },
      { text: "Sourced fresh and extra sugary", start: 3.6, end: 7.2 },
      { text: "From Chisamba farms this morning", start: 7.3, end: 11.0 },
      { text: "Roasting-grade at just 45 Kwacha!", start: 11.1, end: 14.8 },
      { text: "Squeeze-tested and top grade. Buy now! 🚀", start: 14.9, end: 20.0 }
    ]
  },
  {
    listing_id: "lst-002",
    title: "Vibrant Chitenge Custom Blazer",
    description: "Tailored with rich premium cotton Chitenge patterns. Bold prints with sturdy stitching, hand-sewn by Lusaka fashion designers.",
    suggested_price: 295,
    category: "Fashion & chitenge",
    location: "Soweto Market, Lusaka",
    distance_km: 5.1,
    seller_id: "sel-chipo",
    video_url: "https://example.com/chitenge.mp4",
    thumbnail: "👗",
    views: 610,
    likes: 185,
    shares: 44,
    provenance: "Kabwata Cultural Gallery",
    freshness: "100% Cotton Weave",
    recommended_use: "Fashion & Formal wear",
    status: "live"
  },
  {
    listing_id: "lst-003",
    title: "Solar Power Bank Kit 20,000mAh",
    description: "Heavy duty offgrid solar charging device with triple output ports. Robust outer case, great for farm fields and long rural commutes.",
    suggested_price: 320,
    category: "Electronics",
    location: "Chongwe District",
    distance_km: 14.8,
    seller_id: "sel-chipo",
    video_url: "https://example.com/solar.mp4",
    thumbnail: "📱",
    views: 730,
    likes: 210,
    shares: 65,
    provenance: "Lusaka Electronics Plaza",
    freshness: "Certified Safe Battery",
    recommended_use: "Device Charging",
    status: "live"
  },
  {
    listing_id: "lst-004",
    title: "Handcarved Mukwa Coffee Table",
    description: "Genuine African Mukwa hardwood coffee table representing authentic Tonga craftsmanship. Stunning polish highlights beautiful wood grains.",
    suggested_price: 680,
    category: "Home & furniture",
    location: "Kalundu, Lusaka",
    distance_km: 7.8,
    seller_id: "sel-mwansa",
    video_url: "https://example.com/table.mp4",
    thumbnail: "🪵",
    views: 310,
    likes: 94,
    shares: 18,
    provenance: "Choma Woodcarving Hub",
    freshness: "100% Mukwa Hardwood",
    recommended_use: "Living Room Accent",
    status: "live"
  },
  {
    listing_id: "lst-005",
    title: "Professional Carbon-Steel Spade",
    description: "Toughened steel shovel blade paired with a matching water-resistant solid timber handle. Hardened specifically for heavy Zambian soil tilling.",
    suggested_price: 110,
    category: "Hardware & tools",
    location: "Kitwe Main Hub",
    distance_km: 21.3,
    seller_id: "sel-mwansa",
    video_url: "https://example.com/spade.mp4",
    thumbnail: "🛠️",
    views: 420,
    likes: 115,
    shares: 22,
    provenance: "Copperbelt Spares Ltd",
    freshness: "Forged Heavy Steel",
    recommended_use: "Agriculture & Gardening",
    status: "live"
  },
  {
    listing_id: "lst-006",
    title: "Organic Wild Honey & Marula Butter Soap",
    description: "Gentle organic soap bars handcrafted with wild honey from Luangwa valley and nourishing cold-pressed marula fruit seeds.",
    suggested_price: 45,
    category: "Beauty & health",
    location: "Chisamba Town",
    distance_km: 8.5,
    seller_id: "sel-chipo",
    video_url: "https://example.com/soap.mp4",
    thumbnail: "🧼",
    views: 540,
    likes: 195,
    shares: 38,
    provenance: "Luangwa Wild Reserves",
    freshness: "All-Natural Organic",
    recommended_use: "Skincare & Cleansing",
    status: "live"
  },
  {
    listing_id: "lst-007",
    title: "Express Document Delivery & Envelope Seal",
    description: "Insured express envelope courier service around central Lusaka. Includes high-security protective seal and signature tracking.",
    suggested_price: 35,
    category: "Parcels",
    location: "Soweto Hub, Lusaka",
    distance_km: 2.1,
    seller_id: "sel-chipo",
    video_url: "https://example.com/parcel.mp4",
    thumbnail: "📦",
    views: 180,
    likes: 42,
    shares: 9,
    provenance: "Secondo Secure Post",
    freshness: "On-time guarantee",
    recommended_use: "Secure document shipping",
    status: "live"
  },
  {
    listing_id: "lst-008",
    title: "Crispy Peri-Peri Chicken & Cassava Chips",
    description: "Our signature double peri-peri fried chicken thigh served with deep-fried spiced cassava fries. Spicy, hot, and prepared fresh in Munali!",
    suggested_price: 65,
    category: "Fast Food & Restaurant",
    location: "Munali, Lusaka",
    distance_km: 1.2,
    seller_id: "sel-mwansa",
    video_url: "https://example.com/chicken.mp4",
    thumbnail: "🍗",
    views: 890,
    likes: 452,
    shares: 110,
    provenance: "Chapo Grill & Diner",
    freshness: "Freshly Cooked",
    recommended_use: "Instant hot meal lunch",
    status: "live"
  }
];

const INITIAL_RIDERS: Rider[] = [
  {
    rider_id: "rider-zola",
    name: "Zola Deliveries",
    phone: "+260 97 123456",
    bike_plate: "ZM 9021",
    photo: "🏍️",
    rating: 4.9,
    status: "online",
    tier: "Rising",
    social_fund_balance: 145,
    zone: "Lusaka Central"
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    order_id: "ord-88392",
    listing_id: "lst-001",
    buyer_id: "buy-clara",
    buyer_name: "Clara Mwamba",
    product_title: "Chisamba Sweet Maize",
    seller_id: "sel-chipo",
    quantity: 2,
    product_price: 45,
    delivery_fee: 15,
    mobile_money_operator: "Airtel",
    escrow_status: "released",
    transit_status: "delivered",
    created_at: "2026-06-09T02:00:00Z",
    delivery_address: "Apartment 4B, Kalundu Estate, Lusaka",
  }
];

const INITIAL_LEDGER: LedgerRecord[] = [
  {
    tx_id: "tx-f0e6-a21b",
    order_id: "ord-88392",
    amount_zmw: 105,
    action: "ESCROW_PAYOUT_RELEASED",
    payout_destination: "Airtel Wallet (+260975***)",
    product_title: "Chisamba Sweet Maize",
    social_fund_topup: 3.5,
    fees: {
      escrow_mobile_money: 1.5,
      platform_listing: 2.0,
      rider_share: 15.0,
      social_fund: 3.5,
      platform_rider_commission: 1.0
    },
    timestamp: "2026-06-09T02:45:00Z"
  }
];

export default function App() {
  // Horizontal drag scroll helper handlers for mouse users
  const handleDragScrollMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    container.setAttribute("data-is-down", "true");
    container.setAttribute("data-start-x", (e.pageX - container.offsetLeft).toString());
    container.setAttribute("data-scroll-left", container.scrollLeft.toString());
  };

  const handleDragScrollMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.removeAttribute("data-is-down");
  };

  const handleDragScrollMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.removeAttribute("data-is-down");
  };

  const handleDragScrollMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.getAttribute("data-is-down") !== "true") return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const startX = parseFloat(container.getAttribute("data-start-x") || "0");
    const scrollLeftValue = parseFloat(container.getAttribute("data-scroll-left") || "0");
    const walk = (x - startX) * 1.5; // scroll speed multiplier
    container.scrollLeft = scrollLeftValue - walk;
  };

  // Authentication & Navigation
  const [selectedRole, setSelectedRole] = useState<"BUYER" | "SELLER" | "AGENT" | "RIDER">("BUYER");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // Local "Backend Database" State
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [ledger, setLedger] = useState<LedgerRecord[]>(INITIAL_LEDGER);
  
  // Wallet Balances
  const [sellerBalance, setSellerBalance] = useState<number>(340); // in Kwacha ZMW
  const [agentCommission, setAgentCommission] = useState<number>(64);
  const [riderWallet, setRiderWallet] = useState<number>(185);
  const [riderSocialFund, setRiderSocialFund] = useState<number>(145);
  const [autoSettle, setAutoSettle] = useState<boolean>(true);

  // Transient UX states
  const [toast, setToast] = useState<{ message: string; subText?: string } | null>(null);
  
  // Onboarding Steppers
  const [sellerStep, setSellerStep] = useState<number>(1);
  const [hasCompletedSellerSetup, setHasCompletedSellerSetup] = useState<boolean>(false);
  
  const [riderStep, setRiderStep] = useState<number>(1);
  const [hasCompletedRiderSetup, setHasCompletedRiderSetup] = useState<boolean>(false);

  // Buyer Onboarding 8-step flow values
  const [isLookingUpLipilaName, setIsLookingUpLipilaName] = useState<boolean>(false);
  const [lipilaResolvedName, setLipilaResolvedName] = useState<string>("");
  const [buyerSignupStep, setBuyerSignupStep] = useState<number>(1); // Starts at step 1 by default
  const [buyerPhone, setBuyerPhone] = useState<string>("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]); // Expanded to 6 digits
  const [buyerNameInput, setBuyerNameInput] = useState<string>("");
  const [buyerProvince, setBuyerProvince] = useState<string>("Lusaka");
  const [buyerDistricts, setBuyerDistricts] = useState<string>("Lusaka Central");
  const [buyerOperator, setBuyerOperator] = useState<"Airtel" | "MTN" | "Zamtel">("Airtel");
  const [buyerInterests, setBuyerInterests] = useState<string[]>([]);
  const [otpCountdown, setOtpCountdown] = useState<number>(28); // 28 seconds countdown
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  // New location and name states
  const [buyerLocationMethod, setBuyerLocationMethod] = useState<"gps" | "manual" | null>(null);
  const [buyerDetectedArea, setBuyerDetectedArea] = useState<string>("Munali, Lusaka");
  const [buyerSelectedCity, setBuyerSelectedCity] = useState<"Lusaka" | "Ndola" | "Kitwe">("Lusaka");
  const [buyerNeighbourhood, setBuyerNeighbourhood] = useState<string>("");
  const [buyerFirstName, setBuyerFirstName] = useState<string>("");
  const [buyerSurname, setBuyerSurname] = useState<string>("");
  const [buyerFeedTab, setBuyerFeedTab] = useState<"FEED" | "REELS" | "CART" | "TRACKING" | "PARCELS">("FEED");
  const [buyerTrackingTab, setBuyerTrackingTab] = useState<"ACTIVE" | "PAST">("ACTIVE");
  const [buyerSearchQuery, setBuyerSearchQuery] = useState<string>("");

  // Pull-to-refresh state & handlers for buyer feed tabs
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const pullStartY = useRef<number | null>(null);

  const handlePullTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop === 0 && !isRefreshing) {
      pullStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    } else {
      pullStartY.current = null;
    }
  };

  const handlePullTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (pullStartY.current === null || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStartY.current;

    if (diff > 0) {
      // Applied smooth logarithmic resistance so it feels heavily weighted and premium
      const distance = Math.min(diff * 0.45, 80);
      setPullDistance(distance);
      
      // If we are actively pulling down at the top, prevent native overflow bounce/trigger default browser gestures
      if (distance > 8) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    } else {
      setPullDistance(0);
    }
  };

  const handlePullTouchEnd = async () => {
    if (pullStartY.current === null || isRefreshing) return;
    pullStartY.current = null;
    setIsPulling(false);

    if (pullDistance >= 50) {
      setIsRefreshing(true);
      setPullDistance(50); // Keep indicator cleanly visible during synchronization
      
      try {
        await syncListingsFromServer();
        setToast({
          message: "Feed Synchronized",
          subText: "Listing offers successfully updated with backend state!"
        });
      } catch (err) {
        setToast({
          message: "Sync Failed",
          subText: "Could not fetch updated listing data."
        });
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 800);
      }
    } else {
      setPullDistance(0);
    }
  };

  // Captions Speech-to-Text dynamic state tracking
  const [activeReelAudio, setActiveReelAudio] = useState<HTMLAudioElement | null>(null);
  const [activeReelTime, setActiveReelTime] = useState<number>(0);

  // Floating emojis support
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string; x: number; rotate: number; rotateSpeed: number }>>([]);
  
  // Localized state for item price drop notification preferences
  const [priceDropAlerts, setPriceDropAlerts] = useState<string[]>([]);
  
  // Theme Toggle: true for high-contrast sunlight light theme, false for default midnight dark theme
  const [isLightTheme, setIsLightTheme] = useState<boolean>(false);

  // Delivery rider rating states
  const [ratingOrder, setRatingOrder] = useState<any | null>(null);
  const [riderRating, setRiderRating] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>("");

  // Seller Activity Ledger (live indicators)
  const [sellerLastActiveTimes, setSellerLastActiveTimes] = useState<Record<string, string>>({
    "selo-hub-lusaka": new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    "seller-lizzie": new Date(Date.now() - 6 * 60 * 1000).toISOString(), // 6 mins ago
    "seller-brian": new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 mins ago
    "seller-pete": new Date(Date.now() - 11 * 60 * 1000).toISOString(), // 11 mins ago
    "seller-joyce": new Date(Date.now() - 120 * 60 * 1000).toISOString(), // offline
    "selo_partner_lusaka": new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 mins ago
  });

  const isSellerLive = (sellerId: string) => {
    const timeStr = sellerLastActiveTimes[sellerId];
    if (!timeStr) return false;
    const diffMs = Date.now() - new Date(timeStr).getTime();
    return diffMs < 15 * 60 * 1000;
  };

  const triggerReaction = (emoji: string) => {
    const newEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      x: 20 + Math.random() * 60,
      rotate: (Math.random() - 0.5) * 35,
      rotateSpeed: (Math.random() - 0.5) * 50
    };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(item => item.id !== newEmoji.id));
    }, 1800);
  };

  const getEtaEstimates = (distanceKm: number) => {
    const walkTimeMins = Math.round(distanceKm * 12);
    const driveTimeMins = Math.round(distanceKm * 1.5 + 3);
    
    const walkStr = walkTimeMins >= 60 
      ? `${Math.floor(walkTimeMins / 60)}h ${walkTimeMins % 60}m`
      : `${walkTimeMins} min`;
      
    const driveStr = driveTimeMins >= 60 
      ? `${Math.floor(driveTimeMins / 60)}h ${driveTimeMins % 60}m`
      : `${driveTimeMins} min`;

    return { walk: walkStr, drive: driveStr };
  };

  const handleBuyAgain = (listingId: string, initialQuantity: number = 1) => {
    const listing = listings.find(l => l.listing_id === listingId);
    if (!listing) {
      setToast({ 
        message: "Product Not Available", 
        subText: "This item has been removed or is out of stock." 
      });
      return;
    }
    setBuyAgainConfirmListing(listing);
    setBuyAgainQuantity(initialQuantity);
  };

  const handleConfirmBuyAgain = () => {
    if (!buyAgainConfirmListing) return;
    setCart(prev => {
      const matchIndex = prev.findIndex(item => item.listing.listing_id === buyAgainConfirmListing.listing_id);
      if (matchIndex > -1) {
        return prev.map((item, idx) => idx === matchIndex ? { ...item, quantity: item.quantity + buyAgainQuantity } : item);
      } else {
        return [...prev, { listing: buyAgainConfirmListing, quantity: buyAgainQuantity, zone: getListingZone(buyAgainConfirmListing) }];
      }
    });
    
    setBuyerFeedTab("CART");
    setToast({
      message: `Re-added ${buyAgainConfirmListing.title}!`,
      subText: `Added ${buyAgainQuantity}x items to your basket. Ready for delivery!`
    });
    setBuyAgainConfirmListing(null);
  };

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    {
      location_id: "loc-home",
      nickname: "My Home Plot",
      address_string: "Great East Rd, Plot 4500, Kalingalinga, Lusaka",
      landmark_note: "Opposite Big Blue Gate near main road",
      latitude: -15.401,
      longitude: 28.329,
      city: "Lusaka",
      zone: "Lusaka East",
      usage_count: 5,
      last_used_at: new Date().toISOString(),
      is_default: true
    },
    {
      location_id: "loc-office",
      nickname: "Lusaka Wholesale Hub",
      address_string: "Cairo Rd, Plot 110, Central District, Lusaka",
      landmark_note: "Beside Stanbic Capital Office",
      latitude: -15.419,
      longitude: 28.286,
      city: "Lusaka",
      zone: "Lusaka Central",
      usage_count: 2,
      last_used_at: new Date().toISOString(),
      is_default: false
    }
  ]);

  const [recentLocations, setRecentLocations] = useState<SavedLocation[]>([
    {
      location_id: "loc-recent1",
      nickname: "Chelstone Clinic Ground",
      address_string: "Chelstone Main Highway Rd, Lusaka",
      landmark_note: "Next to pharmacy container",
      latitude: -15.378,
      longitude: 28.369,
      city: "Lusaka",
      zone: "Lusaka East",
      usage_count: 1,
      last_used_at: new Date().toISOString()
    }
  ]);

  const [parcelJobs, setParcelJobs] = useState<ParcelJob[]>([]);

  const [adminConfig, setAdminConfig] = useState<AdminConfig>({
    parcelPlatformFee: 15.0,
    parcelDeliveryFeePerKm: 12.0,
    paymentProcessingPct: 2.5,
    riderPlatformFeePct: 8.0,
    riderSocialFundPct: 5.0,
    smsTemplate: "Selonachipa Alert: Your parcel SN-PCL-{ID} is in transit under Rider {RIDER}. Track at: selo.zm/t/{ID}",
    jobTimeoutSec: 60
  });
  const [cart, setCart] = useState<{ listing: Listing; quantity: number; zone: string }[]>([]);
  const [wishlist, setWishlist] = useState<Listing[]>([]);
  const [blockedListing, setBlockedListing] = useState<Listing | null>(null);
  const [showCrossZoneModal, setShowCrossZoneModal] = useState<boolean>(false);
  const [showCartConfirmation, setShowCartConfirmation] = useState<boolean>(false);
  const [lastAddedItem, setLastAddedItem] = useState<Listing | null>(null);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<Listing | null>(null);
  const [buyerSelectTrackingOrderId, setBuyerSelectTrackingOrderId] = useState<string | null>(null);
  const [showSellerContactModal, setShowSellerContactModal] = useState<Listing | null>(null);

  // Future Login PIN and Security Question Credentials
  const [buyerPinCode, setBuyerPinCode] = useState<string>("1234"); // Default helper PIN for easy sandbox use
  const [securityQuestion, setSecurityQuestion] = useState<string>("What was the name of your primary school?");
  const [securityAnswer, setSecurityAnswer] = useState<string>("Chilenje Primary");
  const [agentTab, setAgentTab] = useState<"DESK" | "PARCELS">("DESK");

  // Buyer Feature enhancements: Category Filter, Share Event, Buy Again Confirm, Past Orders Search
  const [selectedFeedCategory, setSelectedFeedCategory] = useState<string>("ALL");
  const [buyAgainConfirmListing, setBuyAgainConfirmListing] = useState<Listing | null>(null);
  const [buyAgainQuantity, setBuyAgainQuantity] = useState<number>(1);
  const [pastOrdersSearch, setPastOrdersSearch] = useState<string>("");

  // Login & Recovery Flow States
  const [isBuyerLoginMode, setIsBuyerLoginMode] = useState<boolean>(true);
  const [loginPhoneInput, setLoginPhoneInput] = useState<string>("");
  const [loginPinInput, setLoginPinInput] = useState<string>("");
  const [isRecoveringPin, setIsRecoveringPin] = useState<boolean>(false);
  const [recoveryAnswerInput, setRecoveryAnswerInput] = useState<string>("");
  const [newPinAfterRecovery, setNewPinAfterRecovery] = useState<string>("");

  // ==========================================
  // FULL SELLER PORTAL STATES (AI SIMULATION & BUSINESS FLOWS)
  // ==========================================
  const [sellerIsLoggedIn, setSellerIsLoggedIn] = useState<boolean>(false);
  const [sellerEnteredPinDigits, setSellerEnteredPinDigits] = useState<string>("");
  const [isSellerRecoveringPin, setIsSellerRecoveringPin] = useState<boolean>(false);
  const [sellerRecoveryQ1, setSellerRecoveryQ1] = useState<string>("");
  const [sellerRecoveryQ2, setSellerRecoveryQ2] = useState<string>("");
  const [sellerRecoveryQ3, setSellerRecoveryQ3] = useState<string>("");
  const [sellerPinCode, setSellerPinCode] = useState<string>("2580"); // Standard default Seller Pin is 2580

  // Profile public attributes
  const [sellerStoreName, setSellerStoreName] = useState<string>("Chisamba Organic Trade Hub");
  const [sellerName, setSellerName] = useState<string>("Chipo Mwansa");
  const [sellerLocationLandmark, setSellerLocationLandmark] = useState<string>("Plot 33, Great East Road Near Cooperative Block, Chisamba, ZM");
  const [sellerBannerColor, setSellerBannerColor] = useState<string>("from-teal-900/60 to-[#0a0b0e]");
  const [sellerPrimaryWallet, setSellerPrimaryWallet] = useState<string>("Airtel Money (+26097561928)");
  const [sellerKycPhone, setSellerKycPhone] = useState<boolean>(true);
  const [sellerKycWallet, setSellerKycWallet] = useState<boolean>(true);
  const [sellerKycNrc, setSellerKycNrc] = useState<boolean>(true);

  // Seller Dashboard persistent Navigation & Tab controls
  const [sellerTab, setSellerTab] = useState<"HOME" | "ORDERS" | "LISTINGS" | "EARNINGS" | "MORE">("HOME");
  const [sellerActiveMoreModule, setSellerActiveMoreModule] = useState<string | null>(null);

  // Filter criteria selection states
  const [sellerListingFilter, setSellerListingFilter] = useState<"ALL" | "LIVE" | "DRAFT" | "PAUSED">("ALL");
  const [editingListingObj, setEditingListingObj] = useState<any | null>(null);

  // Audio/Visual media ingestion & on-device AI checklist simulation state machine
  const [isUploadingNewListing, setIsUploadingNewListing] = useState<boolean>(false);
  const [uploadPipelineStep, setUploadPipelineStep] = useState<number>(0);
  const [uploadMediaSource, setUploadMediaSource] = useState<string>(""); // 'GALLERY', 'CAMERA', 'WHATSAPP', 'URL'
  const [draftListing, setDraftListing] = useState<any | null>(null);

  // Order workflow states
  const [sellerOrderFilter, setSellerOrderFilter] = useState<"NEW" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED">("NEW");

  // Interaction threads for message center
  const [activeChatConversationId, setActiveChatConversationId] = useState<string | null>(null);
  const [typedMessageInput, setTypedMessageInput] = useState<string>("");

  // Business intelligence reporting filter parameters
  const [analyticsDateRange, setAnalyticsDateRange] = useState<"TODAY" | "7DAYS" | "30DAYS">("30DAYS");

  // Agent relationship records
  const [agentsList, setAgentsList] = useState<any[]>([
    { agent_id: "ag-001", name: "Mwansa Phiri", activeSince: "4 months", commission_rate: 10, monthly_sales: 18, total_commission_paid: 1840 },
    { agent_id: "ag-002", name: "Tembo Mutale", activeSince: "2 months", commission_rate: 8, monthly_sales: 12, total_commission_paid: 820 },
    { agent_id: "ag-003", name: "Banda Chileshe", activeSince: "6 months", commission_rate: 12, monthly_sales: 24, total_commission_paid: 3100 }
  ]);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editingAgentNewRate, setEditingAgentNewRate] = useState<number>(10);

  // Subscriptions & alert notifications channel
  const [notifyPreferences, setNotifyPreferences] = useState<{ inApp: boolean; sms: boolean }>({ inApp: true, sms: true });
  const [sellerLanguage, setSellerLanguage] = useState<"English" | "Bemba" | "Nyanja">("English");

  // Local notification archives
  const [sellerNotifications, setSellerNotifications] = useState<any[]>([
    { id: "not-01", title: "New order received!", body: "Clara Mwamba ordered 2 x Chisamba Sweet Maize (ord-88392). Payout Escrow Locked.", type: "new_order", time: "10 mins ago", read: false, referenceId: "ord-88392" },
    { id: "not-02", title: "Listing trending 🔥", body: "Your sweet maize is performing 45% better than average listings in Munali!", type: "trending", time: "2 hours ago", read: false, referenceId: "lst-001" },
    { id: "not-03", title: "Payout settled ✓", body: "K 1,050.00 transferred via Lipila to your primary Airtel Money wallet.", type: "payout", time: "1 day ago", read: true, referenceId: "tx-f0e6-a21b" },
    { id: "not-04", title: "Low stock alert ⚠️", body: "Only 5 bushels of sweet maize remaining. Consider editing listing or adjusting stock.", type: "low_stock", time: "2 days ago", read: true, referenceId: "lst-001" },
    { id: "not-05", title: "New review alert ⭐⭐⭐⭐⭐", body: "Lulu K. left a 5-star review: 'Sweetest maize in Lusaka! Saved me time.'", type: "new_review", time: "2 days ago", read: true },
    { id: "not-06", title: "Agent sale recorded 👔", body: "Agent Mwansa Phiri completed order for Chisamba Sweet Maize. Commission credit K 45.", type: "agent_activity", time: "3 days ago", read: true }
  ]);

  // Integrated workspace dialogue logs
  const [buyerMessages, setBuyerMessages] = useState<any[]>([
    { id: "chat-01", name: "Clara Mwamba", initials: "CM", orderId: "ord-88392", preview: "Muli bwanji! Is there rider collection from Chisamba cooperative today?", unread: 2, timestamp: "15m", messages: [
      { id: "m-1", sender: "buyer", text: "Hello, I am asking about my sweet maize order.", timestamp: "10:15 AM" },
      { id: "m-2", sender: "seller", text: "Muli bwanji Clara! Yes, we have packed your sweet maize. It is waiting for the rider.", timestamp: "10:18 AM" },
      { id: "m-3", sender: "buyer", text: "Muli bwanji! Is there rider collection from Chisamba today?", timestamp: "10:20 AM" }
    ] },
    { id: "chat-02", name: "Bupe Mwamba", initials: "BM", orderId: "ord-11029", preview: "Thanks, the chitenge colors are perfect!", unread: 0, timestamp: "2h", messages: [
      { id: "m-4", sender: "buyer", text: "Hi, do you have cotton chitenge fabric?", timestamp: "Yesterday" },
      { id: "m-5", sender: "seller", text: "Yes, we have high-quality chitenge from Ndola.", timestamp: "Yesterday" },
      { id: "m-6", sender: "buyer", text: "Thanks, the chitenge colors are perfect!", timestamp: "Yesterday" }
    ] }
  ]);

  // Zone and Store name helper systems for Zambian Buyer same-zone rules
  const getListingZone = (lst: Listing): string => {
    if (lst.listing_id === "lst-001" || lst.listing_id === "lst-006") {
      return "Lusaka north zone";
    }
    if (lst.listing_id === "lst-002" || lst.listing_id === "lst-004") {
      return "Lusaka central zone";
    }
    if (lst.listing_id === "lst-003") {
      return "Lusaka east zone";
    }
    return "Lusaka south zone";
  };

  const getStoreName = (sellerId: string): string => {
    if (sellerId === "sel-chipo") return "Chisamba Organic Trade Hub";
    if (sellerId === "sel-mwansa") return "Lusaka Handcrafted Carvings";
    // Check listings
    const matched = listings.find(l => l.seller_id === sellerId);
    return matched?.provenance || "Selo Merchant Shop";
  };

  const handleAddToCart = (listing: Listing) => {
    const listingZone = getListingZone(listing);
    
    // Cross-zone validation rule
    if (cart.length > 0) {
      const existingZone = cart[0].zone;
      if (existingZone !== listingZone) {
        setBlockedListing(listing);
        setShowCrossZoneModal(true);
        return;
      }
    }
    
    // Increment or add
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.listing.listing_id === listing.listing_id);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + 1
        };
        return next;
      } else {
        return [...prev, { listing, quantity: 1, zone: listingZone }];
      }
    });

    setLastAddedItem(listing);
    logBehaviourEvent("wishlist", listing.listing_id);
    setShowCartConfirmation(true);
    setToast({
      message: "Added to Cart ✓",
      subText: `${listing.title} added to your zone basket.`
    });
  };

  const getTransitStepNumber = (status: string): number => {
    switch (status) {
      case "pending_seller_confirmation":
        return 1;
      case "collected_seller_1":
        return 2;
      case "en_route_seller_2":
        return 3;
      case "en_route_buyer":
        return 4;
      case "delivered":
        return 5;
      default:
        return 1;
    }
  };

  const handleCartCheckout = (phone: string, operator: "Airtel" | "MTN" | "Zamtel", address: string) => {
    if (!phone || cart.length === 0) return;

    // Calculate final grand total of cart
    const uniqueSellers = Array.from(new Set(cart.map(i => i.listing.seller_id))) as string[];
    const numSellers = uniqueSellers.length;
    const leg1Distance = numSellers > 1 ? 2.5 : (cart[0]?.listing?.distance_km || 3.4);
    const leg1Fee = leg1Distance * 5.0; // K 5 per km
    const leg2Distance = numSellers > 1 ? (cart[1]?.listing?.distance_km || 4.2) : 0;
    const leg2Fee = leg2Distance * 5.0; // K 5 per km
    const deliveryFee = leg1Fee + leg2Fee;
    const itemsSubtot = cart.reduce((ac, it) => ac + (it.listing.suggested_price * it.quantity), 0);
    const platformFeeVal = parseFloat((itemsSubtot * 0.028).toFixed(2));
    const tipAmount = checkoutRiderTip;
    const grandTot = itemsSubtot + deliveryFee + platformFeeVal + tipAmount;

    // Call real Lipila payment collection
    startLipilaCollection(phone, grandTot, operator, "Avec Selonachipa Multi-Vendor Escrow Cart Checkout", () => {
      const nameCombined = lookupName || (buyerFirstName ? `${buyerFirstName} ${buyerSurname}`.trim() : "Bupe Mwamba");
      const finalAddress = address || (buyerNeighbourhood ? `${buyerNeighbourhood}, ${buyerSelectedCity}` : "Munali, Lusaka");

      const generatedOrders: Order[] = [];
      const generatedLedgers: LedgerRecord[] = [];
      let totalPurchaseCost = 0;

      cart.forEach((item, idx) => {
        const orderId = "ord-" + Math.floor(10000 + Math.random() * 90000);
        const itemCost = item.listing.suggested_price * item.quantity;
        totalPurchaseCost += itemCost;

        const isMainDeliveryOrder = (idx === 0);
        const orderTip = isMainDeliveryOrder ? tipAmount : 0;

        const newOrder: Order = {
          order_id: orderId,
          listing_id: item.listing.listing_id,
          buyer_id: "buyer-current",
          buyer_name: nameCombined,
          product_title: item.listing.title,
          seller_id: item.listing.seller_id,
          quantity: item.quantity,
          product_price: item.listing.suggested_price,
          delivery_fee: isMainDeliveryOrder ? deliveryFee : 0,
          rider_tip: orderTip,
          mobile_money_operator: operator,
          escrow_status: "locked",
          transit_status: "pending_seller_confirmation",
          created_at: new Date().toISOString(),
          delivery_address: finalAddress
        };

        const escrowMMFee = parseFloat((itemCost * 0.015).toFixed(2));
        const platformFeeValSec = 2.00;
        const socialFundCut = 4.00;

        const newLedgerReceipt: LedgerRecord = {
          tx_id: "tx-" + Math.random().toString(36).substring(2, 6) + "-" + Math.random().toString(36).substring(2, 6),
          order_id: orderId,
          amount_zmw: itemCost + (isMainDeliveryOrder ? (deliveryFee + orderTip) : 0),
          action: "ESCROW_LOCKED",
          product_title: item.listing.title,
          timestamp: new Date().toISOString(),
          fees: {
            escrow_mobile_money: escrowMMFee,
            platform_listing: platformFeeValSec,
            rider_share: (isMainDeliveryOrder ? (deliveryFee - 2.0 + orderTip) : 0),
            social_fund: socialFundCut,
            platform_rider_commission: 2.00
          }
        };

        generatedOrders.push(newOrder);
        generatedLedgers.push(newLedgerReceipt);
      });

      setOrders(prev => [...generatedOrders, ...prev]);
      setLedger(prev => [...generatedLedgers, ...prev]);

      // Fire individual purchase behavior events for the ranking engine
      cart.forEach(item => {
        logBehaviourEvent("purchase", item.listing.listing_id);
      });

      if (generatedOrders.length > 0) {
        setBuyerSelectTrackingOrderId(generatedOrders[0].order_id);
      }

      setCart([]);
      setCheckoutRiderTip(0);
      setCustomTipValue("");
      setBuyerFeedTab("TRACKING");

      setToast({
        message: `ESCROW SEALED: K${grandTot.toFixed(2)} Secured`,
        subText: `Paid via ${operator} Mobile Money. Funds successfully locked in Selonachipa Escrow after Lipila validation!`
      });
    });
  };

  const handleAddPostDeliveryRiderTip = (orderId: string, tipAmount: number) => {
    if (tipAmount <= 0) return;
    
    setOrders(prev => prev.map(o => {
      if (o.order_id === orderId) {
        return {
          ...o,
          rider_tip: (o.rider_tip || 0) + tipAmount
        };
      }
      return o;
    }));

    setRiderWallet(prev => prev + tipAmount);

    const tipTx: LedgerRecord = {
      tx_id: makeTxId(),
      order_id: orderId,
      amount_zmw: tipAmount,
      action: "RIDER_TIP_ADDED",
      payout_destination: "Rider Direct Wallet Node (Zola Deliveries)",
      product_title: `Rider Tip (Order Ref: ${orderId})`,
      timestamp: new Date().toISOString(),
      fees: {
        escrow_mobile_money: 0,
        platform_listing: 0,
        rider_share: tipAmount,
        social_fund: 0,
        platform_rider_commission: 0
      }
    };

    setLedger(prev => [tipTx, ...prev]);

    setToast({
      message: "RIDER TIPPED SUCCESSFULLY!",
      subText: `Your tip of K ${tipAmount.toFixed(2)} has been added to the rider's direct share!`
    });
  };

  // Selections feed directly into the Selonachipa Infinity Memory algorithm,
  // which begins personalising the buyer's video listing feed before they have made a single purchase.
  const getPersonalizedListings = (): Listing[] => {
    // Rank by score first (highest to lowest), then buyer interests, then views as a secondary personalization factor
    return [...listings].sort((a, b) => {
      const scoreA = a.viral_score || 0;
      const scoreB = b.viral_score || 0;
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // descending order of TikTok rank score
      }
      
      // Fallback: Check user segment interests
      if (buyerInterests && buyerInterests.length > 0) {
        const aMatch = buyerInterests.some(interest => {
          const intLower = interest.toLowerCase();
          const catLower = a.category.toLowerCase();
          return catLower.includes(intLower) || intLower.includes(catLower);
        });
        const bMatch = buyerInterests.some(interest => {
          const intLower = interest.toLowerCase();
          const catLower = b.category.toLowerCase();
          return catLower.includes(intLower) || intLower.includes(catLower);
        });
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
      }
      
      // Secondary fallback to views
      return (b.views || 0) - (a.views || 0);
    });
  };

  // Automatically count down Step 2 OTP Resend Timer
  useEffect(() => {
    let timer: any;
    if (buyerSignupStep === 2 && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [buyerSignupStep, otpCountdown]);

  // Buyer Feeds Navigation
  const [currentReelIndex, setCurrentReelIndex] = useState<number>(0);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [customCheckoutAddress, setCustomCheckoutAddress] = useState<string>("");

  useEffect(() => {
    if (isBuyModalOpen) {
      const defaultAdd = buyerNeighbourhood ? `${buyerNeighbourhood}, ${buyerSelectedCity}` : "Munali, Lusaka";
      setCustomCheckoutAddress(defaultAdd);
    }
  }, [isBuyModalOpen, buyerNeighbourhood, buyerSelectedCity]);
  
  // checkout form fields
  const [checkoutPhone, setCheckoutPhone] = useState<string>("097864321");
  const [checkoutOperator, setCheckoutOperator] = useState<"Airtel" | "MTN" | "Zamtel">("Airtel");
  const [checkoutQty, setCheckoutQty] = useState<number>(1);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const [checkoutRiderTip, setCheckoutRiderTip] = useState<number>(0);
  const [customTipValue, setCustomTipValue] = useState<string>("");
  const [postDeliveryTipValue, setPostDeliveryTipValue] = useState<{[orderId: string]: string}>({});

  // Lipila verification & collection states
  const [lookupName, setLookupName] = useState<string>("");
  const [isLookingUpName, setIsLookingUpName] = useState<boolean>(false);
  const [lipilaStep, setLipilaStep] = useState<"IDLE" | "INITIATING" | "WAITING_FOR_PIN" | "SUCCESS" | "FAILED">("IDLE");
  const [lipilaStatusMsg, setLipilaStatusMsg] = useState<string>("");
  const [lipilaRefId, setLipilaRefId] = useState<string>("");
  const [lipilaAmount, setLipilaAmount] = useState<number>(0);
  const [lipilaPhone, setLipilaPhone] = useState<string>("");
  const [lipilaOperator, setLipilaOperator] = useState<string>("");

  // Auto fetch / look up subscriber name when phone and operator is entered
  useEffect(() => {
    const phoneDigits = checkoutPhone.replace(/[^0-9]/g, "");

    // Dynamically change operator network based on prefix
    let prefixCheck = phoneDigits;
    if (prefixCheck.startsWith("260")) {
      prefixCheck = prefixCheck.substring(3);
    }
    if (prefixCheck.startsWith("0")) {
      prefixCheck = prefixCheck.substring(1);
    }
    if (prefixCheck.startsWith("97") || prefixCheck.startsWith("77")) {
      setCheckoutOperator("Airtel");
    } else if (prefixCheck.startsWith("96") || prefixCheck.startsWith("76")) {
      setCheckoutOperator("MTN");
    } else if (prefixCheck.startsWith("95") || prefixCheck.startsWith("75")) {
      setCheckoutOperator("Zamtel");
    }

    if (phoneDigits.length >= 9) {
      setIsLookingUpName(true);
      const timer = setTimeout(() => {
        fetch(`/api/lipila/lookup-name?phone=${encodeURIComponent(checkoutPhone)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.name) {
              setLookupName(data.name);
            }
          })
          .catch(err => {
            console.error("Name lookup error:", err);
          })
          .finally(() => {
            setIsLookingUpName(false);
          });
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setLookupName("");
    }
  }, [checkoutPhone]);

  // Main background collection handler with auto-pushed PIN verification and polling status
  const startLipilaCollection = (phone: string, amount: number, operator: string, narration: string, onSuccessCallback: () => void) => {
    setIsProcessingCheckout(true);
    setLipilaStep("INITIATING");
    setLipilaPhone(phone);
    setLipilaAmount(amount);
    setLipilaOperator(operator);
    setLipilaStatusMsg("Connecting to Selonachipa secure servers...");

    fetch("/api/lipila/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount, operator, narration })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.referenceId) {
          setLipilaRefId(data.referenceId);
          setLipilaStep("WAITING_FOR_PIN");
          setLipilaStatusMsg(`📨 A mobile money PIN pop-up was dispatched to your device trailing ${operator}. Please enter your secret PIN immediately to authorize the K${amount.toFixed(2)} escrow lock.`);

          // Poll every 2 seconds for authorization status checks (up to 60 seconds)
          let attempts = 0;
          const maxAttempts = 30; // 30 * 2 seconds = 60s timeout
          const pollInterval = setInterval(() => {
            attempts++;
            if (attempts > maxAttempts) {
              clearInterval(pollInterval);
              setLipilaStep("FAILED");
              setLipilaStatusMsg("⏱️ Authorization Timeout: Telecommunication networks could not receive authorization within 60s. Please try again.");
              setIsProcessingCheckout(false);
              return;
            }

            fetch(`/api/lipila/check-status?referenceId=${encodeURIComponent(data.referenceId)}`)
              .then(resStatus => resStatus.json())
              .then(statusData => {
                // Check if payment was confirmed as Successful
                if (statusData.status === "Successful" || statusData.status === "Success" || statusData.paymentStatus === "Successful") {
                  clearInterval(pollInterval);
                  setLipilaStep("SUCCESS");
                  setLipilaStatusMsg("🔒 Lipila payment confirmed! Locking funds in Selonachipa Escrow account...");
                  
                  // Run callback automatically to create order/ledger and clear cart without click of a button!
                  onSuccessCallback();
                  
                  setTimeout(() => {
                    setLipilaStep("IDLE");
                    setIsProcessingCheckout(false);
                  }, 2500);
                } 
                // If payment state failed (wrong pin, user cancelled, insufficient balance, etc.)
                else if (statusData.status === "Failed" || statusData.paymentStatus === "Failed") {
                  clearInterval(pollInterval);
                  setLipilaStep("FAILED");
                  
                  let failReason = statusData.message || statusData.statusMessage || "Transaction declined / expired.";
                  if (failReason.includes("LOW_BALANCE") || failReason.includes("BALANCE_INSUFFICIENT")) {
                    failReason = "Your Mobile Money account balance is insufficient to complete this order.";
                  } else if (failReason.toLowerCase().includes("pin") || failReason.toLowerCase().includes("cancelled") || failReason.toLowerCase().includes("canceled")) {
                    failReason = "PIN authorization failed: user either entered wrong PIN or canceled prompt.";
                  }
                  
                  setLipilaStatusMsg(`❌ Payment Failed: ${failReason}`);
                  setIsProcessingCheckout(false);
                }
              })
              .catch(err => {
                console.warn("Lipila status check network warning:", err);
              });
          }, 2000);
        } else {
          setLipilaStep("FAILED");
          setLipilaStatusMsg(`❌ Collection Error: ${data.message || "Failed to prompt your operator."}`);
          setIsProcessingCheckout(false);
        }
      })
      .catch(err => {
        console.error("Lipila network collect error:", err);
        setLipilaStep("FAILED");
        setLipilaStatusMsg("❌ Network connection failed. Please ensure your Selonachipa workspace server is of perfect integrity.");
        setIsProcessingCheckout(false);
      });
  };

  // Seller Listing Upload
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadPrice, setUploadPrice] = useState<string>("");
  const [uploadDesc, setUploadDesc] = useState<string>("");
  const [isRecordingSimulated, setIsRecordingSimulated] = useState<boolean>(false);
  const [recordedVideoSeconds, setRecordedVideoSeconds] = useState<number>(0);
  const [hasRecordedVideo, setHasRecordedVideo] = useState<boolean>(false);
  const [selectedQuality, setSelectedQuality] = useState<"4K" | "HD">("4K");

  // Advanced video simulation features
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState<boolean>(true);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isNoiseReductionEnabled, setIsNoiseReductionEnabled] = useState<boolean>(true);
  const [activeVideoFilter, setActiveVideoFilter] = useState<string>("none");
  const [transcribedText, setTranscribedText] = useState<string>("");

  // Rider Console
  const [riderOnline, setRiderOnline] = useState<boolean>(true);
  const [activeHandlingOrder, setActiveHandlingOrder] = useState<Order | null>(null);

  // Auto Dismiss Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Auto-play and Auto-loop narration audio when active reel or tab changes to ensure immersive discovery experience
  useEffect(() => {
    let activeAudio: HTMLAudioElement | null = null;

    if (buyerFeedTab === "REELS") {
      const activeListings = getPersonalizedListings();
      const currentReel = activeListings[currentReelIndex];

      if (currentReel && currentReel.narration_audio_url) {
        activeAudio = new Audio(currentReel.narration_audio_url);
        setActiveReelAudio(activeAudio);
        setActiveReelTime(0);
        setReelIsPaused(false);

        activeAudio.addEventListener("timeupdate", () => {
          if (activeAudio) {
            setActiveReelTime(activeAudio.currentTime);
          }
        });

        activeAudio.addEventListener("ended", () => {
          // Auto-loop: seamlessly restart voiceover play and increment replay telemetry metrics for backend insights
          setReelReplayCount(prev => prev + 1);
          if (activeAudio) {
            activeAudio.currentTime = 0;
            activeAudio.play().catch(e => console.warn("Auto-loop playback failed:", e));
          }
        });

        // Trigger autoplay immediately
        activeAudio.play().catch(e => {
          console.log("Autoplay unmuted/prevented by browser: waiting for user gestures to enable raw audio outputs.", e);
        });
      }
    }

    return () => {
      if (activeAudio) {
        activeAudio.pause();
      }
      setActiveReelAudio(null);
      setActiveReelTime(0);
    };
  }, [buyerFeedTab, currentReelIndex]);

  // Comments panel states
  const [showReelCommentListingId, setShowReelCommentListingId] = useState<string | null>(null);
  const [newCommentInputText, setNewCommentInputText] = useState<string>("");

  // Synchronized listings state from the DB & ranking engine
  const syncListingsFromServer = async () => {
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setListings(data);
        }
      }
    } catch (err) {
      console.error("Failed to sync listings:", err);
    }
  };

  // Dispatch interactive logs to Firestore (Simulated local + REST Server payload)
  const logBehaviourEvent = async (eventType: string, listingId: string, extra: Record<string, any> = {}) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          user_id: "buy_v7_active_user",
          listing_id: listingId,
          ...extra
        })
      });
      if (res.ok) {
        // Dynamic re-sort trigger: pull the latest calculated scores from the ranking engine
        syncListingsFromServer();
      }
    } catch (err) {
      console.error("Failure registering behavior log:", err);
    }
  };

  // Continuous tracking states for passive video loops (Watch Time, Pause Time, Replays, Skips)
  const [reelTotalWatchTime, setReelTotalWatchTime] = useState<number>(0);
  const [reelTotalPauseTime, setReelTotalPauseTime] = useState<number>(0);
  const [reelIsPaused, setReelIsPaused] = useState<boolean>(false);
  const [reelReplayCount, setReelReplayCount] = useState<number>(0);
  const [trackedListingId, setTrackedListingId] = useState<string>("");

  // Effect 1: Start tracking for active listing
  useEffect(() => {
    const activeListings = getPersonalizedListings();
    const activeReel = activeListings[currentReelIndex];
    
    // Flush outgoing telemetry before shifting
    if (trackedListingId && trackedListingId !== activeReel?.listing_id) {
      flushReelTelemetry(trackedListingId);
    }
    
    if (activeReel) {
      setTrackedListingId(activeReel.listing_id);
      setReelTotalWatchTime(0);
      setReelTotalPauseTime(0);
      setReelIsPaused(false);
      setReelReplayCount(0);
      
      // Auto-register immediate brief view event
      logBehaviourEvent("view", activeReel.listing_id, { watch_time_sec: 1 });
    }
  }, [currentReelIndex, buyerFeedTab]);

  // Effect 2: Dynamic timers running in background
  useEffect(() => {
    if (buyerFeedTab !== "REELS") return;
    const interval = setInterval(() => {
      if (!reelIsPaused) {
        setReelTotalWatchTime(prev => prev + 1);
      } else {
        setReelTotalPauseTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [buyerFeedTab, reelIsPaused]);

  const flushReelTelemetry = (listingId: string) => {
    if (reelTotalWatchTime > 0) {
      logBehaviourEvent("watch_time", listingId, { watch_time_sec: reelTotalWatchTime });
    }
    if (reelTotalPauseTime > 0) {
      logBehaviourEvent("pause", listingId, { pause_time_sec: reelTotalPauseTime });
    }
    if (reelReplayCount > 0) {
      for (let i = 0; i < reelReplayCount; i++) {
        logBehaviourEvent("replay", listingId);
      }
    }
  };

  // Load listings from database on active mount
  useEffect(() => {
    syncListingsFromServer();
  }, []);

  // Helper helper to generate unique transaction IDs
  const makeTxId = () => "tx-" + Math.random().toString(36).substring(2, 6) + "-" + Math.random().toString(36).substring(2, 6);
  const makeOrdId = () => "ord-" + Math.floor(10000 + Math.random() * 90000);

  // Dynamic state syncing helper functions
  const handlePurchase = () => {
    if (!checkoutPhone) return;
    
    const activeListing = getPersonalizedListings()[currentReelIndex];
    const deliveryFee = 15;
    const tipAmount = checkoutRiderTip;
    const totalCost = (activeListing.suggested_price * checkoutQty) + deliveryFee + tipAmount;

    // Call real Lipila payment collection
    startLipilaCollection(checkoutPhone, totalCost, checkoutOperator, `Selonachipa Buy Direct: ${activeListing.title}`, () => {
      const orderId = makeOrdId();
      const nameCombined = lookupName || (buyerFirstName ? `${buyerFirstName} ${buyerSurname}`.trim() : "Bupe Mwamba");
      const finalAddress = customCheckoutAddress || (buyerNeighbourhood ? `${buyerNeighbourhood}, ${buyerSelectedCity}` : "Munali, Lusaka");

      const newOrder: Order = {
        order_id: orderId,
        listing_id: activeListing.listing_id,
        buyer_id: "buyer-current",
        buyer_name: nameCombined,
        product_title: activeListing.title,
        seller_id: activeListing.seller_id,
        quantity: checkoutQty,
        product_price: activeListing.suggested_price,
        delivery_fee: deliveryFee,
        rider_tip: tipAmount,
        mobile_money_operator: checkoutOperator,
        escrow_status: "locked",
        transit_status: "pending_seller_confirmation",
        created_at: new Date().toISOString(),
        delivery_address: finalAddress
      };

      // Create Secure Ledger Entry
      const escrowMMFee = parseFloat((totalCost * 0.015).toFixed(2));
      const platformFee = 2.00;
      const socialFundCut = 4.00;
      const riderShareValue = deliveryFee - 2.0;

      const newLedgerReceipt: LedgerRecord = {
        tx_id: makeTxId(),
        order_id: orderId,
        amount_zmw: totalCost,
        action: "ESCROW_LOCKED",
        product_title: activeListing.title,
        timestamp: new Date().toISOString(),
        fees: {
          escrow_mobile_money: escrowMMFee,
          platform_listing: platformFee,
          rider_share: riderShareValue + tipAmount,
          social_fund: socialFundCut,
          platform_rider_commission: 2.00
        }
      };

      setOrders(prev => [newOrder, ...prev]);
      setLedger(prev => [newLedgerReceipt, ...prev]);
      
      // Dispatch purchase event to TikTok-Style ranking engine
      logBehaviourEvent("purchase", activeListing.listing_id);
      
      setBuyerSelectTrackingOrderId(orderId);
      setBuyerFeedTab("TRACKING");
      
      setCheckoutRiderTip(0);
      setCustomTipValue("");
      setIsBuyModalOpen(false);
      
      setToast({
        message: `ESCROW SEALED: K${totalCost.toFixed(2)} Secured`,
        subText: `Paid via ${checkoutOperator} Mobile Money. Funds successfully secured in Selonachipa Escrow after Lipila validation!`
      });
    });
  };

  // Skip step setup configs
  const handleSkipSellerSetup = () => {
    setHasCompletedSellerSetup(true);
    setToast({ message: "Seller dashboard unlocked!", subText: "Active with merchant ledger credentials." });
  };

  const handleSkipRiderSetup = () => {
    setHasCompletedRiderSetup(true);
    setToast({ message: "Rider dispatcher mode unlocked!", subText: "Connected to Lusaka central quadrant." });
  };

  // Recording Simulator
  const startSimulatedRecording = () => {
    setIsRecordingSimulated(true);
    setHasRecordedVideo(false);
    setTranscribedText("");
    setRecordedVideoSeconds(60);
    const interval = setInterval(() => {
      setRecordedVideoSeconds(s => {
        if (s <= 1) {
          clearInterval(interval);
          setIsRecordingSimulated(false);
          setHasRecordedVideo(true);

          // Populate mock transcription post-recording if enabled
          const userTitle = uploadTitle.trim() || "quality product";
          const userPrice = uploadPrice.trim() || "75";
          const audioIndicator = isMicMuted ? "" : "Bana Lusaka!";
          
          if (isCaptionsEnabled) {
            const mText = isMicMuted 
              ? "[AI CC: Microphone was MUTED. No voice audio track transcribed.]" 
              : `"${audioIndicator} Check out this premium ${userTitle}! Certified top-tier grade, sourced direct, and only going for ${userPrice} ZMW. Tap buy below to secure it before stock runs out! 🇿🇲🚀"`;
            setTranscribedText(mText);
          } else {
            setTranscribedText("");
          }

          return 0;
        }
        return s - 1;
      });
    }, 100);
  };

  // Add listing from seller screen
  const handleAddListing = () => {
    if (!uploadTitle || !uploadPrice) return;
    
    const newId = "lst-" + Math.floor(100 + Math.random() * 900);
    const priceNum = parseFloat(uploadPrice) || 30;

    const newListing: Listing = {
      listing_id: newId,
      title: uploadTitle,
      description: uploadDesc || "Recorded product reel description by vendor.",
      suggested_price: priceNum,
      category: "Handicrafts & Shop Items",
      location: "Soweto Hub, Lusaka",
      distance_km: 1.5,
      seller_id: "sel-chipo",
      video_url: "https://example.com/recorded.mp4",
      thumbnail: "🎥",
      views: 1,
      likes: 0,
      shares: 0,
      status: "live",
      provenance: "Verified Storefront",
      freshness: "Brand New"
    };

    setListings(prev => [newListing, ...prev]);
    
    // audit logs
    const auditTx: LedgerRecord = {
      tx_id: makeTxId(),
      order_id: "n/a",
      amount_zmw: 0,
      action: "MERCHANT_VIDEO_PUBLISHED",
      product_title: uploadTitle,
      timestamp: new Date().toISOString()
    };
    setLedger(prev => [auditTx, ...prev]);

    setUploadTitle("");
    setUploadPrice("");
    setUploadDesc("");
    setHasRecordedVideo(false);
    setRecordedVideoSeconds(0);
    
    setToast({
      message: `PUBLISHED: "${uploadTitle}" Video is Live`,
      subText: "Listing certified. Available to Zambia buyers instantly in public reels."
    });
  };

  // Agent approvals
  const handleAgentApprove = (listingId: string) => {
    setListings(prev => prev.map(lst => 
      lst.listing_id === listingId ? { ...lst, provenance: "Verified Agent Certified 🛡️" } : lst
    ));
    setAgentCommission(c => c + 15);
    
    const auditTx: LedgerRecord = {
      tx_id: makeTxId(),
      order_id: "agent-review",
      amount_zmw: 15,
      action: "AGENT_PROVENANCE_COMMISSION_GRANTED",
      product_title: listings.find(l => l.listing_id === listingId)?.title || "Zambian Item",
      timestamp: new Date().toISOString()
    };
    setLedger(prev => [auditTx, ...prev]);

    setToast({
      message: "Listing Certified!",
      subText: "Secured K15.00 agent verification reward."
    });
  };

  // Rider accepts active order dispatch
  const handleRiderAcceptOrder = (order: Order) => {
    setOrders(prev => prev.map(o => 
      o.order_id === order.order_id ? { ...o, transit_status: "rider_assigned" } : o
    ));
    setActiveHandlingOrder({ ...order, transit_status: "rider_assigned" });
    setToast({
      message: "Delivery Dispatched!",
      subText: `Route to Merchant accepted for Order ${order.order_id}.`
    });
  };

  // Pickup product
  const handleRiderPickup = () => {
    if (!activeHandlingOrder) return;
    setOrders(prev => prev.map(o => 
      o.order_id === activeHandlingOrder.order_id ? { ...o, transit_status: "out_for_delivery" } : o
    ));
    setActiveHandlingOrder(prev => prev ? { ...prev, transit_status: "out_for_delivery" } : null);
    setToast({
      message: "Order Picked Up",
      subText: "Transit activated towards drop-off point."
    });
  };

  // Complete Order & Settle escrow payout in backend ledger database
  const handleRiderDeliveryHandover = () => {
    if (!activeHandlingOrder) return;
    const orderId = activeHandlingOrder.order_id;
    const listingId = activeHandlingOrder.listing_id;
    const relatedListing = listings.find(l => l.listing_id === listingId);
    const itemPrice = activeHandlingOrder.product_price * activeHandlingOrder.quantity;
    const totalDispatchValue = itemPrice + activeHandlingOrder.delivery_fee;

    // Settle funds
    const earnedTransport = activeHandlingOrder.delivery_fee - 2.00;
    const riderTopupSecFund = 2.00;
    const agentFeeValue = parseFloat((itemPrice * 0.05).toFixed(2));
    const merchantReceivedVal = itemPrice - agentFeeValue;

    // Mutate state orders
    setOrders(prev => prev.map(o => 
      o.order_id === orderId ? { ...o, transit_status: "delivered", escrow_status: "released" } : o
    ));

    // Open delivery rating modal for the buyer
    setRatingOrder(activeHandlingOrder);

    // Update financial wallets
    setSellerBalance(b => b + merchantReceivedVal);
    setAgentCommission(c => c + agentFeeValue);
    setRiderWallet(w => w + earnedTransport);
    setRiderSocialFund(sf => sf + riderTopupSecFund);

    // Create Audit Logs
    const completeTx: LedgerRecord = {
      tx_id: makeTxId(),
      order_id: orderId,
      amount_zmw: totalDispatchValue,
      action: "ESCROW_PAYOUT_RELEASED",
      payout_destination: `Multi-Sign MoMo Node (Rider + Merchant + Agent)`,
      product_title: activeHandlingOrder.product_title,
      social_fund_topup: riderTopupSecFund,
      fees: {
        escrow_mobile_money: 1.50,
        platform_listing: 1.50,
        rider_share: earnedTransport,
        social_fund: riderTopupSecFund,
        platform_rider_commission: 0.50
      },
      timestamp: new Date().toISOString()
    };

    setLedger(prev => [completeTx, ...prev]);
    setActiveHandlingOrder(null);
    setToast({
      message: `ESCROW RELEASED & DISPATCHED`,
      subText: `Merchant earned K${merchantReceivedVal.toFixed(2)}. Rider earned K${earnedTransport.toFixed(2)}.`
    });
  };

  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100 flex items-center justify-center p-4 transition-all duration-300" style={{ fontFamily: "Outfit, sans-serif" }}>
      
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: -20, x: "-50%" }}
            className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-sm bg-indigo-950/95 backdrop-blur-md text-white text-xs py-3 px-5 rounded-2xl z-50 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.5)] border border-indigo-500/40 font-sans"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1 text-left">
                <span className="block text-[8.5px] text-indigo-400 tracking-widest uppercase font-extrabold">Ledger Sync Event</span>
                <span className="font-bold text-white text-sm block leading-tight">{toast.message}</span>
                {toast.subText && <p className="text-[10px] text-zinc-400 leading-snug mt-1">{toast.subText}</p>}
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* SMARTPHONE EMULATOR FRAME CONTAINER */}
      <div className="relative w-full max-w-[425px] bg-[#0c0d12] rounded-[48px] p-4.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border-6 border-slate-850 overflow-hidden transition-all duration-300" 
           style={{ height: "860px" }}
           id="smartphone-frame"
      >
        
        {/* Top Notch design */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-32 h-5.5 bg-black rounded-full z-40 flex items-center justify-around px-3 border border-slate-800/60">
          <span className="w-12 h-1 bg-zinc-800 rounded-full"></span>
          <span className="w-2 h-2 bg-indigo-950 border border-zinc-900 rounded-full"></span>
        </div>

        {/* SCREEN CANVAS WRAPPER */}
        <div className={`w-full h-full bg-[#050506] rounded-[38px] overflow-hidden relative flex flex-col justify-between select-none transition-all duration-300 ${isLightTheme ? "theme-light-active" : ""}`}>
          
          {/* LIPILA REAL TIME PAYMENT GATEWAY OVERLAY */}
          <AnimatePresence>
            {lipilaStep !== "IDLE" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 z-55 flex flex-col items-center justify-center p-6 text-center font-sans rounded-[38px]"
              >
                <div className="w-full max-w-xs space-y-6">
                  
                  {/* Header */}
                  <div className="space-y-1 mt-4">
                    <div className="flex items-center justify-center gap-1.5 text-purple-400 font-mono tracking-widest uppercase font-extrabold text-[9.5px]">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Selonachipa Escrow-Lock</span>
                    </div>
                    <h3 className="text-base font-black text-white">Lipila Mobile Checkout</h3>
                    <p className="text-zinc-500 text-[10px]">Verbid-Secured Escrow Collection Protocol</p>
                  </div>

                  {/* Large visual status indicator */}
                  <div className="relative py-2 flex items-center justify-center">
                    {lipilaStep === "INITIATING" && (
                      <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 animate-pulse">
                        <RefreshCw className="w-8 h-8 animate-spin" />
                      </div>
                    )}
                    {lipilaStep === "WAITING_FOR_PIN" && (
                      <div className="relative">
                        <div className="p-5 rounded-full bg-amber-500/10 border border-amber-500/35 text-amber-400 animate-bounce">
                          <Smartphone className="w-9 h-9" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-ping">
                          !
                        </div>
                      </div>
                    )}
                    {lipilaStep === "SUCCESS" && (
                      <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 scale-110 duration-500">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    )}
                    {lipilaStep === "FAILED" && (
                      <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/35 text-rose-400 scale-100">
                        <AlertTriangle className="w-8 h-8 animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Live metadata overview box */}
                  <div className="bg-[#0b0c10] border border-zinc-850 rounded-2xl p-4 text-left font-mono text-xs space-y-2 text-zinc-400">
                    <div className="flex justify-between">
                      <span>Subscriber Name:</span>
                      <span className="text-white font-extrabold truncate max-w-[130px]">{lookupName || "Resolving name..."}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ZM Carrier:</span>
                      <span className="text-white font-bold">{lipilaOperator} Money</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carrier Wallet:</span>
                      <span className="text-white font-bold">{lipilaPhone}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-850 pt-2 text-[#ffa500] font-extrabold">
                      <span>Order Amount:</span>
                      <span>K {lipilaAmount.toFixed(2)} ZMW</span>
                    </div>
                    {lipilaRefId && (
                      <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
                        <span>Lipila ID:</span>
                        <span className="font-sans select-all">{lipilaRefId}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Message Text */}
                  <div className="px-3 text-xs font-sans text-zinc-300 leading-relaxed min-h-[50px] flex items-center justify-center">
                    {lipilaStatusMsg}
                  </div>

                  {/* Waiting animation bar */}
                  {lipilaStep === "WAITING_FOR_PIN" && (
                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-2/3 rounded-full animate-pulse mx-auto"></div>
                    </div>
                  )}

                  {/* Actions & Dialog dismission */}
                  <div className="pt-2">
                    {lipilaStep === "FAILED" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setLipilaStep("IDLE");
                          setIsProcessingCheckout(false);
                        }}
                        className="w-full bg-rose-600 hover:bg-rose-750 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Dismiss & Retry
                      </button>
                    ) : lipilaStep === "SUCCESS" ? (
                      <div className="text-emerald-400 text-xs font-extrabold py-2 border border-emerald-500/20 rounded-xl bg-emerald-500/5">
                        ✓ Secured in Escrow
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setLipilaStep("IDLE");
                          setIsProcessingCheckout(false);
                        }}
                        className="text-[10px] text-zinc-500 hover:text-zinc-400 underline cursor-pointer"
                      >
                        Decline transaction payment
                      </button>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rider Delivery Star Rating Modal */}
          <AnimatePresence>
            {ratingOrder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 rounded-[38px]"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#0e0d16] border border-yellow-500/30 p-5 rounded-2xl w-full max-w-sm text-left shadow-2xl relative overflow-hidden"
                >
                  {/* Vibe lines */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600" />
                  
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 pt-1">
                    ⭐⭐⭐⭐ Rate Delivery Experience
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                    Order <span className="text-yellow-400 font-bold">#{ratingOrder.order_id}</span> has been hand-delivered! Tell us how your rider, <span className="font-semibold text-white">{ratingOrder.rider_id || "Express Moto Rider"}</span>, performed:
                  </p>

                  {/* Stars selection row */}
                  <div className="flex justify-center items-center gap-3 my-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRiderRating(star)}
                        className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      >
                        <svg
                          className={`w-6.5 h-6.5 ${
                            star <= riderRating ? "text-yellow-400 fill-yellow-400" : "text-zinc-700 fill-zinc-900"
                          } transition-colors`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Feedback Comment box */}
                  <div className="space-y-1 mb-3">
                    <label className="text-[8.5px] uppercase font-mono tracking-widest text-zinc-500 block font-bold">
                      Write a review (Optional)
                    </label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="e.g. Friendly rider, arrived hot and fresh in Lusaka Central!"
                      className="w-full bg-zinc-950 border border-zinc-850 text-[10px] text-white p-2.5 rounded-xl placeholder-zinc-700 focus:outline-none focus:border-yellow-500/40 resize-none h-14 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Actions row */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRatingOrder(null);
                        setRiderRating(5);
                        setRatingComment("");
                      }}
                      className="flex-1 py-1.5 rounded-lg text-center border border-zinc-850 hover:bg-zinc-900 text-zinc-400 font-bold text-[10px] cursor-pointer"
                    >
                      Skip rating
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Submit review
                        setOrders(prev => prev.map(o => {
                          if (o.order_id === ratingOrder.order_id) {
                            return {
                              ...o,
                              rider_rating: riderRating,
                              rider_feedback: ratingComment || "Satisfactory"
                            };
                          }
                          return o;
                        }));

                        setToast({
                          message: "Rating Submitted! ⭐",
                          subText: `Thank you for rating with ${riderRating} stars!`
                        });

                        setRatingOrder(null);
                        setRiderRating(5);
                        setRatingComment("");
                      }}
                      className="flex-1 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-[10px] rounded-lg cursor-pointer hover:from-yellow-450 hover:to-amber-450 shadow shadow-yellow-500/10 text-center uppercase tracking-wide"
                    >
                      Submit ✦
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* RENDER VIEW: NOT SIGNED IN (ROLE SETUP HOME SCREEN) */}
          <AnimatePresence mode="wait">
            {!isLoggedIn ? (
              buyerSignupStep > 0 ? (
                // UNIFIED SIGNUP & LOGIN EXPERIENCE FOR ALL ROLE GROUPS
                <motion.div 
                  key="buyer-signup-stepper"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full h-full flex flex-col justify-between pt-6 pb-5 px-6 relative bg-[#050506]"
                >
                  {/* FLOATING DEVELOPER ACTION: SELECT OTHER ROLES */}
                  <div className="absolute top-4 right-4 z-30">
                    <button
                      onClick={() => {
                        setBuyerSignupStep(0);
                        setToast({
                          message: "Role Switcher Activated",
                          subText: "Loading alternative partner portal setups..."
                        });
                      }}
                      className="text-[10px] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1 font-bold cursor-pointer transition-colors"
                    >
                      ⚙️ Switch Role
                    </button>
                  </div>

                  {/* HEADER SYSTEM */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 tracking-wider">
                    {buyerSignupStep > 0 && !isBuyerLoginMode ? (
                      <button
                        onClick={() => {
                          setBuyerSignupStep(prev => prev - 1);
                        }}
                        className="flex items-center gap-1.5 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>BACK TO {buyerSignupStep === 1 ? "ROLE SELECT" : `STEP ${buyerSignupStep - 1}`}</span>
                      </button>
                    ) : (
                      <span>SELONACHIPA {selectedRole} PORTAL</span>
                    )}
                    <span className="font-mono text-blue-500">
                      {isBuyerLoginMode ? "SECURED LOGIN" : `STEP ${buyerSignupStep} OF ${selectedRole === "BUYER" ? 7 : 4}`}
                    </span>
                  </div>

                  {/* ACTIVE STEP SELECTOR */}
                  <div className="flex-1 flex flex-col justify-center my-auto">
                    {isBuyerLoginMode ? (
                      isRecoveringPin ? (
                        // PIN RECOVERY VIEW (Set PIN with security questions to reset PIN value)
                        <div className="space-y-4">
                          <div className="flex flex-col items-center">
                            <div className="w-[64px] h-[64px] bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/5 mb-2 shrink-0">
                              <HelpCircle className="w-8 h-8 text-amber-500 stroke-[2]" />
                            </div>
                            <h2 className="text-lg font-extrabold text-white text-center">Reset Login PIN</h2>
                            <p className="text-[11.5px] text-zinc-400 mt-1 max-w-[275px] text-center leading-relaxed">
                              Answer your secure backup question to unlock your account credentials.
                            </p>
                          </div>

                          <div className="space-y-3 bg-zinc-950/80 p-4 rounded-xl border border-zinc-900 text-left">
                            <div>
                              <span className="block text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Security Question Set</span>
                              <p className="text-xs text-zinc-100 font-bold mb-2 leading-relaxed">{securityQuestion}</p>
                              
                              <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Your Answer</label>
                              <input 
                                type="text"
                                value={recoveryAnswerInput}
                                onChange={(e) => setRecoveryAnswerInput(e.target.value)}
                                placeholder="Enter your backup answer"
                                className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-3 text-white text-xs focus:border-blue-500 focus:outline-none placeholder:text-zinc-650"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Set New 4-Digit PIN</label>
                              <input 
                                type="password"
                                maxLength={4}
                                value={newPinAfterRecovery}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  setNewPinAfterRecovery(val);
                                }}
                                placeholder="••••"
                                className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-xs font-mono tracking-widest focus:border-blue-500 focus:outline-none placeholder:text-zinc-650"
                              />
                              <p className="text-[8px] text-zinc-500 mt-0.5 font-sans leading-none">Four digits strictly used for secure mobile login signs.</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (recoveryAnswerInput.trim().toLowerCase() !== securityAnswer.trim().toLowerCase()) {
                                  setToast({
                                    message: "Incorrect Security Answer",
                                    subText: "The provided answer does not match our records."
                                  });
                                  return;
                                }
                                if (newPinAfterRecovery.length < 4) {
                                  setToast({
                                    message: "PIN Too Short",
                                    subText: "Your secure PIN must be exactly 4 digits."
                                  });
                                  return;
                                }
                                setBuyerPinCode(newPinAfterRecovery);
                                setIsRecoveringPin(false);
                                setLoginPinInput(newPinAfterRecovery);
                                setRecoveryAnswerInput("");
                                setNewPinAfterRecovery("");
                                setToast({
                                  message: "PIN Reset Successful",
                                  subText: "Your credentials have been updated. Use your new PIN to log in."
                                });
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Verify & Reset PIN</span>
                            </motion.button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsRecoveringPin(false);
                                setRecoveryAnswerInput("");
                                setNewPinAfterRecovery("");
                              }}
                              className="w-full border border-zinc-800 bg-transparent text-zinc-400 py-2.5 rounded-xl text-center text-xs font-bold hover:text-white"
                            >
                              Back to Login
                            </button>
                          </div>
                        </div>
                      ) : (
                        // STANDARD PIN LOGIN VIEW
                        <div className="space-y-4">
                          <div className="flex flex-col items-center">
                            <div className="w-[64px] h-[64px] bg-blue-600/10 border border-blue-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5 mb-2 shrink-0">
                              <ShoppingBag className="w-8 h-8 text-blue-500 stroke-[2.5]" />
                            </div>
                            
                            <h2 className="text-xl font-extrabold text-white text-center">Welcome Back</h2>
                            <p className="text-[11.5px] text-zinc-400 mt-1 max-w-[280px] text-center leading-relaxed">
                              Sign in instantly using your mobile number and four digit PIN.
                            </p>
                          </div>

                          <div className="space-y-3 text-left">
                            <div>
                              <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">
                                Mobile Number
                              </label>
                              <div className="flex gap-2">
                                <span className="w-16 h-11 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-350 text-xs select-none shrink-0 shadow-inner">
                                  +260
                                </span>
                                <input
                                  type="tel"
                                  maxLength={9}
                                  value={loginPhoneInput}
                                  onChange={(e) => setLoginPhoneInput(e.target.value.replace(/\D/g, ""))}
                                  placeholder="97X XXX XXX"
                                  className="flex-grow h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-xs font-mono focus:border-blue-500 focus:outline-none placeholder:text-zinc-650"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                  4-Digit PIN
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setIsRecoveringPin(true)}
                                  className="text-[9.5px] text-blue-400 hover:text-blue-300 font-bold hover:underline"
                                >
                                  Forgot PIN?
                                </button>
                              </div>
                              <input
                                type="password"
                                maxLength={4}
                                value={loginPinInput}
                                onChange={(e) => setLoginPinInput(e.target.value.replace(/\D/g, ""))}
                                placeholder="••••"
                                className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-xs font-mono tracking-widest focus:border-blue-500 focus:outline-none placeholder:text-zinc-650"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (loginPhoneInput.trim().length < 9) {
                                  setToast({
                                    message: "Invalid Phone Number",
                                    subText: "Please enter your full 9-digit Zambia mobile number."
                                  });
                                  return;
                                }
                                if (loginPinInput.trim().length < 4) {
                                  setToast({
                                    message: "Invalid PIN Code",
                                    subText: "Your secure login PIN must be exactly 4 digits."
                                  });
                                  return;
                                }

                                const cleanPhone = loginPhoneInput.replace(/^(\+260|260|0)/, "");
                                const localAccounts = localStorage.getItem("selo_registered_accounts") 
                                  ? JSON.parse(localStorage.getItem("selo_registered_accounts")!) 
                                  : [];
                                
                                const foundLocal = localAccounts.find((acc: any) => {
                                  const accClean = acc.phone.replace(/^(\+260|260|0)/, "");
                                  return accClean === cleanPhone && acc.role === selectedRole;
                                });

                                let authenticatedAccount: any = null;
                                let authError = "";

                                if (foundLocal) {
                                  if (foundLocal.pin === loginPinInput) {
                                    authenticatedAccount = foundLocal;
                                  } else {
                                    authError = "Incorrect PIN code. Please try again or use recovery backup.";
                                  }
                                } else {
                                  if (selectedRole === "BUYER") {
                                    if ((cleanPhone === "971122334" || cleanPhone === "971122335" || cleanPhone === "771122334") && loginPinInput === "1234") {
                                      authenticatedAccount = { name: "Clara Mwamba", phone: cleanPhone, role: "BUYER", pin: "1234" };
                                    }
                                  } else if (selectedRole === "SELLER") {
                                    if ((cleanPhone === "975619280" || cleanPhone === "97561928") && loginPinInput === "2580") {
                                      authenticatedAccount = { name: "Chipo Mwansa", phone: cleanPhone, role: "SELLER", pin: "2580", storeName: "Chisamba Organic Trade Hub", landmark: "Plot 33, Great East Road Near Cooperative Block, Chisamba, ZM" };
                                    }
                                  } else if (selectedRole === "AGENT") {
                                    if (cleanPhone === "972233445" && loginPinInput === "1357") {
                                      authenticatedAccount = { name: "Bupe Phiri", phone: cleanPhone, role: "AGENT", pin: "1357", agencyName: "Bupe & Sons Trade Agency" };
                                    }
                                  } else if (selectedRole === "RIDER") {
                                    if ((cleanPhone === "971122334" || cleanPhone === "971203040") && loginPinInput === "0852") {
                                      authenticatedAccount = { name: "Chanda Runner", phone: cleanPhone, role: "RIDER", pin: "0852", vehicleType: "Motorcycle" };
                                    }
                                  }

                                  if (!authenticatedAccount && !authError) {
                                    authError = "This mobile number is not registered as a " + selectedRole + ". Change to 'Register' or check input.";
                                  }
                                }

                                if (authError) {
                                  setToast({
                                    message: "Access Denied",
                                    subText: authError
                                  });
                                  return;
                                }

                                if (selectedRole === "BUYER") {
                                  setBuyerPhone(cleanPhone);
                                  setCheckoutPhone("0" + cleanPhone);
                                  
                                  let cleanOpVal = cleanPhone;
                                  if (cleanOpVal.startsWith("0")) {
                                    cleanOpVal = cleanOpVal.substring(1);
                                  }
                                  let detectedOp: "Airtel" | "MTN" | "Zamtel" = "Airtel";
                                  if (cleanOpVal.startsWith("97") || cleanOpVal.startsWith("77")) {
                                    detectedOp = "Airtel";
                                  } else if (cleanOpVal.startsWith("96") || cleanOpVal.startsWith("76")) {
                                    detectedOp = "MTN";
                                  } else if (cleanOpVal.startsWith("95") || cleanOpVal.startsWith("75")) {
                                    detectedOp = "Zamtel";
                                  }
                                  setBuyerOperator(detectedOp);
                                  setCheckoutOperator(detectedOp);

                                  setBuyerNameInput(authenticatedAccount.name);
                                  const parts = authenticatedAccount.name.split(" ");
                                  setBuyerFirstName(parts[0] || "");
                                  setBuyerSurname(parts.slice(1).join(" ") || "");
                                } else if (selectedRole === "SELLER") {
                                  setSellerName(authenticatedAccount.name);
                                  setSellerStoreName(authenticatedAccount.storeName || `${authenticatedAccount.name}'s Shop`);
                                  if (authenticatedAccount.landmark) {
                                    setSellerLocationLandmark(authenticatedAccount.landmark);
                                  }
                                } else if (selectedRole === "AGENT") {
                                  // Default active simulation settings
                                } else if (selectedRole === "RIDER") {
                                  // Default active simulation settings
                                }

                                setIsLoggedIn(true);
                                setToast({
                                  message: `Welcome Back, ${authenticatedAccount.name}!`,
                                  subText: `SeloNaChipa ${selectedRole} session authenticated.`
                                });
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                            >
                              <span>Sign In Securely</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.button>

                            <div className="flex items-center gap-3 my-2">
                              <div className="flex-1 h-px bg-zinc-900"></div>
                              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold shrink-0">or continue with</span>
                              <div className="flex-1 h-px bg-zinc-900"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <button 
                                type="button"
                                onClick={() => {
                                  setBuyerPhone("971122334");
                                  setBuyerNameInput("Google Sandbox Guest");
                                  setIsLoggedIn(true);
                                  setToast({
                                    message: "Google Social Match Verified",
                                    subText: "Sandbox authentication active. Welcome Google Guest."
                                  });
                                }}
                                className="flex items-center justify-center gap-2 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 py-2 rounded-xl text-[10.5px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer h-9 shrink-0"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.29 5.29 0 0 1 8.7 13.2a5.29 5.29 0 0 1 8.7 13.2a5.29 5.29 0 0 1-5.29-5.314c1.28 0 2.41.48 3.284 1.28l3.12-3.12A9.23 9.23 0 0 0 13.99 3.6 9.6 9.6 0 0 0 4.4 13.2a9.6 9.6 0 0 0 9.59 9.6c5.558 0 9.59-3.9 9.59-9.6a8.88 8.88 0 0 0-.18-1.915H12.24Z"/>
                                </svg>
                                <span>Google</span>
                              </button>
                              
                              <button 
                                type="button"
                                onClick={() => {
                                  setBuyerPhone("965544332");
                                  setBuyerNameInput("Facebook Sandbox Guest");
                                  setIsLoggedIn(true);
                                  setToast({
                                    message: "Facebook Mutual Match Verified",
                                    subText: "Sandbox authentication active. Welcome Facebook Guest."
                                  });
                                }}
                                className="flex items-center justify-center gap-2 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 py-2 rounded-xl text-[10.5px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer h-9 shrink-0"
                              >
                                <svg className="w-3.5 h-3.5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                <span>Facebook</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setIsBuyerLoginMode(false);
                                setBuyerPhone("");
                              }}
                              className="w-full text-zinc-500 hover:text-zinc-400 py-1 text-xs font-bold transition-all text-center block"
                            >
                              New to Selonachipa? Register Here
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      // STANDARD MULTI-STEP SIGNUP ENGINE
                      <>
                        {buyerSignupStep === 1 && (
                          <div className="space-y-4 text-left">
                            {/* Logo Row */}
                            <div className="flex flex-col items-center text-center">
                              <div className="w-[64px] h-[64px] bg-blue-600/10 border border-blue-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5 mb-3 shrink-0">
                                <ShoppingBag className="w-8 h-8 text-blue-500 stroke-[2.5]" />
                              </div>
                              
                              <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
                                Welcome to Selonachipa
                              </h1>
                              <p className="text-[11.5px] text-zinc-400 font-medium leading-relaxed mt-1 max-w-[280px]">
                                Fresh produce, fashion, dry foods — delivered to you across Zambia.
                              </p>
                            </div>

                            {/* Warning Indicator */}
                            <div className="bg-red-950/40 border border-red-500/20 p-3.5 rounded-xl text-left text-xs my-2">
                              <div className="flex items-start gap-2.5">
                                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <p className="font-extrabold text-red-200">National SIM Registration Warning</p>
                                  <p className="text-[10px] text-zinc-300 leading-normal font-sans">
                                    Under Zambian law, you must register using a phone registered in your actual <strong>legal name</strong> as held by Telcos and linked to your Mobile Money collection account.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Mobile Number Entry Container */}
                            <div className="space-y-1.5 text-left">
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                Mobile Money Number
                              </label>
                              <div className="flex gap-2">
                                <div className="w-16 h-11 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-300 text-sm select-none shrink-0 shadow-inner">
                                  +260
                                </div>
                                <input
                                  type="tel"
                                  maxLength={9}
                                  value={buyerPhone}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setBuyerPhone(val);
                                    let cleanVal = val;
                                    if (cleanVal.startsWith("0")) {
                                      cleanVal = cleanVal.substring(1);
                                    }
                                    if (cleanVal.startsWith("97") || cleanVal.startsWith("77")) {
                                      setBuyerOperator("Airtel");
                                    } else if (cleanVal.startsWith("96") || cleanVal.startsWith("76")) {
                                      setBuyerOperator("MTN");
                                    } else if (cleanVal.startsWith("95") || cleanVal.startsWith("75")) {
                                      setBuyerOperator("Zamtel");
                                    }
                                  }}
                                  placeholder="97X XXX XXX"
                                  className="flex-grow h-11 bg-zinc-900 border border-zinc-805 rounded-xl px-4 text-white text-sm font-mono focus:border-blue-500 focus:outline-none transition-all shadow-inner placeholder:text-zinc-650"
                                />
                              </div>
                            </div>

                            {/* Operator Selector */}
                            <div className="text-left space-y-1">
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                Operator Network
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {(["Airtel", "MTN", "Zamtel"] as const).map(op => (
                                  <button
                                    key={op}
                                    type="button"
                                    onClick={() => setBuyerOperator(op)}
                                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                      buyerOperator === op
                                        ? "bg-blue-600/10 border-blue-500 text-blue-400"
                                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                                    }`}
                                  >
                                    {op}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Step A: Lipila Auto-resolved SIM Name Inquiry */}
                            <div className="pt-1.5">
                              <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => {
                                  if (buyerPhone.trim().length < 9) {
                                    setToast({
                                      message: "Lookup Ineligible",
                                      subText: "Please enter your full 9-digit Zambian mobile money number."
                                    });
                                    return;
                                  }
                                  setIsLookingUpLipilaName(true);
                                  fetch(`/api/lipila/lookup-name?phone=${buyerPhone}`)
                                    .then(res => res.json())
                                    .then(data => {
                                      setIsLookingUpLipilaName(false);
                                      if (data.name) {
                                        setLipilaResolvedName(data.name);
                                        const names = data.name.trim().split(" ");
                                        setBuyerFirstName(names[0] || "");
                                        setBuyerSurname(names.slice(1).join(" ") || "");
                                        setToast({
                                          message: "SIM Registry Resolved ✓",
                                          subText: `Verified Subscriber: "${data.name}" via Lipila Name Inquiry.`
                                        });
                                      } else {
                                        setToast({
                                          message: "SIM Search Failure",
                                          subText: "Could not retrieve lookup value from server. Please type manually."
                                        });
                                      }
                                    })
                                    .catch(err => {
                                      setIsLookingUpLipilaName(false);
                                      setToast({
                                        message: "API Search Timeout",
                                        subText: "Network congestion, utilizing pre-configured SIM registration directories."
                                      });
                                    });
                                }}
                                disabled={isLookingUpLipilaName}
                                className="w-full bg-blue-600/10 border border-blue-500/35 text-blue-400 hover:bg-blue-600/20 text-xs font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                              >
                                {isLookingUpLipilaName ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                                    <span>Contacting Sim Directory Authorities...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Verify Subscriber Name with Lipila API</span>
                                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </>
                                )}
                              </motion.button>
                            </div>

                            {/* Subscriber Form Fields */}
                            <div className="grid grid-cols-2 gap-3 text-left">
                              <div>
                                <label className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                                  <span>First Name</span>
                                  {lipilaResolvedName && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                </label>
                                <input
                                  type="text"
                                  value={buyerFirstName}
                                  onChange={(e) => setBuyerFirstName(e.target.value)}
                                  placeholder="Auto-populated"
                                  className={`w-full h-10 bg-zinc-900 border rounded-xl px-3 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all ${
                                    lipilaResolvedName ? "border-emerald-500/50 bg-emerald-950/10 text-emerald-300 font-bold" : "border-zinc-800"
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-[9.5px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                                  <span>Surname</span>
                                  {lipilaResolvedName && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                </label>
                                <input
                                  type="text"
                                  value={buyerSurname}
                                  onChange={(e) => setBuyerSurname(e.target.value)}
                                  placeholder="Auto-populated"
                                  className={`w-full h-10 bg-zinc-900 border rounded-xl px-3 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all ${
                                    lipilaResolvedName ? "border-emerald-500/50 bg-emerald-950/10 text-emerald-300 font-bold" : "border-zinc-800"
                                  }`}
                                />
                              </div>
                            </div>

                            {lipilaResolvedName && (
                              <p className="text-[10px] text-emerald-400 text-left bg-emerald-950/20 border border-emerald-500/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>SIM verified name matches mobile money registry profile.</span>
                              </p>
                            )}

                            {/* Continue Buttons */}
                            <div className="pt-2 w-full">
                              <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  if (buyerPhone.trim().length < 9) {
                                    setToast({ message: "Mobile Missing", subText: "Please enter your carrier number." });
                                    return;
                                  }
                                  if (!buyerFirstName.trim()) {
                                    setToast({ message: "Verification Required", subText: "Please verify subscriber name via Lipila inquiry before advancing." });
                                    return;
                                  }
                                  setBuyerSignupStep(2);
                                }}
                                className="w-full bg-[#ffa500] hover:bg-amber-500 text-black text-xs font-bold py-3 rounded-xl shadow-lg mt-1 flex items-center justify-center gap-1.5 cursor-pointer h-10"
                              >
                                <span>Next: Setup Secure PIN →</span>
                              </motion.button>
                              
                              <button
                                type="button"
                                onClick={() => setIsBuyerLoginMode(true)}
                                className="w-full text-center text-zinc-500 hover:text-zinc-400 py-2.5 text-xs font-bold transition-all block mt-2"
                              >
                                Already have an account? Log In
                              </button>
                            </div>
                          </div>
                        )}

                        {buyerSignupStep === 2 && (
                          <div className="space-y-4">
                            <div className="flex flex-col items-center">
                              <div className="w-[64px] h-[64px] bg-blue-600/10 border border-blue-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5 mb-2 shrink-0">
                                <Lock className="w-8 h-8 text-blue-500 stroke-[2.5]" />
                              </div>
                              <h2 className="text-xl font-extrabold text-white">Create Secure PIN</h2>
                              <p className="text-[11px] text-zinc-400 mt-0.5 max-w-[275px] text-center leading-normal">
                                Set a four digit login PIN. OTP code delays are completely bypassed!
                              </p>
                            </div>

                            <div className="space-y-3.5 text-left">
                              <div>
                                <label className="block text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Set 4-Digit Login PIN</label>
                                <input 
                                  type="password"
                                  maxLength={4}
                                  value={buyerPinCode}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setBuyerPinCode(val);
                                  }}
                                  placeholder="e.g. 1234"
                                  className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-xs font-mono tracking-widest focus:border-blue-500 focus:outline-none placeholder:text-zinc-700"
                                />
                                <p className="text-[8.5px] text-zinc-500 mt-1">This PIN secures your mobile account across MTN, Airtel & Zamtel.</p>
                              </div>

                              <div>
                                <label className="block text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Select Recovery Question</label>
                                <select
                                  value={securityQuestion}
                                  onChange={(e) => setSecurityQuestion(e.target.value)}
                                  className="w-full h-11 bg-zinc-900 border border-zinc-800 text-white text-xs rounded-xl focus:border-blue-500 px-3 cursor-pointer"
                                >
                                  <option value="What was the name of your primary school?">What was the name of your primary school?</option>
                                  <option value="In which city or town were you born?">In which city or town were you born?</option>
                                  <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Answer to Security Question</label>
                                <input 
                                  type="text"
                                  value={securityAnswer}
                                  onChange={(e) => setSecurityAnswer(e.target.value)}
                                  placeholder="Answer (e.g. Chilenje Primary)"
                                  className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-xs focus:border-[#ffa500] focus:outline-none placeholder:text-zinc-650"
                                />
                                <p className="text-[8.5px] text-zinc-500 mt-1">Used to safely retrieve or reset your login PIN if forgotten.</p>
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (buyerPinCode.length < 4) {
                                  setToast({ message: "PIN Code too short", subText: "Please configure a full 4-digit numeric login PIN." });
                                  return;
                                }
                                if (!securityAnswer.trim()) {
                                  setToast({ message: "Answer Required", subText: "An answer is needed to back up these credentials." });
                                  return;
                                }
                                setBuyerSignupStep(3);
                                setToast({
                                  message: "Credentials Configured!",
                                  subText: "Recovery backup question mapped to secure store index."
                                });
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg mt-1 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Save PIN & Continue</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}

                        {/* ROLE-SPECIFIC REGISTRATION FOR BUYERS */}
                        {selectedRole === "BUYER" && (
                          <>
                            {buyerSignupStep === 3 && (
                              <div className="space-y-4 text-left">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-[72px] h-[72px] bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/5 mb-3 shrink-0">
                                    <Coins className="w-10 h-10 text-amber-500 stroke-[2]" />
                                  </div>
                                  <h2 className="text-xl font-extrabold text-white">Select Carrier Wallet</h2>
                                  <p className="text-[11.5px] text-zinc-400 mt-1 max-w-[280px] leading-relaxed">
                                    Connect with local mobile money settlements for checkout payments.
                                  </p>
                                </div>

                                <div className="space-y-2.5">
                                  {(["Airtel Money", "MTN MoMo", "Zamtel Kwacha"] as const).map(wt => {
                                    const isSelected = buyerOperator === (wt.startsWith("Airtel") ? "Airtel" : wt.startsWith("MTN") ? "MTN" : "Zamtel");
                                    return (
                                      <button
                                        key={wt}
                                        type="button"
                                        onClick={() => setBuyerOperator(wt.startsWith("Airtel") ? "Airtel" : wt.startsWith("MTN") ? "MTN" : "Zamtel")}
                                        className={`w-full py-3.5 px-4 rounded-xl border flex justify-between items-center transition-all cursor-pointer ${
                                          isSelected 
                                            ? "bg-amber-500/10 border-amber-500 text-white" 
                                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                                        }`}
                                      >
                                        <span className="text-xs font-bold font-sans">{wt}</span>
                                        {isSelected && <span className="text-[10px] text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">DEFAULT Escrow</span>}
                                      </button>
                                    );
                                  })}
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setBuyerSignupStep(4)}
                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <span>Lock in Wallet Selection</span>
                                  <ArrowRight className="w-4 h-4" />
                                </motion.button>
                              </div>
                            )}

                            {buyerSignupStep === 4 && (
                              <div className="space-y-4 text-left">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-[64px] h-[64px] bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/5 mb-3 shrink-0">
                                    <ShoppingBag className="w-8 h-8 text-indigo-400" />
                                  </div>
                                  <h2 className="text-xl font-extrabold text-white">Selonachipa Escrow Agreement</h2>
                                  <p className="text-[11.5px] text-zinc-400 mt-1 leading-normal max-w-[280px]">
                                    We protect your payments. Funds are locked in Lipila Escrow and only released to sellers as soon as they dispatch.
                                  </p>
                                </div>

                                <div className="space-y-2 text-[10.5px] text-zinc-400 max-h-[170px] overflow-y-auto scrollbar-none border border-zinc-850 p-3 bg-[#0c0d12]/50 rounded-2xl leading-relaxed">
                                  <div className="flex gap-2 items-start py-0.5">
                                    <span className="text-[#ffa500] font-bold">1.</span>
                                    <span>Buyers pay via Lipila, triggering prompt PIN authorization.</span>
                                  </div>
                                  <div className="flex gap-2 items-start py-0.5">
                                    <span className="text-[#ffa500] font-bold">2.</span>
                                    <span>Once verified, funds are auto-locked in Escrow.</span>
                                  </div>
                                  <div className="flex gap-2 items-start py-0.5">
                                    <span className="text-[#ffa500] font-bold">3.</span>
                                    <span>Cash release is triggered when sellers register parcel drop-offs at nearby hubs.</span>
                                  </div>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setBuyerSignupStep(5)}
                                  className="w-full bg-[#ffa500] hover:bg-amber-500 text-black text-xs font-extrabold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <span>I Accept Escrow Protection</span>
                                  <ShieldCheck className="w-4 h-4 text-black" />
                                </motion.button>
                              </div>
                            )}

                            {buyerSignupStep === 5 && (
                              <div className="space-y-4 text-left">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-[64px] h-[64px] bg-teal-500/10 border border-teal-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/5 mb-3 shrink-0">
                                    <ShoppingBag className="w-8 h-8 text-teal-400" />
                                  </div>
                                  <h2 className="text-xl font-extrabold text-white font-sans">Choose Interests</h2>
                                  <p className="text-[11px] text-zinc-400 mt-1 max-w-[280px]">
                                    Calibrate product feeds with matching items from local farmers and vendors.
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                                  {["Fresh Produce", "Chitenge Fashion", "Organic Fertilizer", "Dry Foods", "Poultry Feeders", "Copper Crafts"].map(cat => {
                                    const hasCat = buyerInterests.includes(cat);
                                    return (
                                      <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                          if (hasCat) {
                                            setBuyerInterests(prev => prev.filter(c => c !== cat));
                                          } else {
                                            setBuyerInterests(prev => [...prev, cat]);
                                          }
                                        }}
                                        className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                                          hasCat 
                                            ? "bg-teal-500/10 border-teal-500 text-teal-400" 
                                            : "bg-zinc-900 border-zinc-800 text-zinc-400"
                                        }`}
                                      >
                                        <span className="truncate">{cat}</span>
                                        {hasCat && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-1.5" />}
                                      </button>
                                    );
                                  })}
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setBuyerSignupStep(6)}
                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <span>Calibrate Feed →</span>
                                </motion.button>
                              </div>
                            )}

                            {buyerSignupStep === 6 && (
                              <div className="space-y-4 font-sans text-left">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-[64px] h-[64px] bg-[#ffa500]/10 border border-[#ffa500]/25 rounded-2xl flex items-center justify-center shadow-lg shadow-[#ffa500]/5 mb-3 shrink-0">
                                    <ShoppingBag className="w-8 h-8 text-[#ffa500]" />
                                  </div>
                                  <h2 className="text-xl font-extrabold text-white">Select Delivery Area</h2>
                                  <p className="text-[11.5px] text-zinc-400 mt-1 max-w-[280px]">
                                    Determine compounds in Lusaka, Ndola or Kitwe to optimize local delivery calculations.
                                  </p>
                                </div>

                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                  <div className="grid grid-cols-3 gap-2">
                                    {(["Lusaka", "Ndola", "Kitwe"] as const).map(city => (
                                      <button
                                        key={city}
                                        type="button"
                                        onClick={() => {
                                          setBuyerLocationMethod("manual");
                                          setBuyerSelectedCity(city);
                                        }}
                                        className={`py-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                          buyerLocationMethod === "manual" && buyerSelectedCity === city
                                            ? "bg-teal-500/10 border-teal-500 text-teal-400"
                                            : "bg-zinc-900 border-zinc-855 text-zinc-400"
                                        }`}
                                      >
                                        {city}
                                      </button>
                                    ))}
                                  </div>

                                  <div>
                                    <label className="block text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Neighbourhood / Compound</label>
                                    <input
                                      type="text"
                                      value={buyerNeighbourhood}
                                      onChange={(e) => {
                                        setBuyerLocationMethod("manual");
                                        setBuyerNeighbourhood(e.target.value);
                                      }}
                                      placeholder="e.g. Chelstone, Kabwata, Town"
                                      className="w-full h-11 bg-zinc-900 border border-zinc-855 rounded-xl px-4 text-white text-xs focus:border-teal-500 focus:outline-none placeholder-zinc-650 font-mono"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBuyerLocationMethod(null);
                                      setBuyerSignupStep(7);
                                      setToast({
                                        message: "Location Skipped",
                                        subText: "We can set delivery compound later during active orders checkout."
                                      });
                                    }}
                                    className="h-11 border border-zinc-800 bg-transparent text-zinc-400 hover:text-white py-3 rounded-xl text-center text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Skip for now
                                  </button>

                                  <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      if (buyerLocationMethod !== "manual") {
                                        setBuyerLocationMethod("manual");
                                      }
                                      if (!buyerNeighbourhood.trim()) {
                                        setToast({ message: "Neighborhood Needed", subText: "Please type your neighborhood!" });
                                        return;
                                      }
                                      setBuyerSignupStep(7);
                                      setToast({
                                        message: "Location Confirmed",
                                        subText: `${buyerNeighbourhood}, ${buyerSelectedCity} configured successfully.`
                                      });
                                    }}
                                    className="h-11 bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                  >
                                    <span>Confirm →</span>
                                  </motion.button>
                                </div>
                              </div>
                            )}

                            {buyerSignupStep === 7 && (
                              <div className="space-y-4 font-sans text-left">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-[64px] h-[64px] bg-blue-600/10 border border-blue-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5 mb-3 shrink-0">
                                    <User className="w-8 h-8 text-blue-500" />
                                  </div>
                                  <h2 className="text-xl font-extrabold text-white">Final Account Summary</h2>
                                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                                    Verify your registered details to complete your secure setup.
                                  </p>
                                </div>

                                <div className="bg-[#0c0d12] border border-zinc-850 p-3.5 rounded-2xl space-y-2 text-xs text-zinc-300">
                                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                                    <span className="text-zinc-500 font-bold">Subscriber Name</span>
                                    <span className="font-semibold text-white">{buyerFirstName} {buyerSurname}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                                    <span className="text-zinc-500 font-bold">SIM Phone Number</span>
                                    <span className="font-mono text-zinc-200 font-bold">+260 {buyerPhone}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                                    <span className="text-zinc-500 font-bold">Wallet Carrier</span>
                                    <span className="font-semibold text-white">{buyerOperator}</span>
                                  </div>
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-zinc-500 font-bold">Delivery Zone</span>
                                    <span className="font-semibold text-emerald-400">{buyerNeighbourhood || "Munali"}, {buyerSelectedCity || "Lusaka"}</span>
                                  </div>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    const combined = `${buyerFirstName} ${buyerSurname}`.trim();
                                    setBuyerNameInput(combined);
                                    setCheckoutPhone("0" + buyerPhone);
                                    setCheckoutOperator(buyerOperator);

                                    if (!buyerNeighbourhood.trim()) {
                                      setBuyerNeighbourhood("Munali");
                                      setBuyerSelectedCity("Lusaka");
                                    }

                                    // Save registered account to localStorage
                                    const localAccounts = localStorage.getItem("selo_registered_accounts") 
                                      ? JSON.parse(localStorage.getItem("selo_registered_accounts")!) 
                                      : [];
                                    const newAcc = {
                                      phone: buyerPhone,
                                      name: combined,
                                      pin: buyerPinCode,
                                      securityQuestion,
                                      securityAnswer,
                                      role: "BUYER",
                                      carrier: buyerOperator,
                                      neighbourhood: buyerNeighbourhood || "Munali",
                                      city: buyerSelectedCity || "Lusaka"
                                    };
                                    localAccounts.push(newAcc);
                                    localStorage.setItem("selo_registered_accounts", JSON.stringify(localAccounts));

                                    setIsLoggedIn(true);
                                    setBuyerFeedTab("FEED");
                                    setToast({
                                      message: `Account Active, Welcome ${buyerFirstName}!`,
                                      subText: "Calibration check complete. Launched into main shopping index!"
                                    });
                                  }}
                                  className="w-full bg-[#ffa500] hover:bg-amber-500 text-black text-xs font-extrabold py-3.5 rounded-xl shadow-lg mt-4 flex items-center justify-center gap-1.5 cursor-pointer h-11"
                                >
                                  <span>Complete Setup & Buy ✓</span>
                                </motion.button>
                              </div>
                            )}
                          </>
                        )}

                        {/* ROLE-SPECIFIC REGISTRATION FOR SELLERS / AGENTS / RIDERS */}
                        {selectedRole !== "BUYER" && (
                          <>
                            {buyerSignupStep === 3 && (
                              <div className="space-y-4 text-left font-sans">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-[64px] h-[64px] bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/5 mb-3 shrink-0">
                                    <ShoppingBag className="w-8 h-8 text-indigo-400" />
                                  </div>
                                  <h2 className="text-xl font-extrabold text-white">{selectedRole} Configuration</h2>
                                  <p className="text-[11.5px] text-zinc-400 mt-1 max-w-[280px]">
                                    Provide credentials and carrier wallet options to configure your active dashboard.
                                  </p>
                                </div>

                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                  {/* Mobile Money Carrier Selection */}
                                  <div>
                                    <label className="block text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Mobile Money Payout Network</label>
                                    <select
                                      value={buyerOperator}
                                      onChange={(e) => setBuyerOperator(e.target.value as any)}
                                      className="w-full h-10 bg-zinc-900 border border-zinc-800 text-white text-xs rounded-xl focus:border-blue-500 px-3 cursor-pointer"
                                    >
                                      <option value="Airtel">Airtel Money (+260 {buyerPhone})</option>
                                      <option value="MTN">MTN MoMo (+260 {buyerPhone})</option>
                                      <option value="Zamtel">Zamtel Kwacha (+260 {buyerPhone})</option>
                                    </select>
                                  </div>

                                  {selectedRole === "SELLER" && (
                                    <>
                                      <div>
                                        <label className="block text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Store / Hub Business Name</label>
                                        <input
                                          type="text"
                                          value={sellerStoreName}
                                          onChange={(e) => setSellerStoreName(e.target.value)}
                                          placeholder="e.g. Chisamba Organic Trade Hub"
                                          className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 text-white text-xs focus:border-blue-500 focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Store Landmark Location</label>
                                        <input
                                          type="text"
                                          value={sellerLocationLandmark}
                                          onChange={(e) => setSellerLocationLandmark(e.target.value)}
                                          placeholder="e.g. Plot 33, Soweto Market, Lusaka"
                                          className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 text-white text-xs focus:border-blue-500 focus:outline-none"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {selectedRole === "AGENT" && (
                                    <>
                                      <div>
                                        <label className="block text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Commission Agency Name</label>
                                        <input
                                          type="text"
                                          value={sellerStoreName}
                                          onChange={(e) => setSellerStoreName(e.target.value)}
                                          placeholder="e.g. Kabwata Farmers Vetting Hub"
                                          className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 text-white text-xs focus:border-blue-500 focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">NRC National Identity Certificate ID</label>
                                        <input
                                          type="text"
                                          placeholder="e.g. 509212/11/1"
                                          className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 text-white text-xs focus:border-blue-500 focus:outline-none"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {selectedRole === "RIDER" && (
                                    <>
                                      <div>
                                        <label className="block text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Active Delivery Vehicle Category</label>
                                        <select
                                          className="w-full h-10 bg-zinc-900 border border-zinc-800 text-white text-xs rounded-xl focus:border-blue-500 px-3 cursor-pointer"
                                        >
                                          <option value="Motorcycle">Motorcycle (Fast Dispatch)</option>
                                          <option value="Bicycle">Bicycle (Micro zone)</option>
                                          <option value="Toyota Vitz">Toyota Vitz (Box Cargo)</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Vehicle/Bicycle Plate Number</label>
                                        <input
                                          type="text"
                                          placeholder="e.g. ZM 9012"
                                          className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 text-white text-xs focus:border-blue-500 focus:outline-none"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setBuyerSignupStep(4)}
                                  className="w-full bg-[#ffa500] hover:bg-amber-500 text-black text-xs font-bold py-3.5 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <span>Advance to Verification Summary →</span>
                                </motion.button>
                              </div>
                            )}

                            {buyerSignupStep === 4 && (
                              <div className="space-y-4 font-sans text-left">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-[64px] h-[64px] bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/5 mb-3 shrink-0">
                                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                  </div>
                                  <h2 className="text-xl font-extrabold text-white">Verification Complete</h2>
                                  <p className="text-[11.5px] text-zinc-400 mt-1 max-w-[280px] leading-relaxed">
                                    Your legal SIM profile stands verified across national directory protocols.
                                  </p>
                                </div>

                                <div className="bg-[#0c0d12] border border-zinc-850 p-3.5 rounded-2xl space-y-2 text-xs text-zinc-300">
                                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                                    <span className="text-zinc-500 font-bold">SIM Profile Holder</span>
                                    <span className="font-semibold text-white">{buyerFirstName} {buyerSurname}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                                    <span className="text-zinc-500 font-bold">Role Category</span>
                                    <span className="font-bold text-[#ffa500] uppercase text-[10.5px]">{selectedRole}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                                    <span className="text-zinc-500 font-bold">Payout Mobile Number</span>
                                    <span className="font-mono text-zinc-200 font-bold">+260 {buyerPhone}</span>
                                  </div>
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-zinc-500 font-bold">Default Router</span>
                                    <span className="font-semibold text-teal-400">{buyerOperator} Money Gateway</span>
                                  </div>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    const combined = `${buyerFirstName} ${buyerSurname}`.trim();
                                    
                                    // Set states dynamically based on role!
                                    if (selectedRole === "SELLER") {
                                      setSellerName(combined);
                                      setSellerStoreName(sellerStoreName || `${combined}'s Shop`);
                                      setSellerPrimaryWallet(`${buyerOperator} Money (+260${buyerPhone})`);
                                    } else if (selectedRole === "AGENT") {
                                      // agency variables
                                    } else if (selectedRole === "RIDER") {
                                      // rider variables
                                    }

                                    // Create record
                                    const localAccounts = localStorage.getItem("selo_registered_accounts") 
                                      ? JSON.parse(localStorage.getItem("selo_registered_accounts")!) 
                                      : [];
                                    const newAcc = {
                                      phone: buyerPhone,
                                      name: combined,
                                      pin: buyerPinCode,
                                      securityQuestion,
                                      securityAnswer,
                                      role: selectedRole,
                                      storeName: sellerStoreName,
                                      landmark: sellerLocationLandmark,
                                      carrier: buyerOperator
                                    };
                                    localAccounts.push(newAcc);
                                    localStorage.setItem("selo_registered_accounts", JSON.stringify(localAccounts));

                                    setIsLoggedIn(true);
                                    setToast({
                                      message: `Setup Complete 🎉`,
                                      subText: `Logged in securely as ${combined}. Welcome to Selonachipa.`
                                    });
                                  }}
                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold py-3.5 rounded-xl shadow-lg mt-4 flex items-center justify-center gap-1.5 cursor-pointer h-11"
                                >
                                  <span>Complete Verification & Launch Dashboard</span>
                                </motion.button>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* BOTTOM FOOTNOTE AND PROGRESS TRACKS INDICATORS */}
                  <div className="pt-2">
                    <p className="text-[9px] text-zinc-500 text-center leading-normal max-w-[280px] mx-auto">
                      By continuing you agree to our <span className="underline hover:text-zinc-400 cursor-pointer">Terms of Use</span> and <span className="underline hover:text-zinc-400 cursor-pointer">Privacy Policy</span>.
                    </p>

                    {/* Progressive row of dots */}
                    <div className="flex items-center justify-center gap-1.5 mt-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <span 
                          key={s} 
                          onClick={() => {
                            // Enable developer manual clicking dots to test steps!
                            setBuyerSignupStep(s);
                            setToast({ message: `Dev Jump: Step ${s} of 8`, subText: "Simulated routing active." });
                          }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            s === buyerSignupStep ? "w-5 bg-blue-500" : "w-1.5 bg-zinc-800 hover:bg-zinc-700"
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                // STANDARD ROLE SETUP OPTION SELECTOR (STEP 0)
                <motion.div 
                  key="role-setup"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col justify-between pt-5 pb-4 px-6 relative"
                >
                  {/* STATUS BAR SHARD */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                      SELONACHIPA SETUP
                    </span>

                    {/* Progressive pagination line mapping */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-1 rounded-full bg-indigo-500"></span>
                      <span className="w-2.5 h-1 rounded-full bg-zinc-850"></span>
                      <span className="w-2.5 h-1 rounded-full bg-zinc-850"></span>
                      <span className="w-2.5 h-1 rounded-full bg-zinc-850"></span>
                      <span className="w-2.5 h-1 rounded-full bg-zinc-850"></span>
                      <span className="w-2.5 h-1 rounded-full bg-zinc-850"></span>
                      <span className="w-2.5 h-1 rounded-full bg-zinc-850"></span>
                    </div>
                  </div>

                  {/* LOGO SYMBOL */}
                  <div className="flex flex-col items-center text-center mt-3">
                    <div 
                      onClick={() => {
                        setToast({
                          message: "SeloNaChipa Video Ledger Core",
                          subText: "Offline simulator. Created for Zambia interactive escrow trade logs."
                        });
                      }}
                      className="w-[72px] h-[72px] bg-[#ffa500] rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Play className="w-10 h-10 text-black fill-black ml-1.5" />
                    </div>
                    
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#ffa500] font-sans">
                      SeloNaChipa
                    </h1>
                    <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                      Zambia's Interactive Short Video Marketplace
                    </p>
                  </div>

                  {/* ROLE CHOOSER */}
                  <div className="mt-2 flex-1 flex flex-col justify-center">
                    <h2 className="text-sm font-extrabold text-white mb-3 text-left tracking-tight">
                      Select Your Role
                    </h2>

                    <div className="space-y-3">
                      {/* Buyer Selection Option */}
                      <button 
                        id="role-buyer-btn"
                        onClick={() => setSelectedRole("BUYER")}
                        className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center gap-3.5 cursor-pointer outline-none ${
                          selectedRole === "BUYER" 
                            ? "bg-[#0f1115] border-[#ffa500] shadow-[0_0_12px_rgba(255,165,0,0.12)]" 
                            : "bg-[#0f1115]/50 border-zinc-850 hover:border-zinc-800"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${
                          selectedRole === "BUYER"
                            ? "bg-[#ffa500]/10 border-[#ffa500]/25 text-[#ffa500]"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400"
                        }`}>
                          <Heart className={`w-5 h-5 ${selectedRole === "BUYER" ? "fill-[#ffa500]" : ""}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white leading-tight">Buyer</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                            Watch rich product video reels & buy cheap items instantly in Zambia
                          </p>
                        </div>
                      </button>

                      {/* Seller Selection Option */}
                      <button 
                        id="role-seller-btn"
                        onClick={() => setSelectedRole("SELLER")}
                        className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center gap-3.5 cursor-pointer outline-none ${
                          selectedRole === "SELLER" 
                            ? "bg-[#0f1115] border-[#ffa500] shadow-[0_0_12px_rgba(255,165,0,0.12)]" 
                            : "bg-[#0f1115]/50 border-zinc-850 hover:border-zinc-800"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${
                          selectedRole === "SELLER"
                            ? "bg-[#ffa500]/10 border-[#ffa500]/25 text-[#ffa500]"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400"
                        }`}>
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white leading-tight">Seller / Shop Owner</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                            List items by recording 15-60s short product videos
                          </p>
                        </div>
                      </button>

                      {/* Agent Selection Option */}
                      <button 
                        id="role-agent-btn"
                        onClick={() => setSelectedRole("AGENT")}
                        className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center gap-3.5 cursor-pointer outline-none ${
                          selectedRole === "AGENT" 
                            ? "bg-[#0f1115] border-[#ffa500] shadow-[0_0_12px_rgba(255,165,0,0.12)]" 
                            : "bg-[#0f1115]/50 border-zinc-850 hover:border-zinc-800"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${
                          selectedRole === "AGENT"
                            ? "bg-[#ffa500]/10 border-[#ffa500]/25 text-[#ffa500]"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400"
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white leading-tight">Local Selling Agent</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                            Manage seller listings & earn commissions
                          </p>
                        </div>
                      </button>

                      {/* Rider Selection Option */}
                      <button 
                        id="role-rider-btn"
                        onClick={() => setSelectedRole("RIDER")}
                        className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center gap-3.5 cursor-pointer outline-none ${
                          selectedRole === "RIDER" 
                            ? "bg-[#0f1115] border-[#6366f1] shadow-[0_0_12px_rgba(99,102,241,0.12)]" 
                            : "bg-[#0f1115]/50 border-zinc-850 hover:border-zinc-800"
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${
                          selectedRole === "RIDER"
                            ? "bg-[#6366f1]/10 border-[#6366f1]/25 text-indigo-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400"
                        }`}>
                          <Truck className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white leading-tight">Ride with Selonachipa</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                            Deliver orders local to your city, build your tier, and grow your Social Fund
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* BOTTOM CTA */}
                  <div className="pt-2">
                    <motion.button 
                      id="continue-setup-btn"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setBuyerSignupStep(1); // Redirect all roles to step 1
                        setIsBuyerLoginMode(true); // Default to securing a login/PIN sign in
                        setToast({
                          message: `${selectedRole} ACCESS SYSTEM`,
                          subText: "Sign in with your mobile number & PIN, or register a new verified account."
                        });
                      }}
                      className="w-full bg-[#5c5ef5] hover:bg-indigo-650 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Continue Setup</span>
                      <ArrowRight className="w-4 h-4 text-white stroke-[3px]" />
                    </motion.button>
                    
                    <p className="text-[9px] text-center text-zinc-500 mt-3 px-3 leading-snug">
                      By continuing you link securely with Zambia Mobile Money regulations & agree to our Terms of Use.
                    </p>
                  </div>
                </motion.div>
              )
            ) : (
              
              // =========================================================
              // METRIC ROUTER SCREEN MODULES (BUYER / VENDOR / RIDER / AGENT)
              // =========================================================
              <motion.div 
                key="dashboard-viewport"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col bg-[#050506]"
              >
                {/* 1. Android top status bar elements */}
                <div className="bg-[#0b0c10] border-b border-zinc-900 px-4.5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9.5px] text-amber-500 font-extrabold uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {selectedRole} MODE
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  
                  {/* Theme Toggle & Exit Dashboard Node */}
                  <div className="flex items-center gap-2">
                    <button
                      id="theme-toggle-btn"
                      onClick={() => {
                        setIsLightTheme(!isLightTheme);
                        setToast({
                          message: `THEME SWITCHED: ${!isLightTheme ? "High-Contrast Light" : "Cosmic Dark"}`,
                          subText: "Instantly re-adjusting visual color contrasts for safe outdoor use."
                        });
                      }}
                      className="flex items-center justify-center p-1.5 rounded-full bg-zinc-90 w-7 h-7 bg-zinc-900 border border-zinc-800 hover:text-white text-zinc-400 cursor-pointer transition-all"
                      title={isLightTheme ? "Switch to Cosmic Dark" : "Switch to Light Mode"}
                    >
                      {isLightTheme ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>

                    <button 
                      id="back-to-setup-btn"
                      onClick={() => setIsLoggedIn(false)}
                      className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full py-1 px-2.5 hover:text-white cursor-pointer"
                    >
                      <LogOut className="w-3 h-3 text-red-400" />
                      <span>Exit Role</span>
                    </button>
                  </div>
                </div>

                {/* 2. SPECIFIC SUBVIEW DECIDER */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden focus:outline-none scrollbar-none">
                  
                  {/* ======================================= */}
                  {selectedRole === "BUYER" && (
                    <div className="h-full flex flex-col justify-between text-white relative bg-[#050506]">

                      {buyerFeedTab === "FEED" && (
                        /* PERSONALIZED WELCOME SCREEN & ALIGNED PRODUCT GRID FEED */
                        <div 
                          className="flex-1 flex flex-col overflow-y-auto p-4 pb-20 space-y-4 text-left scrollbar-none relative touch-pan-y"
                          onTouchStart={handlePullTouchStart}
                          onTouchMove={handlePullTouchMove}
                          onTouchEnd={handlePullTouchEnd}
                        >
                          {/* Pull-to-refresh visualization */}
                          {(pullDistance > 0 || isRefreshing) && (
                            <div 
                              className="w-full flex flex-col items-center justify-center pointer-events-none transition-all duration-75 shrink-0 select-none"
                              style={{ 
                                height: `${pullDistance}px`, 
                                opacity: pullDistance > 10 ? Math.min(pullDistance / 50, 1) : 0,
                                marginBottom: pullDistance > 0 ? "8px" : "0px" 
                              }}
                            >
                              <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 text-teal-400 px-3.5 py-2 rounded-full shadow-lg backdrop-blur-md text-[10px] font-bold font-mono tracking-wider">
                                <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isRefreshing ? "animate-spin" : ""}`} style={{ transform: isRefreshing ? "none" : `rotate(${pullDistance * 6}deg)` }} />
                                <span>{isRefreshing ? "SYNCING FEED..." : pullDistance >= 50 ? "RELEASE TO SYNC" : "PULL TO REFRESH"}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Rich Custom Greeting Card */}
                          <div className="bg-gradient-to-br from-teal-950/20 via-zinc-950 to-zinc-950 border border-zinc-850 p-4 rounded-2xl relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full filter blur-xl pointer-events-none"></div>
                            
                            <span className="text-[9px] uppercase font-mono text-teal-400 font-extrabold tracking-widest bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/10">
                              Zambian Buyer Portal
                            </span>
                            
                            <h2 className="text-xl font-extrabold text-white mt-1.5 leading-tight tracking-tight">
                              Mwa uka bwanji, {buyerFirstName || "Zambian Buyer"}!
                            </h2>
                            <p className="text-[11px] text-zinc-400 mt-1 max-w-[275px]">
                              Welcome to Zambia's modern short-video marketplace.
                            </p>

                            <hr className="border-zinc-900 my-3" />

                            <div className="flex items-center justify-between text-[10px] text-zinc-400">
                              <span className="flex items-center gap-1 bg-zinc-900 p-1 px-2 rounded-lg border border-zinc-850 truncate max-w-[130px]">
                                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                {buyerLocationMethod ? (
                                  <span>{buyerNeighbourhood}, {buyerSelectedCity}</span>
                                ) : (
                                  <span className="text-zinc-500">No default delivery zone</span>
                                )}
                              </span>

                              <span className="flex items-center gap-1 bg-zinc-900 p-1 px-2 rounded-lg border border-zinc-850 text-emerald-400 font-bold shrink-0">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                {buyerOperator} Wallet Linked
                              </span>
                            </div>
                          </div>

                          {/* Search Bar */}
                          <div className="relative shrink-0">
                            <input
                              type="text"
                              value={buyerSearchQuery}
                              onChange={(e) => setBuyerSearchQuery(e.target.value)}
                              placeholder="Search listings by title, seller, or category..."
                              className="w-full bg-[#0c0d12] border border-zinc-850 focus:border-teal-500 rounded-xl py-2.5 pl-9 pr-8 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner font-sans"
                            />
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                            {buyerSearchQuery && (
                              <button
                                onClick={() => setBuyerSearchQuery("")}
                                className="absolute right-3 top-3 px-1 text-zinc-500 hover:text-white text-xs font-bold leading-none cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Dynamic Scrollable Category Badges */}
                          <div className="space-y-1.5 shrink-0">
                            <div className="flex items-center justify-between px-1">
                              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                                Infinite Tuning Channels
                              </label>
                              <span className="text-[9px] text-[#ffa500] font-bold">
                                {buyerInterests.length === 0 ? "Global Stream" : `${buyerInterests.length} preferred`}
                              </span>
                            </div>

                            <div 
                              onMouseDown={handleDragScrollMouseDown}
                              onMouseLeave={handleDragScrollMouseLeave}
                              onMouseUp={handleDragScrollMouseUp}
                              onMouseMove={handleDragScrollMouseMove}
                              className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar select-none cursor-grab active:cursor-grabbing scroll-smooth"
                            >
                              {[
                                "Fresh produce",
                                "Fashion & chitenge",
                                "Electronics",
                                "Home & furniture",
                                "Hardware & tools",
                                "Beauty & health",
                                "Parcels",
                                "Fast Food & Restaurant"
                              ].map(cat => {
                                const active = buyerInterests.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      if (active) {
                                        setBuyerInterests(prev => prev.filter(c => c !== cat));
                                      } else {
                                        setBuyerInterests(prev => [...prev, cat]);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-[10.5px] font-extrabold whitespace-nowrap transition-all border outline-none cursor-pointer shrink-0 ${
                                      active
                                        ? "bg-teal-500/10 border-teal-500 text-teal-400"
                                        : "bg-zinc-900 border-zinc-850 text-zinc-400"
                                    }`}
                                  >
                                    {active ? "✓ " : ""}{cat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* AI-Generated & Custom Listings Grid with Zone Badges */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                                Personalized Zambia Offers
                              </label>

                              {/* Category Filter Dropdown */}
                              <select
                                value={selectedFeedCategory}
                                onChange={(e) => setSelectedFeedCategory(e.target.value)}
                                className="bg-[#0c0d12] border border-zinc-850 rounded-xl px-2.5 py-1 text-[10px] font-bold text-zinc-400 focus:outline-none focus:border-teal-500 cursor-pointer"
                              >
                                <option value="ALL">All Categories</option>
                                {Array.from(new Set(listings.map(l => l.category).filter(Boolean))).map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>

                            {(() => {
                              const activeListings = getPersonalizedListings().filter(l => {
                                const categoryMatch = selectedFeedCategory === "ALL" || l.category === selectedFeedCategory;
                                const searchMatch = !buyerSearchQuery || (
                                  l.title.toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
                                  l.category.toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
                                  getStoreName(l.seller_id).toLowerCase().includes(buyerSearchQuery.toLowerCase())
                                );
                                return categoryMatch && searchMatch;
                              });
                              if (activeListings.length === 0) {
                                  return (
                                    <div className="bg-[#0c0d12] border border-zinc-850 p-6 rounded-2xl text-center text-zinc-500">
                                      <p className="text-xs font-bold text-white">No items found</p>
                                      <p className="text-[10px] text-zinc-500 mt-1">
                                        {buyerSearchQuery ? "Try a different search keyword or category filter." : "Please try modifying your category badges."}
                                      </p>
                                    </div>
                                  );
                              }

                              return (
                                <div className="grid grid-cols-2 gap-2.5">
                                  {activeListings.map((lst) => {
                                    const isPreferred = buyerInterests.some(interest => {
                                      const intLower = interest.toLowerCase();
                                      const catLower = lst.category.toLowerCase();
                                      return catLower.includes(intLower) || intLower.includes(catLower);
                                    });

                                    return (
                                      <div
                                        key={lst.listing_id}
                                        onClick={() => {
                                          const fullIndex = getPersonalizedListings().findIndex(item => item.listing_id === lst.listing_id);
                                          if (fullIndex !== -1) {
                                            setCurrentReelIndex(fullIndex);
                                          }
                                          setBuyerFeedTab("REELS");
                                          setToast({
                                            message: `Playing Product Reel`,
                                            subText: `${lst.title} is ready for instant secure buy!`
                                          });
                                        }}
                                        className={`bg-[#0c0d12] border p-3 rounded-2xl flex flex-col justify-between text-left relative cursor-pointer hover:border-teal-500 transition-all group ${
                                          isPreferred 
                                            ? "border-teal-500/35 ring-1 ring-teal-500/10" 
                                            : "border-zinc-850"
                                        }`}
                                      >
                                        <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-teal-500 transition-colors z-20">
                                          <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                        </div>

                                        <div>
                                          <div className="flex justify-between items-start mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-905 border border-zinc-850 flex items-center justify-center text-xl shadow shrink-0 overflow-hidden relative">
                                              {lst.thumbnail && (lst.thumbnail.startsWith("http") || lst.thumbnail.startsWith("data:")) ? (
                                                <img src={lst.thumbnail} className="w-full h-full object-contain p-0.5 animate-fadeIn" referrerPolicy="no-referrer" alt="" />
                                              ) : (
                                                lst.thumbnail || "🛒"
                                              )}
                                              {/* Subtle dark-mode gradient overlay to enhance video frame/item text readability */}
                                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />

                                              {/* Video length stamp in corner of thumbnail */}
                                              <span id={`vid-len-${lst.listing_id}`} className="absolute bottom-0.5 right-0.5 bg-black/80 font-mono text-[6.5px] font-extrabold text-white leading-none px-0.5 py-0.2 rounded border border-zinc-800/30 select-none">
                                                0:{(lst.title.length % 16) + 12}
                                              </span>
                                            </div>
                                            
                                            {isSellerLive(lst.seller_id) ? (
                                              <span className="text-[7.5px] tracking-wider uppercase font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Live
                                              </span>
                                            ) : (
                                              <span className="text-[7.5px] tracking-wider uppercase font-bold text-zinc-550 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-550" />
                                                Offline
                                              </span>
                                            )}
                                          </div>

                                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-550 font-mono block">
                                            {lst.category}
                                          </span>

                                          <h4 className="text-xs font-black text-white mt-1 leading-tight group-hover:text-teal-400 transition-colors line-clamp-1">
                                            {lst.title}
                                          </h4>

                                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-snug mt-1 font-medium text-left">
                                            {lst.description}
                                          </p>
                                        </div>

                                        {/* Row with Price + Location, plus explicit Zone Badge beneath */}
                                        <div className="mt-3.5 pt-2 border-t border-zinc-900/80 space-y-1.5 w-full text-left">
                                          <div className="flex items-center justify-between gap-1">
                                            <div className="flex flex-col">
                                              <span className="text-xs text-[#ffa500] font-black font-mono">
                                                K {lst.suggested_price}
                                              </span>
                                              
                                              {/* React Share Counter Indicator & Price Drop bell */}
                                              <div className="flex flex-col gap-1.5 mt-1">
                                                <div className="flex items-center gap-1">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setListings(prev => prev.map(l => l.listing_id === lst.listing_id ? { ...l, shares: (l.shares || 0) + 1 } : l));
                                                      
                                                      const deepLink = `${window.location.origin}/?listing=${lst.listing_id}`;
                                                      navigator.clipboard.writeText(deepLink).then(() => {
                                                        setToast({
                                                          message: "LINK COPIED TO CLIPBOARD",
                                                          subText: `Deep link to "${lst.title}" copied for social sharing!`
                                                        });
                                                      }).catch(err => {
                                                        console.warn("Clipboard write failed: ", err);
                                                        setToast({
                                                          message: "LINK READY TO SHARE",
                                                          subText: deepLink
                                                        });
                                                      });
                                                    }}
                                                    className="p-1 rounded bg-zinc-900 border border-zinc-800 text-teal-400 hover:text-teal-305 hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                                                    title="Share listing deep link"
                                                  >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                  </button>
                                                  <span className="text-[8.5px] font-mono text-zinc-500 font-bold">{(lst.shares || 0)} shares</span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      const isAlertActive = priceDropAlerts.includes(lst.listing_id);
                                                      if (isAlertActive) {
                                                        setPriceDropAlerts(prev => prev.filter(id => id !== lst.listing_id));
                                                        setToast({
                                                          message: "ALERT DISABLED",
                                                          subText: `You won't receive price drop alerts for "${lst.title}".`
                                                        });
                                                      } else {
                                                        setPriceDropAlerts(prev => [...prev, lst.listing_id]);
                                                        setToast({
                                                          message: "ALERT ENABLED",
                                                          subText: `We will alert you when "${lst.title}" drops in price!`
                                                        });
                                                      }
                                                    }}
                                                    className={`p-1 rounded border transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                                                      priceDropAlerts.includes(lst.listing_id)
                                                        ? "bg-amber-500/10 border-amber-500/35 text-[#ffa500]"
                                                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                                                    }`}
                                                    title={priceDropAlerts.includes(lst.listing_id) ? "Disable Price Drop Alert" : "Enable Price Drop Alert"}
                                                  >
                                                    <Bell className={`w-3.5 h-3.5 ${priceDropAlerts.includes(lst.listing_id) ? "animate-bounce fill-current" : ""}`} />
                                                  </button>
                                                  <span className="text-[8.5px] font-mono text-zinc-500 font-bold">
                                                    {priceDropAlerts.includes(lst.listing_id) ? "Alert active" : "Price Alert"}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {(() => {
                                              const etas = getEtaEstimates(lst.distance_km);
                                              return (
                                                <div className="flex flex-col text-[7.5px] font-mono text-zinc-400 leading-none bg-[#050506]/85 px-1.5 py-1 rounded border border-zinc-850/60 text-right gap-0.5">
                                                  <span>🚶 {etas.walk} ETA</span>
                                                  <span>🚗 {etas.drive} ETA</span>
                                                </div>
                                              );
                                            })()}
                                          </div>
                                          
                                          <div className="flex items-center justify-between gap-1 text-[8.5px] font-mono w-full">
                                            <div className="flex items-center gap-0.5 text-zinc-400 truncate flex-1 min-w-0">
                                              <MapPin className="w-2.5 h-2.5 text-red-500 shrink-0" />
                                              <span className="truncate">{lst.location}</span>
                                            </div>
                                            
                                            <div className="text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20 shrink-0 uppercase tracking-tight text-[7.5px]">
                                              📍 {getListingZone(lst)}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>

                          <div className="pt-2 text-center shrink-0">
                            <span className="text-[9px] text-zinc-600 font-mono">
                              ⚡ Calibrated with Selonachipa Infinity Memory v2.80
                            </span>
                          </div>
                        </div>
                      )}

                      {buyerFeedTab === "REELS" && (
                        /* BUYER REEL SIMULATED SWIPING VIEW FORMAT */
                        (() => {
                          const activeListings = getPersonalizedListings();
                          const currentReel = activeListings[currentReelIndex];
                          if (!currentReel) {
                            return (
                              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                                <Compass className="w-12 h-12 text-zinc-550 mb-3" />
                                <p className="text-sm font-bold text-white">No active listings in feed</p>
                                <p className="text-xs text-zinc-500 mt-1">Sellers have not published any video reels yet.</p>
                              </div>
                            );
                          }

                          const hasLiked = likedReels[currentReel.listing_id] || false;
                          const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

                          return (
                            <div className="flex-1 flex flex-col relative bg-[#090a0f] overflow-hidden justify-between h-full tiktok-feed-slide">
                              
                              {/* Verified Seller Badge Overlay */}
                              <div className="absolute top-16 right-4 z-30 pointer-events-none select-none">
                                <span className="inline-flex items-center gap-1 bg-emerald-500/95 text-white text-[8px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md border border-emerald-400/40 uppercase tracking-widest font-mono">
                                  <CheckCircle2 className="w-2.5 h-2.5 fill-white text-emerald-500 shrink-0" />
                                  <span>Verified Seller</span>
                                </span>
                              </div>

                              {/* Live Audio Narration Countdown Timer Overlay */}
                              {activeReelAudio && (
                                (() => {
                                  const duration = activeReelAudio && !isNaN(activeReelAudio.duration) && isFinite(activeReelAudio.duration) && activeReelAudio.duration > 0
                                    ? activeReelAudio.duration
                                    : (currentReel.subtitles && currentReel.subtitles.length > 0 
                                        ? Math.max(...currentReel.subtitles.map(s => s.end))
                                        : 30);
                                  const remainingSeconds = Math.max(0, Math.ceil(duration - activeReelTime));
                                  return (
                                    <div className="absolute top-16 left-4 z-30 pointer-events-none select-none flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-[9px] font-mono font-black text-white px-3 py-1 rounded-full shadow-xl border border-white/10 tracking-widest uppercase">
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                      </span>
                                      <Clock className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                                      <span>NARRATION:</span>
                                      <span className="text-[#ffa500] font-black">{remainingSeconds}s left</span>
                                    </div>
                                  );
                                })()
                              )}
                              
                              {/* Visual Simulated Video Screen */}
                              <div 
                                onClick={() => {
                                  setReelIsPaused(p => !p);
                                  if (activeReelAudio) {
                                    if (!reelIsPaused) {
                                      activeReelAudio.pause();
                                    } else {
                                      activeReelAudio.play().catch(e => console.warn("Audio resume failed:", e));
                                    }
                                  }
                                }}
                                className="absolute inset-0 bg-[#06070a] flex flex-col items-center justify-center cursor-pointer select-none"
                              >
                                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-indigo-950/20 to-black/90 z-10" />
                                
                                {reelIsPaused && (
                                  <div className="absolute inset-0 bg-black/45 z-30 flex items-center justify-center pointer-events-none animate-fadeIn">
                                    <div className="bg-black/70 border border-zinc-700 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl">
                                      <Play className="w-7 h-7 fill-white text-white ml-0.5 animate-pulse" />
                                    </div>
                                  </div>
                                )}

                                <div className="relative z-0 text-center flex flex-col items-center justify-center">
                                  <motion.div 
                                    animate={{ scale: [1, 1.05, 1] }} 
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    className="w-[110px] h-[110px] rounded-full bg-slate-900/80 border border-purple-500/30 flex items-center justify-center text-4xl shadow-inner mb-3 overflow-hidden p-2"
                                  >
                                    {currentReel.thumbnail && (currentReel.thumbnail.startsWith("http") || currentReel.thumbnail.startsWith("data:")) ? (
                                      <img src={currentReel.thumbnail} className="w-full h-full object-contain" referrerPolicy="no-referrer" alt="" />
                                    ) : (
                                      currentReel.thumbnail || "🛒"
                                    )}
                                  </motion.div>
                                  
                                  {/* Selo Advert Badge */}
                                  <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 bg-purple-500/10 py-1 px-3.5 rounded-full border border-purple-500/25">
                                    🎥 Selo Advert
                                  </span>
                                </div>

                                {/* Active Real-Time Burned Captions Layer */}
                                {activeReelAudio && currentReel.subtitles && currentReel.subtitles.length > 0 && (
                                  (() => {
                                    const runningSubtitle = currentReel.subtitles.find(
                                      s => activeReelTime >= s.start && activeReelTime <= s.end
                                    );
                                    if (!runningSubtitle) return null;
                                    return (
                                      <div className="absolute top-[68%] left-4 right-4 z-40 flex items-center justify-center pointer-events-none px-4">
                                        <div className="bg-[#0e0c1f]/95 border-2 border-[#ffa500]/80 text-[#ffa500] font-black italic text-[11px] px-3.5 py-1.5 rounded-lg shadow-2xl tracking-wide uppercase text-center transform -rotate-1">
                                          ✨ {runningSubtitle.text} ✨
                                        </div>
                                      </div>
                                    );
                                  })()
                                )}

                                <div className="absolute bottom-32 right-6 z-20 w-8 h-8 rounded-full bg-indigo-500/10 border border-[#ffa500]/10 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
                                  <Play className="w-3.5 h-3.5 text-[#ffa500]" />
                                </div>

                                {/* Floating Reaction Emojis Overlay Stage */}
                                <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
                                  {floatingEmojis.map(item => (
                                    <motion.div
                                      key={item.id}
                                      initial={{ opacity: 0, scale: 0.5, y: "100%", x: `${item.x}%`, rotate: item.rotate }}
                                      animate={{ 
                                        opacity: [0, 1, 1, 0], 
                                        y: "-220px", 
                                        scale: [0.5, 1.4, 1.6, 1.1],
                                        rotate: item.rotate + item.rotateSpeed
                                      }}
                                      transition={{ duration: 1.8, ease: "easeOut" }}
                                      className="absolute text-4xl select-none filter drop-shadow font-sans"
                                      style={{ bottom: "60px", left: 0 }}
                                    >
                                      {item.emoji}
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Top Title Bar of Video */}
                              <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent">
                                <div>
                                  <span className="text-[9px] uppercase font-mono text-[#ffa500] font-extrabold tracking-widest">Selo Market Reel</span>
                                  <span className="text-xs text-zinc-400 block">{currentReel.category}</span>
                                </div>
                                
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-zinc-300 bg-zinc-900/85 py-1 px-2.5 rounded-full flex items-center gap-1 border border-zinc-800 shrink-0">
                                    <MapPin className="w-3 h-3 text-red-500" />
                                    {currentReel.location}
                                  </span>

                                  {/* Cart Icon inside Top Title Bar */}
                                  <button
                                    onClick={() => setBuyerFeedTab("CART")}
                                    className="relative p-2 rounded-full bg-black/55 border border-zinc-800 text-white hover:bg-black/75 cursor-pointer flex items-center justify-center shrink-0"
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    {cartCount > 0 && (
                                      <span className="absolute -top-1.5 -right-1.5 bg-[#ff6f61] text-white text-[8px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center border border-black animate-pulse">
                                        {cartCount}
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Middle Swipe Controls & Right Actions Panel Overlay */}
                              <div className="relative z-20 flex-1 flex justify-between items-end p-4 text-left">
                                
                                {/* Bottom Details of Product */}
                                <div className="flex-1 pr-12 bg-gradient-to-t from-black via-black/40 to-transparent p-3 rounded-2xl space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 text-xs text-yellow-400 font-extrabold bg-zinc-920/90 px-2 py-0.5 rounded-md border border-yellow-500/20">
                                      K {currentReel.suggested_price}.00 ZMW
                                    </span>
                                    {/* Surfaced Zone Badge */}
                                    <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/25">
                                      🗺️ {getListingZone(currentReel)}
                                    </span>
                                  </div>

                                  <h3 className="text-sm font-black text-white tracking-tight">{currentReel.title}</h3>
                                  
                                  {/* Selo Description Badge & Text */}
                                  <div className="bg-purple-950/15 border border-purple-500/20 rounded-xl p-2.5">
                                    <span className="text-[8.5px] uppercase font-mono tracking-wider font-black text-purple-400 block mb-1">
                                      ✨ Selo Description
                                    </span>
                                    <p className="text-[10px] text-zinc-200 line-clamp-3 leading-snug font-medium">
                                      {currentReel.description}
                                    </p>
                                  </div>

                                  {/* Dynamic AI Voiceover Narrator Player */}
                                  {currentReel.narration_audio_url && (
                                    <div className="bg-[#ffa500]/10 border border-[#ffa500]/30 rounded-xl p-2 flex items-center justify-between gap-1.5 animate-pulse">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <Volume2 className="w-3.5 h-3.5 text-[#ffa500] shrink-0" />
                                        <div className="min-w-0">
                                          <span className="text-[8px] uppercase font-mono tracking-widest font-black text-[#ffa500] block">
                                            🎙️ Selo AI Voiceover
                                          </span>
                                          <p className="text-[9.5px] text-zinc-300 truncate italic">
                                            "{currentReel.narration_text || "Energetic Zambian sales pitch."}"
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (activeReelAudio) {
                                            if (!reelIsPaused) {
                                              activeReelAudio.pause();
                                              setReelIsPaused(true);
                                            } else {
                                              activeReelAudio.play().catch(e => console.warn("Audio resume failed:", e));
                                              setReelIsPaused(false);
                                            }
                                          } else {
                                            const audio = new Audio(currentReel.narration_audio_url);
                                            setActiveReelAudio(audio);
                                            setActiveReelTime(0);

                                            audio.addEventListener("timeupdate", () => {
                                              setActiveReelTime(audio.currentTime);
                                            });

                                            audio.addEventListener("ended", () => {
                                              setReelReplayCount(prev => prev + 1);
                                              audio.currentTime = 0;
                                              audio.play().catch(e => console.warn("Auto-loop play failed:", e));
                                            });

                                            audio.play().catch(e => console.warn("Audio playback failed:", e));
                                            setToast({
                                              message: "Playing AI Narration 🎙️",
                                              subText: "Speech-to-Text dynamic subtitles are streaming live!"
                                            });
                                          }
                                        }}
                                        className="bg-[#ffa500] hover:bg-amber-500 text-black font-extrabold text-[9px] px-2.5 py-1 rounded inline-flex items-center gap-1 select-none cursor-pointer active:scale-95 transition-all shadow shrink-0"
                                      >
                                        {activeReelAudio && !reelIsPaused ? (
                                          <>
                                            <Pause className="w-2.5 h-2.5 fill-black shrink-0" />
                                            <span>Pause</span>
                                          </>
                                        ) : (
                                          <>
                                            <Play className="w-2.5 h-2.5 fill-black shrink-0" />
                                            <span>Listen</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  )}

                                  {/* Dynamic Suno AI Background Music Player */}
                                  {currentReel.bg_music_url && (
                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-2 flex items-center justify-between gap-1.5 mt-1.5 shadow-md">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <Music className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                        <div className="min-w-0">
                                          <span className="text-[8px] uppercase font-mono tracking-widest font-black text-purple-300 block">
                                            🎵 Suno AI Partner Background Music
                                          </span>
                                          <p className="text-[9.5px] text-zinc-300 truncate font-mono">
                                            {currentReel.bg_music_track || "Exciting Marketplace Instrumental"}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const audio = new Audio(currentReel.bg_music_url);
                                          audio.loop = true;
                                          audio.play().catch(e => console.warn("Background music playback failed:", e));
                                          setToast({
                                            message: "Playing Suno AI Beat 🎵",
                                            subText: `Selected atmosphere: "${currentReel.bg_music_track || "Exciting Ad Beat"}".`
                                          });
                                        }}
                                        className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[9px] px-2.5 py-1 rounded inline-flex items-center gap-1 select-none cursor-pointer active:scale-95 transition-all shadow shrink-0 border-0"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-white shrink-0" />
                                        <span>Jam Beat</span>
                                      </button>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-zinc-400 font-mono">Provenance:</span>
                                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 py-0.5 px-1.5 rounded border border-emerald-500/15 font-mono">
                                      {currentReel.provenance || "Selo Direct Hub"}
                                    </span>
                                  </div>
                                </div>

                                {/* Right-Aligned Reels Interactions */}
                                <div className="flex flex-col gap-4 items-center justify-end z-30 shrink-0">
                                  
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setLikedReels(prev => {
                                        const wasLiked = prev[currentReel.listing_id];
                                        const next = { ...prev, [currentReel.listing_id]: !wasLiked };
                                        
                                        // Send backend event
                                        if (!wasLiked) {
                                          logBehaviourEvent("like", currentReel.listing_id);
                                        }

                                        setListings(list => list.map(lst => 
                                          lst.listing_id === currentReel.listing_id 
                                            ? { ...lst, likes: wasLiked ? lst.likes - 1 : lst.likes + 1 }
                                            : lst
                                        ));

                                        setToast({ 
                                          message: wasLiked ? "Removed Favourite" : "Added to favourites Dashboard!", 
                                          subText: "SeloNaChipa alignment ranks verified logs." 
                                        });
                                        return next;
                                      });
                                    }}
                                    className="flex flex-col items-center gap-1 focus:outline-none cursor-pointer border-none bg-transparent"
                                  >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${hasLiked ? "bg-red-500/20 border border-red-500/30 text-red-500" : "bg-black/60 border border-zinc-800 text-white"}`}>
                                      <Heart className={`w-4.5 h-4.5 ${hasLiked ? "fill-red-500" : ""}`} />
                                    </div>
                                    <span className="text-[9.5px] font-bold font-mono text-zinc-300">{currentReel.likes}</span>
                                  </button>

                                  <button 
                                    type="button"
                                    onClick={() => {
                                      // Send backend event
                                      logBehaviourEvent("share", currentReel.listing_id);

                                      setListings(list => list.map(lst => 
                                        lst.listing_id === currentReel.listing_id ? { ...lst, shares: lst.shares + 1 } : lst
                                      ));
                                      setToast({ message: "Share Link Generated", subText: "Sent with escrow safety certificates." });
                                    }}
                                    className="flex flex-col items-center gap-1 focus:outline-none text-zinc-300 cursor-pointer border-none bg-transparent"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-black/60 border border-zinc-800 flex items-center justify-center hover:text-white">
                                      <Share2 className="w-4.5 h-4.5" />
                                    </div>
                                    <span className="text-[9.5px] font-bold font-mono text-zinc-300">{currentReel.shares}</span>
                                  </button>

                                  {/* Comments button and trigger */}
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setShowReelCommentListingId(currentReel.listing_id);
                                    }}
                                    className="flex flex-col items-center gap-1 focus:outline-none text-zinc-300 cursor-pointer border-none bg-transparent"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-black/60 border border-zinc-800 flex items-center justify-center hover:text-white">
                                      <MessageSquare className="w-4.5 h-4.5 text-zinc-300" />
                                    </div>
                                    <span className="text-[9.5px] font-bold font-mono text-zinc-300">
                                      {currentReel.metrics?.commentsCount || 0}
                                    </span>
                                  </button>

                                  <div className="flex flex-col items-center text-zinc-500 text-[9px] font-mono leading-none">
                                    <span className="font-extrabold text-zinc-300">{currentReel.views}</span>
                                    <span className="text-[7.5px] uppercase mt-0.5">views</span>
                                  </div>

                                  {/* Floating Emojis Reaction Circle Trigger dock */}
                                  <div className="flex flex-col gap-1 bg-black/75 border border-zinc-800 p-1.5 rounded-full z-30 shadow shadow-purple-500/10 mt-1">
                                    <button 
                                      type="button"
                                      onClick={() => triggerReaction("😂")}
                                      className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 hover:scale-120 transition-transform active:scale-95 text-xs flex items-center justify-center cursor-pointer select-none"
                                      title="Haha"
                                    >
                                      😂
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => triggerReaction("😮")}
                                      className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 hover:scale-120 transition-transform active:scale-95 text-xs flex items-center justify-center cursor-pointer select-none"
                                      title="Wow"
                                    >
                                      😮
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => triggerReaction("🔥")}
                                      className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 hover:scale-120 transition-transform active:scale-95 text-xs flex items-center justify-center cursor-pointer select-none"
                                      title="Fire"
                                    >
                                      🔥
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => triggerReaction("❤️")}
                                      className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 hover:scale-120 transition-transform active:scale-95 text-xs flex items-center justify-center cursor-pointer select-none"
                                      title="Love"
                                    >
                                      ❤️
                                    </button>
                                  </div>

                                </div>
                              </div>

                              {/* Navigation Swipers + Three Action Row Buttons */}
                              <div className="relative z-20 px-4 pb-18 bg-gradient-to-t from-black to-transparent flex flex-col gap-2 shrink-0">
                                
                                {/* Swiper Indicator bar */}
                                <div className="flex justify-between items-center text-[10px] text-zinc-400 bg-zinc-950/80 p-2 rounded-xl border border-zinc-900">
                                  <button 
                                    type="button"
                                    disabled={currentReelIndex === 0}
                                    onClick={() => setCurrentReelIndex(idx => Math.max(0, idx - 1))}
                                    className="hover:text-white disabled:opacity-30 disabled:pointer-events-none p-1 shrink-0 font-bold cursor-pointer"
                                  >
                                    ❮ Prev
                                  </button>
                                  <span className="font-mono">REEL {currentReelIndex + 1} OF {activeListings.length}</span>
                                  <button 
                                    type="button"
                                    disabled={currentReelIndex === activeListings.length - 1}
                                    onClick={() => setCurrentReelIndex(idx => Math.min(activeListings.length - 1, idx + 1))}
                                    className="hover:text-white disabled:opacity-30 disabled:pointer-events-none p-1 shrink-0 font-bold cursor-pointer"
                                  >
                                    Next ❯
                                  </button>
                                </div>

                                {/* Three Brand Action Buttons */}
                                <div className="flex gap-2 w-full mt-1">
                                  {/* Button 1: Message Seller Enquiry */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowSellerContactModal(currentReel);
                                      logBehaviourEvent("profile_visit", currentReel.listing_id);
                                    }}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-extrabold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer text-[10px] transition-colors"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>Enquire</span>
                                  </button>

                                  {/* Button 2: Add to cart (Purple Selo Brand) */}
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(currentReel)}
                                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer text-[10px] shadow-md shadow-purple-600/10 border border-purple-550 transition-colors"
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    <span>Add Cart</span>
                                  </button>

                                  {/* Button 3: Buy now (Green direct checkout) */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDirectCheckoutItem(currentReel);
                                      setCheckoutQty(1);
                                      setIsBuyModalOpen(true);
                                    }}
                                    className="flex-[1.2] bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer text-[10px] shadow-md shadow-emerald-500/10 transition-colors"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                                    <span>Buy Now</span>
                                  </button>
                                </div>
                              </div>

                              {/* Slide-Up Interacting Comments Modal Drawer */}
                              {showReelCommentListingId === currentReel.listing_id && (
                                <div className="absolute inset-x-0 bottom-0 top-1/3 bg-[#0d0e15] border-t border-zinc-800 rounded-t-3xl z-50 flex flex-col animate-slideUp text-left" onClick={(e) => e.stopPropagation()}>
                                  {/* Comments Header */}
                                  <div className="flex items-center justify-between p-4 border-b border-zinc-900 shrink-0">
                                    <div className="flex items-center gap-2">
                                      <MessageSquare className="w-4 h-4 text-[#ffa500]" />
                                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                                        Reel Interaction Comments ({(currentReel.comments_list || []).length})
                                      </h4>
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={() => setShowReelCommentListingId(null)}
                                      className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold flex items-center justify-center cursor-pointer hover:text-white"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  {/* Comments Scroll area */}
                                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none">
                                    {(!currentReel.comments_list || currentReel.comments_list.length === 0) ? (
                                      <p className="text-[10px] text-zinc-550 italic text-center py-6">
                                        No comments yet. Start conversation with local escrow-certified sellers!
                                      </p>
                                    ) : (
                                      currentReel.comments_list.map((c, i) => (
                                        <div key={i} className="flex gap-2 text-xs">
                                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-extrabold shrink-0">
                                            {c.user_id?.slice(-3).toUpperCase() || "USR"}
                                          </div>
                                          <div className="flex-1 min-w-0 bg-zinc-950 border border-zinc-900 rounded-2xl p-2.5">
                                            <div className="flex justify-between items-center mb-1">
                                              <span className="text-[9.5px] font-mono font-bold text-zinc-400">Buyer {c.user_id?.slice(-4) || "Active"}</span>
                                              <span className="text-[8px] text-zinc-600 font-mono">
                                                {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-200 leading-normal font-sans">{c.comment_text}</p>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  {/* Comment Input Box */}
                                  <div className="p-3 border-t border-zinc-900 bg-[#07070a] shrink-0 flex gap-2">
                                    <input 
                                      placeholder="Add comments on this produce..."
                                      value={newCommentInputText}
                                      onChange={(e) => setNewCommentInputText(e.target.value)}
                                      onKeyDown={async (e) => {
                                        if (e.key === "Enter" && newCommentInputText.trim()) {
                                          const txt = newCommentInputText.trim();
                                          setNewCommentInputText("");
                                          await logBehaviourEvent("comment", currentReel.listing_id, { comment_text: txt });
                                        }
                                      }}
                                      className="flex-1 h-9 bg-zinc-900 border border-zinc-855 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#ffa500] placeholder:text-zinc-650"
                                    />
                                    <button
                                      type="button"
                                      disabled={!newCommentInputText.trim()}
                                      onClick={async () => {
                                        const txt = newCommentInputText.trim();
                                        setNewCommentInputText("");
                                        await logBehaviourEvent("comment", currentReel.listing_id, { comment_text: txt });
                                      }}
                                      className="bg-[#ffa500] hover:bg-amber-500 disabled:opacity-40 text-black font-extrabold px-4 h-9 rounded-xl text-[10px] transition-all cursor-pointer uppercase tracking-wider shrink-0 border-none"
                                    >
                                      Send
                                    </button>
                                  </div>
                                </div>
                              )}

                            </div>
                          );
                        })()
                      )}

                      {buyerFeedTab === "CART" && (
                        /* MULTI-SELLER CART WITH ROUTE PREVIEW & SAME-ZONE VALIDATIONS */
                        <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4 text-left scrollbar-none bg-[#050506]">
                          <div className="flex items-center justify-between">
                            <h3 className="text-md font-black tracking-tight text-white uppercase font-sans">
                              My Selo Basket
                            </h3>
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-850">
                              Zone: {cart.length > 0 ? cart[0].zone : "Empty"}
                            </span>
                          </div>

                          {cart.length === 0 ? (
                            <div className="space-y-6">
                              <div className="bg-[#0b0c10] border border-zinc-850 rounded-2xl p-6 text-center space-y-3">
                                <div className="w-12 h-12 bg-purple-950/20 border border-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto text-xl">
                                  🛒
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">Your Basket is Empty</p>
                                  <p className="text-[10px] text-zinc-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                                    Browse the video reels to add sweet Zambia farm produce and local crafts to your path!
                                  </p>
                                </div>
                                <button
                                  onClick={() => setBuyerFeedTab("REELS")}
                                  className="mx-auto bg-purple-600 hover:bg-purple-500 text-white font-black text-[10.5px] px-4 py-2 rounded-xl cursor-pointer"
                                >
                                  Go to Reels
                                </button>
                              </div>

                              {/* Saved Wishlist block */}
                              <div className="space-y-3">
                                <span className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                                  Saved Wishlist ({wishlist.length})
                                </span>
                                
                                {wishlist.length === 0 ? (
                                  <p className="text-[10px] text-zinc-500 italic pl-1">
                                    No items saved in wishlist yet.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {wishlist.map(w => (
                                      <div key={w.listing_id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-3">
                                          <span className="text-xl shrink-0">{w.thumbnail}</span>
                                          <div>
                                            <h4 className="font-extrabold text-white leading-tight">{w.title}</h4>
                                            <span className="text-[8.5px] font-mono text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded mr-1">
                                              {getListingZone(w)}
                                            </span>
                                            <span className="text-[9.5px] text-[#ffa550] font-mono">
                                              K{w.suggested_price}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button
                                            onClick={() => {
                                              setWishlist(prev => prev.filter(x => x.listing_id !== w.listing_id));
                                              setToast({ message: "Removed from Wishlist", subText: "Cleared item record." });
                                            }}
                                            className="text-zinc-500 hover:text-red-400 p-1 text-sm font-bold"
                                            title="Delete"
                                          >
                                            ✕
                                          </button>
                                          <button
                                            onClick={() => {
                                              handleAddToCart(w);
                                              // optionally remove from wishlist
                                              setWishlist(prev => prev.filter(x => x.listing_id !== w.listing_id));
                                            }}
                                            className="bg-purple-600/10 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/15 text-[9.5px] font-black py-1 px-2.5 rounded-lg shrink-0"
                                          >
                                            🛒 Add
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Cart Items Grouped by Seller */}
                              <div className="space-y-3.5">
                                {(() => {
                                  const grouped = cart.reduce((acc, item) => {
                                    const sId = item.listing.seller_id;
                                    if (!acc[sId]) acc[sId] = [];
                                    acc[sId].push(item);
                                    return acc;
                                  }, {} as Record<string, typeof cart>);

                                  return Object.entries(grouped).map(([sellerId, items], gIdx) => {
                                    const storeName = getStoreName(sellerId);
                                    return (
                                      <div key={sellerId} className="bg-[#0b0c10] border border-zinc-850 rounded-2xl overflow-hidden shadow-md">
                                        <div className="bg-gradient-to-r from-purple-950/20 to-black/30 p-3 border-b border-zinc-850 flex items-center justify-between">
                                          <div>
                                            <p className="text-[11px] font-black uppercase text-purple-400 font-mono tracking-wider">
                                              🏪 Vendor {gIdx + 1}
                                            </p>
                                            <h4 className="text-xs font-bold text-white mt-0.5 truncate max-w-[190px]">
                                              {storeName}
                                            </h4>
                                          </div>
                                          <span className="text-[8px] font-mono text-zinc-500 bg-black py-0.5 px-2 rounded-full border border-zinc-900 shrink-0">
                                            Zambia Registered Merchant
                                          </span>
                                        </div>

                                        <div className="divide-y divide-zinc-900 p-3 space-y-3">
                                          {(items as any[]).map(it => {
                                            const itemCost = it.listing.suggested_price * it.quantity;
                                            return (
                                              <div key={it.listing.listing_id} className="flex gap-3 justify-between items-center pt-2 first:pt-0">
                                                <div className="flex gap-2 min-w-0">
                                                  <span className="text-xl shrink-0">{it.listing.thumbnail}</span>
                                                  <div className="min-w-0">
                                                    <h5 className="text-xs font-bold text-white truncate max-w-[140px]">
                                                      {it.listing.title}
                                                    </h5>
                                                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                                                      K {it.listing.suggested_price}.00 Unit
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                  {/* Quantity inline selector */}
                                                  <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg py-1 px-2.5">
                                                    <button
                                                      onClick={() => {
                                                        setCart(prev => {
                                                          const matchIdx = prev.findIndex(x => x.listing.listing_id === it.listing.listing_id);
                                                          if (matchIdx > -1) {
                                                            const next = [...prev];
                                                            if (next[matchIdx].quantity <= 1) {
                                                              next.splice(matchIdx, 1);
                                                            } else {
                                                              next[matchIdx] = { ...next[matchIdx], quantity: next[matchIdx].quantity - 1 };
                                                            }
                                                            return next;
                                                          }
                                                          return prev;
                                                        });
                                                      }}
                                                      className="text-xs font-black text-zinc-400 hover:text-white px-0.5"
                                                    >
                                                      -
                                                    </button>
                                                    <span className="text-xs font-mono font-bold text-white">{it.quantity}</span>
                                                    <button
                                                      onClick={() => {
                                                        setCart(prev => {
                                                          const matchIdx = prev.findIndex(x => x.listing.listing_id === it.listing.listing_id);
                                                          if (matchIdx > -1) {
                                                            const next = [...prev];
                                                            next[matchIdx] = { ...next[matchIdx], quantity: next[matchIdx].quantity + 1 };
                                                            return next;
                                                          }
                                                          return prev;
                                                        });
                                                      }}
                                                      className="text-xs font-black text-zinc-400 hover:text-white px-0.5"
                                                    >
                                                      +
                                                    </button>
                                                  </div>

                                                  <span className="text-xs font-mono font-black text-white shrink-0 min-w-[50px] text-right">
                                                    K {itemCost}
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>

                              {/* Planned Route Path Timeline Preview */}
                              {(() => {
                                const uniqueSellers = Array.from(new Set(cart.map(i => i.listing.seller_id))) as string[];
                                const s1 = uniqueSellers[0];
                                const s2 = uniqueSellers[1];
                                const seller1Name = s1 ? getStoreName(s1) : "Unknown Vendor";
                                const seller2Name = s2 ? getStoreName(s2) : null;
                                
                                return (
                                  <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl text-left">
                                    <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1 rounded-full inline-block mb-3.5 tracking-widest font-extrabold">
                                      🗺️ Rider Dispatch Route Preview
                                    </span>
                                    
                                    <div className="space-y-4 relative pl-3.5 border-l-2 border-dashed border-purple-500/30">
                                      {/* Stop 1 */}
                                      <div className="relative">
                                        <div className="absolute -left-[21.5px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-black flex items-center justify-center text-[7.5px] text-black font-black">1</div>
                                        <div>
                                          <span className="block text-[11px] font-black text-white">Pickup 1</span>
                                          <span className="text-[10px] text-zinc-400 font-mono block truncate max-w-[240px]">{seller1Name}</span>
                                        </div>
                                      </div>

                                      {/* Stop 2 */}
                                      <div className="relative">
                                        <div className="absolute -left-[21.5px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-[7.5px] text-black font-black">2</div>
                                        <div>
                                          <span className="block text-[11px] font-black text-white">Pickup 2</span>
                                          <span className="text-[10px] text-zinc-400 font-mono block max-w-[240px]">
                                            {seller2Name ? seller2Name : "No second collection stop (Direct Route Discount)"}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Stop 3 */}
                                      <div className="relative">
                                        <div className="absolute -left-[21.5px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-black flex items-center justify-center text-[7.5px] text-black font-black">3</div>
                                        <div>
                                          <span className="block text-[11px] font-black text-white">Deliver to</span>
                                          <span className="text-[10px] text-zinc-400 font-mono block truncate max-w-[240px]">
                                            {buyerNeighbourhood || "Munali Compound"}, {buyerSelectedCity || "Lusaka"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <p className="text-[9.5px] text-zinc-500 mt-3 leading-snug">
                                      * Route spans only <strong>{cart[0]?.zone}</strong> address nodes. Dashboards ensure optimal fuel allocation & standard rider safety margins.
                                    </p>
                                  </div>
                                );
                              })()}

                              {/* Checkout Form & Money Information */}
                              <div className="bg-[#0b0c10] border border-zinc-850 rounded-2xl p-4 space-y-4">
                                <span className="block text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-300 font-extrabold px-3 py-1 rounded-full w-fit">
                                  💵 Zambia Mobile Money Checkout
                                </span>

                                <div className="space-y-3.5">
                                  {/* Operator */}
                                  <div>
                                    <label className="block text-[9px] uppercase font-mono text-zinc-400 font-bold tracking-wider mb-1">
                                      MoMo Carrier Network
                                    </label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                      {(["Airtel", "MTN", "Zamtel"] as const).map(op => (
                                        <button
                                          key={op}
                                          type="button"
                                          onClick={() => setCheckoutOperator(op)}
                                          className={`py-2 rounded-xl border text-xs font-bold cursor-pointer text-center ${checkoutOperator === op ? "bg-purple-500/10 border-purple-500 text-purple-400" : "bg-black/60 border-zinc-850 text-zinc-500 hover:text-zinc-400"}`}
                                        >
                                          {op} ZM
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Wallet Phone */}
                                  <div>
                                    <label className="block text-[9px] uppercase font-mono text-zinc-400 font-bold tracking-wider mb-1">
                                      Wallet MoMo Number
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="tel"
                                        placeholder="09XXXXXXXX"
                                        value={checkoutPhone}
                                        onChange={(e) => setCheckoutPhone(e.target.value)}
                                        className="w-full bg-black border border-zinc-850 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-purple-500 focus:outline-none pr-8"
                                      />
                                      {isLookingUpName && (
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                          <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Auto-resolved subscriber name presentation */}
                                    {lookupName && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20 text-[10px]"
                                      >
                                        <span className="text-purple-400 font-mono">Subscriber Name:</span>
                                        <span className="text-zinc-200 font-bold">{lookupName}</span>
                                      </motion.div>
                                    )}
                                  </div>

                                  {/* Delivery Address Dropdown location */}
                                  <div>
                                    <label className="block text-[9px] uppercase font-mono text-zinc-400 font-bold tracking-wider mb-1 border-none pb-0">
                                      Delivery Compound / Neighborhood
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Munali Compound, Great East Rd"
                                      value={buyerNeighbourhood || "Munali Compound"}
                                      onChange={(e) => setBuyerNeighbourhood(e.target.value)}
                                      className="w-full bg-black border border-zinc-850 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                                    />
                                  </div>

                                  {/* Tip your rider option */}
                                  <div className="pt-1.5">
                                    <div className="flex justify-between items-center mb-1">
                                      <label className="block text-[9.5px] uppercase font-mono text-zinc-400 font-bold tracking-wider">
                                        🏍️ Tip Your Rider (ZMW)
                                      </label>
                                      <span className="text-[10px] font-mono font-bold text-purple-400">
                                        {checkoutRiderTip > 0 ? `+K ${checkoutRiderTip.toFixed(2)}` : "No Tip Selected"}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-5 gap-1.5">
                                      {([0, 5, 10, 20] as const).map(tipVal => (
                                        <button
                                          key={`cart-tip-${tipVal}`}
                                          type="button"
                                          onClick={() => {
                                            setCheckoutRiderTip(tipVal);
                                            setCustomTipValue("");
                                          }}
                                          className={`py-1.5 rounded-lg border text-[10.5px] font-bold cursor-pointer text-center whitespace-nowrap transition-all ${checkoutRiderTip === tipVal && !customTipValue ? "bg-purple-500/10 border-purple-500 text-purple-400 font-extrabold shadow-sm" : "bg-black/60 border-zinc-850 text-zinc-500 hover:text-zinc-450"}`}
                                        >
                                          {tipVal === 0 ? "K0" : `K${tipVal}`}
                                        </button>
                                      ))}
                                      <input
                                        type="number"
                                        placeholder="Custom"
                                        value={customTipValue}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setCustomTipValue(val);
                                          const parsed = parseFloat(val);
                                          setCheckoutRiderTip(isNaN(parsed) || parsed < 0 ? 0 : parsed);
                                        }}
                                        className={`bg-black border text-center rounded-lg px-1.5 py-1 text-[10.5px] font-mono text-white focus:outline-none focus:border-purple-500 placeholder-zinc-700 min-w-0 ${customTipValue ? "border-purple-500 text-purple-400 font-bold" : "border-zinc-800"}`}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Deep Delivery Fee Breakdown & 2.8% Platforms calculation Details */}
                                {(() => {
                                  const uniqueSellers = Array.from(new Set(cart.map(i => i.listing.seller_id)));
                                  const numSellers = uniqueSellers.length;

                                  const leg1Distance = numSellers > 1 ? 2.5 : (cart[0]?.listing?.distance_km || 3.4);
                                  const leg1Fee = leg1Distance * 5.0; // K 5 per km

                                  const leg2Distance = numSellers > 1 ? (cart[1]?.listing?.distance_km || 4.2) : 0;
                                  const leg2Fee = leg2Distance * 5.0; // K 5 per km

                                  const itemsSubtot = cart.reduce((ac, it) => ac + (it.listing.suggested_price * it.quantity), 0);
                                  const deliverySubtot = leg1Fee + leg2Fee;
                                  const platformFeeVal = parseFloat((itemsSubtot * 0.028).toFixed(2));
                                  const grandTot = itemsSubtot + deliverySubtot + platformFeeVal + checkoutRiderTip;

                                  return (
                                    <div className="bg-[#050506]/90 p-3.5 rounded-xl border border-zinc-900 space-y-2 text-[10px] font-mono leading-relaxed">
                                      <div className="flex justify-between text-zinc-400 border-none pb-0">
                                        <span>Items Subtotal:</span>
                                        <span className="text-white">K {itemsSubtot.toFixed(2)}</span>
                                      </div>
                                      
                                      <div className="border-t border-zinc-900/50 pt-2 pb-0.5">
                                        <span className="block text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-1">
                                          Delivery Ledger Breakdown:
                                        </span>
                                      </div>

                                      <div className="flex justify-between text-zinc-400 pl-1 border-none pb-0">
                                        <span>Leg 1 (Store 1 to Store 2/Hub):</span>
                                        <span className="text-[#ffa500]">
                                          K {leg1Fee.toFixed(2)} ({leg1Distance} km)
                                        </span>
                                      </div>

                                      <div className="flex justify-between text-zinc-400 pl-1 border-none pb-0">
                                        <span>Leg 2 (Hub to delivery Address):</span>
                                        <span className="text-[#ffa500]">
                                          {leg2Fee > 0 ? `K ${leg2Fee.toFixed(2)} (${leg2Distance} km)` : "K 0.00 (N/A)"}
                                        </span>
                                      </div>

                                      <div className="flex justify-between text-emerald-400/90 font-extrabold pr-1 pl-1 pt-1.5 border-t border-zinc-900/30 pb-0">
                                        <span>Delivery Fee Subtotal:</span>
                                        <span>K {deliverySubtot.toFixed(2)}</span>
                                      </div>

                                      {checkoutRiderTip > 0 && (
                                        <div className="flex justify-between text-purple-400 font-extrabold pr-1 pl-1 pt-1 border-none pb-0">
                                          <span>Rider Tip:</span>
                                          <span>K {checkoutRiderTip.toFixed(2)}</span>
                                        </div>
                                      )}

                                      <div className="flex justify-between text-zinc-400 border-none pb-0">
                                        <span>Selo Platform Fee (2.8%):</span>
                                        <span className="text-white">K {platformFeeVal.toFixed(2)}</span>
                                      </div>

                                      <hr className="border-zinc-850" />

                                      <div className="flex justify-between text-white font-extrabold text-xs pt-1 border-none pb-0">
                                        <span>Grand Total Sealed Escrow:</span>
                                        <span className="text-purple-400 font-mono">
                                          K {grandTot.toFixed(2)} ZMW
                                        </span>
                                      </div>

                                      {/* Checkout Actions */}
                                      <div className="pt-2">
                                        <motion.button
                                          whileTap={{ scale: 0.98 }}
                                          disabled={isProcessingCheckout}
                                          onClick={() => handleCartCheckout(checkoutPhone, checkoutOperator, buyerNeighbourhood)}
                                          className="w-full bg-[#a855f7] hover:bg-purple-600 text-white font-black py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                                        >
                                          {isProcessingCheckout ? (
                                            <>
                                              <RefreshCw className="w-4 h-4 animate-spin" />
                                              <span>Authorizing Multi-Vendor Escrow...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Lock className="w-4 h-4 text-white" />
                                              <span>Pay K {grandTot.toFixed(2)} MoMo Escrow</span>
                                            </>
                                          )}
                                        </motion.button>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {buyerFeedTab === "TRACKING" && (
                        /* FIVE-STAGE ORDER TRACKING COMPONENT WITH RIDER GAME SIMULATOR */
                        <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4 text-left scrollbar-none bg-[#050506]">
                          
                          <div className="flex items-center justify-between">
                            <h3 className="text-md font-black tracking-tight text-white uppercase font-sans">
                              Selo Escrow Tracker
                            </h3>
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-850">
                              Locked Mobile Money
                            </span>
                          </div>

                          {/* Segmented controls */}
                          <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-905 rounded-xl shrink-0">
                            <button
                              type="button"
                              onClick={() => setBuyerTrackingTab("ACTIVE")}
                              className={`py-1.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${buyerTrackingTab === "ACTIVE" ? "bg-zinc-905 text-white shadow font-black border border-zinc-800" : "text-zinc-500 hover:text-zinc-400 border border-transparent"}`}
                            >
                              🛰️ Active Tracker
                            </button>
                            <button
                              type="button"
                              onClick={() => setBuyerTrackingTab("PAST")}
                              className={`py-1.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${buyerTrackingTab === "PAST" ? "bg-zinc-905 text-white shadow font-black border border-zinc-800" : "text-zinc-500 hover:text-zinc-400 border border-transparent"}`}
                            >
                              📜 Past Orders ({orders.filter(o => o.transit_status === "delivered" || o.transit_status === "cancelled").length})
                            </button>
                          </div>

                          {buyerTrackingTab === "PAST" ? (
                            /* COMPLETED/PAST HISTORICAL ORDERS LIST */
                            <div className="space-y-3.5">
                              {/* Search bar inside Past Orders */}
                              <div className="relative mb-2">
                                <input
                                  type="text"
                                  placeholder="Search by title or Order ID..."
                                  value={pastOrdersSearch}
                                  onChange={(e) => setPastOrdersSearch(e.target.value)}
                                  className="w-full bg-[#0c0d12] border border-zinc-850 text-xs py-2 px-3 pl-8 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                                />
                                <Search className="w-3.5 h-3.5 text-zinc-550 absolute left-2.5 top-3" />
                                {pastOrdersSearch && (
                                  <button
                                    onClick={() => setPastOrdersSearch("")}
                                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white text-xs font-bold px-1.5"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>

                              {(() => {
                                const filteredPastAndCancelled = orders
                                  .filter(o => o.transit_status === "delivered" || o.transit_status === "cancelled")
                                  .filter(o => {
                                    if (!pastOrdersSearch) return true;
                                    const term = pastOrdersSearch.toLowerCase();
                                    return o.product_title.toLowerCase().includes(term) || o.order_id.toLowerCase().includes(term);
                                  });

                                if (filteredPastAndCancelled.length === 0) {
                                  return (
                                    <div className="bg-[#0b0c10] border border-zinc-850 rounded-2xl p-6 text-center space-y-2">
                                      <p className="text-xs font-bold text-white">No historical orders found</p>
                                      <p className="text-[10px] text-zinc-550">No orders match your search term.</p>
                                    </div>
                                  );
                                }

                                return filteredPastAndCancelled.map(pastOrder => {
                                  const dateStr = pastOrder.created_at ? pastOrder.created_at.split("T")[0] : "2026-06-10";
                                  return (
                                    <div key={pastOrder.order_id} className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl space-y-3 relative text-left">
                                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                                        <div>
                                          <span className="text-[9.5px] font-mono font-bold text-zinc-400 font-extrabold">REF: {pastOrder.order_id}</span>
                                          <span className="text-[9.5px] text-zinc-500 block mt-0.5 font-mono">{dateStr}</span>
                                        </div>
                                        
                                        <div className="text-right">
                                          {pastOrder.transit_status === "delivered" ? (
                                            <span className="text-[8px] font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 uppercase">
                                              ✓ Completed
                                            </span>
                                          ) : (
                                            <span className="text-[8px] font-mono font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase">
                                              ✕ Cancelled
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                          <h4 className="font-extrabold text-white text-xs">{pastOrder.product_title}</h4>
                                          <p className="text-[10px] text-zinc-400 mt-0.5">
                                            Quantity: {pastOrder.quantity}x • Price: K {pastOrder.product_price}
                                          </p>
                                          <p className="text-[9px] text-zinc-500 font-mono mt-1">
                                            Escrow Status: <span className="text-purple-400 font-bold">{pastOrder.escrow_status}</span>
                                          </p>
                                        </div>
                                        
                                        <div className="text-right shrink-0">
                                          <span className="text-xs font-mono font-bold text-[#ffa500] block">
                                            K {(pastOrder.product_price * pastOrder.quantity).toFixed(2)}
                                          </span>
                                          <span className="text-[8.5px] text-zinc-500 font-mono block mt-0.5">
                                            + Courier: K {pastOrder.delivery_fee.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex gap-2 pt-2 border-t border-zinc-900">
                                        <button
                                          type="button"
                                          onClick={() => handleBuyAgain(pastOrder.listing_id, pastOrder.quantity)}
                                          className="w-full bg-purple-500 hover:bg-purple-400 text-black font-black text-[10.5px] py-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-98"
                                        >
                                          🔄 Buy Again
                                        </button>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          ) : (
                            (() => {
                              // Find active order to track, or default to the first one in the list
                              const currentTrackOrderId = buyerSelectTrackingOrderId || (orders.length > 0 ? orders[0].order_id : null);
                              const matchedOrder = orders.find(o => o.order_id === currentTrackOrderId);
                            
                            if (!currentTrackOrderId || !matchedOrder) {
                              return (
                                <div className="bg-[#0b0c10] border border-zinc-850 rounded-2xl p-6 text-center space-y-3">
                                  <div className="w-12 h-12 bg-amber-950/20 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-xl">
                                    📦
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white">No active orders being tracked</p>
                                    <p className="text-[10px] text-zinc-500 mt-1 max-w-[210px] mx-auto leading-relaxed">
                                      Pay for items in your cart to dispatch an on-demand rider and lock funds in escrow!
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setBuyerFeedTab("REELS")}
                                    className="mx-auto bg-amber-500 hover:bg-amber-400 text-black font-black text-[10.5px] px-4 py-2 rounded-xl cursor-pointer"
                                  >
                                    Go to Reels
                                  </button>
                                </div>
                              );
                            }

                            const currentStepNum = getTransitStepNumber(matchedOrder.transit_status);

                            // Steps labels as requested by the user:
                            // 1. payment confirmed
                            // 2. collected from seller 1
                            // 3. en route to seller 2
                            // 4. en route to buyer
                            // 5. delivered
                            const stepList = [
                              { id: 1, label: "Payment Confirmed", desc: "Zambian MoMo locked in multi-sig vault." },
                              { id: 2, label: "Collected from Seller 1", desc: "Rider verified packet 1 quality markers." },
                              { id: 3, label: "En route to Seller 2", desc: "Co-op transit waypoint collection run." },
                              { id: 4, label: "En route to Buyer", desc: "Courier flying down Great East road." },
                              { id: 5, label: "Delivered", desc: "Hand-delivered! Escrow settled to merchants." }
                            ];

                            return (
                              <div className="space-y-4">
                                {/* Basic Order overview */}
                                <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl space-y-2">
                                  <div className="flex justify-between items-center text-xs font-mono">
                                    <span className="text-zinc-400 font-extrabold text-[#ffa500]">
                                      ORDER REF: {matchedOrder.order_id}
                                    </span>
                                    <span className="text-zinc-500 text-[10px]">
                                      {matchedOrder.created_at.split("T")[0]}
                                    </span>
                                  </div>

                                  <div className="border-t border-zinc-900/60 pt-2 flex items-center justify-between text-xs">
                                    <div>
                                      <h4 className="font-extrabold text-white text-[12px]">{matchedOrder.product_title}</h4>
                                      <p className="text-[10px] text-zinc-400 mt-0.5">
                                        Qty {matchedOrder.quantity} • Merchant: {getStoreName(matchedOrder.seller_id)}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-mono font-bold text-teal-400 block">
                                        K {(matchedOrder.product_price * matchedOrder.quantity).toFixed(2)} ZMW
                                      </span>
                                      <span className="text-[9.5px] text-zinc-500 font-mono">
                                        Escrow {matchedOrder.escrow_status}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Active Order Picker if multiple */}
                                {orders.length > 1 && (
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                                      My Switchable Orders ({orders.length})
                                    </label>
                                    <div 
                                      onMouseDown={handleDragScrollMouseDown}
                                      onMouseLeave={handleDragScrollMouseLeave}
                                      onMouseUp={handleDragScrollMouseUp}
                                      onMouseMove={handleDragScrollMouseMove}
                                      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar select-none cursor-grab active:cursor-grabbing scroll-smooth"
                                    >
                                      {orders.map(o => (
                                        <button
                                          key={o.order_id}
                                          onClick={() => setBuyerSelectTrackingOrderId(o.order_id)}
                                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono whitespace-nowrap transition-colors border shrink-0 ${
                                            (buyerSelectTrackingOrderId || orders[0].order_id) === o.order_id
                                              ? "bg-amber-500/15 border-amber-500 text-amber-400"
                                              : "bg-[#0b0c10] border-zinc-900 text-zinc-500 hover:text-zinc-400"
                                          }`}
                                        >
                                          Ref: {o.order_id.replace("ord-", "")}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Simulating Rider Stage tool to help demo order flow */}
                                <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-850/60 text-left space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] uppercase font-black font-mono text-[#ffa500] tracking-widest flex items-center gap-1">
                                      <Activity className="w-3.5 h-3.5 text-[#ffa500]" />
                                      Demo Rider Simulator Console
                                    </span>
                                    <span className="text-[8.5px] font-mono text-zinc-500">
                                      Stage {currentStepNum}/5
                                    </span>
                                  </div>
                                  
                                  <p className="text-[9.5px] text-zinc-400 leading-snug">
                                    Simulate the on-demand Rider advancing through their road tasks to test active escrow safety mechanics!
                                  </p>

                                  <div className="flex gap-1.5 pt-1">
                                    <button
                                      type="button"
                                      disabled={currentStepNum >= 5}
                                      onClick={() => {
                                        // Advance current order transit step
                                        const stepsMap = ["pending_seller_confirmation", "collected_seller_1", "en_route_seller_2", "en_route_buyer", "delivered"];
                                        const nextStatus = stepsMap[currentStepNum]; // since array is 0-indexed, currentStepNum is exactly the next element index!
                                        if (nextStatus) {
                                          setOrders(prev => prev.map(o => {
                                            if (o.order_id === matchedOrder.order_id) {
                                              return {
                                                ...o,
                                                transit_status: nextStatus,
                                                escrow_status: nextStatus === "delivered" ? "settled" : "locked"
                                              };
                                            }
                                            return o;
                                          }));
                                          // if it settled, update seller balance simulator as well!
                                          if (nextStatus === "delivered") {
                                            setSellerBalance(prev => prev + (matchedOrder.product_price * matchedOrder.quantity));
                                            setRatingOrder(matchedOrder);
                                          }
                                          setToast({
                                            message: `SIMULATED: ${nextStatus.toUpperCase()}`,
                                            subText: `Rider successfully advanced transit coordinates.`
                                          });
                                        }
                                      }}
                                      className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none text-black font-black text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer"
                                    >
                                      Advance Transit State ❯
                                    </button>
                                    
                                    <button
                                      type="button"
                                      disabled={currentStepNum <= 1}
                                      onClick={() => {
                                        const stepsMap = ["pending_seller_confirmation", "collected_seller_1", "en_route_seller_2", "en_route_buyer", "delivered"];
                                        const prevStatus = stepsMap[currentStepNum - 2]; // 2 levels down
                                        if (prevStatus) {
                                          setOrders(prev => prev.map(o => {
                                            if (o.order_id === matchedOrder.order_id) {
                                              return {
                                                ...o,
                                                transit_status: prevStatus,
                                                escrow_status: "locked"
                                              };
                                            }
                                            return o;
                                          }));
                                          setToast({
                                            message: `SIMULATED: RESET STAGE`,
                                            subText: `Returned transit coordinates to ${prevStatus}.`
                                          });
                                        }
                                      }}
                                      className="px-2.5 bg-zinc-800 hover:bg-zinc-750 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 font-extrabold text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer"
                                    >
                                      Reset
                                    </button>
                                  </div>
                                </div>

                                {/* Vertical Stepper Steps */}
                                <div className="space-y-4 pt-1 pl-1">
                                  {stepList.map(step => {
                                    const active = currentStepNum >= step.id;
                                    const isCurrent = currentStepNum === step.id;

                                    return (
                                      <div key={step.id} className="flex gap-3.5 items-start text-left relative">
                                        {/* Connector Line vertically */}
                                        {step.id !== 5 && (
                                          <div className={`absolute left-3.5 top-7 w-[2px] h-9 ${
                                            currentStepNum > step.id ? "bg-amber-500" : "bg-zinc-900 border-none"
                                          }`} />
                                        )}

                                        {/* Step Icon */}
                                        <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0 font-mono text-[10.5px] font-black border transition-colors ${
                                          isCurrent 
                                            ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.25)] animate-pulse"
                                            : active
                                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                              : "bg-zinc-950 border-zinc-900 text-zinc-600"
                                        }`}>
                                          {active && !isCurrent ? "✓" : step.id}
                                        </div>

                                        <div className="pt-0.5">
                                          <h4 className={`text-xs font-bold leading-tight ${active ? "text-white" : "text-zinc-600"}`}>
                                            {step.label}
                                          </h4>
                                          <p className={`text-[10px] mt-0.5 leading-tight ${active ? "text-zinc-400" : "text-zinc-650"}`}>
                                            {step.desc}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Post-Delivery Rider Tipping Panel */}
                                <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl text-left space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-black font-mono text-purple-400 tracking-wider flex items-center gap-1.5">
                                      🏍️ Tip Your Rider
                                    </span>
                                    <span className="text-[9.5px] font-mono text-zinc-400">
                                      Rider: <strong className="text-white">Zola Deliveries</strong>
                                    </span>
                                  </div>

                                  {matchedOrder.transit_status === "delivered" ? (
                                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl text-center">
                                      <span className="text-xs text-emerald-400 font-bold block">🎉 Delivery completed successfully!</span>
                                      <span className="text-[10px] text-zinc-400 block mt-0.5">Show some appreciation to your courier by sending a direct cash tip to their wallet!</span>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-zinc-400 leading-snug font-sans">
                                      Show your courier support. Tips are settled directly and instantly to the rider's wallet!
                                    </p>
                                  )}

                                  <div className="bg-black/40 border border-zinc-900 p-2.5 rounded-xl flex justify-between items-center text-xs">
                                    <span className="text-zinc-400">Current Order Tip:</span>
                                    <span className="font-mono font-bold text-emerald-400">
                                      K {(matchedOrder.rider_tip || 0).toFixed(2)} ZMW
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="grid grid-cols-4 gap-1.5">
                                      {([5, 10, 20] as const).map(tipVal => (
                                        <button
                                          key={`post-tip-${tipVal}`}
                                          type="button"
                                          onClick={() => handleAddPostDeliveryRiderTip(matchedOrder.order_id, tipVal)}
                                          className="py-1.5 rounded-lg border border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5 bg-black/60 text-[10.5px] font-bold cursor-pointer text-center text-purple-400 transition-all active:scale-97"
                                        >
                                          +K {tipVal}
                                        </button>
                                      ))}
                                      
                                      <div className="flex bg-black/40 border border-zinc-855 rounded-lg overflow-hidden">
                                        <input
                                          type="number"
                                          placeholder="Custom K"
                                          value={postDeliveryTipValue[matchedOrder.order_id] || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setPostDeliveryTipValue(prev => ({
                                              ...prev,
                                              [matchedOrder.order_id]: val
                                            }));
                                          }}
                                          className="w-full bg-transparent text-center text-[10px] font-mono text-white focus:outline-none placeholder-zinc-700 min-w-0"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const customVal = parseFloat(postDeliveryTipValue[matchedOrder.order_id] || "");
                                            if (isNaN(customVal) || customVal <= 0) return;
                                            handleAddPostDeliveryRiderTip(matchedOrder.order_id, customVal);
                                            setPostDeliveryTipValue(prev => ({
                                              ...prev,
                                              [matchedOrder.order_id]: ""
                                            }));
                                          }}
                                          className="px-2 bg-purple-500 hover:bg-purple-400 text-black font-black text-[9.5px] cursor-pointer"
                                        >
                                          Go
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Escrow bottom Notice protecting both merchants */}
                                <div className="bg-amber-950/15 border border-amber-500/20 p-3.5 rounded-2xl">
                                  <div className="flex items-start gap-2.5">
                                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="block text-[10px] font-black uppercase text-amber-300 font-mono tracking-wider">
                                        🔒 Dual-Vendor Escrow Active
                                      </span>
                                      <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed font-sans">
                                        Selonachipa holds <strong>both sellers in escrow</strong> during this multi-stop trip. Neither seller can access funds until you receive all packets and verify order satisfaction with the Rider!
                                      </p>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            );
                          })())}
                        </div>
                      )}

                      {buyerFeedTab === "PARCELS" && (
                        /* PARCELS MODULE FOR BUYERS TO SEND PARCELS */
                        <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4 text-left scrollbar-none bg-[#050506]">
                          <div className="flex items-center justify-between shrink-0">
                            <div>
                              <h3 className="text-sm font-black tracking-tight text-white uppercase font-sans">
                                📦 Send a Parcel safely
                              </h3>
                              <p className="text-[9px] text-zinc-400 font-sans mt-0.5">
                                Establish dynamic parcel safe logs, register coordinate parameters, and dispatch dedicated riders!
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4 pb-16">
                            <ParcelsModule
                              userRole="BUYER"
                              userId={buyerPhone || "buyer-user"}
                              userName={buyerFirstName || "Zambian Buyer"}
                              savedLocations={savedLocations}
                              setSavedLocations={setSavedLocations}
                              recentLocations={recentLocations}
                              setRecentLocations={setRecentLocations}
                              parcelJobs={parcelJobs}
                              setParcelJobs={setParcelJobs}
                              adminConfig={adminConfig}
                              setAdminConfig={setAdminConfig}
                              onSpawnToast={(t) => setToast(t)}
                              portfolioSellers={[]}
                            />
                          </div>
                        </div>
                      )}

                      {/* DETAILED OPTIONAL OVERLAY DRAWERS / MODALS FOR DYNAMIC INTERACTIVE EXPERIENCE */}

                      {/* 1. SELLER CONTACT ENQUIRY DIALOG SIMULATION */}
                      <AnimatePresence>
                        {showSellerContactModal && (
                          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.95, opacity: 0 }}
                              className="bg-[#0c0d12] border border-zinc-800 rounded-3xl p-5 max-w-[340px] w-full text-left space-y-4 shadow-2xl"
                            >
                              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                                <span className="text-xs font-black uppercase text-purple-400 font-mono tracking-wider flex items-center gap-1.5">
                                  <MessageSquare className="w-4 h-4 text-purple-400" />
                                  Ask the Seller
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowSellerContactModal(null)}
                                  className="text-zinc-500 hover:text-white p-1"
                                >
                                  ✕
                                </button>
                              </div>

                              <div className="flex gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-900 leading-tight">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                                  {showSellerContactModal.thumbnail && (showSellerContactModal.thumbnail.startsWith("http") || showSellerContactModal.thumbnail.startsWith("data:")) ? (
                                    <img src={showSellerContactModal.thumbnail} className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" alt="" />
                                  ) : (
                                    showSellerContactModal.thumbnail || "🛒"
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white line-clamp-1">{showSellerContactModal.title}</h4>
                                  <p className="text-[10px] text-zinc-500 mt-0.5">Shop: {getStoreName(showSellerContactModal.seller_id)}</p>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[8.5px] uppercase font-mono text-zinc-400 font-bold">
                                  Your Enquiry Massage
                                </label>
                                <textarea
                                  placeholder="Muli bwanji! I am asking about stock availability for this item or if I can buy wholesale..."
                                  rows={3}
                                  className="w-full bg-black border border-zinc-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 leading-normal"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setShowSellerContactModal(null)}
                                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold py-2 px-3 rounded-xl border border-zinc-800 text-[11px] text-center cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowSellerContactModal(null);
                                    setToast({
                                      message: "Enquiry Sent!",
                                      subText: "Your question has been forwarded to the seller's secure hub thread."
                                    });
                                  }}
                                  className="bg-purple-600 hover:bg-purple-500 text-white font-black py-2 px-3 rounded-xl border border-purple-550 text-[11px] text-center cursor-pointer"
                                >
                                  Send Enquiry
                                </button>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      {/* 2. CHAT CONFIRMATION DIALOG SCREEN */}
                      <AnimatePresence>
                        {showCartConfirmation && lastAddedItem && (
                          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="bg-[#0c0d12] border border-zinc-800 rounded-3xl p-5 max-w-[340px] w-full text-left space-y-4 shadow-2xl"
                            >
                              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  Added to Cart!
                                </span>
                                <button 
                                  onClick={() => setShowCartConfirmation(false)}
                                  className="text-zinc-500 hover:text-white font-bold p-1"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Item Added Info */}
                              <div className="flex gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                                <span className="text-2xl shrink-0">{lastAddedItem.thumbnail || "🛒"}</span>
                                <div className="leading-tight">
                                  <h4 className="text-xs font-bold text-white line-clamp-1">{lastAddedItem.title}</h4>
                                  <p className="text-[10px] text-zinc-400 mt-0.5">Price: K {lastAddedItem.suggested_price}.00 ZMW</p>
                                  <span className="inline-block text-[8.5px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/10 font-bold mt-1">
                                    📍 Zone: {getListingZone(lastAddedItem)}
                                  </span>
                                </div>
                              </div>

                              {/* Purple Info Box: Educate Zone Rules */}
                              <div className="bg-purple-950/20 border border-purple-500/25 p-3 rounded-xl flex items-start gap-2.5">
                                <Sparkles className="w-4.5 h-4.5 text-purple-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="block text-[9.5px] font-black uppercase text-purple-300 font-mono tracking-wider leading-none">
                                    The Selo Same-Zone Rule
                                  </span>
                                  <p className="text-[9.5px] text-purple-200 mt-1 leading-relaxed">
                                    To keep rider transit routes fast, items sharing a basket must belong to the **same zone**. Different zones dispatch separately.
                                  </p>
                                </div>
                              </div>

                              {/* Current Cart Grouped by Seller */}
                              <div className="space-y-2">
                                <span className="block text-[8.5px] font-bold text-zinc-500 uppercase font-mono tracking-wider leading-none">Current Cart Items</span>
                                <div className="max-h-[110px] overflow-y-auto space-y-2 pr-1 scrollbar-none no-scrollbar">
                                  {(() => {
                                    const grouped = cart.reduce((acc, item) => {
                                      const sStore = getStoreName(item.listing.seller_id);
                                      if (!acc[sStore]) acc[sStore] = [];
                                      acc[sStore].push(item);
                                      return acc;
                                    }, {} as Record<string, typeof cart>);

                                    return Object.entries(grouped).map(([sellerStore, items], sIdx) => (
                                      <div key={sellerStore} className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-900 text-[10px] leading-normal">
                                        <div className="font-extrabold text-[#ffa500] border-b border-zinc-900 pb-1 mb-1 flex justify-between items-center">
                                          <span className="truncate max-w-[150px]">{sellerStore}</span>
                                          <span className="text-[8px] text-zinc-500 font-mono">Store {sIdx + 1}</span>
                                        </div>
                                        <div className="space-y-0.5">
                                          {(items as any[]).map(it => (
                                            <div key={it.listing.listing_id} className="flex justify-between items-center text-zinc-300 gap-2">
                                              <span className="truncate flex-1 text-left">{it.listing.title}</span>
                                              <span className="font-mono text-zinc-400 shrink-0 font-bold">Qty {it.quantity}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ));
                                  })()}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                  onClick={() => setShowCartConfirmation(false)}
                                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-extrabold py-2.5 rounded-xl border border-zinc-800 text-center text-xs cursor-pointer transition-colors"
                                >
                                  Browse Reels
                                </button>
                                <button
                                  onClick={() => {
                                    setShowCartConfirmation(false);
                                    setBuyerFeedTab("CART");
                                  }}
                                  className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-2.5 rounded-xl border border-purple-550 text-center text-xs cursor-pointer shadow-md shadow-purple-600/10 transition-colors"
                                >
                                  View Basket
                                </button>
                              </div>

                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      {/* 3. CROSS-ZONE DETOUR OVERLAY BLOCK MODAL */}
                      <AnimatePresence>
                        {showCrossZoneModal && blockedListing && (
                          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="bg-[#0c0d12] border border-red-500/20 rounded-3xl p-5 max-w-[340px] w-full text-left space-y-4 shadow-2xl animate-fade"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-zinc-900 text-amber-500">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <span className="text-xs font-black uppercase font-mono tracking-wider">
                                  Zone Selection Lock
                                </span>
                              </div>

                              <p className="text-[11px] text-zinc-200 leading-relaxed">
                                Your active basket has items from <strong className="text-purple-400 font-mono">{cart[0]?.zone}</strong>. This new product is in <strong className="text-blue-400 font-mono">{getListingZone(blockedListing)}</strong>.
                              </p>

                              <div className="bg-[#050506] p-3 rounded-xl border border-zinc-900 space-y-1.5 text-[10px] font-mono leading-none">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-500">Current Basket Zone:</span>
                                  <span className="text-purple-400 font-extrabold">{cart[0]?.zone}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-500">New Product Zone:</span>
                                  <span className="text-blue-400 font-extrabold">{getListingZone(blockedListing)}</span>
                                </div>
                              </div>

                              <p className="text-[10px] text-zinc-400 leading-relaxed">
                                To maintain speed and keep rider couriers on tight and fuel-optimal local loops, we don't mix multiple disjoint zones in a single dispatch. Choose your detour:
                              </p>

                              <div className="flex flex-col gap-2 pt-1.5">
                                {/* Option 1: Back */}
                                <button
                                  onClick={() => {
                                    setShowCrossZoneModal(false);
                                    setBlockedListing(null);
                                  }}
                                  className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 text-xs font-bold py-2.5 rounded-xl cursor-pointer text-center transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <span className="text-zinc-400">❮</span>
                                  <span>Go Back (Keep Basket)</span>
                                </button>

                                {/* Option 2: Save to wishlist */}
                                <button
                                  onClick={() => {
                                    setWishlist(prev => {
                                      if (prev.some(item => item.listing_id === blockedListing.listing_id)) return prev;
                                      return [...prev, blockedListing];
                                    });
                                    setShowCrossZoneModal(false);
                                    setBlockedListing(null);
                                    setToast({
                                      message: "Saved to Wishlist",
                                      subText: `${blockedListing.title} was cataloged in your Saved file.`
                                    });
                                  }}
                                  className="w-full bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-500/25 text-xs font-bold py-2.5 rounded-xl cursor-pointer text-center transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <Heart className="w-3.5 h-3.5 text-purple-400" />
                                  <span>Save to Wishlist & Back</span>
                                </button>

                                {/* Option 3: Fresh start */}
                                <button
                                  onClick={() => {
                                    const nextZone = getListingZone(blockedListing);
                                    setCart([{ listing: blockedListing, quantity: 1, zone: nextZone }]);
                                    setShowCrossZoneModal(false);
                                    setBlockedListing(null);
                                    setLastAddedItem(blockedListing);
                                    setShowCartConfirmation(true);
                                    setToast({
                                      message: "Cart Started Fresh",
                                      subText: `Old basket dropped. Started fresh basket in ${nextZone}.`
                                    });
                                  }}
                                  className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-xs font-bold py-2.5 rounded-xl cursor-pointer text-center transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Discard & Start New {getListingZone(blockedListing)} Cart</span>
                                </button>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      {/* BUY AGAIN QUANTITY ADJUSTER MODAL */}
                      <AnimatePresence>
                        {buyAgainConfirmListing && (
                          <div className="absolute inset-x-0 bottom-0 top-0 bg-black/75 z-40 flex items-end justify-center pointer-events-auto">
                            <motion.div 
                              initial={{ y: "100%" }}
                              animate={{ y: 0 }}
                              exit={{ y: "100%" }}
                              transition={{ type: "spring", damping: 25, stiffness: 220 }}
                              className="absolute bottom-0 inset-x-0 bg-[#0c0d12] border-t border-zinc-805 rounded-t-[28px] p-5 text-left text-zinc-200 shadow-3xl pointer-events-auto z-50"
                            >
                              <div className="flex justify-between items-center pb-3.5 border-b border-zinc-800">
                                <div>
                                  <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider font-mono">
                                    🔄 Confirm Reorder
                                  </h4>
                                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                                    Adjust amount before placing in your active cart basket
                                  </span>
                                </div>
                                <button 
                                  onClick={() => setBuyAgainConfirmListing(null)}
                                  className="text-zinc-400 hover:text-white text-xs font-extrabold bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full cursor-pointer transition-colors"
                                >
                                  Close
                                </button>
                              </div>

                              <div className="py-4 space-y-4">
                                <div className="flex gap-3 bg-[#050506] p-3 rounded-xl border border-zinc-900">
                                  <div className="w-11 h-11 bg-zinc-900 rounded-lg flex items-center justify-center text-2xl border border-zinc-850 shrink-0">
                                    {buyAgainConfirmListing.thumbnail || "🌽"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-xs font-bold text-white truncate">{buyAgainConfirmListing.title}</h5>
                                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{buyAgainConfirmListing.description}</p>
                                    <p className="text-[10.5px] font-mono font-bold text-[#ffa500] mt-1">K {buyAgainConfirmListing.suggested_price} per unit</p>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-zinc-300">Choose Quantity</span>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setBuyAgainQuantity(prev => Math.max(1, prev - 1))}
                                      className="w-8 h-8 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                                    >
                                      -
                                    </button>
                                    <span className="text-sm font-bold text-white w-4 text-center">{buyAgainQuantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => setBuyAgainQuantity(prev => prev + 1)}
                                      className="w-8 h-8 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-zinc-900">
                                  <div className="flex justify-between text-xs mb-3 font-mono">
                                    <span className="text-zinc-400">Total Price:</span>
                                    <span className="text-[#ffa500] font-bold">K {(buyAgainConfirmListing.suggested_price * buyAgainQuantity).toFixed(2)}</span>
                                  </div>

                                  <button
                                    onClick={handleConfirmBuyAgain}
                                    className="w-full bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-xs py-3 rounded-xl transition-all font-mono"
                                  >
                                    Confirm adding {buyAgainQuantity} items to basket
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      {/* 4. ESGROW MOBILE MONEY INSTANT BUY MODAL */}
                      <AnimatePresence>
                        {isBuyModalOpen && (
                          <div className="absolute inset-x-0 bottom-0 top-0 bg-black/75 z-40 flex items-end justify-center pointer-events-auto">
                            <motion.div 
                              initial={{ y: "100%" }}
                              animate={{ y: 0 }}
                              exit={{ y: "100%" }}
                              transition={{ type: "spring", damping: 25, stiffness: 220 }}
                              className="absolute bottom-0 inset-x-0 bg-[#0c0d12] border-t border-zinc-805 rounded-t-[28px] p-5 text-left text-zinc-200 shadow-3xl pointer-events-auto"
                            >
                              <div className="flex justify-between items-center pb-3.5 border-b border-zinc-850">
                                <div>
                                  <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider font-mono">
                                    💰 Instabuy MoMo Escrow Checkout
                                  </h4>
                                  <span className="text-[9.5px] text-zinc-400 block mt-0.5 font-sans">
                                    Funds held securely in multi-sig escrow until Rider completion
                                  </span>
                                </div>
                                <button 
                                  onClick={() => {
                                    setIsBuyModalOpen(false);
                                    setDirectCheckoutItem(null);
                                  }}
                                  className="text-zinc-400 hover:text-white text-xs font-extrabold bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full cursor-pointer transition-colors"
                                >
                                  Close
                                </button>
                              </div>

                              {(() => {
                                const activeItem = directCheckoutItem || getPersonalizedListings()[currentReelIndex];
                                if (!activeItem) return null;
                                
                                const pPrice = activeItem.suggested_price;
                                const itemTotal = pPrice * checkoutQty;
                                const courierFee = 15.0;
                                const pFee = parseFloat((itemTotal * 0.028).toFixed(2));
                                const checkoutGrandTotal = itemTotal + courierFee + pFee + checkoutRiderTip;

                                return (
                                  <div className="mt-3.5 space-y-3.5">
                                    {/* Item display tag */}
                                    <div className="bg-[#050506] p-3 rounded-xl border border-zinc-905 flex justify-between items-center leading-tight">
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl shrink-0">{activeItem.thumbnail || "🛒"}</span>
                                        <div>
                                          <p className="text-xs font-bold text-white line-clamp-1">{activeItem.title}</p>
                                          <p className="text-[10px] text-[#ffa500] font-mono mt-0.5">K {pPrice}.00 Unit Price</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
                                        <button 
                                          onClick={() => setCheckoutQty(q => Math.max(1, q - 1))}
                                          className="text-xs font-black hover:text-white px-1.5"
                                        >
                                          -
                                        </button>
                                        <span className="text-xs font-mono font-bold text-white px-0.5">{checkoutQty}</span>
                                        <button 
                                          onClick={() => setCheckoutQty(q => q + 1)}
                                          className="text-xs font-black hover:text-white px-1.5"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>

                                    {/* Mobile networks selectors */}
                                    <div>
                                      <label className="block text-[9.5px] uppercase font-mono text-zinc-400 font-bold tracking-wider mb-1">
                                        MoMo Carrier Network
                                      </label>
                                      <div className="grid grid-cols-3 gap-2">
                                        {(["Airtel", "MTN", "Zamtel"] as const).map(op => (
                                          <button
                                            key={op}
                                            onClick={() => setCheckoutOperator(op)}
                                            className={`py-2 rounded-xl border font-bold text-xs cursor-pointer text-center ${checkoutOperator === op ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-[#050506]/60 border-zinc-850 text-zinc-500 hover:text-zinc-400"}`}
                                          >
                                            {op} ZM
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Phone input */}
                                    <div>
                                      <label className="block text-[9.5px] uppercase font-mono text-zinc-400 font-bold tracking-wider mb-1">
                                        Wallet Phone Number
                                      </label>
                                      <div className="relative">
                                        <input 
                                          type="tel"
                                          value={checkoutPhone}
                                          onChange={(e) => setCheckoutPhone(e.target.value)}
                                          placeholder="09XXXXXXXX"
                                          className="w-full bg-[#050506] border border-zinc-800 text-xs py-2 px-3.5 rounded-xl text-white font-mono focus:border-emerald-400 focus:outline-none pr-8"
                                        />
                                        {isLookingUpName && (
                                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Subscriber Name linked to the phone */}
                                      {lookupName && (
                                        <motion.div 
                                          initial={{ opacity: 0, y: -4 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-[10.5px]"
                                        >
                                          <span className="text-emerald-400 font-mono">Subscriber Name:</span>
                                          <span className="text-zinc-250 font-bold">{lookupName}</span>
                                        </motion.div>
                                      )}
                                    </div>

                                    {/* Tip your rider option */}
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <label className="block text-[9.5px] uppercase font-mono text-zinc-300 font-bold tracking-wider">
                                          🏍️ Tip Your Rider (ZMW)
                                        </label>
                                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                                          {checkoutRiderTip > 0 ? `+K ${checkoutRiderTip.toFixed(2)}` : "No Tip Selected"}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-5 gap-1.5">
                                        {([0, 5, 10, 20] as const).map(tipVal => (
                                          <button
                                            key={tipVal}
                                            type="button"
                                            onClick={() => {
                                              setCheckoutRiderTip(tipVal);
                                              setCustomTipValue("");
                                            }}
                                            className={`py-1.5 rounded-lg border text-[10.5px] font-bold cursor-pointer text-center whitespace-nowrap transition-all ${checkoutRiderTip === tipVal && !customTipValue ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-extrabold shadow-sm" : "bg-black/60 border-zinc-850 text-zinc-500 hover:text-zinc-400"}`}
                                          >
                                            {tipVal === 0 ? "K0" : `K${tipVal}`}
                                          </button>
                                        ))}
                                        <input
                                          type="number"
                                          placeholder="Custom"
                                          value={customTipValue}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setCustomTipValue(val);
                                            const parsed = parseFloat(val);
                                            setCheckoutRiderTip(isNaN(parsed) || parsed < 0 ? 0 : parsed);
                                          }}
                                          className={`bg-black/60 border text-center rounded-lg px-1.5 py-1 text-[10.5px] font-mono text-white focus:outline-none focus:border-emerald-400 placeholder-[#555] min-w-0 ${customTipValue ? "border-emerald-500 text-emerald-400 font-bold" : "border-zinc-850"}`}
                                        />
                                      </div>
                                    </div>

                                    {/* Calculations */}
                                    <div className="bg-[#050506] p-3 rounded-xl border border-zinc-900 space-y-1 text-[10.5px] font-mono leading-relaxed">
                                      <div className="flex justify-between text-zinc-400">
                                        <span>Items ({checkoutQty}x):</span>
                                        <span>K {itemTotal.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-zinc-400">
                                        <span>Courier Fee (Rider):</span>
                                        <span>K {courierFee.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-zinc-400">
                                        <span>Selo Platform (2.8%):</span>
                                        <span>K {pFee.toFixed(2)}</span>
                                      </div>
                                      <hr className="border-zinc-850" />
                                      <div className="flex justify-between text-white font-bold text-xs pt-1">
                                        <span>Sealed Escrow Total:</span>
                                        <span className="text-emerald-400">K {checkoutGrandTotal.toFixed(2)} ZMW</span>
                                      </div>
                                    </div>

                                    {/* Submit */}
                                    <motion.button
                                      whileTap={{ scale: 0.98 }}
                                      onClick={handlePurchase}
                                      disabled={isProcessingCheckout}
                                      className="w-full bg-emerald-500 hover:bg-emerald-600 font-black text-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                                    >
                                      {isProcessingCheckout ? (
                                        <>
                                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                                          <span>Sealing Escrow Ledger...</span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="w-4 h-4 text-black" />
                                          <span>Authorize K {checkoutGrandTotal.toFixed(2)} MoMo Payment</span>
                                        </>
                                      )}
                                    </motion.button>
                                  </div>
                                );
                              })()}
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      {/* Sticky Bottom navigation bar for Buyer */}
                      <div 
                        onMouseDown={handleDragScrollMouseDown}
                        onMouseLeave={handleDragScrollMouseLeave}
                        onMouseUp={handleDragScrollMouseUp}
                        onMouseMove={handleDragScrollMouseMove}
                        className="absolute inset-x-0 bottom-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 p-2 gap-1.5 shrink-0 overflow-x-auto scrollbar-none no-scrollbar select-none cursor-grab active:cursor-grabbing scroll-smooth z-40 flex items-center shadow-lg"
                      >
                        <button
                          type="button"
                          onClick={() => setBuyerFeedTab("FEED")}
                          className={`flex-1 shrink-0 min-w-[90px] py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 outline-none ${
                            buyerFeedTab === "FEED"
                              ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                              : "text-zinc-500 hover:text-zinc-400 border border-transparent"
                          }`}
                        >
                          <span>🌟 Welcome</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBuyerFeedTab("REELS")}
                          className={`flex-1 shrink-0 min-w-[90px] py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 outline-none ${
                            buyerFeedTab === "REELS"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "text-zinc-500 hover:text-zinc-400 border border-transparent"
                          }`}
                        >
                          <span>🎥 Reels</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBuyerFeedTab("CART")}
                          className={`flex-1 shrink-0 min-w-[90px] py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 outline-none relative ${
                            buyerFeedTab === "CART"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "text-zinc-500 hover:text-zinc-400 border border-transparent"
                          }`}
                        >
                          <span>🛒 Basket</span>
                          {cart.reduce((ac, it) => ac + it.quantity, 0) > 0 && (
                            <span className="bg-[#ff6f61] text-white text-[7.5px] font-bold rounded-full w-4 h-4 flex items-center justify-center absolute -top-1 -right-1 animate-pulse border border-[#050506]">
                              {cart.reduce((ac, it) => ac + it.quantity, 0)}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setBuyerFeedTab("TRACKING")}
                          className={`flex-1 shrink-0 min-w-[90px] py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 outline-none ${
                            buyerFeedTab === "TRACKING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "text-zinc-500 hover:text-zinc-400 border border-transparent"
                          }`}
                        >
                          <span>📦 Track</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBuyerFeedTab("PARCELS")}
                          className={`flex-1 shrink-0 min-w-[90px] py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 outline-none ${
                            buyerFeedTab === "PARCELS"
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              : "text-zinc-500 hover:text-zinc-400 border border-transparent"
                          }`}
                        >
                          <span>📦 Send Parcel</span>
                        </button>
                      </div>

                    </div>
                  )}

                  {/* ======================================= */}
                  {/* MODULE B: SELLER WORKSPACE (CREATION & METRICS) */}
                  {/* ======================================= */}
                  {selectedRole === "SELLER" && (
                    <SellerPortalRoot
                      listings={listings}
                      setListings={setListings}
                      orders={orders}
                      setOrders={setOrders}
                      sellerBalance={sellerBalance}
                      setSellerBalance={setSellerBalance}
                      toast={toast}
                      setToast={setToast}
                      savedLocations={savedLocations}
                      setSavedLocations={setSavedLocations}
                      recentLocations={recentLocations}
                      setRecentLocations={setRecentLocations}
                      parcelJobs={parcelJobs}
                      setParcelJobs={setParcelJobs}
                      adminConfig={adminConfig}
                      setAdminConfig={setAdminConfig}
                    />
                  )}
                  {false && (
                    <div className="p-4 text-zinc-200">
                      
                      {/* Onboarding stepper block if setup is forced */}
                      {!hasCompletedSellerSetup ? (
                        <div className="bg-[#0c0d12] border border-zinc-800 p-5 rounded-2xl text-left space-y-3.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-[#ffa500] font-bold tracking-widest font-mono uppercase">STEPS: {sellerStep} OF 3</span>
                            <button 
                              onClick={handleSkipSellerSetup}
                              className="text-[9px] text-[#ffa500] bg-amber-500/10 border border-amber-500/20 py-0.5 px-2 rounded-full cursor-pointer hover:bg-amber-500/20"
                            >
                              Skip Setup
                            </button>
                          </div>

                          {sellerStep === 1 && (
                            <div>
                              <h3 className="text-sm font-extrabold text-white">1. Merchant Credentials & Location</h3>
                              <p className="text-[11px] text-zinc-400 mt-1 lines-clamp-3 leading-relaxed">
                                Enter your business physical coordinates and Zambian store license tags to route mobile money deposits securely.
                              </p>
                              <div className="mt-3.5 space-y-2">
                                <label className="block text-[9.5px] text-zinc-400 uppercase font-mono">Territorial Outlet Name</label>
                                <input 
                                  type="text" 
                                  placeholder="Chisamba Agri-Wholesale Co." 
                                  defaultValue="Chisamba Organic Trade Hub"
                                  className="w-full bg-[#050506] border border-zinc-800 px-3 py-2 text-xs rounded-xl focus:border-amber-500 focus:outline-none"
                                />
                              </div>
                              <button 
                                onClick={() => setSellerStep(2)}
                                className="w-full bg-[#ffa500] text-black text-xs font-bold py-2.5 rounded-xl mt-4 block"
                              >
                                Continue To Step 2
                              </button>
                            </div>
                          )}

                          {sellerStep === 2 && (
                            <div>
                              <h3 className="text-sm font-extrabold text-white">2. Linking Payout Wallet Node</h3>
                              <p className="text-[11px] text-zinc-400 mt-1 lines-clamp-3 leading-relaxed">
                                Identify which operator hosts your primary wallet. Payouts triggers instantly down the ledger stack after customer handovers.
                              </p>
                              <div className="mt-3 grid grid-cols-3 gap-2">
                                <button className="py-2.5 rounded-xl border border-amber-500 bg-amber-500/10 text-[#ffa500] text-xs font-bold text-center">Airtel ZM</button>
                                <button className="py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-500 text-xs font-bold text-center">MTN ZM</button>
                                <button className="py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-500 text-xs font-bold text-center">Zamtel MoMo</button>
                              </div>
                              <div className="mt-3.5 space-y-2">
                                <label className="block text-[9.5px] text-zinc-400 uppercase font-mono">Mobile Money Recipient Number</label>
                                <input 
                                  type="tel" 
                                  defaultValue="097561928"
                                  className="w-full bg-[#050506] border border-zinc-800 px-3 py-2 text-xs rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                                />
                              </div>
                              <div className="flex gap-2 mt-4">
                                <button 
                                  onClick={() => setSellerStep(1)}
                                  className="w-1/3 bg-zinc-900 border border-zinc-805 text-zinc-400 text-xs font-bold py-2.5 rounded-xl"
                                >
                                  Back
                                </button>
                                <button 
                                  onClick={() => setSellerStep(3)}
                                  className="w-2/3 bg-[#ffa500] text-black text-xs font-bold py-2.5 rounded-xl"
                                >
                                  Continue to Step 3
                                </button>
                              </div>
                            </div>
                          )}

                          {sellerStep === 3 && (
                            <div>
                              <h3 className="text-sm font-extrabold text-white">3. Platform Commissions Agreement</h3>
                              <p className="text-[11px] text-zinc-400 mt-1 lines-clamp-3 leading-relaxed">
                                SeloNaChipa has standard low service rates: 2.5% platform billing with 5.0% commission pools shared securely with community agents.
                              </p>
                              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 mt-3 text-[10px] space-y-1 text-zinc-400 leading-snug">
                                <div className="flex justify-between">
                                  <span>Platform Escrow Node Cost:</span>
                                  <span className="text-white">2.5%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Agent Curation Level:</span>
                                  <span className="text-white">5.0%</span>
                                </div>
                                <div className="flex justify-between font-bold text-amber-500 border-t border-zinc-900 pt-1 mt-1">
                                  <span>Net Vendor Payout Weight:</span>
                                  <span>92.5%</span>
                                </div>
                              </div>
                              <button 
                                onClick={handleSkipSellerSetup}
                                className="w-full bg-[#ffa500] text-black text-xs font-bold py-2.5 rounded-xl mt-4 block"
                              >
                                Accept & Load Merchant Workspace
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        
                        // Active Seller Dashboard Panel
                        <div className="space-y-4 text-left">
                          
                          {/* Financial Panel */}
                          <div className="bg-gradient-to-tr from-[#0c0d12] to-zinc-950/80 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center relative">
                            <div>
                              <span className="text-[10px] text-[#ffa500] tracking-widest font-mono uppercase block mb-1">🏪 Registered Seller Balance</span>
                              <p className="text-2xl font-extrabold text-white">K {sellerBalance.toFixed(2)} ZMW</p>
                            </div>
                            
                            {/* Auto settle configuration */}
                            <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[8px] uppercase tracking-wider text-zinc-400">MoMo Auto-Settle</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10.5px] font-mono text-zinc-400">{autoSettle ? "ONLINE" : "MUTED"}</span>
                                <button 
                                  onClick={() => {
                                    setAutoSettle(!autoSettle);
                                    setToast({
                                      message: autoSettle ? "Auto-Settle Switched Offline" : "Auto-Settle Switched Online",
                                      subText: "Your Mobile Money Node registers automated payout releases instant upon handover."
                                    });
                                  }}
                                  className={`w-7.5 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer ${autoSettle ? "bg-emerald-500" : "bg-zinc-850"}`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded-full bg-black transition-transform ${autoSettle ? "translate-x-3" : "translate-x-0"}`} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* CORE UPLOAD NEW VIDEO LISTING BLOCK */}
                          <div className="bg-[#0c0d12] border border-zinc-800 p-4.5 rounded-2xl space-y-3">
                            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                              <Video className="w-4 h-4 text-[#ffa500]" />
                              <span>Record 15-60s Product Video</span>
                            </h4>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[9.5px] text-zinc-400 mb-1 font-mono uppercase">Product Title</label>
                                <input 
                                  type="text" 
                                  value={uploadTitle}
                                  onChange={(e) => setUploadTitle(e.target.value)}
                                  placeholder="Premium Sweet Potato"
                                  className="w-full bg-[#050506] border border-zinc-800 py-1.5 px-3 text-xs rounded-xl text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9.5px] text-zinc-400 mb-1 font-mono uppercase">Price (ZMW)</label>
                                <input 
                                  type="number" 
                                  value={uploadPrice}
                                  onChange={(e) => setUploadPrice(e.target.value)}
                                  placeholder="75 ZMW"
                                  className="w-full bg-[#050506] border border-zinc-800 py-1.5 px-3 text-xs rounded-xl text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9.5px] text-zinc-400 mb-1 font-mono uppercase">Brief Description / Crop Provenance</label>
                              <textarea 
                                value={uploadDesc}
                                onChange={(e) => setUploadDesc(e.target.value)}
                                placeholder="Harvested directly from our family farm in Choma. Packed with nutrition."
                                rows={2}
                                className="w-full bg-[#050506] border border-zinc-800 py-1.5 px-3 text-[11px] rounded-xl text-white focus:outline-none resize-none"
                              />
                            </div>

                            {/* Camera Video Recorder Simulator Component */}
                            <div className="relative w-full aspect-video rounded-xl bg-zinc-950 overflow-hidden border border-zinc-850 flex flex-col items-center justify-center p-4 font-mono text-center">
                              {/* Video filter backdrop simulation based on active filter */}
                              <div className={`absolute inset-0 transition-all duration-500 z-0 ${
                                activeVideoFilter === "warm" 
                                  ? "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),#09090b)] sepia-[0.35] saturate-150 brightness-[1.08]" 
                                  : activeVideoFilter === "chitenge" 
                                  ? "bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),#09090b)] saturate-[2.1] contrast-[1.22] hue-rotate-[-3deg]" 
                                  : activeVideoFilter === "bw" 
                                  ? "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),#09090b)] grayscale contrast-125" 
                                  : "bg-[radial-gradient(circle_at_center,rgba(9,9,11,0.3),#09090b)]"
                              }`} />

                              {/* Camera Vignette and Glass simulation */}
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_40%,rgba(0,0,0,0.85))] pointer-events-none z-1" />

                              {/* Camera Focus Brackets Overlay (Pointer Events None) */}
                              <div className="absolute inset-4 border border-zinc-850/60 pointer-events-none rounded-lg flex items-center justify-between p-4 z-2">
                                <div className="w-4 h-4 border-t-2 border-l-2 border-zinc-750" />
                                <div className="w-4 h-4 border-t-2 border-r-2 border-zinc-750" />
                              </div>
                              <div className="absolute inset-4 pointer-events-none rounded-lg flex items-end justify-between p-4 z-2">
                                <div className="w-4 h-4 border-b-2 border-l-2 border-zinc-750" />
                                <div className="w-4 h-4 border-b-2 border-r-2 border-zinc-750" />
                              </div>

                              {/* Top-left settings overlay: Microphone and Auto-Captioning Toggles */}
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                                {/* Mic toggle */}
                                <button
                                  type="button"
                                  disabled={isRecordingSimulated}
                                  onClick={() => setIsMicMuted(!isMicMuted)}
                                  className={`px-2 py-1 rounded-lg border flex items-center gap-1 text-[9px] font-black tracking-wider transition-all cursor-pointer ${
                                    isRecordingSimulated 
                                      ? "opacity-60 cursor-not-allowed bg-black/40 border-zinc-900 text-zinc-500"
                                      : isMicMuted
                                      ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                  }`}
                                  title={isMicMuted ? "Audio muted" : "Audio active"}
                                >
                                  {isMicMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                                  <span>{isMicMuted ? "MUTED" : "MIC ON"}</span>
                                </button>

                                {/* Auto-captioning Toggle */}
                                <button
                                  type="button"
                                  disabled={isRecordingSimulated}
                                  onClick={() => setIsCaptionsEnabled(!isCaptionsEnabled)}
                                  className={`px-2 py-1 rounded-lg border flex items-center gap-1 text-[9px] font-black tracking-wider transition-all cursor-pointer ${
                                    isRecordingSimulated
                                      ? "opacity-60 cursor-not-allowed bg-black/40 border-zinc-900 text-zinc-500"
                                      : isCaptionsEnabled
                                      ? "bg-purple-500/15 border-purple-500/40 text-purple-400 hover:bg-purple-500/25 animate-pulse"
                                      : "bg-zinc-800/50 border-zinc-700/40 text-zinc-400 hover:bg-zinc-800"
                                  }`}
                                  title="AI Auto-Captioning toggle"
                                >
                                  <Captions className="w-3 h-3" />
                                  <span>{isCaptionsEnabled ? "AI CC ON" : "CC OFF"}</span>
                                </button>

                                {/* AI Noise Reduction Toggle */}
                                <button
                                  type="button"
                                  disabled={isRecordingSimulated}
                                  onClick={() => setIsNoiseReductionEnabled(!isNoiseReductionEnabled)}
                                  className={`px-2 py-1 rounded-lg border flex items-center gap-1 text-[9px] font-black tracking-wider transition-all cursor-pointer ${
                                    isRecordingSimulated
                                      ? "opacity-60 cursor-not-allowed bg-black/40 border-zinc-900 text-zinc-500"
                                      : isNoiseReductionEnabled
                                      ? "bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25"
                                      : "bg-zinc-800/50 border-zinc-700/40 text-zinc-400 hover:bg-zinc-800"
                                  }`}
                                  title="Toggle AI audio background noise suppression"
                                >
                                  <Volume2 className="w-3 h-3 text-amber-500" />
                                  <span>{isNoiseReductionEnabled ? "AI NOISE SUPPRESSED" : "RAW MIC"}</span>
                                </button>
                              </div>

                              {/* Dynamic 4K / HD Quality Label Selector Overlay */}
                              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur border border-zinc-800 px-2 py-1 rounded-lg flex items-center gap-1.5 z-10 text-[9px] font-black">
                                <button 
                                  type="button"
                                  disabled={isRecordingSimulated}
                                  onClick={() => setSelectedQuality("HD")} 
                                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${isRecordingSimulated ? "opacity-50" : ""} ${selectedQuality === "HD" ? "text-emerald-400 bg-emerald-500/10 font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                  HD
                                </button>
                                <span className="text-zinc-800 font-normal">|</span>
                                <button 
                                  type="button"
                                  disabled={isRecordingSimulated}
                                  onClick={() => setSelectedQuality("4K")} 
                                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${isRecordingSimulated ? "opacity-50" : ""} ${selectedQuality === "4K" ? "text-[#ffa500] bg-amber-500/10 font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                  4K
                                </button>
                              </div>

                              {isRecordingSimulated ? (
                                <div className="w-full h-full flex flex-col justify-between p-2 z-10 relative">
                                  {/* Recording status blinker */}
                                  <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold self-start bg-black/60 px-2 py-0.5 rounded-full select-none">
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
                                    <span>● REC ({selectedQuality})</span>
                                  </div>

                                  {/* Simulated Shutter/Lens Ring Indicator */}
                                  <div className="my-auto flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-red-500 animate-spin flex items-center justify-center text-red-400" style={{ animationDuration: "12s" }}>
                                      <Video className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] text-zinc-350 mt-2 font-mono tracking-wide uppercase">
                                      CAPTURING {activeVideoFilter !== "none" ? `${activeVideoFilter.toUpperCase()} ` : ""}FEED
                                    </span>
                                  </div>

                                  {/* AI Captions - Live Transcribing Status */}
                                  {isCaptionsEnabled && (
                                    <div className="absolute bottom-[64px] left-1/2 -translate-x-1/2 w-[85%] bg-black/80 border border-purple-500/30 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-2 justify-center shadow-lg animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping shrink-0" />
                                      <span className="text-[9px] text-purple-300 font-extrabold tracking-widest uppercase">
                                        Transcribing...
                                      </span>
                                    </div>
                                  )}

                                  {/* Countdown details & Progress Bar */}
                                  <div className="space-y-1.5 w-full bg-black/40 p-2 rounded-lg border border-zinc-900/40">
                                    <div className="flex justify-between text-[10.5px] font-mono text-zinc-300">
                                      <span className="text-zinc-500">TIME REMAINING:</span>
                                      <span className="text-red-400 font-extrabold animate-pulse">
                                        00:{recordedVideoSeconds < 10 ? `0${recordedVideoSeconds}` : recordedVideoSeconds}
                                      </span>
                                    </div>
                                    <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                                      <div 
                                        className="bg-gradient-to-r from-red-500 to-amber-500 h-1.5 rounded-full transition-all duration-100 ease-linear"
                                        style={{ width: `${((60 - recordedVideoSeconds) / 60) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : hasRecordedVideo ? (
                                <div className="w-full h-full flex flex-col justify-between p-2 z-10 relative">
                                  {/* Playback Badge */}
                                  <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold self-start bg-black/60 px-2 py-0.5 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                    <span>✓ STANDBY READINESS ({selectedQuality})</span>
                                  </div>

                                  {/* Simulated player / status indicator */}
                                  <div className="my-auto flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h5 className="text-[11px] font-bold text-white tracking-widest uppercase">
                                      Video Certified ({activeVideoFilter !== "none" ? activeVideoFilter.toUpperCase() : "NORMAL"})
                                    </h5>
                                    <p className="text-[9px] text-zinc-400 mt-1">Ready to sync with mobile and social feeds</p>
                                  </div>

                                  {/* Post-Recording CC Overlay Preview */}
                                  {isCaptionsEnabled && transcribedText && (
                                    <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 w-[90%] bg-black/85 border border-purple-500/20 px-3 py-1.5 rounded-lg text-center shadow-lg leading-snug z-20">
                                      <div className="text-[8px] text-purple-400 font-black uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5" />
                                        <span>AI Generated Auto-Captions</span>
                                      </div>
                                      <p className="text-[10px] text-yellow-300 font-bold tracking-wide font-sans italic leading-tight">
                                        {transcribedText}
                                      </p>
                                    </div>
                                  )}

                                  {/* Pro action bar for Drafted video */}
                                  <div className="flex items-center gap-2 justify-center w-full">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHasRecordedVideo(false);
                                        startSimulatedRecording();
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-950/70 border border-red-900/60 text-red-400 text-[10px] font-extrabold rounded-lg font-mono tracking-wider cursor-pointer transition-colors"
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      <span>RETAKE VIDEO</span>
                                    </button>

                                    <div className="text-[9px] text-zinc-500 font-mono bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                                      Draft Saved
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2 z-10 relative">
                                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 shadow mb-1">
                                    <Video className="w-5 h-5 text-zinc-400" />
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={startSimulatedRecording}
                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border border-red-500/20 text-[10.5px] font-extrabold rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer font-mono tracking-wider uppercase transition-all hover:scale-105 active:scale-95"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                    <span>Initialize Camera</span>
                                  </button>
                                  <p className="text-[9px] text-zinc-500 max-w-[200px] leading-relaxed">
                                    Record 60s product reel with auto-optimized dynamic frames
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Aesthetic Filter Selection Bar */}
                            <div className="bg-[#050506] border border-zinc-850 p-2.5 rounded-xl flex flex-col gap-1.5 z-10 font-mono">
                              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider px-1 flex items-center gap-1">
                                <Filter className="w-3 h-3 text-zinc-500" />
                                <span>Aesthetic Video Tone:</span>
                              </span>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[
                                  { id: "none", label: "Normal", desc: "Standard feed" },
                                  { id: "warm", label: "Warm Sun", desc: "Amber sepia" },
                                  { id: "chitenge", label: "Chitenge", desc: "Vivid saturation" },
                                  { id: "bw", label: "B&W Mono", desc: "Monochrome" }
                                ].map(f => (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setActiveVideoFilter(f.id)}
                                    className={`px-1.5 py-1 text-left rounded-lg border text-[10px] cursor-pointer transition-all ${
                                      activeVideoFilter === f.id
                                        ? "bg-amber-500/10 border-amber-500/60 text-amber-400 shadow-sm"
                                        : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:bg-[#0c0d12] hover:text-white"
                                    }`}
                                  >
                                    <div className="font-extrabold flex items-center gap-0.5 truncate text-[9.5px]">
                                      {activeVideoFilter === f.id && <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />}
                                      {f.label}
                                    </div>
                                    <div className="text-[7.5px] text-zinc-500 truncate leading-tight mt-0.5">{f.desc}</div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              disabled={!uploadTitle || !uploadPrice || isRecordingSimulated}
                              onClick={handleAddListing}
                              className="w-full bg-[#ffa500] disabled:opacity-40 text-black font-extrabold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-4 h-4 text-black stroke-[3px]" />
                              <span>Publish Video Listing Live</span>
                            </motion.button>
                          </div>

                          {/* LIST OF ENTRUSTED MERCHANDISE */}
                          <div>
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">My Active Products</h4>
                            <div className="space-y-2">
                              {listings.filter(l => l.seller_id === "sel-chipo").map(lst => (
                                <div key={lst.listing_id} className="bg-[#0c0d12] border border-zinc-800 p-3 rounded-xl flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-[#ffa500]/10 border border-[#ffa500]/25 flex items-center justify-center text-sm shrink-0">
                                      {lst.thumbnail === "🌽" ? "🌽" : lst.thumbnail === "🐟" ? "🐟" : "🎥"}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-white pr-2 line-clamp-1">{lst.title}</p>
                                      <p className="text-[9.5px] text-zinc-500 font-mono mt-0.5">K {lst.suggested_price}.00 • {lst.provenance || "Verifying"}</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[9.5px] uppercase font-mono tracking-wider font-extrabold bg-[#ffa500]/10 border border-[#ffa500]/20 px-1.5 py-0.5 rounded text-[#ffa500]">
                                      {lst.status || "live"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ======================================= */}
                  {/* MODULE C: AGENT CONSOLE (VETTING & AUDIT) */}
                  {/* ======================================= */}
                  {selectedRole === "AGENT" && (
                    <AgentPortal
                      orders={orders}
                      setOrders={setOrders}
                      listings={listings}
                      setListings={setListings}
                      savedLocations={savedLocations}
                      setSavedLocations={setSavedLocations}
                      recentLocations={recentLocations}
                      setRecentLocations={setRecentLocations}
                      parcelJobs={parcelJobs}
                      setParcelJobs={setParcelJobs}
                      agentCommission={agentCommission}
                      setAgentCommission={setAgentCommission}
                      onSpawnToast={(t) => setToast(t)}
                      adminConfig={adminConfig}
                      ledger={ledger}
                      setLedger={setLedger}
                    />
                  )}


                  {/* ======================================= */}
                  {/* MODULE D: RIDER CONSOLE (DISPATCH INTEGRATION) */}
                  {/* ======================================= */}
                  {selectedRole === "RIDER" && (
                    <div className="h-full flex flex-col text-zinc-200 text-left relative bg-[#040507]">
                      <RiderPortal
                        orders={orders}
                        setOrders={setOrders}
                        ledger={ledger}
                        setLedger={setLedger}
                        parcelJobs={parcelJobs}
                        setParcelJobs={setParcelJobs}
                        onSpawnToast={(t) => setToast({ message: t.message, subText: t.subText })}
                      />
                    </div>
                  )}

                </div>

                {/* 3. CORE SECURE LEDGER SYSTEM LOGS IN THE BACKEND */}
                {/* Visualizing the "Infinity Ledger Console" behind-the-scenes data logs as requests and orders progress */}
                <div className="bg-[#0c0d12] border-t border-zinc-900 p-3 text-left">
                  <div className="flex justify-between items-center pb-1.5">
                    <span className="text-[9.5px] uppercase font-mono tracking-widest text-[#ffa500] font-extrabold flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#ffa500]" />
                      <span>Infinity Ledger Backend Diagnostics</span>
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 bg-[#050506] border border-zinc-900 px-1 py-0.5 rounded">
                      BLOCKHASH SHARDS ACTIVE
                    </span>
                  </div>
                  <div className="bg-[#050506] p-2 rounded-xl text-[9px] font-mono text-zinc-400 space-y-1 h-[72px] overflow-y-auto scrollbar-none border border-zinc-950">
                    {ledger.map((ld, i) => (
                      <div key={i} className="flex justify-between hover:text-white items-center leading-none py-0.5">
                        <span className="text-[#ffa500]">[{ld.action}]</span>
                        <span className="text-zinc-500 max-w-[140px] truncate pr-1">{ld.product_title || "Regulatory Protocol"}</span>
                        <span className="text-indigo-400 text-[8.5px]">{ld.tx_id}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* GLOBAL PERSISTENT THEME SWITCHER PILL (FLOATING) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <button
          onClick={() => {
            setIsLightTheme(!isLightTheme);
            setToast({
              message: `THEME: ${!isLightTheme ? "Airtel Mode" : "Cosmic Dark"} 🌓`,
              subText: "Adjusting interface contrasts and color schemes globally."
            });
          }}
          className={`px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transition-all duration-300 font-extrabold text-[11px] uppercase tracking-wider border outline-none ${
            isLightTheme 
              ? "bg-[#e11919] hover:bg-[#b01010] text-white border-red-500 shadow-red-500/20" 
              : "bg-zinc-900 hover:bg-zinc-800 text-amber-500 border-zinc-800 shadow-black/50"
          }`}
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          {isLightTheme ? (
            <>
              <Sun className="w-4 h-4 text-white animate-spin-slow" />
              <span>Airtel Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Cosmic Dark Mode</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
