import { z } from 'zod';

export const businessSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const businessOnboardingSchema = z.object({
  name: z.string().trim().min(1, 'Enter a business name.').max(100),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters.')
    .max(50, 'Slug must be 50 characters or fewer.')
    .regex(
      businessSlugPattern,
      'Use lowercase letters, numbers, and single hyphens only.'
    ),
  timezone: z.string().refine((timezone) => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }, 'Choose a valid IANA timezone.')
});

export function createBusinessSlug(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '');
}
