'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { trpc } from '@/lib/trpc/react';

const STATUS_TABS = [
  { label: 'All', value: undefined as string | undefined },
  { label: 'Pending', value: 'pending' as const },
  { label: 'Approved', value: 'approved' as const },
  { label: 'Rejected', value: 'rejected' as const },
];

type ActionTarget = { id: string; type: string; userName: string } | null;

export default function AdminVerificationsPage() {
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>(undefined);
  const [actionTarget, setActionTarget] = React.useState<ActionTarget>(null);
  const [rejectReason, setRejectReason] = React.useState('');
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.listVerifications.useQuery({
    status: statusFilter as 'pending' | 'approved' | 'rejected' | undefined,
    limit: 50,
  });

  const reviewMutation = trpc.verification.adminReview.useMutation({
    onSuccess: () => {
      setActionTarget(null);
      setRejectReason('');
      utils.admin.listVerifications.invalidate();
    },
  });

  const handleApprove = (target: ActionTarget) => {
    if (!target) return;
    reviewMutation.mutate({ verificationId: target.id, status: 'approved' });
  };

  const handleReject = () => {
    if (!actionTarget) return;
    reviewMutation.mutate({
      verificationId: actionTarget.id,
      status: 'rejected',
      reason: rejectReason || undefined,
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl italic font-black text-charcoal">Verifications</h1>
        <p className="font-body text-sm text-charcoal/60 mt-1">Agent NIN, professional body, and property document checks</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => {
          const active = tab.value === statusFilter || (!tab.value && !statusFilter);
          return (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                active
                  ? 'bg-charcoal-deep text-white'
                  : 'bg-gray-100 text-charcoal/60 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <div className="py-16 text-center">
              <p className="font-body text-charcoal/40">No verifications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-charcoal/40 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">User</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((v) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-charcoal">
                          {v.user.firstName} {v.user.lastName}
                        </p>
                        <p className="text-xs text-charcoal/40">{v.user.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs uppercase text-charcoal/60">
                          {v.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={v.status === 'approved' ? 'fully_verified' : v.status === 'rejected' ? 'pending' : 'pending'}>
                          {v.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-charcoal/40 text-xs whitespace-nowrap">
                        {new Date(v.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {v.status === 'pending' && v.documentUrl && (
                            <a
                              href={v.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-terra-dark hover:underline font-medium"
                            >
                              View Doc
                            </a>
                          )}
                          {v.status === 'pending' && (
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="sm"
                                onClick={() => setActionTarget({ id: v.id, type: v.type, userName: v.user.firstName ?? '' })}
                                disabled={reviewMutation.isPending}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setActionTarget({ id: v.id, type: v.type, userName: v.user.firstName ?? '' })}
                                disabled={reviewMutation.isPending}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {v.status !== 'pending' && v.metadata && typeof v.metadata === 'object' && 'reviewReason' in v.metadata && v.metadata.reviewReason && (
                            <span className="text-xs text-charcoal/40 italic ml-2">
                              {String(v.metadata.reviewReason)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setActionTarget(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-charcoal mb-1">
              Review Verification
            </h3>
            <p className="text-sm text-charcoal/60 mb-2">
              <span className="font-medium capitalize">{actionTarget.type.replace(/_/g, ' ')}</span> &mdash; {actionTarget.userName}
            </p>

            <div className="flex flex-col gap-3 mt-4">
              <Button
                onClick={() => handleApprove(actionTarget)}
                loading={reviewMutation.isPending}
              >
                Approve
              </Button>

              <div className="border-t border-gray-100 pt-3">
                <Input
                  label="Rejection reason (optional)"
                  placeholder="E.g. Expired certificate, name mismatch..."
                  value={rejectReason}
                  onChangeValue={setRejectReason}
                />
                <Button
                  variant="secondary"
                  className="w-full mt-2"
                  onClick={handleReject}
                  loading={reviewMutation.isPending}
                >
                  Reject{rejectReason ? ' with reason' : ''}
                </Button>
              </div>

              <button
                onClick={() => { setActionTarget(null); setRejectReason(''); }}
                className="text-sm text-charcoal/40 hover:text-charcoal/60 text-center mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
