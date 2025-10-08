import { NextResponse } from 'next/server';
import { userService } from '../../../../lib/database';

export async function GET() {
  try {
    const users = await userService.getAllUsers();
    // Remove password from response for security
    const safeUsers = users.map(user => ({
      ...user,
      password: undefined
    }));
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const newUser = await userService.createUser(userData);
    
    if (newUser) {
      // Remove password from response for security
      const safeUser = {
        ...newUser,
        password: undefined
      };
      return NextResponse.json(safeUser, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Create user API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
