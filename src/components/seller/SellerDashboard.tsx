import { Play, ClipboardList, Coins, TrendingUp, AlertTriangle, Plus, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Volume2, Cpu, Captions, Check } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Listing, Order } from "../../types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface SellerDashboardProps {
  listings: Listing[];
  setListings?: React.Dispatch<React.SetStateAction<Listing[]>>;
  orders: Order[];
  onAddListingClick: () => void;
  onNavigateTab: (tab: "HOME" | "ORDERS" | "LISTINGS" | "EARNINGS" | "MORE" | "PARCELS") => void;
  sellerStoreName: string;
}

const PERFORMANCE_30_DAYS = [
  { day: "Day 1", views: 240, sales: 120 },
  { day: "Day 3", views: 310, sales: 154 },
  { day: "Day 6", views: 280, sales: 180 },
  { day: "Day 9", views: 350, sales: 220 },
  { day: "Day 12", views: 420, sales: 250 },
  { day: "Day 15", views: 410, sales: 310 },
  { day: "Day 18", views: 390, sales: 280 },
  { day: "Day 21", views: 480, sales: 340 },
  { day: "Day 24", views: 510, sales: 400 },
  { day: "Day 27", views: 550, sales: 420 },
  { day: "Day 30", views: 610, sales: 485 }
];

