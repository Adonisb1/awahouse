# Plan: Fix Remaining Landlord Gaps

## 1. Sharp Resize — `server/services/PropertyService.ts`

**Goal:** Replace stub console.log with actual `sharp` resize calls. `sharp` is already in `package.json`.

### Changes:
1. Add import: `import sharp from 'sharp';` (after line 3, before the type imports)
2. Replace lines 222-227:
```typescript
// Current:
console.log(`[STUB Sharp] Resizing ${img.fileName} to 1920x1080 -> ${key}`);
console.log(`[STUB Sharp] Generating thumbnail 400x300 -> ${thumbKey}`);
await uploadFile(key, buffer, `image/${ext}`);
await uploadFile(thumbKey, buffer, `image/${ext}`);

// New:
const resized = await sharp(buffer)
  .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
  .webp()
  .toBuffer();
const thumbnail = await sharp(buffer)
  .resize(400, 300, { fit: 'cover' })
  .webp()
  .toBuffer();
await uploadFile(key, resized, 'image/webp');
await uploadFile(thumbKey, thumbnail, 'image/webp');
```

---

## 2. Lat/Lng Inputs — Two Files

### 2a. `app/landlord/listings/new/page.tsx`

1. Add to Zod schema (after `address` line):
```typescript
latitude: z.coerce.number().min(-90).max(90).optional(),
longitude: z.coerce.number().min(-180).max(180).optional(),
```
2. Add two number inputs to the form JSX (below the Address Input, before the Photos section):
```tsx
<div className="grid grid-cols-2 gap-4">
  <Input label="Latitude" type="number" step="any" placeholder="6.5244" {...register('latitude')} />
  <Input label="Longitude" type="number" step="any" placeholder="3.3792" {...register('longitude')} />
</div>
```
3. Add to the `onSubmit` mutation call:
```typescript
latitude: data.latitude,
longitude: data.longitude,
```

### 2b. `components/property/PropertyForm.tsx`

1. Add to `PropertyFormState`:
```typescript
latitude: number;
longitude: number;
```
2. Add to defaults: `latitude: 0, longitude: 0`
3. Add two number inputs after address in step 1:
```tsx
<div className="grid grid-cols-2 gap-4">
  <Input label="Latitude" type="number" step="any" placeholder="6.5244" value={String(form.latitude)} onChangeValue={(val) => setForm({...form, latitude: parseFloat(val) || 0})} />
  <Input label="Longitude" type="number" step="any" placeholder="3.3792" value={String(form.longitude)} onChangeValue={(val) => setForm({...form, longitude: parseFloat(val) || 0})} />
</div>
```

---

## 3. Verification Banner — `components/dashboard/LandlordDashboard.tsx`

1. Add import:
```typescript
import { VerificationBanner } from '@/components/dashboard/VerificationBanner';
```

2. Add verification query after the existing queries (around line 19):
```typescript
const { data: verifications } = trpc.verification.checkStatus.useQuery();
```

3. Derive status:
```typescript
const hasApproved = verifications?.verifications?.some(v => v.status === 'approved');
const verificationStatus = hasApproved ? 'verified' : 'pending';
```

4. Add the banner between error alert and stats grid (around the closing `}` of the error div at line ~55):
```tsx
<VerificationBanner status={verificationStatus} />
```

---

## 4. Send Reminders — Backend + Frontend

### 4a. `server/routers/rentInstalments.ts` — Add procedure

Add a new mutation:
```typescript
sendInstalmentReminders: landlordProcedure
  .input(z.object({ escrowId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: input.escrowId },
    });
    if (!escrow) throw new TRPCError({ code: 'NOT_FOUND' });
    if (escrow.landlordId !== ctx.userId) throw new TRPCError({ code: 'FORBIDDEN' });

    const overdue = await prisma.rentInstalment.findMany({
      where: { escrowId: input.escrowId, status: 'overdue' },
    });

    for (const inst of overdue) {
      await notificationService.sendInApp(
        escrow.tenantId,
        'Payment Reminder',
        `Your instalment #${inst.instalmentNumber} of ₦${Number(inst.amountKobo) / 100} is overdue. Please pay to avoid penalties.`,
        '/rent-instalments',
      );
    }

    return { success: true, remindersSent: overdue.length };
  })
```

Add imports at top:
```typescript
import { z } from 'zod';
import { prisma } from '@awahouse/db';
import { landlordProcedure } from '../trpc';
import { notificationService } from '../services/NotificationService';
```

### 4b. `app/landlord/instalments/[escrowId]/page.tsx` — Wire button

1. Add mutation:
```typescript
const sendReminders = trpc.rentInstalments.sendInstalmentReminders.useMutation();
```

2. Replace the `handleSendReminders` body:
```typescript
const handleSendReminders = async () => {
  if (overdue.length === 0) return;
  const result = await sendReminders.mutateAsync({ escrowId });
  // Optional: show success message
  utils.rentInstalments.getSchedule.invalidate({ escrowId });
};
```

---

## 5. Build & Verify

After all changes:
1. `npx tsc --noEmit --pretty`
2. `npx next lint`
3. `npm run build`
4. `cd ../../ && npx vitest run tests/server/services/escrow.test.ts`
5. `git add -A && git commit -m "feat(landlord): sharp resize, lat/lng inputs, verification banner, send reminders"`
6. `git push origin indev`
