import React, { useState, useEffect } from "react";
import { 
  X, Landmark, Loader2, Coins, Check, ArrowRight, ShieldCheck, HelpCircle, AlertCircle 
} from "lucide-react";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: "seller" | "agent" | "rider";
  availableBalance: number;
  onWithdrawSuccess: (amount: number) => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  role,
  availableBalance,
  onWithdrawSuccess
}) => {
  const [amount, setAmount] = useState<string>("");
  const [provider, setProvider] = useState<string>("MTN"); // MTN, Airtel, Zamtel
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successData, setSuccessData] = useState<any | null>(null);

  useEffect(() => {
    // Preset mock standard names based on role, for a fully production-ready seamless feel
    if (role === "seller") {
      setAccountHolderName("Chipo Mwansa Organic Farm");
      setAccountNumber("971203040");
      setPhoneNumber("260971203040");
      setProvider("MTN");
    } else if (role === "agent") {
      setAccountHolderName("Bupe Phiri Trading");
      setAccountNumber("978610200");
      setPhoneNumber("260978610200");
      setProvider("Airtel");
    } else {
      setAccountHolderName("John Phiri Logistics");
      setAccountNumber("971234567");
      setPhoneNumber("260971234567");
      setProvider("MTN");
    }
    // Default input cashing out state to full available balance
    setAmount(availableBalance > 0 ? availableBalance.toFixed(2) : "");
  }, [role, availableBalance, isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const estimatedFee = numAmount > 0 ? Math.max(1.5, parseFloat((numAmount * 0.015).toFixed(2))) : 0;
  const totalDeducted_zmw = numAmount + estimatedFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (numAmount <= 0) {
      setErrorMessage("Please type a valid cashing out value above K0 ZMW.");
      setIsSubmitting(false);
      return;
    }

    if (totalDeducted_zmw > availableBalance) {
      setErrorMessage(`Insufficient funds. Your transfer of K ${numAmount.toFixed(2)} with transaction fee K ${estimatedFee.toFixed(2)} exceeds your available K ${availableBalance.toFixed(2)}.`);
      setIsSubmitting(false);
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (!cleanPhone.startsWith("260") || cleanPhone.length !== 12) {
      setErrorMessage("Invalid Zambian number formatting. Must start with 260 followed by 9 digits.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Map selector provider to swiftCarrier Code
      const swiftCode = provider === "MTN" ? "CMTNZM" : provider === "Airtel" ? "AIRTZM" : "ZAMTZM";
      // Map mock role user id
      const userId = role === "seller" ? "sel_v7_mwansa" : role === "agent" ? "agt_v7_bupe" : "rid_v7_john";

      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          userId,
          amount: numAmount,
          firstName: role === "seller" ? "Chipo" : role === "agent" ? "Bupe" : "John",
          lastName: "Phiri",
          accountHolderName,
          phoneNumber: cleanPhone,
          accountNumber,
          swiftCode,
          email: `${role}.user@gmail.com`,
          narration: `Selonachipa Bank/Carrier Settlement Cashout - (${role.toUpperCase()})`
        })
      });

      const responseData = await res.json();
      if (res.ok && responseData.success) {
        setSuccessData(responseData);
        // Dispatch callback event
        onWithdrawSuccess(numAmount);
      } else {
        setErrorMessage(responseData.error || "The Lipila API provider declined the withdrawal request.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Network Timeout during withdrawal disbursement routing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[150] flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="bg-[#0b0c10] border border-zinc-900 rounded-3xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl space-y-4 text-left text-zinc-100">
        
        {/* Decorative Top Accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffa500] via-[#ff6a00] to-indigo-500" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-1.5">
            <Landmark className="w-5 h-5 text-[#ffa550]" />
            <h3 className="text-xs font-black uppercase tracking-widest font-mono text-zinc-100">
              Disburse Wallet Funds
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-zinc-500 hover:text-white transition-colors p-1 disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!successData ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Balance Display Block */}
            <div className="bg-[#050608] border border-zinc-900 p-3.5 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <span className="text-zinc-500 text-[9px] block uppercase tracking-wider font-mono">YOUR REMAINING LEDGER BALANCE</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  K {availableBalance.toFixed(2)} <span className="text-xs text-zinc-400 font-normal">ZMW</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8.5px] bg-[#ffa500]/10 text-[#ffa550] border border-[#ffa500]/20 px-2 py-0.5 rounded-full font-mono uppercase font-black">
                  Lipila Direct
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/15 p-3 rounded-xl flex items-start gap-2 text-[11px] text-red-400 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Amount Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Cashout Amount (ZMW)</label>
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance.toFixed(2))}
                  className="text-[9.5px] text-[#ffa550] hover:underline font-mono"
                >
                  Withdraw Whole Balance
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono text-sm">K</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 font-mono text-white text-sm rounded-xl py-2.5 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-[#ffa550]"
                />
              </div>
              {numAmount > 0 && (
                <div className="flex justify-between text-[10px] text-zinc-550 font-mono pt-0.5 px-0.5">
                  <span>Standard Lipila Surcharge: K {estimatedFee.toFixed(2)}</span>
                  <span>Will debit ledger: K {totalDeducted_zmw.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Provider Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Mobile Money Network</label>
              <div className="grid grid-cols-3 gap-2">
                {["MTN", "Airtel", "Zamtel"].map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setProvider(prov)}
                    className={`py-2 rounded-xl border text-xs font-mono font-black tracking-wide transition-all ${
                      provider === prov
                        ? "bg-[#ffa500]/10 border-[#ffa550] text-[#ffa550]"
                        : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {prov} Zambia
                  </button>
                ))}
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Account Number */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Account Phone / Wallet Number</label>
                <input
                  type="text"
                  required
                  placeholder="097XXXXXXX"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white font-mono rounded-xl p-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Destination Mobile Money Identifier */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">System Phone Number (260...)</label>
                <input
                  type="text"
                  required
                  placeholder="260971203040"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white font-mono rounded-xl p-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Holder Name */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Recipient Registered Full Name</label>
              <input
                type="text"
                required
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white rounded-xl p-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-start gap-2 text-[10px] text-zinc-550 leading-relaxed font-mono py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                Security lock applied in escrow pending direct provider settlement confirmation.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ffa500] hover:bg-amber-400 disabled:bg-zinc-900 disabled:text-zinc-650 text-black font-black py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 text-xs text-center cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Cashing Out & Handshaking...</span>
                </>
              ) : (
                <span>Initiate Withdraw Command ⚡</span>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-5 animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3.5px]" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-white px-2">Disbursement Request Dispatched!</h4>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed px-1">
                Your cash-out of <strong className="text-emerald-400">K {numAmount.toFixed(2)} ZMW</strong> is processing via the Lipila network. Direct SMS confirmation will follow shortly.
              </p>
            </div>

            <div className="bg-[#050608] border border-zinc-900 rounded-2xl p-4 text-left font-mono text-[9.5px] space-y-1 px-4.5">
              <p className="flex justify-between text-zinc-400"><span className="text-zinc-550">Reference ID:</span> <span>{successData.referenceId}</span></p>
              <p className="flex justify-between text-zinc-400"><span className="text-zinc-550">Carrier Route:</span> <span className="text-[#ffa550]">{provider} Zambia</span></p>
              <p className="flex justify-between text-zinc-400"><span className="text-zinc-550">Status State:</span> <span className="text-indigo-400 font-extrabold">PROCESSING_LOCK</span></p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-100 font-extrabold text-xs py-3 rounded-xl cursor-pointer"
            >
              Acknowledge & Refresh Balances
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
