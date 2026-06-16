'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Role } from '@awahouse/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { trpc } from '@/lib/trpc/react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { createAnonSupabaseClient } from '@/lib/auth/supabase';

function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingRole = useAuthStore((s) => s.pendingRole);
  const setAuth = useAuthStore((s) => s.setAuth);

  const urlError = searchParams.get('error');
  const [activeTab, setActiveTab] = React.useState<'signup' | 'login'>('signup');
  const [showPassword, setShowPassword] = React.useState(false);
  const [stage, setStage] = React.useState<'details' | 'otp'>('details');
  const [error, setError] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });

  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();
  const signInMutation = trpc.auth.signIn.useMutation();

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  ];

  const handleSendOtp = async () => {
    try {
      setError('');
      const isPasswordValid = passwordRequirements.every((req) => req.test(form.password));
      if (!isPasswordValid) {
        setError('Please meet all password requirements');
        return;
      }
      if (!form.email || !form.email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      await sendOtpMutation.mutateAsync({
        email: form.email,
        role: (pendingRole as 'tenant' | 'landlord' | 'agent') ?? 'tenant',
      });
      setStage('otp');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const names = form.fullName.trim().split(/\s+/);
      const result = await verifyOtpMutation.mutateAsync({
        email: form.email,
        code: otpCode,
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        role: (pendingRole as 'tenant' | 'landlord' | 'agent') ?? 'tenant',
        password: form.password,
      });

      if (result.success && result.userId) {
        setAuth({
          userId: result.userId,
          roles: result.roles as Role[],
          activeRole: result.activeRole as Role,
          sessionToken: result.sessionToken,
        });

        if (result.activeRole === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/verify-nin');
        }
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to verify OTP');
    }
  };

  const handleSignIn = async () => {
    try {
      setLoginLoading(true);
      setError('');
      const result = await signInMutation.mutateAsync({
        email: form.email,
        password: form.password,
      });

      if (result.success && result.userId) {
        setAuth({
          userId: result.userId,
          roles: result.roles as Role[],
          activeRole: result.activeRole as Role,
          sessionToken: result.sessionToken,
        });

        if (result.activeRole === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/explore');
        }
      }
    } catch (err: any) {
      setError(err?.message ?? 'Sign in failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      const supabase = createAnonSupabaseClient();
      if (!supabase) {
        setError('Google sign-in is currently unavailable');
        setGoogleLoading(false);
        return;
      }
      const role = (pendingRole as 'tenant' | 'landlord' | 'agent') ?? 'tenant';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        },
      });
      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col justify-center py-12 px-6">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-center items-center mb-10">
          <h1 className="font-playfair italic font-black text-2xl text-terra">Awahouse</h1>
        </div>

        <div className="bg-white p-8 rounded-card shadow-card">
          <AnimatePresence mode="wait">
            {stage === 'details' || activeTab === 'login' ? (
              <motion.div
                key={`${activeTab}-details`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="flex border-b border-outline-variant mb-10">
                  <button
                    onClick={() => { setActiveTab('signup'); setStage('details'); setError(''); }}
                    className={cn(
                      'flex-1 pb-4 text-sm font-bold transition-all duration-200 relative',
                      activeTab === 'signup' ? 'text-terra-dark' : 'text-muted'
                    )}
                  >
                    Sign Up
                    {activeTab === 'signup' && (
                      <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-terra-dark" />
                    )}
                  </button>
                  <button
                    onClick={() => { setActiveTab('login'); setStage('details'); setError(''); }}
                    className={cn(
                      'flex-1 pb-4 text-sm font-bold transition-all duration-200 relative',
                      activeTab === 'login' ? 'text-terra-dark' : 'text-muted'
                    )}
                  >
                    Log In
                    {activeTab === 'login' && (
                      <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-terra-dark" />
                    )}
                  </button>
                </div>

                <h2 className="text-[22px] font-bold text-charcoal mb-2">
                  {activeTab === 'signup' ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="text-sm text-muted mb-8 leading-relaxed">
                  {activeTab === 'signup'
                    ? "Join Lagos's verified property marketplace today."
                    : "Sign in to continue your journey."}
                </p>

                {(error || urlError) && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                    {error || (urlError === 'auth_failed' ? 'Google sign-in failed. Please try again.' : urlError === 'no_email' ? 'No email returned from Google.' : urlError === 'supabase_not_configured' ? 'Google sign-in is not configured.' : 'Something went wrong.')}
                  </div>
                )}

                <div className="space-y-6">
                  {activeTab === 'signup' && (
                    <Input
                      label="Full Name (first name, surname)"
                      placeholder="Enter your legal name"
                      value={form.fullName}
                      onChangeValue={(val) => setForm({ ...form, fullName: val })}
                    />
                  )}

                  {activeTab === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-1.5">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <div className="h-[52px] px-4 rounded-input border border-outline-variant bg-sand/30 flex items-center justify-center font-sans font-bold text-charcoal text-sm">
                          +234
                        </div>
                        <Input
                          placeholder="803 000 0000"
                          value={form.phone}
                          onChangeValue={(val) => setForm({ ...form, phone: val })}
                          className="flex-1 bg-sand/30"
                        />
                      </div>
                    </div>
                  )}

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChangeValue={(val) => setForm({ ...form, email: val })}
                    className="bg-sand/30"
                  />

                  <div>
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={activeTab === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                      value={form.password}
                      onChangeValue={(val) => setForm({ ...form, password: val })}
                      className="bg-sand/30 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="relative float-right -mt-[42px] mr-3 text-muted hover:text-charcoal"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>

                    {activeTab === 'signup' && (
                      <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 px-1">
                        {passwordRequirements.map((req, i) => {
                          const isMet = req.test(form.password);
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <div className={cn(
                                "h-1 w-1 rounded-full transition-colors duration-300",
                                isMet ? "bg-success" : "bg-outline-variant"
                              )} />
                              <span className={cn(
                                "text-[10px] font-mono uppercase tracking-tight transition-colors duration-300",
                                isMet ? "text-success font-bold" : "text-muted"
                              )}>
                                {req.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {activeTab === 'signup' && (
                    <div className="bg-success-bg border border-success/25 rounded-xl p-4 flex gap-3">
                      <ShieldCheck className="text-success shrink-0" size={20} />
                      <div className="text-sm text-success leading-relaxed">
                        <span className="font-bold">NIN Verification Required</span>
                        <p className="opacity-80">Identity verified after account creation for security.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'signup' ? (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={sendOtpMutation.isPending}
                      onClick={handleSendOtp}
                      className="mt-4"
                    >
                      Create Account
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={loginLoading}
                      onClick={handleSignIn}
                      className="mt-4"
                    >
                      Log In
                    </Button>
                  )}

                  <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-[1px] bg-outline-variant/30" />
                    <span className="text-[10px] font-mono text-muted uppercase tracking-widest">— or —</span>
                    <div className="flex-1 h-[1px] bg-outline-variant/30" />
                  </div>

                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    loading={googleLoading}
                    onClick={handleGoogleSignIn}
                    className="bg-white border border-outline-variant text-charcoal hover:bg-gray-50"
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    }
                  >
                    Continue with Google
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 flex flex-col"
              >
                <h2 className="text-[22px] font-bold text-charcoal mb-2">Verify your email</h2>
                <p className="text-sm text-muted mb-8 leading-relaxed">
                  We've sent a 6-digit code to <span className="font-bold text-charcoal">{form.email}</span>.
                  Check your inbox (and spam) to continue.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <Input
                    label="Enter 6-digit code"
                    placeholder="000000"
                    maxLength={6}
                    value={otpCode}
                    onChangeValue={setOtpCode}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-[64px] bg-sand/30"
                  />

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={verifyOtpMutation.isPending}
                    disabled={otpCode.length !== 6}
                    onClick={handleVerifyOtp}
                  >
                    Verify & Continue
                  </Button>

                  <ResendOtpButton onClick={handleSendOtp} />

                  <button
                    onClick={() => setStage('details')}
                    className="w-full text-center text-sm font-bold text-muted hover:text-terra transition-colors"
                  >
                    ← Back to details
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage />
    </Suspense>
  );
}

function ResendOtpButton({ onClick }: { onClick: () => void }) {
  const [timer, setTimer] = React.useState(60);
  const [canResend, setCanResend] = React.useState(false);

  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleResend = () => {
    onClick();
    setTimer(60);
    setCanResend(false);
  };

  return (
    <div className="text-center text-sm">
      {canResend ? (
        <button onClick={handleResend} className="font-bold text-terra hover:underline">
          Resend code
        </button>
      ) : (
        <span className="text-muted">Resend code in {timer}s</span>
      )}
    </div>
  );
}
