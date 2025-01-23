import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';

// Get all blocks for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('bentoit');
    
    const user = await db.collection('users').findOne(
      { username },
      { projection: { blocks: 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.blocks || []);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching blocks' },
      { status: 500 }
    );
  }
}

// Add new block
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const newBlock = await request.json();
    const client = await clientPromise;
    const db = client.db('bentoit');

    const result = await db.collection('users').findOneAndUpdate(
      { email: session.user?.email },
      { $push: { blocks: newBlock } },
      { returnDocument: 'after' }
    );

    // Return the updated blocks array
    return NextResponse.json(result.value?.blocks || []);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error adding block' },
      { status: 500 }
    );
  }
}