// ==============================================================================
// src/app/api/orientation/wilayas/route.ts
// GET /api/orientation/wilayas
// Returns all 58 official Algerian wilayas
// ==============================================================================

import { NextResponse } from 'next/server';
import { OrientationService } from '@/lib/orientation/orientation-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const wilayas = await OrientationService.getWilayas();
    return NextResponse.json({ wilayas });
  } catch (error) {
    console.error('Error fetching wilayas:', error);
    return NextResponse.json({ error: 'فشل في استرجاع الولايات' }, { status: 500 });
  }
}
