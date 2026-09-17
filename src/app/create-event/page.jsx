"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ShieldCheck, Loader2, Image as ImageIcon } from "lucide-react";

const FIXED_LISTING_FEE = 5000;
const COMMISSION_RATE = 0.10;

function getTodayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPaymentId = searchParams.get("order_id");
  const initialResult = searchParams.get("result");

  const [step, setStep] = useState(initialPaymentId ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(!!initialPaymentId && initialResult !== "cancelled");
  const [error, setError] = useState(
    initialResult === "cancelled" ? "Payment was cancelled. Please try again." : ""
  );
  const [eventId, setEventId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    thumbnail: "",
    generalPrice: 0,
    generalQuantity: 0,
    vipPrice: 0,
    vipQuantity: 0
  });

  // Freeze calculations state after Step 1 Submission
  const [feeDetails, setFeeDetails] = useState({
    capacity: 0,
    estimatedRevenue: 0,
    commission: 0,
    totalFee: 0,
  });

  const today = getTodayDateString();

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Checks if the token is missing/invalid on the client, before even calling the API.
  // If no token, redirect straight to login instead of hitting the API at all.
  const requireAuthOrRedirect = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return null;
    }
    return token;
  };

  // Checks an API response/data for an auth failure ("Invalid or expired token", 401, etc.)
  // If found, clears the stale token and redirects to login. Returns true if it redirected.
  const handleAuthError = (res, data) => {
    const isAuthError =
      res?.status === 401 ||
      data?.message === "Invalid or expired token" ||
      data?.error === "Invalid or expired token";

    if (isAuthError) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("auth-change"));
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return true;
    }
    return false;
  };

  // Resume after returning from SafePay
  useEffect(() => {
    if (!initialPaymentId || initialResult === "cancelled") return;

    const token = requireAuthOrRedirect();
    if (!token) return;

    let interval;
    let timeoutId;

    const fetchPaymentAndPoll = async () => {
      try {
        const payRes = await fetch(`/api/payments/${initialPaymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payData = await payRes.json();

        if (handleAuthError(payRes, payData)) return;

        if (payData.status !== "success") {
          throw new Error("Could not verify payment");
        }

        const relatedEventId = payData.payment.eventId;
        setEventId(relatedEventId);

        interval = setInterval(async () => {
          try {
            const res = await fetch(`/api/events/${relatedEventId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (handleAuthError(res, data)) {
              clearInterval(interval);
              clearTimeout(timeoutId);
              return;
            }

            if (data.status === "success" && data.event.status === "published") {
              clearInterval(interval);
              clearTimeout(timeoutId);
              setPolling(false);
              setStep(3);
            }
          } catch (pollErr) {
            console.error("Poll error:", pollErr);
          }
        }, 2000);

        timeoutId = setTimeout(() => {
          clearInterval(interval);
          setPolling(false);
          setError(
            "Payment is taking longer than expected. Please refresh this page in a moment to check again."
          );
        }, 30000);
      } catch (err) {
        setPolling(false);
        setError(err.message);
      }
    };

    fetchPaymentAndPoll();

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [initialPaymentId, initialResult]);

  // Form submit handler - calculates fee ONLY when organizer submits details
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError("");

    const token = requireAuthOrRedirect();
    if (!token) return;

    setLoading(true);

    const currentCapacity = Number(formData.generalQuantity) + Number(formData.vipQuantity);
    const currentEstRevenue =
      Number(formData.generalPrice) * Number(formData.generalQuantity) +
      Number(formData.vipPrice) * Number(formData.vipQuantity);
    const currentCommission = currentEstRevenue * COMMISSION_RATE;
    const currentTotalFee = FIXED_LISTING_FEE + currentCommission;

    setFeeDetails({
      capacity: currentCapacity,
      estimatedRevenue: currentEstRevenue,
      commission: currentCommission,
      totalFee: currentTotalFee,
    });

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          location: formData.location,
          thumbnail: formData.thumbnail || undefined,
          capacity: currentCapacity, // yahi fix hai — currentCapacity use karo, bare capacity nahi
          tickets: [
            { type: "general", price: formData.generalPrice, quantity: formData.generalQuantity },
            { type: "vip", price: formData.vipPrice, quantity: formData.vipQuantity },
          ],
        }),
      });

      const data = await res.json();

      if (handleAuthError(res, data)) return;

      if (data.status !== "success") throw new Error(data.error || "Failed to create event");

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        window.dispatchEvent(new Event("auth-change"));
      }

      setEventId(data.event._id);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayAndPublish = async () => {
    setError("");

    const token = requireAuthOrRedirect();
    if (!token) return;

    setLoading(true);

    try {
      const returnUrl = `${window.location.origin}${window.location.pathname}`;

      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentType: "organizer",
          eventId,
          amount: feeDetails.totalFee, // Dynamic fee sent to backend
          returnUrl,
        }),
      });

      const data = await res.json();

      if (handleAuthError(res, data)) return;

      if (data.status !== "success") throw new Error(data.error || "Payment failed");

      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-purple-400 tracking-widest uppercase bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            Organizer Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">Host Your Event</h1>
          <p className="text-gray-400 text-sm">List your event and process ticket sales securely.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-center">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {step === 1 && (
          <form
            onSubmit={handleCreateEvent}
            className="bg-[#12141A] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-xl"
          >
            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">
              1. Event Details & Capacity
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Event Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="e.g. Tech Vision Summit 2026"
                className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="What is this event about?"
                rows={3}
                className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">
                Thumbnail Image URL <span className="text-gray-600">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => handleFieldChange("thumbnail", e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60"
                />
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              </div>
              {formData.thumbnail && (
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  className="mt-2 w-full h-32 object-cover rounded-xl border border-white/10"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Event Date</label>
                <input
                  required
                  type="date"
                  min={today}
                  value={formData.date}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60 [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Location</label>
                <input
                  required
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                  placeholder="e.g. Karachi Expo Center"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">General Ticket Price (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.generalPrice || ""}
                  onChange={(e) => handleFieldChange("generalPrice", Number(e.target.value))}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">General Tickets Available</label>
                <input
                  type="number"
                  min={0}
                  value={formData.generalQuantity || ""}
                  onChange={(e) => handleFieldChange("generalQuantity", Number(e.target.value))}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">VIP Ticket Price (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.vipPrice || ""}
                  onChange={(e) => handleFieldChange("vipPrice", Number(e.target.value))}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">VIP Tickets Available</label>
                <input
                  type="number"
                  min={0}
                  value={formData.vipQuantity || ""}
                  onChange={(e) => handleFieldChange("vipQuantity", Number(e.target.value))}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              {loading ? "Creating Event..." : "Continue to Listing Fee & Review"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="bg-[#12141A] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            {polling ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="animate-spin text-purple-400" size={32} />
                <p className="text-sm text-gray-300">Confirming your payment...</p>
                <p className="text-xs text-gray-500">This may take a few seconds. Please don't close this page.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">
                  2. Platform Fee & Listing Payment
                </h3>

                <div className="bg-[#181A22] border border-white/5 p-5 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Estimated Ticket Revenue ({feeDetails.capacity} seats):</span>
                    <span className="font-bold text-white">Rs. {feeDetails.estimatedRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Platform Commission (10% of estimated revenue):</span>
                    <span className="font-bold text-purple-400">Rs. {feeDetails.commission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Fixed Listing Fee:</span>
                    <span className="font-bold text-purple-400">Rs. {FIXED_LISTING_FEE.toLocaleString()}</span>
                  </div>
                  <hr className="border-white/5" />
                  <div className="flex justify-between text-sm font-bold text-white pt-1">
                    <span>Total Upfront Fee:</span>
                    <span className="text-cyan-400">Rs. {feeDetails.totalFee.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  You'll be redirected to SafePay's secure checkout page. Your card details are entered there and never stored on our end.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="w-1/3 border border-white/10 text-gray-300 font-bold py-3.5 rounded-xl hover:bg-white/5 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayAndPublish}
                    disabled={loading}
                    className="w-2/3 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShieldCheck size={18} />
                    <span>{loading ? "Redirecting..." : `Pay Rs. ${feeDetails.totalFee.toLocaleString()} & Publish`}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="bg-[#12141A] border border-purple-500/30 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-purple-600/20 border border-purple-500 text-purple-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold">Event Published Successfully!</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Your upfront listing fee is confirmed and your event is now live.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}