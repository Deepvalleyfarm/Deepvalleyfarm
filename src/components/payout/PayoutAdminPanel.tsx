import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Loader2, RefreshCw, Layers, CheckCircle2, XCircle, Clock, Search, AlertCircle, FileText, Globe, KeyRound 
} from "lucide-react";

interface PayoutAdminPanelProps {
  onSpawnToast: (toast: { message: string; subText?: string }) => void;
  onRefreshBalances?: () => void;
}

export default function PayoutAdminPanel({ onSpawnToast, onRefreshBalances }: PayoutAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"TRANSACTIONS" | "AUDIT_LOGS">("TRANSACTIONS");
  
  // Data State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const txRes = await fetch("/api/wallet/transactions");
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
      
      const auditRes = await fetch("/api/wallet/admin/audit-logs");
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.audit_logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async (referenceId: string, action: "COMPLETE" | "REVERSE") => {
    const confirmMsg = action === "COMPLETE" 
      ? "Are you sure you want to FORCE COMPLETE this transaction and release the ledger lock?"
      : "Are you sure you want to REVERSE this transaction and return the locked amount to the user's available balance?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch("/api/wallet/admin/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId, action })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onSpawnToast({
          message: `Override Success: Set to ${action === 'COMPLETE' ? 'COMPLETED' : 'FAILED'}`,
          subText: "Ledger status updated securely on the Cloud Database."
        });
        fetchData();
        if (onRefreshBalances) {
          onRefreshBalances();
        }
      } else {
        alert(data.error || "Failed to issue admin resolve command.");
      }
    } catch (err) {
      console.error(err);
      alert("Error issuing override request.");
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesRole = roleFilter === "all" || tx.user_role === roleFilter;
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchesQuery = searchQuery === "" || 
      tx.reference_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.lipila_identifier && tx.lipila_identifier.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.account_number.includes(searchQuery);
    return matchesRole && matchesStatus && matchesQuery;
  });

  return (
    <div className="bg-[#090b11] border border-zinc-900 rounded-3xl p-5 text-zinc-100 font-sans space-y-5 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#ffa500]/10 flex items-center justify-center border border-[#ffa500]/20 text-[#ffa550]">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5 leading-none">
              Administrative Settlements Console
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">
              Secure ledger access to direct Lipila Bank Disbursement Webhook configurations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-300 hover:text-white cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-950 p-1 bg-[#050609]/40 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveTab("TRANSACTIONS")}
          className={`flex-1 py-2 text-center text-xs font-black font-mono uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
            activeTab === "TRANSACTIONS"
              ? "bg-[#ffa500] text-black"
              : "text-zinc-450 hover:text-zinc-250"
          }`}
        >
          Disbursements ({filteredTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab("AUDIT_LOGS")}
          className={`flex-1 py-2 text-center text-xs font-black font-mono uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
            activeTab === "AUDIT_LOGS"
              ? "bg-[#ffa500] text-black"
              : "text-zinc-450 hover:text-zinc-250"
          }`}
        >
          Handshake Logs ({auditLogs.length})
        </button>
      </div>

      {activeTab === "TRANSACTIONS" ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-zinc-950 p-3 rounded-2xl border border-zinc-900">
            {/* Role Filter */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-zinc-550 font-mono">User Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-[#090b11] border border-zinc-900 text-xs rounded-lg py-1.5 px-2.5 focus:outline-none focus:border-[#ffa500] text-zinc-200"
              >
                <option value="all">All Roles</option>
                <option value="seller">Sellers (SLR)</option>
                <option value="agent">Agents (AGT)</option>
                <option value="rider">Riders (RDR)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-zinc-550 font-mono">Ledger Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#090b11] border border-zinc-900 text-xs rounded-lg py-1.5 px-2.5 focus:outline-none focus:border-[#ffa500] text-zinc-200"
              >
                <option value="all">All States</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Search query */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[9px] uppercase font-bold text-zinc-550 font-mono">Filter by Ref / Lipila Code / Number</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Type to filter ledger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#090b11] border border-zinc-900 text-xs text-white rounded-lg py-2.5 pl-8 pr-2.5 focus:outline-none focus:border-[#ffa500]"
                />
              </div>
            </div>
          </div>

          {/* List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center p-4">
              <AlertCircle className="w-8 h-8 text-zinc-650 mb-2" />
              <p className="text-xs font-mono text-zinc-450">No withdrawal records match your current filter preferences.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-zinc-900 rounded-2xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#050608] text-zinc-400 border-b border-zinc-900">
                  <tr>
                    <th className="p-3">Reference / Date</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Destination Details</th>
                    <th className="p-3 text-right">Debit Balance</th>
                    <th className="p-3 text-center">API Code</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 bg-zinc-950/20">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.reference_id} className="hover:bg-zinc-900/10">
                      <td className="p-3 space-y-0.5">
                        <span className="text-white block font-bold text-[11px] select-all">{tx.reference_id}</span>
                        <span className="text-zinc-500 text-[10px] block">{new Date(tx.created_at).toLocaleString()}</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          tx.user_role === "seller" 
                            ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                            : tx.user_role === "agent"
                            ? "bg-teal-400/10 text-teal-400 border border-teal-400/20"
                            : "bg-indigo-400/10 text-indigo-400 border border-indigo-400/20"
                        }`}>
                          {tx.user_role}
                        </span>
                      </td>
                      <td className="p-3 space-y-0.5">
                        <div className="text-zinc-300 font-bold">{tx.phone_number}</div>
                        <div className="text-[10px] text-zinc-500">
                          No: {tx.account_number} | Swift: <span className="text-[#ffa500] font-bold">{tx.swift_code}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-white font-bold block">K {tx.amount.toFixed(2)}</span>
                        <span className="text-[9.5px] text-zinc-500 block">ZMW</span>
                      </td>
                      <td className="p-3 text-center">
                        {tx.lipila_identifier ? (
                          <span className="bg-[#07080a] text-zinc-350 border border-zinc-800 px-2 py-1 rounded inline-block text-[10px] select-all font-mono font-bold">
                            {tx.lipila_identifier}
                          </span>
                        ) : (
                          <span className="text-zinc-650">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.status === "COMPLETED" && (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Dispersed</span>
                            </span>
                          )}
                          {tx.status === "FAILED" && (
                            <span className="text-red-400 font-bold flex items-center gap-1">
                              <XCircle className="w-4 h-4" />
                              <span>Reversed</span>
                            </span>
                          )}
                          {(tx.status === "PROCESSING" || tx.status === "PENDING") && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleResolve(tx.reference_id, "COMPLETE")}
                                className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg border border-emerald-500/20 cursor-pointer transition-all"
                              >
                                Force Success
                              </button>
                              <button
                                onClick={() => handleResolve(tx.reference_id, "REVERSE")}
                                className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg border border-red-500/20 cursor-pointer transition-all"
                              >
                                Reverse Lock
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-2xl space-y-1.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#ffa550]" />
              <span>TLS Security Encryption Channel logs</span>
            </h4>
            <p className="text-[10px] text-zinc-550 leading-relaxed font-mono">
              The following lists raw JSON requests sent from this server container to `https://api.lipila.dev/api/v1/disbursements/bank` and responses acquired back. Confirming full HMAC compliance.
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-10 bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center p-4">
              <FileText className="w-8 h-8 text-zinc-650 mb-2" />
              <p className="text-xs font-mono text-zinc-450">No API handshake actions recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {auditLogs.map((log: any, index: number) => (
                <div key={log.referenceId || index} className="bg-[#050608] border border-zinc-900/80 rounded-2xl p-4.5 space-y-3 font-mono text-[10px] leading-relaxed">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-2 gap-1.5">
                    <span className="font-extrabold text-[#ffa550] select-all">Ref: {log.referenceId}</span>
                    <span className="text-zinc-550">{new Date(log.requestTime).toLocaleTimeString()} · Status {log.responseStatus}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Request payload */}
                    <div className="space-y-1">
                      <span className="text-teal-400 font-bold uppercase tracking-widest text-[8px] block">&gt;&gt; API SENT PAYLOAD</span>
                      <pre className="bg-[#090b11] p-2.5 rounded-lg text-[9px] text-zinc-400 overflow-x-auto h-[130px] border border-zinc-900 select-all">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>

                    {/* Response payload */}
                    <div className="space-y-1">
                      <span className="text-purple-400 font-bold uppercase tracking-widest text-[8px] block">&lt;&lt; DISBURSER RESPONSE</span>
                      <pre className="bg-[#090b11] p-2.5 rounded-lg text-[9px] text-[#ffa550] overflow-x-auto h-[130px] border border-zinc-900 select-all">
                        {JSON.stringify(log.responsePayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
