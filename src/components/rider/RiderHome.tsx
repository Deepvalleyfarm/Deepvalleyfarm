import React from "react";
import { 
  Sparkles, CheckCircle2, TrendingUp, HandCoins, AlertCircle, ShieldEllipsis, Users, Award, 
  MapPin, Radio, Calendar, Flame, ChevronRight, CheckCircle, Wallet, ArrowUpRight 
} from "lucide-react";
import { motion } from "motion/react";

interface RiderHomeProps {
  rider: {
    name: string;
    zone: string;
    vehicle: string;
    acceptanceRate: number;
    socialFundBalance: number;
  };
  riderOnline: boolean;
  setRiderOnline: (online: boolean) => void;
  todayEarnings: number;
  todayCount: number;
  weekEarnings: number;
  weekEarningsTarget: number;
  completedJobsList: any[];
  payoutStatusLog: any[];
}

export const RiderHome: React.FC<RiderHomeProps> = ({
  rider,
  riderOnline,
  setRiderOnline,
  todayEarnings,
  todayCount,
  weekEarnings,
  weekEarningsTarget,
  completedJobsList,
  payoutStatusLog,
}) => {
  const getProgressPercentage = (val: number, target: number) => {
    return Math.min(100, Math.round((val / target) * 100));
  };

  return (
    <div id="rider-home-dashboard" className="px-5 py-4 space-y-5 text-left font-sans max-w-md mx-auto bg-[#040507] text-white">
      {/* Top Greeting */}
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Logistics Node Dispatch</p>
          <h2 className="text-sm font-black text-white flex items-center gap-1.5">
            Muli bwanji, {rider.name}! <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <span className="text-[10px] font-medium font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              {rider.zone}
            </span>
            <span className="text-[10px] font-medium font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
              {rider.vehicle}
            </span>
          </div>
        </div>

        {/* Dynamic Tier Badge */}
        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[9.5px] uppercase font-mono font-black border border-[#ffa550]/20 bg-[#ffa550]/10 text-[#ffa550] px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(255,165,80,0.1)]">
            <Award className="w-3 h-3" />
            HERO TIER
          </span>
        </div>
      </div>

      {/* ONLINE SWITCH (Most prominent control) */}
      <div 
        id="dispatch-online-container" 
        className={`p-4 rounded-2xl border transition-all duration-300 ${
          riderOnline 
            ? "bg-[#07130b] border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.06)]" 
            : "bg-[#0b0c0f] border-zinc-850"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[9.5px] uppercase font-mono text-zinc-500 tracking-wider">Operational Dispatch Status</span>
            <p className="text-xs font-black text-white flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${riderOnline ? "bg-emerald-400 animate-ping" : "bg-zinc-600"}`} />
              {riderOnline ? "Online — accepting jobs" : "Offline — not accepting jobs"}
            </p>
            <p className="text-[9.5px] text-zinc-400 leading-tight">
              {riderOnline 
                ? "You are live on the dispatch map and receiving offers around your current radius."
                : "You are hidden from the system. Go online to begin recibir delivery fee offers."
              }
            </p>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setRiderOnline(!riderOnline)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                riderOnline ? "bg-emerald-500" : "bg-zinc-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  riderOnline ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's earnings */}
        <div className="bg-[#090b0e] border border-zinc-850 p-3 rounded-2xl space-y-1.5 hover:border-zinc-800 transition-colors">
          <span className="text-[9.5px] uppercase font-mono text-zinc-500 block">Today's Earnings</span>
          <div>
            <span className="text-[15px] font-black text-white">K {todayEarnings.toFixed(2)}</span>
            <span className="text-[10px] font-mono text-emerald-400 ml-1.5 bg-emerald-500/10 px-1 rounded">
              {todayCount} deliveries
            </span>
          </div>
          <p className="text-[9px] text-zinc-400">Mobile Money Auto-Settle</p>
        </div>

        {/* Weekly Earnings */}
        <div className="bg-[#090b0e] border border-zinc-850 p-3 rounded-2xl space-y-1.5 hover:border-zinc-800 transition-colors">
          <span className="text-[9.5px] uppercase font-mono text-zinc-500 block">This Week's Total</span>
          <div>
            <span className="text-[15px] font-black text-white">K {weekEarnings.toFixed(2)}</span>
            <span className="text-[9px] font-mono text-zinc-400 ml-1 block">
              Goal: K {weekEarningsTarget.toFixed(0)} ({getProgressPercentage(weekEarnings, weekEarningsTarget)}%)
            </span>
          </div>
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(weekEarnings, weekEarningsTarget)}%` }}
            />
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-[#090b0e] border border-zinc-850 p-3 rounded-2xl space-y-1.5 hover:border-zinc-800 transition-colors">
          <span className="text-[9.5px] uppercase font-mono text-zinc-500 block">Acceptance Rate</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-black text-[#ffa550]">
              {rider.acceptanceRate}%
            </span>
            <span className="text-[9px] text-zinc-400 bg-zinc-900 p-0.5 rounded px-1">
              Top 5%
            </span>
          </div>
          <p className="text-[9px] text-zinc-400 leading-snug">Feeds directly into tier payouts</p>
        </div>

        {/* Social Fund balance */}
        <div className="bg-[#090b0e] border border-zinc-850 p-3 rounded-2xl space-y-1.5 hover:border-zinc-850 border-purple-500/10 transition-colors">
          <span className="text-[9.5px] uppercase font-mono text-zinc-500 block">Social Fund Saved</span>
          <div>
            <span className="text-[15px] font-black text-purple-400">
              K {rider.socialFundBalance.toFixed(2)}
            </span>
            <span className="text-[8.5px] text-[#ffa550] block font-mono">
              Ring-fenced Account
            </span>
          </div>
          <p className="text-[9px] text-zinc-400 leading-snug">Your secure retirement pool</p>
        </div>
      </div>

      {/* Recent activity & Payout confirmations */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Recent Dispatch Feed</h3>
        
        <div className="bg-[#07090c] border border-zinc-850 rounded-2xl p-3.5 space-y-3">
          {/* Completed deliveries list */}
          {completedJobsList.slice(0, 2).map((item, index) => (
            <div key={index} className="flex justify-between items-center pb-2.5 border-b border-zinc-900 last:border-0 last:pb-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-200">Ref: {item.order_ref}</span>
                </div>
                <p className="text-[9.5px] text-zinc-400 font-mono">
                  {item.pickup_short} ➔ {item.drop_short}
                </p>
                <p className="text-[8.5px] text-zinc-500 font-mono">{item.timestamp}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-black text-emerald-400">+K {item.fee.toFixed(2)}</span>
                <span className="text-[8.5px] text-zinc-500 block">Wallet Credited</span>
              </div>
            </div>
          ))}

          {/* Recent payout confirmation */}
          {payoutStatusLog && payoutStatusLog.length > 0 && (
            <div className="bg-[#050609] p-2.5 rounded-xl border border-zinc-900 flex justify-between items-center text-[10px]">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/10 p-1 rounded">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="leading-tight">
                  <span className="font-bold text-zinc-300 block">Payout Sent Successfully</span>
                  <span className="text-[8.5px] text-zinc-500 font-mono">{payoutStatusLog[0].timestamp}</span>
                </div>
              </div>
              <div className="text-right font-mono text-zinc-300">
                <span className="font-extrabold text-emerald-400">K {payoutStatusLog[0].amount.toFixed(2)}</span>
                <span className="text-[8.5px] text-zinc-500 block">via Lipila MoMo</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
