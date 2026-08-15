import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, TrendingUp, AlertCircle, CheckCircle2, Wallet, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { FloatingNote3D, FloatingCoin3D } from '../components/3d/MoneyFlowAnimation';

const StatCard3D = ({ title, value, icon: Icon, glowClass, delay = 0, subtitle }) => {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTransform({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0, rotateX: 15 }}
      animate={{ y: 0, opacity: 1, rotateX: 0 }}
      transition={{ delay, duration: 0.6 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className={`tilt-card-3d ${glowClass} p-6 rounded-3xl relative overflow-hidden group cursor-pointer`}
    >
      {/* 3D Glass shimmer top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:scale-105 transition-transform">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs font-medium text-emerald-400 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {subtitle}
            </p>
          )}
        </div>

        {/* 3D Icon Box with hover lift */}
        <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-white/10 shadow-xl group-hover:translate-z-6 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-7 h-7 text-emerald-400 group-hover:rotate-12 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await axios.get(`${apiUrl}/dashboard/stats`);
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-b-blue-500 animate-spin" style={{ animationDirection: 'reverse' }} />
        </div>
        <p className="text-sm font-bold text-slate-400 animate-pulse">Loading 3D Dashboard...</p>
      </div>
    );
  }

  const recoveryRate = stats?.totalMoneyToCollect > 0 
    ? Math.round((stats.totalCollectedAmount / stats.totalMoneyToCollect) * 100) 
    : 0;

  return (
    <div className="space-y-8 relative">
      {/* Floating 3D Ambient Money background items */}
      <div className="hidden xl:block">
        <FloatingNote3D style={{ top: '0px', right: '40px' }} delay={0} scale={0.9} />
        <FloatingCoin3D style={{ top: '160px', left: '-20px' }} delay={1} />
        <FloatingNote3D style={{ bottom: '100px', right: '10px' }} delay={2} scale={0.8} />
      </div>

      {/* Header Banner with 3D styling */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" /> 3D Financial Overview
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">FinTrack 3D Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time daily collection tracking & 3D flow analytics.</p>
        </div>

        <Link 
          to="/customers/add" 
          className="btn-primary-3d px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 shadow-xl shadow-emerald-500/20 relative z-10"
        >
          <Users className="w-4.5 h-4.5" />
          Disburse New Loan (Add Customer)
        </Link>
      </div>

      {/* Top 3D Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard3D 
          title="Total Money Given" 
          value={formatCurrency(stats?.totalMoneyGiven || 0)} 
          icon={Wallet} 
          glowClass="card-glow-blue"
          subtitle="Outflow Capital"
          delay={0.1}
        />
        <StatCard3D 
          title="Total Collected" 
          value={formatCurrency(stats?.totalCollectedAmount || 0)} 
          icon={CheckCircle2} 
          glowClass="card-glow-emerald"
          subtitle="Inflow Recovered"
          delay={0.2}
        />
        <StatCard3D 
          title="Total Outstanding" 
          value={formatCurrency(stats?.pendingAmount || 0)} 
          icon={AlertCircle} 
          glowClass="card-glow-rose"
          subtitle="Pending Recovery"
          delay={0.3}
        />
        <StatCard3D 
          title="Today's Collection" 
          value={formatCurrency(stats?.todayCollection || 0)} 
          icon={TrendingUp} 
          glowClass="card-glow-gold"
          subtitle="Daily Cashflow"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Collection History Chart */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 tilt-card-3d p-6 sm:p-8 rounded-3xl border border-white/10"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Daily Collection Stream</h3>
              <p className="text-xs text-slate-400 mt-0.5">7-day cash influx performance</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Live Tracker
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyHistory || []}>
                <defs>
                  <linearGradient id="color3D" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: 'rgba(16, 185, 129, 0.3)', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#10B981', fontWeight: 700 }}
                  formatter={(value) => [formatCurrency(value), 'Collection']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#color3D)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3D Recovery & Profit Sphere Card */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="tilt-card-3d p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight mb-6">Business Growth & Profit</h3>

            <div className="space-y-6">
              {/* Recovery Rate Bar */}
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-400">Total Recovery Rate</span>
                  <span className="text-emerald-400 font-black">{recoveryRate}%</span>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-3 p-0.5 border border-white/10 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-300 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-emerald-500/50" 
                    style={{ width: `${recoveryRate}%` }}
                  />
                </div>
              </div>

              {/* 3D Profit Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected Net Profit</p>
                    <p className="text-2xl font-black text-emerald-300 mt-1">
                      {formatCurrency(stats?.totalExpectedProfit || 0)}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link 
            to="/customers" 
            className="mt-8 w-full flex items-center justify-center py-3.5 text-sm font-bold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-2xl transition-all duration-200 group"
          >
            Explore Customer Accounts
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform text-emerald-400" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
