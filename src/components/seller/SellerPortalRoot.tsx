import React, { useState } from "react";
import { Home, ClipboardList, Play, CirclePlay, Coins, MoreHorizontal, LogOut, ShieldCheck, ShoppingBag, Package, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import Modular Sub-components
import SellerLogin from "./SellerLogin";
import SellerDashboard from "./SellerDashboard";
import SellerListings from "./SellerListings";
import SellerAddListing from "./SellerAddListing";
import SellerOrders from "./SellerOrders";
import SellerEarnings from "./SellerEarnings";
import SellerMoreModules from "./SellerMoreModules";
import SellerAnalytics from "./SellerAnalytics";
import ParcelsModule from "../ParcelsModule";

import { Listing, Order, SavedLocation, ParcelJob, AdminConfig } from "../../types";

interface SellerPortalRootProps {
  listings: Listing[];
  setListings: React.Dispatch<React.SetStateAction<Listing[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  sellerBalance: number;
  setSellerBalance: React.Dispatch<React.SetStateAction<number>>;
  toast: any;
  setToast: (toast: { message: string; subText?: string } | null) => void;
  savedLocations: SavedLocation[];
  setSavedLocations: React.Dispatch<React.SetStateAction<SavedLocation[]>>;
  recentLocations: SavedLocation[];
  setRecentLocations: React.Dispatch<React.SetStateAction<SavedLocation[]>>;
  parcelJobs: ParcelJob[];
  setParcelJobs: (jobs: ParcelJob[]) => void;
  adminConfig: AdminConfig;
  setAdminConfig: (cfg: AdminConfig) => void;
}

export default function SellerPortalRoot({
  listings,
  setListings,
  orders,
  setOrders,
  sellerBalance,
  setSellerBalance,
  toast,
  setToast,
  savedLocations,
  setSavedLocations,
  recentLocations,
  setRecentLocations,
  parcelJobs,
  setParcelJobs,
  adminConfig,
  setAdminConfig
}: SellerPortalRootProps) {
  // Authentication & Session Persistence State
  const [sellerIsLoggedIn, setSellerIsLoggedIn] = useState<boolean>(false);
  const [sellerPinCode, setSellerPinCode] = useState<string>("2580"); // default sandbox pin

  // Navigation tab states: HOME, ORDERS, LISTINGS, EARNINGS, MORE, PARCELS, ANALYTICS
  const [sellerTab, setSellerTab] = useState<"HOME" | "ORDERS" | "LISTINGS" | "EARNINGS" | "MORE" | "PARCELS" | "ANALYTICS">("HOME");

  // State trigger for active media AI pipeline simulation
  const [isUploadingNewListing, setIsUploadingNewListing] = useState<boolean>(false);

  // Auto-settlement configuration state
  const [autoSettle, setAutoSettle] = useState<boolean>(true);

  // Parent states to link modules
  const [sellerStoreName, setSellerStoreName] = useState<string>("Chisamba Organic Trade Hub");
  const [sellerName, setSellerName] = useState<string>("Chipo Mwansa");
  const [sellerLocationLandmark, setSellerLocationLandmark] = useState<string>("Plot 33, Great East Road near Cooperative, Chisamba");
  const [sellerPrimaryWallet, setSellerPrimaryWallet] = useState<string>("Airtel Money (+26097561928)");

  // Shared More modules states
  const [activeChatConversationId, setActiveChatConversationId] = useState<string | null>(null);
  const [typedMessageInput, setTypedMessageInput] = useState<string>("");
  const [analyticsDateRange, setAnalyticsDateRange] = useState<"TODAY" | "7DAYS" | "30DAYS">("30DAYS");
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editingAgentNewRate, setEditingAgentNewRate] = useState<number>(10);
  const [notifyPreferences, setNotifyPreferences] = useState<{ inApp: boolean; sms: boolean }>({ inApp: true, sms: true });
  const [sellerLanguage, setSellerLanguage] = useState<"English" | "Bemba" | "Nyanja">("English");

  // Agents list
  const [agentsList, setAgentsList] = useState<any[]>([
    { agent_id: "ag-001", name: "Mwansa Phiri", activeSince: "4 months", commission_rate: 10, monthly_sales: 18, total_commission_paid: 1840 },
    { agent_id: "ag-002", name: "Tembo Mutale", activeSince: "2 months", commission_rate: 8, monthly_sales: 12, total_commission_paid: 820 },
    { agent_id: "ag-003", name: "Banda Chileshe", activeSince: "6 months", commission_rate: 12, monthly_sales: 24, total_commission_paid: 3100 }
  ]);

  // Messages list
  const [buyerMessages, setBuyerMessages] = useState<any[]>([
    { id: "chat-01", name: "Clara Mwamba", initials: "CM", orderId: "ord-88392", preview: "Muli bwanji! Is there rider collection from Chisamba cooperative today?", unread: 2, timestamp: "15m", messages: [
      { id: "m-1", sender: "buyer", text: "Hello, I am asking about my sweet maize order.", timestamp: "10:15 AM" },
      { id: "m-2", sender: "seller", text: "Muli bwanji Clara! Yes, we have packed your sweet maize. It is waiting for the rider.", timestamp: "10:18 AM" },
      { id: "m-3", sender: "buyer", text: "Muli bwanji! Is there rider collection from Chisamba cooperative today?", timestamp: "10:20 AM" }
    ] },
    { id: "chat-02", name: "Bupe Mwamba", initials: "BM", orderId: "ord-11029", preview: "Thanks, the chitenge colors are perfect!", unread: 0, timestamp: "2h", messages: [
      { id: "m-4", sender: "buyer", text: "Hi, do you have cotton chitenge fabric?", timestamp: "Yesterday" },
      { id: "m-5", sender: "seller", text: "Yes, we have high-quality chitenge from Ndola.", timestamp: "Yesterday" },
      { id: "m-6", sender: "buyer", text: "Thanks, the chitenge colors are perfect!", timestamp: "Yesterday" }
    ] }
  ]);

  // Notifications
  const [sellerNotifications, setSellerNotifications] = useState<any[]>([
    { id: "not-01", title: "New order received!", body: "Clara Mwamba ordered 2 x Chisamba Sweet Maize (ord-88392). Payout Escrow Locked.", type: "new_order", time: "10 mins ago", read: false, referenceId: "ord-88392" },
    { id: "not-02", title: "Listing trending 🔥", body: "Your sweet maize is performing 45% better than average listings in Munali!", type: "trending", time: "2 hours ago", read: false, referenceId: "lst-001" },
    { id: "not-03", title: "Payout settled ✓", body: "K 1,050.00 transferred via Lipila to your primary Airtel Money wallet.", type: "payout", time: "1 day ago", read: true, referenceId: "tx-f0e6-a21b" },
    { id: "not-04", title: "Low stock alert ⚠️", body: "Only 5 bushels of sweet maize remaining. Consider editing listing or adjusting stock.", type: "low_stock", time: "2 days ago", read: true, referenceId: "lst-001" },
    { id: "not-05", title: "New review alert ⭐⭐⭐⭐⭐", body: "Lulu K. left a 5-star review: 'Sweetest maize in Lusaka! Saved me time.'", type: "new_review", time: "2 days ago", read: true }
  ]);

  // Handle Log Out
  const handleLogOut = () => {
    setSellerIsLoggedIn(false);
    setToast({
      message: "Logged Out Successfully",
      subText: "Your secure cache session has been cleared. PIN entry required on reload."
    });
  };

  // Switch to messages module on click from New order list
  const handleOpenBuyerChatFromOrderList = (buyerName: string) => {
    setSellerTab("MORE");
    // Find chat
    const chat = buyerMessages.find(c => c.name.toLowerCase().includes(buyerName.toLowerCase()));
    if (chat) {
      setActiveChatConversationId(chat.id);
    }
    setToast({
      message: "Channel Initialized",
      subText: `Opening live encrypted thread with ${buyerName}`
    });
  };

  // Handle publishing list item
  const handlePublishNewListingFinished = (newListing: Listing) => {
    setListings(prev => [newListing, ...prev]);
    setIsUploadingNewListing(false);
    setSellerTab("LISTINGS");
  };

  // Navigations badges
  const unreadMessagesCount = buyerMessages.filter(c => c.unread > 0).length;
  const unreadAlertsCount = sellerNotifications.filter(n => !n.read).length;

  const totalActionBadges = unreadMessagesCount + unreadAlertsCount;

  // Active Title text helper
  const getTabTitle = () => {
    if (isUploadingNewListing) return "AI Studio Advert Builder";
    switch (sellerTab) {
      case "HOME": return "Merchant pulse check";
      case "ORDERS": return "Escrow Fulfillment Queue";
      case "LISTINGS": return "Produce Listings";
      case "ANALYTICS": return "Business Intelligence Portal";
      case "EARNINGS": return "Earnings Settlement Wallet";
      case "MORE": return "Extended Merchant Desk";
      case "PARCELS": return "Selonachipa Customer Parcels";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#050506] border border-zinc-900 rounded-[32px] overflow-hidden shadow-2xl flex flex-col min-h-[620px] relative">
      {/* 1. Pre-Authenticated State (PIN Lock) */}
      {!sellerIsLoggedIn ? (
        <SellerLogin
          onLoginSuccess={() => setSellerIsLoggedIn(true)}
          sellerPinCode={sellerPinCode}
          setSellerPinCode={setSellerPinCode}
          setToast={setToast}
        />
      ) : (
        /* 2. Authenticated Main Layout Workspace */
        <div className="flex-1 flex flex-col justify-between">
          
          {/* Header Dashboard Title bar */}
          <div className="px-4 py-3.5 bg-zinc-950/60 border-b border-zinc-900 flex justify-between items-center shrink-0">
            <div>
              <span className="text-[8px] font-bold font-mono tracking-widest text-[#ffa500] uppercase">
                {getTabTitle()}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs font-black text-white">Chipo Mwansa • Seller Desk</span>
              </div>
            </div>
            
            <button
              onClick={handleLogOut}
              className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-red-400 border border-zinc-850 hover:bg-zinc-950 flex items-center justify-center cursor-pointer transition-colors"
              title="Lock Console Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Applet Body Drawer Router */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
            {isUploadingNewListing ? (
              <SellerAddListing
                onBack={() => setIsUploadingNewListing(false)}
                onPublishSuccess={handlePublishNewListingFinished}
                setToast={setToast}
              />
            ) : (
              <>
                {sellerTab === "HOME" && (
                  <SellerDashboard
                    listings={listings}
                    setListings={setListings}
                    orders={orders}
                    onAddListingClick={() => setIsUploadingNewListing(true)}
                    onNavigateTab={setSellerTab}
                    sellerStoreName={sellerStoreName}
                  />
                )}

                {sellerTab === "ORDERS" && (
                  <SellerOrders
                    orders={orders}
                    setOrders={setOrders}
                    onMessageBuyerClick={handleOpenBuyerChatFromOrderList}
                    sellerBalance={sellerBalance}
                    setSellerBalance={setSellerBalance}
                    setToast={setToast}
                  />
                )}

                {sellerTab === "LISTINGS" && (
                  <SellerListings
                    listings={listings}
                    setListings={setListings}
                    onLaunchAddListing={() => setIsUploadingNewListing(true)}
                    setToast={setToast}
                  />
                )}

                {sellerTab === "ANALYTICS" && (
                  <SellerAnalytics
                    listings={listings}
                    orders={orders}
                    sellerStoreName={sellerStoreName}
                  />
                )}

                {sellerTab === "EARNINGS" && (
                  <SellerEarnings
                    sellerBalance={sellerBalance}
                    setSellerBalance={setSellerBalance}
                    autoSettle={autoSettle}
                    setAutoSettle={setAutoSettle}
                    sellerPrimaryWallet={sellerPrimaryWallet}
                    setToast={setToast}
                  />
                )}

                {sellerTab === "MORE" && (
                  <SellerMoreModules
                    onBackToMenu={() => setSellerTab("HOME")}
                    listings={listings}
                    sellerPrimaryWallet={sellerPrimaryWallet}
                    setSellerPrimaryWallet={setSellerPrimaryWallet}
                    sellerStoreName={sellerStoreName}
                    setSellerStoreName={setSellerStoreName}
                    sellerName={sellerName}
                    setSellerName={setSellerName}
                    sellerLocationLandmark={sellerLocationLandmark}
                    setSellerLocationLandmark={setSellerLocationLandmark}
                    sellerPinCode={sellerPinCode}
                    setSellerPinCode={setSellerPinCode}
                    agentsList={agentsList}
                    setAgentsList={setAgentsList}
                    buyerMessages={buyerMessages}
                    setBuyerMessages={setBuyerMessages}
                    sellerNotifications={sellerNotifications}
                    setSellerNotifications={setSellerNotifications}
                    notifyPreferences={notifyPreferences}
                    setNotifyPreferences={setNotifyPreferences}
                    sellerLanguage={sellerLanguage}
                    setSellerLanguage={setSellerLanguage}
                    setToast={setToast}
                    onLogout={handleLogOut}
                    activeChatConversationId={activeChatConversationId}
                    setActiveChatConversationId={setActiveChatConversationId}
                    typedMessageInput={typedMessageInput}
                    setTypedMessageInput={setTypedMessageInput}
                    analyticsDateRange={analyticsDateRange}
                    setAnalyticsDateRange={setAnalyticsDateRange}
                    editingAgentId={editingAgentId}
                    setEditingAgentId={setEditingAgentId}
                    editingAgentNewRate={editingAgentNewRate}
                    setEditingAgentNewRate={setEditingAgentNewRate}
                  />
                )}

                {sellerTab === "PARCELS" && (
                  <ParcelsModule
                    userRole="SELLER"
                    userId="sel-chipo"
                    userName={sellerStoreName}
                    savedLocations={savedLocations}
                    setSavedLocations={setSavedLocations}
                    recentLocations={recentLocations}
                    setRecentLocations={setRecentLocations}
                    parcelJobs={parcelJobs}
                    setParcelJobs={setParcelJobs}
                    adminConfig={adminConfig}
                    setAdminConfig={setAdminConfig}
                    onSpawnToast={(t) => setToast(t)}
                  />
                )}
              </>
            )}
          </div>

          {/* Persistent Sticky Bottom Navigation Bar (as requested across all views) */}
          {!isUploadingNewListing && (
            <div className="absolute inset-x-0 bottom-0 bg-zinc-950/90 [backdrop-filter:blur(8px)] border-t border-zinc-900 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] px-1 flex justify-around items-center shrink-0 z-40">
              {[
                { id: "HOME", label: "Home", icon: Home },
                { id: "ORDERS", label: "Orders", icon: ClipboardList, count: orders.filter(o => o.seller_id === "sel-chipo" && o.transit_status === "pending_seller_confirmation").length },
                { id: "LISTINGS", label: "Listings", icon: Play },
                { id: "ANALYTICS", label: "Analytics", icon: BarChart3 },
                { id: "PARCELS", label: "Parcels", icon: Package },
                { id: "EARNINGS", label: "Earnings", icon: Coins },
                { id: "MORE", label: "More", icon: MoreHorizontal, count: totalActionBadges }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const active = sellerTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSellerTab(tab.id as any);
                      setActiveChatConversationId(null); // click resets chat focus
                    }}
                    className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer relative ${
                      active 
                        ? "text-[#ffa500] bg-[#ffa500]/5 scale-105" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <div className="relative">
                      <IconComponent className={`w-[18px] h-[18px] ${active ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                      {tab.count ? (
                        <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-mono text-[7px] font-black w-3.5 h-3.5 shrink-0 rounded-full flex items-center justify-center border border-zinc-950">
                          {tab.count}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[8px] font-bold mt-1 font-sans">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
