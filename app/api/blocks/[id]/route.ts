import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';

interface Params {
  params: { id: string }
}

// Get specific block from user
export async function GET(
  request: Request,
  { params }: Params
) {
  const { id } = params;
  try {
    const client = await clientPromise;
    const db = client.db('bentoit');
    
    const user = await db.collection('users').findOne(
      { "blocks.id": id },
      { projection: { "blocks.$": 1 } }
    );

    if (!user || !user.blocks[0]) {
      return NextResponse.json(
        { message: 'Block not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.blocks[0]);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching block' },
      { status: 500 }
    );
  }
}

// Update specific block
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const updates = await request.json();
    const { id } = params;

    const client = await clientPromise;
    const db = client.db('bentoit');

    const result = await db.collection('users').updateOne(
      { 
        email: session.user.email,
        "blocks.id": id 
      },
      { 
        $set: { 
          "blocks.$.position": updates.position 
        }
      }
    );

    if (!result.matchedCount) {
      return new Response('Block not found', { status: 404 });
    }

    // Get updated block
    const user = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { blocks: { $elemMatch: { id: id } } } }
    );

    return Response.json(user?.blocks[0] || null);
  } catch (error) {
    console.error('PATCH /api/blocks/[id] error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Delete specific block
export async function DELETE(
  request: Request,
  { params }: Params
) {
  const { id } = params;
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('bentoit');

    const result = await db.collection('users').updateOne(
      { email: session.user?.email },
      { 
        $pull: { 
          blocks: { id: id } 
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Block not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Block deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error deleting block' },
      { status: 500 }
    );
  }
}