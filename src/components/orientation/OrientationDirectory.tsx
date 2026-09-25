'use client';

import React, { useState } from 'react';
import {
  Search,
  Building2,
  GraduationCap,
  Calendar,
  Sparkles,
  Info,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { Program, Field, BacStreamCode } from '@/types/orientation';
import { OFFICIAL_PROGRAMS } from '@/lib/orientation/data/programs';
import { OFFICIAL_FIELDS } from '@/lib/orientation/data/fields';
import { OFFICIAL_BAC_STREAMS } from '@/lib/orientation/data/streams';
import { ProgramDetailModal } from './ProgramDetailModal';

interface OrientationDirectoryProps {
  onToggleCompare: (program: Program) => void;
  comparedProgramIds: string[];
}

export const OrientationDirectory: React.FC<OrientationDirectoryProps> = ({
  onToggleCompare,
  comparedProgramIds,
}) => {
  const [selectedField, setSelectedField] = useState<string>('ALL');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProgramForModal, setSelectedProgramForModal] = useState<Program | null>(null);

  const filteredPrograms = OFFICIAL_PROGRAMS.filter(prog => {
    if (selectedField !== 'ALL' && prog.fieldId !== selectedField) return false;
    if (selectedStream !== 'ALL') {
      const accepts = prog.eligibilityRules?.some(r => r.bacStreamId === selectedStream);
      if (!accepts) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        prog.nameAr.toLowerCase().includes(q) ||
        prog.nameFr.toLowerCase().includes(q) ||
        prog.specialtyAr?.toLowerCase().includes(q) ||
        prog.programCode.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl text-right">
        <h2 className="text-xl font-bold text-white mb-2">
          دليل التخصصات والمدارس العليا بالجامعات الجزائرية
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          تصفح كافة التخصصات المعتمدة في المنشور الوزاري لدورة 2026 مع الشروط البيداغوجية ومعدلات القبول.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              البحث عن تخصص أو كود
            </label>
            <input
              type="text"
              placeholder="مثال: طب، إعلام آلي، 071، بوليتكنيك..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pr-10 pl-3 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
              dir="rtl"
            />
            <Search className="w-4 h-4 text-slate-500 absolute top-9 right-3.5 pointer-events-none" />
          </div>

          {/* Field Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              ميدان التكوين (Domaine)
            </label>
            <select
              value={selectedField}
              onChange={e => setSelectedField(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-emerald-500"
              dir="rtl"
            >
              <option value="ALL">جميع الميادين</option>
              {OFFICIAL_FIELDS.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nameAr} ({f.code})
                </option>
              ))}
            </select>
          </div>

          {/* Stream Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              تصفية حسب شعبة البكالوريا
            </label>
            <select
              value={selectedStream}
              onChange={e => setSelectedStream(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-emerald-500"
              dir="rtl"
            >
              <option value="ALL">جميع الشعب</option>
              {OFFICIAL_BAC_STREAMS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrograms.map(program => {
          const isCompared = comparedProgramIds.includes(program.id);
          const p1Rules = program.eligibilityRules?.filter(r => r.priority === 1);
          const formulaRule = program.eligibilityRules?.find(r => r.weightedFormula);

          return (
            <div
              key={program.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between text-right"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700 font-semibold">
                    كود: {program.programCode}
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    ميدان {program.fieldId}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {program.nameAr}
                </h3>
                {program.specialtyAr && (
                  <p className="text-xs text-slate-400 mt-0.5">{program.specialtyAr}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span>{program.degreeType}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{program.durationYears} سنوات</span>
                  </span>
                </div>

                {/* Priority Streams */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs">
                  <span className="text-[11px] text-slate-500 block mb-1">
                    شعب الأولوية الأولى:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {p1Rules?.map(r => (
                      <span
                        key={r.id}
                        className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold"
                      >
                        {r.bacStreamId}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Formula if exists */}
                {formulaRule?.weightedFormula && (
                  <div className="mt-2 text-[11px] text-slate-400 font-mono" dir="ltr">
                    الصيغة: {formulaRule.weightedFormula.expressionAr}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedProgramForModal(program)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>تفاصيل الشروط والجامعات</span>
                </button>

                <button
                  onClick={() => onToggleCompare(program)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 ${
                    isCompared
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Scale className="w-3 h-3" />
                  <span>{isCompared ? 'تمت الإضافة' : 'مقارنة'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ProgramDetailModal
        program={selectedProgramForModal}
        onClose={() => setSelectedProgramForModal(null)}
      />
    </div>
  );
};
