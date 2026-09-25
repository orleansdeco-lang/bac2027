// ==============================================================================
// src/app/api/orientation/programs/route.ts
// GET /api/orientation/programs
// Retrieves and filters official higher education programs
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { OrientationService } from '@/lib/orientation/orientation-service';
import { BacStreamCode } from '@/types/orientation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stream = searchParams.get('stream') as BacStreamCode | null;
    const field = searchParams.get('field');
    const scope = searchParams.get('scope');
    const q = searchParams.get('q')?.trim().toLowerCase();

    let programs = await OrientationService.getPrograms();

    if (field) {
      programs = programs.filter(p => p.fieldId.toLowerCase() === field.toLowerCase());
    }

    if (stream) {
      programs = programs.filter(p => 
        p.eligibilityRules?.some(r => r.bacStreamId === stream)
      );
    }

    if (scope) {
      programs = programs.filter(p =>
        p.institutions?.some(i => i.registrationScope === scope)
      );
    }

    if (q) {
      programs = programs.filter(p =>
        p.nameAr.toLowerCase().includes(q) ||
        p.nameFr.toLowerCase().includes(q) ||
        p.specialtyAr?.toLowerCase().includes(q) ||
        p.programCode.includes(q)
      );
    }

    return NextResponse.json({
      total: programs.length,
      programs,
    });
  } catch (error) {
    console.error('Error in /api/orientation/programs:', error);
    return NextResponse.json(
      { error: 'فشل في استرجاع قائمة التخصصات الجامعية.' },
      { status: 500 }
    );
  }
}
