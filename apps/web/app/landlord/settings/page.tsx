'use client';

import * as React from 'react';
import { Building, CreditCard, CheckCircle } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/react';

export default function LandlordSettingsPage() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.auth.getProfile.useQuery();

  const [form, setForm] = React.useState({
    firmName: '',
    bankName: '',
    bankCode: '',
    bankAccount: '',
  });
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (profile?.landlordProfile) {
      setForm({
        firmName: profile.landlordProfile.firmName ?? '',
        bankName: profile.landlordProfile.bankName ?? '',
        bankCode: profile.landlordProfile.bankCode ?? '',
        bankAccount: profile.landlordProfile.bankAccount ?? '',
      });
    } else if (profile) {
      setForm(prev => ({ ...prev }));
    }
  }, [profile]);

  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.getProfile.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      firmName: form.firmName || undefined,
      bankName: form.bankName || undefined,
      bankCode: form.bankCode || undefined,
      bankAccount: form.bankAccount || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-sand">
      <TopNav variant="back" title="Settings" />
      <div className="max-w-xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <section className="bg-white border border-outline-variant rounded-card p-6 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-6">
                 <Building className="text-terra" />
                 <h2 className="font-playfair text-xl font-bold">Firm Information</h2>
              </div>
              <div className="space-y-4">
                <Input
                  label="Firm Name"
                  value={form.firmName}
                  onChangeValue={(val) => setForm({...form, firmName: val})}
                />
              </div>
            </section>

            <section className="bg-white border border-outline-variant rounded-card p-6 shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-6">
                 <CreditCard className="text-terra" />
                 <h2 className="font-playfair text-xl font-bold">Payout Details</h2>
              </div>
              <div className="space-y-4">
                <Input
                  label="Bank Name"
                  value={form.bankName}
                  onChangeValue={(val) => setForm({...form, bankName: val})}
                />
                <Input
                  label="Bank Code (e.g. 011)"
                  value={form.bankCode}
                  onChangeValue={(val) => setForm({...form, bankCode: val})}
                />
                <Input
                  label="Account Number"
                  value={form.bankAccount}
                  onChangeValue={(val) => setForm({...form, bankAccount: val})}
                />
              </div>
            </section>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSave}
              loading={updateMutation.isPending}
            >
              {saved ? 'Saved!' : 'Save Settings'}
            </Button>

            {saved && (
              <div className="flex items-center gap-2 mt-4 text-sm text-success justify-center">
                <CheckCircle className="h-4 w-4" />
                Settings saved successfully
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
