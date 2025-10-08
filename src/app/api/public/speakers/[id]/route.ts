import { NextResponse } from 'next/server';
import { speakerService } from '../../../../../lib/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const speaker = await speakerService.getSpeakerById(params.id);
    if (!speaker) {
      return NextResponse.json(
        { error: 'Speaker not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(speaker);
  } catch (error) {
    console.error('Public speaker API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
