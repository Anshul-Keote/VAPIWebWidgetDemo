import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the private key from environment (server-side only)
    const privateKey = process.env.VAPI_PRIVATE_KEY;
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    if (!privateKey) {
      console.error('[Chat API] Missing VAPI_PRIVATE_KEY');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { input, previousChatId, assistantOverrides } = body;

    console.log('[Chat API] Proxying request to VAPI:', {
      input: input?.substring(0, 50),
      previousChatId,
      hasOverrides: !!assistantOverrides
    });

    // Build the request body for VAPI
    const vapiRequestBody: any = {
      assistantId,
      input,
    };

    // Include previous chat ID for conversation continuity
    if (previousChatId) {
      vapiRequestBody.previousChatId = previousChatId;
    }

    // Include assistant overrides (for user context on first message)
    if (assistantOverrides) {
      vapiRequestBody.assistantOverrides = assistantOverrides;
    }

    // Make the request to VAPI using the private key (server-side)
    const vapiResponse = await fetch('https://api.vapi.ai/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vapiRequestBody),
    });

    // Check if the request was successful
    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error('[Chat API] VAPI error:', vapiResponse.status, errorText);
      return NextResponse.json(
        { error: `VAPI API error: ${vapiResponse.status}` },
        { status: vapiResponse.status }
      );
    }

    // Parse and return the VAPI response
    const data = await vapiResponse.json();
    console.log('[Chat API] VAPI response received:', {
      id: data.id,
      outputCount: data.output?.length
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Chat API] Request failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
