import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { ChatSession } from '@/lib/supabase';

// GET - Retrieve user's chat history
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

    // Get the user's chat sessions (most recent first)
    const { data: chatSessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10); // Get last 10 sessions

    if (error) {
      console.error('Error fetching chat history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessions: chatSessions || []
    });

  } catch (error) {
    console.error('Chat history GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save chat message to current session
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

    const { message, isUser, sessionId } = await request.json();

    if (!message || typeof isUser !== 'boolean') {
      return NextResponse.json(
        { error: 'Message and isUser are required' },
        { status: 400 }
      );
    }

    const newMessage = {
      id: crypto.randomUUID(),
      text: message,
      isUser,
      timestamp: new Date().toISOString()
    };

    let result;
    if (sessionId) {
      // Update existing session
      const { data: existingSession, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('messages')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching existing session:', fetchError);
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      const updatedMessages = [...(existingSession.messages || []), newMessage];

      const { data, error } = await supabase
        .from('chat_sessions')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating chat session:', error);
        return NextResponse.json(
          { error: 'Failed to update chat session' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          messages: [newMessage]
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        return NextResponse.json(
          { error: 'Failed to create chat session' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      sessionId: result.id,
      message: newMessage
    });

  } catch (error) {
    console.error('Chat history POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update entire chat session (for bulk operations)
export async function PUT(request: NextRequest) {
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

    const { sessionId, messages } = await request.json();

    if (!sessionId || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'SessionId and messages array are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .update({ 
        messages,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat session:', error);
      return NextResponse.json(
        { error: 'Failed to update chat session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session: data
    });

  } catch (error) {
    console.error('Chat history PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
