import { NextResponse } from 'next/server';
import { scheduleService } from '../../../../../lib/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await scheduleService.getEventById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Schedule event not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error('Public schedule event API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
