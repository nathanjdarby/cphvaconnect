import { NextResponse } from 'next/server';
import { exhibitorService } from '../../../../../lib/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const exhibitor = await exhibitorService.getExhibitorById(params.id);
    if (!exhibitor) {
      return NextResponse.json(
        { error: 'Exhibitor not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(exhibitor);
  } catch (error) {
    console.error('Public exhibitor API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
