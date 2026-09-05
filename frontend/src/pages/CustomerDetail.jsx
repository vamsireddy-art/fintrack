import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MapPin, Calendar, Activity, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import PaymentGrid from '../components/tracker/PaymentGrid';
import { format } from 'date-fns';
import { MoneyStreamModal3D } from '../components/3d/MoneyFlowAnimation';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingDay, setMarkingDay] = useState(null);
  const [showCircleModal, setShowCircleModal] = useState(false);
  const [show3DCollectionModal, setShow3DCollectionModal] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState(0);

  const fetchCustomer = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.get(`${apiUrl}/customers/${id}`);
      setCustomer(res.data);
    } catch (error) {
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    axios.get(`${apiUrl}/customers/${id}`)
      .then(res => { if (active) setCustomer(res.data); })
      .catch(error => console.error('Error fetching customer:', error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const handleMarkPayment = async (dayIndex, status) => {
    setMarkingDay(dayIndex);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      await axios.post(`${apiUrl}/customers/${id}/update-day`, {
        dayIndex,
        status,
        paymentMode: 'Cash'
      });

      if (status === 'paid') {
        setCollectedAmount(customer.dailyPaymentAmount);
        setShow3DCollectionModal(true);
      }

      await fetchCustomer();
    } catch (error) {
      console.error('Error updating payment:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to update payment';
      alert(`Error: ${msg}`);
    } finally {
      setMarkingDay(null);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ${customer.name}'s account?`)) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      await axios.delete(`${apiUrl}/customers/${id}`);
      navigate('/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(`Error deleting customer`);
    }
  };

  const handleEarlySettlement = async () => {
    if (!window.confirm(`Mark this account as Settled/Completed?`)) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      await axios.post(`${apiUrl}/customers/${id}/settle`);
      await fetchCustomer();
    } catch (error) {
      console.error('Error settling customer:', error);
      alert(`Error closing account`);
    }
  };

  const handleCircleAccount = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      await axios.post(`${apiUrl}/customers/${id}/circle`);
      setShowCircleModal(false);
      await fetchCustomer();
    } catch (error) {
      console.error('Error circling account:', error);
      alert(`Error circling account`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading Account 3D Grid...</p>
      </div>
    );
  }

  if (!customer) return <div className="text-white">Customer not found</div>;

  const progressPercentage = Math.min((customer.amountPaidTillNow / customer.totalAmountToReceive) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* 3D Money Stream Collection Modal */}
      <MoneyStreamModal3D 
        isOpen={show3DCollectionModal}
        onClose={() => setShow3DCollectionModal(false)}
        amount={collectedAmount}
        recipientName={customer.name}
        type="collect"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 aurora-card p-6 rounded-3xl mb-8">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/customers')}
            className="p-3 hover:bg-white/5 rounded-2xl transition-all duration-300 text-slate-300 border border-white/5 hover:border-white/20 shadow-lg backdrop-blur-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" /> 3D Collection Account
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                {customer.name}'s
              </span> Account
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          {customer.status !== 'completed' && (
            <>
              <button
                onClick={() => setShowCircleModal(true)}
                className="btn-premium px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Circle Account
              </button>
              <button
                onClick={handleEarlySettlement}
                className="btn-ghost px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                <Activity className="w-4 h-4" /> Close Early
              </button>
            </>
          )}
          <button
            onClick={handleDeleteCustomer}
            className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-2xl transition-all duration-300 text-xs font-bold border border-rose-500/20 hover:border-rose-500/40 hover:shadow-[0_0_15px_rgba(225,29,72,0.2)] flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Profile & Financial Summary */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="aurora-card p-6 rounded-3xl">
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-cyan-400 rounded-2xl blur-md opacity-50"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 border border-white/20 text-white flex items-center justify-center font-black text-3xl shadow-xl">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{customer.name}</h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-[10px] font-bold border backdrop-blur-sm ${
                  customer.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${customer.status === 'completed' ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`}></div>
                  {customer.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-300 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm">{customer.address || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm">Started: {format(new Date(customer.startDate), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="aurora-card card-glow-emerald p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 relative z-10">
              <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              Financial Summary
            </h3>
            
            <div className="space-y-5 text-sm relative z-10">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-slate-400 font-medium">Principal Given</span>
                <span className="font-black text-white text-base">{formatCurrency(customer.amountGiven)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-slate-400 font-medium">Account Target</span>
                <span className="font-black text-blue-400 text-base">{formatCurrency(customer.totalAmountToReceive)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-slate-400 font-medium">Daily Installment</span>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <span className="font-black text-emerald-400 text-base">{formatCurrency(customer.dailyPaymentAmount)}</span>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-400 font-medium">Collected Till Now</span>
                  <span className="font-black text-emerald-300 text-xl">{formatCurrency(customer.amountPaidTillNow)}</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_1s_linear_infinite]"></div>
                  </motion.div>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-slate-500">0</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{Math.round(progressPercentage)}%</span>
                  <span className="text-[10px] text-slate-500">{formatCurrency(customer.totalAmountToReceive)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 100 Day 3D Grid */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="aurora-card p-6 sm:p-8 rounded-3xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  100-Day Collection Grid
                </h2>
                <p className="text-sm text-slate-400 mt-1">Tap any day box to trigger 3D money collection status</p>
              </div>
              <div className="flex items-center gap-3 bg-black/30 p-3.5 rounded-2xl border border-white/5 backdrop-blur-md shadow-inner">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Paid Progress</p>
                  <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    {Math.round(progressPercentage)}%
                  </p>
                </div>
              </div>
            </div>

            <PaymentGrid 
              tracker={customer.paymentTracker} 
              onMarkPayment={handleMarkPayment}
              disabled={markingDay !== null}
              startDate={customer.startDate}
            />
          </motion.div>
        </div>
      </div>

      {/* Circle Account Modal */}
      {showCircleModal && (() => {
        const remainingAmount = customer.totalAmountToReceive - customer.amountPaidTillNow;
        const isCirclingPossible = remainingAmount <= customer.amountGiven;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-6"
            >
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-400" /> Circle Account Cycle
              </h3>
              <p className="text-xs text-slate-300">
                Restart the 100-day collection cycle for <strong>{customer.name}</strong>.
              </p>

              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Amount Paid</span>
                  <span className="font-bold text-white">{formatCurrency(customer.amountPaidTillNow)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Remaining Balance</span>
                  <span className="font-bold text-rose-400">{formatCurrency(remainingAmount)}</span>
                </div>
              </div>

              {isCirclingPossible ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                  <span className="font-bold text-emerald-400 uppercase tracking-widest block">New Cycle Calculation</span>
                  <div className="flex justify-between text-slate-200">
                    <span>New Money Given</span>
                    <span className="font-black text-emerald-300 text-sm">
                      {formatCurrency(customer.amountGiven - remainingAmount)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                  Remaining balance ({formatCurrency(remainingAmount)}) exceeds principal given ({formatCurrency(customer.amountGiven)}). Collect more payments before circling.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCircleModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-xl"
                >
                  Close
                </button>
                {isCirclingPossible && (
                  <button
                    onClick={handleCircleAccount}
                    className="btn-primary-3d px-6 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Confirm Circle
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        );
      })()}
    </div>
  );
};

export default CustomerDetail;
