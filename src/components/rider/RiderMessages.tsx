import React, { useState } from "react";
import { 
  MessageSquare, Container, PhoneCall, Check, Star, ShieldAlert, ArrowRight, 
  ShieldCheck, MapPin, Truck, RefreshCw, Send, ArrowLeft, HeartPulse, User, Bell 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RiderMessagesProps {
  rider: { name: string };
  conversations: any[];
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  addCompletedJobLog: (job: any) => void;
  systemAlerts: any[];
}

export const RiderMessages: React.FC<RiderMessagesProps> = ({
  rider,
  conversations,
  setConversations,
  systemAlerts,
}) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [msgInputText, setMsgInputText] = useState<string>("");

  const activeChat = conversations.find(c => c.conversation_id === activeChatId);

  const handleOpenChat = (id: string) => {
    setActiveChatId(id);
    // Mark as read
    setConversations(prev => prev.map(c => {
      if (c.conversation_id === id) {
        return { ...c, unread_count: 0 };
      }
      return c;
    }));
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInputText.trim() || !activeChatId) return;

    const newMsg = {
      message_id: `msg-${Date.now()}`,
      sender: "system", // 'system' in common types acts as the runner/rider in these contexts
      text: msgInputText,
      timestamp: "Just Now",
    };

    setConversations(prev => prev.map(c => {
      if (c.conversation_id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          last_message_time: "Just Now",
        };
      }
      return c;
    }));

    setMsgInputText("");

    // Simulate quick feedback reply from buyer/seller after 2 seconds
    setTimeout(() => {
      let automatedResponse = "Understood, thanks for the quick transport coordination!";
      if (activeChatId === "conv-1") {
        automatedResponse = "Awesome, I'm by the black gate behind Woodlands Mall now.";
      } else if (activeChatId === "conv-2") {
        automatedResponse = "Perfect, the bags are stitched tight and stacked at Chisamba hub!";
      }

      setConversations(prev => prev.map(c => {
        if (c.conversation_id === activeChatId) {
          const autoMsg = {
            message_id: `msg-auto-${Date.now()}`,
            sender: c.conversation_id === "conv-1" ? "buyer" : "seller",
            text: automatedResponse,
            timestamp: "Just Now",
          };
          return {
            ...c,
            messages: [...c.messages, autoMsg],
            last_message_time: "Just Now",
          };
        }
        return c;
      }));
    }, 2000);
  };

  return (
    <div id="rider-messages-panel" className="px-5 py-4 space-y-5 text-left font-sans max-w-md mx-auto bg-[#040507] text-white">
      
      <AnimatePresence mode="wait">
        {!activeChatId ? (
          <motion.div
            key="inbox-view"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-4"
          >
            {/* Active order chats section */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#00ffd2]" />
                <span>Active Order Chats</span>
              </h3>

              <div className="bg-[#07090c] border border-zinc-850 rounded-2xl divide-y divide-zinc-900/60 overflow-hidden shadow-md">
                {conversations.map((conv) => {
                  return (
                    <button
                      key={conv.conversation_id}
                      onClick={() => handleOpenChat(conv.conversation_id)}
                      className="w-full p-3.5 flex justify-between items-center text-left bg-transparent hover:bg-zinc-900/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-extrabold text-sm font-mono uppercase">
                          {conv.buyer_initials || "CM"}
                        </div>
                        <div className="space-y-0.5 leading-snug">
                          <h4 className="text-xs font-bold text-zinc-200">{conv.buyer_name}</h4>
                          <span className="text-[9px] font-mono text-[#ffa550] block">Ref: {conv.order_id}</span>
                          <p className="text-[10px] text-zinc-400 truncate max-w-[190px]">
                            {conv.messages[conv.messages.length - 1]?.text}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[8.5px] text-zinc-500 font-mono">{conv.last_message_time}</span>
                        {conv.unread_count > 0 && (
                          <span className="bg-rose-500 text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-rose-600/30">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dispatch official notifications section */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Dispatch Platform Feeds</span>
              </h3>

              <div className="space-y-2">
                {systemAlerts.map((alt) => {
                  return (
                    <div 
                      key={alt.id} 
                      className="bg-zinc-950/45 border-l-2 border-[#ffa550] border-y border-r border-[#ffa550]/10 p-3 rounded-r-xl space-y-1 hover:border-r-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-1 rounded text-black shrink-0">
                          <Truck className="w-3 h-3" />
                        </div>
                        <h4 className="text-[10.5px] font-extrabold text-zinc-200">{alt.title}</h4>
                        <span className="text-[8.5px] text-zinc-500 font-mono ml-auto">{alt.time}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal pl-7">{alt.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        ) : (
          /* ACTIVE INTERACTIVE CHAT SCREEN OVERLAY */
          <motion.div
            key="chat-thread-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-[#0b0c10] border border-zinc-850 rounded-2xl flex flex-col h-[480px] overflow-hidden"
          >
            {/* Header bar */}
            <div className="p-3.5 border-b border-zinc-900 bg-zinc-950 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveChatId(null)}
                  className="p-1.5 rounded-lg bg-[#0c0d12] border border-zinc-850 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-400" />
                </button>
                <div>
                  <h4 className="text-xs font-black text-zinc-200">{activeChat?.buyer_name}</h4>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">Order ID: {activeChat?.order_id}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`VoIP Dial Session triggered! Calling ${activeChat?.buyer_name}`);
                }}
                className="p-1 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10.5px] font-bold font-mono hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Gate</span>
              </button>
            </div>

            {/* Talk Bubble list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#07090c] scrollbar-thin">
              {activeChat?.messages.map((m: any) => {
                const isRiderMe = m.sender === "system";
                return (
                  <div 
                    key={m.message_id}
                    className={`flex ${isRiderMe ? "justify-end" : "justify-start"} items-end gap-1.5`}
                  >
                    {!isRiderMe && (
                      <div className="w-5.5 h-5.5 rounded-full bg-zinc-800 text-[8px] font-mono font-black flex items-center justify-center border border-zinc-700">
                        {activeChat?.buyer_initials}
                      </div>
                    )}
                    <div className={`p-2.5 rounded-xl max-w-[210px] text-[10.5px] leading-relaxed shadow-sm ${
                      isRiderMe 
                        ? "bg-[#ffa550] text-[#040507] rounded-br-none font-medium" 
                        : "bg-[#0b0c10] border border-zinc-850 text-zinc-200 rounded-bl-none"
                    }`}>
                      <p>{m.text}</p>
                      <span className={`text-[8px] block mt-1 font-mono text-right ${isRiderMe ? "text-zinc-900/60" : "text-zinc-500"}`}>
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action text input */}
            <form onSubmit={handleSendReply} className="p-3 border-t border-zinc-900 bg-zinc-950 flex gap-2">
              <input
                type="text"
                required
                value={msgInputText}
                onChange={(e) => setMsgInputText(e.target.value)}
                placeholder="Type your logistic update..."
                className="flex-1 bg-[#050609] border border-zinc-850 text-xs px-3.5 py-2.5 rounded-xl text-white focus:outline-none focus:border-[#ffa550]"
              />
              <button
                type="submit"
                className="bg-[#ffa550] text-[#040507] p-2 rounded-xl flex items-center justify-center hover:bg-amber-400 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
