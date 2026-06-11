'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Building2, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { useAuthStore, Role as StoreRole } from '@/hooks/useAuthStore';

type Role = 'TENANT' | 'LANDLORD' | 'AGENT';

interface RoleOption {
  id: Role;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const roles: RoleOption[] = [
  {
    id: 'TENANT',
    title: "I'm looking for a home",
    description: "Browse verified listings and pay rent monthly with ease.",
    icon: Home,
    color: 'text-terra',
    bgColor: 'bg-terra/10',
  },
  {
    id: 'LANDLORD',
    title: "I'm a landlord",
    description: "List your property and find verified tenants faster.",
    icon: Building2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    id: 'AGENT',
    title: "I'm a real estate agent",
    description: "Manage your listings and build trust with verified badges.",
    icon: UserCircle2,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100/50',
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const setPendingRole = useAuthStore((s) => s.setPendingRole);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      setPendingRole(selectedRole.toLowerCase() as StoreRole);
      router.push('/onboarding/signup');
    }
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-12">
          <p className="font-mono text-[11px] uppercase text-muted mb-3 tracking-widest">
            WELCOME TO AWAHOUSE
          </p>
          <h1 className="font-playfair text-4xl md:text-5xl text-charcoal leading-tight mb-4">
            How will you use <br />
            <span className="text-terra italic font-black">Awahouse?</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((role, index) => {
            const isSelected = selectedRole === role.id;
            const Icon = role.icon;

            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  'p-6 rounded-card border-2 transition-all duration-200 cursor-pointer flex flex-col items-center text-center bg-white h-full',
                  isSelected 
                    ? 'border-terra bg-terra-50 shadow-lg' 
                    : 'border-outline-variant hover:border-terra/30 hover:shadow-md'
                )}
              >
                <div className={cn('p-4 rounded-2xl mb-4', role.bgColor, role.color)}>
                  <Icon size={32} />
                </div>
                <h3 className="font-bold text-charcoal text-lg mb-2">{role.title}</h3>
                <p className="text-sm text-muted leading-relaxed flex-1">
                  {role.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full md:w-64"
            disabled={!selectedRole}
            onClick={handleContinue}
          >
            Continue →
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
