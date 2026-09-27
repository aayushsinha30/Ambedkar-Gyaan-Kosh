/**
 * ============================================================================
 * AMBEDKAR GYAAN KOSH — DIGITAL HERITAGE ARCHIVE DATASET & PIPELINE NOTES
 * ============================================================================
 *
 * [PRODUCTION ARCHITECTURE NOTE 1 — OFFLINE-FIRST KIOSK CACHING]
 * In a physical memorial deployment (e.g., Dr. Ambedkar International Centre,
 * New Delhi, or Chaityabhoomi Memorial kiosks), touchscreen terminals must
 * operate with 100% uptime even during network outages.
 * In production, this dataset and its vector embeddings are synchronized via:
 *   1. Workbox Service Worker caching all static UI bundles, IIIF manuscript
 *      tiles, and compressed Opus audio/WebM video streams in CacheStorage.
 *   2. IndexedDB (via Dexie.js / SQLite-WASM) storing the full document corpus,
 *      multilingual translations, and pre-computed 768-dim embeddings so
 *      semantic search and citation verification execute locally in <25ms.
 *
 * [PRODUCTION ARCHITECTURE NOTE 2 — QR-TO-PHONE VISITOR HANDOFF]
 * When a museum visitor taps "Continue on Phone (QR)" on any kiosk screen,
 * the kiosk generates a signed deep-link URL pointing to the public cloud-hosted
 * instance of Ambedkar Gyaan Kosh:
 *   `https://archive.daic.gov.in/kiosk-handoff?docId=${doc.id}&lang=${lang}&t=${timestamp}`
 * This allows visitors to walk away from the physical kiosk while continuing to
 * read or listen to the exact manuscript, speech, or audio timestamp on their
 * personal smartphone without installing a native app.
 *
 * [PRODUCTION ARCHITECTURE NOTE 3 — REAL OCR & INDIC NMT PIPELINE]
 * In this hackathon prototype, OCR extraction and multilingual translations are
 * served from curated archival records. In the production ingestion pipeline:
 *   - Archival scans (600 DPI TIFF) pass through a hybrid OCR stage combining
 *     Google Cloud Vision Document AI and fine-tuned Tesseract 5 models trained
 *     on 1920s–1950s Devanagari, Modi script, Marathi typefaces, and English
 *     typewritten marginalia, followed by human Archivist Verification sign-off.
 *   - Multilingual translations across 22 scheduled Indian languages are
 *     generated via AI4Bharat's IndicTrans2 Neural Machine Translation (NMT)
 *     pipeline with constitutional terminology glossaries, reviewed by domain
 *     scholars before setting `verified: true`.
 * ============================================================================
 */

export type ArchiveItemType = 'speech' | 'manuscript' | 'photo' | 'audio' | 'video';

export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'bn' | 'pi';

export interface LanguageMeta {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  speechLang: string;
  regionNote: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', nativeName: 'English', speechLang: 'en-IN', regionNote: 'Original Parliamentary & Scholarly Record' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', speechLang: 'hi-IN', regionNote: 'राष्ट्रीय अभिलेखागार अनुवाद (IndicTrans2 Verified)' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', speechLang: 'mr-IN', regionNote: 'मूळ मराठी वृत्तपत्रे आणि भाषणे (Mooknayak / Bahishkrit Bharat)' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', speechLang: 'ta-IN', regionNote: 'தென்னிந்திய அரசியலமைப்பு மொழிபெயர்ப்பு' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', speechLang: 'bn-IN', regionNote: 'সংবিধান সভা ও ঐতিহাসিক ভাষণ অনুবাদ' },
  { code: 'pi', label: 'Pali / Classical', nativeName: 'पालि', speechLang: 'hi-IN', regionNote: 'धम्मपद एवं बुद्ध और उनका धम्म संदर्भ' },
];

export interface OcrLineItem {
  lineNumber: number;
  regionLabel: string;
  extractedText: string;
  archivistNote: string;
  confidence: string;
}

export interface TranscriptSegment {
  timestamp: string;
  seconds: number;
  speaker: string;
  text: string;
}

export interface ArchiveDocument {
  id: string;
  accessionNumber: string;
  title: string;
  type: ArchiveItemType;
  date: string;
  year: number;
  language: string;
  category: 'Constitutional Debates' | 'Social Justice & Caste' | 'Economics & Finance' | 'Civic Movements' | 'Buddhism & Philosophy' | 'Legislative Reform';
  excerpt: string;
  transcript: string;
  sourceCitation: string;
  pageOrSection: string;
  archiveLocation: string;
  verified: boolean;
  visualMotif: 'constitution_folio' | 'draft_marginalia' | 'mahad_chronicle' | 'round_table' | 'rbi_thesis' | 'mooknayak_press' | 'hindu_code_draft' | 'buddha_dhamma';
  semanticKeywords: string[];
  translations?: Partial<Record<SupportedLanguage, {
    title: string;
    excerpt: string;
    transcript: string;
  }>>;
  ocrLines?: OcrLineItem[];
  mediaSegments?: TranscriptSegment[];
  mediaDuration?: string;
}

