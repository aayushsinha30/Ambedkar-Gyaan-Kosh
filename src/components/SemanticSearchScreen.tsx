import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Volume2,
  Square,
  ShieldCheck,
  X
} from 'lucide-react';
import {
  ARCHIVE_CORPUS,
  UI_TRANSLATIONS,
  type ArchiveDocument,
  type ArchiveItemType,
  type SupportedLanguage
} from '../data/archiveCorpus';

interface SemanticSearchScreenProps {
  currentLang: SupportedLanguage;
  initialQuery?: string;
  onOpenDocument: (doc: ArchiveDocument) => void;
  isSpeaking: boolean;
  onSpeakText: (text: string, lang: SupportedLanguage) => void;
  onStopSpeaking: () => void;
}

interface RankedSearchResult {
  doc: ArchiveDocument;
  relevanceScore: number;
  matchReason: string;
}

const CATEGORIES = [
  'All',
  'Constitutional Debates',
  'Social Justice & Caste',
  'Economics & Finance',
  'Civic Movements',
  'Legislative Reform',
  'Buddhism & Philosophy'
] as const;

const ITEM_TYPES: Array<{ id: 'all' | ArchiveItemType; label: string }> = [
  { id: 'all', label: 'All Formats' },
  { id: 'speech', label: 'Speeches' },
  { id: 'manuscript', label: 'Manuscripts & Theses' },
  { id: 'photo', label: 'Archival Plates' },
  { id: 'audio', label: 'Audio Broadcasts' },
  { id: 'video', label: 'Documentary Reels' }
];

const NATURAL_LANGUAGE_SUGGESTIONS = [
  'Why did Ambedkar call Article 32 the soul of the Constitution?',
  'What is the Grammar of Anarchy and social democracy?',
  'How did The Problem of the Rupee shape the Reserve Bank of India?',
  'Women’s equal property rights and the Hindu Code Bill resignation',
  'Mahad Chavdar Tank satyagraha and universal human rights',
  'Division of labourers in Annihilation of Caste (1936)',
  '8-hour working day, maternity benefits, and labour welfare'
];

