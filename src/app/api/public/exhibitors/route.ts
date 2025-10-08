import { NextResponse } from 'next/server';
import { exhibitorService } from '../../../../lib/database';

export async function GET() {
  try {
    const exhibitors = await exhibitorService.getAllExhibitors();
    return NextResponse.json(exhibitors);
  } catch (error) {
    console.error('Public exhibitors API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
