import { createClient } from '@backend/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { getPostAuthPath } from '@backend/businesses/access';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          'Sign in failed.',
          'Please try signing in again.'
        )
      );
    }

    try {
      const destination = await getPostAuthPath(supabase, user.id);
      return NextResponse.redirect(
        getStatusRedirect(
          `${requestUrl.origin}${destination}`,
          'Success!',
          'You are now signed in.'
        )
      );
    } catch (membershipError) {
      console.error(membershipError);
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          'Could not load your business.',
          'Please try signing in again.'
        )
      );
    }
  }

  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}/signin`,
      'Sign in failed.',
      'The authentication link is missing its sign-in code.'
    )
  );
}
