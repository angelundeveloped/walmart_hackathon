import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(`${requestUrl.origin}?error=${error}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Session exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}?error=session_exchange_failed`)
      }

      if (data.session) {
        console.log('Session created successfully for:', data.session.user.email)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}?error=auth_callback_failed`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
