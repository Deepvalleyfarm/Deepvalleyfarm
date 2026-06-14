import React, { useState } from "react";
import { 
  MessageSquare, BarChart2, User, Users, Bell, Settings, HelpCircle, 
  ArrowLeft, Search, Plus, Trash2, Camera, ShieldCheck, Mail, Send, 
  MapPin, Check, Edit2, Phone, Smile, Calendar, ExternalLink, RefreshCw, LogOut 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Listing } from "../../types";

interface SellerMoreModulesProps {
  onBackToMenu: () => void;
  listings: Listing[];
  sellerPrimaryWallet: string;
  setSellerPrimaryWallet: (w: string) => void;
  sellerStoreName: string;
  setSellerStoreName: (n: string) => void;
  sellerName: string;
  setSellerName: (n: string) => void;
  sellerLocationLandmark: string;
  setSellerLocationLandmark: (l: string) => void;
  sellerPinCode: string;
  setSellerPinCode: (p: string) => void;
  agentsList: any[];
  setAgentsList: React.Dispatch<React.SetStateAction<any[]>>;
  buyerMessages: any[];
  setBuyerMessages: React.Dispatch<React.SetStateAction<any[]>>;
  sellerNotifications: any[];
  setSellerNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  notifyPreferences: { inApp: boolean; sms: boolean };
  setNotifyPreferences: (v: any) => void;
  sellerLanguage: "English" | "Bemba" | "Nyanja";
  setSellerLanguage: (l: "English" | "Bemba" | "Nyanja") => void;
  setToast: (toast: { message: string; subText?: string } | null) => void;
  onLogout: () => void;
  activeChatConversationId: string | null;
  setActiveChatConversationId: (id: string | null) => void;
  typedMessageInput: string;
  setTypedMessageInput: (v: string) => void;
  analyticsDateRange: "TODAY" | "7DAYS" | "30DAYS";
  setAnalyticsDateRange: (v: "TODAY" | "7DAYS" | "30DAYS") => void;
  editingAgentId: string | null;
  setEditingAgentId: (id: string | null) => void;
  editingAgentNewRate: number;
  setEditingAgentNewRate: (r: number) => void;
}

