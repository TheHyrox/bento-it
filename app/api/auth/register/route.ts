import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hash } from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    
    const client = await clientPromise;
    const db = client.db('bentoit');
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    await db.collection('users').insertOne({
      username,
      email,
      password: hashedPassword,
      register_date: new Date()
    });

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred while registering' },
      { status: 500 }
    );
  }
}