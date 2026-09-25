'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Compass } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export const SoftShaterCta: React.FC = () => {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16" dir="rtl">
      <div className="rounded-3xl bg-linear-to-br from-stone-900 via-stone-850 to-teal-950 p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Soft decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/60 px-2.5 py-1 rounded-md border border-teal-500/20 inline-block mb-3">
              منصة SHATER للتحضير للبكالوريا
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-2">
              عرفت واش تقدر تقرا... <br className="hidden sm:inline" />
              <span className="text-teal-300">الآن خلينا نعاونك توصل.</span>
            </h3>

            <p className="text-sm text-stone-300 leading-relaxed font-normal">
              <strong>SHATER BAC</strong> يساعدك تعرف واش تقرا، واش ناقصك في المواد الأساسية، وكيفاش توصل للـBAC بمعدل يضمن التخصص اللي تحلم به.
            </p>
          </div>

          <Link
            href="/"
            onClick={() => trackEvent('orientation_shater_cta', {})}
            className="shrink-0 px-7 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-black text-sm shadow-md hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>اكتشف SHATER</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
