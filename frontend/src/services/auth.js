import { supabase } from '../lib/supabase'

const origin = window.location.origin

// Turn Supabase errors into friendly messages (and never reveal whether an email exists).
function friendly(error) {
  const msg = (error?.message || '').toLowerCase()
  if (msg.includes('invalid login credentials')) return 'Incorrect email or password.'
  if (msg.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the link.'
  if (msg.includes('only request this after')) return 'Please wait a minute before asking for another link.'
  if (msg.includes('rate limit') || error?.status === 429) return 'Too many attempts. Please wait a few minutes and try again.'
  if (msg.includes('password')) return error.message
  return 'Something went wrong. Please try again.'
}

// `captchaToken` is optional until you turn on bot protection (Turnstile) in Supabase.
export async function registerUser(d) {
  const { error } = await supabase.auth.signUp({
    email: d.email.trim(),
    password: d.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      captchaToken: d.captchaToken,
      // Stored as user metadata; a database trigger copies the safe fields into `profiles`.
      data: {
        account_type: d.accountType,
        first_name: d.firstName, middle_name: d.middleName, last_name: d.lastName,
        business_name: d.businessName, country: d.country, referral: d.referral,
      },
    },
  })
  // If the email is already registered Supabase returns success without sending anything
  // (this protects privacy), so we show the same "check your email" screen either way.
  if (error) throw new Error(friendly(error))
  return { ok: true, email: d.email }
}

export async function resendVerification(email) {
  const { error } = await supabase.auth.resend({
    type: 'signup', email: email.trim(), options: { emailRedirectTo: `${origin}/auth/callback` },
  })
  if (error) throw new Error(friendly(error))
  return { ok: true }
}

export async function loginUser({ email, password, captchaToken }) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password, options: { captchaToken } })
  if (error) throw new Error(friendly(error))
}

export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin}/update-password` })
  if (error) throw new Error(friendly(error))
  return { ok: true }
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(friendly(error))
}

// Emails a one-time sign-in link. Someone with no account yet gets one created automatically;
// they only become signed in by opening the link, so this proves they own the email.
export async function sendSignInLink(email, next = '/dashboard/tickets') {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true, emailRedirectTo: `${origin}${next}` },
  })
  if (error) throw new Error(friendly(error))
}

// Used by /auth/confirm when the email template links straight to our site with a token hash.
export async function verifySignInLink(tokenHash, type) {
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
  if (error) throw new Error('This sign-in link has already been used or has expired.')
}
