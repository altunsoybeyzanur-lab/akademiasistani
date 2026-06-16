/* ============================================================
   Screens: Çevirmen — MyMemory API + Sözlük
   ============================================================ */
(function () {

  const TR_LANGS = [
    { code: 'tr', label: 'Türkçe',    flag: '🇹🇷' },
    { code: 'en', label: 'English',   flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
    { code: 'fr', label: 'Français',  flag: '🇫🇷' },
    { code: 'es', label: 'Español',   flag: '🇪🇸' },
    { code: 'ar', label: 'العربية',   flag: '🇸🇦' },
    { code: 'ru', label: 'Русский',   flag: '🇷🇺' },
    { code: 'it', label: 'Italiano',  flag: '🇮🇹' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'zh', label: '中文',       flag: '🇨🇳' },
    { code: 'ja', label: '日本語',     flag: '🇯🇵' },
    { code: 'ko', label: '한국어',     flag: '🇰🇷' },
  ];

  /* ---- MyMemory API ---- */
  async function translateMyMemory(text, from, to) {
    if (!text.trim()) return '';
    const langpair = `${from}|${to}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}&de=akademiasistani@example.com`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('api_error');
    const data = await res.json();
    if (data.responseStatus === 200 || data.responseStatus === '200') {
      return data.responseData.translatedText || '';
    }
    throw new Error(data.responseDetails || 'Translation failed');
  }

  /* ---------------- TRANSLATOR ---------------- */
  function ScreenTranslate() {
    const { lang } = useApp();
    const tr = lang === 'tr';
    const [from, setFrom] = useState('tr');
    const [to, setTo]     = useState('en');
    const [input, setInput]   = useState(tr ? 'Bu çalışmada yeni bir yöntem öneriyoruz.' : 'In this study we propose a new method.');
    const [output, setOutput] = useState('');
    const [phase, setPhase]   = useState('idle'); // idle | loading | done | error
    const [errMsg, setErrMsg] = useState('');
    const [charCount, setCharCount] = useState(0);

    const langName = c => (TR_LANGS.find(l => l.code === c) || {}).label || c;
    const langFlag = c => (TR_LANGS.find(l => l.code === c) || {}).flag || '';

    const swap = () => {
      setFrom(to); setTo(from);
      setInput(output || input);
      setOutput('');
      setPhase('idle');
    };

    const translate = () => {
      if (!input.trim() || from === to) return;
      setPhase('loading'); setErrMsg('');
      translateMyMemory(input, from, to)
        .then(text => { setOutput(text); setPhase('done'); setCharCount(text.length); })
        .catch(e => { setErrMsg(e.message); setPhase('error'); });
    };

    const SAMPLES = tr
      ? ['Sonuçlar yöntemimizin etkili olduğunu gösterir.', 'Bu araştırma nicel yöntem kullanmaktadır.', 'Bulgular istatistiksel olarak anlamlıdır.']
      : ['The results show that our method is effective.', 'This research uses a quantitative approach.', 'The findings are statistically significant.'];

    const langSelect = (val, onChange) =>
      React.createElement('select', {
        className: 'input',
        style: { height: 36, width: 'auto', border: 'none', background: 'transparent', fontWeight: 700, fontSize: 14, paddingLeft: 4 },
        value: val,
        onChange: e => { onChange(e.target.value); setPhase('idle'); setOutput(''); },
      }, TR_LANGS.map(l =>
        React.createElement('option', { key: l.code, value: l.code }, `${l.flag} ${l.label}`)));

    const E = React.createElement;

    return E(React.Fragment, null,
      E(PageHead, { title: tr ? 'Çevirmen' : 'Translator', sub: tr ? 'MyMemory API · 75+ dil · Ücretsiz' : 'MyMemory API · 75+ languages · Free' }),
      E('div', { className: 'content' },
        E('div', { className: 'content-pad content-wide' },

          E('div', { className: 'card', style: { overflow: 'hidden' } },

            /* Dil çubuğu */
            E('div', { className: 'flex', style: { alignItems: 'center', borderBottom: '1px solid var(--line)' } },
              E('div', { style: { flex: 1, padding: '8px 16px' } }, langSelect(from, setFrom)),
              E('button', { className: 'btn btn-ghost btn-icon', onClick: swap, title: tr ? 'Dilleri değiştir' : 'Swap languages', style: { flex: '0 0 auto' } },
                E(Icon, { name: 'swap', size: 18 })),
              E('div', { style: { flex: 1, padding: '8px 16px' } }, langSelect(to, setTo))),

            /* İki panel */
            E('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 240 } },

              /* Sol — kaynak */
              E('div', { style: { borderRight: '1px solid var(--line)', position: 'relative', display: 'flex', flexDirection: 'column' } },
                E('textarea', {
                  className: 'input', value: input,
                  onChange: e => { setInput(e.target.value); setPhase('idle'); setOutput(''); },
                  onKeyDown: e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); translate(); } },
                  placeholder: tr ? 'Çevrilecek metni girin… (Ctrl+Enter ile çevir)' : 'Enter text to translate… (Ctrl+Enter)',
                  style: { border: 'none', borderRadius: 0, flex: 1, minHeight: 220, fontSize: 15, lineHeight: 1.7, boxShadow: 'none', resize: 'none' },
                }),
                E('div', { style: { padding: '8px 12px', borderTop: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)' } },
                  E('span', { style: { fontSize: 11.5, color: 'var(--ink-4)' } }, `${input.length} ${tr ? 'karakter' : 'chars'}`),
                  E('div', { className: 'grow' }),
                  input && E('button', { className: 'x-btn', style: { width: 24, height: 24 }, onClick: () => { setInput(''); setOutput(''); setPhase('idle'); } },
                    E(Icon, { name: 'x', size: 13 })))),

              /* Sağ — çeviri */
              E('div', { style: { position: 'relative', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column' } },
                E('div', { style: { flex: 1, padding: '14px 16px', minHeight: 220, fontSize: 15, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap', position: 'relative' } },
                  phase === 'loading' && E('div', { className: 'flex gap-10', style: { alignItems: 'center', color: 'var(--ink-3)', paddingTop: 8 } },
                    E('div', { className: 'spinner' }),
                    tr ? 'Çevriliyor…' : 'Translating…'),
                  phase === 'error' && E('div', { className: 'flex gap-8', style: { color: 'var(--red)', fontSize: 13.5 } },
                    E(Icon, { name: 'alert', size: 16 }),
                    tr ? 'Çeviri başarısız. İnternet bağlantınızı kontrol edin.' : 'Translation failed. Check your connection.'),
                  (phase === 'done' || phase === 'idle') && (output
                    ? E('span', null, output)
                    : E('span', { className: 'muted' }, tr ? `${langFlag(to)} Çeviri burada görünür` : `${langFlag(to)} Translation appears here`))),
                E('div', { style: { padding: '8px 12px', borderTop: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 8 } },
                  phase === 'done' && E('span', { className: 'badge green', style: { gap: 4 } },
                    E(Icon, { name: 'globe', size: 11 }), 'MyMemory'),
                  E('div', { className: 'grow' }),
                  output && E('button', { className: 'btn btn-ghost btn-icon btn-sm', onClick: () => { navigator.clipboard && navigator.clipboard.writeText(output); toast(tr ? 'Kopyalandı' : 'Copied'); } },
                    E(Icon, { name: 'copy', size: 14 }))))),

            /* Çevir butonu */
            E('div', { style: { padding: '12px 16px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' } },
              E('button', {
                className: 'btn btn-primary', style: { height: 40, paddingInline: 22 },
                disabled: !input.trim() || phase === 'loading' || from === to,
                onClick: translate,
              },
                phase === 'loading'
                  ? E('div', { className: 'spinner', style: { borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.4)', width: 15, height: 15 } })
                  : E(Icon, { name: 'translate', size: 16 }),
                phase === 'loading' ? (tr ? 'Çevriliyor…' : 'Translating…') : (tr ? 'Çevir' : 'Translate')),
              E('span', { style: { fontSize: 12, color: 'var(--ink-4)' } }, tr ? 'veya Ctrl+Enter' : 'or Ctrl+Enter'),
              E('div', { className: 'grow' }),
              E('span', { style: { fontSize: 11.5, color: 'var(--ink-4)' } },
                tr ? 'Günlük 1000 kelime · ücretsiz' : 'Free · 1000 words/day'))),

          /* Örnek cümleler */
          E('div', { className: 'flex gap-8 wrap', style: { marginTop: 14, alignItems: 'center' } },
            E('span', { className: 'field-label', style: { margin: 0 } }, tr ? 'Deneyin:' : 'Try:'),
            SAMPLES.map((s, i) =>
              E('button', { key: i, className: 'chip', onClick: () => { setInput(s); setOutput(''); setPhase('idle'); } },
                s.length > 36 ? s.slice(0, 36) + '…' : s))),

          /* Bilgi notu */
          E('div', { style: { marginTop: 12, fontSize: 11.5, color: 'var(--ink-4)', display: 'flex', gap: 6, alignItems: 'center' } },
            E(Icon, { name: 'globe', size: 13 }),
            tr
              ? 'Gerçek çeviri — MyMemory (mymemory.translated.net) · API anahtarı gerekmez'
              : 'Live translation — MyMemory (mymemory.translated.net) · No API key needed'))));
  }

  /* ---------------- DICTIONARY — Free Dictionary API + TDK ---------------- */
  function ScreenDictionary() {
    const { lang } = useApp();
    const tr = lang === 'tr';

    const API_LANGS = [
      { code: 'en', label: 'English',   flag: 'EN' },
      { code: 'tr', label: 'Türkçe',    flag: 'TR' },
      { code: 'de', label: 'Deutsch',   flag: 'DE' },
      { code: 'fr', label: 'Français',  flag: 'FR' },
      { code: 'es', label: 'Español',   flag: 'ES' },
    ];

    const SRC_META = {
      en: { name: 'Free Dictionary API', short: 'FreeDic', org: 'dictionaryapi.dev' },
      tr: { name: 'TDK Güncel Türkçe Sözlük', short: 'TDK', org: 'sozluk.gov.tr' },
      de: { name: 'Free Dictionary API', short: 'FreeDic', org: 'dictionaryapi.dev' },
      fr: { name: 'Free Dictionary API', short: 'FreeDic', org: 'dictionaryapi.dev' },
      es: { name: 'Free Dictionary API', short: 'FreeDic', org: 'dictionaryapi.dev' },
    };

    const [dlang, setDlang]   = useState('en');
    const [q, setQ]           = useState('');
    const [phase, setPhase]   = useState('idle'); // idle | loading | done | notfound | error
    const [entry, setEntry]   = useState(null);
    const [recent, setRecent] = useState(() => { try { return JSON.parse(localStorage.getItem('aa_dict_recent') || '[]'); } catch { return []; } });

    async function lookupWord(word, langCode) {
      /* --- Türkçe: TDK API önce dene, yoksa FreeDic'e düş --- */
      if (langCode === 'tr') {
        try {
          const res = await fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length && !data.error) {
              const item = data[0];
              const defs = (item.anlamlarListe || []).map(a => a.anlam).filter(Boolean);
              if (defs.length) {
                const pos = item.anlamlarListe?.[0]?.ozelliklerListe?.[0]?.tam_adi || 'isim';
                const ex  = item.anlamlarListe?.[0]?.orneklerListe?.[0]?.ornek || '';
                const syn = (item.anlamlarListe || []).flatMap(a => (a.atasozu || []).map(x => x.madde)).slice(0, 6);
                return { word: item.madde, pos, phonetic: '', defs, syn, ant: [], ex, source: SRC_META.tr };
              }
            }
          }
        } catch (_) { /* CORS veya ağ hatası — FreeDic'e geç */ }
      }
      /* --- Free Dictionary API (en / de / fr / es + tr fallback) --- */
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${langCode}/${encodeURIComponent(word)}`);
      if (!res.ok) throw new Error('not_found');
      const data = await res.json();
      if (!data?.length) throw new Error('not_found');
      const item     = data[0];
      const meanings = item.meanings || [];
      const defs     = meanings.flatMap(m => m.definitions.slice(0, 3).map(d => d.definition)).slice(0, 6);
      const syn      = [...new Set(meanings.flatMap(m => [...(m.synonyms || []), ...m.definitions.flatMap(d => d.synonyms || [])]))].slice(0, 8);
      const ant      = [...new Set(meanings.flatMap(m => [...(m.antonyms || []), ...m.definitions.flatMap(d => d.antonyms || [])]))].slice(0, 6);
      const ex       = meanings[0]?.definitions[0]?.example || '';
      return {
        word:     item.word,
        pos:      meanings[0]?.partOfSpeech || '',
        phonetic: item.phonetic || item.phonetics?.find(p => p.text)?.text || '',
        defs, syn, ant, ex,
        source:   SRC_META[langCode] || SRC_META.en,
      };
    }

    const search = (word) => {
      const w = (word !== undefined ? word : q).trim();
      if (!w) return;
      setQ(w);
      setPhase('loading');
      setEntry(null);
      lookupWord(w, dlang)
        .then(e => {
          setEntry(e);
          setPhase('done');
          const next = [{ word: w, lang: dlang }, ...recent.filter(r => !(r.word === w && r.lang === dlang))].slice(0, 10);
          setRecent(next);
          localStorage.setItem('aa_dict_recent', JSON.stringify(next));
        })
        .catch(() => setPhase('notfound'));
    };

    const E   = React.createElement;
    const src = SRC_META[dlang];
    const recentForLang = recent.filter(r => r.lang === dlang).slice(0, 7);

    return E(React.Fragment, null,
      E(PageHead, { title: tr ? 'Sözlük' : 'Dictionary', sub: tr ? 'Çok dilli · gerçek zamanlı API · TDK + FreeDic' : 'Multilingual · live API · TDK + FreeDic' }),
      E('div', { className: 'content' },
        E('div', { className: 'content-pad' },

          /* Dil seçici */
          E('div', { className: 'flex gap-8 wrap', style: { marginBottom: 14, alignItems: 'center' } },
            API_LANGS.map(l => E('button', {
              key: l.code, className: 'chip',
              style: dlang === l.code ? { background: 'var(--accent-soft)', color: 'var(--accent-ink)', borderColor: 'transparent', fontWeight: 700 } : {},
              onClick: () => { setDlang(l.code); setEntry(null); setPhase('idle'); },
            }, E('span', { style: { fontWeight: 800, fontSize: 11, opacity: .8 } }, l.flag), ' ', l.label))),

          /* Arama kutusu */
          E('div', { className: 'card card-pad', style: { padding: 16, marginBottom: 16 } },
            E('div', { className: 'flex gap-8' },
              E('div', { className: 'search-box grow' },
                E(Icon, { name: 'book', size: 18 }),
                E('input', {
                  className: 'input', value: q,
                  placeholder: tr ? 'Kelime girin…' : 'Enter a word…',
                  onChange: e => setQ(e.target.value),
                  onKeyDown: e => { if (e.key === 'Enter') search(); },
                  style: { height: 44, fontSize: 15 },
                  autoFocus: true,
                })),
              E('button', {
                className: 'btn btn-primary', style: { height: 44, paddingInline: 20 },
                onClick: () => search(), disabled: phase === 'loading',
              },
                phase === 'loading'
                  ? E('div', { className: 'spinner', style: { borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.4)' } })
                  : E(Icon, { name: 'search', size: 16 }),
                phase === 'loading' ? (tr ? 'Aranıyor…' : 'Searching…') : (tr ? 'Ara' : 'Search'))),
            E('div', { style: { marginTop: 10, fontSize: 11.5, color: 'var(--ink-4)', display: 'flex', gap: 6, alignItems: 'center' } },
              E(Icon, { name: 'globe', size: 12 }),
              tr ? `Gerçek veri — ${src.name} (${src.org})` : `Live data — ${src.name} (${src.org})`)),

          /* Son aramalar */
          recentForLang.length > 0 && phase === 'idle' && E('div', { style: { marginBottom: 16 } },
            E('div', { className: 'nav-group-label', style: { padding: '0 2px 8px' } }, tr ? 'Son aramalar' : 'Recent'),
            E('div', { className: 'flex gap-6 wrap' },
              recentForLang.map((r, i) => E('button', { key: i, className: 'chip', onClick: () => search(r.word) }, r.word)))),

          /* Yükleniyor */
          phase === 'loading' && E('div', { className: 'card card-pad fade-in' },
            [70, 45, 88, 55, 30].map((w, i) => E('div', { key: i, className: 'skeleton', style: { height: 13, width: w + '%', marginBottom: 10 } }))),

          /* Bulunamadı */
          phase === 'notfound' && E('div', { className: 'card' },
            E(Empty, { ico: 'book', title: tr ? 'Kelime bulunamadı' : 'Word not found',
              sub: tr ? 'Farklı bir yazım deneyin' : 'Try a different spelling' })),

          /* Sonuç kartı */
          phase === 'done' && entry && E('div', { className: 'card card-pad fade-in', key: entry.word + dlang },
            E('div', { className: 'between', style: { marginBottom: 4, flexWrap: 'wrap', gap: 8 } },
              E('div', { className: 'flex gap-10', style: { alignItems: 'baseline', flexWrap: 'wrap', gap: 8 } },
                E('h2', { style: { fontSize: 30, letterSpacing: '-.02em' } }, entry.word),
                entry.phonetic && E('span', { style: { fontSize: 16, color: 'var(--ink-3)', fontStyle: 'italic' } }, entry.phonetic),
                entry.pos && E('span', { style: { fontStyle: 'italic', color: 'var(--ink-3)', fontSize: 15 } }, entry.pos)),
              E('span', { className: 'badge gray' }, E(Icon, { name: 'book', size: 12 }), entry.source.short)),
            E('div', { className: 'divider', style: { margin: '14px 0' } }),
            E('div', { className: 'field-label' }, tr ? 'Anlam' : 'Definition'),
            E('ol', { style: { margin: '0 0 18px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 9 } },
              entry.defs.map((d, i) => E('li', { key: i, style: { fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink)' } }, d))),
            entry.syn?.length > 0 && E('div', { style: { marginBottom: 14 } },
              E('div', { className: 'field-label', style: { color: 'var(--green)' } }, tr ? 'Eş anlamlılar' : 'Synonyms'),
              E('div', { className: 'flex gap-6 wrap' },
                entry.syn.map((s, i) => E('button', { key: i, className: 'chip',
                  style: { background: 'var(--green-soft)', borderColor: 'transparent', color: 'var(--green)' },
                  onClick: () => search(s) }, s)))),
            entry.ant?.length > 0 && E('div', { style: { marginBottom: 14 } },
              E('div', { className: 'field-label', style: { color: 'var(--red)' } }, tr ? 'Zıt anlamlılar' : 'Antonyms'),
              E('div', { className: 'flex gap-6 wrap' },
                entry.ant.map((s, i) => E('button', { key: i, className: 'chip',
                  style: { background: 'var(--red-soft)', borderColor: 'transparent', color: 'var(--red)' },
                  onClick: () => search(s) }, s)))),
            entry.ex && E('div', { style: { marginTop: 4, borderLeft: '3px solid var(--accent)', background: 'var(--accent-soft-2)', borderRadius: '0 8px 8px 0', padding: '10px 14px' } },
              E('div', { style: { fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 } }, tr ? 'Örnek' : 'Example'),
              E('div', { style: { fontSize: 14.5, fontStyle: 'italic', color: 'var(--ink-2)' } }, '"' + entry.ex + '"')),
            E('div', { style: { marginTop: 18, fontSize: 11.5, color: 'var(--ink-4)', display: 'flex', gap: 6, alignItems: 'center' } },
              E(Icon, { name: 'externalLink', size: 12 }),
              `${tr ? 'Kaynak' : 'Source'}: ${entry.source.name} · ${entry.source.org}`)),

          /* Boş durum */
          phase === 'idle' && !recentForLang.length && E('div', { className: 'card' },
            E(Empty, { ico: 'book', title: tr ? 'Kelime arayın' : 'Search for a word',
              sub: tr ? `${src.name} üzerinden canlı veri` : `Live data from ${src.name}` }))
        )));
  }

  window.ScreenTranslate = ScreenTranslate;
  window.ScreenDictionary = ScreenDictionary;
})();
