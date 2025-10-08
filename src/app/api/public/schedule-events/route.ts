import { NextResponse } from 'next/server';
import { scheduleService } from '../../../../lib/database';

export async function GET() {
  try {
    const events = await scheduleService.getAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Public schedule events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