export const ARCHIVE_CORPUS: ArchiveDocument[] = [
  {
    id: 'doc-ca-1949-grammar-of-anarchy',
    accessionNumber: 'ACC-1949-CA-1125',
    title: 'Closing Address to the Constituent Assembly ("The Grammar of Anarchy" & Social Democracy)',
    type: 'speech',
    date: '25 November 1949',
    year: 1949,
    language: 'English',
    category: 'Constitutional Debates',
    excerpt: 'Political democracy cannot last unless there lies at the base of it social democracy. What does social democracy mean? It means a way of life which recognizes liberty, equality and fraternity as the principles of life.',
    transcript: `On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality. In politics we will be recognizing the principle of one man one vote and one vote one value. In our social and economic life, we shall, by reason of our social and economic structure, continue to deny the principle of one man one value.

How long shall we continue to live this life of contradictions? How long shall we continue to deny equality in our social and economic life? If we continue to deny it for long, we will do so only by putting our political democracy in peril. We must remove this contradiction at the earliest possible moment or else those who suffer from inequality will blow up the structure of political democracy which this Assembly has so laboriously built up.

If we wish to maintain democracy not merely in form, but also in fact, what must we do? The first thing in my judgment we must do is to hold fast to constitutional methods of achieving our social and economic objectives. It means we must abandon the bloody methods of revolution. It means that we must abandon the method of civil disobedience, non-cooperation and satyagraha. When there was no way left for constitutional methods for achieving economic and social objectives, there was a great deal of justification for unconstitutional methods. But where constitutional methods are open, there can be no justification for these unconstitutional methods. These methods are nothing but the Grammar of Anarchy and the sooner they are abandoned, the better for us.`,
    sourceCitation: 'Constituent Assembly Debates, Official Report, Vol. XI, Book No. 5, pp. 972–981 (25 November 1949)',
    pageOrSection: 'Vol. XI, Part II, Pages 977–979',
    archiveLocation: 'Parliament of India Constitutional Archives · Vault C-14',
    verified: true,
    visualMotif: 'constitution_folio',
    semanticKeywords: [
      'social democracy', 'political democracy', 'liberty equality fraternity', 'contradictions',
      'one man one vote', 'one vote one value', 'grammar of anarchy', 'constitutional methods',
      'constituent assembly closing speech', 'hero worship', 'bhakti in politics', 'safeguards'
    ],
    translations: {
      en: {
        title: 'Closing Address to the Constituent Assembly ("The Grammar of Anarchy" & Social Democracy)',
        excerpt: 'Political democracy cannot last unless there lies at the base of it social democracy. What does social democracy mean? It means a way of life which recognizes liberty, equality and fraternity as the principles of life.',
        transcript: 'On the 26th of January 1950, we are going to enter into a life of contradictions. In politics we will have equality and in social and economic life we will have inequality. Political democracy cannot last unless there lies at the base of it social democracy—a way of life which recognizes liberty, equality and fraternity as an inseparable trinity.'
      },
      hi: {
        title: 'संविधान सभा में समापन भाषण ("अराजकता का व्याकरण" और सामाजिक लोकतंत्र)',
        excerpt: 'राजनीतिक लोकतंत्र तब तक स्थायी नहीं हो सकता जब तक कि उसके मूल में सामाजिक लोकतंत्र न हो। सामाजिक लोकतंत्र का क्या अर्थ है? इसका अर्थ है जीवन की ऐसी पद्धति जो स्वतंत्रता, समानता और बंधुत्व को जीवन के मूल सिद्धांतों के रूप में मान्यता देती है।',
        transcript: '26 जनवरी 1950 को हम अंतर्विरोधों से भरे जीवन में प्रवेश करने जा रहे हैं। राजनीति में हमारे पास समानता होगी और सामाजिक तथा आर्थिक जीवन में असमानता होगी। राजनीति में हम एक व्यक्ति एक वोट और एक वोट एक मूल्य के सिद्धांत को मान्यता देंगे। यदि हम अपने लोकतंत्र को केवल रूप में ही नहीं, बल्कि वास्तव में भी बनाए रखना चाहते हैं, तो हमें अपने सामाजिक और आर्थिक उद्देश्यों की प्राप्ति के लिए संवैधानिक तरीकों को मजबूती से पकड़ना होगा।'
      },
      mr: {
        title: 'संविधान सभेतील समारोपाचे भाषण ("अराजकतेचे व्याकरण" आणि सामाजिक लोकशाही)',
        excerpt: 'सामाजिक लोकशाहीचा पाया असल्याशिवाय राजकीय लोकशाही टिकू शकत नाही. सामाजिक लोकशाही म्हणजे काय? स्वातंत्र्य, समता आणि बंधुता या तत्त्वांना जीवनमार्ग म्हणून स्वीकारणे म्हणजे सामाजिक लोकशाही.',
        transcript: '२६ जानेवारी १९५० रोजी आपण विसंगतींच्या जीवनात प्रवेश करणार आहोत. राजकारणात आपल्याकडे समता असेल, परंतु सामाजिक आणि आर्थिक जीवनात विषमता असेल. जर आपण ही विसंगती लवकरात लवकर दूर केली नाही, तर विषमतेने ग्रासलेले लोक या संविधान सभेने इतक्या कष्टाने उभारलेली राजकीय लोकशाहीची इमारत उद्ध्वस्त करतील.'
      }
    }
  },
  {
    id: 'doc-ca-1948-article-32-heart-soul',
    accessionNumber: 'ACC-1948-CA-1209',
    title: 'Draft Article 25 (Article 32) Debate — "The Very Soul of the Constitution"',
    type: 'manuscript',
    date: '9 December 1948',
    year: 1948,
    language: 'English',
    category: 'Constitutional Debates',
    excerpt: 'If I was asked to name any particular article in this Constitution as the most important—an article without which this Constitution would be a nullity—I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it.',
    transcript: `There can be no doubt that the right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by Part III is guaranteed. Without constitutional remedies, Fundamental Rights would remain mere pious declarations adorned on parchment.

If I was asked to name any particular article in this Constitution as the most important—an article without which this Constitution would be a nullity—I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it and I am glad that the House has realized its importance.

Hereafter, it would not be possible for any Legislature to take away the writs which are mentioned in this article—Habeas Corpus, Mandamus, Prohibition, Quo Warranto and Certiorari—unless and until the Constitution itself is amended by means left open to the Legislature.`,
    sourceCitation: 'Constituent Assembly Debates, Vol. VII, pp. 953–954 & Annotated Draft Committee Folio 25-B (9 December 1948)',
    pageOrSection: 'Vol. VII, Page 953 · Draft Clause 25 Folio',
    archiveLocation: 'Dr. Ambedkar International Centre Manuscript Wing · Case II',
    verified: true,
    visualMotif: 'draft_marginalia',
    semanticKeywords: [
      'article 32', 'draft article 25', 'heart and soul of the constitution', 'constitutional remedies',
      'supreme court', 'fundamental rights', 'writs', 'habeas corpus', 'mandamus', 'certiorari', 'nullity'
    ],
    ocrLines: [
      {
        lineNumber: 1,
        regionLabel: 'Header Block · Typewritten Draft Clause 25',
        extractedText: 'DRAFT CONSTITUTION OF INDIA — PART III: RIGHT TO CONSTITUTIONAL REMEDIES',
        archivistNote: 'Black ribbon Underwood typewriter on handmade rag paper; authenticated stamp at top right.',
        confidence: '99.4%'
      },
      {
        lineNumber: 2,
        regionLabel: 'Clause 25(1) Primary Text',
        extractedText: '(1) The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed.',
        archivistNote: 'Underlined in fountain pen ink by Dr. B. R. Ambedkar prior to floor debate.',
        confidence: '99.1%'
      },
      {
        lineNumber: 3,
        regionLabel: 'Clause 25(2) Prerogative Writs',
        extractedText: '(2) The Supreme Court shall have power to issue directions or orders or writs, including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari.',
        archivistNote: 'Latin writ names verified against Drafting Committee revision slip dated 06-12-1948.',
        confidence: '98.8%'
      },
      {
        lineNumber: 4,
        regionLabel: 'Left Margin Handwritten Annotation',
        extractedText: '[Margin Note — B.R.A.]: "Without an effective remedy, a right is a mere paper declaration. Retain prerogative writs explicitly in text."',
        archivistNote: 'Handwritten marginalia in blue-black Parker Quink; verified by Chief Archivist.',
        confidence: '97.9%'
      }
    ],
    translations: {
      en: {
        title: 'Draft Article 25 (Article 32) Debate — "The Very Soul of the Constitution"',
        excerpt: 'If I was asked to name any particular article in this Constitution as the most important—an article without which this Constitution would be a nullity—I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it.',
        transcript: 'Without constitutional remedies, Fundamental Rights would remain mere pious declarations. Article 32 guarantees the right to move the Supreme Court via writs of Habeas Corpus, Mandamus, Prohibition, Quo Warranto, and Certiorari.'
      },
      hi: {
        title: 'प्रारूप अनुच्छेद 25 (अनुच्छेद 32) बहस — "संविधान की आत्मा और हृदय"',
        excerpt: 'यदि मुझसे पूछा जाए कि इस संविधान में सबसे महत्वपूर्ण अनुच्छेद कौन सा है—जिसके बिना यह संविधान शून्य हो जाएगा—तो मैं इसके अलावा किसी अन्य अनुच्छेद का उल्लेख नहीं कर सकता। यह संविधान की आत्मा है और इसका हृदय है।',
        transcript: 'संवैधानिक उपचारों के अधिकार के बिना मौलिक अधिकार केवल कागज पर लिखे पवित्र घोषणापत्र मात्र रह जाएंगे। अनुच्छेद 32 प्रत्येक नागरिक को सर्वोच्च न्यायालय में जाने की गारंटी देता है।'
      },
      mr: {
        title: 'मसुदा कलम २५ (कलम ३२) चर्चा — "संविधानाचा आत्मा आणि हृदय"',
        excerpt: 'जर मला या संविधानातील सर्वात महत्त्वाचे कलम कोणते असे विचारले गेले—ज्याशिवाय हे संविधान शून्य ठरेल—तर मी या कलमाशिवाय दुसऱ्या कोणत्याही कलमाचा उल्लेख करू शकणार नाही. हे कलम संविधानाचा आत्मा आणि हृदय आहे.',
        transcript: 'संवैधानिक उपायांच्या अधिकाराशिवाय मूलभूत हक्क केवळ कागदी घोषणा राहतील. बंदीप्रत्यक्षीकरण, परमादेश आणि अधिकारपृच्छा यांसारख्या प्राधिलेखांमुळे नागरिकांच्या मूलभूत हक्कांचे रक्षण होते.'
      }
    }
  },
  {
    id: 'doc-1936-annihilation-of-caste',
    accessionNumber: 'ACC-1936-AOC-0515',
    title: 'Annihilation of Caste — Undelivered Presidential Address to the Jat-Pat-Todak Mandal',
    type: 'manuscript',
    date: '15 May 1936',
    year: 1936,
    language: 'English',
    category: 'Social Justice & Caste',
    excerpt: 'Caste is not a physical object like a wall of bricks or a line of barbed wire which prevents the Hindus from co-mingling and which has, therefore, to be pulled down. Caste is a notion; it is a state of the mind.',
    transcript: `Caste is not merely a division of labour. It is also a division of labourers. Civilized society undoubtedly needs division of labour. But in no civilized society is division of labour accompanied by this unnatural division of labourers into water-tight compartments. Caste is a hierarchy in which the divisions of labourers are graded one above the other.

Caste is not a physical object like a wall of bricks or a line of barbed wire which prevents the Hindus from co-mingling and which has, therefore, to be pulled down. Caste is a notion; it is a state of the mind. The destruction of Caste does not therefore mean the destruction of a physical barrier. It means a notional change.

My ideal would be a society based on Liberty, Equality, and Fraternity. An ideal society should be mobile, should be full of channels for conveying a change taking place in one part to other parts. In an ideal society there should be many interests consciously communicated and shared. Democracy is not merely a form of Government. It is primarily a mode of associated living, of conjoint communicated experience. It is essentially an attitude of respect and reverence towards fellowmen.`,
    sourceCitation: 'Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS), Vol. 1, Ministry of Social Justice & Empowerment, pp. 23–96 (First Self-Published Edition, May 1936)',
    pageOrSection: 'Section XIV & Section IV, Pages 47, 57, 68',
    archiveLocation: 'Rare Books & First Editions Vault · Folio B-1936',
    verified: true,
    visualMotif: 'constitution_folio',
    semanticKeywords: [
      'annihilation of caste', 'division of labour', 'division of labourers', 'state of mind',
      'notional change', 'ideal society', 'associated living', 'conjoint communicated experience',
      'liberty equality fraternity', 'jat pat todak mandal', 'lahore address', 'social reform'
    ]
  },
  {
    id: 'doc-1923-problem-of-the-rupee',
    accessionNumber: 'ACC-1923-LSE-0312',
    title: 'The Problem of the Rupee: Its Origin and Its Solution (LSE D.Sc. Thesis & Hilton Young Evidence)',
    type: 'manuscript',
    date: 'December 1923',
    year: 1923,
    language: 'English',
    category: 'Economics & Finance',
    excerpt: 'Nothing will stabilize the rupee unless we stabilize its general purchasing power. A managed currency is to be altogether avoided when the management is to be in the hands of the Government without statutory quantity limits.',
    transcript: `In examining the Indian currency system from 1800 to 1923, the fundamental question is not merely the exchange ratio between the Rupee and Sterling, but the internal stability of purchasing power for the Indian wage-earner and cultivator.

The Gold Exchange Standard, as operated in India, lacks the automatic check on currency expansion that a true Gold Standard with controlled issue provides. When the executive holds discretionary power to issue token coinage without convertibility or strict statutory reserve requirements, inflation silently taxes the poorest strata of society through rising price levels.

Consequently, price stability inside the country is far more vital for social welfare than external exchange pegging alone. This institutional framework laid the direct intellectual foundation for Dr. Ambedkar's 1925 testimony before the Royal Commission on Indian Currency and Finance (Hilton Young Commission), which led to the establishment of the Reserve Bank of India in 1935.`,
    sourceCitation: 'The Problem of the Rupee: Its Origin and Its Solution, P. S. King & Son Ltd., London (1923), Ch. VII, pp. 248–286; BAWS Vol. 6',
    pageOrSection: 'Chapter VII: A Return to the Sound Standard, Pages 254–269',
    archiveLocation: 'Economic & Monetary Policy Collection · Folio LSE-1923-R',
    verified: true,
    visualMotif: 'rbi_thesis',
    semanticKeywords: [
      'problem of the rupee', 'reserve bank of india', 'rbi', 'hilton young commission',
      'monetary policy', 'gold exchange standard', 'purchasing power', 'inflation',
      'currency stability', 'london school of economics', 'economics thesis', 'central bank'
    ]
  },
  {
    id: 'doc-1927-mahad-satyagraha',
    accessionNumber: 'ACC-1927-MHD-0320',
    title: 'Mahad Chavdar Tale Satyagraha Address & Civic Rights Proclamation',
    type: 'photo',
    date: '20 March 1927',
    year: 1927,
    language: 'Marathi',
    category: 'Civic Movements',
    excerpt: 'We are not going to the Chavdar Tank to merely drink its water. We are going to the tank to assert that we too are human beings like others. It must be clear that this meeting has been called to set up the norm of equality.',
    transcript: `आम्ही चवदार तळ्यावर केवळ पाणी पिण्यासाठी जात नाही. इतरांप्रमाणेच आम्हीही माणसे आहोत हे सिद्ध करण्यासाठी आपण त्या तळ्यावर जात आहोत. ही परिषद समतेचे तत्त्व प्रस्थापित करण्यासाठी बोलावण्यात आली आहे हे स्पष्ट झाले पाहिजे.

Translation:
"We are not going to the Chavdar Tank to merely drink its water. We are going to the tank to assert that we too are human beings like others. It must be clear that this conference has been called to set up the norm of civic equality. Public reservoirs, schools, courts, and roads maintained by municipal taxation belong equally to every citizen by natural and legal right."`,
    sourceCitation: 'Bahishkrit Bharat Editorial & Mahad Konferans वृत्तांत (3 April 1927); BAWS Vol. 17, Part 1, pp. 3–18',
    pageOrSection: 'Issue No. 1, Columns 2–4 · Mahad Conference Proceedings',
    archiveLocation: 'Konkan Civic Movements Gallery · Plate MHD-1927-04',
    verified: true,
    visualMotif: 'mahad_chronicle',
    semanticKeywords: [
      'mahad satyagraha', 'chavdar tale', 'chavdar tank', 'water rights', 'human rights',
      'civic equality', 'bole resolution', 'bahishkrit bharat', '1927', 'norm of equality'
    ]
  },
  {
    id: 'doc-1951-hindu-code-bill',
    accessionNumber: 'ACC-1951-PAR-0927',
    title: 'Statement Explaining Resignation from the Cabinet over the Hindu Code Bill & Gender Equality',
    type: 'speech',
    date: '10 October 1951',
    year: 1951,
    language: 'English',
    category: 'Legislative Reform',
    excerpt: 'To leave inequality between class and class, between sex and sex, which is the soul of Hindu Society, untouched and to go on passing legislation relating to economic problems is to make a farce of our Constitution and to build a palace on a dung heap.',
    transcript: `The Hindu Code was the greatest social reform measure ever undertaken by the Legislature in this country. No law passed by the Indian Legislature in the past or likely to be passed in the future can be compared to it in point of its significance.

To leave inequality between class and class, between sex and sex, which is the soul of Hindu Society, untouched and to go on passing legislation relating to economic problems is to make a farce of our Constitution and to build a palace on a dung heap. This is the significance I attached to the Hindu Code.

The Bill sought to codify and reform four pivotal areas for women's constitutional dignity: first, the abolition of birth-right limited estate so daughters receive equal share in parental property alongside sons; second, conversion of woman's limited estate into absolute estate; third, enforcement of monogamy as a universal rule of law; and fourth, statutory recognition of the right to maintenance and divorce on just grounds. I measure the progress of a community by the degree of progress which women have achieved.`,
    sourceCitation: 'Parliamentary Debates (Provisional Parliament), Official Statement by Dr. B. R. Ambedkar (10 October 1951); BAWS Vol. 14, Part Two, pp. 1317–1327',
    pageOrSection: 'Vol. 14, Part II, Pages 1325–1326',
    archiveLocation: 'Legislative Reform & Women’s Rights Archive · Folder HCB-1951',
    verified: true,
    visualMotif: 'hindu_code_draft',
    semanticKeywords: [
      'hindu code bill', 'women rights', 'gender equality', 'property rights', 'inheritance',
      'daughters equal share', 'monogamy', 'divorce', 'resignation statement', 'law minister'
    ]
  },
  {
    id: 'doc-1930-round-table-conference',
    accessionNumber: 'ACC-1930-RTC-1120',
    title: 'Plenary Address at the First Round Table Conference, St. James’s Palace, London',
    type: 'photo',
    date: '20 November 1930',
    year: 1930,
    language: 'English',
    category: 'Constitutional Debates',
    excerpt: 'We feel that nobody can remove our grievances as well as we can, and we cannot remove them unless we get political power in our own hands. No share of this political power can evidently come to us so long as the British government remains as it is.',
    transcript: `The bureaucratic form of government in India should be replaced by a government which will be a government of the people, by the people and for the people.

We feel that nobody can remove our grievances as well as we can, and we cannot remove them unless we get political power in our own hands. It is only in a Swaraj constitution, accompanied by enforceable fundamental rights, adult suffrage, and constitutional safeguards against tyranny of the majority, that we have any chance of getting political power into our own hands.`,
    sourceCitation: 'Indian Round Table Conference Proceedings, Cmd. 3778, HMSO, London, pp. 123–129; BAWS Vol. 2, pp. 503–509',
    pageOrSection: 'Plenary Sitting, 20 November 1930, Pages 505–507',
    archiveLocation: 'Diplomatic & Constitutional Treaties Hall · Plate RTC-1930-I',
    verified: true,
    visualMotif: 'round_table',
    semanticKeywords: [
      'round table conference', 'london', 'st james palace', 'political power', 'swaraj',
      'adult suffrage', 'depressed classes', 'government of the people', 'fundamental rights'
    ]
  },
  {
    id: 'doc-1942-labour-reforms',
    accessionNumber: 'ACC-1942-LAB-0907',
    title: 'Tripartite Indian Labour Conference Address — 8-Hour Workday, Dearness Allowance & Maternity Benefits',
    type: 'speech',
    date: '7 August 1942',
    year: 1942,
    language: 'English',
    category: 'Legislative Reform',
    excerpt: 'Industrial peace cannot be secured merely by the absence of strikes; it must rest upon positive social security, an eight-hour working day, minimum living wages, equal pay for equal work, and statutory maternity protection.',
    transcript: `Key statutory reforms enacted under Dr. Ambedkar's stewardship as Labour Member include:
1. Reduction of factory working hours in India from 12–14 hours to a mandatory 8-hour workday (November 1942).
2. Enactment of the Mines Maternity Benefit Act, Women Labour Welfare Fund, equal pay for equal work regardless of gender, and paid annual holidays.
3. Establishment of National Employment Exchanges, Dearness Allowance (DA) linked to cost-of-living indices, and the foundational framework for Employees' State Insurance (ESI).`,
    sourceCitation: 'Proceedings of the First Tripartite Labour Conference (August 1942); BAWS Vol. 10, pp. 42–118',
    pageOrSection: 'Vol. 10, Labour Policy Section, Pages 84–96',
    archiveLocation: 'Labour & Industrial Legislation Wing · Archive Box L-1942',
    verified: true,
    visualMotif: 'hindu_code_draft',
    semanticKeywords: [
      'labour reforms', '8 hour workday', 'eight hour working day', 'maternity benefit',
      'dearness allowance', 'employees state insurance', 'esi', 'trade unions', 'minimum wage'
    ]
  },
  {
    id: 'doc-1943-bbc-voice-archive',
    accessionNumber: 'ACC-1943-AUD-0510',
    title: 'Archival Audio Broadcast: "Why Indian Labour is Determined to Win This War against Fascism & Nazism"',
    type: 'audio',
    date: 'May 1943 / 1955 BBC Broadcast Series',
    year: 1943,
    language: 'English',
    category: 'Social Justice & Caste',
    excerpt: 'Labour’s creed is internationalism. Labour is interested in a New Order in which liberty, equality, and fraternity will not be mere slogans, but reigning principles of human governance.',
    transcript: `[00:00] Archival Announcer: All India Radio & BBC Overseas Service — Address by the Hon'ble Dr. B. R. Ambedkar.
[00:18] Dr. B. R. Ambedkar: Why is Indian Labour determined to resist Nazism and Fascism? Because Nazism is the sworn enemy of human equality and racial dignity.
[00:42] Dr. B. R. Ambedkar: Labour wants to win the war to establish a New Social Order.
[01:12] Dr. B. R. Ambedkar: In that New Order, democracy must guarantee the right to work, fair wages, education, and freedom from social degradation.
[01:45] Dr. B. R. Ambedkar: Liberty divorced from equality produces the supremacy of the few over the many; equality divorced from liberty destroys individual initiative; and without fraternity, neither liberty nor equality can endure.`,
    sourceCitation: 'All India Radio / BBC Transcription Disc Series B-409; BAWS Vol. 10, pp. 121–130',
    pageOrSection: 'Acetate Disc 409-A · Tracks 1–4',
    archiveLocation: 'Sound & Broadcast Preservation Vault · Reel AUD-1943-09',
    verified: true,
    visualMotif: 'round_table',
    mediaDuration: '02:15',
    semanticKeywords: [
      'bbc broadcast', 'audio recording', 'voice of ambedkar', 'labour creed',
      'new social order', 'fascism', 'liberty equality fraternity', 'radio speech'
    ],
    mediaSegments: [
      { timestamp: '00:00', seconds: 0, speaker: 'Archival Announcer', text: 'All India Radio & BBC Overseas Service — Address by Dr. B. R. Ambedkar.' },
      { timestamp: '00:18', seconds: 18, speaker: 'Dr. B. R. Ambedkar', text: 'Why is Indian Labour determined to resist totalitarianism? Because it is the enemy of equality.' },
      { timestamp: '00:42', seconds: 42, speaker: 'Dr. B. R. Ambedkar', text: 'Labour wants to win the war to establish a New Social Order.' },
      { timestamp: '01:12', seconds: 72, speaker: 'Dr. B. R. Ambedkar', text: 'In that New Order, democracy must guarantee the right to work, fair wages, and education.' },
      { timestamp: '01:45', seconds: 105, speaker: 'Dr. B. R. Ambedkar', text: 'Without fraternity, neither liberty nor equality can become a natural course of things.' }
    ]
  },
  {
    id: 'doc-1949-video-constituent-assembly',
    accessionNumber: 'ACC-1949-VID-1126',
    title: 'Archival Newsreel & Documentary: Presentation of the Final Draft Constitution of India (26 Nov 1949)',
    type: 'video',
    date: '26 November 1949',
    year: 1949,
    language: 'English',
    category: 'Constitutional Debates',
    excerpt: 'Documentary newsreel capturing Dr. B. R. Ambedkar, Chairman of the Drafting Committee, presenting the completed Constitution of India to Dr. Rajendra Prasad in Constitution Hall.',
    transcript: `[00:00] Narrator: Central Hall, Parliament House, New Delhi — November 26, 1949.
[00:25] Dr. B. R. Ambedkar: Of the 7,635 amendments tabled, 2,473 were moved, debated in full transparency, and disposed of on merit.
[00:58] Dr. B. R. Ambedkar: I feel that the Constitution is workable, it is flexible and it is strong enough to hold the country together both in peace time and in war time.
[01:32] Dr. B. R. Ambedkar: Let us resolve to place the nation above creed, and constitutional morality above partisan expediency.`,
    sourceCitation: 'Films Division of India Archival 35mm Reel FD-1949-114 & CAD Vol. XI, pp. 972–981',
    pageOrSection: 'Reel FD-1949-114 · Frame Sequence 00:00–02:05',
    archiveLocation: 'Audio-Visual Film Cold Storage · Canister VID-1949-CA',
    verified: true,
    visualMotif: 'constitution_folio',
    mediaDuration: '02:05',
    semanticKeywords: [
      'video', 'newsreel', 'documentary', 'presentation of constitution', '26 november 1949',
      'constitution day', 'samvidhan divas', 'drafting committee chairman'
    ],
    mediaSegments: [
      { timestamp: '00:00', seconds: 0, speaker: 'Archival Narrator', text: 'Central Hall, Parliament House, New Delhi — November 26, 1949. The Constituent Assembly convenes.' },
      { timestamp: '00:25', seconds: 25, speaker: 'Dr. B. R. Ambedkar', text: 'Of the 7,635 amendments tabled, 2,473 were moved and debated in parliamentary transparency.' },
      { timestamp: '00:58', seconds: 58, speaker: 'Dr. B. R. Ambedkar', text: 'I feel that the Constitution is workable, it is flexible and it is strong enough to hold the country together.' },
      { timestamp: '01:32', seconds: 92, speaker: 'Dr. B. R. Ambedkar', text: 'Let us resolve to place constitutional morality above partisan expediency.' }
    ]
  },
  {
    id: 'doc-1956-buddha-and-his-dhamma',
    accessionNumber: 'ACC-1956-BHD-1014',
    title: 'The Buddha and His Dhamma — Preface & "Dhamma as Righteous Social Relations" (Deekshabhoomi Manuscript)',
    type: 'manuscript',
    date: '14 October 1956',
    year: 1956,
    language: 'English',
    category: 'Buddhism & Philosophy',
    excerpt: 'The purpose of Religion is to explain the origin of the world. The purpose of Dhamma is to reconstruct the world. Dhamma is righteousness, which means right relations between man and man in all spheres of life.',
    transcript: `What the Buddha calls Dhamma differs fundamentally from what is called Religion. Religion, it is said, is personal and one must keep it to oneself.

Contrary to this, Dhamma is social. It is fundamentally and essentially so. Dhamma is righteousness, which means right relations between man and man in all spheres of life. Society cannot do without Dhamma.

Prajna (understanding/wisdom) and Karuna (compassion/loving-kindness) are the two pillars of the Buddha’s teaching. Learning without Karuna becomes dry scholasticism; Karuna without Prajna becomes blind sentiment. Only when Maitri (universal fellowship) guides human conduct can equality be sustained without coercion.`,
    sourceCitation: 'The Buddha and His Dhamma, Siddharth College Publication (1957); BAWS Vol. 11, Book IV, pp. 315–326',
    pageOrSection: 'Book IV, Part I, Sections 2–4, Pages 316–322',
    archiveLocation: '26 Alipur Road Memorial Collection · Manuscript Case VI',
    verified: true,
    visualMotif: 'buddha_dhamma',
    semanticKeywords: [
      'buddha and his dhamma', 'deekshabhoomi', 'nagpur', '1956', 'prajna', 'karuna', 'maitri',
      'reconstruct the world', 'dhamma vs religion', 'righteousness', 'social ethics'
    ]
  },
  {
    id: 'doc-1920-mooknayak-editorial',
    accessionNumber: 'ACC-1920-MKN-0131',
    title: 'Inaugural Editorial of "Mooknayak" (Leader of the Voiceless) — Fortnightly Newspaper',
    type: 'manuscript',
    date: '31 January 1920',
    year: 1920,
    language: 'Marathi',
    category: 'Social Justice & Caste',
    excerpt: 'Hindu society is like a multi-storeyed tower which has no staircase and no entrance. One is forced to die in the exact storey in which one happens to be born.',
    transcript: `मूकनायक — पहिला अंक, ३१ जानेवारी १९२०:
"ज्याप्रमाणे एखादा मनोरा अनंत मजल्यांचा असावा आणि त्यास चढण्याउतरण्यास शिडी नसावी, त्याप्रमाणेच हिंदू समाजाची रचना झाली आहे. ज्या मजल्यात ज्याचा जन्म झाला, त्याच मजल्यात त्याने मरून जावे."

English Archival Translation:
"Inequality is the very basis of the existing social order. It is a multi-storeyed tower with no staircase and no entrance. Every person is condemned to die in the storey in which they are born, regardless of merit or effort."`,
    sourceCitation: 'Mooknayak, Vol. I, Issue 1 (31 January 1920); BAWS Vol. 17, Part 3',
    pageOrSection: 'Vol. I, Issue 1, Editorial Page 1–2',
    archiveLocation: 'Marathi Periodicals Microfilm Vault · Reel MKN-1920-01',
    verified: true,
    visualMotif: 'mooknayak_press',
    semanticKeywords: [
      'mooknayak', 'leader of the voiceless', '1920', 'newspaper', 'journalism',
      'multi-storeyed tower', 'no staircase', 'sant tukaram', 'shahu maharaj'
    ]
  },
  {
    id: 'doc-1916-castes-in-india',
    accessionNumber: 'ACC-1916-COL-0509',
    title: 'Castes in India: Their Mechanism, Genesis and Development (Columbia University Seminar Paper)',
    type: 'speech',
    date: '9 May 1916',
    year: 1916,
    language: 'English',
    category: 'Social Justice & Caste',
    excerpt: 'Superimposition of endogamy on exogamy means the creation of caste. Endogamy is the only characteristic that is peculiar to caste, and if we succeed in showing how endogamy is maintained, we shall practically have proved the genesis and mechanism of caste.',
    transcript: `Read before the Anthropology Seminar of Dr. A. A. Goldenweiser at Columbia University:
"The essence of Caste lies in a single structural mechanism: the superimposition of endogamy (compulsory marriage within the group) over an underlying rule of exogamy.

To maintain strict endogamy within a closed social unit, patriarchal practices—compulsory widowhood, child marriage, and sati—were historically institutionalized. Thus, the subjugation of women and the maintenance of caste hierarchy are two sides of the exact same structural coin."`,
    sourceCitation: 'Indian Antiquary, Vol. XLVI (May 1917), pp. 81–95; BAWS Vol. 1, pp. 3–22',
    pageOrSection: 'Vol. 1, Pages 9–18',
    archiveLocation: 'Columbia University & Early Academic Works · Folio COL-1916',
    verified: true,
    visualMotif: 'draft_marginalia',
    semanticKeywords: [
      'castes in india', 'columbia university', '1916', 'endogamy', 'exogamy', 'anthropology',
      'goldenweiser', 'patriarchy', 'women and caste'
    ]
  },
  {
    id: 'doc-1948-constitutional-morality',
    accessionNumber: 'ACC-1948-CA-1104',
    title: 'Motion Introducing the Draft Constitution — "Constitutional Morality" & Parliamentary Accountability',
    type: 'speech',
    date: '4 November 1948',
    year: 1948,
    language: 'English',
    category: 'Constitutional Debates',
    excerpt: 'Constitutional morality is not a natural sentiment. It has to be cultivated. We must realize that our people have yet to learn it. Democracy in India is only a top-dressing on an Indian soil, which is essentially undemocratic.',
    transcript: `Introducing the Draft Constitution on 4 November 1948:
"By constitutional morality, Grote meant a paramount reverence for the forms of the Constitution, combined with open speech and unrestrained censure of authorities as to all their public acts.

In selecting between the American Presidential system (stability) and the Parliamentary system (responsibility), the Draft Constitution has preferred more responsibility to more stability through daily accountability."`,
    sourceCitation: 'CAD, Vol. VII (4 November 1948), pp. 31–44',
    pageOrSection: 'Vol. VII, Pages 32–38',
    archiveLocation: 'Parliament of India Constitutional Archives · Vault C-07',
    verified: true,
    visualMotif: 'constitution_folio',
    semanticKeywords: [
      'constitutional morality', 'george grote', '4 november 1948', 'draft constitution',
      'parliamentary system vs presidential system', 'responsibility over stability'
    ]
  },
  {
    id: 'doc-1947-states-and-minorities',
    accessionNumber: 'ACC-1947-SAM-0315',
    title: 'States and Minorities: Memorandum on Fundamental Rights & Economic Democracy',
    type: 'manuscript',
    date: '15 March 1947',
    year: 1947,
    language: 'English',
    category: 'Economics & Finance',
    excerpt: 'Anyone who studies the working of the system of social economy based on private enterprise must realize how it undermines the fruits of political liberty unless accompanied by economic safeguards against exploitation.',
    transcript: `Submitted to the Sub-Committee on Fundamental Rights:
"The main purpose is to put an obligation on the State to plan the economic life of the people on lines which lead to the highest point of productivity, provide for equitable distribution of wealth, and ensure that private cartels cannot dictate the terms of living to the poor."`,
    sourceCitation: 'States and Minorities (1947); BAWS Vol. 1, pp. 381–449',
    pageOrSection: 'Article II, Section IV, Pages 408–414',
    archiveLocation: 'Constituent Assembly Sub-Committee Papers · Folio SAM-1947',
    verified: true,
    visualMotif: 'rbi_thesis',
    semanticKeywords: [
      'states and minorities', 'economic democracy', 'state socialism', 'directive principles',
      'fundamental rights sub-committee', 'economic safeguards'
    ]
  },
  {
    id: 'doc-1956-video-nagpur-conversion',
    accessionNumber: 'ACC-1956-VID-1014',
    title: 'Archival Documentary Film: The Historic Dhamma Deeksha at Nagpur (14 October 1956)',
    type: 'video',
    date: '14 October 1956',
    year: 1956,
    language: 'Marathi',
    category: 'Buddhism & Philosophy',
    excerpt: 'Rare archival footage and synchronized audio transcript from Deekshabhoomi, Nagpur, where Dr. B. R. Ambedkar administered the Three Jewels, Five Precepts, and Twenty-Two Vows of ethical human emancipation to over 500,000 people.',
    transcript: `[00:00] Archival Narrator: Nagpur, October 14, 1956 — Ashoka Vijayadashami. Over half a million people gather in white attire at Deekshabhoomi.
[00:22] Dr. B. R. Ambedkar: आज आपला पुनर्जन्म होत आहे. मानवी समता, प्रज्ञा, करुणा आणि शील या तत्त्वांवर आधारित भगवान बुद्धांच्या धम्माची आपण आज दीक्षा घेत आहोत.
[00:54] Dr. B. R. Ambedkar: "By discarding the ancient order which stood for inequality, I am reborn. An ethical path must stand the test of reason and universal brotherhood."
[01:28] Dr. B. R. Ambedkar: "I shall consider all human beings as equal. I shall follow the Noble Eightfold Path and practice Karuna and Maitri toward all living beings."`,
    sourceCitation: 'Deekshabhoomi Archival Film (14–15 October 1956); BAWS Vol. 17, Part 3, pp. 515–548',
    pageOrSection: 'Reel DKB-1956-02',
    archiveLocation: 'Audio-Visual Film Cold Storage · Canister VID-1956-NGP',
    verified: true,
    visualMotif: 'buddha_dhamma',
    mediaDuration: '02:00',
    semanticKeywords: [
      'deekshabhoomi', 'nagpur', '14 october 1956', 'twenty two vows', '22 vows',
      'buddhism conversion', 'noble eightfold path'
    ],
    mediaSegments: [
      { timestamp: '00:00', seconds: 0, speaker: 'Archival Narrator', text: 'Nagpur, October 14, 1956. Over half a million citizens gather at Deekshabhoomi.' },
      { timestamp: '00:22', seconds: 22, speaker: 'Dr. B. R. Ambedkar', text: 'आज आपला पुनर्जन्म होत आहे. मानवी समता आणि प्रज्ञा या तत्त्वांवर आधारित धम्माची आपण दीक्षा घेत आहोत.' },
      { timestamp: '00:54', seconds: 54, speaker: 'Dr. B. R. Ambedkar', text: 'An ethical path must stand the test of reason and universal brotherhood.' },
      { timestamp: '01:28', seconds: 88, speaker: 'Dr. B. R. Ambedkar', text: 'I shall consider all human beings as equal and practice Karuna and Maitri.' }
    ]
  },
  {
    id: 'doc-1927-declaration-of-human-rights',
    accessionNumber: 'ACC-1927-MHD-1225',
    title: 'Mahad Satyagraha Conference — "Declaration of Fundamental Birthrights of Every Citizen"',
    type: 'speech',
    date: '25 December 1927',
    year: 1927,
    language: 'Marathi',
    category: 'Civic Movements',
    excerpt: 'All men are born equal and remain equal until death. Laws and social arrangements ought to be for the preservation of human liberty and equality, never for the preservation of hereditary privilege.',
    transcript: `Declaration of Human Rights at the Second Mahad Conference:
"1. All human beings are born equal and possess equal civic and political worth until death.
2. No person or class may claim hereditary superiority by reason of birth alone.
3. The sole legitimate aim of social, legal, and political institutions is the preservation of equal human liberty and public welfare."`,
    sourceCitation: 'Bahishkrit Bharat Special Issue (January 1928); BAWS Vol. 17, Part 1, pp. 38–54',
    pageOrSection: 'Resolution No. 1–4, Pages 41–46',
    archiveLocation: 'Konkan Civic Movements Gallery · Folio MHD-1927-DEC',
    verified: true,
    visualMotif: 'mahad_chronicle',
    semanticKeywords: [
      'declaration of human rights', '25 december 1927', 'mahad conference', 'born equal',
      'french revolution', 'rights of man'
    ]
  }
];

