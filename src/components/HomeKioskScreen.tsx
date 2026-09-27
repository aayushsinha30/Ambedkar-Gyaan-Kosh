import React from 'react';
import {
  Search,
  MessageSquareQuote,
  Clock,
  FileText,
  Film,
  Languages,
  Volume2,
  Square,
  ArrowUpRight,
  Sparkles,
  BookOpenCheck,
  QrCode
} from 'lucide-react';
import {
  ARCHIVE_CORPUS,
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
  type ArchiveDocument,
  type SupportedLanguage
} from '../data/archiveCorpus';
import { ArchivalPlateIllustration } from './ArchivalPlateIllustration';

export type KioskScreenId = 'home' | 'search' | 'assistant' | 'timeline' | 'manuscripts' | 'media';

interface HomeKioskScreenProps {
  currentLang: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onNavigate: (screen: KioskScreenId, initialQuery?: string) => void;
  onOpenDocument: (doc: ArchiveDocument) => void;
  isSpeaking: boolean;
  onSpeakText: (text: string, lang: SupportedLanguage) => void;
  onStopSpeaking: () => void;
  onTriggerAttractMode: () => void;
}

export const HomeKioskScreen: React.FC<HomeKioskScreenProps> = ({
  currentLang,
  onSelectLanguage,
  onNavigate,
  onOpenDocument,
  isSpeaking,
  onSpeakText,
  onStopSpeaking,
  onTriggerAttractMode
}) => {
  const ui = UI_TRANSLATIONS[currentLang];
  const featuredDoc = ARCHIVE_CORPUS[0];
  const localizedFeatured = featuredDoc.translations?.[currentLang];
  const featuredTitle = localizedFeatured?.title || featuredDoc.title;
  const featuredExcerpt = localizedFeatured?.excerpt || featuredDoc.excerpt;

  const kioskModules: Array<{
    id: KioskScreenId;
    index: string;
    title: string;
    subtitle: string;
    meta: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'search',
      index: '01',
      title: ui.navSearch,
      subtitle: 'Query speeches, constitutional clauses, and economic monographs using natural language.',
      meta: `${ARCHIVE_CORPUS.length} Verified Primary Records · Multilingual`,
      icon: <Search className="w-6 h-6 text-[#E5B95C]" />
    },
    {
      id: 'assistant',
      index: '02',
      title: ui.navAssistant,
      subtitle: 'Ask complex constitutional or historical questions with mandatory document & page citations.',
      meta: 'Citation-Locked RAG · Zero Extrapolation Guardrail',
      icon: <MessageSquareQuote className="w-6 h-6 text-[#E5B95C]" />
    },
    {
      id: 'timeline',
      index: '03',
      title: ui.navTimeline,
      subtitle: 'Explore 10 foundational milestones from Mhow (1891) and LSE (1923) to the Constitution (1949).',
      meta: '1891 – 1956 · Interactive Archival Chronology',
      icon: <Clock className="w-6 h-6 text-[#E5B95C]" />
    },
    {
      id: 'manuscripts',
      index: '04',
      title: ui.navManuscripts,
      subtitle: 'Inspect high-resolution manuscript facsimiles alongside synchronized OCR digitized text.',
      meta: '600 DPI Facsimiles · Archivist Verified OCR',
      icon: <FileText className="w-6 h-6 text-[#E5B95C]" />
    },
    {
      id: 'media',
      index: '05',
      title: ui.navMedia,
      subtitle: 'Listen to historic radio broadcasts and documentary reels with searchable time-coded transcripts.',
      meta: 'Synchronized Audio & Transcripts · Web Speech TTS',
      icon: <Film className="w-6 h-6 text-[#E5B95C]" />
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 text-xs text-[#FBF9F5]/75">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#E5B95C] font-medium">{ui.kioskSubtitle}</span>
          <span aria-hidden="true">·</span>
          <span>Terminal 04 · Central Constitutional Rotunda</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">17 Primary Sources Indexed</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#FBF9F5]/65">{ui.demoModeNotice}</span>
          <button
            type="button"
            onClick={onTriggerAttractMode}
            className="text-[#E5B95C] hover:underline font-medium cursor-pointer whitespace-nowrap"
          >
            Preview Kiosk Idle Screen
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 kiosk-glass rounded-2xl p-7 md:p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#E5B95C] font-semibold">
              {ui.heroKicker}
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-serif-display font-bold text-[#FBF9F5] mt-3 leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              {ui.heroTitle}
            </h1>
            <p className="text-base md:text-lg text-[#FBF9F5]/85 mt-4 leading-relaxed max-w-2xl">
              {ui.heroDescription}
            </p>

            <div className="mt-7 pt-6 border-t border-white/10">
              <p className="text-xs text-[#FBF9F5]/65 mb-3">
                Touch an inquiry to launch Semantic Search or AI Scholar:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {[
                  'Why is Article 32 the soul of the Constitution?',
                  'Social Democracy & Grammar of Anarchy (1949)',
                  'Reserve Bank of India & Problem of the Rupee (1923)',
                  'Women’s Equal Property Rights in Hindu Code Bill'
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => onNavigate('search', prompt)}
                    className="min-h-[42px] px-3.5 py-2 rounded-lg text-xs font-medium bg-[#0F1933]/80 border border-[#C9932E]/30 text-[#FBF9F5]/90 hover:border-[#E5B95C] hover:bg-[#C9932E]/15 transition-colors text-left cursor-pointer"
                  >
                    “{prompt}”
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('search')}
              className="min-h-[52px] px-6 py-3 rounded-xl bg-[#C9932E] hover:bg-[#E5B95C] text-[#0F1933] font-semibold text-sm flex items-center gap-2.5 transition-colors shadow-lg cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>{ui.exploreArchiveCta}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('assistant')}
              className="min-h-[52px] px-6 py-3 rounded-xl bg-[#0F1933]/90 hover:bg-[#23376B] text-[#FBF9F5] border border-[#C9932E]/50 font-semibold text-sm flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-[#E5B95C]" />
              <span>{ui.askAssistantCta}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 kiosk-glass rounded-2xl p-6 md:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-[#E5B95C] font-mono-tabular">
              <span>FEATURED ARCHIVAL FOLIO · {featuredDoc.accessionNumber}</span>
              <span>{featuredDoc.date}</span>
            </div>

            <div className="mt-4 h-52 rounded-xl overflow-hidden border border-[#C9932E]/30">
              <ArchivalPlateIllustration
                motif={featuredDoc.visualMotif}
                accessionNumber={featuredDoc.accessionNumber}
                date={featuredDoc.date}
                title={featuredDoc.title}
              />
            </div>

            <h2 className="text-xl md:text-2xl font-serif-display font-semibold text-[#FBF9F5] mt-4 leading-snug">
              {featuredTitle}
            </h2>

            <blockquote className="mt-3 pl-3.5 border-l-2 border-[#C9932E] text-sm text-[#FBF9F5]/85 italic leading-relaxed">
              “{featuredExcerpt}”
            </blockquote>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  isSpeaking
                    ? onStopSpeaking()
                    : onSpeakText(`${featuredTitle}. ${featuredExcerpt}`, currentLang)
                }
                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  isSpeaking
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#C9932E]/20 border border-[#C9932E]/50 text-[#E5B95C] hover:bg-[#C9932E] hover:text-[#0F1933]'
                }`}
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

              <button
                type="button"
                onClick={() => onOpenDocument(featuredDoc)}
                className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-[#FBF9F5] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpenCheck className="w-4 h-4 text-[#E5B95C]" />
                <span>{ui.viewSourceBtn}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenDocument(featuredDoc)}
              aria-label="Open QR Code handoff for featured document"
              className="min-h-[44px] px-3 py-2 rounded-lg text-xs text-[#FBF9F5]/75 hover:text-[#E5B95C] flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>QR</span>
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Kiosk Navigation Modules">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-serif-display font-semibold text-[#FBF9F5]">
            Touchscreen Kiosk Modules
          </h2>
          <span className="text-xs text-[#FBF9F5]/65">
            Select any wing to explore primary sources, manuscripts, or verified AI synthesis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kioskModules.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => onNavigate(mod.id)}
              className="group kiosk-glass rounded-2xl p-6 text-left flex flex-col justify-between min-h-[196px] hover:border-[#E5B95C] hover:bg-[#23376B]/75 transition-all cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono-tabular text-xs text-[#E5B95C] font-semibold">
                    {mod.index}. ARCHIVE WING
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-[#0F1933]/90 border border-[#C9932E]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {mod.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-serif-display font-semibold text-[#FBF9F5] mt-3 group-hover:text-[#E5B95C] transition-colors">
                  {mod.title}
                </h3>

                <p className="text-sm text-[#FBF9F5]/80 mt-2 leading-relaxed">
                  {mod.subtitle}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-[#FBF9F5]/65">
                <span>{mod.meta}</span>
                <ArrowUpRight className="w-4 h-4 text-[#E5B95C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>
          ))}

          <div className="kiosk-glass rounded-2xl p-6 flex flex-col justify-between min-h-[196px]">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono-tabular text-xs text-[#E5B95C] font-semibold">
                  06. MULTILINGUAL & VOICE ACCESS
                </span>
                <div className="w-11 h-11 rounded-xl bg-[#0F1933]/90 border border-[#C9932E]/30 flex items-center justify-center">
                  <Languages className="w-6 h-6 text-[#E5B95C]" />
                </div>
              </div>

              <h3 className="text-2xl font-serif-display font-semibold text-[#FBF9F5] mt-3">
                Language & Speech Synthesis
              </h3>

              <p className="text-xs text-[#FBF9F5]/75 mt-1.5">
                Switch kiosk interface labels and IndicTrans2 verified document translations:
              </p>

              <div className="grid grid-cols-3 gap-2 mt-3.5">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onSelectLanguage(lang.code)}
                    className={`min-h-[42px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center cursor-pointer ${
                      currentLang === lang.code
                        ? 'bg-[#C9932E] text-[#0F1933] font-bold shadow-sm'
                        : 'bg-[#0F1933]/80 text-[#FBF9F5]/85 border border-white/10 hover:border-[#C9932E]/50'
                    }`}
                  >
                    <span className="whitespace-nowrap">{lang.nativeName}</span>
                    <span className="text-[10px] opacity-75">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
