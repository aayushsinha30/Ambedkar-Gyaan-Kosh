import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Search,
  Radio,
  Film,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import {
  ARCHIVE_CORPUS,
  UI_TRANSLATIONS,
  type ArchiveDocument,
  type SupportedLanguage
} from '../data/archiveCorpus';

interface AudioVideoArchiveScreenProps {
  currentLang: SupportedLanguage;
  onOpenDocument: (doc: ArchiveDocument) => void;
  isSpeaking: boolean;
  onSpeakText: (text: string, lang: SupportedLanguage) => void;
  onStopSpeaking: () => void;
}

export const AudioVideoArchiveScreen: React.FC<AudioVideoArchiveScreenProps> = ({
  currentLang,
  onOpenDocument,
  onSpeakText,
  onStopSpeaking
}) => {
  const ui = UI_TRANSLATIONS[currentLang];

  const mediaRecords = ARCHIVE_CORPUS.filter(
    (doc) => doc.type === 'audio' || doc.type === 'video'
  );

  const [selectedMediaId, setSelectedMediaId] = useState<string>(mediaRecords[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25>(1);
  const [transcriptQuery, setTranscriptQuery] = useState<string>('');
  const [voiceSyncEnabled, setVoiceSyncEnabled] = useState<boolean>(true);

  const activeMedia =
    mediaRecords.find((m) => m.id === selectedMediaId) || mediaRecords[0];

  const segments = activeMedia.mediaSegments || [];
  const totalDurationSec = 125;

  const activeSegmentIndex = segments.reduce((acc, seg, idx) => {
    if (currentTimeSec >= seg.seconds) return idx;
    return acc;
  }, 0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setCurrentTimeSec((prev) => {
        if (prev >= totalDurationSec) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, Math.round(1000 / playbackSpeed));

    return () => window.clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      onStopSpeaking();
    } else {
      setIsPlaying(true);
      const currentSeg = segments[activeSegmentIndex];
      if (voiceSyncEnabled && currentSeg) {
        onSpeakText(currentSeg.text, currentLang);
      }
    }
  };

  const handleJumpToSegment = (seconds: number, text: string) => {
    setCurrentTimeSec(seconds);
    setIsPlaying(true);
    if (voiceSyncEnabled) {
      onSpeakText(text, currentLang);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const filteredSegments = segments.filter((seg) => {
    if (!transcriptQuery.trim()) return true;
    const q = transcriptQuery.toLowerCase();
    return (
      seg.text.toLowerCase().includes(q) ||
      seg.speaker.toLowerCase().includes(q) ||
      seg.timestamp.includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="kiosk-glass rounded-2xl p-6 md:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#E5B95C] font-semibold">
              05 · SOUND & BROADCAST PRESERVATION VAULT
            </p>
            <h1 className="text-3xl md:text-4xl font-serif-display font-bold text-[#FBF9F5] mt-1">
              {ui.navMedia}
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Time-Coded Archival Transcripts · Web Speech Audio Synthesis</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {mediaRecords.map((item) => {
            const isSelected = item.id === activeMedia.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedMediaId(item.id);
                  setIsPlaying(false);
                  setCurrentTimeSec(0);
                  onStopSpeaking();
                }}
                className={`p-4 rounded-xl text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#23376B] border-2 border-[#C9932E] shadow-lg'
                    : 'bg-[#0B1328]/85 border border-white/10 hover:border-[#C9932E]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono-tabular text-[#E5B95C]">
                    <span className="inline-flex items-center gap-1.5 uppercase">
                      {item.type === 'audio' ? (
                        <Radio className="w-3.5 h-3.5" />
                      ) : (
                        <Film className="w-3.5 h-3.5" />
                      )}
                      {item.type} REEL
                    </span>
                    <span>{item.mediaDuration || '02:05'}</span>
                  </div>

                  <h2 className="text-base font-serif-display font-semibold text-[#FBF9F5] mt-2 line-clamp-2">
                    {item.title}
                  </h2>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#FBF9F5]/65">
                  <span>{item.date}</span>
                  <span className="font-mono-tabular">{item.accessionNumber}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 kiosk-glass rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 bg-[#0F1933] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-mono-tabular text-[#E5B95C]">
              {activeMedia.accessionNumber} · {activeMedia.archiveLocation}
            </span>
            <span className="text-[#FBF9F5]/75">Original Broadcast Date: {activeMedia.date}</span>
          </div>

          <div className="relative flex-1 min-h-[340px] bg-[#080E1F] p-6 md:p-8 flex flex-col justify-between border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#E5B95C]">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-[#C9932E]'
                  }`}
                />
                <span>
                  {activeMedia.type === 'video'
                    ? '35MM ARCHIVAL NEWSREEL TELECINE'
                    : 'ALL INDIA RADIO / BBC TRANSCRIPTION DISC'}
                </span>
              </div>
              <span className="font-mono-tabular text-xs text-[#FBF9F5]/70">
                TIMECODE {formatTime(currentTimeSec)} / {activeMedia.mediaDuration || '02:05'}
              </span>
            </div>

            <div className="my-6 py-6 px-5 rounded-xl bg-[#111D3B]/90 border border-[#C9932E]/35 text-center space-y-4">
              <div className="flex items-end justify-center gap-1.5 h-12" aria-hidden="true">
                {Array.from({ length: 28 }).map((_, i) => {
                  const baseHeight = 20 + ((i * 17) % 65);
                  const activeHeight = isPlaying
                    ? 25 + (((i * 23 + currentTimeSec * 19) % 75))
                    : Math.round(baseHeight * 0.45);
                  return (
                    <div
                      key={i}
                      style={{ height: `${activeHeight}%` }}
                      className={`w-1.5 rounded-full transition-all duration-150 ${
                        isPlaying ? 'bg-[#E5B95C]' : 'bg-[#C9932E]/45'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="text-xs font-mono-tabular uppercase tracking-wider text-[#E5B95C]">
                {segments[activeSegmentIndex]?.speaker || 'Dr. B. R. Ambedkar'} · Segment [
                {segments[activeSegmentIndex]?.timestamp || '00:00'}]
              </div>

              <p className="text-base md:text-lg font-serif-display italic text-[#FBF9F5] max-w-xl mx-auto leading-relaxed">
                “{segments[activeSegmentIndex]?.text || activeMedia.excerpt}”
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={totalDurationSec}
                value={currentTimeSec}
                onChange={(e) => setCurrentTimeSec(Number(e.target.value))}
                aria-label="Seek archival media timeline"
                className="w-full accent-[#C9932E] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono-tabular text-[#FBF9F5]/60">
                <span>00:00</span>
                <span>Tap any segment in the transcript panel to jump</span>
                <span>{activeMedia.mediaDuration || '02:05'}</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#0F1933] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#C9932E] hover:bg-[#E5B95C] text-[#0F1933] font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Reel</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Archival Reel</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentTimeSec(0);
                  onStopSpeaking();
                }}
                aria-label="Restart media from beginning"
                className="min-h-[48px] px-3.5 py-2.5 rounded-xl bg-[#0B1328] border border-white/15 text-[#FBF9F5]/80 hover:text-white hover:border-[#C9932E] flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setVoiceSyncEnabled((v) => !v)}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  voiceSyncEnabled
                    ? 'bg-[#23376B] border-[#C9932E]/60 text-[#E5B95C]'
                    : 'bg-[#0B1328] border-white/15 text-[#FBF9F5]/65'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>Voice Synthesis: {voiceSyncEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.25 : 1))}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-[#0B1328] border border-white/15 text-xs font-mono-tabular text-[#FBF9F5] hover:border-[#C9932E] cursor-pointer"
              >
                {playbackSpeed}x
              </button>

              <button
                type="button"
                onClick={() => onOpenDocument(activeMedia)}
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[#C9932E]/40 text-xs text-[#E5B95C] hover:bg-[#C9932E]/15 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Citation</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 kiosk-glass rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-serif-display font-bold text-[#FBF9F5]">
                Searchable Synchronized Transcript
              </h2>
              <span className="text-xs font-mono-tabular text-[#E5B95C]">
                {filteredSegments.length} Time-Coded Segments
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#E5B95C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={transcriptQuery}
                onChange={(e) => setTranscriptQuery(e.target.value)}
                placeholder="Search keywords inside this transcript (e.g., 'liberty', 'amendments', 'equality')..."
                aria-label="Search inside media transcript"
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-[#0B1328] border border-[#C9932E]/35 text-xs md:text-sm text-[#FBF9F5] placeholder-[#FBF9F5]/45 focus:outline-none focus:border-[#E5B95C]"
              />
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredSegments.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#0B1328] text-center text-xs text-[#FBF9F5]/70">
                  No transcript segments match “{transcriptQuery}”.
                </div>
              ) : (
                filteredSegments.map((seg) => {
                  const isCurrent =
                    segments[activeSegmentIndex]?.timestamp === seg.timestamp;
                  return (
                    <button
                      key={seg.timestamp}
                      type="button"
                      onClick={() => handleJumpToSegment(seg.seconds, seg.text)}
                      className={`w-full p-4 rounded-xl text-left transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#23376B] border border-[#C9932E]'
                          : 'bg-[#0B1328]/85 border border-white/10 hover:border-[#C9932E]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono-tabular text-[#E5B95C]">
                        <span>[{seg.timestamp}] · {seg.speaker}</span>
                        <span>{isCurrent ? 'ACTIVE SEGMENT' : 'Jump & Listen →'}</span>
                      </div>
                      <p className="text-xs md:text-sm text-[#FBF9F5]/90 mt-1.5 leading-relaxed">
                        {seg.text}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-[#FBF9F5]/65">
            <strong className="text-[#E5B95C]">Archival Provenance:</strong> {activeMedia.sourceCitation}
          </div>
        </div>
      </div>
    </div>
  );
};