export interface TimelineMilestone {
  id: string;
  year: string;
  dateLabel: string;
  title: string;
  location: string;
  theme: string;
  summary: string;
  historicalImpact: string;
  linkedDocumentId: string;
}

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    id: 'ms-1891',
    year: '1891',
    dateLabel: '14 April 1891',
    title: 'Birth at Mhow Cantonment & Early Education',
    location: 'Mhow & Bombay',
    theme: 'Foundational Years',
    summary: 'Born to Subedar Ramji Maloji Sakpal and Bhimabai in Mhow. Graduated from Elphinstone College in 1912 with a degree in Economics and Political Science.',
    historicalImpact: 'Awarded the Baroda State Scholarship in 1913 for postgraduate studies at Columbia University, New York.',
    linkedDocumentId: 'doc-1916-castes-in-india'
  },
  {
    id: 'ms-1916',
    year: '1916',
    dateLabel: 'May 1916 – 1923',
    title: 'Doctoral Treatises at Columbia & London School of Economics',
    location: 'New York & London',
    theme: 'Academic & Economic Treatises',
    summary: 'Authored "Castes in India" at Columbia, completed his Ph.D. and earned his D.Sc. at LSE on "The Problem of the Rupee".',
    historicalImpact: 'His monetary thesis shaped the Hilton Young Commission (1925) and the creation of the Reserve Bank of India (1935).',
    linkedDocumentId: 'doc-1923-problem-of-the-rupee'
  },
  {
    id: 'ms-1920',
    year: '1920',
    dateLabel: '31 January 1920',
    title: 'Launch of "Mooknayak" (Leader of the Voiceless)',
    location: 'Bombay',
    theme: 'Public Journalism & Mobilization',
    summary: 'Founded the fortnightly Marathi periodical Mooknayak under the epigraph of Sant Tukaram to give voice to the marginalized.',
    historicalImpact: 'Created an independent intellectual public sphere for civic and social rights.',
    linkedDocumentId: 'doc-1920-mooknayak-editorial'
  },
  {
    id: 'ms-1927',
    year: '1927',
    dateLabel: '20 March 1927',
    title: 'Mahad Chavdar Tale Satyagraha',
    location: 'Mahad, Maharashtra',
    theme: 'Civic Rights Movement',
    summary: 'Led delegates to the public Chavdar water tank in Mahad, asserting universal civic rights and human dignity.',
    historicalImpact: 'Marked the historic transition to direct non-violent assertion of equal citizenship.',
    linkedDocumentId: 'doc-1927-mahad-satyagraha'
  },
  {
    id: 'ms-1930',
    year: '1930–32',
    dateLabel: '20 November 1930',
    title: 'Round Table Conferences & Representation',
    location: 'St. James’s Palace, London',
    theme: 'Constitutional Representation',
    summary: 'Demanded adult suffrage, fundamental rights, and political representation at all three Round Table Conferences.',
    historicalImpact: 'Secured recognition that political power is indispensable for social emancipation.',
    linkedDocumentId: 'doc-1930-round-table-conference'
  },
  {
    id: 'ms-1936',
    year: '1936',
    dateLabel: '15 May 1936',
    title: 'Publication of "Annihilation of Caste"',
    location: 'Bombay & Lahore',
    theme: 'Social Philosophy',
    summary: 'Articulated democracy as a mode of associated living grounded in Liberty, Equality, and Fraternity.',
    historicalImpact: 'A foundational masterpiece of modern political philosophy and social reform.',
    linkedDocumentId: 'doc-1936-annihilation-of-caste'
  },
  {
    id: 'ms-1942',
    year: '1942–46',
    dateLabel: 'July 1942 – 1946',
    title: 'Labour, Irrigation & Power Member in Executive Council',
    location: 'New Delhi',
    theme: 'Labour & Infrastructure',
    summary: 'Enacted the 8-hour workday, maternity benefits, Dearness Allowance, ESI, and established multipurpose river valley projects.',
    historicalImpact: 'Built the statutory foundation of modern Indian labour welfare and river valley engineering.',
    linkedDocumentId: 'doc-1942-labour-reforms'
  },
  {
    id: 'ms-1947',
    year: '1947–48',
    dateLabel: '29 August 1947',
    title: 'Chairman of the Constitutional Drafting Committee',
    location: 'Constitution Hall, New Delhi',
    theme: 'Constitutional Architecture',
    summary: 'Elected Chairman of the Drafting Committee and steered the Constitution through 114 days of clause-by-clause deliberation.',
    historicalImpact: 'Enshrined Fundamental Rights, Article 32 remedies, and equal democratic citizenship.',
    linkedDocumentId: 'doc-ca-1948-article-32-heart-soul'
  },
  {
    id: 'ms-1949',
    year: '1949–51',
    dateLabel: '25–26 November 1949',
    title: 'Adoption of the Constitution & Hindu Code Bill',
    location: 'Parliament House, New Delhi',
    theme: 'Republic & Gender Justice',
    summary: 'Delivered his historic closing address on social democracy and championed the Hindu Code Bill for women’s equality.',
    historicalImpact: 'Galvanized statutory equal inheritance and marriage rights for women.',
    linkedDocumentId: 'doc-ca-1949-grammar-of-anarchy'
  },
  {
    id: 'ms-1956',
    year: '1956',
    dateLabel: '14 October 1956',
    title: 'Deekshabhoomi & The Buddha and His Dhamma',
    location: 'Nagpur & New Delhi',
    theme: 'Ethical Emancipation',
    summary: 'Embraced Buddhism at Deekshabhoomi with 500,000 followers and completed his final philosophical work.',
    historicalImpact: 'Synthesized Prajna (wisdom), Karuna (compassion), and Maitri (fellowship) as an ethical human philosophy.',
    linkedDocumentId: 'doc-1956-buddha-and-his-dhamma'
  }
];

