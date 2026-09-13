"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { PaymentOrder, PaymentOrderStatus } from "@/lib/operations/types";

export default function OpsFinancePage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<PaymentOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null);

  async function handleViewReceipt(orderId: string) {
    setLoadingReceiptId(orderId);
    try {
      const res = await fetch(`/api/ops/payments/receipt/view?orderId=${orderId}`);
      const data = await res.json();
      if (data?.success && data?.url) {
        setPreviewReceiptUrl(data.url);
      } else {
        alert(data?.error || "Failed to load receipt");
      }
    } catch {
      alert("Error loading receipt view");
    } finally {
      setLoadingReceiptId(null);
    }
  }

  async function fetchOrders() {
    setLoading(true);
    try {
      const url = statusFilter === "all" ? "/api/ops/payments" : `/api/ops/payments?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.orders) setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function handleApprove(orderId: string) {
    if (!confirm("Are you sure you want to approve this order and activate PAID access for this student?")) {
      return;
    }

    setProcessingId(orderId);
    setActionMessage(null);
    try {
      const res = await fetch("/api/ops/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason: "Payment verified by operator in Operations Center" }),
      });

      const data = await res.json();
      if (data?.success) {
        setActionMessage(`✓ Order ${orderId} approved successfully. Student access updated to PAID.`);
        fetchOrders();
      } else {
        alert(data?.error || "Failed to approve order.");
      }
    } catch {
      alert("Network error approving order.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectingOrder || !rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    setProcessingId(rejectingOrder.id);
    setActionMessage(null);
    try {
      const res = await fetch("/api/ops/payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: rejectingOrder.id, reason: rejectionReason.trim() }),
      });

      const data = await res.json();
      if (data?.success) {
        setActionMessage(`✓ Order ${rejectingOrder.id} rejected. Reason recorded in audit log.`);
        setRejectingOrder(null);
        setRejectionReason("");
        fetchOrders();
      } else {
        alert(data?.error || "Failed to reject order.");
      }
    } catch {
      alert("Network error rejecting order.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Finance & Manual Subscriptions</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono">
              Manual Pilot Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative order verification queue for BaridiMob, CCP, and manual bank payments across Algeria.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Success Notification */}
      {actionMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {["all", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === tab
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            {tab === "all" ? "All Orders" : tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order / User</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Receipt / Notes</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4 text-right">Operator Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {orders.map((o) => {
                const isPending = o.status === "PENDING" || o.status === "DRAFT";
                return (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {o.studentName || o.studentEmail || "Student"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {o.userId.slice(0, 8)} · {o.studentPhone || "No phone"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-semibold uppercase">
                        {o.plan}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase font-mono">
                        {o.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {o.amount} {o.currency}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono ${
                          o.status === "APPROVED"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : o.status === "REJECTED"
                            ? "bg-red-950 text-red-400 border border-red-800"
                            : o.status === "CANCELLED"
                            ? "bg-slate-800 text-slate-400 border border-slate-700"
                            : "bg-amber-950 text-amber-400 border border-amber-800 font-semibold"
                        }`}
                      >
                        {o.status === "APPROVED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : o.status === "REJECTED" ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{o.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 max-w-xs">
                      <div className="truncate">{o.notes || o.rejectionReason || "—"}</div>
                      {o.receiptPath && (
                        <button
                          onClick={() => handleViewReceipt(o.id)}
                          disabled={loadingReceiptId === o.id}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-medium underline"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{loadingReceiptId === o.id ? "Loading..." : "View Receipt"}</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(o.submittedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                      {o.reviewedBy ? (
                        <div>
                          <div className="text-slate-300">{o.reviewedBy.slice(0, 8)}...</div>
                          <div className="text-slate-500">
                            {o.reviewedAt ? new Date(o.reviewedAt).toLocaleDateString() : ""}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isPending ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprove(o.id)}
                            disabled={processingId === o.id}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-semibold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingOrder(o)}
                            disabled={processingId === o.id}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-red-950 hover:text-red-400 border border-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          {o.reviewedBy ? `by ${o.reviewedBy.slice(0, 8)}` : "Resolved"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Zero orders in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Order Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <XCircle className="w-5 h-5" />
              <span>Reject Payment Order</span>
            </div>

            <p className="text-xs text-slate-300">
              Rejecting Order <span className="font-mono text-white font-semibold">{rejectingOrder.id}</span> ({rejectingOrder.amount} DZD).
              A clear reason is mandatory for the audit log.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Receipt image unreadable, transaction ID not found in Algérie Poste account..."
              className="w-full h-24 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectingOrder(null);
                  setRejectionReason("");
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>Verified Payment Receipt</span>
              </div>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-slate-950 rounded-lg p-2 flex items-center justify-center max-h-[70vh] overflow-auto">
              {previewReceiptUrl.startsWith("data:application/pdf") ? (
                <div className="text-center py-10 space-y-3">
                  <FileText className="w-12 h-12 text-red-400 mx-auto" />
                  <span className="text-xs text-slate-300 block">PDF Document Attached</span>
                  <a
                    href={previewReceiptUrl}
                    download="payment_receipt.pdf"
                    className="inline-block px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                  >
                    Download PDF Receipt
                  </a>
                </div>
              ) : (
                <img
                  src={previewReceiptUrl}
                  alt="Payment Receipt"
                  className="max-h-[65vh] object-contain rounded"
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
