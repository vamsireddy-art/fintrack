import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { addDays, format } from 'date-fns';

const PaymentGrid = ({ tracker, onMarkPayment, disabled, startDate }) => {
  const paidCount = tracker.filter(day => (day.status || (day.isPaid ? 'paid' : 'pending')) === 'paid').length;
  const missedCount = tracker.filter(day => (day.status || (day.isPaid ? 'paid' : 'pending')) === 'missed').length;
  const pendingCount = 100 - paidCount - missedCount;

  return (
    <div className="w-full space-y-6">
      {/* 3D Tracker Statistics Banner */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-black/20 rounded-[2rem] border border-white/5 shadow-inner backdrop-blur-xl">
        <div className="text-center p-4 rounded-3xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/10 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Paid Days
          </p>
          <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-200">
            {paidCount} <span className="text-sm text-emerald-500/50 font-bold">/ 100</span>
          </p>
        </div>
        
        <div className="text-center p-4 rounded-3xl bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/10 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[10px] uppercase font-black text-rose-400 tracking-widest mb-2 flex items-center justify-center gap-1.5">
            <X className="w-3.5 h-3.5" /> Missed Days
          </p>
          <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-rose-200">
            {missedCount} <span className="text-sm text-rose-500/50 font-bold">/ 100</span>
          </p>
        </div>

        <div className="text-center p-4 rounded-3xl bg-gradient-to-b from-slate-500/10 to-transparent border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Pending Days</p>
          <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
            {pendingCount} <span className="text-sm text-slate-500/50 font-bold">/ 100</span>
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold px-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)]">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
          <span>Paid (₹ Cash In)</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-[0_0_10px_rgba(225,29,72,0.4)]">
            <X className="w-2.5 h-2.5 text-white" />
          </div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/5 text-slate-400">
          <div className="w-4 h-4 rounded-full bg-slate-800 border border-white/10" />
          <span>Pending</span>
        </div>
      </div>

      {/* 100 3D Grid Boxes */}
      <div className="grid grid-cols-4 sm:grid-cols-10 gap-2.5 sm:gap-3" style={{ perspective: '1000px' }}>
        {tracker.map((day) => {
          const status = day.status || (day.isPaid ? 'paid' : 'pending');
          const isPaid = status === 'paid';
          const isMissed = status === 'missed';
          
          const dayDate = startDate 
            ? format(addDays(new Date(startDate), day.dayIndex - 1), 'dd MMM')
            : `Day ${day.dayIndex}`;
          
          return (
            <motion.button
              key={day.dayIndex}
              whileHover={{ scale: disabled ? 1 : 1.15, rotateX: -10, rotateY: 10, zIndex: 10 }}
              whileTap={{ scale: disabled ? 1 : 0.9 }}
              onClick={() => {
                if (disabled) return;
                let nextStatus = 'pending';
                if (status === 'pending') nextStatus = 'paid';
                else if (status === 'paid') nextStatus = 'missed';
                else if (status === 'missed') nextStatus = 'pending';
                
                onMarkPayment(day.dayIndex, nextStatus);
              }}
              className={`
                relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1 transition-all duration-300 transform-gpu overflow-hidden
                ${isPaid 
                  ? 'bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-300/50' 
                  : isMissed
                    ? 'bg-gradient-to-br from-rose-400 via-rose-600 to-pink-700 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] border border-rose-300/50'
                    : 'bg-slate-900/50 backdrop-blur-sm border border-white/5 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800 shadow-inner group'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Inner subtle glow for paid/missed */}
              {(isPaid || isMissed) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl pointer-events-none"></div>
              )}
              
              {/* Pending hover glow effect */}
              {status === 'pending' && !disabled && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] transition-opacity duration-300 pointer-events-none"></div>
              )}

              <span className={`text-base sm:text-lg font-black relative z-10 ${isPaid || isMissed ? 'drop-shadow-md' : ''}`}>
                {day.dayIndex}
              </span>
              
              <span className={`text-[8px] sm:text-[9px] font-bold mt-0.5 tracking-tighter relative z-10 ${isPaid || isMissed ? 'text-white/90 drop-shadow-sm' : 'text-slate-500 group-hover:text-emerald-500/70 transition-colors'}`}>
                {dayDate}
              </span>

              {isPaid && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  type="spring"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-white to-slate-200 rounded-full flex items-center justify-center shadow-lg z-20 border border-emerald-200"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3.5px]" />
                </motion.div>
              )}
              {isMissed && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  type="spring"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-white to-slate-200 rounded-full flex items-center justify-center shadow-lg z-20 border border-rose-200"
                >
                  <X className="w-3.5 h-3.5 text-rose-600 stroke-[3.5px]" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentGrid;
