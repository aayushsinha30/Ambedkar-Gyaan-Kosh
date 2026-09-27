import React, { useState } from 'react';
import {
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Contrast,
  Volume2,
  Square,
  BookOpen
} from 'lucide-react';
import {
  ARCHIVE_CORPUS,
  UI_TRANSLATIONS,
  type ArchiveDocument,
  type SupportedLanguage
} from '../data/archiveCorpus';
import { ArchivalPlateIllustration } from './ArchivalPlateIllustration';

interface ManuscriptsGalleryScreenProps {
  currentLang: SupportedLanguage;
  onOpenDocument: (doc: ArchiveDocument) => void;
  isSpeaking: boolean;
  onSpeakText: (text: string, lang: SupportedLanguage) => void;
  onStopSpeaking: () => void;
}

export const ManuscriptsGalleryScreen: React.FC<ManuscriptsGalleryScreenProps> = ({
  currentLang,
  onOpenDocument,
  isSpeaking,
  onSpeakText,
  onStopSpeaking
}) => {
  const ui = UI_TRANSLATIONS[currentLang];

  const galleryItems = ARCHIVE_CORPUS.filter(
    (doc) => doc.type === 'manuscript' || doc.type === 'photo'
  );

  const [selectedDocId, setSelectedDocId] = useState<string>(galleryItems[0].id);
  const [activeOcrLine, setActiveOcrLine] = useState<number | null>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  const selectedDoc =
    galleryItems.find((d) => d.id === selectedDocId) || galleryItems[0];
  const localized = selectedDoc.translations?.[currentLang];

  const ocrLines = selectedDoc.ocrLines || [
    {
      lineNumber: 1,
      regionLabel: 'Archival Folio Header · Primary Imprint',
      extractedText: selectedDoc.title.toUpperCase(),
      archivistNote: `Authenticated primary source from ${selectedDoc.archiveLocation}.`,
      confidence: '99.4%'
    },
    {
      lineNumber: 2,
      regionLabel: 'Primary Constitutional / Historical Excerpt',
      extractedText: selectedDoc.excerpt,
      archivistNote: 'Verified against official BAWS critical edition.',
      confidence: '99.1%'
    },
    {
      lineNumber: 3,
      regionLabel: 'Extended Archival Passage',
      extractedText: selectedDoc.transcript.split('\n\n')[0],
      archivistNote: 'Cross-indexed with IndicTrans2 multilingual translation layer.',
      confidence: '98.9%'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="kiosk-glass rounded-2xl p-6 md:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#E5B95C] font-semibold">
              04 · HIGH-RESOLUTION FACSIMILES & OPTICAL CHARACTER RECOGNITION
            </p>
            <h1 className="text-3xl md:text-4xl font-serif-display font-bold text-[#FBF9F5] mt-1">
              {ui.navManuscripts}
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{ui.digitizedVerifiedBadge}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {galleryItems.map((item) => {
            const isSelected = item.id === selectedDoc.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedDocId(item.id);
                  setActiveOcrLine(1);
                }}
                className={`p-3.5 rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#23376B] border-2 border-[#C9932E] shadow-lg'
                    : 'bg-[#0B1328]/85 border border-white/10 hover:border-[#C9932E]/50'
                }`}
              >
                <div>
                  <div className="h-32 rounded-lg overflow-hidden border border-white/10 mb-3">
                    <ArchivalPlateIllustration
                      motif={item.visualMotif}
                      accessionNumber={item.accessionNumber}
                      date={item.date}
                      title={item.title}
                    />
                  </div>
                  <div className="text-[11px] font-mono-tabular text-[#E5B95C]">
                    {item.accessionNumber} · {item.date}
                  </div>
                  <h2 className="text-sm font-serif-display font-semibold text-[#FBF9F5] mt-1 line-clamp-2">
                    {item.title}
                  </h2>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#FBF9F5]/65">
                  <span className="uppercase">{item.type}</span>
                  <span className="text-emerald-300">OCR Verified</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 kiosk-glass rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-[#0F1933] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-mono-tabular text-[#E5B95C]">
              SCANNED FOLIO PLATE · {selectedDoc.accessionNumber}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(1, Number((z - 0.2).toFixed(2))))}
                aria-label="Zoom out manuscript"
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-[#0B1328] border border-white/15 text-xs text-[#FBF9F5] hover:border-[#C9932E] cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono-tabular text-xs text-[#FBF9F5]/80">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.2).toFixed(2))))}
                aria-label="Zoom in manuscript"
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-[#0B1328] border border-white/15 text-xs text-[#FBF9F5] hover:border-[#C9932E] cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setHighContrast((prev) => !prev)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border cursor-pointer ${
                  highContrast
                    ? 'bg-[#C9932E] text-[#0F1933] border-[#C9932E] font-semibold'
                    : 'bg-[#0B1328] text-[#FBF9F5]/80 border-white/15 hover:border-[#C9932E]'
                }`}
              >
                <Contrast className="w-3.5 h-3.5" />
                <span> UV / Contrast</span>
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[520px]">
            <ArchivalPlateIllustration
              motif={selectedDoc.visualMotif}
              accessionNumber={selectedDoc.accessionNumber}
              date={selectedDoc.date}
              title={selectedDoc.title}
              activeOcrLine={activeOcrLine}
              highContrast={highContrast}
              zoomLevel={zoomLevel}
            />
          </div>

          <div className="px-5 py-3 bg-[#0F1933]/90 border-t border-white/10 text-xs text-[#FBF9F5]/65 flex flex-wrap items-center justify-between gap-2">
            <span>Touch any OCR region on the right to highlight its zone on the folio scan</span>
            <span className="font-mono-tabular text-[#E5B95C]">{selectedDoc.pageOrSection}</span>
          </div>
        </div>

        <div className="lg:col-span-6 kiosk-glass rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{ui.digitizedVerifiedBadge}</span>
                </div>
                <h2 className="text-2xl font-serif-display font-bold text-[#FBF9F5] mt-1">
                  OCR Digitized Text & Marginalia Transcription
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  isSpeaking
                    ? onStopSpeaking()
                    : onSpeakText(
                        `${localized?.title || selectedDoc.title}. ${
                          localized?.transcript || selectedDoc.transcript
                        }`,
                        currentLang
                      )
                }
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#C9932E] hover:bg-[#E5B95C] text-[#0F1933] font-semibold text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{ui.stopAudioBtn}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>{ui.listenAudioBtn}</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              {ocrLines.map((line) => {
                const isActive = activeOcrLine === line.lineNumber;
                return (
                  <button
                    key={line.lineNumber}
                    type="button"
                    onClick={() => setActiveOcrLine(line.lineNumber)}
                    className={`w-full p-4 rounded-xl text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#23376B]/90 border border-[#C9932E]'
                        : 'bg-[#0B1328]/85 border border-white/10 hover:border-[#C9932E]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono-tabular text-[#E5B95C]">
                      <span>
                        REGION 0{line.lineNumber} · {line.regionLabel}
                      </span>
                      <span>OCR Confidence: {line.confidence}</span>
                    </div>
                    <p className="text-sm md:text-base text-[#FBF9F5] font-serif-display mt-2 leading-relaxed">
                      {line.extractedText}
                    </p>
                    <p className="text-xs text-[#FBF9F5]/65 mt-2">
                      <strong className="text-emerald-300">Curatorial Note:</strong> {line.archivistNote}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-[#0B1328] border border-white/10 space-y-2">
              <div className="text-xs uppercase tracking-wider text-[#E5B95C] font-semibold">
                Full Normalized Text ({currentLang.toUpperCase()})
              </div>
              <p className="text-xs md:text-sm text-[#FBF9F5]/85 leading-relaxed whitespace-pre-line">
                {localized?.transcript || selectedDoc.transcript}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#FBF9F5]/65">
              Source: {selectedDoc.sourceCitation}
            </span>
            <button
              type="button"
              onClick={() => onOpenDocument(selectedDoc)}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-[#C9932E]/50 text-[#E5B95C] hover:bg-[#C9932E]/15 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Full Reader & QR Handoff</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
