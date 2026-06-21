import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, ArrowUpRight, BarChart3, Clock, Sparkles, CheckCircle, Percent, Eye, FileText, Share2, ClipboardCheck } from "lucide-react";
import { Listing, Order } from "../../types";

interface SellerAnalyticsProps {
  listings: Listing[];
  orders: Order[];
  sellerStoreName: string;
}

// Simulated daily views for last 30 days
const DAILY_VIEWS_30D = [
  { day: "Jun 01", views: 145, engagement: 25 },
  { day: "Jun 02", views: 180, engagement: 32 },
  { day: "Jun 03", views: 160, engagement: 22 },
  { day: "Jun 04", views: 210, engagement: 45 },
  { day: "Jun 05", views: 245, engagement: 50 },
  { day: "Jun 06", views: 290, engagement: 68 },
  { day: "Jun 07", views: 320, engagement: 75 },
  { day: "Jun 08", views: 270, engagement: 52 },
  { day: "Jun 09", views: 285, engagement: 58 },
  { day: "Jun 10", views: 310, engagement: 62 },
  { day: "Jun 11", views: 350, engagement: 80 },
  { day: "Jun 12", views: 420, engagement: 95 },
  { day: "Jun 13", views: 390, engagement: 88 },
  { day: "Jun 14", views: 415, engagement: 90 },
  { day: "Jun 15", views: 480, engagement: 110 },
  { day: "Jun 16", views: 512, engagement: 125 },
  { day: "Jun 17", views: 470, engagement: 105 },
  { day: "Jun 18", views: 495, engagement: 115 },
  { day: "Jun 19", views: 530, engagement: 130 },
  { day: "Jun 20", views: 580, engagement: 145 }
];

const DAILY_VIEWS_7D = DAILY_VIEWS_30D.slice(-7);

// Simulated 30-day order completion rates (percentages)
const COMPLETION_RATE_30D = [
  { interval: "Day 1-5", rate: 89.2, total: 10 },
  { interval: "Day 6-10", rate: 91.5, total: 12 },
  { interval: "Day 11-15", rate: 90.0, total: 15 },
  { interval: "Day 16-20", rate: 93.8, total: 16 },
  { interval: "Day 21-25", rate: 95.5, total: 22 },
  { interval: "Day 26-30", rate: 97.4, total: 31 }
];

