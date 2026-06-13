'use client';

import * as React from 'react';
import { Building, CreditCard } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LandlordSettingsPage() {
  const [form, setForm] = React.useState({
    firmName: '',
    bankName: '',
    accountNumber: '',
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-sand">
      <TopNav variant="back" title="Settings" />
      <div className="max-w-xl mx-auto px-4 py-8">
        
        {/* Firm Info */}
        <section className="bg-white border border-outline-variant rounded-card p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
             <Building className="text-terra" />
             <h2 className="font-playfair text-xl font-bold">Firm Information</h2>
          </div>
          <div className="space-y-4">
            <Input label="Firm Name" value={form.firmName} onChangeValue={(val) => setForm({...form, firmName: val})} />
          </div>
        </section>

        {/* Payout Info */}
        <section className="bg-white border border-outline-variant rounded-card p-6 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
             <CreditCard className="text-terra" />
             <h2 className="font-playfair text-xl font-bold">Payout Details</h2>
          </div>
          <div className="space-y-4">
            <Input label="Bank Name" value={form.bankName} onChangeValue={(val) => setForm({...form, bankName: val})} />
            <Input label="Account Number" value={form.accountNumber} onChangeValue={(val) => setForm({...form, accountNumber: val})} />
          </div>
        </section>

        <Button variant="primary" size="lg" fullWidth onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
