import { z } from 'zod';
import { businessLocalDateTimeToUtc } from '@/utils/dashboard/timezone';
import {
  validateWorkingHours,
  type WorkingHourRange
} from '@/utils/dashboard/working-hours';

const businessId = z.string().uuid();
const name = z.string().trim().min(1, 'Name is required.').max(120);

const rupeeAmount = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d{1,2})?$/, 'Enter a valid amount with up to two decimals.')
  .transform((value) => {
    const [whole, fraction = ''] = value.split('.');
    return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  })
  .refine(Number.isSafeInteger, 'Amount is too large.');

export const serviceInputSchema = z
  .object({
    businessId,
    id: z.string().uuid().optional(),
    name,
    description: z.string().trim().max(2000).nullable(),
    durationMinutes: z.coerce.number().int().positive().max(1440),
    priceRupees: rupeeAmount,
    depositRupees: rupeeAmount
  })
  .refine((service) => service.depositRupees <= service.priceRupees, {
    message: 'Deposit cannot be greater than the service price.',
    path: ['depositRupees']
  });

export const staffInputSchema = z.object({
  businessId,
  id: z.string().uuid().optional(),
  displayName: name,
  userId: z
    .union([z.literal(''), z.string().uuid()])
    .transform((id) => id || null)
});

export const businessSettingsSchema = z.object({
  businessId,
  name: z.string().trim().min(1, 'Business name is required.').max(100),
  timezone: z.string().refine((timezone) => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }, 'Choose a valid IANA timezone.')
});

export const workingHoursInputSchema = z
  .object({
    businessId,
    staffId: z.string().uuid(),
    ranges: z.array(
      z.object({
        day_of_week: z.number().int().min(0).max(6),
        start_time: z.string(),
        end_time: z.string()
      })
    )
  })
  .superRefine((value, context) => {
    const result = validateWorkingHours(value.ranges);
    if (!result.valid) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error,
        path: ['ranges']
      });
    }
  });

export const timeOffInputSchema = z
  .object({
    businessId,
    staffId: z.string().uuid(),
    startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
    endsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
    reason: z.string().trim().max(500)
  })
  .refine((value) => value.endsAt > value.startsAt, {
    message: 'End date and time must be after the start.',
    path: ['endsAt']
  });

export function toStoredWorkingHourRanges(ranges: WorkingHourRange[]) {
  return ranges.map((range) => ({
    day_of_week: range.day_of_week,
    start_time: range.start_time,
    end_time: range.end_time
  }));
}

export function convertTimeOffInput(
  startsAt: string,
  endsAt: string,
  timezone: string
) {
  const startUtc = businessLocalDateTimeToUtc(startsAt, timezone);
  const endUtc = businessLocalDateTimeToUtc(endsAt, timezone);
  if (new Date(endUtc) <= new Date(startUtc)) {
    throw new TypeError('End date and time must be after the start.');
  }
  return { startsAt: startUtc, endsAt: endUtc };
}
