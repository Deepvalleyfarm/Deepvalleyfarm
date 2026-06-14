import React, { useState } from "react";
import { Lock, Shuffle, KeyRound, ArrowLeft, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SellerLoginProps {
  onLoginSuccess: () => void;
  sellerPinCode: string;
  setSellerPinCode: (pin: string) => void;
  setToast: (toast: { message: string; subText?: string } | null) => void;
}

export default function SellerLogin({ 
  onLoginSuccess, 
  sellerPinCode, 
  setSellerPinCode, 
  setToast 
}: SellerLoginProps) {
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [isRecovering, setIsRecovering] = useState<boolean>(false);
  const [q1, setQ1] = useState<string>("");
  const [q2, setQ2] = useState<string>("");
  const [q3, setQ3] = useState<string>("");
  const [isSettingNewPin, setIsSettingNewPin] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>("");
  const [newPinConfirm, setNewPinConfirm] = useState<string>("");

  const defaultAnswers = {
    q1: "rex",
    q2: "chizongwe",
    q3: "lusaka"
  };

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      
      // Auto-validate if 4 digits entered
      if (nextPin.length === 4) {
        if (nextPin === sellerPinCode) {
          setTimeout(() => {
            onLoginSuccess();
            setToast({
              message: "Access Granted - Welcome back",
              subText: "Secure Merchant Workspace initialized successfully."
            });
          }, 350);
        } else {
          setTimeout(() => {
            setEnteredPin("");
            setToast({
              message: "Invalid Security PIN",
              subText: "Verification hash mismatch. Please try again or tap forgot PIN."
            });
          }, 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setEnteredPin("");
  };

  const handleVerifyQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    const ans1 = q1.toLowerCase().trim();
    const ans2 = q2.toLowerCase().trim();
    const ans3 = q3.toLowerCase().trim();

    if (ans1 === defaultAnswers.q1 && ans2 === defaultAnswers.q2 && ans3 === defaultAnswers.q3) {
      setIsSettingNewPin(true);
      setToast({
        message: "Questions Validated!",
        subText: "All answers matched. Please enter a new 4-digit PIN."
      });
    } else {
      setToast({
        message: "Verification Failed",
        subText: "Answers do not match our secure records. Try again."
      });
    }
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      setToast({ message: "Invalid PIN", subText: "PIN must be exactly 4 digits." });
      return;
    }
    if (newPin !== newPinConfirm) {
      setToast({ message: "Mismatch Error", subText: "Confirm PIN does not match." });
      return;
    }

    setSellerPinCode(newPin);
    setIsSettingNewPin(false);
    setIsRecovering(false);
    setEnteredPin("");
    setQ1("");
    setQ2("");
    setQ3("");
    setToast({
      message: "PIN Updated!",
      subText: "New security PIN saved. Enter it to log in."
    });
  };

  return (
    <div className="min-h-[500px] flex flex-col justify-center items-center p-4 bg-[#050506] text-white">
      <AnimatePresence mode="wait">
        {!isRecovering ? (
          /* Normal PIN Entry Screen */
          <motion.div 
            key="pin-entry"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-sm flex flex-col items-center space-y-6 pt-4"
          >
            {/* Seller profile header (pre-auth) */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-teal-500/10 border-2 border-teal-500/30 flex items-center justify-center text-lg font-black text-teal-400 mx-auto shadow-xl">
                CM
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Chipo Mwansa</h3>
                <p className="text-[10px] uppercase font-mono tracking-widest text-[#ffa500] font-bold mt-0.5">
                  Chisamba Organic Trade Hub
                </p>
              </div>
            </div>

            {/* Hint Badge in Sandbox */}
            <div className="text-[9.5px] font-mono text-zinc-500 bg-zinc-900/60 py-1 px-3 rounded-xl border border-zinc-950">
              🔒 Enter 4-digit Sandbox PIN (Default: <span className="text-[#ffa500] font-bold">{sellerPinCode}</span>)
            </div>

            {/* PIN Dots indicators */}
            <div className="flex justify-center gap-3.5 my-2">
              {[0, 1, 2, 3].map((idx) => {
                const filled = enteredPin.length > idx;
                return (
                  <div 
                    key={idx}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                      filled 
                        ? "border-[#ffa500] bg-[#ffa500]/5 text-[#ffa500] scale-105" 
                        : "border-zinc-800 bg-zinc-950/40 text-zinc-650"
                    }`}
                  >
                    {filled ? (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3.5 h-3.5 rounded-full bg-[#ffa500]"
                      />
                    ) : (
                      <span className="text-zinc-700 font-mono text-xs">_</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Simplified Number Pad */}
            <div className="w-full grid grid-cols-3 gap-2.5 max-w-[280px]">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 active:bg-zinc-950 border border-zinc-850/60 text-sm font-black font-mono transition-all text-white hover:text-white cursor-pointer select-none active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="py-3 rounded-xl text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 transition-colors cursor-pointer select-none"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress("0")}
                className="py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 active:bg-zinc-950 border border-zinc-850/60 text-sm font-black font-mono transition-all text-white hover:text-white cursor-pointer select-none active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer select-none text-xs"
              >
                ⌫
              </button>
            </div>

            {/* Reset pin helper link */}
            <button
              type="button"
              onClick={() => setIsRecovering(true)}
              className="text-[11px] text-zinc-400 hover:text-teal-400 font-bold transition-all underline cursor-pointer bg-transparent border-none outline-none mt-2"
            >
              Forgot PIN? Reset with security questions
            </button>
          </motion.div>
        ) : (
          /* Security Question Recovery Screen */
          <motion.div 
            key="recovery"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-sm bg-zinc-950/40 border border-zinc-850 p-5 rounded-2xl text-left"
          >
            <button
              type="button"
              onClick={() => {
                setIsRecovering(false);
                setIsSettingNewPin(false);
              }}
              className="flex items-center gap-1.5 text-[10.5px] text-zinc-400 hover:text-white font-bold mb-4 outline-none border-none bg-transparent cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to PIN screen</span>
            </button>

            {!isSettingNewPin ? (
              <form onSubmit={handleVerifyQuestions} className="space-y-4">
                <div className="border-b border-zinc-900 pb-2">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#ffa500]" />
                    <span>Reset Merchant PIN</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
                    Provide the correct security question answers to authenticate your ownership offline.
                  </p>
                </div>

                {/* Question 1 */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-450 font-bold uppercase font-mono">
                    Q1: What is your first pet's name?
                  </label>
                  <input
                    type="text"
                    required
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                    placeholder="e.g. Rex"
                    className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white font-medium"
                    placeholder-style="color: #4b5563"
                  />
                </div>

                {/* Question 2 */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-450 font-bold uppercase font-mono">
                    Q2: What high school did you attend in Zambia?
                  </label>
                  <input
                    type="text"
                    required
                    value={q2}
                    onChange={(e) => setQ2(e.target.value)}
                    placeholder="e.g. Chizongwe"
                    className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white font-medium"
                  />
                </div>

                {/* Question 3 */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-450 font-bold uppercase font-mono">
                    Q3: In which Zambian town or city were you born?
                  </label>
                  <input
                    type="text"
                    required
                    value={q3}
                    onChange={(e) => setQ3(e.target.value)}
                    placeholder="e.g. Lusaka"
                    className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#ffa500] hover:bg-[#e09100] active:scale-98 text-black text-xs font-black py-2.5 rounded-xl transition-all cursor-pointer shadow-lg"
                  >
                    Verify Identity Answers
                  </button>
                  <p className="text-[9px] text-center text-zinc-600 mt-2.5 font-mono">
                    Sandbox details: rex / chizongwe / lusaka
                  </p>
                </div>
              </form>
            ) : (
              /* Set New PIN Form */
              <form onSubmit={handleSavePin} className="space-y-4 animate-fadeIn">
                <div className="border-b border-zinc-900 pb-2">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-teal-400" />
                    <span>Create New PIN</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
                    Enter your new 4-digit numeric code to protect your sales payouts.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-450 font-bold uppercase font-mono">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 text-sm text-center font-bold font-mono tracking-widest rounded-xl focus:border-teal-500 focus:outline-none text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-450 font-bold uppercase font-mono">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newPinConfirm}
                    onChange={(e) => setNewPinConfirm(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 text-sm text-center font-bold font-mono tracking-widest rounded-xl focus:border-teal-500 focus:outline-none text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-black text-xs font-black py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-teal-500/10 mt-2"
                >
                  Save New Security PIN
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
