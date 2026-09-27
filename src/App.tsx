import React, { useState, useEffect, useCallback } from 'react';
import {
  Languages,
  Volume2,
  Square,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import {
  ARCHIVE_CORPUS,
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
  type ArchiveDocument,
  type SupportedLanguage
} from './data/archiveCorpus';
import { HomeKioskScreen, type KioskScreenId } from './components/HomeKioskScreen';
import { SemanticSearchScreen } from './components/SemanticSearchScreen';
import { AiAssistantScreen } from './components/AiAssistantScreen';
import { TimelineScreen } from './components/TimelineScreen';
import { ManuscriptsGalleryScreen } from './components/ManuscriptsGalleryScreen';
import { AudioVideoArchiveScreen } from './components/AudioVideoArchiveScreen';
import { SourceViewerModal } from './components/SourceViewerModal';

export function App() {
  const [activeScreen, setActiveScreen] = useState<KioskScreenId>('home');
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [searchSeedQuery, setSearchSeedQuery] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<ArchiveDocument | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAttractMode, setIsAttractMode] = useState<boolean>(false);

  const ui = UI_TRANSLATIONS[currentLang];

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const handleSpeakText = useCallback(
    (text: string, langCode: SupportedLanguage) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      utterance.lang = langMeta?.speechLang || 'en-IN';
      utterance.rate = 0.96;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const handleNavigate = (screen: KioskScreenId, initialQuery?: string) => {
    handleStopSpeaking();
    if (initialQuery !== undefined) {
      setSearchSeedQuery(initialQuery);
    }
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: Array<{ id: KioskScreenId; label: string }> = [
    { id: 'search', label: ui.navSearch },
    { id: 'assistant', label: ui.navAssistant },
    { id: 'timeline', label: ui.navTimeline },
    { id: 'manuscripts', label: ui.navManuscripts },
    { id: 'media', label: ui.navMedia }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1933] text-[#FBF9F5] relative">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 18% 12%, rgba(201, 147, 46, 0.16), transparent 42%), radial-gradient(circle at 85% 80%, rgba(35, 55, 107, 0.45), transparent 50%)'
        }}
        aria-hidden="true"
      />

      <header className="sticky top-0 z-30 bg-[#0F1933]/90 backdrop-blur-xl border-b border-[#C9932E]/25 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="text-2xl md:text-3xl font-serif-display font-bold tracking-tight text-[#FBF9F5] hover:text-[#E5B95C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {ui.heroTitle}
          </button>

          <nav
            aria-label="Primary Kiosk Navigation"
            className="hidden xl:flex items-center gap-7 text-sm font-medium"
          >
            {navItems.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-[#E5B95C] border-[#C9932E] font-semibold'
                      : 'text-[#FBF9F5]/80 border-transparent hover:text-[#FBF9F5] hover:border-white/30'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Languages className="w-4 h-4 text-[#E5B95C] absolute left-3 pointer-events-none" />
              <select
                value={currentLang}
                onChange={(e) => setCurrentLang(e.target.value as SupportedLanguage)}
                aria-label="Select Kiosk Display and Translation Language"
                className="min-h-[42px] pl-9 pr-4 py-2 rounded-lg bg-[#1A2A52] border border-[#C9932E]/45 text-xs font-semibold text-[#FBF9F5] focus:outline-none focus:border-[#E5B95C] cursor-pointer whitespace-nowrap"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#0F1933] text-[#FBF9F5]">
                    {lang.nativeName} · {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {isSpeaking ? (
              <button
                type="button"
                onClick={handleStopSpeaking}
                className="min-h-[42px] px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{ui.stopAudioBtn}</span>
              </button>
            ) : activeScreen !== 'home' ? (
              <button
                type="button"
                onClick={() => handleNavigate('home')}
                className="min-h-[42px] px-4 py-2 rounded-lg bg-[#C9932E] hover:bg-[#E5B95C] text-[#0F1933] text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{ui.navHome}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleSpeakText(
                    `${ui.heroTitle}. ${ui.heroDescription}`,
                    currentLang
                  )
                }
                className="min-h-[42px] px-4 py-2 rounded-lg bg-[#C9932E] hover:bg-[#E5B95C] text-[#0F1933] text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{ui.listenAudioBtn}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="xl:hidden relative z-20 px-6 pt-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
              activeScreen === 'home'
                ? 'bg-[#C9932E] text-[#0F1933] font-semibold'
                : 'bg-[#1A2A52]/80 text-[#FBF9F5]/80 border border-white/10'
            }`}
          >
            {ui.navHome}
          </button>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                activeScreen === item.id
                  ? 'bg-[#C9932E] text-[#0F1933] font-semibold'
                  : 'bg-[#1A2A52]/80 text-[#FBF9F5]/80 border border-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-6 pt-6">
        {activeScreen === 'home' && (
          <HomeKioskScreen
            currentLang={currentLang}
            onSelectLanguage={setCurrentLang}
            onNavigate={handleNavigate}
            onOpenDocument={(doc) => setSelectedDocument(doc)}
            isSpeaking={isSpeaking}
            onSpeakText={handleSpeakText}
            onStopSpeaking={handleStopSpeaking}
            onTriggerAttractMode={() => setIsAttractMode(true)}
          />
        )}

        {activeScreen === 'search' && (
          <SemanticSearchScreen
            currentLang={currentLang}
            initialQuery={searchSeedQuery}
            onOpenDocument={(doc) => setSelectedDocument(doc)}
            isSpeaking={isSpeaking}
            onSpeakText={handleSpeakText}
            onStopSpeaking={handleStopSpeaking}
          />
        )}

        {activeScreen === 'assistant' && (
          <AiAssistantScreen
            currentLang={currentLang}
            onOpenDocument={(doc) => setSelectedDocument(doc)}
            isSpeaking={isSpeaking}
            onSpeakText={handleSpeakText}
            onStopSpeaking={handleStopSpeaking}
          />
        )}

        {activeScreen === 'timeline' && (
          <TimelineScreen
            currentLang={currentLang}
            onOpenDocument={(doc) => setSelectedDocument(doc)}
            isSpeaking={isSpeaking}
            onSpeakText={handleSpeakText}
            onStopSpeaking={handleStopSpeaking}
          />
        )}

        {activeScreen === 'manuscripts' && (
          <ManuscriptsGalleryScreen
            currentLang={currentLang}
            onOpenDocument={(doc) => setSelectedDocument(doc)}
            isSpeaking={isSpeaking}
            onSpeakText={handleSpeakText}
            onStopSpeaking={handleStopSpeaking}
          />
        )}

        {activeScreen === 'media' && (
          <AudioVideoArchiveScreen
            currentLang={currentLang}
            onOpenDocument={(doc) => setSelectedDocument(doc)}
            isSpeaking={isSpeaking}
            onSpeakText={handleSpeakText}
            onStopSpeaking={handleStopSpeaking}
          />
        )}
      </main>

      <footer className="relative z-10 border-t border-white/10 px-6 py-5 bg-[#0B1328]/80">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#FBF9F5]/65">
          <div>
            Ambedkar Gyaan Kosh · Digital Heritage Archive Kiosk Prototype · Built for Dr. Ambedkar International Centre
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span>{ARCHIVE_CORPUS.length} Verified Primary Records</span>
            <span aria-hidden="true">·</span>
            <span>6 Languages (Web Speech TTS Active)</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setSelectedDocument(ARCHIVE_CORPUS[1])}
              className="text-[#E5B95C] hover:underline cursor-pointer"
            >
              Inspect Article 32 Folio
            </button>
          </div>
        </div>
      </footer>

      <SourceViewerModal
        document={selectedDocument}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onClose={() => setSelectedDocument(null)}
        isSpeaking={isSpeaking}
        onSpeakText={handleSpeakText}
        onStopSpeaking={handleStopSpeaking}
      />

      {isAttractMode && (
        <div
          onClick={() => setIsAttractMode(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsAttractMode(false);
          }}
          className="fixed inset-0 z-50 bg-[#080F22]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer select-none"
        >
          <div className="max-w-3xl kiosk-glass rounded-3xl p-10 md:p-14 border border-[#C9932E]/50 shadow-2xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#E5B95C] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>DR. AMBEDKAR INTERNATIONAL CENTRE · MEMORIAL KIOSK TERMINAL</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-serif-display font-bold text-[#FBF9F5]">
              {ui.heroTitle}
            </h2>

            <blockquote className="text-xl md:text-2xl font-serif-display italic text-[#E5B95C] max-w-2xl mx-auto leading-relaxed">
              “Cultivation of mind should be the ultimate aim of human existence. Political democracy cannot last unless there lies at the base of it social democracy.”
            </blockquote>

            <p className="text-xs font-mono-tabular text-[#FBF9F5]/70">
              — Dr. B. R. Ambedkar · Constituent Assembly Debates & Writings
            </p>

            <div className="pt-4">
              <span className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#C9932E] text-[#0F1933] font-bold text-base shadow-xl">
                Touch Anywhere on Screen to Begin Exploring the Archive
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
