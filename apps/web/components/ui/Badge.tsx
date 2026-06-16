import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-body',
  {
    variants: {
      variant: {
        fully_verified: 'bg-success-bg text-success',
        title_confirmed: 'bg-success-bg text-success',
        agent_verified: 'bg-orange-100 text-orange-700',
        pending: 'bg-gray-100 text-gray-600',
        default: 'bg-surface-warm text-charcoal',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
