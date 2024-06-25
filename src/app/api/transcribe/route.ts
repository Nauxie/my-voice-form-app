import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  if (!request.body) {
    return NextResponse.json({ error: 'No body provided' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Create a temporary file to store the audio
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFilePath = join('/tmp', `${uuidv4()}.webm`);
    await writeFile(tempFilePath, buffer);

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: 'nova-2',
        smart_format: true,
        mimetype: audioFile.type, // Specify the correct MIME type
      }
    );

    if (error) {
      console.error('Deepgram error:', error);
      return NextResponse.json({ 
        error: 'Transcription failed', 
        details: error.message || 'Unknown error'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      transcription: result.results.channels[0].alternatives[0].transcript 
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({ 
      error: 'Transcription failed', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}