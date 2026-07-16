import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await login(data.email, data.password);
      setSuccessMsg('Access granted — loading your workspace...');
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
        <p className="text-sm text-zinc-500">Sign in to your TaskFlow AI workspace.</p>
      </div>

      {/* Status messages */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 p-3.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3.5 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block" htmlFor="email">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              disabled={isSubmitting}
              {...register('email')}
              className={[
                'field-base pl-10',
                errors.email ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : '',
              ].join(' ')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <span className="text-xs text-zinc-600 cursor-not-allowed select-none">Forgot password?</span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••"
              disabled={isSubmitting}
              {...register('password')}
              className={[
                'field-base pl-10 pr-11',
                errors.password ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : '',
              ].join(' ')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-50"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full mt-2"
          iconRight={!isSubmitting ? <ArrowRight className="h-4 w-4" /> : undefined}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-zinc-500 border-t border-zinc-800/60 pt-5">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
};

export default Login;
