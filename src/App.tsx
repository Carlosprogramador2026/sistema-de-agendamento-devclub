import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Agendar from './pages/cliente/Agendar';
import Confirmacao from './pages/cliente/Confirmacao';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  return isAdmin ? <>{children}</> : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Agendar />} />
            <Route path="/agendar" element={<Agendar />} />
            <Route path="/confirmacao" element={<Confirmacao />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
