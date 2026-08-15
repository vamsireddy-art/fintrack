import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInCalendarDays } from 'date-fns';

const isSameDayAsToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate();
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await axios.get(`${apiUrl}/customers`);
        setCustomers(res.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Customer Accounts
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Active Customer Portfolios</h1>
          <p className="text-sm text-slate-400 mt-1">Manage daily collections & 100-day loan accounts.</p>
        </div>
        <Link 
          to="/customers/add" 
          className="btn-primary-3d px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl shadow-emerald-500/20"
        >
          Add New Customer
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 tilt-card-3d p-4 rounded-3xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by customer name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input py-3 pl-4 pr-10 rounded-2xl text-sm font-bold bg-slate-900 cursor-pointer"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 tilt-card-3d rounded-3xl border border-white/10">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No customer accounts found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new customer.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCustomers.map((customer, idx) => {
            const dayIndex = Math.min(Math.max(differenceInCalendarDays(new Date(), new Date(customer.startDate)) + 1, 1), 100);
            const isPaidToday = customer.paymentTracker?.some(day => 
              day.status === 'paid' && day.paidDate && isSameDayAsToday(day.paidDate)
            );
            const progressPercentage = Math.min(((customer.amountPaidTillNow || 0) / (customer.totalAmountToReceive || 1)) * 100, 100);

            return (
              <motion.div 
                key={customer.id || customer._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link 
                  to={`/customers/${customer._id}`}
                  className="tilt-card-3d flex items-center justify-between p-5 rounded-3xl border border-white/10 group hover:border-emerald-500/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors">
                        {customer.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{customer.phone} • Day {dayIndex}/100</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-8 mr-4">
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Target</p>
                      <p className="font-black text-white">{formatCurrency(customer.totalAmountToReceive)}</p>
                    </div>

                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collected</p>
                      <p className="font-black text-emerald-400">{formatCurrency(customer.amountPaidTillNow)}</p>
                    </div>
                    
                    <div className="flex flex-col items-end w-32">
                      <div className="flex justify-between w-full mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">3D Progress</span>
                        <span className="text-[10px] font-bold text-emerald-400">{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-300 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isPaidToday && (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        Paid Today
                      </span>
                    )}
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      customer.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 
                      customer.status === 'overdue' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 
                      'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    }`}>
                      {customer.status.toUpperCase()}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Customers;
