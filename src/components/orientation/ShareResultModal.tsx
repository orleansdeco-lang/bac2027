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
    <div className="fixed inset-0 z-50 bg-[#17201E]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-elevated relative border border-[#E4DED2]">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 p-2 rounded-full hover:bg-[#F7F3EA] text-[#78716C] hover:text-[#1E3A34] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-[#1E3A34] mb-1 text-center">
          شارك نتيجتك مع زملائك
        </h3>
        <p className="text-xs text-[#64748B] text-center mb-5 font-medium">
          بطاقة خاصة بـ WhatsApp و Instagram Stories
        </p>

        {/* Visual Share Card (Preview) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A34] via-[#26302F] to-[#17201E] p-6 text-white text-center shadow-card mb-5 border border-[#2C5E54]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#5F8F86]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span className="text-xs font-bold tracking-wider text-[#AFC8BD]">
              SHATER | الشاطر
            </span>
            <span className="text-[11px] font-medium text-[#DCE9E4]">
              واش نقدر نقرا؟
            </span>
          </div>

          {/* Big Score */}
          <div className="my-2">
            <span className="text-xs text-[#AFC8BD] block font-semibold mb-1">
              معدلي المتوقع في البكالوريا
            </span>
            <div className="text-5xl font-black text-white tracking-tight font-mono">
              {average.toFixed(2)}
              <span className="text-xl text-[#D7A66A] font-bold mr-1">/ 20</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-around text-xs">
            <div>
              <span className="text-[10px] text-[#AFC8BD] block font-medium">الشعبة</span>
              <strong className="text-white font-bold">{streamNameAr}</strong>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[10px] text-[#AFC8BD] block font-medium">التخصصات المتاحة</span>
              <strong className="text-[#D7A66A] font-bold">+{availableProgramsCount} تخصص</strong>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-[#AFC8BD]/80 font-mono">
            shater-bac.dz/orientation
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="py-3 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F7F3EA] text-[#1E3A34] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#E4DED2]"
          >
            {copied ? <Check className="w-4 h-4 text-[#2C5E54]" /> : <Copy className="w-4 h-4 text-[#5F8F86]" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>
        </div>

        <p className="text-[11px] text-[#78716C] text-center">
          يمكنك أخذ لقطة شاشة (Screenshot) ومشاركتها في الـ Story!
        </p>
      </div>
    </div>
  );
};
