import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(50, 'Name must be under 50 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const watchPassword = watch('password', '');
  
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(4, score);
  };

  const strength = getPasswordStrength(watchPassword);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await registerUser(data.fullName, data.email, data.password);
      setSuccessMsg('Account created! Loading your workspace...');
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setIsSubmitting(false);
    }
  };

  return (
    <Card glass className="border-border-subtle shadow-2xl">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-content">Create your account</CardTitle>
        <CardDescription>Start managing projects with AI-powered insights.</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Status messages */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger/10 p-3.5 text-sm text-danger mb-6">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-500 mb-6">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-content-muted uppercase tracking-widest block" htmlFor="fullName">
              Full name
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jane Rogers"
              disabled={isSubmitting}
              error={!!errors.fullName}
              leftIcon={<User className="h-4 w-4" />}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs text-danger flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-content-muted uppercase tracking-widest block" htmlFor="email">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              disabled={isSubmitting}
              error={!!errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-danger flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-content-muted uppercase tracking-widest block" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                disabled={isSubmitting}
                error={!!errors.password}
                leftIcon={<Lock className="h-4 w-4" />}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary transition-colors disabled:opacity-50"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {watchPassword.length > 0 && (
              <div className="pt-1 flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div 
                    key={level} 
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      level <= strength 
                        ? strength < 2 
                          ? 'bg-red-500' 
                          : strength < 3 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                        : 'bg-border-subtle'
                    }`}
                  />
                ))}
              </div>
            )}

            {errors.password && (
              <p className="text-xs text-danger flex items-center gap-1 mt-1">
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
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col border-t border-border-subtle mt-2 pt-6 pb-6">
        <p className="text-center text-xs text-content-secondary mb-4">
          By creating an account, you agree to our{' '}
          <span className="text-content hover:text-primary cursor-pointer transition-colors">Terms of Service</span> and{' '}
          <span className="text-content hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>.
        </p>
        <p className="text-center text-sm text-content-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Register;
