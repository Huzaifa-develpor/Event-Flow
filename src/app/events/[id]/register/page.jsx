'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas-pro';
import { Check, ShieldCheck, Ticket, Download, Share2, Loader2 } from 'lucide-react';

export default function RegistrationCheckout() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id;

  const initialPaymentId = searchParams.get('order_id');
  const initialResult = searchParams.get('result');

  const [currentStep, setCurrentStep] = useState(initialPaymentId ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(!!initialPaymentId && initialResult !== 'cancelled');
  const [error, setError] = useState(
    initialResult === 'cancelled' ? 'Payment was cancelled. Please try again.' : ''
  );

  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState('general');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        if (data.status !== 'success') throw new Error(data.error || 'Failed to load event');
        setEvent(data.event);
      } catch (err) {
        setError(err.message);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  // SafePay se wapas aane par resume karo
  useEffect(() => {
    if (!initialPaymentId || initialResult === 'cancelled') return;

    const token = localStorage.getItem('token');
    let interval;
    let timeoutId;

    const fetchPaymentAndPoll = async () => {
      try {
        const payRes = await fetch(`/api/payments/${initialPaymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payData = await payRes.json();
        if (payData.status !== 'success') throw new Error('Could not verify payment');

        const registrationId = payData.payment.registrationId;

        interval = setInterval(async () => {
          try {
            const res = await fetch(`/api/registrations/${registrationId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (data.status === 'success' && data.registration.registrationStatus === 'confirmed') {
              clearInterval(interval);
              clearTimeout(timeoutId);
              setPolling(false);
              setRegistration(data.registration);
              setCurrentStep(3);
            }
          } catch (pollErr) {
            console.error('Poll error:', pollErr);
          }
        }, 2000);

        timeoutId = setTimeout(() => {
          clearInterval(interval);
          setPolling(false);
          setError('Payment processing mein expected se zyada time lag raha hai. Thodi der baad page refresh karke dobara check karo.');
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getTicket = (type) => event?.tickets?.find((t) => t.type === type);

  const handleCreateRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          ticketType: selectedTicket,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await res.json();
      if (data.status !== 'success') throw new Error(data.error || 'Registration failed');

      setRegistration(data.registration);
      setCurrentStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const returnUrl = `${window.location.origin}${window.location.pathname}`;

      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentType: 'attendee',
          registrationId: registration._id,
          returnUrl, // apne khud ke params mat jodo, SafePay khud ?order_id jodega
        }),
      });

      const data = await res.json();
      if (data.status !== 'success') throw new Error(data.error || 'Could not start payment');

      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0B0C10',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `ticket-${registration.ticketCode}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download ticket: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `My ticket for ${event?.title} — Ticket ID: ${registration.ticketCode}`;
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: event?.title || 'My Event Ticket', text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShareMsg('Link copied to clipboard!');
        setTimeout(() => setShareMsg(''), 2500);
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError('Failed to share ticket');
    }
  };

  const generalTicket = getTicket('general');
  const vipTicket = getTicket('vip');
  const selectedPrice = getTicket(selectedTicket)?.price ?? 0;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white pt-24 pb-16 px-4 flex flex-col justify-between">
      <div className="max-w-3xl w-full mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            {currentStep === 3 ? 'Registration Confirmed!' : 'Complete Registration'}
          </h1>
          <p className="text-gray-400 text-sm font-medium">{event?.title || 'Loading event...'}</p>
        </div>

        {error && (
          <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-center">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-center max-w-md mx-auto relative px-4">
          <div className="flex flex-col items-center gap-2 z-10">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              currentStep >= 1 ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50' : 'bg-[#181A22] text-gray-500 border border-white/10'
            }`}>
              {currentStep > 1 ? <Check size={16} /> : '1'}
            </div>
            <span className={`text-[11px] font-medium ${currentStep >= 1 ? 'text-purple-300' : 'text-gray-500'}`}>Your Info</span>
          </div>

          <div className={`flex-1 h-[2px] mx-2 transition-all ${currentStep >= 2 ? 'bg-purple-600' : 'bg-white/10'}`} />

          <div className="flex flex-col items-center gap-2 z-10">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              currentStep >= 2 ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50' : 'bg-[#181A22] text-gray-500 border border-white/10'
            }`}>
              {currentStep > 2 ? <Check size={16} /> : '2'}
            </div>
            <span className={`text-[11px] font-medium ${currentStep >= 2 ? 'text-purple-300' : 'text-gray-500'}`}>Payment</span>
          </div>

          <div className={`flex-1 h-[2px] mx-2 transition-all ${currentStep >= 3 ? 'bg-purple-600' : 'bg-white/10'}`} />

          <div className="flex flex-col items-center gap-2 z-10">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              currentStep === 3 ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50' : 'bg-[#181A22] text-gray-500 border border-white/10'
            }`}>
              3
            </div>
            <span className={`text-[11px] font-medium ${currentStep === 3 ? 'text-purple-300' : 'text-gray-500'}`}>Confirm</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#12141A]/90 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8"
            >
              <form onSubmit={handleCreateRegistration} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Select Ticket Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setSelectedTicket('general')}
                      className={`p-5 rounded-xl border cursor-pointer transition-all ${
                        selectedTicket === 'general'
                          ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                          : 'border-white/10 bg-[#161822] hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-white text-base">General Admission</h4>
                        <span className="text-cyan-400 font-extrabold text-lg">Rs. {generalTicket?.price ?? '--'}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {generalTicket ? `${generalTicket.quantity} left` : 'Access to all main stages and general areas.'}
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedTicket('vip')}
                      className={`p-5 rounded-xl border cursor-pointer transition-all ${
                        selectedTicket === 'vip'
                          ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                          : 'border-white/10 bg-[#161822] hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-white text-base">VIP Experience</h4>
                        <span className="text-cyan-400 font-extrabold text-lg">Rs. {vipTicket?.price ?? '--'}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {vipTicket ? `${vipTicket.quantity} left` : 'Exclusive lounge access, fast-track entry.'}
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-white/5" />

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Your Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400">First Name</label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                        className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                        className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                      className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Phone Number</label>
                    <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                      className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60" />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={loading}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50">
                    {loading ? 'Processing...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#12141A]/90 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
            >
              {polling ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <Loader2 className="animate-spin text-purple-400" size={32} />
                  <p className="text-sm text-gray-300">Confirming your payment...</p>
                  <p className="text-xs text-gray-500">Ye kuch second le sakta hai, page band mat karo.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white">Order Summary</h3>

                  <div className="bg-[#181A22] border border-white/5 p-4 rounded-xl flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-white uppercase">{selectedTicket} Admission</p>
                      <p className="text-xs text-gray-400">1x Ticket Pass</p>
                    </div>
                    <p className="text-xl font-black text-cyan-400">Rs. {selectedPrice}</p>
                  </div>

                  <p className="text-xs text-gray-500">
                    Aapko SafePay ke secure checkout page pe le jaya jayega. Card details wahi enter karni hain, humare paas kabhi nahi aati.
                  </p>

                  <div className="flex justify-between items-center pt-4">
                    <button onClick={() => setCurrentStep(1)} disabled={loading}
                      className="text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-50">
                      Back
                    </button>
                    <button onClick={handleProceedToPayment} disabled={loading}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 disabled:opacity-50">
                      <ShieldCheck size={16} />
                      <span>{loading ? 'Redirecting...' : `Proceed to Secure Payment`}</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {currentStep === 3 && registration && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center space-y-6"
            >
              <div ref={ticketRef} className="w-full max-w-md bg-[#5A606A]/90 border border-white/20 rounded-3xl overflow-hidden shadow-2xl relative backdrop-blur-md">
                <div className="p-6 space-y-6 text-white relative">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center">
                        <Ticket size={16} className="text-cyan-300" />
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-gray-300 uppercase">
                        {registration.ticketType === 'vip' ? 'VIP ACCESS' : 'GENERAL ACCESS'}
                      </span>
                    </div>
                    <span className="bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      CONFIRMED
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">{event?.title}</h2>
                    <div className="mt-4">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Attendee</span>
                      <p className="text-xl font-bold text-white leading-snug">
                        {registration.firstName} {registration.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Date & Time</span>
                      <p className="font-semibold text-gray-200 mt-0.5">
                        {event?.date ? new Date(event.date).toLocaleDateString() : '--'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Location</span>
                      <p className="font-semibold text-gray-200 mt-0.5">{event?.location || '--'}</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="w-5 h-5 bg-[#0B0C10] rounded-full -ml-2.5 z-20" />
                  <div className="border-b-2 border-dashed border-white/20 flex-1 my-2" />
                  <div className="w-5 h-5 bg-[#0B0C10] rounded-full -mr-2.5 z-20" />
                </div>

                <div className="p-6 bg-[#32363E]/90 flex flex-col items-center justify-center space-y-4">
                  <div className="bg-[#0D0F14] p-4 rounded-2xl border border-white/10 flex flex-col items-center shadow-inner">
                    <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-2">DIGITAL TICKET</span>
                    <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center">
                      <img src={registration.qrCode} alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs font-mono font-bold tracking-widest text-gray-300">
                      TICKET ID: {registration.ticketCode}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">Show this QR code at the entrance.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button onClick={handleDownload} disabled={downloading}
                  className="flex items-center gap-2 bg-[#1A1D26] hover:bg-[#222632] border border-white/10 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
                  <Download size={14} />
                  <span>{downloading ? 'Downloading...' : 'Download Pass'}</span>
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-2 bg-[#1A1D26] hover:bg-[#222632] border border-white/10 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all">
                  <Share2 size={14} />
                  <span>Share Pass</span>
                </button>
              </div>

              {shareMsg && <p className="text-xs text-purple-300 text-center">{shareMsg}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}