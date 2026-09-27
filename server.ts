import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  ARCHIVE_CORPUS,
  TIMELINE_MILESTONES,
  retrieveGroundedAnswer,
  type ArchiveDocument
} from './src/data/archiveCorpus.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/archive', (_req, res) => {
    res.json({
      corpus: ARCHIVE_CORPUS,
      timeline: TIMELINE_MILESTONES,
      totalCount: ARCHIVE_CORPUS.length
    });
  });

  app.get('/api/search', (req, res) => {
    const query = String(req.query.q || '').trim().toLowerCase();
    const category = String(req.query.category || 'All');
    const type = String(req.query.type || 'all');

    let filtered: Array<{ doc: ArchiveDocument; relevanceScore: number; matchReason: string }> =
      ARCHIVE_CORPUS.map((doc) => ({
        doc,
        relevanceScore: 100,
        matchReason: 'Primary Archival Collection'
      }));

    if (category && category !== 'All') {
      filtered = filtered.filter((item) => item.doc.category === category);
    }

    if (type && type !== 'all') {
      filtered = filtered.filter((item) => item.doc.type === type);
    }

    if (query.length > 0) {
      const stopWords = new Set([
        'what', 'why', 'how', 'when', 'where', 'who', 'did', 'does', 'the', 'and',
        'for', 'with', 'about', 'from', 'his', 'was', 'are', 'ambedkar', 'babasaheb'
      ]);
      const tokens = query
        .replace(/[^a-z0-9\u0900-\u097F\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 1 && !stopWords.has(t));

      filtered = filtered
        .map(({ doc }) => {
          let score = 0;
          const matchedTerms: string[] = [];
          const titleLower = doc.title.toLowerCase();
          const excerptLower = doc.excerpt.toLowerCase();
          const transcriptLower = doc.transcript.toLowerCase();
          const categoryLower = doc.category.toLowerCase();

          if (titleLower.includes(query)) {
            score += 35;
            matchedTerms.push('Exact title phrase match');
          }
          if (excerptLower.includes(query) || transcriptLower.includes(query)) {
            score += 25;
            matchedTerms.push('Direct archival text match');
          }

          for (const token of tokens) {
            if (titleLower.includes(token)) {
              score += 12;
              matchedTerms.push(token);
            }
            if (doc.semanticKeywords.some((kw) => kw.toLowerCase().includes(token))) {
              score += 15;
              matchedTerms.push(token);
            }
            if (categoryLower.includes(token)) {
              score += 8;
            }
            if (excerptLower.includes(token) || transcriptLower.includes(token)) {
              score += 6;
              matchedTerms.push(token);
            }
            if (String(doc.year).includes(token)) {
              score += 14;
              matchedTerms.push(`Year ${doc.year}`);
            }
          }

          const uniqueMatches = Array.from(new Set(matchedTerms)).slice(0, 4);
          return {
            doc,
            relevanceScore: Math.min(99, score),
            matchReason:
              uniqueMatches.length > 0
                ? `Matched archival concepts: ${uniqueMatches.join(', ')}`
                : 'General semantic correspondence'
          };
        })
        .filter((item) => item.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    res.json({
      results: filtered,
      totalMatches: filtered.length
    });
  });

  app.post('/api/assistant/query', async (req, res) => {
    const userQuery = String(req.body?.query || '').trim();
    if (!userQuery) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const baselineResult = retrieveGroundedAnswer(userQuery);

    if (!baselineResult.foundInArchive || baselineResult.citations.length === 0) {
      res.json(baselineResult);
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 5) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const contextBlocks = baselineResult.citations
          .map((c, idx) => {
            const fullDoc = ARCHIVE_CORPUS.find((d) => d.id === c.documentId);
            return `[SOURCE ${idx + 1}]
Title: ${c.documentTitle}
Accession ID: ${c.accessionNumber}
Citation & Page/Section: ${c.sourceCitation} (${c.pageOrSection})
Excerpt: ${c.relevantQuote}
Full Archival Text: ${fullDoc?.transcript || ''}`;
          })
          .join('\n\n---\n\n');

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Visitor Question at Museum Kiosk: "${userQuery}"\n\nVerified Archival Sources:\n${contextBlocks}`,
          config: {
            systemInstruction: `You are the scholarly AI Research Assistant for "Ambedkar Gyaan Kosh" at the Dr. Ambedkar International Centre.
CRITICAL RULES:
1. Answer ONLY using facts, quotes, and constitutional arguments present in the provided Verified Archival Sources.
2. Explicitly reference the document title, date, and section in your prose.
3. Keep your response dignified, scholarly, clear, and concise (2 to 3 short paragraphs suitable for a museum touchscreen kiosk).
4. If the provided sources do not answer the question, respond strictly with: "No verified source found for this query."`
          }
        });

        const llmText = response.text?.trim();
        if (llmText && llmText.length > 20) {
          res.json({
            ...baselineResult,
            retrievalMode: 'gemini-rag-verified',
            answer: llmText
          });
          return;
        }
      } catch (_err) {
        // Fall back to baseline
      }
    }

    res.json(baselineResult);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ambedkar Gyaan Kosh Kiosk Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
