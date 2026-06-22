import React, { useState } from "react";
import { X, CreditCard, Loader2, ShieldCheck, HelpCircle } from "lucide-react";

interface LipilaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  narration: string;
  referenceId: string;
  onSuccess?: (data: any) => void;
  onFailure?: (error: string) => void;
}

export const LipilaPaymentModal: React.FC<LipilaPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  narration,
  referenceId,
  onSuccess,
  onFailure
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [form, setForm] = useState({
    firstName: "Chipo",
    lastName: "Mwansa",
    email: "deepvaleyfarm@gmail.com",
    phoneNumber: "0971203040",
    city: "Lusaka",
    country: "ZM",
    address: "Plot 33, Great East Road Near Cooperative Block, Chisamba",
    zip: "10101"
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payments/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerInfo: {
            firstName: form.firstName,
            lastName: form.lastName,
            phoneNumber: form.phoneNumber,
            city: form.city,
            country: form.country,
            address: form.address,
            zip: form.zip,
            email: form.email
          },
          collectionRequest: {
            referenceId,
            amount,
            narration,
            currency: "ZMW"
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (onSuccess) {
          onSuccess(data);
        } else if (data.checkoutUrl) {
          // Default behaviour is to redirect user to Lipila secure gateway
          window.location.href = data.checkoutUrl;
        }
      } else {
        const errorMsg = data.error || data.message || "Failed to create payment session";
        if (onFailure) {
          onFailure(errorMsg);
        } else {
          alert(`Payment Session Unsuccessful: ${errorMsg}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (onFailure) {
        onFailure(err.message || "Network Error");
      } else {
        alert("Network Error with Lipila Secure Tunnel");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[200] flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="bg-[#0b0c10] border border-zinc-900 rounded-3xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl space-y-4 text-left text-zinc-100">
        
        {/* Subtle top decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffa500] via-indigo-500 to-emerald-500" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-black uppercase tracking-widest font-mono text-zinc-100">Secure Lipila Payment</h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing details banner */}
        <div className="bg-[#050608] border border-zinc-900 p-3 rounded-xl flex justify-between items-center text-xs font-mono">
          <div>
            <span className="text-zinc-500 text-[10px] block">ESCROW ORDER NARRATION</span>
            <span className="text-zinc-300 font-bold max-w-[180px] truncate block">{narration}</span>
          </div>
          <div className="text-right">
            <span className="text-zinc-500 text-[10px] block">ZMW AMOUNT</span>
            <span className="text-emerald-400 font-black text-sm">K {amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-mono">First Name</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 px-3.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-mono">Last Name</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 px-3.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-mono">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 px-3.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-mono">Phone Number</label>
            <input
              type="text"
              required
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="097XXXXXXX"
              className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 px-3.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-mono">City</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 px-3.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-mono">Country</label>
              <input
                type="text"
                disabled
                value={form.country}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 px-3.5 text-zinc-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-mono">Billing Address</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 px-3.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div className="flex items-start gap-2 text-[10px] text-zinc-450 leading-normal pt-1 pb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="font-mono">
              Certified by Lipila Bank Gateway. Encrypted under Payment Card Industry (PCI-DSS) security architecture.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 disabled:text-zinc-500 text-white font-extrabold p-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-650/10 flex items-center justify-center gap-1.5 text-xs text-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Creating Handshake Tunnel...</span>
              </>
            ) : (
              <span>Proceed to Card Details Checkout 💳</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