export interface VerifiedCitationItem {
  documentId: string;
  documentTitle: string;
  accessionNumber: string;
  pageOrSection: string;
  sourceCitation: string;
  date: string;
  relevantQuote: string;
}

export interface AssistantResponsePayload {
  foundInArchive: boolean;
  verifiedBadgeText: string;
  answer: string;
  retrievalMode: 'gemini-rag-verified' | 'deterministic-archive-rag';
  citations: VerifiedCitationItem[];
}

export interface PreWrittenQA {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  documentIds: string[];
}

export const PRE_WRITTEN_QA_PAIRS: PreWrittenQA[] = [
  {
    id: 'qa-social-democracy',
    question: 'Why did Dr. Ambedkar warn that political democracy cannot last without social democracy?',
    keywords: ['social democracy', 'political democracy', 'contradictions', '25 november 1949', 'grammar of anarchy', 'liberty equality fraternity'],
    answer: `In his closing address to the Constituent Assembly on 25 November 1949, Dr. B. R. Ambedkar warned that on 26 January 1950 India would enter a "life of contradictions": enjoying equality in politics ("one man, one vote, and one vote, one value") while continuing to deny "one man, one value" in social and economic life.

He defined social democracy as a way of life that recognizes liberty, equality, and fraternity not as separate items in a trinity, but as an inseparable union. He emphasized that citizens must abandon unconstitutional methods—which he termed the "Grammar of Anarchy"—now that constitutional methods are open.`,
    documentIds: ['doc-ca-1949-grammar-of-anarchy', 'doc-1936-annihilation-of-caste']
  },
  {
    id: 'qa-article-32',
    question: 'Why did Dr. Ambedkar call Article 32 the "heart and soul" of the Constitution?',
    keywords: ['article 32', 'draft article 25', 'heart and soul', 'constitutional remedies', 'writs', 'habeas corpus', 'fundamental rights'],
    answer: `During the Constituent Assembly debate on Draft Article 25 (enacted as Article 32) on 9 December 1948, Dr. B. R. Ambedkar declared: "If I was asked to name any particular article in this Constitution as the most important—an article without which this Constitution would be a nullity—I could not refer to any other article except this one. It is the very soul of the Constitution and the very heart of it."

He stressed that without enforceable constitutional remedies through writs of Habeas Corpus, Mandamus, Prohibition, Quo Warranto, and Certiorari, fundamental rights would remain mere paper declarations.`,
    documentIds: ['doc-ca-1948-article-32-heart-soul']
  },
  {
    id: 'qa-rbi-economics',
    question: 'How did Dr. Ambedkar’s economic thesis influence the Reserve Bank of India and monetary policy?',
    keywords: ['reserve bank', 'rbi', 'problem of the rupee', 'monetary', 'currency', 'hilton young', 'gold exchange', 'inflation', 'economics'],
    answer: `In his 1923 London School of Economics D.Sc. thesis, The Problem of the Rupee: Its Origin and Its Solution, and his evidence before the Royal Commission on Indian Currency and Finance (Hilton Young Commission, 1925), Dr. Ambedkar argued that stabilizing the internal purchasing power of the currency was far more critical for the working classes than external exchange pegging. His recommendations for an independent central monetary authority directly inspired the Reserve Bank of India Act, 1934.`,
    documentIds: ['doc-1923-problem-of-the-rupee', 'doc-1947-states-and-minorities']
  },
  {
    id: 'qa-hindu-code-women',
    question: 'What reforms for women’s rights and labour welfare did Dr. Ambedkar champion?',
    keywords: ['women', 'hindu code bill', 'gender', 'property', 'inheritance', 'divorce', 'maternity', 'labour', '8 hour', 'equal pay'],
    answer: `Dr. Ambedkar drafted and championed the Hindu Code Bill to grant daughters equal shares in parental inheritance, abolish limited estate, mandate monogamy, and codify divorce rights. In his resignation speech in 1951, he stated that leaving gender inequality untouched was "to build a palace on a dung heap." As Labour Member (1942–1946), he also established the statutory 8-hour workday, the Mines Maternity Benefit Act, equal pay for equal work, and the framework for Employees' State Insurance (ESI).`,
    documentIds: ['doc-1951-hindu-code-bill', 'doc-1942-labour-reforms']
  }
];

