import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Shield, Scissors, LogOut, CheckCircle2 } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block text-slate-100">
              DevClub<span className="text-blue-500">.Agenda</span>
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 block">
              Sistema de Agendamentos
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/' || location.pathname === '/confirmacao'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Agendar Serviço</span>
            <span className="sm:hidden">Agendar</span>
          </Link>

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/admin/dashboard'
                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Painel Admin</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Sair do Admin"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Área Restrita</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
