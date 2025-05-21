import { NextResponse } from 'next/server';
import { getOrgInfo } from '@/db/functions/getOrgInfo';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await getOrgInfo(userId);
    
    if (!result.statusSuccess) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch organization data' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in organization API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
