// ==============================================================================
// src/app/api/orientation/programs/route.ts
// GET /api/orientation/programs
// Retrieves and filters official higher education programs with Zod query validation
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OrientationService } from '@/lib/orientation/orientation-service';
import { BacStreamCode } from '@/types/orientation';

export const dynamic = 'force-dynamic';

const ProgramsQuerySchema = z.object({
  stream: z.enum([
    'sciences_exp',
    'math',
    'technique_math',
    'gestion_eco',
    'lettres_philo',
    'langues_etrangeres',
  ]).optional(),
  field: z.string().max(20).optional(),
  scope: z.enum(['national', 'regional', 'local', 'wilaya_group', 'commune_group']).optional(),
  q: z.string().max(100).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = {
      stream: searchParams.get('stream') || undefined,
      field: searchParams.get('field') || undefined,
      scope: searchParams.get('scope') || undefined,
      q: searchParams.get('q') || undefined,
    };

    const parseResult = ProgramsQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'معايير التصفية والبحث غير صالحة.' },
        { status: 400 }
      );
    }

    const { stream, field, scope, q } = parseResult.data;

    let programs = await OrientationService.getPrograms();

    if (field) {
      programs = programs.filter(p => p.fieldId.toLowerCase() === field.toLowerCase());
    }

    if (stream) {
      programs = programs.filter(p => 
        p.eligibilityRules?.some(r => r.bacStreamId === stream as BacStreamCode)
      );
    }

    if (scope) {
      programs = programs.filter(p =>
        p.institutions?.some(i => i.registrationScope === scope)
      );
    }

    if (q) {
      const queryLower = q.trim().toLowerCase();
      programs = programs.filter(p =>
        p.nameAr.toLowerCase().includes(queryLower) ||
        p.nameFr.toLowerCase().includes(queryLower) ||
        p.specialtyAr?.toLowerCase().includes(queryLower) ||
        p.programCode.includes(queryLower)
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
