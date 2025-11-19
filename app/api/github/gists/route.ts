import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Create a new gist
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create gist' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating gist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's gists
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    // Build headers
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    // Add auth token if available
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    // Determine endpoint
    let endpoint: string;
    if (username) {
      endpoint = `https://api.github.com/users/${username}/gists`;
    } else if (session?.accessToken) {
      endpoint = 'https://api.github.com/gists';
    } else {
      return NextResponse.json(
        { error: 'Username required for unauthenticated requests' },
        { status: 400 }
      );
    }

    // Fetch gists from GitHub API
    const response = await fetch(endpoint, {
      headers,
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch gists' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching gists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