export default function SellerDashboard({
  listings,
  setListings,
  orders,
  onAddListingClick,
  onNavigateTab,
  sellerStoreName
}: SellerDashboardProps) {
  // Compute Stats
  const activeSellerListings = listings.filter(l => l.seller_id === "sel-chipo");
  
  const [selectedConfigListingId, setSelectedConfigListingId] = useState<string>("");
  const [activeTransitionPreviewState, setActiveTransitionPreviewState] = useState<number>(0);

  useEffect(() => {
    if (activeSellerListings.length > 0 && !selectedConfigListingId) {
      setSelectedConfigListingId(activeSellerListings[0].listing_id);
    }
  }, [activeSellerListings, selectedConfigListingId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTransitionPreviewState(p => (p === 0 ? 1 : 0));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const pendingOrdersCount = orders.filter(o => o.seller_id === "sel-chipo" && o.transit_status === "pending_seller_confirmation").length;
  
  // Hardcoded counts for fidelity
  const todaysRevenue = 4850.00;
  const thisMonthRevenue = 84200.00;
  const thisMonthOrders = 45;
  const isLowStockAlertActive = true; 

  const recentTimeline = [
    { id: 1, type: "order", badge: "NEW", desc: "Clara Mwamba ordered 2 x Chisamba Sweet Maize", badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20", time: "10 mins ago" },
    { id: 2, type: "trending", badge: "TRENDING", desc: "Chisamba Sweet Maize Reel is trending hot in Munali! (450+ views)", badgeColor: "bg-[#ffa500]/10 text-[#ffa500] border-[#ffa500]/20", time: "2 hours ago" },
    { id: 3, type: "payout", badge: "PAYOUT", desc: "K 1,050.50 transferred securely via Lipila escrow to your Airtel wallet", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", time: "Yesterday" }
  ];

  return (
    <div className="space-y-5 animate-fadeIn text-left pt-1">
      {/* Brand Greeting */}
      <div className="flex justify-between items-center bg-gradient-to-br from-teal-950/20 via-zinc-950 to-zinc-950 px-4 py-3.5 rounded-2xl border border-zinc-900">
        <div>
          <span className="text-[9.5px] font-mono tracking-widest text-[#ffa500] font-extrabold block">
            OFFICIAL PARTNER PORTAL
          </span>
          <h2 className="text-base font-extrabold text-white mt-0.5">{sellerStoreName}</h2>
          <p className="text-[10px] text-zinc-400">Manage real-time escrow logs & organic video campaigns</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-550/20 px-2 py-1 rounded-xl flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[9px] font-bold text-emerald-400 font-mono">KYC COMPLETE</span>
        </div>
      </div>

      {/* Stats 4-Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Today's Revenue */}
        <div className="bg-[#0c0d12] border border-zinc-850 p-3 rounded-2xl flex flex-col justify-between h-[100px]">
          <div>
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Today's Revenue</span>
            <p className="text-base font-black text-white mt-1">K {todaysRevenue.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
              +12.4%
            </span>
            <span className="text-[8px] text-zinc-500 font-mono">vs yesterday</span>
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div 
          onClick={() => onNavigateTab("ORDERS")}
          className={`border p-3 rounded-2xl flex flex-col justify-between h-[100px] cursor-pointer transition-all ${
            pendingOrdersCount > 0 
              ? "bg-[#18120c] border-[#ffa500]/40 ring-1 ring-[#ffa500]/10 hover:border-[#ffa500]" 
              : "bg-[#0c0d12] border-zinc-850 hover:border-zinc-800"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Pending Orders</span>
            {pendingOrdersCount > 0 && <span className="w-2 h-2 rounded-full bg-[#ffa500] animate-pulse"></span>}
          </div>
          <div>
            <p className="text-xl font-black text-white">
              {pendingOrdersCount} {pendingOrdersCount === 1 ? "order" : "orders"}
            </p>
            {pendingOrdersCount > 0 ? (
              <p className="text-[9px] text-[#ffa500] font-bold mt-1.5 flex items-center gap-1 bg-[#ffa500]/5 py-0.5 px-1.5 rounded border border-[#ffa500]/10">
                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                Action required! Confirm collection
              </p>
            ) : (
              <p className="text-[9px] text-zinc-500 mt-2 font-mono">No actions waiting</p>
            )}
          </div>
        </div>

        {/* Card 3: Active Listings */}
        <div 
          onClick={() => onNavigateTab("LISTINGS")}
          className="bg-[#0c0d12] border border-zinc-850 p-3 rounded-2xl flex flex-col justify-between h-[100px] cursor-pointer hover:border-zinc-800"
        >
          <div>
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Active Listings</span>
            <p className="text-base font-black text-white mt-1">{activeSellerListings.length} items live</p>
          </div>
          {isLowStockAlertActive ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5 text-[8.5px] text-red-400 font-extrabold flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" />
              1 Listing is low stock!
            </div>
          ) : (
            <span className="text-[9.5px] text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-555/10 inline-block text-center text-xs">Healthy stock levels</span>
          )}
        </div>

        {/* Card 4: Month Performance */}
        <div className="bg-[#0c0d12] border border-zinc-850 p-3 rounded-2xl flex flex-col justify-between h-[100px]">
          <div>
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">This Month Total</span>
            <p className="text-base font-black text-white mt-1">K {(thisMonthRevenue).toLocaleString()}</p>
          </div>
          <div className="text-[9px] text-zinc-400 font-mono">
            <strong>{thisMonthOrders}</strong> orders completed successfully
          </div>
        </div>
      </div>

      {/* Prominent Add Listing Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onAddListingClick}
        className="w-full bg-[#ffa500] hover:bg-[#e09100] text-black font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 text-xs uppercase tracking-wide transition-all"
      >
        <Plus className="w-4 h-4 text-black stroke-[3px]" />
        <span>+ Record a Video or Use Photos</span>
      </motion.button>

      {/* 🎬 PRODUCE VIDEO CONSOLE: TRANSITIONS, ASSEMBLYAI AUTO-CC & AI AUDIO NOISE SUPPRESSION */}
      <div className="bg-[#05060a] border border-cyan-500/10 hover:border-cyan-500/20 rounded-2xl p-4 space-y-4 shadow-xl text-left bg-gradient-to-b from-[#090b14] to-[#040509]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              Video & Audio Enhancer Console
            </h3>
          </div>
          <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/15 uppercase">
            Runway & AssemblyAI Shards
          </span>
        </div>

        {activeSellerListings.length === 0 ? (
          <p className="text-[10px] text-zinc-500 italic mt-1 text-center">
            Upload or record a produce listing video to unlock transition and AI audio features!
          </p>
        ) : (
          <div className="space-y-4">
            {/* 1. Selector for Active Listing to customize */}
            <div>
              <label className="block text-[8.5px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 leading-none">
                Choose Listing to Configure:
              </label>
              <select
                value={selectedConfigListingId}
                onChange={(e) => setSelectedConfigListingId(e.target.value)}
                className="w-full h-9 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-xs px-2.5 focus:outline-none focus:border-cyan-500"
              >
                {activeSellerListings.map(listing => (
                  <option key={listing.listing_id} value={listing.listing_id}>
                    {listing.thumbnail} {listing.title} (K {listing.suggested_price})
                  </option>
                ))}
              </select>
            </div>

            {/* Compute selected Listing */}
            {(() => {
              const currentListing = activeSellerListings.find(l => l.listing_id === selectedConfigListingId) || activeSellerListings[0];
              if (!currentListing) return null;

              const activeTransitionOfListing = currentListing.transition_effect || "Fade";
              const activeNoiseOfListing = currentListing.noise_reduction || false;

              return (
                <div className="space-y-4">
                  {/* Transition Selection Segmented Panel button cluster */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[8.5px] font-bold text-zinc-350 uppercase tracking-widest leading-none">
                        Video Clip Transition Style
                      </label>
                      <span className="text-[8.5px] font-mono text-cyan-500 font-extrabold uppercase">
                        Current: {activeTransitionOfListing}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(["Fade", "Slide", "Zoom"] as const).map((style) => {
                        const isSelected = activeTransitionOfListing === style;
                        return (
                          <button
                            type="button"
                            key={style}
                            onClick={() => {
                              if (setListings) {
                                setListings(prev => prev.map(l => l.listing_id === currentListing.listing_id ? { ...l, transition_effect: style } : l));
                              } else {
                                currentListing.transition_effect = style;
                              }
                            }}
                            className={`py-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-cyan-500/10 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.1)] font-bold"
                                : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-850 hover:text-zinc-350"
                            }`}
                          >
                            <span className="text-[10.5px] font-bold">{style}</span>
                            <span className="text-[7.5px] font-mono opacity-80 uppercase">
                              {style === "Fade" ? "Cross Dissolve" : style === "Slide" ? "Push Left" : "In & Out"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 🎞️ Real-time micro animations sandbox visualizer of the transition! */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex flex-col items-center justify-center overflow-hidden h-[110px] relative">
                    <span className="absolute top-2 left-2 text-[7.5px] font-mono font-bold text-zinc-650 tracking-wider">
                      LIVE SANDBOX DEMO
                    </span>
                    
                    <div className="flex items-center gap-3 w-10/12 justify-center mt-2.5">
                      <AnimatePresence mode="wait">
                        {activeTransitionPreviewState === 0 ? (
                          <motion.div
                            key="clip-a"
                            initial={
                              activeTransitionOfListing === "Fade"
                                ? { opacity: 0 }
                                : activeTransitionOfListing === "Slide"
                                ? { x: -80, opacity: 0 }
                                : { scale: 0.8, opacity: 0 }
                            }
                            animate={{ x: 0, scale: 1, opacity: 1 }}
                            exit={
                              activeTransitionOfListing === "Fade"
                                ? { opacity: 0 }
                                : activeTransitionOfListing === "Slide"
                                ? { x: 80, opacity: 0 }
                                : { scale: 1.2, opacity: 0 }
                            }
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="bg-sky-950/40 border border-sky-450 h-11 px-3 rounded-lg flex items-center gap-1.5 shrink-0"
                          >
                            <span className="text-sm">🌅</span>
                            <span className="text-[10px] font-mono font-bold text-sky-400">Clip Feed A</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="clip-b"
                            initial={
                              activeTransitionOfListing === "Fade"
                                ? { opacity: 0 }
                                : activeTransitionOfListing === "Slide"
                                ? { x: 80, opacity: 0 }
                                : { scale: 0.8, opacity: 0 }
                            }
                            animate={{ x: 0, scale: 1, opacity: 1 }}
                            exit={
                              activeTransitionOfListing === "Fade"
                                ? { opacity: 0 }
                                : activeTransitionOfListing === "Slide"
                                ? { x: -80, opacity: 0 }
                                : { scale: 1.2, opacity: 0 }
                            }
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="bg-emerald-950/40 border border-emerald-450 h-11 px-3 rounded-lg flex items-center gap-1.5 shrink-0"
                          >
                            <span className="text-sm">🌾</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">Clip Feed B</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <span className="text-[8px] text-zinc-500 font-sans mt-2.5 italic">
                      Simulated {activeTransitionOfListing} loop at 2.5s intervals
                    </span>
                  </div>

                  {/* 🎙️ Audio Settings: AI Noise Reduction & Captions Info */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                        <div>
                          <p className="text-[10px] font-bold text-zinc-200">AI Noise Reduction Toggle</p>
                          <p className="text-[8px] text-zinc-500">Filter background wind/chatter in Lusaka</p>
                        </div>
                      </div>

                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (setListings) {
                            setListings(prev => prev.map(l => l.listing_id === currentListing.listing_id ? { ...l, noise_reduction: !activeNoiseOfListing } : l));
                          } else {
                            currentListing.noise_reduction = !activeNoiseOfListing;
                          }
                        }}
                        className={`w-11 h-6 rounded-full transition-all focus:outline-none flex items-center p-1 cursor-pointer ${
                          activeNoiseOfListing ? "bg-amber-500" : "bg-zinc-800"
                        }`}
                      >
                        <motion.div
                          className="bg-black w-4 h-4 rounded-full shadow-md"
                          animate={{ x: activeNoiseOfListing ? 20 : 0 }}
                          transition={{ type: "spring", stiffness: 450, damping: 25 }}
                        />
                      </button>
                    </div>

                    <div className="h-px bg-zinc-900" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Captions className="w-3.5 h-3.5 text-purple-400" />
                        <div>
                          <p className="text-[10px] font-bold text-zinc-200">AssemblyAI Auto-Captions</p>
                          <p className="text-[8px] text-zinc-500">Auto-transcribes seller voice track for muted scrolling</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono font-black text-purple-400 bg-purple-500/10 border border-purple-500/15 px-2 py-0.5 rounded uppercase font-bold">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 30-Day Recharts Performance Analytics */}
      <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl space-y-3">
        <div className="flex justify-between items-center pr-1">
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#ffa500] font-black block">Analytics Console</span>
            <h4 className="text-xs font-black text-white mt-1">30-Day Listing Performance & Sales</h4>
          </div>
          <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded border border-teal-500/15">
            ZMW (K) / View counts
          </span>
        </div>

        <div className="w-full h-[180px] text-[10px] font-mono select-text">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PERFORMANCE_30_DAYS} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
              <XAxis dataKey="day" stroke="#71717a" fontSize={9} />
              <YAxis stroke="#71717a" fontSize={9} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#090a0f", borderColor: "#27272a", borderRadius: "12px", color: "#18181b" }}
                itemStyle={{ color: "#ffffff", padding: "1px 0" }}
                labelStyle={{ color: "#ffa500", fontWeight: "bold" }}
              />
              <Legend verticalAlign="top" height={28} iconSize={8} iconType="circle" />
              <Line name="Views" type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 5 }} />
              <Line name="Sales Volume" type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-450 font-bold">
            Recent Store Activities
          </label>
          <span className="text-[9.5px] text-teal-400 font-bold flex items-center gap-1 cursor-pointer hover:underline" onClick={() => onNavigateTab("MORE")}>
            Full Log <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        <div className="space-y-2">
          {recentTimeline.map((item) => (
            <div 
              key={item.id}
              className="bg-[#0c0d12]/50 border border-zinc-900 p-3 rounded-xl flex items-start gap-2.5 text-xs text-left"
            >
              <div className="shrink-0 pt-0.5">
                <span className={`text-[8px] font-mono font-black border px-1.5 py-0.5 rounded uppercase tracking-wider ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11.5px] leading-snug text-zinc-200 mt-0.5 font-medium">{item.desc}</p>
                <span className="text-[9px] text-zinc-650 font-mono block mt-1">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
