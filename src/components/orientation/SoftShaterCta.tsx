'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export const SoftShaterCta: React.FC = () => {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16" dir="rtl">
      <div className="rounded-3xl bg-gradient-to-br from-[#1E3A34] via-[#26302F] to-[#17201E] p-6 sm:p-9 text-white shadow-card relative overflow-hidden border border-[#2C5E54]">
        {/* Soft decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5F8F86]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-[#AFC8BD] bg-white/10 px-2.5 py-1 rounded-md border border-white/15 inline-block mb-3">
              منصة SHATER للتحضير للبكالوريا
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug mb-2">
              عرفت واش تقدر تقرا... <br className="hidden sm:inline" />
              <span className="text-[#D7A66A]">الآن خلينا نعاونك توصل لمعدلك.</span>
            </h3>

            <p className="text-sm text-[#DCE9E4] leading-relaxed font-normal">
              <strong>SHATER BAC</strong> يساعدك تضبط واش ناقصك في المواد الأساسية، وتدرب على البكالوريات السابقة، وتوصل بمعدل يضمن التخصص اللي تحلم به.
            </p>
          </div>

          <Link
            href="/"
            onClick={() => trackEvent('orientation_shater_cta', {})}
            className="shrink-0 px-7 py-3.5 rounded-xl bg-[#D7A66A] hover:bg-[#C99558] text-[#1E3A34] font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>اكتشف منصة SHATER</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
