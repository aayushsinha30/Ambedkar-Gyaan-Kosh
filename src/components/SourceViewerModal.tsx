import React, { useState } from 'react';
import {
  X,
  Volume2,
  Square,
  QrCode,
  ShieldCheck,
  BookOpen,
  Languages
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
  type ArchiveDocument,
  type SupportedLanguage
} from '../data/archiveCorpus';
import { ArchivalPlateIllustration } from './ArchivalPlateIllustration';

interface SourceViewerModalProps {
  document: ArchiveDocument | null;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onClose: () => void;
  isSpeaking: boolean;
  onSpeakText: (text: string, langCode: SupportedLanguage) => void;
  onStopSpeaking: () => void;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({
  document,
  currentLang,
  onLanguageChange,
  onClose,
  isSpeaking,
  onSpeakText,
  onStopSpeaking
}) => {
  const [showQrPanel, setShowQrPanel] = useState(false);

  if (!document) return null;

  const ui = UI_TRANSLATIONS[currentLang];
  const localized = document.translations?.[currentLang];
  const displayTitle = localized?.title || document.title;
  const displayExcerpt = localized?.excerpt || document.excerpt;
  const displayTranscript = localized?.transcript || document.transcript;

  const handoffUrl = `https://archive.daic.gov.in/kiosk?doc=${document.id}&lang=${currentLang}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#070D1D]/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-modal-title"
    >
      <div className="kiosk-glass w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[#C9932E]/25 bg-[#0F1933]/90">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#E5B95C] font-mono-tabular">
              <span>{document.accessionNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{document.date}</span>
              <span aria-hidden="true">·</span>
              <span>{document.category}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                {ui.digitizedVerifiedBadge}
              </span>
            </div>
            <h2
              id="source-modal-title"
              className="text-xl md:text-2xl font-serif-display font-semibold text-[#FBF9F5] mt-1"
            >
              {displayTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                isSpeaking
                  ? onStopSpeaking()
                  : onSpeakText(`${displayTitle}. ${displayExcerpt}. ${displayTranscript}`, currentLang)
              }
              className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-[#C9932E] text-[#0F1933] font-semibold hover:bg-[#E5B95C]'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>{ui.stopAudioBtn}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{ui.listenAudioBtn}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowQrPanel((prev) => !prev)}
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-medium border border-[#C9932E]/40 text-[#FBF9F5] hover:bg-[#C9932E]/15 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#E5B95C]" />
              <span>{ui.qrHandoffBtn}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close primary source reader"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg border border-white/15 text-[#FBF9F5]/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Switcher Strip */}
        <div className="px-6 py-2.5 bg-[#132042] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#FBF9F5]/75">
            <Languages className="w-4 h-4 text-[#E5B95C]" />
            <span>IndicTrans2 Archival Translation Layer:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const hasSpecificTranslation = Boolean(document.translations?.[lang.code]);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    currentLang === lang.code
                      ? 'bg-[#C9932E] text-[#0F1933] font-semibold'
                      : 'text-[#FBF9F5]/80 hover:bg-white/10'
                  }`}
                >
                  {lang.nativeName} ({lang.label}){hasSpecificTranslation ? ' ★' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {/* Left: Facsimile Plate */}
          <div className="lg:col-span-5 flex flex-col bg-[#0B1328]">
            {showQrPanel ? (
              <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-[#FBF9F5] rounded-xl border-2 border-[#C9932E] shadow-lg">
                  <svg viewBox="0 0 120 120" className="w-40 h-40 text-[#0F1933]">
                    <rect width="120" height="120" fill="#FBF9F5" />
                    <rect x="8" y="8" width="32" height="32" fill="none" stroke="#0F1933" strokeWidth="6" />
                    <rect x="16" y="16" width="16" height="16" fill="#0F1933" />
                    <rect x="80" y="8" width="32" height="32" fill="none" stroke="#0F1933" strokeWidth="6" />
                    <rect x="88" y="16" width="16" height="16" fill="#0F1933" />
                    <rect x="8" y="80" width="32" height="32" fill="none" stroke="#0F1933" strokeWidth="6" />
                    <rect x="16" y="88" width="16" height="16" fill="#0F1933" />
                    {[
                      [48, 12], [56, 12], [64, 20], [48, 28], [56, 36], [48, 48], [60, 48], [72, 48],
                      [16, 48], [28, 56], [40, 64], [52, 64], [68, 60], [84, 52], [96, 56], [48, 80],
                      [60, 88], [72, 80], [84, 84], [96, 96], [56, 100], [80, 100]
                    ].map(([x, y], i) => (
                      <rect key={i} x={x} y={y} width="7" height="7" fill="#0F1933" />
                    ))}
                  </svg>
                </div>
                <h3 className="text-lg font-serif-display font-semibold text-[#E5B95C] mt-4">
                  Kiosk-to-Smartphone Continuity
                </h3>
                <p className="text-xs text-[#FBF9F5]/80 max-w-sm mt-1.5 leading-relaxed">
                  Scan to open this verified primary record ({document.accessionNumber}) on your mobile device.
                </p>
                <div className="mt-3 px-3 py-2 rounded bg-[#0F1933] border border-[#C9932E]/30 font-mono-tabular text-[11px] text-[#E5B95C] break-all max-w-sm">
                  {handoffUrl}
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrPanel(false)}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-medium border border-white/20 text-[#FBF9F5] hover:bg-white/10 cursor-pointer"
                >
                  Return to Archival Facsimile Plate
                </button>
              </div>
            ) : (
              <div className="flex-1 min-h-[380px] flex flex-col">
                <ArchivalPlateIllustration
                  motif={document.visualMotif}
                  accessionNumber={document.accessionNumber}
                  date={document.date}
                  title={document.title}
                />
              </div>
            )}

            <dl className="p-4 border-t border-white/10 bg-[#0F1933]/80 text-xs space-y-1.5">
              <div className="flex justify-between gap-2">
                <dt className="text-[#FBF9F5]/60">Citation:</dt>
                <dd className="text-[#FBF9F5] text-right font-medium">{document.sourceCitation}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#FBF9F5]/60">Folio / Section:</dt>
                <dd className="text-[#E5B95C] text-right font-mono-tabular">{document.pageOrSection}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#FBF9F5]/60">Repository Vault:</dt>
                <dd className="text-[#FBF9F5]/85 text-right">{document.archiveLocation}</dd>
              </div>
            </dl>
          </div>

          {/* Right: Scholarly Reading Column */}
          <div className="lg:col-span-7 kiosk-parchment p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-stone-300">
                <span className="text-xs uppercase tracking-widest text-stone-600 font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#9A6B16]" />
                  <span>Verified Archival Transcription ({SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.nativeName})</span>
                </span>
                <span className="text-xs font-mono-tabular text-stone-500">
                  Original: {document.language}
                </span>
              </div>

              <blockquote className="my-6 pl-4 border-l-2 border-[#C9932E] text-lg md:text-xl font-serif-display italic text-stone-900 leading-relaxed">
                “{displayExcerpt}”
              </blockquote>

              <div className="space-y-4 text-sm md:text-base text-stone-800 leading-relaxed max-w-2xl">
                {displayTranscript.split('\n\n').map((para, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? 'first-letter:text-4xl first-letter:font-serif-display first-letter:font-bold first-letter:text-[#1A2A52] first-letter:mr-2 first-letter:float-left'
                        : ''
                    }
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-stone-300 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
              <div>
                <strong className="text-stone-900">Bibliographic Reference:</strong> {document.sourceCitation}
              </div>
              <span className="font-mono-tabular text-[#1A2A52] font-semibold">
                {document.accessionNumber} · VERIFIED TRUE COPY
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
