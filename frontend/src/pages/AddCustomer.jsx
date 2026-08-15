import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calculator, Wallet, Sparkles, Send, User, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { MoneyStreamModal3D } from '../components/3d/MoneyFlowAnimation';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show3DMoneyModal, setShow3DMoneyModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    amountGiven: '',
    totalAmountToReceive: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Auto-fill calculator for 100 days
  const handleCalculate = () => {
    if (formData.amountGiven) {
      const given = parseFloat(formData.amountGiven);
      const toReceive = given * 1.25; 
      setFormData({
        ...formData,
        totalAmountToReceive: toReceive.toString()
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dailyAmount = parseFloat(formData.totalAmountToReceive) / 100;
      const endD = format(addDays(new Date(formData.startDate), 100), 'yyyy-MM-dd');

      const payload = {
        ...formData,
        dailyPaymentAmount: dailyAmount,
        endDate: endD
      };

      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      await axios.post(`${apiUrl}/customers`, payload);
      
      // Trigger 3D Money Flow Stream Modal animation
      setShow3DMoneyModal(true);
      
      // Navigate after animation completes
      setTimeout(() => {
        navigate('/customers');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding customer');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 3D Money Transfer Stream Animation Modal */}
      <MoneyStreamModal3D 
        isOpen={show3DMoneyModal}
        onClose={() => setShow3DMoneyModal(false)}
        amount={formData.amountGiven}
        recipientName={formData.name}
        type="give"
      />

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 hover:bg-slate-800 rounded-full transition-colors text-slate-300 border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> 3D Loan Disbursement
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Disburse Money to New Customer</h1>
        </div>
      </div>

      <div className="tilt-card-3d p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {error && (
            <div className="bg-rose-500/10 text-rose-300 p-4 rounded-2xl text-sm border border-rose-500/20 font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Borrower Info */}
          <div>
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" /> Borrower Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Customer Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" required name="name" value={formData.name} onChange={handleChange}
                    className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="tel" required name="phone" value={formData.phone} onChange={handleChange}
                    className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium"
                    placeholder="9876543210"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" name="address" value={formData.address} onChange={handleChange}
                    className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium"
                    placeholder="Residential address details"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 3D Money Disbursement Amounts */}
          <div>
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" /> 3D Loan & Money Flow Terms
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Money Given / Principal (₹)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="w-4 h-4 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="number" required name="amountGiven" value={formData.amountGiven} onChange={handleChange}
                      className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-bold text-emerald-300"
                      placeholder="80000"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleCalculate} 
                    className="px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-2xl transition-colors border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5"
                    title="Auto-calculate 25% profit"
                  >
                    <Calculator className="w-4 h-4" /> Auto +25%
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Total Account Amount to Receive (₹)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-blue-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="number" required name="totalAmountToReceive" value={formData.totalAmountToReceive} onChange={handleChange}
                    className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-black text-blue-400 bg-blue-500/10 border-blue-500/30"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Start Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="date" required name="startDate" value={formData.startDate} onChange={handleChange}
                    className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Notes</label>
                <input 
                  type="text" name="notes" value={formData.notes} onChange={handleChange}
                  className="glass-input w-full px-4 py-3 rounded-2xl text-sm font-medium"
                  placeholder="Optional terms or guarantor info..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="px-6 py-3 border border-white/10 text-slate-300 font-bold rounded-2xl hover:bg-slate-800 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-3d px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl shadow-emerald-500/20 disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Send className="w-4 h-4" /> Disburse & Save (Trigger 3D Money Flow)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
