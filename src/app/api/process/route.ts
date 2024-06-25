import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { transcription } = await request.json();

  if (!transcription) {
    return NextResponse.json({ error: 'No transcription provided' }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0613",
      messages: [{ role: "user", content: transcription }],
      functions: [
        {
          name: "extract_form_data",
          description: "Extract form data from the transcription",
          parameters: {
            type: "object",
            properties: {
              firstName: { type: "string" },
              lastName: { type: "string" },
              summary: { type: "string" },
            },
            required: ["firstName", "lastName", "summary"],
          },
        },
      ],
      function_call: { name: "extract_form_data" },
    });

    const result = JSON.parse(completion.choices[0].message.function_call?.arguments || '{}');

    // Check for missing data
    const missingFields = [];
    if (!result.firstName) missingFields.push('First Name');
    if (!result.lastName) missingFields.push('Last Name');
    if (!result.summary) missingFields.push('Summary');

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Missing data: ${missingFields.join(', ')}. Please provide more information.`,
        partialData: result
      }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('OpenAI processing error:', error);
    return NextResponse.json({ error: 'Failed to process transcription' }, { status: 500 });
  }
}