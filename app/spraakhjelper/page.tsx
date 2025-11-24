import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SpraakhjelpperClient from './spraakhjelper-client'

export default async function SpraakhjelpperPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/auth/login?redirect=/spraakhjelper')
  }

  return <SpraakhjelpperClient user={data.user} />
}

