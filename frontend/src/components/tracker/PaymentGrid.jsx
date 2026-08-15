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
      <div className="grid grid-cols-3 gap-3 bg-slate-900/80 p-5 rounded-3xl border border-white/10 shadow-xl">
        <div className="text-center">
          <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> Paid Days
          </p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {paidCount} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </p>
        </div>
        <div className="text-center border-x border-white/10">
          <p className="text-[10px] uppercase font-black text-rose-400 tracking-widest">Missed Days</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {missedCount} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Pending Days</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {pendingCount} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-300 font-semibold px-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500 border border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span>Paid (₹ Cash In)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-rose-500 border border-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <X className="w-3 h-3 text-white" />
          </div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-800 border border-white/20" />
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
              whileHover={{ scale: disabled ? 1 : 1.1, rotateX: -10, translateZ: 10 }}
              whileTap={{ scale: disabled ? 1 : 0.92 }}
              onClick={() => {
                if (disabled) return;
                let nextStatus = 'pending';
                if (status === 'pending') nextStatus = 'paid';
                else if (status === 'paid') nextStatus = 'missed';
                else if (status === 'missed') nextStatus = 'pending';
                
                onMarkPayment(day.dayIndex, nextStatus);
              }}
              className={`
                relative aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all duration-300 border transform-gpu
                ${isPaid 
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 text-white shadow-lg shadow-emerald-500/30 font-black' 
                  : isMissed
                    ? 'bg-gradient-to-tr from-rose-600 to-red-500 border-rose-300 text-white shadow-lg shadow-rose-500/30 font-black'
                    : 'bg-slate-900/80 border-white/10 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-sm sm:text-base font-black">
                {day.dayIndex}
              </span>
              
              <span className={`text-[8.5px] font-bold mt-0.5 tracking-tighter ${isPaid || isMissed ? 'text-white/80' : 'text-slate-500'}`}>
                {dayDate}
              </span>

              {isPaid && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3.5px]" />
                </div>
              )}
              {isMissed && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                  <X className="w-3 h-3 text-rose-600 stroke-[3.5px]" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentGrid;
