"use client";

import React, { useState, useEffect } from "react";
import { BacMockExam } from "@/domain/content/lessons/snv_week12";

interface Props {
  examData: BacMockExam;
}

export const DDaySimulator: React.FC<Props> = ({ examData }) => {
  const [selectedTopic, setSelectedTopic] = useState<1 | 2 | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(30 * 60); // 30 دقيقة بالثواني
  const [isDecisionLocked, setIsDecisionLocked] = useState<boolean>(false);

  // تشغيل مؤقت العد التنازلي لقاعدة الـ 30 دقيقة
  useEffect(() => {
    if (isDecisionLocked || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isDecisionLocked, timeLeftSeconds]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleConfirmDecision = (topicNum: 1 | 2) => {
    setSelectedTopic(topicNum);
    setIsDecisionLocked(true);
  };

  const activeTopicData = examData.topics.find((t) => t.topicNumber === selectedTopic);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 text-right" dir="rtl">
      {/* شريط الإحصائيات والمؤقت */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-emerald-400">{examData.title_ar}</h2>
          <p className="text-xs text-slate-400 mt-1">المدة الإجمالية: 4 ساعات ونصف | المعامل: 6</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-slate-300">مؤقت حسم الموضوع:</span>
          <span className="font-mono text-lg font-bold text-amber-300">
            {formatTime(timeLeftSeconds)}
          </span>
        </div>
      </div>

      {/* مرحلة الاختيار: تظهر إذا لم يُغلق القرار بعد */}
      {!isDecisionLocked ? (
        <div className="space-y-4">
          <div className="bg-blue-950/40 border border-blue-900/60 p-4 rounded-xl text-blue-200 text-sm">
            💡 **قاعدة الـ 30 دقيقة الوزارية:** استغل هذا المؤقت لقراءة التمرين الثالث من كلا الموضوعين لحسم قرارك، وتذكر أن التراجع في منتصف الوقت يربك تركيزك.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examData.topics.map((t) => (
              <div
                key={t.topicNumber}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 mb-3">
                    الموضوع {t.topicNumber}
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">{t.theme_ar}</h3>
                  <ul className="text-xs text-slate-400 space-y-1.5 mb-6">
                    {t.exercises.map((ex) => (
                      <li key={ex.exerciseNumber}>
                        • تمرين {ex.exerciseNumber}: {ex.title_ar.split(":")[0]} ({ex.points} نقاط)
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleConfirmDecision(t.topicNumber)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-emerald-900/20"
                >
                  حسم واختيار الموضوع {t.topicNumber}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* مرحلة ورقة الامتحان بعد القفل */
        <div className="space-y-6">
          <div className="bg-emerald-950/40 border border-emerald-900/60 p-4 rounded-xl text-emerald-200 text-sm flex items-center justify-between">
            <span>تم حسم الاختيار: <strong>الموضوع {selectedTopic}</strong>. ركّز في ورقتك وتجنب التفكير في الموضوع الآخر.</span>
            <button
              onClick={() => setIsDecisionLocked(false)}
              className="text-xs underline text-slate-400 hover:text-white"
            >
              تغيير الموضوع (طوارئ)
            </button>
          </div>

          {activeTopicData?.exercises.map((exercise) => (
            <div
              key={exercise.exerciseNumber}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-emerald-400">{exercise.title_ar}</h3>
                <span className="text-xs font-semibold bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                  {exercise.points} نقاط
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                {exercise.context_ar}
              </p>

              {/* الأسئلة والمهام */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">التعليمات المطلوبة:</h4>
                {exercise.questions_ar.map((q, idx) => (
                  <div key={idx} className="text-sm text-slate-200 leading-relaxed pr-2">
                    {q}
                  </div>
                ))}
              </div>

              {/* سلم التنقيط الوزاري التفصيلي (Le Barème) */}
              <details className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 group">
                <summary className="cursor-pointer font-medium text-emerald-400/90 hover:text-emerald-300 select-none">
                  🔍 إظهار شبكة التصحيح وسلم التنقيط النموذجي (Barème)
                </summary>
                <div className="mt-3 space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {exercise.officialBareme.map((item, bIdx) => (
                    <div key={bIdx} className="flex justify-between items-start border-b border-slate-800/50 pb-1.5 last:border-0">
                      <span className="text-slate-300 pr-2 leading-tight">{item.criteria_ar}</span>
                      <span className="font-mono text-emerald-400 font-bold whitespace-nowrap">
                        +{item.points} ن
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
