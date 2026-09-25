// ==============================================================================
// src/app/api/orientation/fields/route.ts
// GET /api/orientation/fields
// Returns official MESRS fields of study
// ==============================================================================

import { NextResponse } from 'next/server';
import { OrientationService } from '@/lib/orientation/orientation-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fields = await OrientationService.getFields();
    return NextResponse.json({ fields });
  } catch (error) {
    console.error('Error fetching fields:', error);
    return NextResponse.json({ error: 'فشل في استرجاع ميادين التكوين' }, { status: 500 });
  }
}
