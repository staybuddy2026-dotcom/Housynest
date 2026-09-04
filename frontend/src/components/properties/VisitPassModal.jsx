import { useState } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';

const VisitPassModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);

  if (!isOpen) return null;

  const handlePurchase = async (passType) => {
    try {
      setLoading(true);
      setSelectedPass(passType);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Please login to purchase a pass");
        setLoading(false);
        return;
      }

      // 1. Create Order
      const orderRes = await fetch('/api/payments/visit-pass/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ passType })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create order');

      // 1.5 Load Razorpay script
      const res = await new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // 2. Load Razorpay options
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "HousyNest",
        description: passType === 'unlimited' ? "Unlimited Visit Pass" : "5 Visits Pass",
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch('/api/payments/visit-pass/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                passType
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success("Visit Pass purchased successfully!");
              
              // Update local user state
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
              storedUser.visitPass = verifyData.user.visitPass;
              localStorage.setItem('user', JSON.stringify(storedUser));
              window.dispatchEvent(new Event('auth-change'));

              onSuccess();
            } else {
              toast.error(verifyData.message || "Payment verification failed");
            }
          } catch (err) {
            toast.error("An error occurred during verification");
          }
        },
        theme: {
          color: "#062F26"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setSelectedPass(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description || "Payment failed");
        setLoading(false);
        setSelectedPass(null);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
      setLoading(false);
      setSelectedPass(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="bg-white z-20 border-b border-slate-100 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
            >
              <Icon icon="lucide:x" className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-[#062F26]">Choose a Visit Pass</h2>
              <p className="text-sm text-slate-500 font-medium">Select a plan to start visiting properties</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar">
          {/* Banner */}
          <div className="bg-[#062F26] rounded-xl p-3 mb-4 text-white relative overflow-hidden flex items-center gap-3 shadow-sm shadow-[#062F26]/10">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#25D366]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-sm relative z-10">
              <Icon icon="lucide:cloud-lightning" className="w-4 h-4 text-[#25D366]" />
            </div>
            <div className="relative z-10 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-0.5">
                <h3 className="font-bold text-base text-white leading-tight">Monsoon Special</h3>
                <span className="w-fit px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-bold tracking-wide uppercase border border-white/20 backdrop-blur-md leading-none">Limited Time</span>
              </div>
              <p className="text-[13px] text-white/80 font-medium leading-tight">
                Your pass now works for <span className="text-white font-bold">virtual visits too</span> — tour any home by video call, no extra charge.
              </p>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* 5 Visits Pass */}
            <div className="bg-white rounded-xl border-2 border-slate-100 p-4 hover:border-[#25D366]/30 hover:shadow-md transition-all duration-300 flex flex-col relative group">
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#25D366]/10 transition-colors">
                <Icon icon="lucide:zap" className="w-4 h-4 text-slate-400 group-hover:text-[#25D366]" />
              </div>
              
              <h3 className="text-lg font-bold text-[#062F26] mb-0.5">5 Visits Pass</h3>
              <p className="text-[13px] text-slate-500 font-medium mb-3">Good for starters</p>
              
              <div className="flex items-end gap-1.5 mb-4">
                <span className="text-3xl font-extrabold text-[#062F26] leading-none">₹50</span>
                <span className="text-xs text-slate-500 font-medium pb-0.5">valid for 30 days</span>
              </div>
              
              <div className="space-y-2.5 mb-5">
                <div className="flex items-start gap-2.5">
                  <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-600 font-medium leading-tight">Visit up to <span className="font-bold text-slate-800">5 properties</span></p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-600 font-medium leading-tight">Free additional visit if property unavailable</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon icon="lucide:cloud-lightning" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-600 font-medium leading-tight">All 5 visits work for physical <span className="font-bold">or</span> virtual — Monsoon Special</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Our Promise</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Icon icon="lucide:gift" className="w-4 h-4 text-rose-500" />
                    <p className="text-[13px] text-slate-600 font-medium">Get <span className="font-bold text-rose-500">₹50 off</span> on rent when you book</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-[#25D366]" />
                    <p className="text-[13px] text-slate-600 font-medium">Verified properties</p>
                  </div>
                </div>

                <button 
                  onClick={() => handlePurchase('5_visits')}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:border-[#062F26] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {loading && selectedPass === '5_visits' ? (
                    <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                  ) : (
                    'Select 5 Visits Pass'
                  )}
                </button>
              </div>
            </div>

            {/* Unlimited Pass */}
            <div className="bg-[#F4F9F8] rounded-xl border-2 border-[#062F26] p-4 shadow-md shadow-[#062F26]/5 flex flex-col relative group">
              <div className="absolute -top-3.5 right-4">
                <span className="px-2.5 py-1 rounded-full bg-[#062F26] text-white text-[10px] font-bold tracking-wide uppercase shadow-sm">
                  Best Value
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-[#062F26] mb-0.5">Unlimited Pass</h3>
              <p className="text-[13px] text-slate-500 font-medium mb-3">For serious seekers</p>
              
              <div className="flex items-end gap-1.5 mb-4">
                <span className="text-3xl font-extrabold text-[#062F26] leading-none">₹100</span>
                <span className="text-xs text-slate-500 font-medium pb-0.5">valid for 30 days</span>
              </div>
              
              <div className="space-y-2.5 mb-5">
                <div className="flex items-start gap-2.5">
                  <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-700 font-medium leading-tight">Visit <span className="font-bold text-[#062F26]">unlimited properties</span></p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-700 font-medium leading-tight">Free additional visit if property unavailable</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon icon="lucide:cloud-lightning" className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-700 font-medium leading-tight">Unlimited physical <span className="font-bold">or</span> virtual visits — Monsoon Special</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[#062F26]/10">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-[#062F26]" />
                  <span className="text-[11px] font-bold text-[#062F26] tracking-wider uppercase">Our Promise</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Icon icon="lucide:gift" className="w-4 h-4 text-rose-500" />
                    <p className="text-[13px] text-slate-700 font-medium">Get <span className="font-bold text-rose-500">₹100 off</span> on rent when you book</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-[#25D366]" />
                    <p className="text-[13px] text-slate-700 font-medium">Verified properties</p>
                  </div>
                </div>

                <button 
                  onClick={() => handlePurchase('unlimited')}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#062F26] text-white font-bold hover:bg-[#062F26]/90 shadow-sm shadow-[#062F26]/20 transition-all flex items-center justify-center gap-2 group-hover:-translate-y-0.5 text-sm"
                >
                  {loading && selectedPass === 'unlimited' ? (
                    <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Get Unlimited Pass
                      <Icon icon="lucide:zap" className="w-4 h-4 text-[#25D366]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitPassModal;
