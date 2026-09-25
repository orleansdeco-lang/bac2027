'use client';

import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  GraduationCap, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface ShareResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  average: number;
  streamNameAr: string;
  availableProgramsCount: number;
}

export const ShareResultModal: React.FC<ShareResultModalProps> = ({
  isOpen,
  onClose,
  average,
  streamNameAr,
  availableProgramsCount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/orientation` : 'https://shater-bac.dz/orientation';
  const shareText = `حسبت معدل البكالوريا ديالي (${average.toFixed(2)}/20 - شعبة ${streamNameAr}) في منصة الشاطر SHATER وعرفت واش نقدر نقرا! 🎓 اكتشف التخصصات اللي تناسبك مجاناً: ${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    trackEvent('orientation_share', { method: 'copy_text', average });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    trackEvent('orientation_share', { method: 'whatsapp', average });
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-stone-900 mb-1 text-center">
          شارك نتيجتك مع زملائك
        </h3>
        <p className="text-xs text-stone-500 text-center mb-6">
          بطاقة خاصة بـ WhatsApp و Instagram Stories
        </p>

        {/* Visual Share Card (Preview) */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-teal-900 via-stone-900 to-teal-950 p-6 text-white text-center shadow-lg mb-6 border border-teal-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span className="text-xs font-bold tracking-wider text-teal-400">
              SHATER | الشاطر
            </span>
            <span className="text-[11px] font-medium text-stone-300">
              واش نقدر نقرا؟
            </span>
          </div>

          {/* Big Score */}
          <div className="my-2">
            <span className="text-xs text-teal-200 block font-semibold mb-1">
              معدلي المتوقع في البكالوريا
            </span>
            <div className="text-5xl font-black text-white tracking-tight">
              {average.toFixed(2)}
              <span className="text-xl text-teal-300/80 font-bold mr-1">/ 20</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-around text-xs">
            <div>
              <span className="text-[10px] text-stone-400 block font-medium">الشعبة</span>
              <strong className="text-white font-bold">{streamNameAr}</strong>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[10px] text-stone-400 block font-medium">التخصصات المتاحة</span>
              <strong className="text-teal-300 font-bold">+{availableProgramsCount} تخصص</strong>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-teal-200/80 font-mono">
            shater-bac.dz/orientation
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>
        </div>

        <p className="text-[11px] text-stone-400 text-center">
          يمكنك أخذ لقطة شاشة (Screenshot) ومشاركتها في الـ Story!
        </p>
      </div>
    </div>
  );
};
