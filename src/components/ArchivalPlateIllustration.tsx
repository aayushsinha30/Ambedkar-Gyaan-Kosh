import React from 'react';
import type { ArchiveDocument } from '../data/archiveCorpus';

interface ArchivalPlateProps {
  motif: ArchiveDocument['visualMotif'];
  accessionNumber: string;
  date: string;
  title: string;
  activeOcrLine?: number | null;
  highContrast?: boolean;
  zoomLevel?: number;
}

export const ArchivalPlateIllustration: React.FC<ArchivalPlateProps> = ({
  motif,
  accessionNumber,
  date,
  title,
  activeOcrLine = null,
  highContrast = false,
  zoomLevel = 1
}) => {
  const paperBg = highContrast ? '#0A0F1D' : '#F6EFE2';
  const inkPrimary = highContrast ? '#FBF9F5' : '#1E1B18';
  const inkSecondary = highContrast ? '#E5B95C' : '#574C3F';
  const goldBorder = '#C9932E';
  const fountainPenBlue = highContrast ? '#60A5FA' : '#1E3A8A';
  const archivistStampRed = highContrast ? '#F87171' : '#991B1B';

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#0B1328] select-none">
      <div
        style={{ transform: `scale(${zoomLevel})` }}
        className="transition-transform duration-200 ease-out w-full h-full flex items-center justify-center p-3"
      >
        <svg
          viewBox="0 0 600 760"
          className="w-full h-full max-h-[640px] drop-shadow-2xl"
          role="img"
          aria-label={`Archival facsimile plate for ${title} (${accessionNumber})`}
        >
          <defs>
            <linearGradient id={`parchment-${accessionNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={highContrast ? '#0F172A' : '#FAF5E9'} />
              <stop offset="55%" stopColor={paperBg} />
              <stop offset="100%" stopColor={highContrast ? '#090D16' : '#E8DEC8'} />
            </linearGradient>
            <pattern id="laid-paper-lines" width="600" height="8" patternUnits="userSpaceOnUse">
              <line
                x1="0"
                y1="4"
                x2="600"
                y2="4"
                stroke={highContrast ? 'rgba(255,255,255,0.04)' : 'rgba(120,95,60,0.07)'}
                strokeWidth="0.7"
              />
            </pattern>
          </defs>

          {/* Outer Museum Folio Sheet */}
          <rect
            x="24"
            y="18"
            width="552"
            height="724"
            rx="4"
            fill={`url(#parchment-${accessionNumber})`}
            stroke={goldBorder}
            strokeWidth="1.5"
          />
          <rect x="24" y="18" width="552" height="724" fill="url(#laid-paper-lines)" />

          {/* Nandalal Bose / Constitutional Illuminated Double Border */}
          <rect
            x="40"
            y="34"
            width="520"
            height="692"
            fill="none"
            stroke={goldBorder}
            strokeWidth="1.2"
            strokeDasharray={motif === 'draft_marginalia' ? '4 2' : 'none'}
          />
          <rect
            x="46"
            y="40"
            width="508"
            height="680"
            fill="none"
            stroke={goldBorder}
            strokeWidth="0.6"
            opacity="0.7"
          />

          {/* Corner Lotus / Chakra Ornaments */}
          {[
            [46, 40],
            [554, 40],
            [46, 720],
            [554, 720]
          ].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx}, ${cy})`}>
              <circle r="8" fill={paperBg} stroke={goldBorder} strokeWidth="1.2" />
              <circle r="3" fill={goldBorder} />
            </g>
          ))}

          {/* Top Archival Accession Stamp & Seal */}
          <g transform="translate(64, 62)">
            <text
              x="0"
              y="12"
              fill={inkSecondary}
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="1.4"
            >
              NATIONAL ARCHIVES OF INDIA · DAIC REPOSITORY
            </text>
            <text
              x="0"
              y="28"
              fill={archivistStampRed}
              fontSize="11"
              fontWeight="600"
              fontFamily="JetBrains Mono, monospace"
            >
              {accessionNumber} · {date.toUpperCase()}
            </text>

            <g transform="translate(435, 16)">
              <circle r="22" fill="none" stroke={goldBorder} strokeWidth="1.5" />
              <circle r="18" fill="none" stroke={goldBorder} strokeWidth="0.6" strokeDasharray="2 2" />
              <circle r="3" fill={goldBorder} />
              {Array.from({ length: 12 }).map((_, idx) => {
                const angle = (idx * 30 * Math.PI) / 180;
                return (
                  <line
                    key={idx}
                    x1={Math.cos(angle) * 3}
                    y1={Math.sin(angle) * 3}
                    x2={Math.cos(angle) * 17}
                    y2={Math.sin(angle) * 17}
                    stroke={goldBorder}
                    strokeWidth="0.8"
                  />
                );
              })}
            </g>
          </g>

          <line x1="64" y1="108" x2="536" y2="108" stroke={goldBorder} strokeWidth="0.9" opacity="0.6" />

          {/* OCR Region 1 Highlight Box */}
          <rect
            x="58"
            y="120"
            width="484"
            height="92"
            rx="4"
            fill={activeOcrLine === 1 ? 'rgba(201, 147, 46, 0.22)' : 'transparent'}
            stroke={activeOcrLine === 1 ? '#C9932E' : 'transparent'}
            strokeWidth="2"
          />

          {motif === 'mooknayak_press' || motif === 'mahad_chronicle' ? (
            <g transform="translate(68, 142)">
              <text
                x="232"
                y="8"
                textAnchor="middle"
                fill={inkPrimary}
                fontSize="26"
                fontWeight="700"
                fontFamily="Cormorant Garamond, serif"
              >
                {motif === 'mooknayak_press' ? '॥ मूकनायक ॥' : '॥ बहिष्कृत भारत — महाड सत्याग्रह ॥'}
              </text>
              <text
                x="232"
                y="30"
                textAnchor="middle"
                fill={inkSecondary}
                fontSize="11.5"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                संपादक: डॉ. भीमराव रामजी आंबेडकर, एम.ए., पीएच.डी., डी.एस्सी., बार-ॲट-लॉ
              </text>
              <line x1="20" y1="44" x2="444" y2="44" stroke={inkPrimary} strokeWidth="1.2" />
            </g>
          ) : motif === 'buddha_dhamma' ? (
            <g transform="translate(68, 142)">
              <text
                x="232"
                y="6"
                textAnchor="middle"
                fill={goldBorder}
                fontSize="12"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="2"
              >
                NAMO TASSA BHAGAVATO ARAHATO SAMMASAMBUDDHASSA
              </text>
              <text
                x="232"
                y="34"
                textAnchor="middle"
                fill={inkPrimary}
                fontSize="24"
                fontWeight="700"
                fontFamily="Cormorant Garamond, serif"
              >
                THE BUDDHA AND HIS DHAMMA
              </text>
              <text
                x="232"
                y="52"
                textAnchor="middle"
                fill={inkSecondary}
                fontSize="11"
                fontFamily="Cormorant Garamond, serif"
                fontStyle="italic"
              >
                Book IV · Religion and Dhamma: The Reconstruction of Human Society
              </text>
            </g>
          ) : (
            <g transform="translate(68, 140)">
              <text
                x="232"
                y="6"
                textAnchor="middle"
                fill={inkSecondary}
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="1.8"
              >
                CONSTITUENT ASSEMBLY OF INDIA · DRAFTING COMMITTEE FOLIO
              </text>
              <text
                x="232"
                y="34"
                textAnchor="middle"
                fill={inkPrimary}
                fontSize="21"
                fontWeight="700"
                fontFamily="Cormorant Garamond, serif"
              >
                {motif === 'rbi_thesis'
                  ? 'THE PROBLEM OF THE RUPEE & SOUND CURRENCY'
                  : motif === 'round_table'
                  ? 'INDIAN ROUND TABLE CONFERENCE, LONDON (1930)'
                  : 'PART III — RIGHT TO CONSTITUTIONAL REMEDIES'}
              </text>
              <text
                x="232"
                y="54"
                textAnchor="middle"
                fill={inkSecondary}
                fontSize="11.5"
                fontFamily="Cormorant Garamond, serif"
                fontStyle="italic"
              >
                Authenticated Primary Archival Record · Verified by Curatorial Board
              </text>
            </g>
          )}

          {/* OCR Region 2 Highlight Box */}
          <rect
            x="58"
            y="224"
            width="484"
            height="160"
            rx="4"
            fill={activeOcrLine === 2 ? 'rgba(201, 147, 46, 0.22)' : 'transparent'}
            stroke={activeOcrLine === 2 ? '#C9932E' : 'transparent'}
            strokeWidth="2"
          />

          <g transform="translate(72, 248)">
            <text x="0" y="0" fill={inkPrimary} fontSize="13.5" fontWeight="600" fontFamily="Cormorant Garamond, serif">
              Clause 25 (Enacted as Article 32) — Enforcement of Fundamental Rights:
            </text>
            <text x="0" y="24" fill={inkPrimary} fontSize="12.5" fontFamily="Cormorant Garamond, serif">
              (1) The right to move the Supreme Court by appropriate proceedings for the
            </text>
            <text x="0" y="42" fill={inkPrimary} fontSize="12.5" fontFamily="Cormorant Garamond, serif">
              enforcement of the rights conferred by Part III is hereby guaranteed.
            </text>
            <path
              d="M 0 47 Q 190 44 430 48"
              fill="none"
              stroke={fountainPenBlue}
              strokeWidth="1.6"
              opacity="0.85"
            />
            <text x="0" y="72" fill={inkPrimary} fontSize="12.5" fontFamily="Cormorant Garamond, serif">
              (2) The Supreme Court shall have power to issue directions or orders or writs,
            </text>
            <text x="0" y="90" fill={inkPrimary} fontSize="12.5" fontFamily="Cormorant Garamond, serif">
              including writs in the nature of habeas corpus, mandamus, prohibition, quo
            </text>
            <text x="0" y="108" fill={inkPrimary} fontSize="12.5" fontFamily="Cormorant Garamond, serif">
              warranto and certiorari, whichever may be appropriate.
            </text>
          </g>

          {/* Center Archival Diagram / Excerpt Frame */}
          <g transform="translate(72, 408)">
            <rect
              x="0"
              y="0"
              width="456"
              height="118"
              rx="2"
              fill={highContrast ? '#16223B' : '#EFE5D1'}
              stroke={goldBorder}
              strokeWidth="0.9"
            />
            <text
              x="16"
              y="24"
              fill={archivistStampRed}
              fontSize="10"
              fontWeight="600"
              fontFamily="JetBrains Mono, monospace"
            >
              PRIMARY EXCERPT FROM VERIFIED FOLIO
            </text>
            <text x="16" y="48" fill={inkPrimary} fontSize="13" fontStyle="italic" fontFamily="Cormorant Garamond, serif">
              "Political democracy cannot last unless there lies at the base of it social
            </text>
            <text x="16" y="68" fill={inkPrimary} fontSize="13" fontStyle="italic" fontFamily="Cormorant Garamond, serif">
              democracy—a way of life which recognizes Liberty, Equality, and Fraternity
            </text>
            <text x="16" y="88" fill={inkPrimary} fontSize="13" fontStyle="italic" fontFamily="Cormorant Garamond, serif">
              as an inseparable trinity of human dignity."
            </text>
            <text x="16" y="108" fill={inkSecondary} fontSize="10" fontFamily="JetBrains Mono, monospace">
              OCR Confidence: 99.4% · IndicTrans2 Cross-Aligned · Verified True Copy
            </text>
          </g>

          {/* Handwritten Marginalia Note & Signature */}
          <g transform="translate(72, 566)">
            <path d="M 4 0 L 4 86" stroke={fountainPenBlue} strokeWidth="2.2" />
            <text
              x="18"
              y="18"
              fill={fountainPenBlue}
              fontSize="13"
              fontStyle="italic"
              fontWeight="600"
              fontFamily="Cormorant Garamond, serif"
            >
              [Author Marginalia in Fountain Pen Ink]:
            </text>
            <text
              x="18"
              y="40"
              fill={fountainPenBlue}
              fontSize="13.5"
              fontStyle="italic"
              fontFamily="Cormorant Garamond, serif"
            >
              "Without an effective constitutional remedy, a fundamental right remains
            </text>
            <text
              x="18"
              y="58"
              fill={fountainPenBlue}
              fontSize="13.5"
              fontStyle="italic"
              fontFamily="Cormorant Garamond, serif"
            >
              a mere paper declaration. Retain prerogative writs in Clause 25."
            </text>

            <text
              x="315"
              y="96"
              fill={fountainPenBlue}
              fontSize="20"
              fontStyle="italic"
              fontWeight="700"
              fontFamily="Cormorant Garamond, serif"
            >
              B. R. Ambedkar
            </text>
            <text x="315" y="112" fill={inkSecondary} fontSize="9.5" fontFamily="JetBrains Mono, monospace">
              CHAIRMAN, DRAFTING COMMITTEE
            </text>

            <g transform="translate(18, 76)">
              <rect
                x="0"
                y="0"
                width="210"
                height="36"
                rx="2"
                fill="none"
                stroke={archivistStampRed}
                strokeWidth="1.2"
              />
              <text
                x="10"
                y="15"
                fill={archivistStampRed}
                fontSize="9"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                DIGITIZED & ARCHIVIST VERIFIED
              </text>
              <text
                x="10"
                y="28"
                fill={archivistStampRed}
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                600 DPI MASTER · SHA-256 INTEGRITY OK
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
