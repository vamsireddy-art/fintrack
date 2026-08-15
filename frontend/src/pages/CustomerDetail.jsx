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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/customers')}
            className="p-2.5 hover:bg-slate-800 rounded-full transition-colors text-slate-300 border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> 3D Collection Account
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{customer.name}'s Account</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {customer.status !== 'completed' && (
            <>
              <button
                onClick={() => setShowCircleModal(true)}
                className="btn-primary-3d px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Circle Account
              </button>
              <button
                onClick={handleEarlySettlement}
                className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-2xl transition-colors text-xs font-bold border border-blue-500/20"
              >
                <Activity className="w-4 h-4 inline mr-1" /> Close Early
              </button>
            </>
          )}
          <button
            onClick={handleDeleteCustomer}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-2xl transition-colors text-xs font-bold border border-rose-500/20"
          >
            <Trash2 className="w-4 h-4 inline mr-1" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Profile & Financial Summary */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="tilt-card-3d p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-500/20">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black text-white">{customer.name}</h2>
                <span className={`inline-block px-3 py-1 mt-1 rounded-full text-[10px] font-bold border ${
                  customer.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                }`}>
                  {customer.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{customer.address || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Started: {format(new Date(customer.startDate), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="tilt-card-3d card-glow-emerald p-6 rounded-3xl border border-emerald-500/30 relative overflow-hidden">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Financial Summary
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-slate-400 font-medium">Principal Given</span>
                <span className="font-black text-white">{formatCurrency(customer.amountGiven)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-slate-400 font-medium">Account Target</span>
                <span className="font-black text-blue-400">{formatCurrency(customer.totalAmountToReceive)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-slate-400 font-medium">Daily Installment</span>
                <span className="font-black text-emerald-400">{formatCurrency(customer.dailyPaymentAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Collected Till Now</span>
                <span className="font-black text-emerald-300 text-base">{formatCurrency(customer.amountPaidTillNow)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 100 Day 3D Grid */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="tilt-card-3d p-6 sm:p-8 rounded-3xl border border-white/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">100-Day Collection Grid</h2>
                <p className="text-xs text-slate-400 mt-1">Tap any day box to trigger 3D money collection status</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-white/10">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Paid Progress</p>
                  <p className="text-xl font-black text-emerald-400">{Math.round(progressPercentage)}%</p>
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
