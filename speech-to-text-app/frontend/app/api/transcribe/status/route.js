// app/api/transcribe/status/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing transcript ID' }, { status: 400 });
    }

    const assemblyKey = process.env.ASSEMBLYAI_API_KEY;

    if (!assemblyKey) {
        return NextResponse.json({
            status: "no_api_key",
            message: "Add ASSEMBLYAI_API_KEY to .env.local"
        });
    }

    try {
        const response = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
            headers: {
                'Authorization': assemblyKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Status check failed: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({
            id: data.id,
            status: data.status,
            text: data.text || null,
            error: data.error || null,
            progress: data.status === 'processing' ? 'in_progress' : 'done',
            confidence: data.confidence,
            words: data.words?.length || 0
        });

    } catch (error) {
        return NextResponse.json({
            error: error.message,
            id: id,
            status: 'check_failed'
        }, { status: 500 });
    }
}