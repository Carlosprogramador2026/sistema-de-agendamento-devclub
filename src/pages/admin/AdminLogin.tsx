import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const ADMIN_EMAIL = 'admin@teste.com';
  const ADMIN_SENHA = '123456';

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/dashboard');
    } else {
      setErro('Email ou senha inválidos. Tente utilizar as credenciais de teste.');
    }
  }

  function handleQuickFill() {
    setEmail(ADMIN_EMAIL);
    setSenha(ADMIN_SENHA);
    setErro('');
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold text-center text-white mb-1">
          Painel Administrativo
        </h1>
        <p className="text-xs text-slate-400 text-center mb-6">
          Acesso restrito para gerenciar agendamentos e horários.
        </p>

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Email do Administrador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="admin@teste.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Senha de Acesso
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Lock className="w-4 h-4" />
            <span>Acessar Painel</span>
          </button>
        </form>

        {/* Credenciais Rápidas */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-2">
            Credenciais padrão para teste:
          </p>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 text-xs font-mono text-slate-300 flex items-center justify-between">
            <span>
              <strong className="text-white">Email:</strong> admin@teste.com |{' '}
              <strong className="text-white">Senha:</strong> 123456
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickFill}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Auto-preencher credenciais de teste
          </button>
        </div>
      </div>
    </div>
  );
}
