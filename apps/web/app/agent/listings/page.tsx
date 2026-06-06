'use client';

import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const STUB_LISTINGS = [
  { id: '1', title: 'Cozy Studio in Surulere', lga: 'Surulere', status: 'agent_verified', price: '₦800,000' },
  { id: '2', title: '2-Bedroom Bungalow in Agege', lga: 'Agege', status: 'pending', price: '₦1,200,000' },
];

export default function AgentListingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl italic font-black text-charcoal">Client Listings</h1>
          <p className="font-body text-charcoal/60">Properties managed on behalf of landlords</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> New listing</Button>
      </div>

      <div className="flex flex-col gap-3">
        {STUB_LISTINGS.map((listing) => (
          <Card key={listing.id}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-charcoal">{listing.title}</h3>
                <p className="font-body text-sm text-charcoal/60">{listing.lga} &middot; {listing.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={listing.status === 'agent_verified' ? 'agent_verified' : 'pending'}>
                  {listing.status === 'agent_verified' ? 'Agent Verified' : 'Pending'}
                </Badge>
                <button className="p-2 text-charcoal/40 hover:text-primary transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-charcoal/40 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
