import React, { useState } from 'react';
import {
  Send,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Volume2,
  Square,
  RotateCcw
} from 'lucide-react';
import {
  ARCHIVE_CORPUS,
  PRE_WRITTEN_QA_PAIRS,
  UI_TRANSLATIONS,
  retrieveGroundedAnswer,
  type ArchiveDocument,
  type AssistantResponsePayload,
  type SupportedLanguage
} from '../data/archiveCorpus';

interface AiAssistantScreenProps {
  currentLang: SupportedLanguage;
  onOpenDocument: (doc: ArchiveDocument) => void;
  isSpeaking: boolean;
  onSpeakText: (text: string, lang: SupportedLanguage) => void;
  onStopSpeaking: () => void;
}

interface ChatTurn {
  id: string;
  role: 'visitor' | 'assistant';
  text: string;
  timestamp: string;
  payload?: AssistantResponsePayload;
}

export const AiAssistantScreen: React.FC<AiAssistantScreenProps> = ({
  currentLang,
  onOpenDocument,
  isSpeaking,
  onSpeakText,
  onStopSpeaking
}) => {
  const ui = UI_TRANSLATIONS[currentLang];

  const initialGrounded = retrieveGroundedAnswer(PRE_WRITTEN_QA_PAIRS[0].question);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'init-q',
      role: 'visitor',
      text: PRE_WRITTEN_QA_PAIRS[0].question,
      timestamp: 'Archival Session Initialized'
    },
    {
      id: 'init-a',
      role: 'assistant',
      text: initialGrounded.answer,
      timestamp: 'Verified Retrieval',
      payload: initialGrounded
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const visitorTurn: ChatTurn = {
      id: `v-${Date.now()}`,
      role: 'visitor',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, visitorTurn]);
    setInputQuery('');
    setIsLoading(true);

    let payload: AssistantResponsePayload | null = null;
    try {
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed })
      });
      if (res.ok) {
        payload = await res.json();
      }
    } catch (_err) {
      // Offline fallback
    }

    if (!payload) {
      payload = retrieveGroundedAnswer(trimmed);
    }

    const assistantTurn: ChatTurn = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: payload.answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      payload
    };

    setMessages((prev) => [...prev, assistantTurn]);
    setIsLoading(false);
  };

  const handleInspectCitation = (documentId: string) => {
    const doc = ARCHIVE_CORPUS.find((d) => d.id === documentId);
    if (doc) {
      onOpenDocument(doc);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
      {/* Left 4 Columns: Curated Kiosk Prompts & Guardrail Tester */}
      <aside className="lg:col-span-4 space-y-5">
        <div className="kiosk-glass rounded-2xl p-6 space-y-4">
          <p className="text-xs uppercase tracking-widest text-[#E5B95C] font-semibold">
            02 · CITATION-LOCKED AI SCHOLAR
          </p>
          <h1 className="text-2xl md:text-3xl font-serif-display font-bold text-[#FBF9F5]">
            {ui.navAssistant}
          </h1>
          <p className="text-xs md:text-sm text-[#FBF9F5]/80 leading-relaxed">
            Every response is synthesized strictly from verified primary archival speeches, Constituent Assembly debates, and manuscripts. Unverified or out-of-corpus queries are declined automatically.
          </p>

          <div className="pt-3 border-t border-white/10 space-y-2.5">
            <p className="text-xs font-semibold text-[#E5B95C]">
              Touch a Scholarly Inquiry:
            </p>
            {PRE_WRITTEN_QA_PAIRS.map((qa) => (
              <button
                key={qa.id}
                type="button"
                onClick={() => handleAskQuestion(qa.question)}
                disabled={isLoading}
                className="w-full min-h-[48px] p-3 rounded-xl bg-[#0F1933]/85 border border-white/10 hover:border-[#C9932E] text-left text-xs text-[#FBF9F5]/90 hover:bg-[#C9932E]/15 transition-colors cursor-pointer"
              >
                {qa.question}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <p className="text-xs text-[#FBF9F5]/65">
              Zero-Hallucination Guardrail Verification:
            </p>
            <button
              type="button"
              onClick={() =>
                handleAskQuestion('What were Dr. Ambedkar’s predictions on cryptocurrency and space travel in 2026?')
              }
              disabled={isLoading}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 hover:bg-amber-500/20 text-left text-xs text-amber-200 font-medium transition-colors cursor-pointer"
            >
              Test Unverified / Out-of-Corpus Query Guardrail →
            </button>
          </div>
        </div>
      </aside>

      {/* Right 8 Columns: Chat Stream & Source Citation Panel */}
      <section className="lg:col-span-8 kiosk-glass rounded-2xl flex flex-col min-h-[680px] max-h-[82vh] overflow-hidden">
        <div className="px-6 py-4 bg-[#0F1933]/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#FBF9F5]/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-[#FBF9F5]">Retrieval-Augmented Archival Mode</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#E5B95C]">Citation-Only Enforcement Active</span>
          </div>

          <button
            type="button"
            onClick={() =>
              setMessages([
                {
                  id: 'init-q',
                  role: 'visitor',
                  text: PRE_WRITTEN_QA_PAIRS[0].question,
                  timestamp: 'Reset Session'
                },
                {
                  id: 'init-a',
                  role: 'assistant',
                  text: initialGrounded.answer,
                  timestamp: 'Verified Retrieval',
                  payload: initialGrounded
                }
              ])
            }
            className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs text-[#FBF9F5]/70 hover:text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Thread</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => {
            if (msg.role === 'visitor') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-xl rounded-2xl rounded-tr-sm bg-[#23376B] border border-[#C9932E]/40 px-5 py-3.5 text-[#FBF9F5]">
                    <div className="text-[11px] text-[#E5B95C] font-mono-tabular mb-1">
                      VISITOR INQUIRY · {msg.timestamp}
                    </div>
                    <p className="text-sm md:text-base font-medium leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            }

            const payload = msg.payload;
            const isVerified = payload?.foundInArchive ?? false;

            return (
              <div key={msg.id} className="flex justify-start">
                <div className="w-full max-w-3xl rounded-2xl rounded-tl-sm bg-[#0B1328]/95 border border-white/15 p-5 md:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                    {isVerified ? (
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{ui.verifiedArchiveBadge}</span>
                        <span aria-hidden="true" className="text-white/30">·</span>
                        <span className="font-mono-tabular text-[#E5B95C] font-normal">
                          {payload?.citations.length} Primary Source(s) Cited
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>No verified source found for this query</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        isSpeaking
                          ? onStopSpeaking()
                          : onSpeakText(msg.text.replace(/\*\*/g, ''), currentLang)
                      }
                      className="min-h-[36px] px-3 py-1 rounded-lg text-xs border border-[#C9932E]/35 text-[#E5B95C] hover:bg-[#C9932E]/15 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-3 h-3 fill-current text-rose-400" />
                          <span>{ui.stopAudioBtn}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{ui.listenAudioBtn}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 text-sm md:text-base text-[#FBF9F5]/90 leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </div>

                  {isVerified && payload && payload.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#C9932E]/30 bg-[#121F40]/90 rounded-xl p-4 space-y-3">
                      <div className="text-xs uppercase tracking-wider text-[#E5B95C] font-semibold flex items-center justify-between">
                        <span>Verified Source Citations (Document Name + Page/Section)</span>
                        <span className="font-mono-tabular text-[11px] text-[#FBF9F5]/60">
                          ARCHIVE RAG GROUNDING
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {payload.citations.map((cit) => (
                          <div
                            key={cit.documentId}
                            className="p-3.5 rounded-lg bg-[#0B1328] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="text-xs font-mono-tabular text-[#E5B95C]">
                                {cit.accessionNumber} · {cit.date} ·{' '}
                                <strong className="text-[#FBF9F5]">{cit.pageOrSection}</strong>
                              </div>
                              <div className="text-sm font-serif-display font-semibold text-[#FBF9F5]">
                                {cit.documentTitle}
                              </div>
                              <div className="text-xs text-[#FBF9F5]/70">
                                {cit.sourceCitation}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleInspectCitation(cit.documentId)}
                              className="min-h-[40px] px-3.5 py-2 rounded-lg bg-[#C9932E] hover:bg-[#E5B95C] text-[#0F1933] font-semibold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Inspect Source</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="p-4 rounded-xl bg-[#0B1328] border border-[#C9932E]/30 text-xs text-[#E5B95C] font-mono-tabular">
              Searching verified archival corpus and verifying citations...
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion(inputQuery);
          }}
          className="p-4 bg-[#0F1933] border-t border-white/10 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about Dr. Ambedkar’s writings, speeches, or constitutional debates..."
            aria-label="Ask the verified archival research assistant"
            className="flex-1 min-h-[52px] px-4 py-3 rounded-xl bg-[#0B1328] border border-[#C9932E]/40 text-[#FBF9F5] placeholder-[#FBF9F5]/45 text-sm md:text-base focus:outline-none focus:border-[#E5B95C]"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="min-h-[52px] px-6 py-3 rounded-xl bg-[#C9932E] hover:bg-[#E5B95C] disabled:opacity-40 text-[#0F1933] font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            <span>Ask Archive</span>
          </button>
        </form>
      </section>
    </div>
  );
};
