import { useState } from "react";
import { Download, AlertTriangle, FileText, CheckCircle2, ShieldCheck, Landmark, ArrowRight, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WithdrawalModal } from "../WithdrawalModal";

interface SellerEarningsProps {
  sellerBalance: number;
  setSellerBalance: (bal: number) => void;
  autoSettle: boolean;
  setAutoSettle: (val: boolean) => void;
  sellerPrimaryWallet: string;
  setToast: (toast: { message: string; subText?: string } | null) => void;
}

export default function SellerEarnings({
  sellerBalance,
  setSellerBalance,
  autoSettle,
  setAutoSettle,
  sellerPrimaryWallet,
  setToast
}: SellerEarningsProps) {
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState<boolean>(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState<boolean>(false);
  const [isStatementOpen, setIsStatementOpen] = useState<boolean>(false);
  const [isWithdrawSuccessOpen, setIsWithdrawSuccessOpen] = useState<boolean>(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState<number>(0);

  // Hardcoded stats for full functional fidelity
  const weekRevenue = 15200.00;
  const monthRevenue = 84200.00;
  const totalPlatformFees = 1840.00; 

  // Recent Settlements Log
  const mockSettlements = [
    { id: "set-01", orderId: "ord-88392", amount: 90.00, fee: 4.50, net: 85.50, wallet: "Airtel Money", time: "10 mins ago" },
    { id: "set-02", orderId: "ord-71029", amount: 450.00, fee: 22.50, net: 427.50, wallet: "Airtel Money", time: "Yesterday" },
    { id: "set-03", orderId: "ord-44930", amount: 1200.00, fee: 60.00, net: 1140.00, wallet: "MTN MoMo", time: "2 days ago" }
  ];

  // Action: Statement Download PDF Simulation
  const handleDownloadStatement = () => {
    setIsStatementOpen(false);
    setToast({
      message: "Statement Generated!",
      subText: "Verified Ledger PDF has been downloaded to your device."
    });
  };

  // Action: Instant Withdraw via Lipila
  const handleWithdrawNow = () => {
    if (sellerBalance <= 0) {
      setToast({
        message: "Insufficient Funds",
        subText: "Your available balance is currently empty."
      });
      return;
    }
    setIsWithdrawalModalOpen(true);
  };

  return (
    <div className="space-y-4 animate-fadeIn text-left pt-1">
      {/* Available Balance Box */}
      <div className="bg-[#0c0d12] border border-zinc-850 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-450 uppercase font-mono tracking-widest font-extrabold block">
            AVAILABLE MERCHANT BALANCE
          </label>
          <p className="text-3xl font-black text-emerald-400 font-mono leading-none">
            K {sellerBalance.toLocaleString()} <span className="text-sm font-bold text-zinc-400">ZMW</span>
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <span className="text-[9px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 text-zinc-400">
              Primary: <strong className="text-zinc-200">{sellerPrimaryWallet}</strong>
            </span>
          </div>
        </div>

        {/* Auto settle badge */}
        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 self-stretch md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-zinc-900/60 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase">Daily Auto-Settle</span>
            <button
              onClick={() => {
                setAutoSettle(!autoSettle);
                setToast({
                  message: `Auto-Settle Turned ${!autoSettle ? "ON" : "OFF"}`,
                  subText: `Payments will ${!autoSettle ? "drain daily" : "will accumulate until manually requested"}.`
                });
              }}
              className={`w-9 h-5 rounded-full p-0.5 transition-all outline-none border-none cursor-pointer ${
                autoSettle ? "bg-emerald-500 flex justify-end" : "bg-zinc-800 flex justify-start"
              }`}
            >
              <div className="w-4 h-4 bg-black rounded-full shadow" />
            </button>
          </div>
          <span className="text-[8.5px] text-zinc-550 block">Drains to mobile wallet daily at 23:59 CAT</span>
        </div>
      </div>

      {/* Stats 4-Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#0b0c10]/40 border border-zinc-900 p-3 rounded-xl">
          <span className="text-[8.5px] text-zinc-450 uppercase font-mono tracking-wider">Today's Commission</span>
          <p className="text-[13.5px] font-mono font-black text-white mt-1">K 4,850.00 ZMW</p>
        </div>
        <div className="bg-[#0b0c10]/40 border border-zinc-900 p-3 rounded-xl">
          <span className="text-[8.5px] text-zinc-450 uppercase font-mono tracking-wider">This Week Volume</span>
          <p className="text-[13.5px] font-mono font-black text-white mt-1">K {weekRevenue.toLocaleString()} ZMW</p>
        </div>
        <div className="bg-[#0b0c10]/40 border border-zinc-900 p-3 rounded-xl">
          <span className="text-[8.5px] text-zinc-450 uppercase font-mono tracking-wider">This Month Gross</span>
          <p className="text-[13.5px] font-mono font-black text-white mt-1">K {monthRevenue.toLocaleString()} ZMW</p>
        </div>
        {/* Total Platform Fee (Shown in Coral Red as mandated) */}
        <div className="bg-[#120a0a]/50 border border-red-950/20 p-3 rounded-xl">
          <span className="text-[8.5px] text-red-400 uppercase font-mono tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            Platform Fee Deducted
          </span>
          <p className="text-[13.5px] font-mono font-black text-red-450 mt-1">
            K {totalPlatformFees.toLocaleString()} ZMW
          </p>
        </div>
      </div>

      {/* Settlements List */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-450 font-bold px-1">
          Recent Settlements via Lipila Ledger
        </label>
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
          {mockSettlements.map((set) => (
            <div 
              key={set.id}
              className="bg-[#07080b] border border-zinc-900 p-3 rounded-xl flex justify-between items-center text-xs"
            >
              <div>
                <p className="text-[11px] font-bold text-white">Order: {set.orderId}</p>
                <div className="flex gap-2 text-[9px] text-zinc-550 font-mono mt-0.5">
                  <span>Gross: K {set.amount}.00</span>
                  <span className="text-red-400">Fee (5%): -K {set.fee.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] font-black font-mono text-emerald-400">+K {set.net.toFixed(2)}</p>
                <span className="text-[9px] text-zinc-650 font-mono block mt-0.5">{set.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons: Statement and Withdraw Now */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => setIsStatementOpen(true)}
          className="py-2.5 bg-zinc-900 hover:bg-zinc-850 active:scale-98 text-zinc-300 font-extrabold text-[10.5px] rounded-xl border border-zinc-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-zinc-450" />
          <span>Statement Report</span>
        </button>

        <button
          onClick={handleWithdrawNow}
          disabled={isProcessingWithdraw}
          className="py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-black uppercase text-[10.5px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/5"
        >
          {isProcessingWithdraw ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Landmark className="w-4 h-4 stroke-[2px]" />
          )}
          <span>{isProcessingWithdraw ? "Processing..." : "Withdraw Now"}</span>
        </button>
      </div>

      {/* Overlay modal A: Printable PDF generate view */}
      <AnimatePresence>
        {isStatementOpen && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-sm rounded-2xl p-5 text-left"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-3.5">
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <FileText className="w-4.5 h-4.5 text-[#ffa550]" />
                  <span>Ledger Statement</span>
                </h3>
                <button 
                  onClick={() => setIsStatementOpen(false)}
                  className="w-6 h-6 rounded bg-zinc-900 text-zinc-500 hover:text-white flex items-center justify-center cursor-pointer border border-zinc-850"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl space-y-3 font-mono text-[10.5px] text-zinc-300">
                <p className="text-xs font-black text-[#ffa500]">SELONACHIPA COMMERCE LTD</p>
                <div className="space-y-1">
                  <p>Merchant Code: <strong className="text-white">sel-chipo</strong></p>
                  <p>Storefront: <span className="text-white">Chisamba Organic Trade Hub</span></p>
                  <p>Fiscal Period: <span className="text-white">June 01 - June 09 2026</span></p>
                </div>
                <div className="border-t border-dashed border-zinc-800 pt-2 space-y-1">
                  <p className="flex justify-between"><span>Settlement Records:</span> <span className="text-white">3 logs</span></p>
                  <p className="flex justify-between"><span>Total gross settlements:</span> <span className="text-emerald-400">K 1,740.00 ZMW</span></p>
                  <p className="flex justify-between"><span>Platform transaction fee:</span> <span className="text-red-400">K 87.00 ZMW</span></p>
                  <p className="flex justify-between font-black border-t border-zinc-800 pt-1.5"><span>Net Disbursed Funds: </span> <span className="text-white">K 1,653.00 ZMW</span></p>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsStatementOpen(false)}
                  className="flex-1 py-1.5 bg-zinc-900 text-zinc-400 text-xs font-extrabold rounded-lg hover:bg-zinc-850 border border-zinc-800 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDownloadStatement}
                  className="flex-1 py-1.5 bg-[#ffa500] text-black text-xs font-black rounded-lg hover:bg-[#e09100] cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overlay modal B: Withdraw success confetti widget */}
      <AnimatePresence>
        {isWithdrawSuccessOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-sm rounded-[24px] p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-550/10 border border-emerald-555/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 stroke-[2.5px]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Lipila Transfer Complete!</h3>
                <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-wider">Transaction Block Ref: lpl-disb-302a</p>
              </div>

              <div className="bg-[#0c0d12] border border-zinc-900 p-4 rounded-2xl text-left space-y-2 text-xs">
                <p className="flex justify-between text-zinc-500"><span>Disbursed Amount:</span> <strong className="text-emerald-400 font-mono">K {withdrawnAmount} ZMW</strong></p>
                <p className="flex justify-between text-zinc-500"><span>Transferred via:</span> <span className="text-white font-medium">Lipila Instant Settlement Gateway</span></p>
                <p className="flex justify-between text-zinc-500"><span>Recipient Wallet:</span> <span className="text-[#ffa500] font-mono">{sellerPrimaryWallet}</span></p>
                <p className="flex justify-between text-zinc-500"><span>Network Status:</span> <span className="text-emerald-400 font-bold">✓ SETTLED SUCCESS</span></p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawSuccessOpen(false)}
                  className="w-full py-2.5 bg-[#ffa500] hover:bg-[#e09100] text-black font-black text-xs rounded-xl cursor-pointer"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        role="seller"
        availableBalance={sellerBalance}
        onWithdrawSuccess={(amount) => {
          setSellerBalance(Math.max(0, sellerBalance - amount));
          setIsWithdrawalModalOpen(false);
          setToast({
            message: "Withdrawal Generated ✓",
            subText: `K ${amount.toFixed(2)} ZMW sent instantly through Lipila to your mobile wallet.`
          });
        }}
      />
    </div>
  );
}
