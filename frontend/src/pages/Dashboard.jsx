import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, TrendingUp, AlertCircle, CheckCircle2, Wallet, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const StatCardAurora = ({ title, value, icon: Icon, glowClass, delay = 0, subtitle }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={`aurora-card ${glowClass} p-6 rounded-3xl group cursor-pointer`}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:scale-105 transition-transform duration-300">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs font-medium text-cyan-400 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {subtitle}
            </p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
          <Icon className="w-7 h-7 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
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
        <div className="loader-ring" />
        <p className="text-sm font-bold text-purple-400 animate-pulse">Loading Aurora Dashboard...</p>
      </div>
    );
  }

  const recoveryRate = stats?.totalMoneyToCollect > 0 
    ? Math.round((stats.totalCollectedAmount / stats.totalMoneyToCollect) * 100) 
    : 0;

  return (
    <div className="space-y-8 relative">
      {/* Header Banner */}
      <div className="aurora-card p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">
            <ShieldCheck className="w-4 h-4" /> Financial Overview
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Aurora Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time daily collection tracking & analytics.</p>
        </div>

        <Link 
          to="/customers/add" 
          className="btn-premium px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2"
        >
          <Users className="w-4.5 h-4.5" />
          Disburse New Loan
        </Link>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardAurora 
          title="Total Money Given" 
          value={formatCurrency(stats?.totalMoneyGiven || 0)} 
          icon={Wallet} 
          glowClass="card-glow-cyan"
          subtitle="Outflow Capital"
          delay={0.1}
        />
        <StatCardAurora 
          title="Total Collected" 
          value={formatCurrency(stats?.totalCollectedAmount || 0)} 
          icon={CheckCircle2} 
          glowClass="card-glow-purple"
          subtitle="Inflow Recovered"
          delay={0.2}
        />
        <StatCardAurora 
          title="Total Outstanding" 
          value={formatCurrency(stats?.pendingAmount || 0)} 
          icon={AlertCircle} 
          glowClass="card-glow-pink"
          subtitle="Pending Recovery"
          delay={0.3}
        />
        <StatCardAurora 
          title="Today's Collection" 
          value={formatCurrency(stats?.todayCollection || 0)} 
          icon={TrendingUp} 
          glowClass="card-glow-amber"
          subtitle="Daily Cashflow"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 aurora-card p-6 md:p-8 rounded-3xl"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Daily Collection Stream</h3>
              <p className="text-xs text-slate-400 mt-1">7-day cash influx performance</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Live Tracker
            </span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyHistory || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAurora" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    color: '#fff',
                    backdropFilter: 'blur(12px)'
                  }}
                  itemStyle={{ color: '#c084fc', fontWeight: 700 }}
                  formatter={(value) => [formatCurrency(value), 'Collection']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#c084fc" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAurora)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Growth Sphere Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="aurora-card p-6 md:p-8 rounded-3xl flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight mb-8">Business Growth</h3>

            <div className="space-y-8">
              {/* Recovery Rate Bar */}
              <div>
                <div className="flex justify-between text-sm font-bold mb-3">
                  <span className="text-slate-400">Total Recovery Rate</span>
                  <span className="text-cyan-400 font-black">{recoveryRate}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2.5 p-0.5 border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-1.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000" 
                    style={{ width: `${recoveryRate}%` }}
                  />
                </div>
              </div>

              {/* Profit Card */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Expected Net Profit</p>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                      {formatCurrency(stats?.totalExpectedProfit || 0)}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link 
            to="/customers" 
            className="mt-8 w-full btn-ghost py-4 flex items-center justify-center text-sm font-bold rounded-2xl group"
          >
            Explore Customer Accounts
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform text-cyan-400" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
