import Link from 'next/link';
import { CalendarDays, ShieldCheck } from 'lucide-react';
import { createClient } from '@backend/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getAuthTypes,
  getViewTypes,
  getDefaultSignInView,
  getRedirectMethod
} from '@/utils/auth-helpers/settings';
import Card from '@/components/ui/Card';
import PasswordSignIn from '@/components/ui/AuthForms/PasswordSignIn';
import EmailSignIn from '@/components/ui/AuthForms/EmailSignIn';
import Separator from '@/components/ui/AuthForms/Separator';
import OauthSignIn from '@/components/ui/AuthForms/OauthSignIn';
import ForgotPassword from '@/components/ui/AuthForms/ForgotPassword';
import UpdatePassword from '@/components/ui/AuthForms/UpdatePassword';
import SignUp from '@/components/ui/AuthForms/Signup';
import { getPostAuthPath } from '@backend/businesses/access';

export default async function SignIn({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: {
    disable_button?: string;
    error?: string;
    message?: string;
    success?: string;
  };
}) {
  const { allowOauth, allowEmail, allowPassword } = getAuthTypes();
  const viewTypes = getViewTypes();
  const redirectMethod = getRedirectMethod();

  // Declare 'viewProp' and initialize with the default value
  let viewProp: string;

  // Assign url id to 'viewProp' if it's a valid string and ViewTypes includes it
  if (typeof params.id === 'string' && viewTypes.includes(params.id)) {
    viewProp = params.id;
  } else {
    const preferredSignInView =
      cookies().get('preferredSignInView')?.value || null;
    viewProp = getDefaultSignInView(preferredSignInView);
    return redirect(`/signin/${viewProp}`);
  }

  // Check if the user is already logged in and redirect to the account page if so
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && viewProp !== 'update_password') {
    return redirect(await getPostAuthPath(supabase, user.id));
  } else if (!user && viewProp === 'update_password') {
    return redirect('/signin');
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl items-center justify-center px-5 py-12 sm:px-8">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mx-auto mb-8 flex w-fit items-center gap-2.5 font-semibold"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground">
            <CalendarDays aria-hidden="true" className="size-5" />
          </span>
          <span className="text-lg">Slotly</span>
        </Link>
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Your business, in sync
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Welcome to Slotly
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in or create an account to manage your schedule.
          </p>
        </div>
        <Card
          title={
            viewProp === 'forgot_password'
              ? 'Reset Password'
              : viewProp === 'update_password'
                ? 'Update Password'
                : viewProp === 'signup'
                  ? 'Sign Up'
                  : 'Sign In'
          }
        >
          {searchParams.error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-danger/30 bg-danger-muted p-3 text-sm text-danger"
            >
              {searchParams.message ||
                'Please check your details and try again.'}
            </p>
          )}
          {searchParams.success && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-success-muted p-3 text-sm text-success"
            >
              {searchParams.message || 'Your request was successful.'}
            </p>
          )}
          {viewProp === 'password_signin' && (
            <PasswordSignIn
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
            />
          )}
          {viewProp === 'email_signin' && (
            <EmailSignIn
              allowPassword={allowPassword}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button === 'true'}
            />
          )}
          {viewProp === 'forgot_password' && (
            <ForgotPassword
              allowEmail={allowEmail}
              redirectMethod={redirectMethod}
              disableButton={searchParams.disable_button === 'true'}
            />
          )}
          {viewProp === 'update_password' && (
            <UpdatePassword redirectMethod={redirectMethod} />
          )}
          {viewProp === 'signup' && (
            <SignUp allowEmail={allowEmail} redirectMethod={redirectMethod} />
          )}
          {viewProp !== 'update_password' &&
            viewProp !== 'signup' &&
            allowOauth && (
              <>
                <Separator text="Third-party sign-in" />
                <OauthSignIn />
              </>
            )}
        </Card>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 text-success" />
          Your account is protected with secure sign-in.
        </p>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          <Link className="hover:text-brand hover:underline" href="/">
            Back to Slotly
          </Link>
        </p>
      </div>
    </div>
  );
}
