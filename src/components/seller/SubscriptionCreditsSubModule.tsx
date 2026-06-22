import React, { useState, useEffect } from "react";
import { 
  CreditCard, Coins, Check, ArrowLeft, Loader2, Sparkles, Phone, Download, HelpCircle, Eye, AlertCircle, FileText
} from "lucide-react";

interface SubModuleProps {
  setToast: (toast: { message: string; subText?: string } | null) => void;
  onBack: () => void;
}

export default function SubscriptionCreditsSubModule({ setToast, onBack }: SubModuleProps) {
  // Current states
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [subStatus, setSubStatus] = useState<any>({
    planId: "free",
    status: "Inactive",
    activatedAt: null,
    expiresAt: null
  });
  const [balance, setBalance] = useState<number>(100);
  const [history, setHistory] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "CARD" | "MOMO">("ALL");

  // Selection states
  const [selectedType, setSelectedType] = useState<"PLAN" | "CREDIT" | null>(null);
  const [itemId, setItemId] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemTitle, setItemTitle] = useState<string>("");

  // Preferred Payment Method preference
  const [paymentMethod, setPaymentMethod] = useState<"MOMO" | "CARD">("MOMO");
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  // MoMo Form
  const [momoPhone, setMomoPhone] = useState<string>("260971203040");
  const [momoOperator, setMomoOperator] = useState<string>("MTN");

  // Card Checkout Form
  const [cardForm, setCardForm] = useState({
    firstName: "Chipo",
    lastName: "Mwansa",
    email: "deepvaleyfarm@gmail.com",
    phone: "260971203040",
    city: "Lusaka",
    country: "ZM",
    address: "Plot 33, Great East Road Near Cooperative Block, Chisamba",
    zip: "10101"
  });

  const tenantId = "sel_v7_mwansa"; // Clean unified tenantId mapping to seeded seller

  // Fetch initial profile values on load
  const loadPaymentDetails = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch(`/api/payments/subscription-status?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.subscription) setSubStatus(data.subscription);
        if (typeof data.credits === "number") setBalance(data.credits);
      }

      const resHistory = await fetch(`/api/payments/history?tenantId=${tenantId}`);
      if (resHistory.ok) {
        const histData = await resHistory.json();
        setHistory(histData.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadPaymentDetails();
  }, []);

  const handleSelectPlan = (id: string, price: number, title: string) => {
    setSelectedType("PLAN");
    setItemId(id);
    setItemPrice(price);
    setItemTitle(title);
  };

  const handleSelectCredit = (id: string, price: number, title: string) => {
    setSelectedType("CREDIT");
    setItemId(id);
    setItemPrice(price);
    setItemTitle(title);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemPrice <= 0 || !itemId) {
      setToast({ message: "Invalid Selection", subText: "Please choose an active package." });
      return;
    }

    setIsAuthorizing(true);
    const referenceId = `${selectedType === "PLAN" ? "sub" : "crd"}-${itemId}-${tenantId}-${Date.now()}`;

    try {
      if (paymentMethod === "MOMO") {
        // Trigger Mobile Money Collection
        const res = await fetch("/api/payments/momo-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: momoPhone,
            operator: momoOperator,
            amount: itemPrice,
            referenceId,
            narration: `${itemTitle} Checkout`
          })
        });

        if (res.ok) {
          setToast({ message: "Mobile Money PIN Prompt Sent!", subText: "Verify with 10 digit PIN to trigger callback" });
          // Forward immediately to processing dashboard holding state
          window.location.href = `/payment-processing?referenceId=${referenceId}&mockSuccess=true`;
        } else {
          setToast({ message: "MoMo Gateway Busy", subText: "Lipila router declined this operator trunk." });
        }
      } else {
        // Debit/Credit Card flow using proxy card endpoint
        const res = await fetch("/api/payments/card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerInfo: {
              firstName: cardForm.firstName,
              lastName: cardForm.lastName,
              phoneNumber: cardForm.phone,
              city: cardForm.city,
              country: cardForm.country,
              address: cardForm.address,
              zip: cardForm.zip,
              email: cardForm.email
            },
            collectionRequest: {
              referenceId,
              amount: itemPrice,
              narration: `${itemTitle} Subscription / Credits Card Purchase`,
              currency: "ZMW"
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.checkoutUrl) {
            setToast({ message: "Secure Card Invoice Created", subText: "Redirecting to Lipila Checkout portal..." });
            // Redirect parent document or load
            window.location.href = data.checkoutUrl;
          } else {
            setToast({ message: "Card Setup Rejected", subText: "Authorization engine reported card error." });
          }
        } else {
          setToast({ message: "Connection Error", subText: "Backend payment router offline" });
        }
      }
    } catch (err) {
      setToast({ message: "Payment Engine Fault", subText: "Failed connecting to Lipila Dev Gateway" });
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Helper filters
  const filteredHistory = history.filter(item => {
    if (filterType === "ALL") return true;
    if (filterType === "CARD") return item.paymentMethod === "Card";
    if (filterType === "MOMO") return item.paymentMethod !== "Card";
    return true;
  });

  return (
    <div className="space-y-5 animate-fadeIn text-left text-zinc-100 font-sans pb-16">
      
      {/* Header section with back btn */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#ffa500] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Utilities</span>
        </button>
        <span className="text-[10px] font-mono tracking-widest text-[#ffa550] bg-zinc-950 px-2 py-1 rounded-md border border-[#ffa550]/15">
          LIPILA SMART GATEWAY v2
        </span>
      </div>

      {loadingStatus ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-2.5">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs text-zinc-550 font-mono">Syncing tenant ledger matrices...</p>
        </div>
      ) : (
        <>
          {/* Dashboard Metrics Rows - Bento Panel */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0b0c10] border border-zinc-90 w-full p-4 rounded-2xl relative overflow-hidden">
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <Coins className="w-4 h-4 text-amber-400 mb-1.5" />
              <span className="text-[9px] uppercase font-mono text-zinc-500 block">Available Credits</span>
              <span className="text-xl font-black text-white font-mono">{balance} Pts</span>
              <p className="text-[9px] text-zinc-550 leading-tight mt-1">Refreshes dynamically upon card clearance.</p>
            </div>

            <div className="bg-[#0b0c10] border border-zinc-90 w-full p-4 rounded-2xl relative overflow-hidden">
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              <CreditCard className="w-4 h-4 text-indigo-400 mb-1.5" />
              <span className="text-[9px] uppercase font-mono text-zinc-500 block">Active Membership</span>
              <span className="text-sm font-black text-white block capitalize truncate">{subStatus?.planId || "Free Agent"}</span>
              <p className="text-[9px] text-zinc-450 mt-1">
                {subStatus?.expiresAt ? `Expires: ${new Date(subStatus.expiresAt).toLocaleDateString()}` : "Unlimited Basic Tier"}
              </p>
            </div>
          </div>

          {!selectedType ? (
            <>
              {/* SECTION A: PLANS GRID */}
              <div className="space-y-3 pt-2">
                <div>
                  <h3 className="text-xs font-black uppercase text-zinc-350 font-mono tracking-widest">Select Premium Tenant Plans</h3>
                  <p className="text-[10.5px] text-zinc-550 mt-0.5">Scale listing priority, unlock direct video API streams & automated GPS routing.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: "starter", title: "Starter Farmer Plan", price: 150, duration: "30 Days", desc: "Adds up to 10 live video listings, real-time escrow, and simple localized mapping." },
                    { id: "commercial", title: "Commercial Grower Gold Plan", price: 450, duration: "90 Days", desc: "Allows unlimited video listings, priority search index, and 3 affiliate agents." },
                    { id: "enterprise", title: "Agri-Enterprise Annual Plan", price: 1200, duration: "365 Days", desc: "Complete white-label, unlimited affiliate agents, advanced bento analytics & custom priority support." }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPlan(p.id, p.price, p.title)}
                      className="w-full bg-[#0c1015]/65 hover:bg-[#10141b]/95 border border-zinc-900 hover:border-indigo-500/30 p-4 rounded-2xl text-left transition-all duration-300 relative group cursor-pointer"
                    >
                      <div className="absolute top-3 right-3 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                        {p.duration}
                      </div>

                      <h4 className="text-xs font-extrabold text-[#ffa550] group-hover:text-amber-400 transition-colors uppercase font-mono tracking-wide">{p.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-medium leading-relaxed mt-1 max-w-[280px]">{p.desc}</p>
                      
                      <div className="border-t border-zinc-900/60 mt-3 pt-2 flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500 text-[10px]">LIPILA COLLECTION COST:</span>
                        <span className="text-white font-extrabold text-sm">K {p.price}.00 ZMW</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION B: CREDITS GRID */}
              <div className="space-y-3 pt-4">
                <div>
                  <h3 className="text-xs font-black uppercase text-zinc-350 font-mono tracking-widest">Recharge Escrow API Credits</h3>
                  <p className="text-[10.5px] text-zinc-550 mt-0.5">Required for triggering automated notifications, custom SMS templates, and routing math.</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "copper", title: "Copper Pack", price: 50, count: "50 Pts" },
                    { id: "silver", title: "Silver Pack", price: 100, count: "120 Pts" },
                    { id: "gold", title: "Gold Pack", price: 250, count: "300 Pts" }
                  ].map((cr) => (
                    <button
                      key={cr.id}
                      onClick={() => handleSelectCredit(cr.id, cr.price, cr.title)}
                      className="bg-[#0b0c0f] hover:bg-zinc-900/80 border border-zinc-900 p-3.5 rounded-xl text-center transition-all cursor-pointer"
                    >
                      <span className="bg-amber-500/10 border border-amber-500/15 text-amber-400 text-[9.5px] rounded-full px-2 py-0.5 font-mono font-bold block mx-auto w-max mb-2">
                        {cr.count}
                      </span>
                      <h5 className="text-[10.5px] font-bold text-zinc-200 block truncate leading-tight">{cr.title}</h5>
                      <span className="text-[11px] font-mono text-zinc-450 block mt-1 font-bold">K {cr.price} ZMW</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION C: AUDIT STATEMENT HISTORY LOGS */}
              <div className="space-y-3 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-zinc-350 font-mono tracking-widest">Receipt Audit Ledger</h3>
                    <p className="text-[10px] text-zinc-550 mt-0.5">Auditable records generated over Lipila Card Connections.</p>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-900 text-[9px] font-mono">
                    <button
                      onClick={() => setFilterType("ALL")}
                      className={`px-2 py-1 rounded ${filterType === "ALL" ? "bg-zinc-900 text-white font-extrabold" : "text-zinc-500"}`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setFilterType("CARD")}
                      className={`px-2 py-1 rounded ${filterType === "CARD" ? "bg-zinc-900 text-white font-extrabold" : "text-zinc-500"}`}
                    >
                      CARD
                    </button>
                    <button
                      onClick={() => setFilterType("MOMO")}
                      className={`px-2 py-1 rounded ${filterType === "MOMO" ? "bg-zinc-900 text-white font-extrabold" : "text-zinc-500"}`}
                    >
                      MOMO
                    </button>
                  </div>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="border border-zinc-900 bg-zinc-950/20 p-6 rounded-2xl text-center font-mono text-zinc-550 text-[10px]">
                    No receipts currently locked for this store tenant.
                  </div>
                ) : (
                  <div className="border border-zinc-910 rounded-2xl overflow-hidden text-[10.5px] font-mono bg-zinc-950/20">
                    <div className="bg-[#0c0d12] p-2 px-3 border-b border-zinc-900 text-zinc-500 font-extrabold flex justify-between text-[9px]">
                      <span>UTILITY / REFERENCE ID</span>
                      <span>OUTFLOW (ZMW)</span>
                    </div>

                    <div className="divide-y divide-zinc-915">
                      {filteredHistory.map((item, index) => (
                        <div key={index} className="p-3 px-3 flex items-center justify-between hover:bg-zinc-950/40 transition-colors">
                          <div className="space-y-0.5">
                            <span className="block text-zinc-200 font-black truncate max-w-[190px]">{item.referenceId}</span>
                            <div className="flex items-center gap-1.5 text-[9px] text-zinc-550">
                              <span className="bg-zinc-900 text-zinc-400 px-1 rounded uppercase font-bold text-[8px]">{item.paymentMethod}</span>
                              <span>•</span>
                              <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <span className="text-emerald-400 font-black text-right block">K {item.amount}.00 ZMW</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ACTIVE CHECKOUT SCREEN (Pay style selector + Form inputs) */
            <div className="bg-[#0b0c10] border border-zinc-900 rounded-3xl p-5 space-y-4 animate-fadeIn relative">
              <button
                onClick={() => setSelectedType(null)}
                className="absolute top-4 right-4 text-xs text-zinc-500 hover:text-white"
              >
                Cancel ✕
              </button>

              <div className="border-b border-zinc-900 pb-2.5">
                <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-400 block font-black">SELECTED SECURE TUNNEL</span>
                <h4 className="text-sm font-black text-white mt-1 uppercase font-mono">{itemTitle}</h4>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Locked Price: <span className="text-emerald-400 font-extrabold">K {itemPrice}.00 ZMW</span></p>
              </div>

              {/* Payment Method Selector preferred checkout options */}
              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-extrabold">Choose Your Checkout Engine</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MOMO")}
                    className={`p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === "MOMO" ? "bg-[#ffa550]/10 border-[#ffa550] text-[#ffa550]" : "bg-zinc-950 border-zinc-900 text-zinc-450 hover:bg-zinc-900"
                    }`}
                  >
                    <span className="text-[14px]">📱</span>
                    <span>Mobile Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CARD")}
                    className={`p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === "CARD" ? "bg-indigo-505/10 border-indigo-500 text-indigo-400" : "bg-zinc-950 border-zinc-900 text-zinc-450 hover:bg-zinc-900"
                    }`}
                  >
                    <span className="text-[14px]">💳</span>
                    <span>Debit/Credit Card</span>
                  </button>
                </div>
              </div>

              {/* Dynamic checkout input forms */}
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 font-sans text-xs pt-1">
                {paymentMethod === "MOMO" ? (
                  /* MoMo input fields */
                  <div className="space-y-3 animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-mono block">Operator Network Carrier</label>
                      <select
                        value={momoOperator}
                        onChange={(e) => setMomoOperator(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 text-white rounded-xl py-2.5 px-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                      >
                        <option value="MTN">MTN MoMo (Zambia)</option>
                        <option value="Airtel">Airtel Money (Zambia)</option>
                        <option value="Zamtel">Zamtel Kwacha (Zambia)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-mono block">Mobile Money Customer Phone</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono text-[11px]">+260</span>
                        <input
                          type="text"
                          value={momoPhone.replace("260", "")}
                          onChange={(e) => setMomoPhone(`260${e.target.value.replace(/\D/g, "")}`)}
                          placeholder="97XXXXXXX"
                          maxLength={9}
                          className="w-full bg-zinc-950 border border-zinc-900 text-white rounded-xl py-2.5 pl-14 pr-3.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                        />
                      </div>
                      <span className="text-[9.5px] text-zinc-550 block leading-tight font-mono">
                        Ensure primary MTN or Airtel wallet has corresponding K{itemPrice} liquidity before proceeding.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Visa Card complete fields */
                  <div className="space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-zinc-500 font-mono">First Name</label>
                        <input
                          type="text"
                          required
                          value={cardForm.firstName}
                          onChange={(e) => setCardForm({ ...cardForm, firstName: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-900 text-white rounded-xl p-2 px-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-zinc-500 font-mono">Last Name</label>
                        <input
                          type="text"
                          required
                          value={cardForm.lastName}
                          onChange={(e) => setCardForm({ ...cardForm, lastName: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-900 text-white rounded-xl p-2 px-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] text-zinc-500 font-mono">Email Address</label>
                      <input
                        type="email"
                        required
                        value={cardForm.email}
                        onChange={(e) => setCardForm({ ...cardForm, email: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-900 text-white rounded-xl p-2 px-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] text-zinc-500 font-mono">Phone (for OTP validation)</label>
                      <input
                        type="text"
                        required
                        value={cardForm.phone}
                        onChange={(e) => setCardForm({ ...cardForm, phone: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-900 text-white rounded-xl p-2 px-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-zinc-500 font-mono">City</label>
                        <input
                          type="text"
                          value={cardForm.city}
                          onChange={(e) => setCardForm({ ...cardForm, city: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-900 text-white rounded-xl p-2 px-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-zinc-500 font-mono">Country</label>
                        <input
                          type="text"
                          disabled
                          value={cardForm.country}
                          className="w-full bg-zinc-950 border border-zinc-900 text-zinc-500 rounded-xl p-2 px-3 text-xs focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] text-zinc-500 font-mono">Billing Address</label>
                      <input
                        type="text"
                        value={cardForm.address}
                        onChange={(e) => setCardForm({ ...cardForm, address: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-900 text-white rounded-xl p-2 px-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isAuthorizing}
                  className={`w-full text-center text-xs font-black p-3.5 rounded-xl transition-all shadow-md select-none mt-4 flex items-center justify-center gap-2 cursor-pointer ${
                    paymentMethod === "MOMO" 
                      ? "bg-[#ffa500] hover:bg-[#ffb015] text-black shadow-amber-500/10" 
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-550/10"
                  }`}
                >
                  {isAuthorizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Securing Handshake Tunnel...</span>
                    </>
                  ) : (
                    <>
                      <span>{paymentMethod === "MOMO" ? "Authorize MoMo Payment via Lipila" : "Authorize Card Payment via Lipila"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
