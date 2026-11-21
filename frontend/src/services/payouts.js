import { supabase } from '../lib/supabase'

// Calls the payout-account Edge Function (it holds the Bachs key)
async function call(body) {
  const { data, error } = await supabase.functions.invoke('payout-account', { body })
  if (error) {
    const status = error.context?.status
    if (status === 404 || error.name === 'FunctionsFetchError') throw new Error("Payout setup isn't switched on yet.")
    let msg = 'Something went wrong. Please try again.'
    try { const j = await error.context.json(); if (j?.error) msg = j.error } catch { /* keep generic message */ }
    throw new Error(msg)
  }
  return data
}

export async function getPayoutAccount() {
  const { data, error } = await supabase.from('payout_accounts').select('bank_name,account_last4,account_name,currency,verified_at,provider_status').maybeSingle()
  if (error) throw new Error('Could not load your payout account.')
  return data
}
export const listBanks = async () => (await call({ action: 'banks' })).banks
export const resolveAccount = async (bankCode, accountNumber) => (await call({ action: 'resolve', bank_code: bankCode, account_number: accountNumber })).account_name
export const savePayoutAccount = (bankCode, accountNumber) => call({ action: 'save', bank_code: bankCode, account_number: accountNumber })
