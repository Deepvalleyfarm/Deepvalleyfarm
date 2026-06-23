import React, { useState, useEffect } from "react";
import { Home, Truck, Wallet, Activity, MoreHorizontal, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import custom rider modules
import { RiderLogin } from "./RiderLogin";
import { RiderHome } from "./RiderHome";
import { RiderJobs } from "./RiderJobs";
import { RiderEarnings } from "./RiderEarnings";
import { RiderFund } from "./RiderFund";
import { RiderMore } from "./RiderMore";

interface RiderPortalProps {
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  ledger: any[];
  setLedger: React.Dispatch<React.SetStateAction<any[]>>;
  parcelJobs?: any[];
  setParcelJobs?: any;
  onSpawnToast: (toast: { message: string; subText?: string }) => void;
}

export const RiderPortal: React.FC<RiderPortalProps> = ({
  orders,
  setOrders,
  ledger,
  setLedger,
  parcelJobs,
  setParcelJobs,
  onSpawnToast,
}) => {
  // SESSION AUTHENTICATION
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("selonachipa_rider_auth") === "true";
  });

  // PIN SECURITY CREDENTIALS
  const [correctPin, setCorrectPin] = useState<string>(() => {
    return localStorage.getItem("selonachipa_rider_pin") || "1234";
  });

  // SECURITY QUESTIONS FOR PIN LOCKOUT RESET
  const [securityQuestions, setSecurityQuestions] = useState<any[]>(() => {
    const saved = localStorage.getItem("selonachipa_rider_questions");
    if (saved) return JSON.parse(saved);
    return [
      { q: "First school?", a: "Chisamba Primary" },
      { q: "First pet?", a: "Rex" },
      { q: "Birth town?", a: "Kabwe" }
    ];
  });

  // GLOBAL RIDER STATE SNAPSHOT (Default values)
  const [rider, setRider] = useState<any>(() => {
    const saved = localStorage.getItem("selonachipa_rider_profile");
    if (saved) return JSON.parse(saved);
    return {
      rider_id: "sel-chipo",
      name: "Chipo Mwansa",
      phone: "096412356",
      bike_plate: "ZM-9234",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", // beautiful portrait
      rating: 4.9,
      tier: "Hero", // Starter | Rising | Hero | Ambassador
      socialFundBalance: 1420.0,
      zone: "Lusaka Central",
      vehicle: "Motorbike"
    };
  });

  // DISPATCH SWITCH TOGGLE
  const [riderOnline, setRiderOnline] = useState<boolean>(false);

  // CURRENT TAB: "HOME" | "JOBS" | "EARNINGS" | "FUND" | "MORE"
  const [activeTab, setActiveTab] = useState<"HOME" | "JOBS" | "EARNINGS" | "FUND" | "MORE">("HOME");

  // FINANCIAL SUMS FOR TODAY / THIS WEEK
  const [todayEarnings, setTodayEarnings] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [weekEarnings, setWeekEarnings] = useState<number>(450.0); // start with prior weekly revenue

  const [payoutWallet, setPayoutWallet] = useState<string>("MTN MoMo");

  // COMPLETED JOBS FEED HISTORIC
  const [completedJobsList, setCompletedJobsList] = useState<any[]>(() => {
    const saved = localStorage.getItem("selonachipa_rider_completed");
    if (saved) return JSON.parse(saved);
    return [
      { order_ref: "SN-910", pickup_short: "Chisamba HUB", drop_short: "Leopards Hill", fee: 240.0, total_dist: 11.5, timestamp: "Today, 11:20 AM" },
      { order_ref: "SN-804", pickup_short: "Soweto Market", drop_short: "Woodlands", fee: 180.0, total_dist: 8.2, timestamp: "Today, 08:30 AM" }
    ];
  });

  // PAYOUTS LOG CONFIRMATION
  const [payoutStatusLog, setPayoutStatusLog] = useState<any[]>(() => {
    const saved = localStorage.getItem("selonachipa_rider_payouts");
    if (saved) return JSON.parse(saved);
    return [
      { id: "p-01", amount: 240.00, timestamp: "Today, 12:00 PM (Daily settle)", type: "AUTO" }
    ];
  });

  // CHAT CONVERSATIONS
  const [conversations, setConversations] = useState<any[]>(() => {
    const saved = localStorage.getItem("selonachipa_rider_chats");
    if (saved) return JSON.parse(saved);
    return [
      {
        conversation_id: "conv-1",
        buyer_name: "Precious Chanda (Buyer)",
        buyer_initials: "PC",
        order_id: "SN-991",
        unread_count: 1,
        last_message_time: "10 mins ago",
        messages: [
          { message_id: "m-1a", sender: "buyer", text: "Please call when you reach the gate. The guards know you are coming.", timestamp: "10 mins ago" }
        ]
      },
      {
        conversation_id: "conv-2",
        buyer_name: "Farmer Agri-Coop Shop (Seller)",
        buyer_initials: "AC",
        order_id: "SN-991",
        unread_count: 0,
        last_message_time: "1 hr ago",
        messages: [
          { message_id: "m-2a", sender: "seller", text: "Maize bags are packed and stitched tight for pick-up.", timestamp: "1 hr ago" }
        ]
      }
    ];
  });

  // DISPATCH OFFICIAL SYSTEM ALERTS
  const [systemAlerts, setSystemAlerts] = useState<any[]>([
    { id: "sa-1", title: "Social Fund Settle", body: "K 12.00 ZMW added to retirement from Leopards Hill dropoff escrow release.", time: "1 hr ago" },
    { id: "sa-2", title: "High Demand Hour", body: "Sellers in Lusaka West are placing large cargo packages. Go online to accept priority transport fee boosts.", time: "3 hrs ago" },
    { id: "sa-3", title: "Milestone Reached", body: "Congratulations on crossing 280 total orders! 20 more deliveries unlocks additional Hero perks.", time: "Yesterday" }
  ]);

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem("selonachipa_rider_profile", JSON.stringify(rider));
  }, [rider]);

  useEffect(() => {
    localStorage.setItem("selonachipa_rider_completed", JSON.stringify(completedJobsList));
  }, [completedJobsList]);

  useEffect(() => {
    localStorage.setItem("selonachipa_rider_payouts", JSON.stringify(payoutStatusLog));
  }, [payoutStatusLog]);

  useEffect(() => {
    localStorage.setItem("selonachipa_rider_chats", JSON.stringify(conversations));
  }, [conversations]);

  const handleUpdatePin = (newPin: string) => {
    setCorrectPin(newPin);
    localStorage.setItem("selonachipa_rider_pin", newPin);
    onSpawnToast({
      message: "🔐 PIN CHANGED SUCCESSFULLY",
      subText: "Your secure credentials have been synchronized."
    });
  };

  const handleUpdateSecurityQuestions = (newQues: any[]) => {
    setSecurityQuestions(newQues);
    localStorage.setItem("selonachipa_rider_questions", JSON.stringify(newQues));
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem("selonachipa_rider_auth", "true");
    onSpawnToast({
      message: "🔐 RIDER ROOT ACCESS GRANTED",
      subText: `Muli bwanji, ${rider.name}. Operational dashboard live.`
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRiderOnline(false); // secure shutdown
    localStorage.setItem("selonachipa_rider_auth", "false");
    onSpawnToast({
      message: "🔒 RIDER COURIER DE-AUTHORIZED",
      subText: "Your route coordinate tracking has been paused."
    });
  };

  const handleUpdateRiderStats = (updates: {
    acceptanceRate?: number;
    deliveriesCount?: number;
    socialFundBalance?: number;
  }) => {
    // If we update stats, save the updated copy
    setRider((prev: any) => {
      const copy = { ...prev };
      if (updates.acceptanceRate !== undefined) {
        // bounds checking
        copy.acceptanceRate = updates.acceptanceRate;
      }
      if (updates.deliveriesCount !== undefined) {
        copy.deliveriesCount = updates.deliveriesCount;
        // recalculate tier
        if (copy.deliveriesCount >= 500) copy.tier = "Ambassador";
        else if (copy.deliveriesCount >= 300) copy.tier = "Hero";
        else if (copy.deliveriesCount >= 50) copy.tier = "Rising";
        else copy.tier = "Starter";
      }
      if (updates.socialFundBalance !== undefined) {
        copy.socialFundBalance = updates.socialFundBalance;
      }
      return copy;
    });
  };

  const addCompletedJobLog = (job: any) => {
    setCompletedJobsList((prev) => [job, ...prev]);
    // Save to ledger standard
    const newLedgerTx = {
      tx_id: `TX-R-${Date.now().toString().slice(-5)}`,
      order_id: job.order_ref,
      amount_zmw: job.fee,
      action: "RIDER_ESCROW_RELEASE",
      product_title: `Cargo Transport Delivery`,
      timestamp: new Date().toISOString()
    };
    setLedger((prev) => [newLedgerTx, ...prev]);
  };

  const addPayoutLog = (amount: number) => {
    const newLog = {
      id: `p-${Date.now()}`,
      amount: amount,
      timestamp: "Today, Just Now (Rider withdraw)",
      type: "MANUAL"
    };
    setPayoutStatusLog((prev) => [newLog, ...prev]);

    // reset today's earnings as it's been withdrawn/sent!
    setTodayEarnings(0);
  };

  const getUnreadAlertCount = () => {
    // total notifications count can be represented inside chat message counts or badge logs
    return conversations.reduce((sum, c) => sum + c.unread_count, 0);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#040507] text-zinc-100 overflow-hidden relative">
      
      {/* Session protection boundary */}
      {!isLoggedIn ? (
        <div id="rider-login-center-wrapper" className="flex-1 flex items-center justify-center p-4 bg-[#040507]">
          <RiderLogin
            rider={rider}
            correctPin={correctPin}
            onLoginSuccess={handleLoginSuccess}
            onUpdatePin={handleUpdatePin}
            securityQuestions={securityQuestions}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between h-full">
          
          {/* SCROLLING WORKSPACE PANEL */}
          <div className="flex-1 overflow-y-auto pb-24 scrollbar-none">
            
            {/* Header top bar */}
            <div className="sticky top-0 bg-[#040507]/90 backdrop-blur-md z-50 px-5 py-3 border-b border-zinc-900 flex justify-between items-center bg-radial from-[#040507] to-transparent">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 w-2.5 h-2.5 rounded-full animate-pulse" />
                <h1 className="text-xs font-black tracking-widest font-mono uppercase text-zinc-300">SELONACHIPA RIDER</h1>
              </div>

              {/* Secure Node Info */}
              <div className="text-right">
                <span className="text-[8.5px] uppercase font-mono tracking-wider text-zinc-500">
                  Node IP: 192.168.0.30
                </span>
              </div>
            </div>

            {/* TAB PANELS */}
            <AnimatePresence mode="wait">
              {activeTab === "HOME" && (
                <motion.div
                  key="tab-home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RiderHome
                    rider={rider}
                    riderOnline={riderOnline}
                    setRiderOnline={setRiderOnline}
                    todayEarnings={todayEarnings}
                    todayCount={todayCount}
                    weekEarnings={weekEarnings}
                    weekEarningsTarget={2000.0}
                    completedJobsList={completedJobsList}
                    payoutStatusLog={payoutStatusLog}
                  />
                </motion.div>
              )}

              {activeTab === "JOBS" && (
                <motion.div
                  key="tab-jobs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RiderJobs
                    riderOnline={riderOnline}
                    rider={rider}
                    onUpdateRiderStats={handleUpdateRiderStats}
                    orders={orders}
                    setOrders={setOrders}
                    parcelJobs={parcelJobs}
                    setParcelJobs={setParcelJobs}
                    todayEarnings={todayEarnings}
                    setTodayEarnings={setTodayEarnings}
                    todayCount={todayCount}
                    setTodayCount={setTodayCount}
                    weekEarnings={weekEarnings}
                    setWeekEarnings={setWeekEarnings}
                    addCompletedJobLog={addCompletedJobLog}
                    addPayoutLog={addPayoutLog}
                  />
                </motion.div>
              )}

              {activeTab === "EARNINGS" && (
                <motion.div
                  key="tab-earnings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RiderEarnings
                    todayEarnings={todayEarnings}
                    todayCount={todayCount}
                    weekEarnings={weekEarnings}
                    payoutStatusLog={payoutStatusLog}
                    onTriggerWithdraw={addPayoutLog}
                    payoutWallet={payoutWallet}
                  />
                </motion.div>
              )}

              {activeTab === "FUND" && (
                <motion.div
                  key="tab-fund"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RiderFund
                    rider={rider}
                    onUpdateRiderStats={handleUpdateRiderStats}
                  />
                </motion.div>
              )}

              {activeTab === "MORE" && (
                <motion.div
                  key="tab-more"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RiderMore
                    rider={rider}
                    onUpdateRider={setRider}
                    onLogout={handleLogout}
                    todayCount={todayCount}
                    acceptanceRate={rider.acceptanceRate}
                    payoutWallet={payoutWallet}
                    onUpdatePayoutWallet={setPayoutWallet}
                    correctPin={correctPin}
                    onUpdatePin={handleUpdatePin}
                    securityQuestions={securityQuestions}
                    onUpdateSecurityQuestions={handleUpdateSecurityQuestions}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* PERSISTENT 5-TAB BOTTOM NAVIGATION */}
          <div className="absolute bottom-0 inset-x-0 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 pt-3.5 pb-[calc(env(safe-area-inset-bottom)+14px)] px-3 flex justify-around items-center z-50">
            <button
              onClick={() => setActiveTab("HOME")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "HOME" ? "text-emerald-400 scale-105" : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[8.5px] uppercase font-mono tracking-wider font-extrabold">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("JOBS")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all relative ${
                activeTab === "JOBS" ? "text-emerald-400 scale-105" : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              <Truck className="w-5 h-5" />
              <span className="text-[8.5px] uppercase font-mono tracking-wider font-extrabold">Jobs</span>
              {riderOnline && (
                <span className="absolute top-0 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
              )}
              {orders.some(o => o.escrow_status === "locked" && o.transit_status === "pending_seller_confirmation") && (
                <span className="absolute -top-1.5 -right-1 bg-[#ff6f61] text-white font-black text-[7.5px] rounded-full px-1.5 py-0.5 flex items-center justify-center border border-zinc-950 animate-bounce">
                  NEW
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("EARNINGS")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "EARNINGS" ? "text-emerald-400 scale-105" : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[8.5px] uppercase font-mono tracking-wider font-extrabold">Earnings</span>
            </button>

            <button
              onClick={() => setActiveTab("FUND")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all relative ${
                activeTab === "FUND" ? "text-purple-400 scale-105" : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[8.5px] uppercase font-mono tracking-wider font-extrabold">Fund</span>
              <span className="absolute -top-1 right-2.5 bg-[#ffa550]/20 text-[#ffa550] border border-[#ffa550]/20 px-0.5 rounded text-[7px] font-black font-mono">
                5%
              </span>
            </button>

            <button
              onClick={() => setActiveTab("MORE")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === "MORE" ? "text-emerald-400 scale-105" : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[8.5px] uppercase font-mono tracking-wider font-extrabold">More</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
export default RiderPortal;
