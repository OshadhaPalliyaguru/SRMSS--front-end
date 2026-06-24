'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bus, Mail, Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useState } from 'react';
import { loginSchema, type LoginFormValues } from '@/lib/validators';

// Demo credentials for mock auth
const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@srmss.lk', password: 'admin123' },
  { role: 'Manager', email: 'manager@srmss.lk', password: 'manager123' },
  { role: 'Operator', email: 'operator@srmss.lk', password: 'operator123' },
];

const MOCK_USERS: Record<string, { name: string; role: string; token: string }> = {
  'admin@srmss.lk':    { name: 'Asanka Fernando', role: 'ADMIN',    token: 'mock-admin-token' },
  'manager@srmss.lk':  { name: 'Priya Mendis',    role: 'MANAGER',  token: 'mock-manager-token' },
  'operator@srmss.lk': { name: 'Nimal Silva',     role: 'OPERATOR', token: 'mock-operator-token' },
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    try {
      // Mock auth — check if credentials match demo accounts
      const user = MOCK_USERS[values.email];
      const expected = DEMO_CREDENTIALS.find((c) => c.email === values.email);

      if (!user || !expected || expected.password !== values.password) {
        toast.error('Invalid credentials', { description: 'Please check your email and password.' });
        setLoading(false);
        return;
      }

      // Persist session
      localStorage.setItem('srmss_token', user.token);
      localStorage.setItem('srmss_user', JSON.stringify({ name: user.name, email: values.email, role: user.role }));

      toast.success(`Welcome back, ${user.name}!`, { description: `Logged in as ${user.role}` });
      setTimeout(() => router.push('/dashboard'), 500);
    } catch {
      toast.error('Login failed', { description: 'Something went wrong. Please try again.' });
      setLoading(false);
    }
  }

  return (
    <div className="login-gradient min-h-screen flex items-center justify-center p-4">
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-[0.06]"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              left: `${10 + i * 15}%`,
              top: `${15 + i * 12}%`,
              background: i % 2 === 0 ? '#3b82f6' : '#10b981',
            }}
            animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left — branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="hidden md:flex flex-col"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-2xl">
              <Bus size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SRMSS</h1>
              <p className="text-xs text-slate-500">Smart Route Management System</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold leading-tight mb-4">
            <span className="text-white">Manage your fleet</span><br />
            <span className="gradient-text">smarter, faster.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            A unified platform for Sri Lanka's public transport depots — manage routes, schedules,
            drivers, vehicles, and fuel logs in one place.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active Routes', value: '24+' },
              { label: 'Managed Depots', value: '4' },
              { label: 'Daily Schedules', value: '120+' },
              { label: 'Fleet Vehicles', value: '60+' },
            ].map((stat) => (
              <div key={stat.label} className="card p-3">
                <p className="text-lg font-bold text-blue-400">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — login form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="card p-8"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <Bus size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white">SRMSS</p>
              <p className="text-xs text-slate-500">Smart Route Management System</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="form-label">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@srmss.lk"
                  className="form-input pl-9"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="form-input pl-9 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <><LogIn size={15} /> Sign in</>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-blue-500/6 border border-blue-500/15">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={13} className="text-blue-400" />
              <p className="text-xs font-semibold text-blue-400">Demo Credentials</p>
            </div>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => { setValue('email', cred.email); setValue('password', cred.password); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/3 hover:bg-white/6 border border-white/5 transition-colors text-left"
                >
                  <span className="text-xs font-medium text-slate-300">{cred.role}</span>
                  <span className="text-xs text-slate-500">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
