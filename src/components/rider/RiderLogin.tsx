import React, { useState } from "react";
import { Lock, Shuffle, KeyRound, HelpCircle, ArrowLeft, RefreshCw, Eye, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RiderLoginProps {
  rider: {
    name: string;
    photo: string;
    phone: string;
  };
  correctPin: string;
  onLoginSuccess: () => void;
  onUpdatePin: (newPin: string) => void;
  securityQuestions: { q: string; a: string }[];
  onUpdateSecurityQuestions?: (newQuestions: { q: string; a: string }[]) => void;
}

export const RiderLogin: React.FC<RiderLoginProps> = ({
  rider,
  correctPin,
  onLoginSuccess,
  onUpdatePin,
  securityQuestions,
}) => {
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [resetAnswers, setResetAnswers] = useState<string[]>(["", "", ""]);
  const [newPinInput, setNewPinInput] = useState<string>("");
  const [newPinConfirm, setNewPinConfirm] = useState<string>("");
  const [resetError, setResetError] = useState<string>("");
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  const handleKeyPress = (num: string) => {
    setLoginError("");
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setTimeout(() => {
            onLoginSuccess();
          }, 300);
        } else {
          setTimeout(() => {
            setLoginError("Incorrect PIN. Please try again.");
            setEnteredPin("");
          }, 250);
        }
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin(enteredPin.slice(0, -1));
    setLoginError("");
  };

  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    // Check if matches
    const allMatch = securityQuestions.every((item, idx) => {
      return resetAnswers[idx].trim().toLowerCase() === item.a.toLowerCase();
    });

    if (!allMatch) {
      setResetError("One or more security answers do not match our records. Please try again.");
      return;
    }

    if (newPinInput.length !== 4 || !/^\d+$/.test(newPinInput)) {
      setResetError("New PIN must be exactly 4 numerical digits.");
      return;
    }

    if (newPinInput !== newPinConfirm) {
      setResetError("New PIN and Confirm PIN do not match.");
      return;
    }

    // Success
    onUpdatePin(newPinInput);
    setResetSuccess(true);
    setTimeout(() => {
      setIsResetMode(false);
      setResetSuccess(false);
      setEnteredPin("");
      setNewPinInput("");
      setNewPinConfirm("");
      setResetAnswers(["", "", ""]);
    }, 2000);
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div id="rider-login-container" className="min-h-[580px] flex flex-col justify-between bg-[#040507] text-white p-6 relative font-sans max-w-md mx-auto rounded-3xl border border-zinc-850 shadow-2xl overflow-hidden">
      {/* Visual Ambient glow */}
      <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[40%] bg-radial from-emerald-950/15 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {!isResetMode ? (
          <motion.div
            key="login-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col justify-between"
          >
            {/* Header / Avatar */}
            <div className="text-center pt-8 space-y-4">
              <div className="relative inline-block">
                {rider.photo ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={rider.photo}
                    alt={rider.name}
                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-emerald-500/30 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full mx-auto bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-lg tracking-wider">
                    {getInitials(rider.name)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-[#040507]" />
              </div>

              <div>
                <h2 className="text-base font-bold text-zinc-100 tracking-tight">{rider.name}</h2>
                <p className="text-[10px] uppercase font-mono tracking-widest text-[#ffa550] mt-0.5">Verified Logistics Rider</p>
              </div>

              {/* Pin boxes */}
              <div className="py-4">
                <div className="flex justify-center gap-3.5">
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = enteredPin.length > index;
                    const isCurrent = enteredPin.length === index;
                    return (
                      <div
                        key={index}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                          isCurrent
                            ? "bg-[#0c0f14] border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                            : isFilled
                            ? "bg-[#06080b] border-emerald-500/40"
                            : "bg-[#06080b] border-zinc-800"
                        }`}
                      >
                        {isFilled ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        ) : isCurrent ? (
                          <div className="w-1 h-3.5 bg-emerald-500 rounded-full animate-pulse" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                {loginError && (
                  <p className="text-xs text-rose-500 font-medium mt-3 animate-shake">{loginError}</p>
                )}
              </div>
            </div>

            {/* Numberpad & Forgotten Link */}
            <div className="space-y-6 pb-4">
              <div className="grid grid-cols-3 gap-y-3.5 gap-x-5 max-w-[280px] mx-auto">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num)}
                    className="w-12 h-12 rounded-full flex items-center justify-center font-mono text-base font-medium bg-[#0f1115] border border-zinc-850 hover:bg-zinc-800/80 active:scale-95 active:bg-emerald-500/10 active:border-emerald-500/30 transition-all cursor-pointer text-zinc-200"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setIsResetMode(true)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  title="Unlock options"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleKeyPress("0")}
                  className="w-12 h-12 rounded-full flex items-center justify-center font-mono text-base font-medium bg-[#0f1115] border border-zinc-850 hover:bg-zinc-800/80 active:scale-95 transition-all cursor-pointer text-zinc-200"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
                >
                  ⌫
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setIsResetMode(true)}
                  className="text-[10px] text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Forgot PIN? Reset with security questions
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reset-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-5 mt-2">
                <button
                  onClick={() => setIsResetMode(false)}
                  className="p-1 px-1.5 rounded-lg bg-[#0c0f14] border border-zinc-850"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-400" />
                </button>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">Reset Security Gate</h3>
              </div>

              {resetSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-250">PIN Success</h4>
                    <p className="text-[10px] text-zinc-400 mt-1">Your secure credentials are locked. Return to keyboard.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetPinSubmit} className="space-y-4 text-left max-h-[420px] overflow-y-auto pr-1">
                  <p className="text-[10.5px] text-zinc-400 leading-relaxed bg-[#0c0f14]/50 p-2.5 rounded-xl border border-zinc-900 font-mono">
                    ⚠️ Verify each security answer exactly. For security reasons, matches are case-insensitive but must match spelling from file signup.
                  </p>

                  <div className="space-y-3">
                    {securityQuestions.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="block text-[9.5px] font-mono text-zinc-500 uppercase tracking-wide">
                          Question {idx + 1}: {item.q}
                        </label>
                        <input
                          type="text"
                          required
                          value={resetAnswers[idx]}
                          onChange={(e) => {
                            const answers = [...resetAnswers];
                            answers[idx] = e.target.value;
                            setResetAnswers(answers);
                          }}
                          className="w-full bg-[#07090c] border border-zinc-850 text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-zinc-700"
                          placeholder="Your answer"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-900 pt-3.5 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-mono text-zinc-500 uppercase tracking-wide">
                          Select New 4-Digit PIN
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={newPinInput}
                          onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-[#07090c] border border-zinc-850 text-xs px-3 py-2 rounded-xl text-center focus:border-emerald-500 focus:outline-none font-mono"
                          placeholder="••••"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-mono text-zinc-500 uppercase tracking-wide">
                          Confirm New PIN
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={newPinConfirm}
                          onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-[#07090c] border border-zinc-850 text-xs px-3 py-2 rounded-xl text-center focus:border-emerald-500 focus:outline-none font-mono"
                          placeholder="••••"
                        />
                      </div>
                    </div>
                  </div>

                  {resetError && (
                    <p className="text-[10px] text-rose-500 bg-rose-500/10 border border-rose-500/10 p-2 rounded-lg font-medium">{resetError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 text-[#040507] hover:bg-emerald-400 font-extrabold text-xs py-2.5 rounded-xl transition-colors mt-2 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Set New Secure Credentials
                  </button>
                </form>
              )}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold cursor-pointer"
              >
                Back to PIN login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
