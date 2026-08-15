import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CheckCircle, Sparkles } from 'lucide-react';

/**
 * 3D Floating Money Note Component
 */
export const FloatingNote3D = ({ style, delay = 0, scale = 1, duration = 5 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 30, rotateY: -20, scale: 0.8 }}
      animate={{
        opacity: [0.7, 1, 0.8],
        y: [0, -15, 0],
        rotateX: [15, -15, 15],
        rotateY: [-25, 25, -25],
        rotateZ: [-5, 5, -5],
        scale: [scale, scale * 1.05, scale],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className="absolute pointer-events-none select-none z-20"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      <div className="relative w-28 h-14 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 p-2 shadow-2xl border border-emerald-300/40 flex flex-col justify-between overflow-hidden backdrop-blur-md transform-gpu hover:scale-110 transition-transform">
        {/* Holographic shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -rotate-45 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
        
        {/* Top bar */}
        <div className="flex justify-between items-center text-[10px] font-black text-emerald-100 tracking-wider">
          <span>₹500</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-200 shadow-sm" />
          <span>RESERVE</span>
        </div>

        {/* Center watermark icon */}
        <div className="self-center my-0.5 text-white/90 font-black text-sm tracking-widest bg-emerald-900/40 px-2 py-0.5 rounded border border-white/20 shadow-inner">
          ₹ 500
        </div>

        {/* Bottom bar */}
        <div className="flex justify-between items-end text-[8px] font-bold text-emerald-200/80">
          <span>FINTRACK</span>
          <span>BANK OF INDIA</span>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 3D Floating Coin Component
 */
export const FloatingCoin3D = ({ style, delay = 0, duration = 4 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotateY: 0 }}
      animate={{
        opacity: 1,
        scale: [1, 1.15, 1],
        rotateY: [0, 360],
        y: [0, -10, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className="absolute pointer-events-none select-none z-20"
      style={{
        perspective: '800px',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 border-2 border-yellow-200 flex items-center justify-center font-black text-amber-950 text-xs shadow-lg shadow-amber-500/30 transform-gpu backdrop-blur-sm">
        <div className="w-7 h-7 rounded-full border border-amber-500/50 flex items-center justify-center bg-yellow-300/40 shadow-inner">
          ₹
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Interactive 3D Money Stream Trigger Overlay
 * Displays animated 3D money notes flowing from Sender to Receiver when triggered.
 */
export const MoneyStreamModal3D = ({ isOpen, onClose, amount, recipientName, type = 'give' }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Generate 14 flying money note trajectories
      const items = Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        startX: (i % 2 === 0 ? 1 : -1) * (20 + (i * 5)),
        startY: 120,
        endX: (i % 2 === 0 ? -1 : 1) * (30 + (i * 6)),
        endY: -160,
        rotate: i * 25,
        scale: 0.6 + (i % 3) * 0.2,
        delay: i * 0.12,
      }));
      const raf = requestAnimationFrame(() => setParticles(items));

      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3200);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 overflow-hidden">
        {/* Background 3D grid and light beam */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 via-slate-950 to-emerald-950/30" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />

        {/* Floating 3D Cash Notes flying upward */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.startX,
              y: p.startY,
              opacity: 0,
              scale: 0.2,
              rotateX: 45,
              rotateY: 0,
              rotateZ: p.rotate,
            }}
            animate={{
              x: p.endX,
              y: p.endY,
              opacity: [0, 1, 1, 0],
              scale: p.scale,
              rotateX: [45, -45, 45],
              rotateY: [0, 180, 360],
              rotateZ: p.rotate + 180,
            }}
            transition={{
              duration: 2.2,
              delay: p.delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="absolute z-30 pointer-events-none"
          >
            <div className="w-24 h-12 rounded-lg bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 p-1.5 shadow-2xl border border-emerald-200/50 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[9px] font-black text-white">
                <span>₹500</span>
                <span className="w-2 h-2 rounded-full bg-amber-300" />
              </div>
              <div className="text-center font-black text-xs text-white tracking-widest">
                ₹ CASH
              </div>
              <div className="flex justify-between text-[7px] text-emerald-100 font-bold">
                <span>FINTRACK</span>
                <span>3D FLOW</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Center 3D Card Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateX: 25 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'out' }}
          className="relative z-40 bg-slate-900/90 border border-emerald-500/30 p-8 rounded-3xl shadow-2xl shadow-emerald-500/20 max-w-md w-full text-center backdrop-blur-2xl"
          style={{ perspective: '1000px' }}
        >
          {/* Animated 3D Money Stream Icon */}
          <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/40"
            />
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center transform hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wallet className="w-10 h-10 text-emerald-400 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            3D Money Flow Active
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {type === 'give' ? 'Disbursing Funds' : 'Collection Received'}
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            {type === 'give'
              ? `Transferring principal amount to ${recipientName}`
              : `Processing daily collection payment from ${recipientName}`}
          </p>

          {/* Amount Badge */}
          <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 shadow-inner">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Transaction Amount
            </span>
            <span className="text-3xl font-black bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              ₹{Number(amount || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>Money successfully transferred in 3D Realtime</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
