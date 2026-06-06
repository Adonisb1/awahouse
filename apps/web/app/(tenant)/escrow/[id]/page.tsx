'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const TIMELINE = [
  { status: 'pending_payment', label: 'Payment Initiated', done: true },
  { status: 'funds_held', label: 'Funds Held in Escrow', done: true },
  { status: 'docs_verified', label: 'Documents Verified', done: true },
  { status: 'key_handover_pending', label: 'Key Handover', done: false, active: true },
  { status: 'completed', label: 'Completed', done: false },
];

const DETAILS = {
  id: '1',
  propertyTitle: 'Modern 3-Bedroom Apartment in Ikeja',
  landlord: 'Chidi Okonkwo',
  amount: '₦2,500,000',
  status: 'key_handover_pending',
  lga: 'Ikeja',
  createdAt: '2026-06-04',
};

export default function EscrowDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl italic font-black text-charcoal">{DETAILS.propertyTitle}</h1>
        <p className="font-body text-charcoal/60">Escrow {id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="font-body text-sm text-charcoal/60">Amount</p>
            <p className="font-display text-2xl font-bold text-charcoal">{DETAILS.amount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-body text-sm text-charcoal/60">Landlord</p>
            <p className="font-body text-lg font-semibold text-charcoal">{DETAILS.landlord}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-body text-sm text-charcoal/60">Status</p>
            <Badge variant="pending">{DETAILS.status === 'key_handover_pending' ? 'Awaiting Handover' : DETAILS.status}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="font-display text-xl font-bold text-charcoal mb-4">Transaction Timeline</h2>
          <div className="flex flex-col gap-4">
            {TIMELINE.map((step) => (
              <div key={step.status} className="flex items-start gap-3">
                <div className={`mt-1 h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                  step.done ? 'bg-success border-success' : step.active ? 'bg-primary border-primary' : 'bg-white border-charcoal/20'
                }`} />
                <div>
                  <p className={`font-body font-medium ${step.done || step.active ? 'text-charcoal' : 'text-charcoal/40'}`}>
                    {step.label}
                  </p>
                  {step.active && (
                    <p className="font-body text-sm text-primary">Current step</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button>Confirm Handover</Button>
        <Button variant="outline" className="text-red-500 border-red-200">Raise Dispute</Button>
      </div>
    </div>
  );
}