export default function SellerMoreModules({
  onBackToMenu,
  listings,
  sellerPrimaryWallet,
  setSellerPrimaryWallet,
  sellerStoreName,
  setSellerStoreName,
  sellerName,
  setSellerName,
  sellerLocationLandmark,
  setSellerLocationLandmark,
  sellerPinCode,
  setSellerPinCode,
  agentsList,
  setAgentsList,
  buyerMessages,
  setBuyerMessages,
  sellerNotifications,
  setSellerNotifications,
  notifyPreferences,
  setNotifyPreferences,
  sellerLanguage,
  setSellerLanguage,
  setToast,
  onLogout,
  activeChatConversationId,
  setActiveChatConversationId,
  typedMessageInput,
  setTypedMessageInput,
  analyticsDateRange,
  setAnalyticsDateRange,
  editingAgentId,
  setEditingAgentId,
  editingAgentNewRate,
  setEditingAgentNewRate
}: SellerMoreModulesProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // Sub-modules checklist configuration
  const modulesGrid = [
    { id: "MESSAGES", label: "Message Inbox", desc: "Buyer chats & inquiries", icon: MessageSquare, badge: buyerMessages.filter(c => c.unread > 0).length, iconColor: "text-blue-400" },
    { id: "ANALYTICS", label: "Business Analytics", desc: "Views & neighborhood stats", icon: BarChart2, iconColor: "text-purple-400" },
    { id: "PROFILE", label: "Store Public Profile", desc: "Logo, Location & NRC verification", icon: User, iconColor: "text-emerald-400" },
    { id: "AGENTS", label: "Affiliate Agents", desc: "Manage commission sellers", icon: Users, iconColor: "text-[#ffa500]" },
    { id: "NOTIFICATIONS", label: "Alert History", desc: "Log of payout & order notifications", icon: Bell, badge: sellerNotifications.filter(n => !n.read).length, iconColor: "text-rose-400" },
    { id: "SETTINGS", label: "Settings", desc: "Wallets, safety questions & language", icon: Settings, iconColor: "text-zinc-400" },
    { id: "HELP", label: "Help Center & Support", desc: "Live Chat, WhatsApp & FAQs", icon: HelpCircle, iconColor: "text-teal-400" }
  ];

  // Helper: Mark all notifications read
  const handleMarkAllNotificationsRead = () => {
    setSellerNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setToast({ message: "Notifications Cleared", subText: "Marked all alert items as read." });
  };

  // Helper: Change PIN state (need validation first)
  const [oldPinField, setOldPinField] = useState<string>("");
  const [newPinField, setNewPinField] = useState<string>("");
  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPinField !== sellerPinCode) {
      setToast({ message: "Incorrect PIN", subText: "The old PIN does not match our registry." });
      return;
    }
    if (newPinField.length !== 4 || isNaN(Number(newPinField))) {
      setToast({ message: "Invalid PIN Format", subText: "New PIN must be a 4-digit number." });
      return;
    }
    setSellerPinCode(newPinField);
    setOldPinField("");
    setNewPinField("");
    setToast({ message: "PIN Updated", subText: "Your secure merchant passcode has been modified." });
  };

  // Helper: Security questions
  const [secQ1, setSecQ1] = useState<string>("rex");
  const [secQ2, setSecQ2] = useState<string>("chizongwe");
  const [secQ3, setSecQ3] = useState<string>("lusaka");
  const handleSaveSecurityAnswers = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ message: "Answers Saved", subText: "Passcode secondary verification matrix encrypted." });
  };

  // Helper: Wallet setup
  const [customWalletNum, setCustomWalletNum] = useState<string>("");
  const [walletOperator, setWalletOperator] = useState<"Airtel" | "MTN" | "Zamtel">("Airtel");
  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWalletNum.trim()) return;
    const formatted = `${walletOperator} Money (+260${customWalletNum.trim()})`;
    setSellerPrimaryWallet(formatted);
    setCustomWalletNum("");
    setToast({ message: "Primary Wallet Changed", subText: `Saved ${formatted} as primary deposit channel.` });
  };

  // Helper: Agent commission rate adjustment
  const handleSaveAgentRate = (agentId: string) => {
    setAgentsList(prev => prev.map(ag => {
      if (ag.agent_id === agentId) {
        return { ...ag, commission_rate: editingAgentNewRate };
      }
      return ag;
    }));
    setEditingAgentId(null);
    setToast({ message: "Rate Adjusted", subText: `Commission adjusted to ${editingAgentNewRate}% net.` });
  };

  const handleRemoveAgent = (agentId: string, name: string) => {
    if (confirm(`Are you sure you want to offboard Agent ${name}?`)) {
      setAgentsList(prev => prev.filter(ag => ag.agent_id !== agentId));
      setToast({ message: "Agent Offboarded", subText: `Deactivated sales authorization keys for ${name}.` });
    }
  };

  const handleInviteAgentLink = () => {
    const link = `https://selonachipa.com/invite/agent?ref=sel-chipo&rate=10`;
    setToast({
      message: "WhatsApp Invite Copied!",
      subText: "Share the commission signup token on your social feeds."
    });
  };

  // Chat conversation helpers
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessageInput.trim() || !activeChatConversationId) return;

    setBuyerMessages(prev => prev.map(chat => {
      if (chat.id === activeChatConversationId) {
        const newMsg = {
          id: "m-user-" + Math.random(),
          sender: "seller",
          text: typedMessageInput,
          timestamp: "Just Now"
        };
        return {
          ...chat,
          preview: typedMessageInput,
          unread: 0,
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    }));

    setTypedMessageInput("");
  };

  const selectedConversation = buyerMessages.find(c => c.id === activeChatConversationId);

  // Profile Edit fields inline state
  const [isEditingStoreProfile, setIsEditingStoreProfile] = useState<boolean>(false);
  const [pStoreName, setPStoreName] = useState<string>(sellerStoreName);
  const [pSellerName, setPSellerName] = useState<string>(sellerName);
  const [pLocation, setPLocation] = useState<string>(sellerLocationLandmark);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSellerStoreName(pStoreName);
    setSellerName(pSellerName);
    setSellerLocationLandmark(pLocation);
    setIsEditingStoreProfile(false);
    setToast({ message: "Profile Saved ✓", subText: "Store identity has been updated globally." });
  };

  // FAQs search help Article helper
  const [helpSearch, setHelpSearch] = useState<string>("");
  const helpArticles = [
    { q: "How to add a video listing?", a: "Tap Listings tab, click NEW, then choose In-App Video or file gallery. Wait for the 5-step AI pilot to formulate tags before hitting Publish." },
    { q: "What are payout charges via Lipila?", a: "Each settlement incurs a flat 5% platform listing fee. Your balance transfers immediately to your primary Airtel or MTN wallet." },
    { q: "How are agent commissions calculated?", a: "When your affiliate sells, their commission percentage is taken from sub-ledger, 5% of their payout goes to Selonachipa, net returns to your wallet." },
    { d: "Support Contacts:", a: "WhatsApp: +260978070734 (Active 24/7 during market harvest hours)" }
  ].filter(art => {
    if (!helpSearch.trim()) return true;
    const term = helpSearch.toLowerCase();
    return art.q?.toLowerCase().includes(term) || art.a?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4 animate-fadeIn text-left">
      <AnimatePresence mode="wait">
        {!activeModule ? (
          /* State A: Main "More" Menu options lists */
          <motion.div 
            key="modules-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
              <span className="text-[9.5px] uppercase font-mono tracking-widest text-zinc-500 font-extrabold block">Merchant Utilities</span>
              <h3 className="text-sm font-black text-white mt-1">Extended Tools</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">Access customer chats, local geo-analytics, commission agents, and payout configurations.</p>
            </div>

            {/* Grid menu list */}
            <div className="grid grid-cols-1 gap-2">
              {modulesGrid.map((m) => {
                const IconComp = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveModule(m.id);
                      if (m.id === "MESSAGES") {
                        // Mark active chat conversations unread count to 0 if entered
                      }
                    }}
                    className="w-full bg-[#0c0d12] hover:bg-zinc-900 border border-zinc-900 p-3.5 rounded-xl flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-zinc-950 border border-zinc-850 flex items-center justify-center shrink-0 ${m.iconColor}`}>
                        <IconComp className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                          <span>{m.label}</span>
                          {m.badge ? (
                            <span className="bg-rose-550 border border-rose-900/40 text-rose-100 text-[8.5px] font-black font-mono px-1.5 py-0.5 rounded-full">
                              {m.badge} unread
                            </span>
                          ) : null}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">{m.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-650 font-sans">→</span>
                  </button>
                );
              })}

              {/* Log Out Button at the bottom as mandated */}
              <button
                type="button"
                onClick={onLogout}
                className="w-full p-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Log Out of Merchant Portal</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* State B: Dedicated Sub-Module Screens */
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-4"
          >
            {/* Nav Back Header */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <button
                onClick={() => {
                  setActiveModule(null);
                  setActiveChatConversationId(null);
                }}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-bold font-mono outline-none bg-transparent border-none cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Merchant Tools</span>
              </button>
              <span className="text-[9.5px] font-mono uppercase bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                ⚙️ {activeModule}
              </span>
            </div>

            {/* Sub-modules Detail Switcher */}

            {/* ======================================================== */}
            {/* 1. MESSAGES MODULE                                       */}
            {/* ======================================================== */}
            {activeModule === "MESSAGES" && (
              <div className="space-y-4 animate-fadeIn">
                {!activeChatConversationId ? (
                  /* Conversation list */
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-450 font-bold px-1 block">
                      Active Customer Inquiries
                    </label>
                    <div className="space-y-2">
                      {buyerMessages.map((chat) => (
                        <div 
                          key={chat.id}
                          onClick={() => {
                            setActiveChatConversationId(chat.id);
                            // Mark read
                            setBuyerMessages(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                          }}
                          className={`p-3.5 rounded-xl border flex gap-3 cursor-pointer transition-colors items-start ${
                            chat.unread > 0 
                              ? "bg-blue-550/5 border-blue-500/20" 
                              : "bg-[#0c0d12] border-zinc-900 hover:border-zinc-850"
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                            {chat.initials}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{chat.name}</span>
                                {chat.unread > 0 && (
                                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                )}
                              </h4>
                              <span className="text-[9.5px] text-zinc-650 font-mono">{chat.timestamp}</span>
                            </div>
                            <p className="text-[10px] text-zinc-550 font-mono mt-0.5">Linked Order: {chat.orderId}</p>
                            <p className="text-[11.5px] text-zinc-300 pr-2 mt-1 truncate leading-tight">{chat.preview}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Active chat conversation thread */
                  <div className="space-y-3 bg-[#0c0d12] border border-zinc-900 rounded-2xl p-4 flex flex-col h-[400px]">
                    <div className="flex items-center gap-3 border-b border-zinc-900 pb-2.5">
                      <button
                        onClick={() => setActiveChatConversationId(null)}
                        className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
                      >
                        ←
                      </button>
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                        {selectedConversation?.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-whiteLeading truncate">{selectedConversation?.name}</h4>
                        <p className="text-[9.5px] text-zinc-500 font-mono">Inquiry linked to Order: {selectedConversation?.orderId}</p>
                      </div>
                    </div>

                    {/* Messages Body Scroll overflow */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 pt-1.5">
                      {selectedConversation?.messages.map((m: any) => {
                        const isSellersMsg = m.sender === "seller";
                        return (
                          <div 
                            key={m.id}
                            className={`flex ${isSellersMsg ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`p-3 max-w-[85%] rounded-2xl text-xs leading-normal ${
                              isSellersMsg 
                                ? "bg-blue-600 text-white rounded-tr-none" 
                                : "bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-850"
                            }`}>
                              <p className="font-medium">{m.text}</p>
                              <span className="text-[8.5px] text-zinc-450 block text-right mt-1 font-mono">{m.timestamp}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat quick attachment references panel */}
                    <div className="flex gap-2 bg-[#050506] p-1 px-2 rounded-lg border border-zinc-900 shrink-0 text-[10px] text-zinc-450 items-center justify-between">
                      <span className="font-mono">📎 Insert Listing Attachment:</span>
                      <button
                        onClick={() => {
                          setTypedMessageInput(typedMessageInput + " Check my live organic catalog listing: Chisamba Sweet Maize (K45)");
                          setToast({ message: "Attached maize listing info", subText: "Click send to transmit." });
                        }}
                        className="py-0.5 px-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[#ffa550] font-bold font-mono"
                      >
                        Maize
                      </button>
                    </div>

                    {/* Text field input */}
                    <form onSubmit={handleSendChatMessage} className="flex gap-2 shrink-0">
                      <input
                        type="text"
                        required
                        value={typedMessageInput}
                        onChange={(e) => setTypedMessageInput(e.target.value)}
                        placeholder="Type reply..."
                        className="flex-1 bg-[#050506] border border-zinc-805 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 rounded-xl"
                      />
                      <button
                        type="submit"
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. ANALYTICS MODULE                                      */}
            {/* ======================================================== */}
            {activeModule === "ANALYTICS" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-[#0c0d12] border border-zinc-900 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-xs font-black uppercase text-zinc-400 font-mono tracking-widest">Harvest intelligence</h3>
                    <p className="text-[10px] text-zinc-550 leading-relaxed">Geographical visitor ratios</p>
                  </div>
                  {/* Date ranges */}
                  <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                    {["TODAY", "7DAYS", "30DAYS"].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setAnalyticsDateRange(range as any);
                          setToast({ message: `Reporting Adjusted: ${range}`, subText: "Recalculating visitor profiles..." });
                        }}
                        className={`px-2 py-1 text-[9px] font-bold rounded-lg cursor-pointer ${
                          analyticsDateRange === range ? "bg-[#ffa500] text-black" : "text-zinc-500"
                        }`}
                      >
                        {range === "7DAYS" ? "7 Days" : range === "30DAYS" ? "30 Days" : "Today"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-zinc-950/40 border border-zinc-900 p-3 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Total video views</span>
                    <p className="text-lg font-black font-mono text-white mt-0.5">14,240 <span className="text-[10px] text-emerald-450 font-bold font-sans">+18M</span></p>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900 p-3 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Conversion rate</span>
                    <p className="text-lg font-black font-mono text-white mt-0.5">3.12% <span className="text-[10px] text-emerald-450 font-bold font-sans">✓</span></p>
                  </div>
                  <div className="bg-zinc-950/40 border border-[#ffa500]/10 p-3 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Average order value</span>
                    <p className="text-lg font-black font-mono text-white mt-0.5">K 105.00 <span className="text-[10px] text-zinc-500 font-sans">ZMW</span></p>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-900 p-3 rounded-xl">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Repeat buyer rate</span>
                    <p className="text-lg font-black font-mono text-white mt-0.5">34.5% <span className="text-[10px] text-[#ffa550] font-sans">High</span></p>
                  </div>
                </div>

                {/* Ranked top listings and geoneighborhood list as requested */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                  {/* Top listings */}
                  <div className="bg-[#0c0d12] border border-zinc-900 p-4 rounded-xl space-y-2.5">
                    <label className="text-[10px] font-black uppercase font-mono tracking-widest text-[#ffa500]">
                      Top Ranked Listings by Views
                    </label>
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between items-center text-zinc-200">
                        <span>1. Chisamba Sweet Maize</span>
                        <span className="text-[#ffa500]">840 views</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>2. Fresh Choma Groundnuts</span>
                        <span>410 views</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-550">
                        <span>3. organic honey harvest</span>
                        <span>125 views</span>
                      </div>
                    </div>
                  </div>

                  {/* Geographical */}
                  <div className="bg-[#0c0d12] border border-zinc-900 p-4 rounded-xl space-y-2.5">
                    <label className="text-[10px] font-black uppercase font-mono tracking-widest text-emerald-400">
                      Buyer Locations (Zambia Zones)
                    </label>
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between items-center text-zinc-200">
                        <span>Munali, Lusaka</span>
                        <span className="text-emerald-400 font-bold">34% buyers</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Chelstone, Lusaka</span>
                        <span>22% buyers</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-550">
                        <span>Kabulonga, Lusaka</span>
                        <span>18% buyers</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-550">
                        <span>Ndola Central</span>
                        <span>12% buyers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. STORE PROFILE MODULE                                  */}
            {/* ======================================================== */}
            {activeModule === "PROFILE" && (
              <div className="space-y-4 animate-fadeIn">
                {!isEditingStoreProfile ? (
                  <div className="space-y-4">
                    {/* Public card banner preview */}
                    <div className="bg-gradient-to-r from-teal-950/20 to-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden text-left relative flex flex-col p-4 space-y-3.5">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-base font-black rounded-full flex items-center justify-center shadow">
                          CM
                        </div>
                        <div>
                          <span className="text-[9.5px] uppercase font-mono bg-emerald-500/10 border border-emerald-555/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">✓ KYC VERIFIED MERCHANT</span>
                          <h4 className="text-sm font-black text-white mt-1">{sellerStoreName}</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Landmark: {sellerLocationLandmark}</p>
                        </div>
                      </div>

                      {/* Score metrics */}
                      <div className="grid grid-cols-3 gap-2 border-t border-zinc-900 pt-3.5 text-center font-mono">
                        <div>
                          <p className="text-xs font-black text-white">4.92 ★</p>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold">Rating score</span>
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">100%</p>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold text-xs">KYC status</span>
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">K 50K+</p>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold text-xs">Limit cap</span>
                        </div>
                      </div>
                    </div>

                    {/* KYC checklist indicators showing phone and wallet as verified */}
                    <div className="bg-[#0c0d12] border border-zinc-900 p-4 rounded-xl space-y-3">
                      <label className="text-[10px] font-black uppercase font-mono tracking-widest text-zinc-450 block">KYC Verification Checkpoints</label>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-300">✓ Phone number registration verified</span>
                          <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8.5px] font-bold text-emerald-400 font-mono">COMPLETE</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-300">✓ Mobile Money wallet match KYC</span>
                          <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8.5px] font-bold text-emerald-400 font-mono">COMPLETE</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-300">✓ NRC & Portrait submitted</span>
                          <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8.5px] font-bold text-emerald-400 font-mono">COMPLETE</span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle edit button */}
                    <button
                      onClick={() => {
                        setPStoreName(sellerStoreName);
                        setPSellerName(sellerName);
                        setPLocation(sellerLocationLandmark);
                        setIsEditingStoreProfile(true);
                      }}
                      className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 active:scale-98 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Edit Store Information</span>
                    </button>
                  </div>
                ) : (
                  /* Edit public profile details form */
                  <form onSubmit={handleSaveProfile} className="bg-[#0c0d12] border border-zinc-900 p-4 rounded-2xl space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Registered Store Name</label>
                      <input
                        type="text"
                        required
                        value={pStoreName}
                        onChange={(e) => setPStoreName(e.target.value)}
                        className="w-full bg-[#050506] border border-zinc-800 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Merchant Operator Name</label>
                      <input
                        type="text"
                        required
                        value={pSellerName}
                        onChange={(e) => setPSellerName(e.target.value)}
                        className="w-full bg-[#050506] border border-zinc-800 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Store Landmark Description</label>
                      <input
                        type="text"
                        required
                        value={pLocation}
                        onChange={(e) => setPLocation(e.target.value)}
                        className="w-full bg-[#050506] border border-zinc-800 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white font-medium"
                      />
                    </div>

                    <div className="pt-3.5 flex gap-2 border-t border-zinc-905">
                      <button
                        type="button"
                        onClick={() => setIsEditingStoreProfile(false)}
                        className="flex-1 py-1.5 bg-zinc-900 text-zinc-400 text-xs font-bold rounded-lg border border-zinc-800 cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-[#ffa500] text-black text-xs font-black rounded-lg hover:bg-[#e09100] cursor-pointer text-center"
                      >
                        Apply Profile Updates
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* 4. AGENTS MODULE                                         */}
            {/* ======================================================== */}
            {activeModule === "AGENTS" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Commission structure explanation cards */}
                <div className="bg-[#120f0a] border border-[#ffa500]/15 p-4 rounded-xl text-left text-xs leading-relaxed space-y-1">
                  <h4 className="text-xs font-bold text-[#ffa550] flex items-center gap-1.5">
                    <span>Affiliate Commission Split Rules</span>
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    If an assigned agent sells an item:
                  </p>
                  <ul className="list-disc list-inside text-[9.5px] text-zinc-500 font-mono space-y-1 pl-1">
                    <li>Agent gathers orders & shares the link on WhatsApp chats.</li>
                    <li>They receive their commission instantly upon Escrow Handover.</li>
                    <li>Menurut Undang: 5% of their commission is deducted automatically as platform fees.</li>
                    <li>Your net profit is: (Total Sale Price - Commission Paid).</li>
                  </ul>
                </div>

                {/* Agents List */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-[#ffa500] font-bold px-1 block">
                    My Active Commission Agents
                  </label>
                  
                  {agentsList.length === 0 ? (
                    <p className="text-xs text-zinc-550 text-center py-4">No agents registered. Tap invite below to onboard commission sellers.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {agentsList.map((ag) => (
                        <div 
                          key={ag.agent_id}
                          className="bg-[#0c0d12] border border-zinc-900 p-4 rounded-2xl space-y-3"
                        >
                          <div className="flex justify-between items-start border-b border-zinc-900/60 pb-2">
                            <div>
                              <h4 className="text-xs font-extrabold text-white">{ag.name}</h4>
                              <p className="text-[9.5px] text-zinc-500 font-mono mt-0.5">Affiliated: {ag.activeSince}</p>
                            </div>
                            <span className="bg-[#ffa550]/10 border border-[#ffa500]/25 px-2 py-0.5 text-xs font-black font-mono text-[#ffa550] rounded-lg">
                              {ag.commission_rate}% Rate
                            </span>
                          </div>

                          <div className="text-[10.5px] text-zinc-400 font-mono flex justify-between">
                            <span>Sales Completed: <strong>{ag.monthly_sales} items</strong></span>
                            <span className="text-zinc-500">Commission Paid: <strong>K {ag.total_commission_paid}</strong></span>
                          </div>

                          {/* Quick inline Commission rate adjustments */}
                          {editingAgentId === ag.agent_id ? (
                            <div className="bg-[#050506] border border-zinc-850 p-2.5 rounded-xl flex items-center justify-between gap-3 animate-slideDown">
                              <div>
                                <label className="text-[8px] font-mono text-zinc-500 block">ADJUST PERCENT</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={50}
                                  value={editingAgentNewRate}
                                  onChange={(e) => setEditingAgentNewRate(Number(e.target.value))}
                                  className="w-16 bg-[#0c0d12] border border-zinc-800 text-xs px-2 py-1 focus:outline-none text-white font-mono"
                                />
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingAgentId(null)}
                                  className="py-1 px-2.5 bg-zinc-900 text-zinc-400 hover:text-white rounded text-[10px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveAgentRate(ag.agent_id)}
                                  className="py-1 px-2.5 bg-[#ffa500] text-black font-bold rounded text-[10px] cursor-pointer"
                                >
                                  Save Rate
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAgentId(ag.agent_id);
                                  setEditingAgentNewRate(ag.commission_rate);
                                }}
                                className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 transition-all"
                              >
                                Edit Rate %
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAgent(ag.agent_id, ag.name)}
                                className="flex-1 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-450 border border-rose-900/10 text-[10px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 transition-all"
                              >
                                Remove Agent
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recruiting Button */}
                <button
                  type="button"
                  onClick={handleInviteAgentLink}
                  className="w-full py-2.5 bg-[#ffa500] hover:bg-[#e09100] text-black font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow"
                >
                  <span>Invite/Onboard an Agent</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* 5. NOTIFICATIONS MODULE                                  */}
            {/* ======================================================== */}
            {activeModule === "NOTIFICATIONS" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-450 font-bold block">
                    Secured Alert Logs
                  </label>
                  {sellerNotifications.some(n => !n.read) && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-[11px] text-[#ffa550] hover:underline font-bold bg-transparent border-none outline-none cursor-pointer"
                    >
                      ✓ Mark all read
                    </button>
                  )}
                </div>

                {/* Chronicle lists */}
                <div className="space-y-2">
                  {sellerNotifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-3.5 rounded-2xl border text-xs text-left transition-colors relative ${
                        !n.read 
                          ? "bg-rose-550/5 border-rose-500/20 shadow-sm" 
                          : "bg-[#0c0d12] border-zinc-900"
                      }`}
                    >
                      {!n.read && (
                        <div className="absolute right-3.5 top-3.5 w-2 h-2 rounded-full bg-rose-550 shrink-0" />
                      )}
                      
                      <h4 className={`text-xs font-black pr-5 ${!n.read ? "text-rose-400" : "text-white"}`}>
                        {n.title}
                      </h4>
                      <p className="text-[11.5px] leading-snug text-zinc-300 mt-1">{n.body}</p>
                      
                      <span className="text-[9px] text-zinc-650 font-mono mt-1.5 block">
                        {n.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 6. SETTINGS MODULE                                       */}
            {/* ======================================================== */}
            {activeModule === "SETTINGS" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-[#0c0d12] border border-zinc-900 p-4 rounded-xl space-y-3.5">
                  <div className="border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-black uppercase text-zinc-400 font-mono tracking-widest">Account & Wallets</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Manage payout operator & passcodes.</p>
                  </div>

                  {/* Wallet Config */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Mobile money settlement channel</label>
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 text-xs text-zinc-300">
                      Current payout destination: <strong className="text-emerald-400 font-mono">{sellerPrimaryWallet}</strong>
                    </div>

                    {/* Change wallet form */}
                    <form onSubmit={handleAddWallet} className="space-y-2 pt-1">
                      <div className="grid grid-cols-3 gap-1">
                        {["Airtel", "MTN", "Zamtel"].map((op) => (
                          <button
                            key={op}
                            type="button"
                            onClick={() => setWalletOperator(op as any)}
                            className={`py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                              walletOperator === op ? "bg-[#ffa500] text-black" : "bg-zinc-900 text-zinc-450 border border-zinc-80 border-none"
                            }`}
                          >
                            {op} MoMo
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <span className="bg-zinc-900 text-zinc-400 text-xs px-2 py-1.5 rounded-lg border border-zinc-800 flex items-center font-mono">+260</span>
                        <input
                          type="text"
                          required
                          placeholder="97561928..."
                          value={customWalletNum}
                          onChange={(e) => setCustomWalletNum(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#ffa500] focus:outline-none px-3 py-1 text-xs rounded-lg text-white font-mono"
                        />
                        <button
                          type="submit"
                          className="px-3 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Change PIN form */}
                  <form onSubmit={handleUpdatePin} className="space-y-2 border-t border-zinc-900/60 pt-3.5">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase font-mono">Update login Passcode</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="Old PIN"
                        value={oldPinField}
                        onChange={(e) => setOldPinField(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#ffa500] focus:outline-none px-3 py-1.5 text-xs text-center rounded-lg text-white font-mono"
                      />
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="New PIN"
                        value={newPinField}
                        onChange={(e) => setNewPinField(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#ffa500] focus:outline-none px-3 py-1.5 text-xs text-center rounded-lg text-white font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-[#ffa500] text-black text-[10px] font-black rounded-lg cursor-pointer"
                      >
                        Adjust
                      </button>
                    </div>
                  </form>
                </div>

                {/* Subscriptions Options preference form */}
                <div className="bg-[#0c0d12] border border-zinc-900 p-4 rounded-xl space-y-3.5">
                  <div className="border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-black uppercase text-zinc-400 font-mono tracking-widest">Preferences & Language</h3>
                    <p className="text-[10px] text-zinc-550 mt-0.5">Toggle alert channels and dialects.</p>
                  </div>

                  {/* Pref toggles */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-zinc-300">
                      <span>SMS Dispatch notifications</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifyPreferences({ ...notifyPreferences, sms: !notifyPreferences.sms });
                          setToast({ message: "SMS Settings updated", subText: "Modified telemetry messaging channels." });
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-all outline-none border-none cursor-pointer ${
                          notifyPreferences.sms ? "bg-[#ffa550] flex justify-end" : "bg-zinc-850 flex justify-start"
                        }`}
                      >
                        <div className="w-4 h-4 bg-black rounded-full" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-xs text-zinc-300">
                      <span>In-App secure telemetry notifications</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifyPreferences({ ...notifyPreferences, inApp: !notifyPreferences.inApp });
                          setToast({ message: "In-App updated", subText: "In-app dashboard alerts updated." });
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-all outline-none border-none cursor-pointer ${
                          notifyPreferences.inApp ? "bg-[#ffa550] flex justify-end" : "bg-zinc-850 flex justify-start"
                        }`}
                      >
                        <div className="w-4 h-4 bg-black rounded-full" />
                      </button>
                    </div>
                  </div>

                  {/* Language Dialect filter */}
                  <div className="space-y-1.5 border-t border-zinc-900/60 pt-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">App language / Dialect</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["English", "Bemba", "Nyanja"].map((lang) => (
                        <button
                          type="button"
                          key={lang}
                          onClick={() => {
                            setSellerLanguage(lang as any);
                            setToast({ message: `Language changed to ${lang}`, subText: "App layout language updated successfully." });
                          }}
                          className={`py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-colors ${
                            sellerLanguage === lang ? "bg-[#ffa500] text-black font-extrabold" : "bg-zinc-950 text-zinc-500 border border-zinc-900"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 7. HELP MODULE                                           */}
            {/* ======================================================== */}
            {activeModule === "HELP" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="relative bg-zinc-950/40 p-1 rounded-xl border border-zinc-905 flex items-center pr-3">
                  <input
                    type="text"
                    placeholder="Search seller FAQs..."
                    value={helpSearch}
                    onChange={(e) => setHelpSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-3 py-1.5 text-xs text-white"
                  />
                  <Search className="w-4 h-4 text-zinc-550 shrink-0" />
                </div>

                {/* FAQ Answers List */}
                <div className="space-y-2.5">
                  {helpArticles.map((art, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#0c0d12] border border-zinc-900 p-3.5 rounded-2xl text-left text-xs leading-relaxed"
                    >
                      {art.q ? (
                        <h4 className="font-extrabold text-white mb-1.5 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-[#ffa550] shrink-0 stroke-[3]" />
                          <span>{art.q}</span>
                        </h4>
                      ) : null}
                      <p className="text-zinc-400 text-[11px] leading-snug">{art.a}</p>
                    </div>
                  ))}
                </div>

                {/* Direct contact options with indicator */}
                <div className="bg-[#050506] border border-zinc-900 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center bg-zinc-900/40 p-2.5 border border-zinc-850 rounded-xl text-xs">
                    <div>
                      <p className="font-black text-white">Live Workspace Chat</p>
                      <p className="text-[9.5px] text-zinc-500">Response time: &lt; 5 mins active</p>
                    </div>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={() => setToast({ message: "Connecting Secure Chat thread", subText: "Triage agent is analyzing your session ledger..." })}
                      className="py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-800 text-center"
                    >
                      <span>Start Live Chat</span>
                    </button>

                    {/* Highly requested WhatsApp support line line */}
                    <a
                      href="https://wa.me/260978070734"
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="py-2.5 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-[#050506] rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer text-center select-none"
                    >
                      <Phone className="w-4 h-4 fill-[#050506]" />
                      <span>WhatsApp Support</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
