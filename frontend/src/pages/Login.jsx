import { useState, useContext, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, Loader2, Lock, ArrowRight, Shield, Mail, Building, UserCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Google SVG Logo component
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

// Floating particle dots for 3D effect
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 17) % 100}%`,
  top: `${(i * 23) % 100}%`,
  delay: `${(i % 5) * 1.5}s`,
  duration: `${6 + (i % 4) * 2}s`,
  size: `${2 + (i % 3)}px`,
}));

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const googleBtnRef = useRef(null);
  const [cardTransform, setCardTransform] = useState({ rotateX: 0, rotateY: 0 });

  const handleGoogleResponse = useCallback(async (response) => {
    setError('');
    setGoogleLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.post(`${apiUrl}/auth/google`, {
        credential: response.credential,
      });
      setSuccess(true);
      setTimeout(() => {
        login(res.data.token, res.data.username, res.data.email, res.data.profilePicture, res.data.authProvider);
        navigate('/');
      }, 800);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Google authentication failed.';
      setError(`Google Sign-In failed: ${msg}`);
    } finally {
      setGoogleLoading(false);
    }
  }, [login, navigate]);

  // Initialize Google Sign-In if client ID is provided
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
        });
        
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(
            googleBtnRef.current,
            { 
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              width: 400,
              text: 'continue_with',
            }
          );
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [handleGoogleResponse]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      
      if (isSignUp) {
        // Registration
        const res = await axios.post(`${apiUrl}/auth/register`, {
          username,
          businessName,
          email,
          password
        });
        
        setSuccess(true);
        setTimeout(() => {
          login(res.data.token, res.data.username, res.data.email, res.data.profilePicture, res.data.authProvider);
          navigate('/');
        }, 800);
      } else {
        // Sign In
        const res = await axios.post(`${apiUrl}/auth/login`, {
          username,
          password
        });
        
        setSuccess(true);
        setTimeout(() => {
          login(res.data.token, res.data.username, res.data.email, res.data.profilePicture, res.data.authProvider);
          navigate('/');
        }, 800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // 3D tilt effect on mouse move
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    setCardTransform({ rotateX, rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCardTransform({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ perspective: '1500px' }}>
      {/* Background 3D effects */}
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-50" />

      {/* Floating 3D shapes */}
      <div className="shape-3d shape-1" />
      <div className="shape-3d shape-2" />
      <div className="shape-3d shape-3" />
      <div className="shape-3d shape-4" />

      {/* Glow rings */}
      <div className="glow-ring glow-ring-1" />
      <div className="glow-ring glow-ring-2" />

      {/* Particle dots */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Main card container */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card rounded-3xl w-full max-w-md relative z-10 my-6 shadow-2xl"
        style={{
          transform: `rotateX(${cardTransform.rotateX}deg) rotateY(${cardTransform.rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Shimmer top border */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        <div className="p-8 sm:p-10">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 mb-4 shadow-lg shadow-emerald-500/10">
              <Wallet className="w-8 h-8 text-emerald-300" />
            </div>
            <h1 className="text-3xl font-black text-shimmer tracking-tight">
              FinTrack 3D
            </h1>
            <p className="mt-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Finance Management Portal
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In / Sign Up) */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/80 rounded-2xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
                setInfoMessage('');
              }}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                !isSignUp 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
                setInfoMessage('');
              }}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                isSignUp 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Business
            </button>
          </div>

          {/* Success State */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                  <Shield className="w-8 h-8 text-emerald-400 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-white">
                  {isSignUp ? 'Account Created Successfully!' : 'Welcome Back!'}
                </h3>
                <p className="text-slate-400 text-xs mt-1">Redirecting to your 3D Finance Suite...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <div>
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-400/30 text-rose-300 text-xs font-semibold text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info Message */}
              <AnimatePresence>
                {infoMessage && (
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="mb-5 p-3.5 rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-medium text-center"
                  >
                    {infoMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Credentials Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {/* Username or Email field */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <UserCheck className="w-4.5 h-4.5" />
                  </div>
                  <input
                    id="auth-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-xs font-medium text-white placeholder-slate-500"
                    placeholder={isSignUp ? "Business Username (e.g. vamsifinance)" : "Username or Email"}
                    autoComplete="username"
                  />
                </div>

                {/* Additional Business Name field for Sign Up */}
                {isSignUp && (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Building className="w-4.5 h-4.5" />
                    </div>
                    <input
                      id="auth-business-name"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-xs font-medium text-white placeholder-slate-500"
                      placeholder="Finance Company Name (e.g. Vamsi Finance & Credit)"
                      autoComplete="organization"
                    />
                  </div>
                )}

                {/* Additional Email field for Sign Up */}
                {isSignUp && (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <input
                      id="auth-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-xs font-medium text-white placeholder-slate-500"
                      placeholder="Business Email (owner@company.com)"
                      autoComplete="email"
                    />
                  </div>
                )}

                {/* Password field */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    id="auth-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-xs font-medium text-white placeholder-slate-500"
                    placeholder="Password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                </div>

                {/* Confirm Password field for Sign Up */}
                {isSignUp && (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Shield className="w-4.5 h-4.5" />
                    </div>
                    <input
                      id="auth-confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-xs font-medium text-white placeholder-slate-500"
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                    />
                  </div>
                )}

                {/* Submit button */}
                <button
                  id="auth-submit"
                  type="submit"
                  disabled={loading}
                  className="btn-primary-3d w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-emerald-500/20 mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? 'Create Business Account' : 'Sign In To Portal'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Optional Google Authentication */}
              <div className="divider-text my-5">
                <span>or continue with</span>
              </div>

              {GOOGLE_CLIENT_ID ? (
                <div className="relative">
                  <div 
                    ref={googleBtnRef} 
                    className="w-full [&>div]:!w-full [&>div>div]:!w-full"
                    style={{ 
                      opacity: googleLoading ? 0.5 : 1,
                      pointerEvents: googleLoading ? 'none' : 'auto'
                    }}
                  />
                  {googleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-google w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-white/10 transition-colors"
                  onClick={() => {
                    setInfoMessage('Google Sign-In is optional. You can sign up or log in directly above with username & password.');
                  }}
                >
                  <GoogleLogo />
                  <span>Google Sign-In (Optional)</span>
                </button>
              )}

              {/* Switch Mode Prompt Footer */}
              <div className="mt-6 text-center">
                {!isSignUp ? (
                  <p className="text-xs text-slate-400 font-medium">
                    Don't have a business account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setError('');
                        setInfoMessage('');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 transition-colors"
                    >
                      Sign Up Now
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setError('');
                        setInfoMessage('');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 transition-colors"
                    >
                      Sign In Here
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer Attribution */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase">
          FinTrack 3D Finance Suite &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;
