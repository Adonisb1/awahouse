'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck, CheckCircle2, Key, CreditCard, FileText, AlertCircle,
  User, Building, Phone, Mail, ChevronLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip } from '@/components/escrow/EscrowStatusChip';
import { trpc } from '@/lib/trpc/react';

type EscrowStatus =
  | 'pending_payment' | 'funds_held' | 'docs_verified'
  | 'key_handover_pending' | 'disputed' | 'completed'
  | 'refunded' | 'cancelled';

const STATUS_ORDER: Record<string, number> = {
  pending_payment: 0,
  funds_held: 1,
  docs_verified: 2,
  key_handover_pending: 3,
  completed: 4,
};

const TERMINAL: Record<string, number | null> = {
  completed: 4,
  refunded: null,
  cancelled: null,
};

function getStepState(
  stepKey: string, currentIdx: number, terminalIdx: number | null
): 'done' | 'current' | 'upcoming' {
  const stepIdx = STATUS_ORDER[stepKey];
  if (stepIdx === undefined) return 'upcoming';
  if (terminalIdx !== null) {
    if (typeof terminalIdx === 'number' && stepIdx <= terminalIdx) return 'done';
    if (stepIdx <= currentIdx) return 'done';
    return 'upcoming';
  }
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'current';
  return 'upcoming';
}

function DoubleConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  variant,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant: 'primary' | 'danger';
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="mx-4 w-full max-w-md">
        <CardContent className="pt-6">
          <h3 className="font-display text-lg font-bold text-charcoal mb-2">{title}</h3>
          <p className="font-body text-sm text-charcoal/60 mb-6">{description}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={variant}
              size="sm"
              loading={loading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminEscrowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const escrowId = params.id as string;

  const utils = trpc.useUtils();

  const { data: escrow, isLoading } = trpc.admin.getEscrowDetail.useQuery({ escrowId });
  const markDocsVerified = trpc.admin.markDocsVerified.useMutation({
    onSuccess: () => { utils.admin.getEscrowDetail.invalidate(); utils.admin.listEscrows.invalidate(); },
  });
  const markHandoverPending = trpc.admin.markHandoverPending.useMutation({
    onSuccess: () => { utils.admin.getEscrowDetail.invalidate(); utils.admin.listEscrows.invalidate(); },
  });
  const resolveDispute = trpc.admin.resolveDispute.useMutation({
    onSuccess: () => { utils.admin.getEscrowDetail.invalidate(); utils.admin.listEscrows.invalidate(); },
  });
  const releaseFunds = trpc.admin.releaseFunds.useMutation({
    onSuccess: () => { utils.admin.getEscrowDetail.invalidate(); utils.admin.listEscrows.invalidate(); },
  });

  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    description: string;
    confirmLabel: string;
    variant: 'primary' | 'danger';
    action: () => void;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="py-16 text-center">
        <p className="font-body text-charcoal/40">Escrow not found</p>
        <Button className="mt-4" variant="secondary" onClick={() => router.push('/escrows')}>
          Back to Escrows
        </Button>
      </div>
    );
  }

  const status = escrow.status as EscrowStatus;
  const currentIdx = STATUS_ORDER[status] ?? -1;
  const terminalIdx = TERMINAL[status] ?? (status === 'disputed' ? currentIdx : null);

  return (
    <div>
      <button
        onClick={() => router.push('/escrows')}
        className="flex items-center gap-1 text-sm text-charcoal/40 hover:text-charcoal/60 mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Escrows
      </button>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="font-display text-2xl italic font-black text-charcoal">
          Escrow {escrow.paymentReference ?? escrowId.slice(0, 8)}
        </h1>
        <EscrowStatusChip status={status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-display text-lg font-bold text-charcoal">Timeline</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between px-2">
              {[
                { key: 'funds_held', label: 'Funds Secured', icon: CreditCard },
                { key: 'docs_verified', label: 'Docs Verified', icon: FileText },
                { key: 'key_handover_pending', label: 'Handover', icon: Key },
                { key: 'completed', label: 'Completed', icon: CheckCircle2 },
              ].map((step, idx) => {
                const state = getStepState(step.key, currentIdx, terminalIdx);
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        state === 'done'
                          ? 'bg-success-bg text-success'
                          : state === 'current'
                            ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                            : 'bg-gray-100 text-gray-300'
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-xs font-medium text-center ${
                        state === 'done' ? 'text-success' : state === 'current' ? 'text-blue-700' : 'text-gray-300'
                      }`}
                    >
                      {step.label}
                    </span>
                    {idx < 3 && (
                      <div
                        className={`hidden sm:block absolute h-0.5 top-5 left-[60%] w-full -z-10 ${
                          state === 'done' || (state === 'current' && idx < currentIdx)
                            ? 'bg-success'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-bold text-charcoal">Summary</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wider mb-1">Amount</p>
              <KoboDisplay kobo={Number(escrow.amountKobo)} size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-charcoal/40 uppercase tracking-wider">Fee</p>
                <KoboDisplay kobo={Number(escrow.platformFeeKobo)} size="sm" color="muted" />
              </div>
              <div>
                <p className="text-xs text-charcoal/40 uppercase tracking-wider">Payout</p>
                <KoboDisplay kobo={Number(escrow.landlordPayoutKobo)} size="sm" />
              </div>
            </div>
            {escrow.rentMonthly && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-charcoal/40 uppercase tracking-wider">Rent Monthly</p>
                <p className="text-sm font-bold text-charcoal">Yes — 12 instalments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {status === 'disputed' && escrow.disputeReason && (
        <Card className="mb-6 border-red-200 bg-red-50/30">
          <CardHeader>
            <h2 className="font-display text-lg font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Dispute Reason
            </h2>
          </CardHeader>
          <CardContent>
            <p className="font-body text-sm text-charcoal/80">{escrow.disputeReason}</p>
            {escrow.disputedAt && (
              <p className="text-xs text-charcoal/40 mt-2">
                Raised {new Date(escrow.disputedAt).toLocaleString('en-GB')}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-bold text-charcoal flex items-center gap-2">
              <Building className="h-4 w-4" />
              Property
            </h2>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold text-charcoal">{escrow.property.title}</p>
            <p className="text-sm text-charcoal/60">{escrow.property.lga}</p>
            <p className="text-sm text-charcoal/60">{escrow.property.address}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-bold text-charcoal flex items-center gap-2">
              <User className="h-4 w-4" />
              Tenant
            </h2>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold text-charcoal">
              {escrow.tenant.firstName} {escrow.tenant.lastName}
            </p>
            <p className="text-sm text-charcoal/60 flex items-center gap-1">
              <Mail className="h-3 w-3" /> {escrow.tenant.email}
            </p>
            {escrow.tenant.phone && (
              <p className="text-sm text-charcoal/60 flex items-center gap-1">
                <Phone className="h-3 w-3" /> {escrow.tenant.phone}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-bold text-charcoal flex items-center gap-2">
              <User className="h-4 w-4" />
              Landlord
            </h2>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold text-charcoal">
              {escrow.landlord.firstName} {escrow.landlord.lastName}
            </p>
            <p className="text-sm text-charcoal/60 flex items-center gap-1">
              <Mail className="h-3 w-3" /> {escrow.landlord.email}
            </p>
            {escrow.landlord.phone && (
              <p className="text-sm text-charcoal/60 flex items-center gap-1">
                <Phone className="h-3 w-3" /> {escrow.landlord.phone}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {status === 'funds_held' || status === 'docs_verified' || status === 'key_handover_pending' || status === 'disputed' ? (
        <Card className="mb-8 border-blue-200">
          <CardHeader>
            <h2 className="font-display text-lg font-bold text-charcoal">Admin Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {status === 'funds_held' && (
                <Button
                  loading={markDocsVerified.isPending}
                  onClick={() => setConfirmAction({
                    title: 'Verify Documents',
                    description: 'Mark property documents as verified. This will move the escrow to the next stage.',
                    confirmLabel: 'Verify',
                    variant: 'primary',
                    action: () => markDocsVerified.mutateAsync({ escrowId }).then(() => setConfirmAction(null)),
                  })}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Verify Documents
                </Button>
              )}

              {status === 'docs_verified' && (
                <Button
                  loading={markHandoverPending.isPending}
                  onClick={() => setConfirmAction({
                    title: 'Mark Handover Pending',
                    description: 'Confirm documents are in order and key handover can proceed. A 48-hour auto-release timer will start.',
                    confirmLabel: 'Mark Handover Pending',
                    variant: 'primary',
                    action: () => markHandoverPending.mutateAsync({ escrowId }).then(() => setConfirmAction(null)),
                  })}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Mark Handover Pending
                </Button>
              )}

              {status === 'key_handover_pending' && (
                <Button
                  loading={releaseFunds.isPending}
                  variant="primary"
                  onClick={() => setConfirmAction({
                    title: 'Force Complete Escrow?',
                    description: 'This will release funds to the landlord immediately. The tenant has not confirmed handover. Only do this if handover has been verified.',
                    confirmLabel: 'Release Funds',
                    variant: 'primary',
                    action: () => releaseFunds.mutateAsync({ escrowId }).then(() => setConfirmAction(null)),
                  })}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Force Complete
                </Button>
              )}

              {status === 'disputed' && (
                <>
                  <Button
                    loading={resolveDispute.isPending}
                    variant="primary"
                    onClick={() => setConfirmAction({
                      title: 'Release to Landlord?',
                      description: 'Resolve dispute in favour of the landlord. Funds will be released and the escrow marked as completed.',
                      confirmLabel: 'Release to Landlord',
                      variant: 'primary',
                      action: () => resolveDispute.mutateAsync({ escrowId, outcome: 'completed' }).then(() => setConfirmAction(null)),
                    })}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Release to Landlord
                  </Button>
                  <Button
                    loading={resolveDispute.isPending}
                    variant="danger"
                    onClick={() => setConfirmAction({
                      title: 'Refund Tenant?',
                      description: 'Resolve dispute in favour of the tenant. All funds will be refunded to the tenant.',
                      confirmLabel: 'Refund Tenant',
                      variant: 'danger',
                      action: () => resolveDispute.mutateAsync({ escrowId, outcome: 'refunded' }).then(() => setConfirmAction(null)),
                    })}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Refund Tenant
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-display text-lg font-bold text-charcoal">Payment Info</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wider">Provider</p>
              <p className="text-sm font-semibold text-charcoal mt-1 capitalize">{escrow.paymentProvider}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wider">Reference</p>
              <p className="text-sm font-mono text-charcoal/80 mt-1 break-all">{escrow.paymentReference ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wider">Access Code</p>
              <p className="text-sm font-mono text-charcoal/80 mt-1 break-all">{escrow.paymentAccessCode ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wider">Created</p>
              <p className="text-sm text-charcoal/80 mt-1">
                {new Date(escrow.createdAt).toLocaleString('en-GB')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-bold text-charcoal">Audit Log</h2>
        </CardHeader>
        <CardContent>
          {escrow.logs.length === 0 ? (
            <p className="text-sm text-charcoal/40 py-4 text-center">No log entries</p>
          ) : (
            <div className="space-y-3">
              {escrow.logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-charcoal/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-charcoal/40">
                        {log.fromStatus}
                      </span>
                      <span className="text-charcoal/20">→</span>
                      <span className="text-xs font-mono font-bold uppercase" style={{
                        color: log.toStatus === 'completed' ? '#1A5C30' :
                               log.toStatus === 'refunded' || log.toStatus === 'cancelled' ? '#6B7280' :
                               log.toStatus === 'disputed' ? '#DC2626' : '#C4531C',
                      }}>
                        {log.toStatus}
                      </span>
                    </div>
                    {log.reason && (
                      <p className="text-sm text-charcoal/60 mt-0.5">{log.reason}</p>
                    )}
                    <p className="text-xs text-charcoal/30 mt-0.5">
                      {new Date(log.createdAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DoubleConfirmModal
        open={confirmAction !== null}
        title={confirmAction?.title ?? ''}
        description={confirmAction?.description ?? ''}
        confirmLabel={confirmAction?.confirmLabel ?? ''}
        variant={confirmAction?.variant ?? 'primary'}
        loading={markDocsVerified.isPending || markHandoverPending.isPending || resolveDispute.isPending || releaseFunds.isPending}
        onConfirm={() => confirmAction?.action()}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
