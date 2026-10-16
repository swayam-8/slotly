'use server';

import { createClient } from '@backend/lib/supabase/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import {
  businessOnboardingSchema,
  businessSlugPattern
} from '@/utils/businesses/validation';

type SlugCheckResult =
  | { available: true }
  | { available: false; message: string };

export async function checkBusinessSlug(
  slug: string
): Promise<SlugCheckResult> {
  if (!businessSlugPattern.test(slug) || slug.length < 3 || slug.length > 50) {
    return { available: false, message: 'Enter a valid slug first.' };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('Could not check the signed-in user:', authError);
      return {
        available: false,
        message: 'Could not verify your sign-in. Check your connection.'
      };
    }

    if (!user) {
      return { available: false, message: 'Sign in to check this slug.' };
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Business slug availability check failed:', error);
      return {
        available: false,
        message: 'Could not check slug availability. Please try again.'
      };
    }

    return data
      ? { available: false, message: 'This slug is already in use.' }
      : { available: true };
  } catch (error) {
    console.error('Business slug availability request failed:', error);
    return {
      available: false,
      message: 'Could not check slug availability. Check your connection.'
    };
  }
}

export async function createBusiness(formData: FormData) {
  const parsed = businessOnboardingSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    timezone: formData.get('timezone')
  });

  if (!parsed.success) {
    return getErrorRedirect(
      '/onboarding',
      'Check your business details.',
      parsed.error.issues[0]?.message ?? 'Please review the form and try again.'
    );
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('Could not check the signed-in user:', authError);
    return getErrorRedirect(
      '/onboarding',
      'Connection problem.',
      'Could not verify your sign-in. Check your connection and try again.'
    );
  }

  if (!user) {
    return getErrorRedirect(
      '/signin',
      'You must be signed in.',
      'Sign in before creating a business.'
    );
  }

  try {
    const { data: businessId, error } = await supabase.rpc(
      'create_business_with_owner_membership',
      {
        p_name: parsed.data.name,
        p_slug: parsed.data.slug,
        p_timezone: parsed.data.timezone
      }
    );

    if (error) {
      console.error('Business creation failed:', error);

      if (error.code === '23505') {
        return getErrorRedirect(
          '/onboarding',
          'That slug is already taken.',
          'Choose a different public address for your business.'
        );
      }

      if (error.code === '28000') {
        return getErrorRedirect(
          '/signin',
          'You must be signed in.',
          'Sign in before creating a business.'
        );
      }

      return getErrorRedirect(
        '/onboarding',
        'Business creation failed.',
        'Please try again. Your business was not created.'
      );
    }

    if (!businessId) {
      console.error('Business creation returned no business ID.');
      return getErrorRedirect(
        '/onboarding',
        'Business creation failed.',
        'Please try again. Your business was not created.'
      );
    }

    return getStatusRedirect(
      '/dashboard',
      'Business created.',
      'Your business is ready.'
    );
  } catch (error) {
    console.error('Business creation request failed:', error);
    return getErrorRedirect(
      '/onboarding',
      'Connection problem.',
      'The business could not be created. Check your connection and try again.'
    );
  }
}

export async function createBusinessForWizard(input: {
  name: string;
  slug: string;
  timezone: string;
}) {
  const parsed = businessOnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Check your business details.'
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError) {
      console.error('Could not verify onboarding session:', authError);
      return {
        success: false as const,
        error: 'Could not verify sign-in. Please retry.'
      };
    }
    if (!user) {
      return {
        success: false as const,
        error: 'Sign in before creating a business.'
      };
    }

    const { data: businessId, error } = await supabase.rpc(
      'create_business_with_owner_membership',
      {
        p_name: parsed.data.name,
        p_slug: parsed.data.slug,
        p_timezone: parsed.data.timezone
      }
    );
    if (error) {
      console.error('Business creation in onboarding wizard failed:', error);
      return {
        success: false as const,
        error:
          error.code === '23505'
            ? 'That public page address is already taken. Choose another one.'
            : 'Could not create your business. Check your connection and try again.'
      };
    }
    if (!businessId) {
      console.error('Onboarding RPC returned no business ID.');
      return {
        success: false as const,
        error: 'Business creation did not complete. Please retry.'
      };
    }
    return { success: true as const, businessId };
  } catch (error) {
    console.error('Business setup request failed:', error);
    return {
      success: false as const,
      error: 'Connection problem. Check your network and try again.'
    };
  }
}