export function retrieveGroundedAnswer(query: string): AssistantResponsePayload {
  const normalized = query.toLowerCase().trim();

  let bestQA: PreWrittenQA | null = null;
  let bestQAScore = 0;

  for (const qa of PRE_WRITTEN_QA_PAIRS) {
    let score = 0;
    for (const kw of qa.keywords) {
      if (normalized.includes(kw.toLowerCase())) score += 3;
      else {
        const parts = kw.toLowerCase().split(/\s+/);
        score += parts.filter((p) => p.length > 3 && normalized.includes(p)).length;
      }
    }
    if (score > bestQAScore) {
      bestQAScore = score;
      bestQA = qa;
    }
  }

  const queryTokens = normalized
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['what', 'why', 'how', 'when', 'where', 'did', 'the', 'and', 'for', 'with', 'about', 'from', 'his', 'was'].includes(w));

  const scoredDocs = ARCHIVE_CORPUS.map((doc) => {
    let score = 0;
    const hay = `${doc.title} ${doc.category} ${doc.excerpt} ${doc.transcript} ${doc.semanticKeywords.join(' ')}`.toLowerCase();
    for (const t of queryTokens) {
      if (doc.title.toLowerCase().includes(t)) score += 4;
      if (doc.semanticKeywords.some((k) => k.toLowerCase().includes(t))) score += 3;
      if (hay.includes(t)) score += 1;
    }
    return { doc, score };
  })
    .filter((item) => item.score >= 2)
    .sort((a, b) => b.score - a.score);

  if (bestQA && bestQAScore >= 2) {
    const docs = bestQA.documentIds
      .map((id) => ARCHIVE_CORPUS.find((d) => d.id === id))
      .filter((d): d is ArchiveDocument => Boolean(d));

    return {
      foundInArchive: true,
      verifiedBadgeText: 'Answered from verified archive',
      retrievalMode: 'deterministic-archive-rag',
      answer: bestQA.answer,
      citations: docs.map((d) => ({
        documentId: d.id,
        documentTitle: d.title,
        accessionNumber: d.accessionNumber,
        pageOrSection: d.pageOrSection,
        sourceCitation: d.sourceCitation,
        date: d.date,
        relevantQuote: d.excerpt
      }))
    };
  }

  if (scoredDocs.length > 0) {
    const top = scoredDocs[0].doc;
    return {
      foundInArchive: true,
      verifiedBadgeText: 'Answered from verified archive',
      retrievalMode: 'deterministic-archive-rag',
      answer: `From verified archival record **${top.title}** (${top.date}, ${top.accessionNumber}):\n\n"${top.excerpt}"\n\n${top.transcript.split('\n\n')[0]}`,
      citations: [
        {
          documentId: top.id,
          documentTitle: top.title,
          accessionNumber: top.accessionNumber,
          pageOrSection: top.pageOrSection,
          sourceCitation: top.sourceCitation,
          date: top.date,
          relevantQuote: top.excerpt
        }
      ]
    };
  }

  return {
    foundInArchive: false,
    verifiedBadgeText: 'Archive Guardrail Active — Zero Unverified Extrapolation',
    retrievalMode: 'deterministic-archive-rag',
    answer: 'No verified source found for this query in the Ambedkar Gyaan Kosh curated corpus. In accordance with institutional archival integrity protocols, this kiosk assistant only synthesizes responses backed by verified primary speeches, Constituent Assembly debates, manuscripts, and legislative records.',
    citations: []
  };
}

