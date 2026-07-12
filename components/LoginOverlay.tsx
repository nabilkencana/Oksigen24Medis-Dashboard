'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight, Activity, ShieldCheck, FileText, Package, Sun, Moon } from 'lucide-react';
import { BASE_URL } from '../context/apiClient';

interface LoginOverlayProps {
  onLoginSuccess: (user: any, tokens: { accessToken: string; refreshToken: string }) => void;
}

const SEED_ACCOUNTS = [
  { email: 'admin@medis24.com', label: 'Administrator', role: 'ADMIN', desc: 'Kelola operasional harian', icon: ShieldCheck },
  { email: 'owner@medis24.com', label: 'Pemilik Bisnis (Owner)', role: 'OWNER', desc: 'Ikhtisar bisnis menyeluruh', icon: Activity },
  { email: 'finance@medis24.com', label: 'Staf Keuangan', role: 'FINANCE', desc: 'Transaksi kasir & pengeluaran kas', icon: FileText },
  { email: 'warehouse@medis24.com', label: 'Staf Gudang', role: 'WAREHOUSE', desc: 'Stok retail & logistik tabung', icon: Package },
];

export default function LoginOverlay({ onLoginSuccess }: LoginOverlayProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Detect initial theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('oksigen24_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Harap masukkan email dan kata sandi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Kredensial salah atau server tidak dapat dihubungi.');
      }

      const body = await res.json();
      const data = body.data;
      onLoginSuccess(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (seedEmail: string) => {
    setEmail(seedEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto transition-colors duration-300">
      <div className="relative w-full max-w-5xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[550px] transition-colors duration-300">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          className="absolute top-6 right-6 p-2 rounded-lg border border-border bg-muted/20 hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer transition-colors z-10"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Left Side: Branding / Quick Access */}
        <div className="flex-1 p-8 sm:p-10 bg-muted/20 dark:bg-muted/10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border transition-colors duration-300">
          <div>
            <div className="flex items-center gap-1">
              <img src="/logo-removebg-preview.png" alt="Website Logo" className="h-24 w-24 object-contain" />
              <div>
                <h1 className="font-bold text-sm leading-tight text-foreground">Oksigen Medis 24 Jam</h1>
                <p className="text-3xs text-muted-foreground font-semibold uppercase tracking-wider">ERP SYSTEM v1.0</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-extrabold text-foreground mt-12 tracking-tight leading-tight">
              Akses Cepat <br />
              <span className="text-primary">
                Simulasi Kredensial
              </span>
            </h2>
            
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed max-w-md">
              Pilih salah satu akun demo di bawah untuk mengisi form login secara otomatis sesuai dengan role yang ingin diuji.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            {SEED_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickSelect(acc.email)}
                  className="flex items-start gap-3 p-3.5 bg-background hover:bg-muted/50 border border-border/80 hover:border-border rounded-2xl text-left transition-all duration-200 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted dark:bg-muted/50 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                      {acc.label}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{acc.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center bg-card transition-colors duration-300">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Masuk Sistem</h2>
            <p className="text-muted-foreground text-xs mt-1">Masukkan kredensial Anda untuk masuk ke sistem dashboard ERP.</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 text-destructive"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                <div className="text-xs font-medium leading-relaxed">{error}</div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Pengguna</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/75" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nama@medis24.com"
                    className="w-full h-11 pl-11 pr-4 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm focus:outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/75" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-11 pl-11 pr-4 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm focus:outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:pointer-events-none mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
