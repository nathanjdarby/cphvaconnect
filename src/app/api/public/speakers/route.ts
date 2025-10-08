import { NextResponse } from 'next/server';
import { speakerService } from '../../../../lib/database';

export async function GET() {
  try {
    const speakers = await speakerService.getAllSpeakers();
    return NextResponse.json(speakers);
  } catch (error) {
    console.error('Public speakers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