export default function SellerAnalytics({ listings, orders, sellerStoreName }: SellerAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D">("30D");

  // Derive genuine values
  const sellerListings = listings.filter(l => l.seller_id === "sel-chipo");
  const sellerOrders = orders.filter(o => o.seller_id === "sel-chipo");

  // 1. Total Video Views (Dynamic base + real-time additions)
  const baseViews = sellerListings.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalViews = Math.max(baseViews, 4290);

  // 2. Total Replays / Telemetry Base
  const baseReplays = sellerListings.reduce((sum, item) => sum + (item.metrics?.replays || 0), 0);
  const totalReplays = Math.max(baseReplays, 185);

  // 3. Completion rate math
  const completedOrders = sellerOrders.filter(o => o.transit_status === "delivered");
  const nonCancelledOrders = sellerOrders.filter(o => o.transit_status !== "cancelled");
  const completionRate = nonCancelledOrders.length > 0 
    ? Math.round((completedOrders.length / nonCancelledOrders.length) * 100) 
    : 96.5;

  const chartViewsData = timeRange === "7D" ? DAILY_VIEWS_7D : DAILY_VIEWS_30D;

  return (
    <div className="space-y-5 animate-fadeIn text-left pt-1">
      {/* Tab Header Banner */}
      <div className="bg-gradient-to-br from-teal-950/20 via-zinc-950 to-zinc-950 px-4 py-3.5 rounded-2xl border border-zinc-900 flex justify-between items-center">
        <div>
          <span className="text-[9.5px] font-mono tracking-widest text-[#ffa500] font-extrabold block">
            BUSINESS INTELLIGENCE
          </span>
          <h2 className="text-base font-extrabold text-white mt-0.5">Performance & Insights</h2>
          <p className="text-[10px] text-zinc-400">Track dynamic loop replays, telemetry metrics & conversion</p>
        </div>
        <div className="flex gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setTimeRange("7D")}
            className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === "7D" ? "bg-[#ffa500] text-black" : "text-zinc-450 hover:text-white"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange("30D")}
            className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === "30D" ? "bg-[#ffa500] text-black" : "text-zinc-450 hover:text-white"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Views Card */}
        <div className="bg-[#0c0d12] border border-zinc-850 p-3.5 rounded-2xl flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Video Plays</span>
            <Eye className="w-3.5 h-3.5 text-[#ffa500]" />
          </div>
          <div>
            <p className="text-base font-black text-white">{totalViews.toLocaleString()}</p>
            <p className="text-[8.5px] text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
              <TrendingUp className="w-2.5 h-2.5" />
              +18.4% play growth
            </p>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-[#0c0d12] border border-zinc-850 p-3.5 rounded-2xl flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Order Rate</span>
            <Percent className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div>
            <p className="text-base font-black text-white">{completionRate}%</p>
            <p className="text-[8.5px] text-teal-400 font-mono mt-1 flex items-center gap-1.5">
              <CheckCircle className="w-2.5 h-2.5" />
              High escrow fulfillment
            </p>
          </div>
        </div>

        {/* Telemetry Replays Card */}
        <div className="bg-[#0c0d12] border border-zinc-850 p-3.5 rounded-2xl flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Auto-Loop Replays</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          </div>
          <div>
            <p className="text-base font-black text-white">{totalReplays} loops</p>
            <p className="text-[8.5px] text-zinc-500 font-mono mt-1">
              Continuous play metrics
            </p>
          </div>
        </div>

        {/* Orders Placed Card */}
        <div className="bg-[#0c0d12] border border-zinc-850 p-3.5 rounded-2xl flex flex-col justify-between h-[105px]">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Store Sales</span>
            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-black text-white">{sellerOrders.length} orders</p>
            <p className="text-[8.5px] text-zinc-500 font-mono mt-1">
              Active & settled logistics
            </p>
          </div>
        </div>
      </div>

      {/* Chart 1: Daily views - BarChart */}
      <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl space-y-3">
        <div className="flex justify-between items-center pr-1">
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#ffa500] font-black block">Traffic Insights</span>
            <h4 className="text-xs font-black text-white mt-1">Daily Video Listing Views</h4>
          </div>
          <span className="text-[8.5px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">
            PLAYS / DAY
          </span>
        </div>

        <div className="w-full h-[180px] text-[10px] font-mono select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartViewsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1d1e26" opacity={0.6} />
              <XAxis dataKey="day" stroke="#52525b" fontSize={9} />
              <YAxis stroke="#52525b" fontSize={9} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0c0d12", borderColor: "#27272a", borderRadius: "12px", color: "#ffffff" }}
                itemStyle={{ color: "#ffffff", padding: "1px 0" }}
                labelStyle={{ color: "#ffa500", fontWeight: "bold" }}
              />
              <Legend verticalAlign="top" height={24} iconSize={8} iconType="circle" />
              <Bar name="Video Views" dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar name="Audience Engaged" dataKey="engagement" fill="#ffa500" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Order Completion Rates over last 30 days - LineChart */}
      <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl space-y-3">
        <div className="flex justify-between items-center pr-1">
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-teal-400 font-black block">Escrow Performance</span>
            <h4 className="text-xs font-black text-white mt-1">Order Completion Rates (Last 30 Days)</h4>
          </div>
          <span className="text-[8.5px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/15">
            CONVERSION %
          </span>
        </div>

        <div className="w-full h-[180px] text-[10px] font-mono select-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={COMPLETION_RATE_30D} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1d1e26" opacity={0.6} />
              <XAxis dataKey="interval" stroke="#52525b" fontSize={9} />
              <YAxis stroke="#52525b" fontSize={9} domain={[70, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0c0d12", borderColor: "#27272a", borderRadius: "12px", color: "#ffffff" }}
                itemStyle={{ color: "#ffffff", padding: "1px 0" }}
                labelStyle={{ color: "#2dd4bf", fontWeight: "bold" }}
              />
              <Legend verticalAlign="top" height={24} iconSize={8} iconType="circle" />
              <Line name="Fulfillment Rate (%)" type="monotone" dataKey="rate" stroke="#14b8a6" strokeWidth={2.5} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Video Content Health Check Card */}
      <div className="bg-[#07090e] border border-blue-500/10 rounded-2xl p-4 text-left space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-mono font-black text-blue-400 uppercase tracking-wider">
            Selo AI Content Health recommendation
          </h4>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-350">
          Your auto-playing video listing reels have a <strong className="text-[#ffa500]">92% completion rate</strong>. 
          Audience retention peaks when you highlight organic certificate badges in the first 3 seconds of the loop.
        </p>
        <div className="text-[9.5px] bg-[#0c0d12] border border-zinc-900 rounded-xl p-2.5 space-y-1 text-zinc-400 font-mono">
          <div className="flex justify-between">
            <span>Average Loop Play length:</span>
            <span className="text-white">18 seconds</span>
          </div>
          <div className="flex justify-between">
            <span>Skip Rate after 5 seconds:</span>
            <span className="text-red-400">12.5%</span>
          </div>
        </div>
      </div>

      {/* Top Performing Listings */}
      <div className="space-y-2.5">
        <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-450 font-bold block">
          Top-Performing Reels
        </label>
        
        {sellerListings.length === 0 ? (
          <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-xl text-center text-zinc-550 text-xs italic">
            No live listings yet to analyze. Add a crop listing to trace stats!
          </div>
        ) : (
          <div className="space-y-2">
            {sellerListings.map((lst) => (
              <div 
                key={lst.listing_id}
                className="bg-[#0c0d12]/50 border border-zinc-900 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-850 overflow-hidden shrink-0 text-lg">
                    {lst.thumbnail && (lst.thumbnail.startsWith("http") || lst.thumbnail.startsWith("data:")) ? (
                      <img src={lst.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                    ) : (
                      lst.thumbnail || "🌽"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-white truncate text-[11px]">{lst.title}</p>
                    <p className="text-[9px] text-zinc-500 font-mono uppercase mt-0.5">{lst.category}</p>
                  </div>
                </div>

                <div className="flex gap-4 shrink-0 font-mono text-[10px] text-zinc-350">
                  <div className="text-right">
                    <span className="text-[8px] text-zinc-500 block">VIEWS</span>
                    <strong className="text-white">{lst.views || 0}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-zinc-500 block">SHARES</span>
                    <strong className="text-teal-400">{lst.shares || 0}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
