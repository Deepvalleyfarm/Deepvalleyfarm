import React, { useState } from "react";
import { 
  Sparkles, CheckCircle2, TrendingUp, HandCoins, AlertCircle, FileText, Download, 
  Wallet, ShieldCheck, Flame, ArrowUpRight, Check, X, CreditCard, Clock, Calendar 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RiderEarningsProps {
  todayEarnings: number;
  todayCount: number;
  weekEarnings: number;
  payoutStatusLog: any[];
  onTriggerWithdraw: (amount: number) => void;
  payoutWallet: string;
}

export const RiderEarnings: React.FC<RiderEarningsProps> = ({
  todayEarnings,
  todayCount,
  weekEarnings,
  payoutStatusLog,
  onTriggerWithdraw,
  payoutWallet,
}) => {
  const [weeklyTarget, setWeeklyTarget] = useState<number>(2000);
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [editTargetVal, setEditTargetVal] = useState<string>("2000");

  const [showStatementModal, setShowStatementModal] = useState<boolean>(false);
  const [statementStart, setStatementStart] = useState<string>("2026-06-01");
  const [statementEnd, setStatementEnd] = useState<string>("2026-06-09");
  const [simulatedStatementData, setSimulatedStatementData] = useState<any[] | null>(null);

  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [payoutConfirmedToast, setPayoutConfirmedToast] = useState<boolean>(false);

  // Math
  const totalRiddenDistanceKm = todayCount * 11.2; // average
  const isSettledToday = payoutStatusLog.some(log => log.type === "AUTO" || log.type === "MANUAL");
  
  // Day social contribution is 5% of the total gross. Net is ~87%, so social is ~5.7% of today's net earnings
  const socialFundSavedToday = todayEarnings * 0.057; 
  // Tier bonus amount (10% Hero boost added into the net)
  const tierBonusEarnedToday = todayEarnings * 0.10; 

  const getProgressPercent = () => {
    return Math.min(100, Math.round((weekEarnings / weeklyTarget) * 100));
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(editTargetVal);
    if (!isNaN(parsed) && parsed > 0) {
      setWeeklyTarget(parsed);
      setIsEditingTarget(false);
    }
  };

  const handleTriggerWithdrawNow = () => {
    if (todayEarnings <= 0) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      onTriggerWithdraw(todayEarnings);
      setIsWithdrawing(false);
      setPayoutConfirmedToast(true);
      setTimeout(() => {
        setPayoutConfirmedToast(false);
      }, 4000);
    }, 2000);
  };

  const handleGenerateStatement = (e: React.FormEvent) => {
    e.preventDefault();
    // generate mock rows
    setSimulatedStatementData([
      { ref: "SN-910", details: "Chisamba Agri-Hub Vendor Dispatch", net: todayEarnings * 0.6, method: "Lipila MoMo", date: "Jun 09, 2026" },
      { ref: "SN-804", details: "Soweto Wholesale Center Cargo", net: todayEarnings * 0.4, method: "Lipila MoMo", date: "Jun 09, 2026" },
      { ref: "SN-772", details: "Northmead Depot Freight Route", net: 260.0, method: "Settle Auto", date: "Jun 08, 2026" },
      { ref: "SN-710", details: "Kafue Gateway Logistics Cargo", net: 290.0, method: "Settle Auto", date: "Jun 07, 2026" },
    ]);
  };

  return (
    <div id="rider-earnings-dashboard" className="px-5 py-4 space-y-5 text-left font-sans max-w-md mx-auto bg-[#040507] text-white relative">
      
      {/* Top Banner with Today Net Sum */}
      <div className="bg-linear-to-b from-[#09150e] to-[#040507] border border-emerald-500/20 rounded-2xl p-4.5 space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3">
          <span className={`text-[8.5px] uppercase font-mono tracking-widest font-black px-2 py-0.5 rounded border ${
            todayEarnings > 0 
              ? "bg-[#00ffd2]/10 text-[#00ffd2] border-[#00ffd2]/15" 
              : "bg-zinc-900 text-zinc-500 border-zinc-800"
          }`}>
            {todayEarnings > 0 ? "✓ PAYOUT SETTLED TO WALLET" : "WAITING FOR DAILY SETTLE"}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9.5px] font-mono uppercase text-zinc-500 block">TODAY'S ACCUMULATED WALLET PAYMENTS</span>
          <p className="text-2xl font-black text-[#00ffd2]">K {todayEarnings.toFixed(2)} ZMW</p>
        </div>

        <div className="flex gap-4 border-t border-zinc-900 pt-2 text-[10.5px] font-mono text-zinc-400">
          <span>Deliveries: <strong className="text-white">{todayCount} trips</strong></span>
          <span>Dist: <strong className="text-white">{totalRiddenDistanceKm.toFixed(1)} km</strong></span>
          <span className="text-teal-400 font-bold ml-auto">MTN/Airtel Daily</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Net */}
        <div className="bg-[#090b0e] border border-zinc-850 p-3.5 rounded-xl space-y-1">
          <span className="text-[9px] uppercase font-mono text-zinc-500">Today's Net</span>
          <p className="text-sm font-black text-white">K {todayEarnings.toFixed(2)}</p>
          <p className="text-[8.5px] text-zinc-400 font-mono">Platform fee (8%) cleared</p>
        </div>

        {/* This Week's Cumulative */}
        <div className="bg-[#090b0e] border border-zinc-850 p-3.5 rounded-xl space-y-1">
          <span className="text-[9px] uppercase font-mono text-zinc-500">This Week Total</span>
          <p className="text-sm font-black text-white">K {weekEarnings.toFixed(2)}</p>
          <p className="text-[8.5px] text-zinc-400 font-mono">7-day moving cycle</p>
        </div>

        {/* Hero Tier Bonus */}
        <div className="bg-[#0c0d12] border border-amber-500/10 p-3.5 rounded-xl space-y-1">
          <span className="text-[9px] uppercase font-mono text-zinc-500">Tier Boost Reward</span>
          <p className="text-sm font-black text-amber-400">+K {tierBonusEarnedToday.toFixed(2)}</p>
          <p className="text-[8.5px] text-[#ffa550] font-mono leading-none">Hero Tier +10% Cash Premium</p>
        </div>

        {/* Social Saved Today */}
        <div className="bg-[#0c0a12] border border-purple-500/15 p-3.5 rounded-xl space-y-1">
          <span className="text-[9px] uppercase font-mono text-zinc-500">Social Saved Today</span>
          <p className="text-sm font-black text-purple-400">K {socialFundSavedToday.toFixed(2)}</p>
          <p className="text-[8.5px] text-purple-400 font-mono">Deducted and saved today</p>
        </div>
      </div>

      {/* Weekly target bar with click-to-edit feature */}
      <div className="bg-[#07090c] border border-zinc-850 p-4 rounded-2xl space-y-3">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-[9px] uppercase text-zinc-500 font-mono">Flexible Earning Objective</span>
            <p className="text-xs font-black text-zinc-200">WEEKLY INCENTIVE TARGET</p>
          </div>

          {!isEditingTarget ? (
            <button 
              onClick={() => {
                setEditTargetVal(weeklyTarget.toString());
                setIsEditingTarget(true);
              }}
              className="text-[10px] text-emerald-400 font-mono font-bold hover:underline"
            >
              Set Goal: K {weeklyTarget} ✏️
            </button>
          ) : (
            <form onSubmit={handleSaveTarget} className="flex gap-1.5 items-center">
              <input
                type="number"
                value={editTargetVal}
                onChange={(e) => setEditTargetVal(e.target.value)}
                className="w-16 bg-[#040507] border border-zinc-800 rounded font-mono text-xs text-center py-0.5 text-white focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="bg-emerald-500 text-black p-0.5 rounded text-[10px] font-black font-mono">
                OK
              </button>
            </form>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
            <div 
              className="h-full bg-linear-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercent()}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
            <span>Progress: {getProgressPercent()}%</span>
            <span>K {weekEarnings.toFixed(2)} / K {weeklyTarget.toFixed(2)} ZMW</span>
          </div>
        </div>
      </div>

      {/* Payout channels explanation box */}
      <div className="bg-[#050608] border border-zinc-900 p-3.5 rounded-xl space-y-1.5 text-[10.5px] text-zinc-400 leading-relaxed font-mono">
        <div className="flex justify-between">
          <span className="text-zinc-500">Destination Wallet:</span>
          <span className="text-zinc-250 font-bold">{payoutWallet} Account</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Automatic Settlement:</span>
          <span className="text-emerald-400 font-extrabold flex items-center gap-1">🟢 LIVE DAILY</span>
        </div>
        <div className="flex justify-between border-t border-zinc-900/40 pt-1">
          <span className="text-zinc-500">Escrow Agent:</span>
          <span className="text-zinc-300 font-semibold">Selonachipa Escrow Hub</span>
        </div>
      </div>

      {/* Immediate money withdrawals, statement report generating */}
      <div className="space-y-2.5">
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowStatementModal(true)}
            className="w-1/2 py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-zinc-400" />
            <span>Statements</span>
          </button>

          <button
            onClick={handleTriggerWithdrawNow}
            disabled={todayEarnings <= 0 || isWithdrawing}
            className={`w-1/2 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              todayEarnings > 0 
                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10" 
                : "bg-zinc-900 text-zinc-500 border border-zinc-850/50 cursor-not-allowed"
            }`}
          >
            {isWithdrawing ? (
              <>
                <Clock className="w-4 h-4 animate-spin text-zinc-800" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4 text-black" />
                <span>Withdraw Now</span>
              </>
            )}
          </button>
        </div>
        {todayEarnings <= 0 && (
          <p className="text-[9px] text-center text-zinc-500 font-mono">⚠️ Settle button locks until new delivery fees populate today.</p>
        )}
      </div>

      {/* SUCCESS POPUP FOR WITHDRAWAL */}
      <AnimatePresence>
        {payoutConfirmedToast && (
          <div className="fixed bottom-16 inset-x-4 max-w-sm mx-auto z-[120] bg-zinc-950 border border-emerald-500/40 p-3 rounded-xl flex items-center gap-3 shadow-2xl animate-bounce">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="w-4 h-4" />
            </div>
            <div className="leading-snug">
              <p className="text-[10px] font-black text-zinc-200">INSTANT DISPATCH SETTLED ✓</p>
              <p className="text-[8.5px] text-zinc-400 font-mono">K {todayEarnings.toFixed(2)} ZMW sent to MTN wallet. Trace ID: LP-77119</p>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* STATEMENTS / REVENUE DIGEST PORTAL OVERLAY */}
      <AnimatePresence>
        {showStatementModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#0b0c10] border border-zinc-850 w-full max-w-md rounded-2xl overflow-hidden text-left"
            >
              <div className="flex justify-between items-center p-4 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#ffa550]" />
                  <h4 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-200">Rider Statement Query</h4>
                </div>
                <button 
                  onClick={() => {
                    setShowStatementModal(false);
                    setSimulatedStatementData(null);
                  }}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5.5 space-y-4">
                <form onSubmit={handleGenerateStatement} className="grid grid-cols-2 gap-3 pb-3 border-b border-zinc-900/60">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase">Start Date</label>
                    <input
                      type="date"
                      value={statementStart}
                      onChange={(e) => setStatementStart(e.target.value)}
                      className="w-full bg-[#050609] border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase">End Date</label>
                    <input
                      type="date"
                      value={statementEnd}
                      onChange={(e) => setStatementEnd(e.target.value)}
                      className="w-full bg-[#050609] border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg text-white"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="col-span-2 bg-[#ffa550] text-[#040507] font-black text-xs py-2 rounded-xl text-center font-mono cursor-pointer hover:bg-amber-400 mt-2"
                  >
                    Query Ledger Records
                  </button>
                </form>

                {simulatedStatementData ? (
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Ledger Result (ZMW Payouts)</span>
                      <button 
                        onClick={() => {
                          alert("PDF Statement compiled! Download ready in local background nodes.");
                        }}
                        className="text-[9px] text-[#00ffd2] font-mono font-bold flex items-center gap-1 hover:underline"
                      >
                        <Download className="w-3 h-3" />
                        <span>Save PDF</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {simulatedStatementData.map((row, index) => (
                        <div key={index} className="bg-[#050609] p-2.5 rounded-lg border border-zinc-900 text-[10px] flex justify-between items-center">
                          <div className="space-y-0.5">
                            <span className="text-[8.5px] text-zinc-500 font-mono">{row.date} • Ref: {row.ref}</span>
                            <p className="font-bold text-zinc-350">{row.details}</p>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-black text-[#00ffd2]">K {row.net.toFixed(2)}</span>
                            <span className="text-[8px] text-zinc-500 block">{row.method}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <Calendar className="w-7 h-7 mx-auto text-zinc-700" />
                    <p className="text-[10px] text-zinc-500 font-mono">Awaiting date range submission above to audit billing.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