export const SemanticSearchScreen: React.FC<SemanticSearchScreenProps> = ({
  currentLang,
  initialQuery = '',
  onOpenDocument,
  isSpeaking,
  onSpeakText,
  onStopSpeaking
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | ArchiveItemType>('all');
  const [results, setResults] = useState<RankedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const ui = UI_TRANSLATIONS[currentLang];

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    let active = true;
    const runSearch = async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: query,
          category: selectedCategory,
          type: selectedType
        });
        const response = await fetch(`/api/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (active && Array.isArray(data.results)) {
            setResults(data.results);
            setIsSearching(false);
            return;
          }
        }
      } catch (_err) {
        // Fallback
      }

      const q = query.trim().toLowerCase();
      let list = ARCHIVE_CORPUS.map((doc) => ({
        doc,
        relevanceScore: 100,
        matchReason: 'Verified Primary Corpus'
      }));

      if (selectedCategory !== 'All') {
        list = list.filter((item) => item.doc.category === selectedCategory);
      }
      if (selectedType !== 'all') {
        list = list.filter((item) => item.doc.type === selectedType);
      }

      if (q.length > 0) {
        const tokens = q
          .replace(/[^a-z0-9\u0900-\u097F\s]/g, ' ')
          .split(/\s+/)
          .filter((t) => t.length > 2);

        list = list
          .map(({ doc }) => {
            let score = 0;
            const matched: string[] = [];
            const hay = `${doc.title} ${doc.excerpt} ${doc.transcript} ${doc.semanticKeywords.join(' ')}`.toLowerCase();
            if (doc.title.toLowerCase().includes(q)) {
              score += 35;
              matched.push('Title match');
            }
            for (const token of tokens) {
              if (doc.semanticKeywords.some((k) => k.toLowerCase().includes(token))) {
                score += 16;
                matched.push(token);
              } else if (hay.includes(token)) {
                score += 8;
                matched.push(token);
              }
            }
            return {
              doc,
              relevanceScore: Math.min(99, score),
              matchReason:
                matched.length > 0
                  ? `Semantic match: ${Array.from(new Set(matched)).slice(0, 4).join(', ')}`
                  : 'Conceptual archive match'
            };
          })
          .filter((r) => r.relevanceScore > 0)
          .sort((a, b) => b.relevanceScore - a.relevanceScore);
      }

      if (active) {
        setResults(list);
        setIsSearching(false);
      }
    };

    runSearch();
    return () => {
      active = false;
    };
  }, [query, selectedCategory, selectedType]);

  return (
    <div className="space-y-6 pb-12">
      <div className="kiosk-glass rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#E5B95C] font-semibold">
              01 · SEMANTIC ARCHIVAL RETRIEVAL ENGINE
            </p>
            <h1 className="text-3xl md:text-4xl font-serif-display font-bold text-[#FBF9F5] mt-1">
              {ui.navSearch}
            </h1>
          </div>
          <p className="text-xs text-[#FBF9F5]/70 font-mono-tabular">
            Showing {results.length} of {ARCHIVE_CORPUS.length} Verified Primary Records
          </p>
        </div>

        <div className="relative mt-5">
          <Search className="w-5 h-5 text-[#E5B95C] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask or search in natural language (e.g., 'What safeguards protect minority rights and social democracy?')..."
            aria-label="Search archival records using natural language"
            className="w-full min-h-[56px] pl-12 pr-12 py-3.5 rounded-xl bg-[#0B1328] border border-[#C9932E]/45 text-[#FBF9F5] placeholder-[#FBF9F5]/45 text-base focus:outline-none focus:border-[#E5B95C] transition-colors"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#FBF9F5]/60 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-4">
          <span className="text-xs text-[#FBF9F5]/65 block mb-2">
            Suggested Natural-Language Queries (Touch to run):
          </span>
          <div className="flex flex-wrap gap-2">
            {NATURAL_LANGUAGE_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  query === suggestion
                    ? 'bg-[#C9932E] text-[#0F1933] font-semibold'
                    : 'bg-[#0F1933]/85 border border-white/15 text-[#FBF9F5]/85 hover:border-[#C9932E]/50'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C9932E] text-[#0F1933] font-semibold'
                    : 'bg-[#0F1933]/70 text-[#FBF9F5]/75 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#0B1328] border border-white/10">
            {ITEM_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedType(item.id)}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedType === item.id
                    ? 'bg-[#23376B] text-[#E5B95C] font-semibold'
                    : 'text-[#FBF9F5]/70 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isSearching ? (
        <div className="kiosk-glass rounded-2xl p-12 text-center text-sm text-[#FBF9F5]/75">
          Ranking verified archival records...
        </div>
      ) : results.length === 0 ? (
        <div className="kiosk-glass rounded-2xl p-12 text-center space-y-3">
          <p className="text-xl font-serif-display text-[#E5B95C]">
            No verified source found matching both your query and active filters.
          </p>
          <p className="text-sm text-[#FBF9F5]/70">
            Try resetting the category or format filters to search across all primary archival documents.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCategory('All');
              setSelectedType('all');
            }}
            className="mt-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#C9932E] text-[#0F1933] text-xs font-semibold cursor-pointer"
          >
            Reset Search Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(({ doc, relevanceScore, matchReason }, index) => {
            const localized = doc.translations?.[currentLang];
            const titleText = localized?.title || doc.title;
            const excerptText = localized?.excerpt || doc.excerpt;

            return (
              <article
                key={doc.id}
                className="kiosk-glass rounded-2xl p-6 hover:border-[#E5B95C]/70 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#FBF9F5]/70">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-tabular text-[#E5B95C] font-semibold">
                      #{String(index + 1).padStart(2, '0')} · {doc.accessionNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#FBF9F5]/90 font-medium">{doc.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="uppercase tracking-wider">{doc.type}</span>
                    <span aria-hidden="true">·</span>
                    <span>Language: {doc.language}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono-tabular text-xs">
                    {query.trim().length > 0 && (
                      <>
                        <span className="text-[#E5B95C]">Relevance {relevanceScore}%</span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Archivist Verified
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-serif-display font-semibold text-[#FBF9F5] mt-2.5">
                  {titleText}
                </h2>

                <p className="text-sm md:text-base text-[#FBF9F5]/85 mt-2.5 leading-relaxed max-w-4xl">
                  “{excerptText}”
                </p>

                <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-[#FBF9F5]/65 space-y-0.5">
                    <div>
                      <strong className="text-[#E5B95C]">Source Citation:</strong> {doc.sourceCitation} ({doc.pageOrSection})
                    </div>
                    {query.trim().length > 0 && (
                      <div className="text-[#FBF9F5]/55">{matchReason}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        isSpeaking
                          ? onStopSpeaking()
                          : onSpeakText(`${titleText}. ${excerptText}`, currentLang)
                      }
                      className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium border border-[#C9932E]/40 text-[#FBF9F5] hover:bg-[#C9932E]/20 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
                          <span>{ui.stopAudioBtn}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-[#E5B95C]" />
                          <span>{ui.listenAudioBtn}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDocument(doc)}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#C9932E] hover:bg-[#E5B95C] text-[#0F1933] font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{ui.viewSourceBtn}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
