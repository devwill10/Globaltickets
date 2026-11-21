import { supabase } from '../lib/supabase'

// Organisers can also read tickets for their own events, so filter to tickets that belong to this person.
export async function listMyTickets(user) {
  const email = (user.email || '').toLowerCase()
  const { data, error } = await supabase.from('tickets')
    .select('id,code,status,holder_name,holder_email,created_at,tier:ticket_tiers(name,ticket_kind,group_size),event:events(id,title,starts_at,ends_at,venue,timezone,image_url)')
    .or(`buyer_id.eq.${user.id},buyer_email.eq."${email}",holder_email.eq."${email}"`)
    .neq('status', 'cancelled').order('created_at', { ascending: false })
  if (error) throw error
  return data
}
