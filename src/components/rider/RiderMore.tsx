import React, { useState } from "react";
import { 
  User, Settings, Bell, MapPin, Clock, ShieldCheck, Mail, Send, Check, 
  X, AlertCircle, Edit3, Smartphone, PhoneCall, Plus, Trash2, ShieldAlert, 
  HelpCircle, Calendar, Shield, CreditCard, KeyRound, ArrowRight, Award, Star 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RiderMoreProps {
  rider: {
    rider_id: string;
    name: string;
    phone: string;
    bike_plate: string;
    photo: string;
    rating: number;
    tier: string;
    socialFundBalance: number;
    zone: string;
  };
  onUpdateRider: React.Dispatch<React.SetStateAction<any>>;
  onLogout: () => void;
  todayCount: number;
  acceptanceRate: number;
  payoutWallet: string;
  onUpdatePayoutWallet: (wallet: string) => void;
  correctPin: string;
  onUpdatePin: (pin: string) => void;
  securityQuestions: { q: string; a: string }[];
  onUpdateSecurityQuestions: (questions: { q: string; a: string }[]) => void;
}

export const RiderMore: React.FC<RiderMoreProps> = ({
  rider,
  onUpdateRider,
  onLogout,
  todayCount,
  acceptanceRate,
  payoutWallet,
  onUpdatePayoutWallet,
  correctPin,
  onUpdatePin,
  securityQuestions,
  onUpdateSecurityQuestions,
}) => {
  // Navigation tabs within "More" screen
  // "PROFILE" | "ZONE_HOURS" | "NOTIFICATIONS" | "SETTINGS_SUPPORT"
  const [subTab, setSubTab] = useState<"PROFILE" | "ZONE_HOURS" | "NOTIFICATIONS" | "SETTINGS_SUPPORT">("PROFILE");

  // Edit profile states
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(rider.name);
  const [editPhone, setEditPhone] = useState<string>(rider.phone);
  const [editPlate, setEditPlate] = useState<string>(rider.bike_plate);
  const [editVehicle, setEditVehicle] = useState<string>("Motorbike");
  const [editEmergencyName, setEditEmergencyName] = useState<string>("Mary Mwansa");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState<string>("0955123456");

  // Zone & hours states
  const [secondaryZones, setSecondaryZones] = useState<any[]>([
    { id: "sz-1", name: "Lusaka North", desc: "Northmead, Roma, Airport Road", added: false, coverage: "4.2 km further" },
    { id: "sz-2", name: "Lusaka East", desc: "Woodlands, Chalala, Leopards Hill", added: false, coverage: "6.8 km further" },
    { id: "sz-3", name: "Kafue Outskirts", desc: "Industrial Grid, Shards Hub", added: false, coverage: "12.0 km further" }
  ]);
  const [availableDays, setAvailableDays] = useState<any[]>([
    { name: "Mon", active: true },
    { name: "Tue", active: true },
    { name: "Wed", active: true },
    { name: "Thu", active: true },
    { name: "Fri", active: true },
    { name: "Sat", active: false },
    { name: "Sun", active: false }
  ]);
  const [hoursMin, setHoursMin] = useState<string>("07:00");
  const [hoursMax, setHoursMax] = useState<string>("19:00");

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([
    { id: "n-1", title: "Acceptance Rate Warning", body: "Your acceptance rate is 94%. Keep it above 90% to maintain your 10% Hero Tier bonus multiplier.", time: "Today, 12:15 PM", read: false, type: "WARN" },
    { id: "n-2", title: "Instant Payout Settle", body: "K 285.00 ZMW successfully pushed to your MTN Mobile Money wallet via Lipila scheduler.", time: "Today, 10:45 AM", read: false, type: "PAYOUT" },
    { id: "n-3", title: "Social Fund Daily Update", body: "K 14.25 ZMW added to retirement fund from Woodlands Escrow release.", time: "Yesterday, 06:30 PM", read: true, type: "FUND" },
    { id: "n-4", title: "New 5-Star Rating Received", body: "Buyer 'Precious Chanda' left 5 stars: 'Super fast delivery and carefully stacked.'", time: "2 days ago", read: true, type: "STAR" },
    { id: "n-5", title: "Incident Acknowledged", body: "Selonachipa Operations has reviewed your roadside report regarding Plot 12 Gate disputes. No penalty applied.", time: "4 days ago", read: true, type: "REPORT" },
    { id: "n-6", title: "Hero Tier Activated", body: "Congratulations! You crossed 300 deliveries and unlocked 10% cash bonuses plus primary School Fees loans.", time: "5 days ago", read: true, type: "TIER" }
  ]);

  // Settings & support form states
  const [changePinOld, setChangePinOld] = useState<string>("");
  const [changePinNew, setChangePinNew] = useState<string>("");
  const [changePinConfirm, setChangePinConfirm] = useState<string>("");
  const [pinEditStatus, setPinEditStatus] = useState<{ type: "ERR" | "OK"; msg: string } | null>(null);

  // Security questions change states
  const [questionsInput, setQuestionsInput] = useState<any[]>([
    { q: "First school?", a: securityQuestions[0]?.a || "" },
    { q: "First pet?", a: securityQuestions[1]?.a || "" },
    { q: "Birth town?", a: securityQuestions[2]?.a || "" }
  ]);
  const [questionsEditStatus, setQuestionsEditStatus] = useState<string>("");

  // Incident report states
  const [incidentOrderRef, setIncidentOrderRef] = useState<string>("");
  const [incidentType, setIncidentType] = useState<string>("Accident / Bike breakdown");
  const [incidentNotes, setIncidentNotes] = useState<string>("");
  const [incidentStatus, setIncidentStatus] = useState<string>("");

  // Toast / Feedback
  const [localFeedback, setLocalFeedback] = useState<string>("");

  const triggerToast = (msg: string) => {
    setLocalFeedback(msg);
    setTimeout(() => setLocalFeedback(""), 4000);
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRider({
      ...rider,
      name: editName,
      phone: editPhone,
      bike_plate: editPlate,
      vehicle: editVehicle,
    });
    setIsEditingProfile(false);
    triggerToast("✓ Rider credentials updated successfully!");
  };

  // Secondary zone toggle
  const handleToggleZone = (id: string) => {
    setSecondaryZones(prev => prev.map(z => {
      if (z.id === id) {
        const nextState = !z.added;
        triggerToast(nextState ? `✓ Expanded radius into ${z.name}` : `Removed ${z.name} expansion`);
        return { ...z, added: nextState };
      }
      return z;
    }));
  };

  // Day toggle
  const handleToggleDay = (idx: number) => {
    const updated = [...availableDays];
    updated[idx].active = !updated[idx].active;
    setAvailableDays(updated);
  };

  // Mark all read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    triggerToast("✓ All notifications marked read");
  };

  // Payout wallet save
  const handleSaveWalletSelection = (wallet: string) => {
    onUpdatePayoutWallet(wallet);
    triggerToast(`✓ Default wallet switched to ${wallet} Money`);
  };

  // Password / PIN change
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinEditStatus(null);

    if (changePinOld !== correctPin) {
      setPinEditStatus({ type: "ERR", msg: "Current PIN is incorrect." });
      return;
    }
    if (changePinNew.length !== 4 || !/^\d+$/.test(changePinNew)) {
      setPinEditStatus({ type: "ERR", msg: "New PIN must be 4 digits." });
      return;
    }
    if (changePinNew !== changePinConfirm) {
      setPinEditStatus({ type: "ERR", msg: "Passwords do not match." });
      return;
    }

    onUpdatePin(changePinNew);
    setPinEditStatus({ type: "OK", msg: "✓ PIN changed successfully." });
    setChangePinOld("");
    setChangePinNew("");
    setChangePinConfirm("");
  };

  // Security questions save
  const handleSaveSecurityQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSecurityQuestions([
      { q: "First school?", a: questionsInput[0].a },
      { q: "First pet?", a: questionsInput[1].a },
      { q: "Birth town?", a: questionsInput[2].a }
    ]);
    setQuestionsEditStatus("✓ Security answers locked!");
    setTimeout(() => setQuestionsEditStatus(""), 3000);
  };

  // Incident report save
  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentStatus("submitting");
    setTimeout(() => {
      setIncidentStatus("success");
      setIncidentOrderRef("");
      setIncidentNotes("");
      setTimeout(() => setIncidentStatus(""), 4000);
    }, 1500);
  };

  return (
    <div id="rider-more-portal" className="px-5 py-4 space-y-4 text-left font-sans max-w-md mx-auto bg-[#040507] text-white">
      
      {/* Tab select bar */}
      <div className="flex bg-[#0a0c10] border border-zinc-850 p-1 rounded-xl justify-between overflow-x-auto whitespace-nowrap scrollbar-none gap-1 text-[10px] font-bold uppercase">
        <button
          onClick={() => setSubTab("PROFILE")}
          className={`py-2 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${subTab === "PROFILE" ? "bg-emerald-500 text-black font-black" : "text-zinc-400"}`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>
        <button
          onClick={() => setSubTab("ZONE_HOURS")}
          className={`py-2 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${subTab === "ZONE_HOURS" ? "bg-emerald-500 text-black font-black" : "text-zinc-400"}`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Zone / Hours</span>
        </button>
        <button
          onClick={() => setSubTab("NOTIFICATIONS")}
          className={`py-2 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${subTab === "NOTIFICATIONS" ? "bg-emerald-500 text-black font-black" : "text-zinc-400"}`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Alerts ({notifications.filter(n => !n.read).length})</span>
        </button>
        <button
          onClick={() => setSubTab("SETTINGS_SUPPORT")}
          className={`py-2 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${subTab === "SETTINGS_SUPPORT" ? "bg-emerald-500 text-black font-black" : "text-zinc-400"}`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Support</span>
        </button>
      </div>

      {/* Floating feedback notification */}
      {localFeedback && (
        <div className="bg-emerald-500 text-black font-black font-mono text-[10px] p-2 rounded-xl text-center shadow-lg transition-all animate-pulse">
          {localFeedback}
        </div>
      )}

      {/* SUB PANELS */}
      <AnimatePresence mode="wait">
        
        {/* ======================= PROFILE panel ======================= */}
        {subTab === "PROFILE" && (
          <motion.div
            key="panel-profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Persona card */}
            <div className="bg-[#090b0e] border border-zinc-850 p-4 rounded-2xl flex items-center gap-4">
              <div className="relative">
                {rider.photo ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={rider.photo}
                    alt={rider.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/20"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
                    {rider.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-amber-500 p-0.5 rounded-full border border-black text-black">
                  <Star className="w-3 h-3 fill-current" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-white">{rider.name}</h3>
                <p className="text-[10px] font-mono text-zinc-400">{rider.phone} • {rider.bike_plate}</p>
                <div className="flex gap-2">
                  <span className="text-[8.5px] font-mono uppercase bg-[#ffa550]/15 text-[#ffa550] px-1.5 py-0.5 rounded font-black tracking-wider">
                    {rider.tier} Level
                  </span>
                  <span className="text-[8.5px] font-mono text-[#00ffd2] bg-[#00ffd2]/10 px-1.5 rounded font-bold">
                    Rating: {rider.rating} ★
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="ml-auto p-1.5 self-start bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#07090c] p-3 rounded-xl border border-zinc-900 text-center space-y-1">
                <span className="text-[8px] uppercase font-mono text-zinc-500 block">All-time Trips</span>
                <span className="text-sm font-black text-white">{rider.tier === "Hero" ? "284" : todayCount + 284} runs</span>
              </div>
              <div className="bg-[#07090c] p-3 rounded-xl border border-zinc-900 text-center space-y-1">
                <span className="text-[8px] uppercase font-mono text-zinc-500 block">Completion Rate</span>
                <span className="text-sm font-black text-[#00ffd2]">99.1%</span>
              </div>
              <div className="bg-[#07090c] p-3 rounded-xl border border-zinc-900 text-center space-y-1">
                <span className="text-[8px] uppercase font-mono text-zinc-500 block">Acceptance Ratio</span>
                <span className="text-sm font-black text-[#ffa550]">{acceptanceRate}%</span>
              </div>
              <div className="bg-[#07090c] p-3 rounded-xl border border-zinc-900 text-center space-y-1">
                <span className="text-[8px] uppercase font-mono text-zinc-500 block">Welfare Balance</span>
                <span className="text-sm font-black text-purple-400">K {rider.socialFundBalance.toFixed(0)}</span>
              </div>
            </div>

            {/* Edit Panel Drawer/Div */}
            {isEditingProfile && (
              <form onSubmit={handleSaveProfile} className="bg-[#0c0d12] border border-zinc-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-black uppercase font-mono text-zinc-300 border-b border-zinc-900 pb-1.5">Modify Credentials</h4>
                
                <div className="space-y-2 text-xs">
                  <div className="space-y-0.5">
                    <label className="text-zinc-500 font-mono text-[9px] uppercase">Rider Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#050609] border border-zinc-800 px-3 py-1.5 rounded-lg text-white"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-zinc-500 font-mono text-[9px] uppercase">Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-[#050609] border border-zinc-800 px-3 py-1.5 rounded-lg text-white"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-zinc-500 font-mono text-[9px] uppercase">Vehicle Type</label>
                    <select
                      value={editVehicle}
                      onChange={(e) => setEditVehicle(e.target.value)}
                      className="w-full bg-[#050609] border border-zinc-800 px-2.5 py-1.5 rounded-lg text-zinc-300 focus:outline-none"
                    >
                      <option value="Bicycle">Bicycle (Pedal)</option>
                      <option value="Motorbike">Upgrade to Motorbike (Petrol)</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-zinc-500 font-mono text-[9px] uppercase">License Plate Number</label>
                    <input
                      type="text"
                      required
                      value={editPlate}
                      onChange={(e) => setEditPlate(e.target.value)}
                      className="w-full bg-[#050609] border border-zinc-800 px-3 py-1.5 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1 border-t border-zinc-900 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="w-1/3 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 py-2 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-xl text-xs font-black"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Static Bio block */}
            <div className="bg-[#050609] border border-zinc-900 p-4 rounded-xl space-y-2.5 text-[11px] text-zinc-400 leading-relaxed font-mono">
              <div className="flex justify-between">
                <span>Account Register Date:</span>
                <span className="text-zinc-200">Nov 14, 2024</span>
              </div>
              <div className="flex justify-between">
                <span>Verification Node:</span>
                <span className="text-emerald-400">Chisamba Gateway #04</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Contact:</span>
                <span className="text-zinc-200">Mary Mwansa (Sister) - 0955123456</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================= ZONE & HOURS panel ======================= */}
        {subTab === "ZONE_HOURS" && (
          <motion.div
            key="panel-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Primary zone */}
            <div className="bg-[#090b0e] border border-zinc-850 p-4 rounded-2xl space-y-1.5">
              <span className="text-[8.5px] uppercase font-mono text-indigo-400 bg-indigo-505/10 px-1.5 py-0.5 rounded border border-indigo-500/10 inline-block">
                Primary Zone Area ✓
              </span>
              <h3 className="text-sm font-black text-white">Lusaka Central</h3>
              <p className="text-[10px] text-zinc-400">
                Covers: Soweto Depot, Chisamba South Corridor, Leopards Hill, Kabulonga grid, Ibex Hill.
              </p>
              <p className="text-[9.5px] font-mono text-indigo-300">Default dispatch radius: <strong>5.0 km</strong></p>
            </div>

            {/* Secondary zone expansions */}
            <div className="bg-[#07090c] border border-zinc-900 p-4 rounded-2xl space-y-3">
              <div>
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase">Expand Operations Area</span>
                <h4 className="text-xs font-black text-zinc-200">SECONDARY DISPATCH SECTORS</h4>
              </div>

              <div className="space-y-2">
                {secondaryZones.map((z) => (
                  <div key={z.id} className="p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/40 flex justify-between items-center text-[10.5px]">
                    <div>
                      <h5 className="font-bold text-zinc-200">{z.name}</h5>
                      <p className="text-[9px] text-zinc-500">{z.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggleZone(z.id)}
                      className={`px-3 py-1 rounded-lg text-[9.5px] font-mono font-black border transition-colors cursor-pointer ${
                        z.added 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-400/25" 
                          : "bg-[#0c0d12] border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {z.added ? "Activated ✓" : "Add Sector"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Working times weekly grid */}
            <div className="bg-[#07090c] border border-zinc-900 p-4 rounded-2xl space-y-3.5">
              <div>
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase">Protect acceptance rate</span>
                <h4 className="text-xs font-black text-zinc-200">ACTIVE DISPATCH HOURS</h4>
                <p className="text-[9.5px] text-zinc-400 mt-0.5 leading-snug">
                  Jobs requested outside these hours are automatically routed away, protecting you from ratings depletion.
                </p>
              </div>

              {/* Day checkbox group */}
              <div className="flex gap-1.5 justify-between">
                {availableDays.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => handleToggleDay(i)}
                    className={`w-9 py-1.5 rounded-lg text-[9.5px] font-mono font-black text-center border cursor-pointer transition-colors ${
                      d.active 
                        ? "bg-[#ffa550] border-amber-600 text-[#040507]" 
                        : "bg-[#0c0d12] border-zinc-850 text-zinc-500"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {/* Slider / inputs for hours */}
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[8.5px] font-mono text-zinc-500 uppercase block">Shift Start</label>
                  <input
                    type="time"
                    value={hoursMin}
                    onChange={(e) => setHoursMin(e.target.value)}
                    className="w-full bg-[#050608] border border-zinc-850 rounded-lg py-1 px-2 font-mono text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8.5px] font-mono text-zinc-500 uppercase block">Shift End</label>
                  <input
                    type="time"
                    value={hoursMax}
                    onChange={(e) => setHoursMax(e.target.value)}
                    className="w-full bg-[#050608] border border-zinc-850 rounded-lg py-1 px-2 font-mono text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================= NOTIFICATIONS panel ======================= */}
        {subTab === "NOTIFICATIONS" && (
          <motion.div
            key="panel-alerts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Real-time Dispatch Alerts</span>
              <button
                onClick={handleMarkAllRead}
                className="text-[9.5px] text-emerald-400 font-mono font-bold hover:underline"
              >
                Mark all read
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div 
                  key={n.id}
                  className={`p-3.5 rounded-xl border flex gap-3 items-start transition-colors leading-normal ${
                    !n.read 
                      ? "bg-[#10151f]/45 border-indigo-500/30" 
                      : "bg-[#07090c] border-zinc-900/60"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-indigo-400 animate-pulse" : "bg-zinc-650"}`} />
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-zinc-200">{n.title}</h5>
                    <p className="text-[10.5px] text-zinc-400">{n.body}</p>
                    <span className="text-[8.5px] text-zinc-500 block font-mono mt-1">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ======================= SETTINGS & SUPPORT panel ======================= */}
        {subTab === "SETTINGS_SUPPORT" && (
          <motion.div
            key="panel-support"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Wallet switch */}
            <div className="bg-[#090b0e] border border-zinc-850 p-4 rounded-2xl space-y-3">
              <div>
                <span className="text-[8.5px] uppercase font-mono text-zinc-500 block">payout setup channels</span>
                <h4 className="text-xs font-black text-zinc-200">LINKED MOBILE MONEY WALLET</h4>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono font-bold">
                {["Airtel Money", "MTN MoMo", "Zamtel Kwacha"].map((opt) => {
                  const isSelected = payoutWallet.toLowerCase().includes(opt.split(" ")[0].toLowerCase());
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSaveWalletSelection(opt)}
                      className={`py-2 px-1 rounded-xl text-center border cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-400/30" 
                          : "bg-[#06080a] border-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Change PIN / Questions Accordion */}
            <div className="bg-[#07090c] border border-zinc-900 p-4 rounded-2xl space-y-4">
              <div className="border-b border-zinc-900/40 pb-4">
                <h4 className="text-xs font-black text-zinc-200 uppercase font-mono mb-2.5">Security: Change Personal PIN</h4>
                <form onSubmit={handleSaveNewPin} className="space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={changePinOld}
                      onChange={(e) => setChangePinOld(e.target.value.replace(/\D/g, ""))}
                      placeholder="Old PIN"
                      className="bg-[#050609] border border-zinc-850 rounded px-2.5 py-1.5 focus:outline-none"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      value={changePinNew}
                      onChange={(e) => setChangePinNew(e.target.value.replace(/\D/g, ""))}
                      placeholder="New PIN"
                      className="bg-[#050609] border border-zinc-850 rounded px-2.5 py-1.5 focus:outline-none"
                    />
                    <button 
                      type="submit" 
                      className="bg-[#ffa550] text-[#040507] hover:bg-amber-400 rounded text-[10.5px] font-black cursor-pointer"
                    >
                      Verify PIN
                    </button>
                  </div>
                  {pinEditStatus && (
                    <p className={`text-[9.5px] font-mono leading-none ${pinEditStatus.type === "ERR" ? "text-rose-500" : "text-emerald-400"}`}>
                      {pinEditStatus.msg}
                    </p>
                  )}
                </form>
              </div>

              {/* Security questions sub panel */}
              <div>
                <h4 className="text-xs font-black text-zinc-200 uppercase font-mono mb-2.5">Update Reset Security Answers</h4>
                <form onSubmit={handleSaveSecurityQuestions} className="space-y-3.5">
                  {questionsInput.map((qi, i) => (
                    <div key={i} className="space-y-0.5">
                      <label className="text-[8.5px] font-mono text-zinc-500 uppercase block">{qi.q}</label>
                      <input
                        type="text"
                        required
                        value={qi.a}
                        onChange={(e) => {
                          const updated = [...questionsInput];
                          updated[i].a = e.target.value;
                          setQuestionsInput(updated);
                        }}
                        className="w-full bg-[#050609] border border-zinc-850 text-xs px-2.5 py-1.5 rounded-lg text-zinc-300 focus:outline-none focus:border-emerald-500"
                        placeholder="Secret gate answer"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="bg-zinc-900 border border-zinc-850 text-zinc-300 font-bold font-mono text-[10px] py-1.5 px-3.5 rounded-lg hover:bg-zinc-800"
                  >
                    Lock Reset Answers
                  </button>
                  {questionsEditStatus && (
                    <p className="text-[9.5px] font-mono text-emerald-400 leading-none">{questionsEditStatus}</p>
                  )}
                </form>
              </div>
            </div>

            {/* Support communications chat & incident reporter form */}
            <div className="bg-[#07090c] border border-zinc-900 p-4 rounded-2xl space-y-3.5">
              <div>
                <dt className="text-[8px] font-mono uppercase text-[#ffa550]">Selonachipa road help desk</dt>
                <dd className="text-xs font-black text-zinc-200 uppercase">SUPPORT & ACCIDENT DISPATCH</dd>
              </div>

              {/* Communication Links */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => alert("Initiating Live chat feed with Selonachipa Logistics Desk in backup nodes...")}
                  className="bg-[#050608] border border-zinc-850 rounded-xl p-3 text-left space-y-1 click-feedback cursor-pointer hover:border-zinc-800"
                >
                  <span className="text-[8.5px] font-mono text-emerald-400 uppercase">● LIVE CHAT HELP</span>
                  <p className="text-zinc-200">Av: 2 mins</p>
                </button>
                <button
                  onClick={() => alert("Redirecting to Whatsapp business channel...")}
                  className="bg-[#050608] border border-zinc-850 rounded-xl p-3 text-left space-y-1 click-feedback cursor-pointer hover:border-zinc-800"
                >
                  <span className="text-[8.5px] font-mono text-indigo-400 uppercase">WHATSAPP ROAD</span>
                  <p className="text-zinc-200">+260 977 123 456</p>
                </button>
              </div>

              {/* Report Incident form */}
              <div className="border-t border-zinc-900/60 pt-3.5 space-y-3">
                <h5 className="text-[11px] font-extrabold text-[#ffa550] flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-[#ffa550]" />
                  <span>Report an Active Driving Incident</span>
                </h5>

                {incidentStatus === "success" ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-center space-y-1 animate-pulse">
                    <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                    <h6 className="text-[10px] font-black uppercase font-mono text-zinc-200">Incident Ticket Filed ✓</h6>
                    <p className="text-[9px] text-zinc-400 font-mono">Our operations supervisor will call you on cell immediately.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReportIncident} className="space-y-3 text-xs leading-none">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-mono text-zinc-500 block">Order Ref (Optional)</label>
                        <input
                          type="text"
                          value={incidentOrderRef}
                          onChange={(e) => setIncidentOrderRef(e.target.value)}
                          placeholder="e.g. SN-991"
                          className="w-full bg-[#050609] border border-zinc-850 p-1.5 rounded"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-mono text-zinc-500 block">Incident Scope</label>
                        <select
                          value={incidentType}
                          onChange={(e) => setIncidentType(e.target.value)}
                          className="w-full bg-[#050609] border border-zinc-850 p-1.5 rounded text-zinc-400"
                        >
                          <option value="Accident / Bike breakdown">Accident / Bike breakdown</option>
                          <option value="Dispute with Buyer">Dispute with Buyer</option>
                          <option value="Dispute with Seller">Dispute with Seller</option>
                          <option value="Unsafe transit coordinates">Unsafe Transit coords</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] font-mono text-zinc-500 block">Incident Context Notes</label>
                      <textarea
                        required
                        value={incidentNotes}
                        onChange={(e) => setIncidentNotes(e.target.value)}
                        rows={2}
                        placeholder="State what occurred in Chisamba Road..."
                        className="w-full bg-[#050609] border border-zinc-850 p-2 rounded"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={incidentStatus === "submitting"}
                      className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 font-black text-xs py-2 rounded-xl text-center cursor-pointer transition-colors"
                    >
                      {incidentStatus === "submitting" ? "Transmitting GPS ticket..." : "File Driving Incident Ticket"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Red Log Out button */}
            <div className="pt-2 text-center">
              <button
                onClick={onLogout}
                className="w-full bg-[#3f0f15]/10 hover:bg-[#3f0f15]/50 hover:text-white border border-rose-900/30 text-rose-500 font-extrabold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Log Out of Courier Session
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
