// ==============================================================================
// src/app/api/orientation/check/route.ts
// POST /api/orientation/check
// Authoritative evaluation against official MESRS circular admission criteria
// Server-side calculation with strict Zod validation and full provenance
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OrientationService } from '@/lib/orientation/orientation-service';
import { StudentBacProfile } from '@/types/orientation';

export const dynamic = 'force-dynamic';

const CheckInputSchema = z.object({
  streamId: z.enum([
    'sciences_exp',
    'math',
    'technique_math',
    'gestion_eco',
    'lettres_philo',
    'langues_etrangeres',
  ]),
  wilayaId: z.number().int().min(1).max(58),
  generalAverage: z.number().min(0).max(20),
  grades: z.object({
    mathematics: z.number().min(0).max(20).optional(),
    physics: z.number().min(0).max(20).optional(),
    naturalSciences: z.number().min(0).max(20).optional(),
    arabic: z.number().min(0).max(20).optional(),
    french: z.number().min(0).max(20).optional(),
    english: z.number().min(0).max(20).optional(),
    philosophy: z.number().min(0).max(20).optional(),
    historyGeo: z.number().min(0).max(20).optional(),
    accounting: z.number().min(0).max(20).optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    const parseResult = CheckInputSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues?.[0]?.message || 'بيانات الإدخال غير صالحة.';
      return NextResponse.json(
        { error: firstError, details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { streamId, wilayaId, generalAverage, grades } = parseResult.data;

    const studentProfile: StudentBacProfile = {
      streamId,
      wilayaId,
      generalAverage,
      grades: grades || {},
    };

    const report = await OrientationService.evaluateStudentOrientation(studentProfile);

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error('Error in /api/orientation/check:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء معالجة بيانات التوجيه الجامعي.' },
      { status: 500 }
    );
  }
}
