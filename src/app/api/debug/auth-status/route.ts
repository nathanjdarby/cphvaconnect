import { NextResponse } from 'next/server';
import { authService } from '../../../../lib/auth';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        message: 'No token provided'
      });
    }

    const user = await authService.getCurrentUser(token);
    
    if (user) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        message: 'User authenticated successfully'
      });
    } else {
      return NextResponse.json({
        authenticated: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth status debug error:', error);
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
