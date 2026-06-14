import React, { useState } from "react";
import { 
  HeartPulse, Sparkles, CheckCircle, ShieldCheck, AlertCircle, 
  ArrowRight, ShieldAlert, FileText, Send, HelpCircle, X, Award, Plus 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RiderFundProps {
  rider: {
    name: string;
    socialFundBalance: number;
    tier: string;
  };
  onUpdateRiderStats: (stats: { socialFundBalance?: number }) => void;
}

export const RiderFund: React.FC<RiderFundProps> = ({
  rider,
  onUpdateRiderStats,
}) => {
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [claimCategory, setClaimCategory] = useState<string>("Medical emergency");
  const [claimAmount, setClaimAmount] = useState<string>("");
  const [claimReason, setClaimReason] = useState<string>("");
  const [attachedDocName, setAttachedDocName] = useState<string>("");
  const [claimError, setClaimError] = useState<string>("");
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);

  const [showAmbassadorModal, setShowAmbassadorModal] = useState<boolean>(false);
  const [ambassadorEmail, setAmbassadorEmail] = useState<string>("");
  const [ambassadorSuccess, setAmbassadorSuccess] = useState<boolean>(false);

  const categories = [
    { title: "Medical emergency", label: "Medical bills", tiers: "All Tiers Eligible" },
    { title: "Bike repair or accident", label: "Breakdowns / Parts", tiers: "All Tiers Eligible" },
    { title: "Funeral support", label: "Bereavement cover", tiers: "All Tiers Eligible" },
    { title: "School fees for children", label: "Hero exclusive", tiers: "Hero Tier Only", isHeroOnly: true }
  ];

  const tiers = [
    { name: "Starter", minTrips: "0", desc: "Basic dispatch priorities", active: false },
    { name: "Rising", minTrips: "50", desc: "No-interest emergency parts", active: false },
    { name: "Hero", minTrips: "300", desc: "Children school fees access", active: true },
    { name: "Ambassador", minTrips: "500", desc: "Direct recruitment commissions", active: false }
  ];

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError("");

    const requested = parseFloat(claimAmount);
    if (isNaN(requested) || requested <= 0) {
      setClaimError("Please specify a valid claim amount in Kwacha.");
      return;
    }

    if (requested > rider.socialFundBalance) {
      setClaimError(`Maximum withdraw claim cannot exceed your balance of K ${rider.socialFundBalance.toFixed(2)}.`);
      return;
    }

    if (!claimReason.trim()) {
      setClaimError("Please state the specific reason and backup details for this claim.");
      return;
    }

    // Verify Hero eligibility for school fees
    if (claimCategory === "School fees for children" && rider.tier !== "Hero" && rider.tier !== "Ambassador") {
      setClaimError("You must achieve agricultural Hero tier status to claim childhood school fees help.");
      return;
    }

    // Success
    const updatedSf = Math.max(0, rider.socialFundBalance - requested);
    onUpdateRiderStats({ socialFundBalance: updatedSf });
    setClaimSuccess(true);
    setTimeout(() => {
      setShowClaimModal(false);
      setClaimSuccess(false);
      setClaimAmount("");
      setClaimReason("");
      setAttachedDocName("");
    }, 2000);
  };

  const handleJoinAmbassador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambassadorEmail.trim()) return;
    setAmbassadorSuccess(true);
    setTimeout(() => {
      setShowAmbassadorModal(false);
      setAmbassadorSuccess(false);
      setAmbassadorEmail("");
    }, 2200);
  };

  return (
    <div id="rider-social-fund-dashboard" className="px-5 py-4 space-y-5 text-left font-sans max-w-md mx-auto bg-[#040507] text-white">
      
      {/* Top Total Fund Display Card */}
      <div className="bg-linear-to-b from-[#1b0d26] to-[#040507] border border-purple-500/20 rounded-2xl p-4.5 space-y-3.5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-3">
          <span className="text-[8.5px] uppercase font-mono tracking-widest font-black text-[#ffa550] bg-[#ffa550]/15 border border-[#ffa550]/20 px-2.5 py-0.5 rounded">
            RING-FENCED — NOT PLATFORM REVENUE
          </span>
        </div>

        <div className="space-y-0.5 pt-1">
          <p className="text-[9.5px] font-mono uppercase text-zinc-500">SAVINGS PORTAL TOTAL ACCUMULATION</p>
          <h2 className="text-3xl font-black text-purple-400">K {rider.socialFundBalance.toFixed(2)} ZMW</h2>
          <p className="text-[10px] text-zinc-400 max-w-xs leading-normal">
            Built from 5% of every delivery fee. Funded entirely by buyers and locked securely for emergency road assistance.
          </p>
        </div>
      </div>

      {/* Claim Categories card list */}
      <div className="bg-[#090b0e] border border-zinc-850 p-4 rounded-2xl space-y-3.5">
        <div>
          <span className="text-[9px] uppercase font-mono text-zinc-500">Eligible Drawing Rules</span>
          <h3 className="text-xs font-black text-zinc-200">CLAIMABLE WELFARE CATEGORIES</h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((cat, idx) => {
            const isHeroEligibility = cat.isHeroOnly;
            const isEligible = !isHeroEligibility || rider.tier === "Hero";
            return (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-1.5 transition-colors ${
                  isEligible 
                    ? "bg-[#0c0d12] border-zinc-850 hover:border-purple-500/20" 
                    : "bg-[#07070a] border-zinc-900 opacity-60"
                }`}
              >
                <div>
                  <h4 className="text-[11px] font-bold text-zinc-100 leading-tight">{cat.title}</h4>
                  <p className="text-[9px] text-zinc-500">{cat.label}</p>
                </div>
                <span className={`text-[8.5px] font-mono px-1 rounded self-start ${
                  cat.isHeroOnly 
                    ? "bg-[#ffa550]/10 text-[#ffa550] border border-[#ffa550]/15" 
                    : "bg-purple-500/10 text-purple-300"
                }`}>
                  {cat.tiers}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TIER LEVEL GRID (Starter, Rising, Hero, Ambassador) */}
      <div className="bg-[#090b0e] border border-zinc-850 p-4 rounded-2xl space-y-3">
        <div>
          <span className="text-[9px] uppercase font-mono text-zinc-500">Tier Matrix & Perks</span>
          <h3 className="text-xs font-black text-zinc-200">MILESTONE LEVEL PROGRESSION</h3>
        </div>

        <div className="space-y-2">
          {tiers.map((tierItem, index) => {
            const isCurrent = tierItem.name === rider.tier;
            return (
              <div 
                key={index} 
                className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isCurrent 
                    ? "bg-[#18120b] border-[#ffa550]/30 shadow-[0_0_10px_rgba(255,165,80,0.04)]" 
                    : "bg-[#06080a] border-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black font-mono ${
                    isCurrent ? "bg-[#ffa550] text-[#040507]" : "bg-zinc-900 text-zinc-500 border border-zinc-850"
                  }`}>
                    {tierItem.name[0]}
                  </div>
                  <div>
                    <h4 className={`text-[11px] font-bold ${isCurrent ? "text-amber-300" : "text-zinc-300"}`}>
                      {tierItem.name} Tier
                    </h4>
                    <p className="text-[9.5px] text-zinc-500 leading-tight">{tierItem.desc}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[9px] font-mono ${isCurrent ? "text-amber-500 font-extrabold" : "text-zinc-500"}`}>
                    Min: {tierItem.minTrips} trips
                  </span>
                  {isCurrent && (
                    <span className="block text-[8px] bg-amber-500/10 px-1 rounded uppercase tracking-wider font-extrabold text-[#ffa550] border border-[#ffa550]/15 mt-0.5">
                      Your Tier
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claim operations with become ambassador launcher */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowClaimModal(true)}
          className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-purple-500/10"
        >
          <HeartPulse className="w-4 h-4" />
          <span>File a Claim</span>
        </button>

        <button
          onClick={() => setShowAmbassadorModal(true)}
          className="w-1/2 py-2.5 bg-zinc-900 hover:bg-zinc-800 border-2 border-amber-500/20 text-amber-500 font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
        >
          <Award className="w-4 h-4" />
          <span>Become Ambassador</span>
        </button>
      </div>

      {/* FILE CLAIM MODAL OVERLAY */}
      <AnimatePresence>
        {showClaimModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0c10] border border-zinc-850 w-full max-w-sm rounded-2xl overflow-hidden text-left"
            >
              <div className="flex justify-between items-center p-4 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-200">File Welfare Claim</h4>
                </div>
                <button 
                  onClick={() => setShowClaimModal(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5.5 space-y-4 max-h-[450px] overflow-y-auto">
                {claimSuccess ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">Claim Processed successfully</h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">Funds are released directly to your payout wallet.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleClaimSubmit} className="space-y-3.5">
                    <p className="text-[10px] text-zinc-400 leading-relaxed bg-[#050609] p-2.5 rounded-lg border border-zinc-950 font-mono">
                      ⚠️ Claims require emergency description and digital invoices. Medical accident is instantly approved; school fees are hero-tier specific.
                    </p>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase block">Welfare Category</label>
                      <select 
                        value={claimCategory}
                        onChange={(e) => setClaimCategory(e.target.value)}
                        className="w-full bg-[#050609] border border-zinc-800 text-xs px-3 py-2 rounded-xl text-zinc-300 focus:outline-none focus:border-purple-500"
                      >
                        {categories.map((c, i) => (
                          <option key={i} value={c.title}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase block">Amount requested (ZMW Kwacha)</label>
                      <input
                        type="number"
                        required
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        className="w-full bg-[#050609] border border-zinc-800 text-xs px-3 py-2 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono"
                        placeholder="e.g. 250"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase block">Claim Context / Reason</label>
                      <textarea
                        required
                        value={claimReason}
                        onChange={(e) => setClaimReason(e.target.value)}
                        rows={3}
                        className="w-full bg-[#050609] border border-zinc-800 text-xs px-3 py-2 rounded-xl text-white focus:outline-none focus:border-purple-500 placeholder:text-zinc-700"
                        placeholder="State breakdown details or medical clinic name..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase block">Attach Invoice Document (Mock)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={attachedDocName || "No file uploaded"}
                          className="w-2/3 bg-[#050609] border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg text-zinc-500 font-mono truncate"
                        />
                        <button
                          type="button"
                          onClick={() => setAttachedDocName("EmergencyInvoice_Hospital.pdf")}
                          className="w-1/3 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300 py-1.5 rounded-lg text-center"
                        >
                          Upload Doc
                        </button>
                      </div>
                    </div>

                    {claimError && (
                      <p className="text-[10px] text-rose-500 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/10 font-bold">{claimError}</p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs py-2 rounded-xl cursor-pointer text-center mt-2"
                    >
                      File Urgent Assistance Claim
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AMBASSADOR RECRUITMENT MODAL OVERLAY */}
      <AnimatePresence>
        {showAmbassadorModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0c10] border border-zinc-850 w-full max-w-sm rounded-2xl overflow-hidden text-left"
            >
              <div className="flex justify-between items-center p-4 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-200">Become Ambassador</h4>
                </div>
                <button 
                  onClick={() => setShowAmbassadorModal(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5.5 space-y-4">
                {ambassadorSuccess ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">Recruitment Ticket Opened</h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">Our coordinators will reach out via Whatsapp in 1 business hour!</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleJoinAmbassador} className="space-y-4">
                    <p className="text-[10px] text-zinc-400 leading-relaxed bg-[#050609] p-2.5 rounded-lg border border-zinc-950 font-mono">
                      🌟 Hero and Ambassador level players earn 10% commission on bringing new village farmers and young logistic runners to the Selonachipa grid. Join the ambassador council!
                    </p>

                    <div className="space-y-1.5 font-mono text-[9.5px] text-zinc-400 space-y-2">
                      <p>✓ <strong>Farmer Bonus:</strong> Earn K 50 per vendor onboarding</p>
                      <p>✓ <strong>Runner Bonus:</strong> Earn K 25 per courier onboarding</p>
                      <p>✓ Paid out instantly into your linked MTN wallet</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase block">Your Communication Email</label>
                      <input
                        type="email"
                        required
                        value={ambassadorEmail}
                        onChange={(e) => setAmbassadorEmail(e.target.value)}
                        className="w-full bg-[#050609] border border-zinc-800 text-xs px-3 py-2 rounded-xl text-white focus:outline-none focus:border-amber-500"
                        placeholder="e.g. chipo@gmail.com"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#ffa550] hover:bg-amber-400 text-black font-extrabold text-xs py-2 rounded-xl cursor-pointer text-center"
                    >
                      Apply for Counselor Guild
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
