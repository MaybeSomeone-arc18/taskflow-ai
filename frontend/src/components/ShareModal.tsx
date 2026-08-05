import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { Input } from './ui/Input';
import { Copy, Link, RotateCw, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Project, User } from '../types';
import { getProjectMembers, generateInvite } from '../services/projectService';
import { useAuth } from '../hooks/useAuth';

interface ShareModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onInviteGenerated: (token: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ project, isOpen, onClose, onInviteGenerated }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<{ userId: User; joinedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, project._id]);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectMembers(project._id);
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setGenerating(true);
    setError(null);
    try {
      const { token } = await generateInvite(project._id);
      onInviteGenerated(token);
    } catch (err: any) {
      setError(err.message || 'Failed to generate invite');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!project.invite?.token) return;
    const link = `${window.location.origin}/invite/${project.invite.token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inviteLink = project.invite?.token 
    ? `${window.location.origin}/invite/${project.invite.token}` 
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Project" subtitle="Manage members and sharing options." maxWidth="md">
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-content flex items-center gap-2">
            <Users className="h-4 w-4 text-content-muted" /> Project Members
          </h3>
          <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface divide-y divide-border-subtle max-h-60 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-sm text-content-muted">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="p-4 text-center text-sm text-content-muted">No members found.</div>
            ) : (
              members.map((member) => (
                <div key={member.userId._id} className="flex items-center justify-between p-3 hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={member.userId.avatarUrl} fallback={member.userId.fullName} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-content truncate">
                        {member.userId.fullName} 
                        {member.userId._id === project.createdBy && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Owner</span>}
                        {member.userId._id === user?._id && <span className="ml-2 text-[10px] bg-surface-hover text-content-muted border border-border-subtle px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">You</span>}
                      </p>
                      <p className="text-xs text-content-secondary truncate">{member.userId.email}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-content-muted shrink-0 text-right">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-content flex items-center gap-2">
            <Link className="h-4 w-4 text-content-muted" /> Invite Link
          </h3>
          <div className="flex items-center gap-2">
            <Input 
              value={inviteLink || 'No active link generated'} 
              readOnly 
              className="font-mono text-xs bg-surface text-content-muted flex-1"
            />
            {inviteLink && (
              <Button 
                variant="secondary" 
                onClick={handleCopy} 
                className="shrink-0"
                icon={copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                aria-label="Copy invite link"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
          </div>
          {user?._id === project.createdBy && (
            <div className="flex justify-end pt-1">
              <Button 
                variant="ghost" 
                size="sm"
                loading={generating}
                icon={<RotateCw className={`h-3 w-3 ${generating ? 'animate-spin' : ''}`} />}
                onClick={handleGenerateLink}
              >
                {inviteLink ? 'Generate New Link' : 'Generate Link'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