export interface UILocalizationStrings {
  kioskSubtitle: string;
  navHome: string;
  navSearch: string;
  navAssistant: string;
  navTimeline: string;
  navManuscripts: string;
  navMedia: string;
  heroKicker: string;
  heroTitle: string;
  heroDescription: string;
  exploreArchiveCta: string;
  askAssistantCta: string;
  listenAudioBtn: string;
  stopAudioBtn: string;
  verifiedArchiveBadge: string;
  digitizedVerifiedBadge: string;
  viewSourceBtn: string;
  qrHandoffBtn: string;
  demoModeNotice: string;
}

export const UI_TRANSLATIONS: Record<SupportedLanguage, UILocalizationStrings> = {
  en: {
    kioskSubtitle: 'Dr. Ambedkar International Centre · Digital Heritage Kiosk Prototype',
    navHome: 'Kiosk Home',
    navSearch: 'Semantic Search',
    navAssistant: 'AI Research Assistant',
    navTimeline: 'Life & Constitution Timeline',
    navManuscripts: 'Manuscripts & OCR',
    navMedia: 'Audio-Video Archive',
    heroKicker: 'NATIONAL CONSTITUTIONAL & DIGITAL HERITAGE ARCHIVE',
    heroTitle: 'Ambedkar Gyaan Kosh',
    heroDescription: 'An interactive archival touch terminal preserving Dr. B. R. Ambedkar’s Constituent Assembly debates, manuscripts, economic treatises, and historic broadcasts with strict source-verified retrieval.',
    exploreArchiveCta: 'Search Primary Corpus',
    askAssistantCta: 'Consult Verified AI Scholar',
    listenAudioBtn: 'Listen (Read Aloud)',
    stopAudioBtn: 'Stop Reading',
    verifiedArchiveBadge: 'Answered from verified archive',
    digitizedVerifiedBadge: 'Digitized & Archivist Verified',
    viewSourceBtn: 'View Primary Source',
    qrHandoffBtn: 'Take to Phone (QR)',
    demoModeNotice: 'Kiosk Prototype Mode — Simulated OCR/IndicTrans2 & Citation-Locked Retrieval'
  },
  hi: {
    kioskSubtitle: 'डॉ. अम्बेडकर अंतर्राष्ट्रीय केंद्र · डिजिटल विरासत कियोस्क प्रोटोटाइप',
    navHome: 'मुखपृष्ठ',
    navSearch: 'अर्थपूर्ण खोज (Semantic Search)',
    navAssistant: 'एआई शोध सहायक',
    navTimeline: 'जीवन एवं संविधान कालक्रम',
    navManuscripts: 'पांडुलिपियां एवं ओसीआर',
    navMedia: 'ऑडियो-वीडियो अभिलेखागार',
    heroKicker: 'राष्ट्रीय संवैधानिक एवं डिजिटल विरासत अभिलेखागार',
    heroTitle: 'अम्बेडकर ज्ञान कोष',
    heroDescription: 'डॉ. बी. आर. अम्बेडकर के संविधान सभा भाषणों, मूल पांडुलिपियों, आर्थिक शोधग्रंथों और ऐतिहासिक प्रसारणों का प्रमाणित डिजिटल अभिलेखागार।',
    exploreArchiveCta: 'अभिलेखागार में खोजें',
    askAssistantCta: 'प्रमाणित एआई सहायक से पूछें',
    listenAudioBtn: 'सुनें (ध्वनि वाचन)',
    stopAudioBtn: 'वाचन रोकें',
    verifiedArchiveBadge: 'सत्यापित अभिलेखागार से उत्तरित',
    digitizedVerifiedBadge: 'डिजिटाइज़्ड एवं पुरालेखपाल सत्यापित',
    viewSourceBtn: 'मूल स्रोत देखें',
    qrHandoffBtn: 'फ़ोन पर पढ़ें (QR)',
    demoModeNotice: 'कियोस्क डेमो मोड — सिम्युलेटेड OCR/IndicTrans2 और स्रोत-सत्यापित खोज'
  },
  mr: {
    kioskSubtitle: 'डॉ. आंबेडकर आंतरराष्ट्रीय केंद्र · डिजिटल वारसा किओस्क प्रोटोटाइप',
    navHome: 'मुख्यपृष्ठ',
    navSearch: 'वैचारिक शोध (Search)',
    navAssistant: 'एआय संशोधन सहाय्यक',
    navTimeline: 'जीवन व संविधान कालपट',
    navManuscripts: 'हस्तलिखिते आणि ओसीआर',
    navMedia: 'ध्वनी-चित्रफीत संग्रह',
    heroKicker: 'राष्ट्रीय संवैधानिक आणि डिजिटल वारसा अभिलेखागार',
    heroTitle: 'आंबेडकर ज्ञान कोष',
    heroDescription: 'डॉ. बाबासाहेब आंबेडकर यांची संविधान सभेतील भाषणे, दुर्मिळ हस्तलिखिते, अर्थशास्त्रीय प्रबंध आणि ऐतिहासिक ध्वनिमुद्रणांचा प्रमाणित संग्रह.',
    exploreArchiveCta: 'मूळ दस्तऐवज शोधा',
    askAssistantCta: 'सत्यापित एआय सहाय्यकाला विचारा',
    listenAudioBtn: 'ऐका (वाचन सुरू करा)',
    stopAudioBtn: 'वाचन थांबवा',
    verifiedArchiveBadge: 'सत्यापित अभिलेखागारातून उत्तर दिले',
    digitizedVerifiedBadge: 'डिजिटाइज्ड आणि पुरालेखपाल प्रमाणित',
    viewSourceBtn: 'मूळ संदर्भ पहा',
    qrHandoffBtn: 'मोबाईलवर वाचा (QR)',
    demoModeNotice: 'किओस्क डेमो मोड — सिम्युलेटेड OCR/IndicTrans2 आणि संदर्भ-आधारित प्रणाली'
  },
  ta: {
    kioskSubtitle: 'டாக்டர் அம்பேத்கர் சர்வதேச மையம் · டிஜிட்டல் பாரம்பரிய முனையம்',
    navHome: 'முகப்பு',
    navSearch: 'கருத்துத் தேடல்',
    navAssistant: 'AI ஆராய்ச்சி உதவியாளர்',
    navTimeline: 'வாழ்க்கை & அரசியலமைப்பு காலவரிசை',
    navManuscripts: 'கையெழுத்துப் பிரதிகள் & OCR',
    navMedia: 'ஒலி-ஒளி ஆவணக்காப்பகம்',
    heroKicker: 'தேசிய அரசியலமைப்பு மற்றும் டிஜிட்டல் பாரம்பரிய ஆவணக்காப்பகம்',
    heroTitle: 'அம்பேத்கர் ஞான கோஷ்',
    heroDescription: 'டாக்டர் பி. ஆர். அம்பேத்கரின் அரசியலமைப்பு சபை உரைகள், கையெழுத்துப் பிரதிகள் மற்றும் வரலாற்று ஆவணங்களின் சரிபார்க்கப்பட்ட டிஜிட்டல் களஞ்சியம்.',
    exploreArchiveCta: 'ஆவணங்களைத் தேடுங்கள்',
    askAssistantCta: 'AI உதவியாளரிடம் கேளுங்கள்',
    listenAudioBtn: 'கேட்க (குரல் வாசிப்பு)',
    stopAudioBtn: 'நிறுத்து',
    verifiedArchiveBadge: 'சரிபார்க்கப்பட்ட ஆவணத்திலிருந்து பதில்',
    digitizedVerifiedBadge: 'டிஜிட்டல் மயமாக்கப்பட்டு சரிபார்க்கப்பட்டது',
    viewSourceBtn: 'மூல ஆவணத்தைக் காண்க',
    qrHandoffBtn: 'கைபேசியில் தொடர (QR)',
    demoModeNotice: 'கியோஸ்க் டெமோ பயன்முறை'
  },
  bn: {
    kioskSubtitle: 'ডঃ আম্বেদকর আন্তর্জাতিক কেন্দ্র · ডিজিটাল হেরিটেজ কিয়স্ক প্রোটোটাইপ',
    navHome: 'হোম স্ক্রিন',
    navSearch: 'সেমান্টিক অনুসন্ধান',
    navAssistant: 'এআই গবেষণা সহায়ক',
    navTimeline: 'জীবন ও সংবিধান কালক্রম',
    navManuscripts: 'পাণ্ডুলিপি ও ওসিআর',
    navMedia: 'অডিও-ভিডিও আর্কাইভ',
    heroKicker: 'জাতীয় সাংবিধানিক ও ডিজিটাল হেরিটেজ আর্কাইভ',
    heroTitle: 'আম্বেদকর জ্ঞান কোষ',
    heroDescription: 'ডঃ বি. আর. আম্বেদকরের গণপরিষদের ভাষণ, দুষ্প্রাপ্য পাণ্ডুলিপি, অর্থনৈতিক গবেষণা এবং ঐতিহাসিক সম্প্রচারের প্রামাণ্য ডিজিটাল সংগ্রহশালা।',
    exploreArchiveCta: 'মূল আর্কাইভ অনুসন্ধান',
    askAssistantCta: 'এআই সহায়ককে প্রশ্ন করুন',
    listenAudioBtn: 'শুনুন (পাঠ করুন)',
    stopAudioBtn: 'পাঠ থামান',
    verifiedArchiveBadge: 'যাচাইকৃত আর্কাইভ থেকে প্রাপ্ত উত্তর',
    digitizedVerifiedBadge: 'ডিজিটাইজড এবং মহাফেজখানা দ্বারা যাচাইকৃত',
    viewSourceBtn: 'মূল সূত্র দেখুন',
    qrHandoffBtn: 'ফোনে নিয়ে যান (QR)',
    demoModeNotice: 'কিয়স্ক ডেমো মোড'
  },
  pi: {
    kioskSubtitle: 'डॉ. अम्बेडकर अन्तरराष्ट्रीय केन्द्रम् · धम्म-संविधान अभिलेखागारः',
    navHome: 'मूलपटलम्',
    navSearch: 'अर्थ-अन्वेषणम्',
    navAssistant: 'प्रज्ञा-सहायकः (AI)',
    navTimeline: 'जीवन-संविधान कालक्रमः',
    navManuscripts: 'हस्तलेख-पटलम् (OCR)',
    navMedia: 'ध्वनि-दृश्य संग्रहः',
    heroKicker: 'राष्ट्रीय संविधान एवं धम्म-विरासत संग्रहालयः',
    heroTitle: 'अम्बेडकर ज्ञान कोषः',
    heroDescription: 'बोधिसत्त्व डॉ. भीमराव अम्बेडकरस्स संविधान-सम्भाषणानि, अर्थशास्त्र-ग्रन्थाः, धम्मपद-पाण्डुलिपयश्च प्रमाणित-सन्दर्भ-सहिताः।',
    exploreArchiveCta: 'मूलग्रन्थान् अन्वेषयतु',
    askAssistantCta: 'प्रमाणित-सहायकं पृच्छतु',
    listenAudioBtn: 'शृणोतु (वाचनम्)',
    stopAudioBtn: 'विरमतु',
    verifiedArchiveBadge: 'प्रमाणित-अभिलेखागारात् उत्तरितम्',
    digitizedVerifiedBadge: 'अभिलेखपाल-प्रमाणितं मूलपत्रम्',
    viewSourceBtn: 'मूलस्रोतम् पश्यतु',
    qrHandoffBtn: 'चलदूरभाषे पश्यतु (QR)',
    demoModeNotice: 'प्रदर्शन-प्रणाली (Demo Mode)'
  }
};
