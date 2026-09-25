// ==============================================================================
// src/app/api/orientation/check/route.ts
// POST /api/orientation/check
// Evaluates BAC candidate against official MESRS circular admission criteria
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { OrientationService } from '@/lib/orientation/orientation-service';
import { StudentBacProfile, BacStreamCode } from '@/types/orientation';

export const dynamic = 'force-dynamic';

const VALID_STREAMS: BacStreamCode[] = [
  'sciences_exp',
  'math',
  'technique_math',
  'gestion_eco',
  'lettres_philo',
  'langues_etrangeres',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { streamId, wilayaId, generalAverage, grades } = body as StudentBacProfile;

    // Validate Stream
    if (!streamId || !VALID_STREAMS.includes(streamId)) {
      return NextResponse.json(
        { error: 'شعبة البكالوريا المحددة غير صالحة أو غير مدعومة.' },
        { status: 400 }
      );
    }

    // Validate Wilaya (1 to 58)
    const numericWilaya = Number(wilayaId);
    if (!numericWilaya || numericWilaya < 1 || numericWilaya > 58) {
      return NextResponse.json(
        { error: 'يرجى تحديد ولاية صحيحة (من 01 إلى 58).' },
        { status: 400 }
      );
    }

    // Validate General Average (0.00 to 20.00)
    const numericAverage = Number(generalAverage);
    if (isNaN(numericAverage) || numericAverage < 0 || numericAverage > 20) {
      return NextResponse.json(
        { error: 'المعدل العام يجب أن يكون بين 0.00 و 20.00.' },
        { status: 400 }
      );
    }

    // Validate optional grades if provided
    const sanitizedGrades: StudentBacProfile['grades'] = {};
    if (grades && typeof grades === 'object') {
      const subjectKeys: (keyof NonNullable<StudentBacProfile['grades']>)[] = [
        'mathematics',
        'physics',
        'naturalSciences',
        'arabic',
        'french',
        'english',
        'philosophy',
        'historyGeo',
        'accounting',
      ];

      for (const key of subjectKeys) {
        if (grades[key] !== undefined && grades[key] !== null) {
          const val = Number(grades[key]);
          if (!isNaN(val) && val >= 0 && val <= 20) {
            sanitizedGrades[key] = val;
          }
        }
      }
    }

    const studentProfile: StudentBacProfile = {
      streamId,
      wilayaId: numericWilaya,
      generalAverage: numericAverage,
      grades: sanitizedGrades,
    };

    const report = await OrientationService.evaluateStudentOrientation(studentProfile);

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error('Error in /api/orientation/check:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة بيانات التوجيه الجامعي.' },
      { status: 500 }
    );
  }
}
