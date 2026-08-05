import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { joinProject } from '../services/projectService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      // Not logged in, redirect to login with the return URL
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }

    if (!token) {
      setStatus('error');
      setErrorMsg('Invalid invite link.');
      return;
    }

    const processJoin = async () => {
      try {
        const response = await joinProject(token);
        setProjectId(response.projectId);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Failed to join project. The link may have expired or is invalid.');
      }
    };

    processJoin();
  }, [isAuthLoading, isAuthenticated, token, navigate, location.pathname]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card glass className="border-border-subtle shadow-2xl">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <h2 className="text-lg font-semibold text-content">Joining project...</h2>
                <p className="text-sm text-content-secondary">Please wait while we verify your invitation.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold text-content">Successfully joined!</h2>
                <p className="text-sm text-content-secondary">You are now a member of this project.</p>
                <Button 
                  variant="primary" 
                  className="w-full mt-4"
                  onClick={() => navigate(`/projects/${projectId}`)}
                >
                  Go to Project
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="h-12 w-12 rounded-full bg-danger/10 flex items-center justify-center mb-2">
                  <AlertCircle className="h-6 w-6 text-danger" />
                </div>
                <h2 className="text-lg font-semibold text-content">Invalid Invitation</h2>
                <p className="text-sm text-content-secondary">{errorMsg}</p>
                <Button 
                  variant="secondary" 
                  className="w-full mt-4"
                  onClick={() => navigate('/')}
                >
                  Return to Dashboard
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InvitePage;
