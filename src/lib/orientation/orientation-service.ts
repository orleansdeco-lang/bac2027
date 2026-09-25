// ==============================================================================
// src/lib/orientation/orientation-service.ts
// Official Orientation Service (MESRS Circular Data Provider + Engine Bridge)
// ==============================================================================

import { supabase } from '@/lib/supabase/client';
import {
  StudentBacProfile,
  OrientationReport,
  Program,
  Wilaya,
  BacStream,
  Field,
  Institution,
} from '@/types/orientation';
import { OFFICIAL_PROGRAMS } from './data/programs';
import { OFFICIAL_WILAYAS } from './data/wilayas';
import { OFFICIAL_BAC_STREAMS } from './data/streams';
import { OFFICIAL_FIELDS } from './data/fields';
import { OFFICIAL_INSTITUTIONS } from './data/institutions';
import { evaluateAllPrograms } from './orientation-engine';

export class OrientationService {
  /**
   * Retrieves all 58 official wilayas
   */
  static async getWilayas(): Promise<Wilaya[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('wilayas')
          .select('*')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((w: any) => ({
            id: w.id,
            code: w.code,
            nameAr: w.name_ar,
            nameFr: w.name_fr,
            phoneCode: w.phone_code,
            postalCode: w.postal_code,
            latitude: w.latitude,
            longitude: w.longitude,
          }));
        }
      }
    } catch {
      // Fallback silently to authoritative local dataset
    }
    return OFFICIAL_WILAYAS;
  }

  /**
   * Retrieves official BAC streams
   */
  static async getStreams(): Promise<BacStream[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('bac_streams')
          .select('*')
          .eq('is_active', true);

        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            code: s.code,
            nameAr: s.name_ar,
            nameFr: s.name_fr,
            shortName: s.short_name,
            isActive: s.is_active,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return OFFICIAL_BAC_STREAMS;
  }

  /**
   * Retrieves all fields of study (Domaines MESRS)
   */
  static async getFields(): Promise<Field[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('fields')
          .select('*');

        if (!error && data && data.length > 0) {
          return data.map((f: any) => ({
            id: f.id,
            code: f.code,
            nameAr: f.name_ar,
            nameFr: f.name_fr,
            icon: f.icon,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return OFFICIAL_FIELDS;
  }

  /**
   * Retrieves all registered institutions (universities, higher schools)
   */
  static async getInstitutions(): Promise<Institution[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('institutions')
          .select('*')
          .eq('is_active', true);

        if (!error && data && data.length > 0) {
          return data.map((i: any) => ({
            id: i.id,
            code: i.code,
            nameAr: i.name_ar,
            nameFr: i.name_fr,
            shortName: i.short_name,
            institutionType: i.institution_type,
            wilayaId: i.wilaya_id,
            address: i.address,
            websiteUrl: i.website_url,
            isActive: i.is_active,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return OFFICIAL_INSTITUTIONS;
  }

  /**
   * Retrieves all programs with complete rules and offers
   */
  static async getPrograms(): Promise<Program[]> {
    return OFFICIAL_PROGRAMS;
  }

  /**
   * Evaluates student opportunities against all circular programs
   */
  static async evaluateStudentOrientation(student: StudentBacProfile): Promise<OrientationReport> {
    const programs = await this.getPrograms();
    return evaluateAllPrograms(student, programs);
  }

  /**
   * Finds program by ID
   */
  static async getProgramById(programId: string): Promise<Program | null> {
    const programs = await this.getPrograms();
    return programs.find(p => p.id === programId) || null;
  }
}
