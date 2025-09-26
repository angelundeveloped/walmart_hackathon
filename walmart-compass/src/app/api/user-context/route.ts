import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Retrieve user's context (preferences and shopping history)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile with preferences
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Get recent shopping history
    const { data: shoppingHistory, error: historyError } = await supabase
      .from('shopping_history')
      .select('items, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error fetching shopping history:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch shopping history' },
        { status: 500 }
      );
    }

    // Transform shopping history to match RAG system format
    const transformedHistory = (shoppingHistory || []).map(entry => ({
      items: entry.items.map((item: { name: string }) => item.name),
      date: entry.created_at,
      context: 'Completed shopping trip'
    }));

    return NextResponse.json({
      preferences: profile?.preferences || {
        dietaryRestrictions: [],
        brandPreferences: [],
        organicPreference: false
      },
      shoppingHistory: transformedHistory
    });

  } catch (error) {
    console.error('User context GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update user preferences
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { preferences } = await request.json();

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Preferences object is required' },
        { status: 400 }
      );
    }

    // Update user preferences
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ preferences })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: data.preferences
    });

  } catch (error) {
    console.error('User context POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
