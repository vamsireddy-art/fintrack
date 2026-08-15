import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, LogOut, Wallet, Sparkles } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ onClose }) => {
  const { logout, user } = useContext(AuthContext);

  const navItems = [
    { icon: LayoutDashboard, label: '3D Dashboard', path: '/' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: UserPlus, label: 'Add Customer', path: '/customers/add' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 transition-colors duration-300">
      {/* Brand Logo Area */}
      <div className="flex items-center justify-center h-24 border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform hover:rotate-12 transition-transform">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-shimmer tracking-tight">FinTrack</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> 3D Finance Suite
            </p>
          </div>
        </div>
      </div>

      {/* User Badge if logged in */}
      {user && (
        <div className="p-4 mx-4 mt-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center gap-3">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="User" className="w-9 h-9 rounded-full border border-emerald-400/50" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold flex items-center justify-center text-sm">
              {user.username?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user.username}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email || 'Admin User'}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group relative overflow-hidden
              ${isActive 
                ? 'btn-primary-3d text-white shadow-xl shadow-emerald-500/20' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex w-full items-center px-4 py-3 text-rose-400 font-bold text-xs rounded-2xl hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-rose-500/20"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout Account
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
