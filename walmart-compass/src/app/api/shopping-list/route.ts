import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { ActiveShoppingList } from '@/lib/supabase';

// GET - Retrieve user's active shopping list
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

    // Get the user's active shopping list
    const { data: shoppingList, error } = await supabase
      .from('active_shopping_lists')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching shopping list:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shopping list' },
        { status: 500 }
      );
    }

    // If no shopping list exists, return empty list
    if (!shoppingList) {
      return NextResponse.json({
        items: [],
        id: null
      });
    }

    return NextResponse.json({
      items: shoppingList.items || [],
      id: shoppingList.id
    });

  } catch (error) {
    console.error('Shopping list GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update user's active shopping list
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

    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items must be an array' },
        { status: 400 }
      );
    }

    // Check if user already has an active shopping list
    const { data: existingList } = await supabase
      .from('active_shopping_lists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingList) {
      // Update existing list
      const { data, error } = await supabase
        .from('active_shopping_lists')
        .update({ 
          items,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating shopping list:', error);
        return NextResponse.json(
          { error: 'Failed to update shopping list' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new list
      const { data, error } = await supabase
        .from('active_shopping_lists')
        .insert({
          user_id: user.id,
          items
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating shopping list:', error);
        return NextResponse.json(
          { error: 'Failed to create shopping list' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      items: result.items
    });

  } catch (error) {
    console.error('Shopping list POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Clear user's active shopping list
export async function DELETE(request: NextRequest) {
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

    // Delete the user's active shopping list
    const { error } = await supabase
      .from('active_shopping_lists')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting shopping list:', error);
      return NextResponse.json(
        { error: 'Failed to delete shopping list' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Shopping list cleared'
    });

  } catch (error) {
    console.error('Shopping list DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
