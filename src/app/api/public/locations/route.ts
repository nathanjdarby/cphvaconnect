import { NextResponse } from 'next/server';
import { locationService } from '../../../../lib/database';

export async function GET() {
  try {
    const locations = await locationService.getAllLocations();
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Public locations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
