import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Volume2,
  Square,
  MapPin
} from 'lucide-react';
import {
  ARCHIVE_CORPUS,
  TIMELINE_MILESTONES,
  UI_TRANSLATIONS,
  type ArchiveDocument,
  type SupportedLanguage
} from '../data/archiveCorpus';
import { ArchivalPlateIllustration } from './ArchivalPlateIllustration';

interface TimelineScreenProps {
  currentLang: SupportedLanguage;
  onOpenDocument: (doc: ArchiveDocument) => void;
  isSpeaking: boolean;
  onSpeakText: (text: string, lang: SupportedLanguage) => void;
  onStopSpeaking: () => void;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  currentLang,
  onOpenDocument,
  isSpeaking,
  onSpeakText,
  onStopSpeaking
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(7);
  const ui = UI_TRANSLATIONS[currentLang];

  const activeMilestone = TIMELINE_MILESTONES[activeIndex];
  const linkedDoc =
    ARCHIVE_CORPUS.find((d) => d.id === activeMilestone.linkedDocumentId) || ARCHIVE_CORPUS[0];

  return (
    <div className="space-y-6 pb-12">
      <div className="kiosk-glass rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#E5B95C] font-semibold">
              03 · CHRONOLOGICAL EXHIBITION RAIL (1891 – 1956)
            </p>
            <h1 className="text-3xl md:text-4xl font-serif-display font-bold text-[#FBF9F5] mt-1">
              {ui.navTimeline}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeIndex === 0}
              aria-label="Previous milestone"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0F1933] border border-white/15 text-[#FBF9F5] disabled:opacity-35 hover:border-[#C9932E] flex items-center gap-1 text-xs font-medium cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Era</span>
            </button>
            <span className="px-3 font-mono-tabular text-xs text-[#E5B95C]">
              {String(activeIndex + 1).padStart(2, '0')} / {String(TIMELINE_MILESTONES.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() =>
                setActiveIndex((prev) => Math.min(TIMELINE_MILESTONES.length - 1, prev + 1))
              }
              disabled={activeIndex === TIMELINE_MILESTONES.length - 1}
              aria-label="Next milestone"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0F1933] border border-white/15 text-[#FBF9F5] disabled:opacity-35 hover:border-[#C9932E] flex items-center gap-1 text-xs font-medium cursor-pointer"
            >
              <span>Next Era</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-2">
          {TIMELINE_MILESTONES.map((ms, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={ms.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`min-h-[78px] p-3 rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#C9932E] text-[#0F1933] shadow-lg scale-[1.02]'
                    : 'bg-[#0B1328]/85 border border-white/10 text-[#FBF9F5]/80 hover:border-[#C9932E]/50 hover:text-white'
                }`}
              >
                <span className="font-mono-tabular text-xs font-bold">
                  {ms.year}
                </span>
                <span className="text-[11px] font-medium line-clamp-2 leading-tight mt-1">
                  {ms.theme}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 kiosk-glass rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#E5B95C] font-mono-tabular">
              <span>MILESTONE {String(activeIndex + 1).padStart(2, '0')}</span>
              <span aria-hidden="true">·</span>
              <span>{activeMilestone.dateLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#FBF9F5]/85">
                <MapPin className="w-3.5 h-3.5 text-[#E5B95C]" />
                {activeMilestone.location}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif-display font-bold text-[#FBF9F5] leading-tight">
              {activeMilestone.title}
            </h2>

            <p className="text-base md:text-lg text-[#FBF9F5]/90 leading-relaxed">
              {activeMilestone.summary}
            </p>

            <div className="p-5 rounded-xl bg-[#0B1328]/90 border-l-2 border-[#C9932E] space-y-1.5">
              <div className="text-xs uppercase tracking-wider text-[#E5B95C] font-semibold">
                Institutional & Constitutional Legacy
              </div>
              <p className="text-sm md:text-base text-[#FBF9F5]/85 leading-relaxed">
                {activeMilestone.historicalImpact}
              </p>
            </div>
          </div>

          <div className="pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                isSpeaking
                  ? onStopSpeaking()
                  : onSpeakText(
                      `${activeMilestone.dateLabel}. ${activeMilestone.title}. ${activeMilestone.summary} ${activeMilestone.historicalImpact}`,
                      currentLang
                    )
              }
              className="min-h-[46px] px-5 py-2.5 rounded-xl border border-[#C9932E]/45 text-[#E5B95C] hover:bg-[#C9932E]/15 text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {isSpeaking ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
                  <span>{ui.stopAudioBtn}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{ui.listenAudioBtn}</span>
                </>
              )}
            </button>

            <div className="text-xs text-[#FBF9F5]/65 font-mono-tabular">
              Linked Record: {linkedDoc.accessionNumber}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 kiosk-glass rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs text-[#E5B95C] font-mono-tabular">
              <span>LINKED PRIMARY ARCHIVAL RECORD</span>
              <span>{linkedDoc.date}</span>
            </div>

            <div className="mt-3 h-56 rounded-xl overflow-hidden border border-[#C9932E]/30">
              <ArchivalPlateIllustration
                motif={linkedDoc.visualMotif}
                accessionNumber={linkedDoc.accessionNumber}
                date={linkedDoc.date}
                title={linkedDoc.title}
              />
            </div>

            <h3 className="text-xl font-serif-display font-semibold text-[#FBF9F5] mt-4">
              {linkedDoc.title}
            </h3>

            <p className="text-xs md:text-sm text-[#FBF9F5]/80 italic mt-2 leading-relaxed">
              “{linkedDoc.excerpt}”
            </p>

            <div className="mt-3 text-xs text-[#FBF9F5]/65">
              <strong className="text-[#E5B95C]">Citation:</strong> {linkedDoc.sourceCitation}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenDocument(linkedDoc)}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#C9932E] hover:bg-[#E5B95C] text-[#0F1933] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Inspect Linked Primary Source ({linkedDoc.accessionNumber})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
