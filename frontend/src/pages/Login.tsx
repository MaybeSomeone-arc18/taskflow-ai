import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, ArrowRight, UserCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { GoogleLogin } from '@react-oauth/google';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, loginWithGoogle, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Force state reset when route changes
  useEffect(() => {
    reset();
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowPassword(false);
  }, [location.pathname, reset]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        setSuccessMsg('Google login successful. Redirecting...');
        setTimeout(() => navigate(redirectUrl), 900);
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await loginAsGuest();
      setSuccessMsg('Guest session created. Redirecting...');
      setTimeout(() => navigate(redirectUrl), 900);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await login(data.email, data.password);
      setSuccessMsg('Access granted. Redirecting...');
      setTimeout(() => navigate(redirectUrl), 900);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setIsSubmitting(false);
    }
  };

  return (
    <Card glass className="border-border-subtle shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out" key={location.pathname}>
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-content text-center">Welcome back</CardTitle>
        <CardDescription className="text-center text-content-secondary">Sign in to continue managing your AI-powered projects.</CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Status messages */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger/10 p-3.5 text-sm text-danger mb-6 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-500 mb-6 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-center w-full transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Google login failed')}
              useOneTap
              theme="filled_blue"
              shape="pill"
              text="continue_with"
              width="320"
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full h-[40px] rounded-full border border-border transition-all duration-200 hover:bg-surface-hover hover:border-border-focus"
            onClick={handleGuestLogin}
            disabled={isSubmitting}
            icon={<UserCircle2 className="h-5 w-5 mr-1" />}
          >
            Continue as Guest
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-2 text-content-muted">Or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-content block" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              disabled={isSubmitting}
              error={!!errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              className="focus:ring-primary/20 transition-all duration-200"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-danger flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="h-3 w-3" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-content" htmlFor="password">
                Password
              </label>
              <span className="text-xs text-primary hover:text-primary-hover cursor-pointer transition-colors">Forgot Password?</span>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                disabled={isSubmitting}
                error={!!errors.password}
                leftIcon={<Lock className="h-4 w-4" />}
                className="focus:ring-primary/20 transition-all duration-200"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary transition-colors disabled:opacity-50 outline-none focus-visible:text-primary"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-danger flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="h-3 w-3" /> {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            className="w-full mt-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            iconRight={!isSubmitting ? <ArrowRight className="h-4 w-4" /> : undefined}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col border-t border-border-subtle mt-2 pt-6 pb-6">
        <p className="text-center text-sm text-content-secondary">
          Don&apos;t have an account?{' '}
          <Link to={`/signup${location.search}`} className="font-semibold text-primary hover:text-primary-hover transition-colors">
            Create Account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Login;
