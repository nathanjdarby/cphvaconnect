import { NextResponse } from 'next/server';
import { userService } from '../../../../lib/database';
import { randomUUID } from 'crypto';

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
    
    // Generate a unique ID for the new user
    const userId = randomUUID();
    
    // Create full user object with generated ID
    const fullUserData = {
      ...userData,
      id: userId,
      nameIsPublic: userData.nameIsPublic ?? true,
      emailIsPublic: userData.emailIsPublic ?? false,
      bio: userData.bio ?? "",
      avatarUrl: userData.avatarUrl ?? null,
      avatarStoragePath: userData.avatarStoragePath ?? null,
    };
    
    const newUser = await userService.createUser(fullUserData);
    
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
