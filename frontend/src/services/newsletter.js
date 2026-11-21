import { supabase } from '../lib/supabase'

export async function subscribeNewsletter(email) {
  const { error } = await supabase.rpc('subscribe_newsletter', { p_email: email })
  if (error) {
    if (error.message?.includes('invalid_email')) throw new Error('Please enter a valid email address.')
    throw new Error('Could not subscribe right now. Please try again.')
  }
}
