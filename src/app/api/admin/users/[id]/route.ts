import { NextResponse } from 'next/server';
import { userService } from '../../../../../lib/database';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const updatedUser = await userService.updateUser(params.id, updates);
    
    if (updatedUser) {
      // Remove password from response for security
      const safeUser = {
        ...updatedUser,
        password: undefined
      };
      return NextResponse.json(safeUser);
    } else {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Update user API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await userService.deleteUser(params.id);
    
    if (success) {
      return NextResponse.json({ message: 'User deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Delete user API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
