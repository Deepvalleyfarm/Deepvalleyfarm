import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Shield, Plus, CheckCircle2, ChevronRight, X, AlertTriangle, 
  Search, FileText, Download, Check, MapPin, DollarSign, ArrowUpRight, 
  Sliders, Navigation, ArrowRight, Heart, Share2, HelpCircle, RefreshCw, Key, LogOut, Trash
} from "lucide-react";
import { Listing, Order, SavedLocation, ParcelJob, LedgerRecord, Rider } from "../../types";
import SeloWizard from "../SeloWizard";
import { hasValidGoogleMapsKey, getGoogleMapsApiKey, computeRoute } from "../../services/googleMapsService";
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { WithdrawalModal } from "../WithdrawalModal";

interface AgentPortalProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  listings: Listing[];
  setListings: React.Dispatch<React.SetStateAction<Listing[]>>;
  savedLocations: SavedLocation[];
  setSavedLocations: React.Dispatch<React.SetStateAction<SavedLocation[]>>;
  recentLocations: SavedLocation[];
  setRecentLocations: React.Dispatch<React.SetStateAction<SavedLocation[]>>;
  parcelJobs: ParcelJob[];
  setParcelJobs: React.Dispatch<React.SetStateAction<ParcelJob[]>>;
  agentCommission: number;
  setAgentCommission: React.Dispatch<React.SetStateAction<number>>;
  onSpawnToast: (toast: { message: string; subText?: string }) => void;
  adminConfig: any;
  ledger: LedgerRecord[];
  setLedger: React.Dispatch<React.SetStateAction<LedgerRecord[]>>;
}

