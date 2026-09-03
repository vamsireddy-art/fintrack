import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, LogOut, Hexagon, Sparkles } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ onClose }) => {
  const { logout, user } = useContext(AuthContext);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: UserPlus, label: 'Add Customer', path: '/customers/add' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#030014]/60 backdrop-blur-2xl border-r border-white/5 transition-colors duration-300">
      {/* Brand Logo Area */}
      <div className="flex items-center justify-center h-24 border-b border-white/5 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-50" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Hexagon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">FinTrack</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Aurora Suite
            </p>
          </div>
        </div>
      </div>

      {/* User Badge if logged in */}
      {user && (
        <div className="p-4 mx-4 mt-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 aurora-card">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="User" className="w-9 h-9 rounded-full border border-purple-400/50" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold flex items-center justify-center text-sm">
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
                ? 'bg-white/10 text-white shadow-lg shadow-purple-500/10 border border-white/10' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                   <div className="absolute inset-0 border border-purple-500/30 rounded-2xl pointer-events-none" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center px-4 py-3 text-rose-400 font-bold text-xs rounded-2xl hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-rose-500/20"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Secure Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