export default function AgentPortal({
  orders,
  setOrders,
  listings,
  setListings,
  savedLocations,
  setSavedLocations,
  recentLocations,
  setRecentLocations,
  parcelJobs,
  setParcelJobs,
  agentCommission,
  setAgentCommission,
  onSpawnToast,
  adminConfig,
  ledger,
  setLedger
}: AgentPortalProps) {
  // Authentication & Verification state
  const [currentUserPin, setCurrentUserPin] = useState<string>("4321"); // Secret Agent default PIN
  const [typedPin, setTypedPin] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isResetFlow, setIsResetFlow] = useState<boolean>(false);
  
  // Security Reset state (Must answer three questions perfectly)
  const [resetQ1, setResetQ1] = useState<string>("");
  const [resetQ2, setResetQ2] = useState<string>("");
  const [resetQ3, setResetQ3] = useState<string>("");
  const [newPinCode, setNewPinCode] = useState<string>("");
  const [resetStatus, setResetStatus] = useState<string>("");

  // Tabs
  // Bottom tabs: "HOME", "SELLERS", "LISTINGS", "ORDERS", "EARNINGS", "PARCELS", "MAP", "SETTINGS"
  const [activeTab, setActiveTab] = useState<"HOME" | "SELLERS" | "LISTINGS" | "ORDERS" | "EARNINGS" | "PARCELS" | "MAP" | "SETTINGS">("HOME");
  
  // Dashboard segment toggle: "NOTIFICATIONS" | "SYSTEM"
  const [dashboardSegment, setDashboardSegment] = useState<"NOTIFICATIONS" | "SYSTEM">("NOTIFICATIONS");
  
  // Sellers Tab segmented control: "DIRECTORY" | "PIPELINE"
  const [sellersSegment, setSellersSegment] = useState<"DIRECTORY" | "PIPELINE">("DIRECTORY");

  // Orders Tab Segmented Control: "AWAITING" | "TRANSIT" | "SETTLED"
  const [ordersSegment, setOrdersSegment] = useState<"AWAITING" | "TRANSIT" | "SETTLED">("AWAITING");

  // Counter-offer / Pricing Consent state
  const [selectedOfferOrder, setSelectedOfferOrder] = useState<Order | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState<string>("");

  // Add Listing Modal
  const [isAddListingOpen, setIsAddListingOpen] = useState<boolean>(false);
  const [addStep, setAddStep] = useState<number>(1);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("Fresh produce");
  const [newPrice, setNewPrice] = useState<number>(45);
  const [newDesc, setNewDesc] = useState<string>("");
  const [selectedStockIcon, setSelectedStockIcon] = useState<string>("🌽");
  const [selectedZone, setSelectedZone] = useState<string>("Lusaka Central");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Hardcoded onboarding prospective sellers (Pipeline)
  const [pipelineSellers, setPipelineSellers] = useState([
    { id: "pipe-1", name: "Ngosa Farms Ltd", category: "Poultry & Eggs", certificate: "CERT-COA-8812.pdf", taxId: "10098322-1", taxStatus: "Pending", phone: "+260 97 122 334" },
    { id: "pipe-2", name: "Copperbelt Organic Soils", category: "Fertilizer & Lime", certificate: "CERT-ZRA-3240.pdf", taxId: "24419080-3", taxStatus: "Verified", phone: "+260 96 445 612" },
    { id: "pipe-3", name: "Chipata Groundnuts Cooperative", category: "Grains & Nuts", certificate: "Missing Document", taxId: "None Provided", taxStatus: "Missing", phone: "+260 95 918 801" }
  ]);

  // Registered active sellers (Directory)
  const [registeredSellers, setRegisteredSellers] = useState([
    { id: "sel-chipo", name: "Chipo Mwansa", shop: "Chisamba Maize Stores", category: "Cereals & Maize", commission: 12, sales: 8430, status: "Active" },
    { id: "sel-kabwa", name: "Fred Kabwe", shop: "Lake Kariba Bream", category: "Fish & Seafood", commission: 15, sales: 12400, status: "Active" },
    { id: "sel-muzba", name: "Grace Muzbanya", shop: "Lusaka Honey Dist", category: "Honey & Beeswax", commission: 10, sales: 3200, status: "On Hold" },
    { id: "sel-tembo", name: "Banda Tembo", shop: "Kanyama Fertilizer Market", category: "Chemicals", commission: 18, sales: 900, status: "Archived" }
  ]);

  // Withdrawal form modal
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawProvider, setWithdrawProvider] = useState<"Airtel" | "MTN" | "Zamtel">("Airtel");
  const [withdrawPhone, setWithdrawPhone] = useState<string>("+260 97 ");

  // Parcel dispatches filter and dispatch form
  const [parcelSearch, setParcelSearch] = useState<string>("");
  const [parcelSender, setParcelSender] = useState<string>("");
  const [parcelSenderSellerId, setParcelSenderSellerId] = useState<string>("");
  const [parcelRecipient, setParcelRecipient] = useState<string>("");
  const [parcelRecipientPhone, setParcelRecipientPhone] = useState<string>("");
  const [parcelWeight, setParcelWeight] = useState<number>(1);
  const [parcelValue, setParcelValue] = useState<string>("Maize seed samples");
  const [parcelZone, setParcelZone] = useState<string>("Lusaka Central");
  const [parcelSpeed, setParcelSpeed] = useState<"Express" | "Standard">("Standard");

  // Detailed routing map logistics coordinates and tooltips
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);

  // Settings profile security controls
  const [profileName, setProfileName] = useState<string>("Luka Mwamba");
  const [profileLocation, setProfileLocation] = useState<string>("Lusaka Regional Hub");
  const [appCurrency, setAppCurrency] = useState<string>("ZMW (K)");
  const [enableMapVectors, setEnableMapVectors] = useState<boolean>(true);
  const [settingsOldPin, setSettingsOldPin] = useState<string>("");
  const [settingsNewPin, setSettingsNewPin] = useState<string>("");

  // Stock options
  const stockIcons = ["🌽", "🐟", "🥩", "🥬", "🍅", "🚜", "🎒", "🧥", "📱", "🔋", "🚲", "🧱", "🥥", "🧺", "🩺"];
  const zonesList = ["Lusaka Central", "Kabwata", "Chilenje", "Woodlands", "Matero", "Chaisa", "Kanyama", "Libala", "Avondale", "Chilenje South"];

  // Authenticate PIN
  const handlePinDigitTap = (digit: string) => {
    if (typedPin.length < 4) {
      const nextTyped = typedPin + digit;
      setTypedPin(nextTyped);
      if (nextTyped === currentUserPin) {
        setTimeout(() => {
          setIsUnlocked(true);
          onSpawnToast({ message: "ACCESS GRANTED", subText: "Welcome back Luka Mwamba" });
          setTypedPin("");
        }, 300);
      } else if (nextTyped.length === 4) {
        // Failed attempt after brief freeze
        setTimeout(() => {
          setTypedPin("");
          onSpawnToast({ message: "INVALID PIN CODE", subText: "Please refer to security question recovery." });
        }, 300);
      }
    }
  };

  // Recover Pin with answers
  const handlePinResetAction = () => {
    // Correct answers are Buster, Lusaka, Leopard
    if (
      resetQ1.trim().toLowerCase() === "buster" &&
      resetQ2.trim().toLowerCase() === "lusaka" &&
      resetQ3.trim().toLowerCase() === "leopard"
    ) {
      if (newPinCode.length === 4 && /^\d+$/.test(newPinCode)) {
        setCurrentUserPin(newPinCode);
        setResetStatus("");
        setIsResetFlow(false);
        setTypedPin("");
        onSpawnToast({ message: "PIN RESET SUCCESSFUL", subText: `Your new access PIN code is now ${newPinCode}.` });
      } else {
        setResetStatus("Error: PIN must be exactly 4 digits.");
      }
    } else {
      setResetStatus("Answers do not match our records. Verification failed.");
    }
  };

  // Counters
  const countAwaiting = orders.filter(o => o.transit_status === "pending_seller_confirmation").length;
  const countTransit = orders.filter(o => o.transit_status === "rider_assigned" || o.transit_status === "picked_up" || o.transit_status === "out_for_delivery").length;
  const countSettled = orders.filter(o => o.transit_status === "delivered").length;

  const handleCustomPricingPublish = () => {
    if (!selectedOfferOrder) return;
    const updatePrice = parseFloat(counterPriceInput);
    if (isNaN(updatePrice) || updatePrice <= 0) {
      onSpawnToast({ message: "Invalid Counter Offer Price", subText: "Please input a positive numeric value." });
      return;
    }
    // Update matching order
    setOrders(prev => prev.map(o => o.order_id === selectedOfferOrder.order_id 
      ? { ...o, product_price: updatePrice, transit_status: "rider_assigned" } 
      : o));
    
    // Add transaction ledger log
    const fee = updatePrice * 0.05;
    const newTx: LedgerRecord = {
      tx_id: `TX-CTR-${Math.floor(Math.random() * 900000 + 100000)}`,
      order_id: selectedOfferOrder.order_id,
      amount_zmw: updatePrice,
      action: "COUNTERPRICE_ACCEPTED",
      product_title: selectedOfferOrder.product_title,
      fees: {
        escrow_mobile_money: fee,
        platform_listing: 1.5,
        rider_share: 5,
        social_fund: 0.5,
        platform_rider_commission: 1
      },
      timestamp: new Date().toISOString()
    };
    setLedger(prev => [newTx, ...prev]);
    onSpawnToast({ message: "COUNTER ASSENT FILED", subText: `Consented price set to K ${updatePrice} ZMW. Assigned to dispatch.` });
    setSelectedOfferOrder(null);
  };

  // Submit manual listing
  const handlePublishListing = () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      onSpawnToast({ message: "Missing Fields", subText: "Title and description copy must be filled." });
      return;
    }
    setIsPublishing(true);
    setTimeout(() => {
      const generatedId = `lst-gen-${Math.floor(Math.random() * 900 + 100)}`;
      const item: Listing = {
        listing_id: generatedId,
        title: newTitle,
        description: newDesc,
        suggested_price: newPrice,
        category: newCategory,
        location: `${selectedZone} Ward, Lusaka`,
        distance_km: Math.floor(Math.random() * 12) + 2,
        seller_id: parcelSenderSellerId || "sel-chipo", // Selected partner shop
        video_url: "https://assets.mixkit.co/videos/preview/mixkit-vegetables-on-a-market-stall-40502-large.mp4",
        thumbnail: selectedStockIcon,
        views: 0,
        likes: 0,
        shares: 0,
        provenance: "Verified Storefront",
        status: "live"
      };

      setListings(prev => [item, ...prev]);
      
      // Add ledger transaction log
      const newTx: LedgerRecord = {
        tx_id: `TX-LST-${Math.floor(Math.random() * 90000 + 10000)}`,
        order_id: generatedId,
        amount_zmw: 1.5, // Listing fee
        action: "LISTING_PUBLISH_FEE",
        product_title: newTitle,
        timestamp: new Date().toISOString()
      };
      setLedger(prev => [newTx, ...prev]);

      setIsPublishing(false);
      setIsAddListingOpen(false);
      // Reset form
      setNewTitle("");
      setNewDesc("");
      setAddStep(1);
      onSpawnToast({ message: "INVENTORY CERTIFIED", subText: `Successfully registered 1x ${newTitle} into buyer marketplace feeds.` });
    }, 1200);
  };

  // Pipeline seller action
  const handleApprovePipelineSeller = (id: string) => {
    const seller = pipelineSellers.find(s => s.id === id);
    if (!seller) return;
    // Add to registered directory
    setRegisteredSellers(prev => [
      ...prev,
      {
        id: `sel-gen-${Math.floor(Math.random() * 900 + 100)}`,
        name: seller.name,
        shop: seller.name,
        category: seller.category,
        commission: 15, // default
        sales: 0,
        status: "Active"
      }
    ]);
    // Remove from pipeline
    setPipelineSellers(prev => prev.filter(s => s.id !== id));
    onSpawnToast({ message: "ONBOARDING ENGAGED", subText: `${seller.name} has been certified and added to active seller directory.` });
  };

  // Submit Manual parcel
  const handleAddParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelSender.trim() || !parcelRecipient.trim() || !parcelRecipientPhone.trim()) {
      onSpawnToast({ message: "Missing Parcel Fields", subText: "Please fill sender, receiver, and contact number." });
      return;
    }

    const dist = Math.floor(Math.random() * 14) + 2;
    const baseDev = 15;
    const kmAdd = dist * 2.5;
    const totalFee = baseDev + kmAdd;
    const platFee = totalFee * 0.1;
    const riderP = totalFee - platFee;

    const newParcel: ParcelJob = {
      parcel_id: `PAR-${Math.floor(Math.random() * 900000 + 100000)}`,
      sender_id: "agent-luka",
      sender_name: parcelSender,
      sender_role: "AGENT",
      sender_seller_id: parcelSenderSellerId || undefined,
      description: parcelValue,
      weight_kg: parcelWeight,
      collection_address: `${profileLocation}, Lusaka`,
      delivery_address: `${parcelZone} Loop, Lusaka`,
      delivery_city: "Lusaka",
      recipient_name: parcelRecipient,
      recipient_phone: parcelRecipientPhone,
      is_registered_recipient: false,
      delivery_fee: totalFee,
      platform_fee: platFee,
      processing_fee: 1.5,
      grand_total: totalFee + 1.5,
      payment_wallet: "Airtel",
      status: "searching_rider",
      distance_km: dist,
      created_at: new Date().toISOString()
    };

    setParcelJobs(prev => [newParcel, ...prev]);
    onSpawnToast({ message: "PARCEL ENCRYPTED & SAVED", subText: `Reference ${newParcel.parcel_id} registered. Dynamic delivery charge of K ${totalFee.toFixed(2)} split with courier rider.` });
    
    // Clear inputs
    setParcelSender("");
    setParcelRecipient("");
    setParcelRecipientPhone("");
  };

  // Withdrawal processing
  const handleProcessWithdraw = () => {
    if (withdrawAmount <= 0) {
      onSpawnToast({ message: "Invalid Amount", subText: "Please set a positive value." });
      return;
    }
    const realHold = agentCommission * 0.95; // net after platform fee deduction
    if (withdrawAmount > realHold) {
      onSpawnToast({ message: "Funds Lock", subText: "Amount exceeds your net real commission balances." });
      return;
    }

    setAgentCommission(prev => prev - withdrawAmount);
    
    // Record ledger outflow log
    const outTx: LedgerRecord = {
      tx_id: `TX-WD-${Math.floor(Math.random() * 900000 + 100000)}`,
      order_id: `ORDER-WD-${Math.floor(Math.random() * 900 + 100)}`,
      amount_zmw: withdrawAmount,
      action: "AGENT_COMMISSION_CASHOUT",
      payout_destination: `${withdrawProvider} Mobile Wallet: ${withdrawPhone}`,
      timestamp: new Date().toISOString()
    };
    setLedger(prev => [outTx, ...prev]);

    setIsWithdrawOpen(false);
    onSpawnToast({ message: "DISBURSEMENT SETTLED", subText: `K ${withdrawAmount} instantly deposited into mobile wallet.` });
  };

  // Dynamic values
  const totalCommThisMonth = agentCommission;
  const commNetDeducted = totalCommThisMonth * 0.95; // net after 5% Platform fee
  const lockedEscrowTransit = orders
    .filter(o => o.escrow_status === "locked")
    .reduce((prev, curr) => prev + (curr.product_price * curr.quantity), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050506] text-zinc-100 overflow-hidden font-sans relative">
      
      {/* 1. AGENT PIN ACCESS BARRIER SCREEN */}
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050506]/98 z-50 flex flex-col justify-between items-center p-6 text-center select-none"
          >
            {/* Header branding */}
            <div className="w-full text-center mt-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto text-xl font-bold font-mono">
                👔
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider font-mono text-zinc-400">
                Selonachipa Agent Gateway
              </h2>
              <span className="text-[10px] text-zinc-550 block">Zambian Curation Hub Verified</span>
            </div>

            {/* Avatar block */}
            <div className="flex flex-col items-center">
              {!isResetFlow ? (
                <>
                  <div className="w-16 h-16 rounded-full border border-teal-500/25 bg-teal-500/10 flex items-center justify-center text-xl font-bold text-teal-400 shadow-xl">
                    LM
                  </div>
                  <h3 className="text-[15px] font-black tracking-tight text-white mt-3 font-mono">Luka Mwamba</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">District Curation Supervisor</p>

                  {/* Four masked bullets in a row */}
                  <div className="flex justify-center items-center gap-4 mt-8">
                    {[0, 1, 2, 3].map((idx) => (
                      <div 
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full border transition-all ${
                          typedPin.length > idx 
                            ? "bg-teal-400 border-teal-400 scale-110" 
                            : "bg-zinc-950 border-zinc-800"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Simplified numeric grid pad */}
                  <div className="grid grid-cols-3 gap-3.5 max-w-[240px] w-full mt-10">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePinDigitTap(num)}
                        className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-850 active:scale-95 text-white font-extrabold text-sm border border-zinc-850/45 cursor-pointer flex items-center justify-center mx-auto transition-all"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setIsResetFlow(true);
                        setResetStatus("");
                      }}
                      className="text-[9.5px] text-zinc-500 hover:text-white flex items-center justify-center font-bold"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handlePinDigitTap("0")}
                      className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-850 active:scale-95 text-white font-extrabold text-sm border border-zinc-850/45 cursor-pointer flex items-center justify-center mx-auto transition-all"
                    >
                      0
                    </button>
                    <button
                      onClick={() => setTypedPin("")}
                      className="text-[9.5px] text-zinc-500 hover:text-white flex items-center justify-center font-bold"
                    >
                      Clear
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsResetFlow(true);
                      setResetStatus("");
                    }}
                    className="text-[10.5px] font-medium text-teal-400/90 underline cursor-pointer mt-8"
                  >
                    Forgot PIN? Reset with security questions
                  </button>
                </>
              ) : (
                <div className="max-w-[310px] space-y-4 p-4 border border-zinc-850 rounded-2xl bg-zinc-950/80 animate-fade">
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                    <Key className="w-4 h-4 text-purple-400" />
                    <span className="text-xs uppercase font-mono font-bold text-white">Three-Question PIN Recovery</span>
                  </div>

                  {resetStatus && (
                    <div className="text-[10px] text-red-400 font-mono text-center leading-tight bg-red-500/5 p-2 rounded border border-red-500/10">
                      ⚠️ {resetStatus}
                    </div>
                  )}

                  <div className="space-y-3 pb-2 text-left">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-zinc-500">Q1. What was the name of your first pet?</label>
                      <input 
                        type="text" 
                        placeholder="Type answer here..."
                        value={resetQ1}
                        onChange={(e) => setResetQ1(e.target.value)}
                        className="w-full bg-[#0c0d12] border border-zinc-850 px-2 py-1 text-xs text-white rounded-lg focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-zinc-500">Q2. What is your favorite Zambian city?</label>
                      <input 
                        type="text" 
                        placeholder="Type answer here..."
                        value={resetQ2}
                        onChange={(e) => setResetQ2(e.target.value)}
                        className="w-full bg-[#0c0d12] border border-zinc-850 px-2 py-1 text-xs text-white rounded-lg focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-zinc-500">Q3. What was your high school mascot?</label>
                      <input 
                        type="text" 
                        placeholder="Type answer here..."
                        value={resetQ3}
                        onChange={(e) => setResetQ3(e.target.value)}
                        className="w-full bg-[#0c0d12] border border-zinc-850 px-2 py-1 text-xs text-white rounded-lg focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-1 pt-1.5 border-t border-zinc-900">
                      <label className="text-[9.5px] font-mono text-emerald-400 font-bold">Declare New 4-digit PIN</label>
                      <input 
                        type="text" 
                        maxLength={4}
                        placeholder="digits only..."
                        value={newPinCode}
                        onChange={(e) => setNewPinCode(e.target.value)}
                        className="w-full bg-[#050506] border border-emerald-500/25 px-2 py-1 text-xs font-mono text-emerald-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsResetFlow(false)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-xs py-2 rounded-xl"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handlePinResetAction}
                      className="flex-1 bg-purple-500 font-bold text-black text-xs py-2 rounded-xl"
                    >
                      Apply PIN Set
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[9.5px] text-zinc-650 italic">
              Airtel / MTN / Zamtel secure integration enabled
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN HEADER PLATFORM */}
      <div className="shrink-0 bg-[#0c0d12] border-b border-zinc-850 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/25 text-teal-400 flex items-center justify-center text-md font-bold font-mono">
            👔
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wider text-white uppercase font-mono">
              Selonachipa Agent Console
            </h4>
            <span className="text-[9px] text-zinc-400 block mt-0.5">
              Territorial Hub: <strong>{profileLocation}</strong>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setIsUnlocked(false);
              onSpawnToast({ message: "SECURE LOGOUT", subText: "Active agent session terminated successfully." });
            }}
            className="p-1 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title="Lock screen"
          >
            <LogOut className="w-3 h-3 text-red-500" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* 3. CORE STAT CARD PANELS HEADER METRICS (Always visible above tabs content) */}
      {isUnlocked && (
        <div className="bg-[#050506] p-3 border-b border-zinc-900 shrink-0 select-none">
          <div className="grid grid-cols-4 gap-2">
            {/* Net Commissions */}
            <div 
              onClick={() => setActiveTab("EARNINGS")}
              className="bg-[#0c0d12] border border-zinc-850 p-2 rounded-xl text-left cursor-pointer hover:border-teal-500/25 transition-all"
            >
              <span className="text-[7.5px] text-zinc-500 block font-mono font-bold">MONTH NET COM</span>
              <span className="text-xs font-extrabold text-white font-mono">K {commNetDeducted.toFixed(2)}</span>
              <span className="text-[7px] text-zinc-650 block mt-0.5 font-sans leading-none">After 5% Plat fee</span>
            </div>

            {/* Pending actions */}
            <div 
              onClick={() => setActiveTab("ORDERS")}
              className="bg-[#0c0d12] border border-zinc-850 p-2 rounded-xl text-left cursor-pointer hover:border-[#ffa500]/25 transition-all"
            >
              <span className="text-[7.5px] text-[#ffa500] block font-mono font-bold">PENDING ORDERS</span>
              <span className="text-xs font-extrabold text-white font-mono">{countAwaiting} items</span>
              <span className="text-[7px] text-zinc-650 block mt-0.5 leading-none">Awaiting Consent</span>
            </div>

            {/* Active Inventory */}
            <div 
              onClick={() => setActiveTab("LISTINGS")}
              className="bg-[#0c0d12] border border-zinc-850 p-2 rounded-xl text-left cursor-pointer hover:border-purple-500/25 transition-all"
            >
              <span className="text-[7.5px] text-[#ffa500] block font-mono font-bold font-extrabold">ACTIVE LISTS</span>
              <span className="text-xs font-extrabold text-white font-mono">{listings.length} live</span>
              <span className="text-[7px] text-zinc-650 block mt-0.5 leading-none">All Sellers</span>
            </div>

            {/* Locked Escrow Transit */}
            <div 
              onClick={() => setActiveTab("ORDERS")}
              className="bg-[#0c0d12] border border-emerald-500/10 p-2 rounded-xl text-left cursor-pointer hover:border-emerald-500/20 transition-all"
            >
              <span className="text-[7.5px] text-emerald-400 block font-mono font-bold">TRANSIT ESCROW</span>
              <span className="text-xs font-extrabold text-emerald-400 font-mono">K {lockedEscrowTransit.toFixed(2)}</span>
              <span className="text-[7px] text-zinc-650 block mt-0.5 leading-none">Locked in Safe</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRIMARY CONTENT STAGE */}
      {isUnlocked && (
        <div className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-none no-scrollbar">
          
          {/* TAB A: HOME OPERATIONS OVERVIEW */}
          {activeTab === "HOME" && (
            <div className="space-y-4 animate-fade">
              
              {/* Notifications / Live feeds Segment Toggler */}
              <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-905 rounded-xl">
                <button
                  onClick={() => setDashboardSegment("NOTIFICATIONS")}
                  className={`py-1.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${
                    dashboardSegment === "NOTIFICATIONS"
                      ? "bg-zinc-900 border border-zinc-800 text-white shadow font-black"
                      : "text-zinc-500 hover:text-zinc-400"
                  }`}
                >
                  ⚡ Active Notifications ({countAwaiting + disputeAlertsCount(orders)})
                </button>
                <button
                  onClick={() => setDashboardSegment("SYSTEM")}
                  className={`py-1.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${
                    dashboardSegment === "SYSTEM"
                      ? "bg-zinc-900 border border-zinc-800 text-white shadow font-black"
                      : "text-zinc-500 hover:text-zinc-400"
                  }`}
                >
                  ⚙️ System Quality & Logs
                </button>
              </div>

              {dashboardSegment === "NOTIFICATIONS" ? (
                <div className="space-y-3">
                  
                  {/* Dynamic triggers pending pricing consent */}
                  {orders.filter(o => o.transit_status === "pending_seller_confirmation").length === 0 ? (
                    <div className="bg-zinc-900/15 border border-zinc-900 p-4 rounded-2xl text-center space-y-1.5 p-4 text-zinc-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400/40 mx-auto" />
                      <p className="text-[11px] font-bold text-zinc-300">No New Buyer Custom Offers</p>
                      <p className="text-[9.5px] text-zinc-500 leading-normal">Everything is matched and verified! Sellers are operating under baseline parameters.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[9.5px] uppercase font-mono tracking-widest text-[#ffa500] font-black pl-1 block">Awaiting pricing approval counter-assent</span>
                      {orders.filter(o => o.transit_status === "pending_seller_confirmation").map(order => (
                        <div 
                          key={order.order_id} 
                          className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl space-y-3 text-left"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase">REF: {order.order_id} • Custom offer</span>
                              <h5 className="text-xs font-black text-white mt-0.5">{order.product_title}</h5>
                              <p className="text-[10px] text-zinc-400 mt-1">Requested by: <strong>{order.buyer_name}</strong> ({order.quantity}x)</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[8.5px] text-zinc-500 block font-mono">Escrow MoMo</span>
                              <span className="text-xs font-mono font-extrabold text-teal-400 block mt-0.5">K {order.product_price}</span>
                            </div>
                          </div>

                          <div className="bg-[#050506] p-2.5 rounded-xl border border-zinc-900 space-y-1 text-[9.5px] font-mono leading-none">
                            <div className="flex items-center justify-between text-zinc-400">
                              <span>Default Price:</span>
                              <span className="zinc-200">K {(order.product_price * 1.1).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-400">
                              <span>Custom Buyer Target:</span>
                              <span className="text-teal-400 font-bold">K {order.product_price}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center gap-2 pt-1">
                            <span className="text-[9px] text-[#ffa500] font-bold">⚠️ Custom price requires manual agent assent</span>
                            <button
                              onClick={() => {
                                setSelectedOfferOrder(order);
                                setCounterPriceInput(order.product_price.toString());
                              }}
                              className="bg-[#ffa500]/10 hover:bg-[#ffa500]/20 text-[#ffa500] border border-[#ffa500]/25 text-[10px] font-black px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                            >
                              Open Pricing Counter
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Parcels ready for handoff */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-left space-y-2">
                    <div className="flex justify-between items-center pb-1 border-b border-zinc-900">
                      <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-zinc-400">Parcels await dispatch handoff</span>
                      <span className="text-[9px] font-mono text-[#ffa500] font-bold">{parcelJobs.filter(p => p.status === "searching_rider").length} items</span>
                    </div>
                    {parcelJobs.filter(p => p.status === "searching_rider").length === 0 ? (
                      <p className="text-[10px] text-zinc-550 leading-relaxed py-1">No pending parcel registrations are in the courier queues currently.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
                        {parcelJobs.filter(p => p.status === "searching_rider").map(pj => (
                          <div 
                            key={pj.parcel_id} 
                            onClick={() => setActiveTab("PARCELS")}
                            className="bg-zinc-900/40 p-2 rounded-lg border border-zinc-850 flex justify-between items-center text-[10px] cursor-pointer"
                          >
                            <div>
                              <strong className="text-zinc-200 block">{pj.description}</strong>
                              <span className="text-zinc-500 font-mono">REF: {pj.parcel_id} • To: {pj.recipient_name}</span>
                            </div>
                            <span className="text-[9px] text-[#ffa500] font-bold font-mono">K {pj.delivery_fee.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Dispute Alerts */}
                  <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-left space-y-2">
                    <div className="flex items-center gap-1.5 text-red-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <strong className="text-xs uppercase font-mono tracking-wide">Automated Active Dispute Guard</strong>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Local compliance engine detects zero escrow disputes within security coordinates. Verified payouts auto-settling according to protocol.
                    </p>
                  </div>

                  {/* Instant Rider Delivery Confirmations */}
                  <div className="bg-[#0c0d12] border border-zinc-850 p-3 rounded-2xl text-left text-xs space-y-1">
                    <span className="text-[8px] tracking-wider uppercase font-extrabold text-emerald-400 block font-mono">🔊 Realtime Courier Dispatches</span>
                    <p className="text-[10px] text-zinc-300">Rider #104 Banda marked REF: Selo-921 delivered in Woodlands.</p>
                    <span className="text-[8.5px] text-zinc-550 block font-mono">Delivered on Loop • 12 mins ago</span>
                  </div>

                </div>
              ) : (
                <div className="space-y-3.5 text-left">
                  
                  {/* Localized Currency exchange rate tracker */}
                  <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl space-y-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Localized Market Currency Exchange</span>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                      <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-900">
                        <span className="text-[8.5px] text-zinc-500 block">USD to ZMW</span>
                        <span className="text-xs font-extrabold text-emerald-400 mt-1 block">K 26.43 ZMW</span>
                      </div>
                      <div className="bg-zinc-950 p-2 rounded-lg border border-[#ffa500]/10">
                        <span className="text-[8.5px] text-zinc-500 block">SAR to ZMW</span>
                        <span className="text-xs font-extrabold text-[#ffa500] mt-1 block">K 7.05 ZMW</span>
                      </div>
                    </div>
                  </div>

                  {/* Seller onboarding completions alerts */}
                  <div className="p-3.5 bg-zinc-900/35 border border-zinc-850 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-[#ffa500] uppercase font-mono font-bold block">Onboarding Completeness Analytics</span>
                    <p className="text-[10px] text-zinc-300">Automatic cron checks: Backup database integrity 100% stable. Local caching indexing zero lag.</p>
                  </div>

                  {/* Operational system backup checks logs */}
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-1.5 text-[9.5px] font-mono text-zinc-500">
                    <div className="flex justify-between">
                      <span>AUTOMATED LEDGER HOURLY INDEX</span>
                      <span className="text-emerald-500">✓ SUCCESS</span>
                    </div>
                    <div className="flex justify-between">
                      <span>REPLICATION SHARDS IN SYNC</span>
                      <span className="text-emerald-500">✓ ACTIVE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LOCAL METRICS CACHE RESET</span>
                      <span className="text-zinc-400">UP TO DATE</span>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB B: SELLERS MANAGEMENT */}
          {activeTab === "SELLERS" && (
            <div className="space-y-4 animate-fade">
              
              {/* Segmented controls directory vs pipeline */}
              <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-905 rounded-xl">
                <button
                  onClick={() => setSellersSegment("DIRECTORY")}
                  className={`py-1.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${
                    sellersSegment === "DIRECTORY"
                      ? "bg-zinc-900 border border-zinc-800 text-white shadow font-black"
                      : "text-zinc-500 hover:text-zinc-400"
                  }`}
                >
                  📜 Client Directory ({registeredSellers.length})
                </button>
                <button
                  onClick={() => setSellersSegment("PIPELINE")}
                  className={`py-1.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${
                    sellersSegment === "PIPELINE"
                      ? "bg-zinc-900 border border-zinc-800 text-white shadow font-black"
                      : "text-zinc-500 hover:text-zinc-400"
                  }`}
                >
                  ⏳ Onboarding Pipeline ({pipelineSellers.length})
                </button>
              </div>

              {sellersSegment === "DIRECTORY" ? (
                <div className="space-y-3">
                  
                  {registeredSellers.map(sel => (
                    <div key={sel.id} className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl text-left space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8.5px] text-[#ffa500] font-mono uppercase bg-[#ffa500]/5 border border-amber-500/10 px-1.5 py-0.5 rounded">
                            {sel.category}
                          </span>
                          <h5 className="text-sm font-black text-white mt-2 leading-none">{sel.shop}</h5>
                          <p className="text-[10px] text-zinc-550 mt-1">Registrar: {sel.name}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${
                            sel.status === "Active" 
                              ? "text-emerald-400 bg-emerald-550/10 border-emerald-500/20"
                              : sel.status === "On Hold"
                              ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                              : "text-zinc-500 bg-zinc-900 border-zinc-800"
                          }`}>
                            {sel.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center py-1 mt-1 font-mono text-[9.5px]">
                        <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
                          <span className="text-zinc-550 block">COMMISSION SPLIT</span>
                          <span className="text-white font-bold block mt-0.5">{sel.commission}%</span>
                        </div>
                        <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
                          <span className="text-zinc-550 block">SALES REVENUE (MO)</span>
                          <span className="text-teal-400 font-bold block mt-0.5">K {sel.sales}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              ) : (
                <div className="space-y-3">
                  {pipelineSellers.length === 0 ? (
                    <div className="bg-zinc-900/15 border border-zinc-900 p-6 rounded-2xl text-center text-zinc-500 py-10">
                      Empty queue of developer prospects
                    </div>
                  ) : (
                    pipelineSellers.map(ps => (
                      <div key={ps.id} className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl text-left space-y-3.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8.5px] text-purple-400 font-mono tracking-wide uppercase">{ps.category}</span>
                            <h5 className="text-sm font-black text-white mt-1 leading-none">{ps.name}</h5>
                            <p className="text-[10px] text-zinc-400 mt-1 font-mono">Tax ID: {ps.taxId}</p>
                          </div>
                          <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded border uppercase font-extrabold ${
                            ps.taxStatus === "Verified" 
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                              : ps.taxStatus === "Pending"
                              ? "text-amber-400 bg-amber-500/10 border-amber-400/20"
                              : "text-red-400 bg-red-400/10 border-red-400/20"
                          }`}>
                            {ps.taxStatus}
                          </span>
                        </div>

                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900/80 space-y-1.5 text-[9.5px] font-mono text-zinc-400 leading-none">
                          <div className="flex items-center justify-between">
                            <span>Business Cert:</span>
                            <span className="text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5">
                              <FileText className="w-3 h-3 text-indigo-400" />
                              {ps.certificate}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Phone Contact:</span>
                            <span className="text-white">{ps.phone}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-zinc-900">
                          <button
                            onClick={() => {
                              setPipelineSellers(prev => prev.filter(item => item.id !== ps.id));
                              onSpawnToast({ message: "APPLICATION REJECTED", subText: `${ps.name} has been set to declined.` });
                            }}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-[10.5px] font-bold py-1.5 rounded-lg cursor-pointer transition-colors"
                          >
                            Reject Application
                          </button>
                          <button
                            onClick={() => handleApprovePipelineSeller(ps.id)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10.5px] py-1.5 rounded-lg cursor-pointer transition-all"
                          >
                            Certify Seller
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB C: INVENTORY & PUBLISHER ENGINE */}
          {activeTab === "LISTINGS" && (
            <div className="space-y-4 animate-fade">
              
              <div className="flex justify-between items-center bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl text-left">
                <div>
                  <span className="text-[8px] font-mono text-[#ffa500] uppercase tracking-wider block">Territorial Directory Inventory</span>
                  <p className="text-xs text-zinc-300 font-sans mt-0.5">
                    <strong>{listings.length} Active Listings</strong> vs <strong>3 local drafts</strong>
                  </p>
                </div>

                <button
                  onClick={() => setIsAddListingOpen(true)}
                  className="bg-purple-500 hover:bg-purple-400 text-black text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-97 shrink-0"
                >
                  <Plus className="w-4 h-4 text-black stroke-[3px]" />
                  <span>Add Listing</span>
                </button>
              </div>

              {/* Active list grids */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider px-1 block text-left">Active Catalog listings under custody</span>
                {listings.map(lst => (
                  <div key={lst.listing_id} className="bg-[#0c0d12] border border-zinc-850 p-3 rounded-2xl flex gap-3 text-left">
                    <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-lg">
                      {lst.thumbnail || "🌽"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className="text-[8.5px] text-zinc-500 font-mono block uppercase leading-none">{lst.category}</span>
                          <h5 className="text-xs font-black text-white mt-1 leading-snug truncate">{lst.title}</h5>
                        </div>
                        <span className="text-[11.5px] font-mono font-black text-[#ffa500] shrink-0">K {lst.suggested_price}</span>
                      </div>
                      
                      <p className="text-[9.5px] text-zinc-400 line-clamp-1 mt-1 leading-none">{lst.description}</p>
                      
                      <div className="flex justify-between items-center text-[8px] text-zinc-550 font-mono pt-2 border-t border-zinc-900 mt-2 leading-none">
                        <span>Zone: <strong>{lst.location.split(",")[0]}</strong></span>
                        <span className="text-emerald-400 font-semibold">✓ Double checked</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB D: ACTIVE ESCROW ORDERS */}
          {activeTab === "ORDERS" && (
            <div className="space-y-4 animate-fade">
              
              {/* Categorization tab panels */}
              <div className="grid grid-cols-3 p-0.5 bg-zinc-950 border border-zinc-905 rounded-xl">
                <button
                  onClick={() => setOrdersSegment("AWAITING")}
                  className={`py-1.5 rounded-lg text-[10.5px] font-bold text-center cursor-pointer transition-all ${
                    ordersSegment === "AWAITING"
                      ? "bg-zinc-900 border border-zinc-800 text-white shadow font-black"
                      : "text-zinc-500 hover:text-zinc-400"
                  }`}
                >
                  ⏳ Price Assent ({countAwaiting})
                </button>
                <button
                  onClick={() => setOrdersSegment("TRANSIT")}
                  className={`py-1.5 rounded-lg text-[10.5px] font-bold text-center cursor-pointer transition-all ${
                    ordersSegment === "TRANSIT"
                      ? "bg-zinc-900 border border-zinc-800 text-white shadow font-black"
                      : "text-zinc-500 hover:text-zinc-400"
                  }`}
                >
                  🛰️ Transit ({countTransit})
                </button>
                <button
                  onClick={() => setOrdersSegment("SETTLED")}
                  className={`py-1.5 rounded-lg text-[10.5px] font-bold text-center cursor-pointer transition-all ${
                    ordersSegment === "SETTLED"
                      ? "bg-zinc-900 border border-zinc-800 text-white shadow font-black"
                      : "text-zinc-500 hover:text-zinc-400"
                  }`}
                >
                  ✓ Settled ({countSettled})
                </button>
              </div>

              {ordersSegment === "AWAITING" && (
                <div className="space-y-3">
                  {orders.filter(o => o.transit_status === "pending_seller_confirmation").length === 0 ? (
                    <div className="bg-zinc-900/15 border border-zinc-900 p-6 rounded-2xl text-center text-zinc-500 py-10">
                      No custom price assent orders today.
                    </div>
                  ) : (
                    orders.filter(o => o.transit_status === "pending_seller_confirmation").map(ord => (
                      <div key={ord.order_id} className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl text-left space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-mono text-zinc-550 block">REF: {ord.order_id}</span>
                            <h5 className="text-xs font-black text-white mt-1 leading-snug">{ord.product_title}</h5>
                            <p className="text-[10px] text-zinc-400 mt-1">Requested by: <strong>{ord.buyer_name}</strong></p>
                          </div>
                          <span className="text-xs font-mono font-black text-[#ffa500]">K {ord.product_price}</span>
                        </div>

                        <div className="bg-zinc-950 p-2 rounded-xl text-[9PX] font-mono text-zinc-500 leading-none">
                          <p>Preferred MoMo: <strong className="text-zinc-300">{ord.mobile_money_operator}</strong></p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedOfferOrder(ord);
                            setCounterPriceInput(ord.product_price.toString());
                          }}
                          className="w-full bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-[11px] py-1.5 rounded-xl cursor-pointer text-center"
                        >
                          Manual Assent pricing
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {ordersSegment === "TRANSIT" && (
                <div className="space-y-3">
                  {orders.filter(o => o.transit_status === "rider_assigned" || o.transit_status === "picked_up" || o.transit_status === "out_for_delivery").length === 0 ? (
                    <div className="bg-zinc-900/15 border border-zinc-900 p-6 rounded-2xl text-center text-zinc-500 py-10">
                      No active dispatches on courier routes.
                    </div>
                  ) : (
                    orders.filter(o => o.transit_status === "rider_assigned" || o.transit_status === "picked_up" || o.transit_status === "out_for_delivery").map(ord => (
                      <div key={ord.order_id} className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl text-left space-y-3">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                          <div>
                            <span className="text-[8.5px] font-mono font-bold text-[#ffa500]">REF: {ord.order_id}</span>
                            <p className="text-xs font-black text-white mt-0.5">{ord.product_title}</p>
                          </div>
                          
                          <select
                            value={ord.transit_status}
                            onChange={(e) => {
                              const nextStatus = e.target.value as any;
                              setOrders(prev => prev.map(o => o.order_id === ord.order_id ? { ...o, transit_status: nextStatus } : o));
                              onSpawnToast({ message: "COURIER STATUS FILED", subText: `Reference ${ord.order_id} marked as ${nextStatus}.` });
                            }}
                            className="bg-zinc-900 border border-zinc-800 text-[9.5px] rounded px-1.5 py-0.5 text-zinc-300"
                          >
                            <option value="rider_assigned">Assigned Courier</option>
                            <option value="picked_up">Picked Up (At Farm)</option>
                            <option value="out_for_delivery">Out For Local Delivery</option>
                            <option value="delivered">Successfully Delivered</option>
                          </select>
                        </div>

                        {/* Rider assignment controls */}
                        <div className="space-y-2">
                          <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Rider Courier Duty</label>
                          <div className="flex gap-2">
                            <span className="bg-zinc-950 p-2 text-[10px] text-zinc-300 rounded-lg flex-1 border border-zinc-900 font-mono">
                              🏍️ {ord.rider ? `${ord.rider.name} (${ord.rider.bike_plate})` : "Awaiting assignment"}
                            </span>
                            
                            <button
                              onClick={() => {
                                // Assign default rider (Rider #104 Mulemwa)
                                const sampleRider: Rider = {
                                  rider_id: "rid-104",
                                  name: "Grace Mulemwa",
                                  phone: "+260 97 225 119",
                                  bike_plate: "ZM 9920A",
                                  photo: "https://randomuser.me/api/portraits/women/44.jpg",
                                  rating: 4.9,
                                  status: "online",
                                  tier: "Hero",
                                  social_fund_balance: 420,
                                  zone: "Chilenje"
                                };
                                setOrders(prev => prev.map(o => o.order_id === ord.order_id ? { ...o, rider: sampleRider, transit_status: "picked_up" } : o));
                                onSpawnToast({ message: "Grace Mulemwa DISPATCHED", subText: "Rider courier directed to farm point." });
                              }}
                              className="bg-teal-500 hover:bg-teal-400 text-black font-extrabold text-[9.5px] px-3 rounded-lg cursor-pointer"
                            >
                              Dispatch Grace
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {ordersSegment === "SETTLED" && (
                <div className="space-y-3">
                  {orders.filter(o => o.transit_status === "delivered").length === 0 ? (
                    <div className="bg-zinc-900/15 border border-zinc-900 p-6 rounded-2xl text-center text-zinc-500 py-10">
                      No delivered or settled ledger releases.
                    </div>
                  ) : (
                    orders.filter(o => o.transit_status === "delivered").map(ord => (
                      <div key={ord.order_id} className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl text-left space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8.5px] text-zinc-500 font-mono">REF: {ord.order_id} • DELIVERED</span>
                            <h5 className="text-xs font-black text-white mt-1 truncate">{ord.product_title}</h5>
                            <p className="text-[9px] text-zinc-500 font-mono">Completed payment released to client.</p>
                          </div>
                          <span className="text-xs font-mono font-black text-emerald-400">K {(ord.product_price * ord.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB E: COMMISSION EARNINGS LEDGER */}
          {activeTab === "EARNINGS" && (
            <div className="space-y-4 animate-fade">
              
              <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl text-left space-y-3">
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wide">Accrued Cumulative Lifetime Agent commission</span>
                  <span className="text-[9px] text-zinc-500">Airtel / MTN approved</span>
                </div>
                <div className="flex justify-between items-end">
                  <h3 className="text-3xl font-black font-mono text-white">K {commNetDeducted.toFixed(2)}</h3>
                  <button
                    onClick={() => {
                      setWithdrawAmount(parseFloat(commNetDeducted.toFixed(2)));
                      setIsWithdrawOpen(true);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black px-4 py-2 rounded-xl cursor-pointer transition-all active:scale-97"
                  >
                    Withdraw Funds
                  </button>
                </div>
              </div>

              {/* Grid ledger entries list */}
              <div className="space-y-2.5 text-left">
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-500 pl-1 block">Dynamic Audit accounting ledger</span>
                {ledger.map((ld, i) => {
                  const platFee = ld.amount_zmw * 0.05;
                  const finalPaid = ld.amount_zmw - platFee;
                  return (
                    <div key={i} className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs font-mono space-y-2">
                      <div className="flex justify-between border-b border-zinc-900 pb-1 text-[10px]">
                        <span className="text-zinc-500">{ld.timestamp.split("T")[0]} {ld.timestamp.split("T")[1]?.substring(0, 5)}</span>
                        <span className="text-[#ffa500] font-bold">{ld.tx_id}</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] leading-tight">
                        <div>
                          <strong className="text-white block">{ld.action}</strong>
                          <span className="text-zinc-500">{ld.product_title || "Regulatory processing fee"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#ffa500] font-bold block">K {ld.amount_zmw.toFixed(2)}</span>
                          <span className="text-[9.5px] text-zinc-650 block mt-0.5">Fee: K {platFee.toFixed(2)} | Net: K {finalPaid.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB F: PARCELS DISPATCH GATE */}
          {activeTab === "PARCELS" && (
            <div className="space-y-4 animate-fade text-left">
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter registered packages by ID or name..."
                  value={parcelSearch}
                  onChange={(e) => setParcelSearch(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-zinc-850 text-xs py-2.5 px-3 pl-8 rounded-xl text-white placeholder-zinc-550 focus:outline-none focus:border-purple-500"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-3.5" />
                {parcelSearch && (
                  <button 
                    onClick={() => setParcelSearch("")}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Dispatch form creator */}
              <form onSubmit={handleAddParcel} className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl space-y-3.5">
                <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-extrabold block">Log New Dispatch parcel</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-mono">SENDER SHOP PARTNER</label>
                    <select
                      value={parcelSenderSellerId}
                      onChange={(e) => {
                        const targetID = e.target.value;
                        setParcelSenderSellerId(targetID);
                        const match = registeredSellers.find(s => s.id === targetID);
                        if (match) setParcelSender(match.shop);
                      }}
                      className="w-full bg-[#050506] border border-zinc-850 text-xs py-2 px-2.5 rounded-lg text-white"
                    >
                      <option value="">Choose partner...</option>
                      {registeredSellers.map(s => (
                        <option key={s.id} value={s.id}>{s.shop}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-mono">RECIPIENT FULL NAME</label>
                    <input 
                      type="text"
                      placeholder="Jane Doe"
                      value={parcelRecipient}
                      onChange={(e) => setParcelRecipient(e.target.value)}
                      className="w-full bg-[#050506] border border-zinc-850 text-xs py-2 px-2.5 rounded-lg text-white placeholder-zinc-650"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-mono">RECIPIENT CONTACT PHONE</label>
                    <input 
                      type="text"
                      placeholder="+260 97 "
                      value={parcelRecipientPhone}
                      onChange={(e) => setParcelRecipientPhone(e.target.value)}
                      className="w-full bg-[#050506] border border-zinc-850 text-xs py-2 px-2.5 rounded-lg text-white placeholder-zinc-650"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-mono">DROP NEIGHBOURHOOD ZONE</label>
                    <select
                      value={parcelZone}
                      onChange={(e) => setParcelZone(e.target.value)}
                      className="w-full bg-[#050506] border border-zinc-850 text-xs py-2 px-2 rounded-lg text-zinc-200"
                    >
                      {zonesList.map(zn => (
                        <option key={zn} value={zn}>{zn}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-mono">DECLARED WEIGHT (KG)</label>
                    <input
                      type="number"
                      min={0.1}
                      max={40}
                      step={0.1}
                      value={parcelWeight}
                      onChange={(e) => setParcelWeight(parseFloat(e.target.value))}
                      className="w-full bg-[#050506] border border-zinc-850 text-xs py-2 px-2 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-mono">PARCEL VALUE CONTENT</label>
                    <input
                      type="text"
                      placeholder="seed specimens..."
                      value={parcelValue}
                      onChange={(e) => setParcelValue(e.target.value)}
                      className="w-full bg-[#050506] border border-zinc-850 text-xs py-2 px-2 text-white"
                    />
                  </div>
                </div>

                {/* Estimated split values */}
                {(() => {
                  const dist = 8;
                  const totalEst = 15 + (dist * 2.5);
                  const riderEst = totalEst * 0.9;
                  return (
                    <div className="bg-[#050506] p-2.5 rounded-lg border border-zinc-900 text-[10px] font-mono leading-none space-y-1 text-zinc-400">
                      <div className="flex justify-between">
                        <span>Dynamic Shipping Fee:</span>
                        <span className="text-[#ffa500] font-bold">K {totalEst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rider Courier Split:</span>
                        <span className="text-teal-400">K {riderEst.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}

                <button 
                  type="submit"
                  className="w-full bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all"
                >
                  Save & Log Active Dispatch
                </button>
              </form>

              {/* List of registered parcel dispatches */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-zinc-500 pl-1 block">Registered dispatches tracking</span>
                {parcelJobs
                  .filter(pj => {
                    const term = parcelSearch.toLowerCase();
                    return pj.parcel_id.toLowerCase().includes(term) || 
                           pj.sender_name.toLowerCase().includes(term) ||
                           pj.recipient_name.toLowerCase().includes(term);
                  })
                  .map(parcel => (
                    <div key={parcel.parcel_id} className="bg-[#0c0d12] border border-zinc-850 p-3.5 rounded-xl relative space-y-2.5 text-left">
                      <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900 text-[10px]">
                        <div>
                          <span className="text-[8.5px] font-mono text-zinc-500 leading-none block">REF: {parcel.parcel_id}</span>
                          <strong className="text-white mt-1 block leading-none">{parcel.description}</strong>
                        </div>
                        <span className="text-purple-400 uppercase tracking-tight text-[9px] font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                          {parcel.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 leading-relaxed">
                        <div>
                          <span className="text-[8px] text-zinc-550 block">SENDER:</span>
                          <strong>{parcel.sender_name}</strong>
                        </div>
                        <div>
                          <span className="text-[8px] text-zinc-550 block">RECIPIENT:</span>
                          <strong>{parcel.recipient_name} ({parcel.recipient_phone})</strong>
                        </div>
                      </div>

                      <div className="flex justify-between text-[9px] text-zinc-550 pt-1.5 border-t border-zinc-900 font-mono">
                        <span>Drop Zone: <strong>{parcel.delivery_address.split(",")[0]}</strong></span>
                        <span className="text-teal-400">Est Fee: K {parcel.delivery_fee.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* TAB G: INTERACTIVE DELIVERY COORDINATES MAP */}
          {activeTab === "MAP" && (
            <div className="space-y-4 animate-fade text-left">
              
              <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl space-y-1.5 p-4 text-xs font-sans">
                <span className="text-[8.5px] font-mono font-bold text-[#ffa500] uppercase tracking-wider block">Live Delivery routes network map logistics</span>
                <p className="text-zinc-300">
                  Real-time movement vectors on 4 central coordination hubs in Lusaka. Click any active transit marker path below to view diagnostics:
                </p>
              </div>

              {/* Coordinates grid visual map / Real Google Map */}
              <div className="relative bg-zinc-950 border border-zinc-900 rounded-3xl h-[280px] flex flex-col justify-between overflow-hidden shadow-inner">
                {hasValidGoogleMapsKey() ? (
                  <APIProvider apiKey={getGoogleMapsApiKey()} version="weekly">
                    <GoogleMap
                      defaultCenter={{ lat: -15.4267, lng: 28.3033 }}
                      defaultZoom={11.5}
                      mapId="AGENT_LOGISTICS_MAP_01"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* Node A - Lusaka Central Hub */}
                      <AdvancedMarker position={{ lat: -15.4167, lng: 28.2833 }} onClick={() => setSelectedMapNode("Lusaka Central Hub")}>
                        <Pin background="#14b8a6" glyph="A" glyphColor="#fff" />
                      </AdvancedMarker>
                      {/* Node B - Kabwata Cluster */}
                      <AdvancedMarker position={{ lat: -15.4378, lng: 28.3044 }} onClick={() => setSelectedMapNode("Kabwata Cluster")}>
                        <Pin background="#a855f7" glyph="B" glyphColor="#fff" />
                      </AdvancedMarker>
                      {/* Node C - Chilenje Ward */}
                      <AdvancedMarker position={{ lat: -15.4589, lng: 28.3244 }} onClick={() => setSelectedMapNode("Chilenje Ward")}>
                        <Pin background="#f59e0b" glyph="C" glyphColor="#fff" />
                      </AdvancedMarker>
                      {/* Node D - Woodlands East */}
                      <AdvancedMarker position={{ lat: -15.4289, lng: 28.3444 }} onClick={() => setSelectedMapNode("Woodlands East")}>
                        <Pin background="#6366f1" glyph="D" glyphColor="#fff" />
                      </AdvancedMarker>
                    </GoogleMap>
                  </APIProvider>
                ) : (
                  <>
                    {/* Visual coordinate Grid lines overlay */}
                    <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 opacity-10 pointer-events-none">
                      {[...Array(25)].map((_, i) => (
                        <div key={i} className="border border-zinc-200" />
                      ))}
                    </div>

                    {/* Simulated transit vectors animation lines */}
                    {enableMapVectors && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                        <line x1="20%" y1="20%" x2="45%" y2="50%" stroke="#14b8a6" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                        <line x1="45%" y1="50%" x2="80%" y2="25%" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="3 3" />
                        <line x1="80%" y1="25%" x2="70%" y2="75%" stroke="#f59e0b" strokeWidth="2.5" />
                      </svg>
                    )}

                    {/* Map Node A: Lusaka Central Hub */}
                    <div 
                      onClick={() => setSelectedMapNode("Lusaka Central Hub")}
                      className="absolute left-[15%] top-[15%] flex flex-col items-center cursor-pointer group z-15"
                    >
                      <div className="w-5 h-5 rounded-full bg-teal-500 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-black font-bold shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                        A
                      </div>
                      <span className="text-[8.5px] font-mono text-zinc-400 mt-1 block">Central Hub</span>
                    </div>

                    {/* Map Node B: Kabwata Cluster */}
                    <div 
                      onClick={() => setSelectedMapNode("Kabwata Cluster")}
                      className="absolute left-[40%] top-[45%] flex flex-col items-center cursor-pointer group z-15"
                    >
                      <div className="w-5 h-5 rounded-full bg-purple-500 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                        B
                      </div>
                      <span className="text-[8.5px] font-mono text-zinc-400 mt-1 block">Kabwata</span>
                    </div>

                    {/* Map Node C: Chilenje Ward */}
                    <div 
                      onClick={() => setSelectedMapNode("Chilenje Ward")}
                      className="absolute left-[75%] top-[20%] flex flex-col items-center cursor-pointer group z-15"
                    >
                      <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-black font-bold shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                        C
                      </div>
                      <span className="text-[8.5px] font-mono text-zinc-400 mt-1 block">Chilenje Ward</span>
                    </div>

                    {/* Map Node D: Woodlands East */}
                    <div 
                      onClick={() => setSelectedMapNode("Woodlands East")}
                      className="absolute left-[65%] top-[70%] flex flex-col items-center cursor-pointer group z-15"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-500 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        D
                      </div>
                      <span className="text-[8.5px] font-mono text-zinc-400 mt-1 block">Woodlands East</span>
                    </div>
                  </>
                )}

                {/* Legend or status tooltips widget */}
                <div className="absolute bottom-3 left-3 bg-black/85 border border-zinc-850 p-2 rounded-xl text-[8.5px] font-mono text-zinc-400 space-y-1 pointer-events-none z-10">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Google Maps Engine: <strong>{hasValidGoogleMapsKey() ? "Active Vector Layers" : "Simulated Grid Offline"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Dynamic node tooltip detail sidebar */}
              <AnimatePresence>
                {selectedMapNode && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-zinc-900/65 border border-purple-500/15 p-4 rounded-xl text-left space-y-2"
                  >
                    <div className="flex justify-between items-center text-white pb-1.5 border-b border-zinc-800">
                      <strong className="text-xs uppercase font-mono tracking-wide text-purple-400 font-bold">📍 Node Diagnostics</strong>
                      <button 
                        onClick={() => setSelectedMapNode(null)}
                        className="text-zinc-550 hover:text-white font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-300">
                      Node: <strong>{selectedMapNode}</strong> represents localized sorting hub coordinator. 
                      Average courier dispatch rating index is <strong>4.8 stars</strong>. Dispatch delay tolerance is less than 1.5 mins.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* TAB H: GENERAL PREFERENCES & SETTINGS */}
          {activeTab === "SETTINGS" && (
            <div className="space-y-4 animate-fade text-left text-xs">
              
              <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl space-y-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffa500] font-black block">Agent Secure Profile Info</span>
                
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-550 block font-mono">AUTHORIZED AGENT NAME</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-[#050506] border border-zinc-850 py-1.5 px-3 uppercase text-xs font-mono font-bold rounded-lg text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-550 block font-mono">REGIONAL OFFICE HUB</label>
                  <input
                    type="text"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full bg-[#050506] border border-zinc-850 py-1.5 px-3 uppercase text-xs font-mono font-bold rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Secure PIN update flow settings */}
              <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl space-y-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">Secure PIN update workflow</span>
                
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-550 block font-mono">VERIFY CURRENT PASSCODE</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="old code..."
                    value={settingsOldPin}
                    onChange={(e) => setSettingsOldPin(e.target.value)}
                    className="w-full bg-[#050506] border border-zinc-850 py-1 px-2.5 rounded-lg text-white font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-550 block font-mono">DECLARE NEW ACCESS PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="4-digit..."
                    value={settingsNewPin}
                    onChange={(e) => setSettingsNewPin(e.target.value)}
                    className="w-full bg-[#050506] border border-zinc-850 py-1 px-2.5 rounded-lg text-white font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    if (settingsOldPin === currentUserPin) {
                      if (settingsNewPin.length === 4 && /^\d+$/.test(settingsNewPin)) {
                        setCurrentUserPin(settingsNewPin);
                        setSettingsOldPin("");
                        setSettingsNewPin("");
                        onSpawnToast({ message: "CREDENTIAL GUARD ACCEPTED", subText: "Access passcode updated instantly." });
                      } else {
                        onSpawnToast({ message: "Invalid New PIN", subText: "New code has to be 4 numerical digits." });
                      }
                    } else {
                      onSpawnToast({ message: "Verification Failure", subText: "Current passcode did not match." });
                    }
                  }}
                  className="w-full bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-[11px] py-1.5 rounded-lg cursor-pointer transition-all"
                >
                  Verify and Set credentials
                </button>
              </div>

              {/* Generic toggles support etc */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 space-y-3">
                <span className="text-[9.5px] uppercase font-mono tracking-wider font-extrabold text-zinc-500 block">General custom parameters</span>
                
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400">Base Currency Signifier:</span>
                  <select
                    value={appCurrency}
                    onChange={(e) => setAppCurrency(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-[10.5px] rounded p-1 text-zinc-300"
                  >
                    <option value="ZMW (K)">Zambia Kwacha (K)</option>
                    <option value="USD ($)">Federal Dollars ($)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-zinc-900">
                  <span className="text-zinc-400">Rendering Vector Lines:</span>
                  <input
                    type="checkbox"
                    checked={enableMapVectors}
                    onChange={(e) => setEnableMapVectors(e.target.checked)}
                    className="cursor-pointer"
                  />
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 5. STICKY BOTTOM PERSISTENT NAVIGATION BAR FOR AGENTS (sticky at the very bottom screens) */}
      {isUnlocked && (
        <div className="absolute inset-x-0 bottom-0 bg-zinc-950/95 [backdrop-filter:blur(8px)] border-t border-zinc-900 py-1.5 px-1 flex justify-around items-center shrink-0 z-40">
          {[
            { id: "HOME", label: "Home", icon: "⚡" },
            { id: "SELLERS", label: "Sellers", icon: "👥" },
            { id: "LISTINGS", label: "Listings", icon: "🛒" },
            { id: "ORDERS", label: "Orders", icon: "🛰️" },
            { id: "EARNINGS", label: "Earnings", icon: "💰" },
            { id: "PARCELS", label: "Parcels", icon: "📦" },
            { id: "MAP", label: "Map Feed", icon: "🗺️" },
            { id: "SETTINGS", label: "Settings", icon: "⚙️" }
          ].map((itm) => (
            <button
              key={itm.id}
              onClick={() => setActiveTab(itm.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
                activeTab === itm.id
                  ? "text-[#ffa500] bg-[#ffa500]/5 scale-103 font-bold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className="text-sm">{itm.icon}</span>
              <span className="text-[8.5px] mt-0.5 tracking-tight font-black">{itm.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 6. MODAL INTERACTIVE POPUPS MODALS BLOCK */}
      {/* 6A: counter offers counter pricing modal */}
      <AnimatePresence>
        {selectedOfferOrder && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0c0d12] border border-zinc-850 rounded-3xl p-5 max-w-[325px] w-full text-left space-y-4 shadow-2xl animate-fade"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <span className="text-xs uppercase font-mono font-bold text-white">Consented Pricing Counter</span>
                <button
                  onClick={() => setSelectedOfferOrder(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-300">
                <p>Verify proposed transaction of 1x <strong>{selectedOfferOrder.product_title}</strong>.</p>
                <div className="bg-[#050506]/90 p-2.5 rounded-lg border border-zinc-900/60 font-mono text-[9.5px]">
                  <span>Buyer Target Offer: <strong className="text-teal-400">K {selectedOfferOrder.product_price} ZMW</strong></span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9.5px] text-zinc-550 block font-mono">SET CUSTOM ASSENTED PRICE</label>
                <input
                  type="number"
                  value={counterPriceInput}
                  onChange={(e) => setCounterPriceInput(e.target.value)}
                  className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-[#ffa500]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOfferOrder(null)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCustomPricingPublish}
                  className="flex-1 bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-xs py-2 rounded-xl cursor-pointer"
                >
                  Confirm assent
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6B: MULTI-STEP CREATOR MODAL FOR ADDING LISTING */}
      <AnimatePresence>
        {isAddListingOpen && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl z-50 overflow-y-auto px-4 py-8 flex items-center justify-center">
            <div className="w-full max-w-2xl relative">
              <SeloWizard 
                userRole="AGENT"
                onBack={() => {
                  setIsAddListingOpen(false);
                  setAddStep(1);
                }}
                onPublishSuccess={(newListing) => {
                  setListings(prev => [newListing, ...prev]);
                  setIsAddListingOpen(false);
                  setAddStep(1);
                  onSpawnToast({
                    message: "Agent Promo Live! 🚀",
                    subText: `${newListing.title} published on behalf of seller with deep tracking.`
                  });
                }}
                onSpawnToast={onSpawnToast}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 6C: WITHDRAWAL FUNDS CASH-OUT OVERLAY POPUP */}
      <WithdrawalModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        role="agent"
        availableBalance={agentCommission}
        onWithdrawSuccess={(amount) => {
          setAgentCommission(prev => Math.max(0, prev - amount));
          
          // Record ledger outflow log for compliance
          const outTx: LedgerRecord = {
            tx_id: `TX-WD-${Math.floor(Math.random() * 900000 + 100000)}`,
            order_id: `ORDER-WD-${Math.floor(Math.random() * 900 + 100)}`,
            amount_zmw: amount,
            action: "AGENT_COMMISSION_CASHOUT",
            payout_destination: `Lipila Verified Agent Disbursement`,
            timestamp: new Date().toISOString()
          };
          setLedger(prev => [outTx, ...prev]);
          setIsWithdrawOpen(false);
          
          onSpawnToast({
            message: "Withdrawal Created ✓",
            subText: `K ${amount.toFixed(2)} ZMW sent instantly through Lipila to your agent wallet.`
          });
        }}
      />

    </div>
  );
}

// Inline helper functions
function disputeAlertsCount(orders: Order[]) {
  // Mock dispute calculations or dynamic alert bounds
  return 0;
}
