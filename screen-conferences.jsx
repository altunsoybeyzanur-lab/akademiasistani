/* ============================================================
   Screen: Conferences + deadline alarms
   ============================================================ */
(function () {
  const KIND_ICO = { abstract: 'edit', full: 'send', notify: 'inbox', camera: 'checkCircle' };

  function ScreenConferences() {
    const { t, lang, conferences, toggleTrack, toggleAlarm, addConference } = useApp();
    const [tab, setTab] = useState('tracked');
    const [expanded, setExpanded] = useState(conferences[0] ? conferences[0].id : null);
    const [adding, setAdding] = useState(false);

    // collect alarms across tracked + alarm-on conferences
    const alarms = [];
    conferences.filter(c => c.tracked && c.alarm).forEach(c =>
      c.deadlines.forEach(d => {
        const dd = daysTo(d.date);
        if (dd >= -2 && dd <= 60) alarms.push({ conf: c, ...d, dd });
      }));
    alarms.sort((a,b) => a.dd - b.dd);

    const shown = conferences.filter(c => tab === 'tracked' ? c.tracked : true);

    return React.createElement(React.Fragment, null,
      React.createElement(PageHead, { title: t('confTitle'), sub: t('confSub') },
        React.createElement(Seg, { value: tab, onChange: setTab, options: [
          { value: 'tracked', label: t('tracked'), ico: 'bell' }, { value: 'all', label: t('all'), ico: 'globe' },
        ]}),
        React.createElement('button', { className: 'btn btn-primary', onClick: () => setAdding(true) },
          React.createElement(Icon, { name: 'plus', size: 16 }), lang==='tr'?'Konferans ekle':'Add conference')),
      React.createElement('div', { className: 'content' },
        React.createElement('div', { className: 'content-pad' },

          // ---- alarms panel ----
          alarms.length ? React.createElement('div', { className: 'card', style: { marginBottom: 'var(--gap)', overflow: 'hidden' } },
            React.createElement('div', { className: 'flex gap-10', style: { alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--line)' } },
              React.createElement('div', { style: { width: 30, height: 30, borderRadius: 8, background: 'var(--amber-soft)', color: 'var(--amber)', display: 'grid', placeItems: 'center' } },
                React.createElement(Icon, { name: 'bellRing', size: 17 })),
              React.createElement('h3', { style: { fontSize: 15 } }, t('alarms')),
              React.createElement('span', { className: 'badge amber' }, alarms.filter(a=>a.dd>=0&&a.dd<=7).length + ' ' + (lang==='tr'?'acil':'urgent'))),
            React.createElement('div', null,
              alarms.slice(0,5).map((a,i) => {
                const m = deadlineMeta(a.date);
                return React.createElement('div', { key: i, className: 'flex gap-12', style: { padding: '11px 18px', borderBottom: i<Math.min(alarms.length,5)-1?'1px solid var(--line-2)':'none', alignItems: 'center' } },
                  React.createElement('div', { style: { width: 30, height: 30, borderRadius: 8, background: `var(--${m.cls==='gray'?'surface-3':m.cls}-soft, var(--surface-3))`, color: m.cls==='gray'?'var(--ink-3)':`var(--${m.cls})`, display: 'grid', placeItems: 'center', flex: '0 0 30px' } },
                    React.createElement(Icon, { name: KIND_ICO[a.kind] || 'clock', size: 15 })),
                  React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                    React.createElement('div', { style: { fontSize: 13.5, fontWeight: 600 }, className: 'truncate' },
                      React.createElement('span', { style: { color: 'var(--accent-ink)' } }, a.conf.acronym), ' · ', a.label),
                    React.createElement('div', { style: { fontSize: 12, color: 'var(--ink-3)', marginTop: 1 } }, fmtDate(a.date, lang))),
                  React.createElement('span', { className: 'badge '+m.cls, style: { whiteSpace: 'nowrap' } },
                    m.urgent ? React.createElement(Icon, { name: 'alert', size: 12 }) : null, relDays(a.date, t)));
              }))) : null,

          // ---- conference list ----
          React.createElement('div', { className: 'col gap-12' },
            shown.map(c => React.createElement(ConfCard, {
              key: c.id, c, t, lang, expanded: expanded === c.id,
              onToggle: () => setExpanded(expanded === c.id ? null : c.id),
              onTrack: () => toggleTrack(c.id), onAlarm: () => toggleAlarm(c.id),
            })),
            shown.length === 0 ? React.createElement(Empty, { ico: 'calendar', title: lang==='tr'?'Takip edilen konferans yok':'No tracked conferences', sub: lang==='tr'?'"Tümü" sekmesinden konferans ekleyin':'Add from the "All" tab' }) : null))),
      adding ? React.createElement(AddConferenceModal, { onClose: () => setAdding(false), onAdd: (c) => { addConference(c); setAdding(false); setTab('tracked'); toast(lang==='tr'?`${c.acronym} eklendi ve takibe alındı`:`${c.acronym} added & tracked`, 'check'); }, lang }) : null);
  }

  /* ---- Add conference by URL (emulated web scrape) ---- */
  const KNOWN = {
    acl: { acronym: 'ACL', name: 'Annual Meeting of the Association for Computational Linguistics', field: 'NLP', rank: 'A*', location: 'Toronto, Kanada', month: 7 },
    emnlp: { acronym: 'EMNLP', name: 'Empirical Methods in Natural Language Processing', field: 'NLP', rank: 'A*', location: 'Suzhou, Çin', month: 11 },
    naacl: { acronym: 'NAACL', name: 'North American Chapter of the ACL', field: 'NLP', rank: 'A', location: 'Albuquerque, ABD', month: 6 },
    neurips: { acronym: 'NeurIPS', name: 'Neural Information Processing Systems', field: 'Makine Öğrenmesi', rank: 'A*', location: 'San Diego, ABD', month: 12 },
    icml: { acronym: 'ICML', name: 'International Conference on Machine Learning', field: 'Makine Öğrenmesi', rank: 'A*', location: 'Seul, Güney Kore', month: 7 },
    iclr: { acronym: 'ICLR', name: 'International Conference on Learning Representations', field: 'Makine Öğrenmesi', rank: 'A*', location: 'Brisbane, Avustralya', month: 4 },
    cvpr: { acronym: 'CVPR', name: 'Computer Vision and Pattern Recognition', field: 'Bilgisayarlı Görü', rank: 'A*', location: 'Nashville, ABD', month: 6 },
    iccv: { acronym: 'ICCV', name: 'International Conference on Computer Vision', field: 'Bilgisayarlı Görü', rank: 'A*', location: 'Honolulu, ABD', month: 10 },
    chi: { acronym: 'CHI', name: 'Conference on Human Factors in Computing Systems', field: 'İnsan-Bilgisayar Etkileşimi', rank: 'A*', location: 'Yokohama, Japonya', month: 4 },
    aaai: { acronym: 'AAAI', name: 'AAAI Conference on Artificial Intelligence', field: 'Yapay Zeka', rank: 'A*', location: 'Singapur', month: 2 },
    kdd: { acronym: 'KDD', name: 'Knowledge Discovery and Data Mining', field: 'Veri Madenciliği', rank: 'A*', location: 'Toronto, Kanada', month: 8 },
    sigir: { acronym: 'SIGIR', name: 'Research and Development in Information Retrieval', field: 'Bilgi Erişimi', rank: 'A*', location: 'Padua, İtalya', month: 7 },
    www: { acronym: 'WWW', name: 'The Web Conference', field: 'Web', rank: 'A*', location: 'Sydney, Avustralya', month: 4 },
    interspeech: { acronym: 'INTERSPEECH', name: 'Conference of the International Speech Communication Association', field: 'Konuşma İşleme', rank: 'A', location: 'Rotterdam, Hollanda', month: 8 },
  };

  /* ---- URL'den kısaltma çıkar ---- */
  function extractAcronym(url) {
    const u = url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    const parts = u.split(/[./\-_]/);
    // Yıl olmayan, 2-12 karakter arasındaki ilk parçayı al
    for (const p of parts) {
      if (p && !/^\d+$/.test(p) && p.length >= 2 && p.length <= 12) {
        return p.toUpperCase();
      }
    }
    return parts[0].toUpperCase().slice(0, 8) || 'CONF';
  }

  /* ---- Tarih yardımcıları ---- */
  function buildEventDate(knownMonth, urlHint) {
    const today = new Date();
    // URL'de yıl var mı? (örn. 2026.emnlp.org, chi2027.acm.org)
    const yearMatch = urlHint.match(/\b(202\d)\b/);
    const targetYear = yearMatch ? parseInt(yearMatch[1]) : today.getFullYear();
    const month = knownMonth || ((urlHint.length * 7) % 12) + 1;
    let ev = new Date(targetYear, month - 1, 12);
    if (ev <= today) ev = new Date(targetYear + 1, month - 1, 12);
    return ev;
  }

  /* ---- DBLP'den gerçek venue bilgisi çek ---- */
  async function fetchConferenceInfo(rawUrl) {
    const acronym = extractAcronym(rawUrl);
    const known   = KNOWN[acronym.toLowerCase()];

    /* DBLP venue search */
    let venueName = null, venueType = 'Conference';
    try {
      const dblpRes = await fetch(
        `https://dblp.org/search/venue/api?q=${encodeURIComponent(acronym)}&format=json&h=5`
      );
      if (dblpRes.ok) {
        const dblpData = await dblpRes.json();
        const hits = dblpData?.result?.hits?.hit || [];
        // Tam eşleşen kısaltmayı bul; yoksa ilk hit'i al
        const hit = hits.find(h => (h.info?.acronym || '').toUpperCase() === acronym) || hits[0];
        if (hit?.info?.venue) {
          venueName  = hit.info.venue;
          venueType  = hit.info.type || 'Conference';
        }
      }
    } catch (_) { /* CORS veya ağ hatası — KNOWN verisiyle devam */ }

    const ev    = buildEventDate(known?.month, rawUrl);
    const iso   = d => d.toISOString().slice(0, 10);
    const minus = days => { const x = new Date(ev); x.setDate(x.getDate() - days); return iso(x); };

    return {
      acronym,
      name:      venueName || known?.name || `${acronym} Conference`,
      field:     known?.field    || 'Genel',
      rank:      known?.rank     || 'B',
      location:  known?.location || 'TBA',
      eventDate: iso(ev),
      submitted: false,
      url: rawUrl,
      deadlines: [
        { label: 'Özet kaydı',              date: minus(165), kind: 'abstract' },
        { label: 'Tam metin son gönderim',   date: minus(158), kind: 'full'     },
        { label: 'Bildirim',                 date: minus(75),  kind: 'notify'   },
        { label: 'Kamera hazır',             date: minus(40),  kind: 'camera'   },
      ],
    };
  }

  /* ---- WikiCFP XML API → CORS proxy → parse ---- */
  async function searchWikiCFP(query, tr) {
    const wikicfpUrl = `http://www.wikicfp.com/cfp/servlet/tool.search?q=${encodeURIComponent(query)}&year=f`;
    const proxyUrl   = `https://api.allorigins.win/raw?url=${encodeURIComponent(wikicfpUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error('fetch_failed');
    const xml = await res.text();

    const parser = new DOMParser();
    const doc    = parser.parseFromString(xml, 'text/xml');
    const cfps   = [...doc.querySelectorAll('cfp')];

    const parseDate = str => {
      if (!str || /^(N\/A|TBD|n\/a)$/i.test(str.trim())) return null;
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
    };

    return cfps.map(cfp => {
      const get  = tag => cfp.querySelector(tag)?.textContent?.trim() || '';
      const acRaw = get('acronym');
      const acronym = acRaw.replace(/\s*\d{4}.*$/, '').trim() || 'CONF';

      const submission   = parseDate(get('submissionDeadline'));
      const notification = parseDate(get('notificationDueDate'));
      const camera       = parseDate(get('finalVersionDueDate'));
      const eventStart   = parseDate(get('start'));

      const deadlines = [];
      if (submission)   deadlines.push({ label: tr ? 'Son gönderim'  : 'Submission',   date: submission,   kind: 'full'     });
      if (notification) deadlines.push({ label: tr ? 'Bildirim'      : 'Notification', date: notification, kind: 'notify'   });
      if (camera)       deadlines.push({ label: tr ? 'Kamera hazır'  : 'Camera ready', date: camera,       kind: 'camera'   });

      return {
        acronym,
        name:      get('conference') || acronym,
        field:     'Akademik',
        rank:      'B',
        location:  get('location') || 'TBA',
        eventDate: eventStart || new Date(Date.now() + 86400000 * 200).toISOString().slice(0, 10),
        submitted: false,
        url:       get('url'),
        deadlines,
        source:    'wikicfp',
      };
    }).filter(c => c.name && c.acronym !== 'CONF');
  }

  /* ---- Kongre Uzmanı HTML scraping ---- */
  const KU_CATS = {
    'tıp': 'tip', 'sağlık': 'saglik', 'bilişim': 'bilisim-teknoloji', 'teknoloji': 'bilisim-teknoloji',
    'eğitim': 'egitim', 'mühendislik': 'muhendislik', 'sosyal': 'sosyal-bilimler',
    'psikoloji': 'psikoloji-psikiyatri', 'eczacılık': 'eczacilik-ilac',
    'hemşirelik': 'hemsirelik-ebelik', 'diş': 'dis-hekimligi',
    'hukuk': 'hukuk', 'gıda': 'gida-beslenme', 'spor': 'spor', 'turizm': 'turizm',
    'fen': 'fen-bilimleri', 'kimya': 'fen-bilimleri', 'tarım': 'tarim-ziraat',
  };
  const TR_MON = { Ocak:0, Şubat:1, Mart:2, Nisan:3, Mayıs:4, Haziran:5, Temmuz:6, Ağustos:7, Eylül:8, Ekim:9, Kasım:10, Aralık:11 };
  function parseTRDate(str) {
    const m = str?.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (!m) return null;
    const mon = TR_MON[m[2]];
    if (mon === undefined) return null;
    const d = new Date(+m[3], mon, +m[1]);
    return isNaN(d) ? null : d.toISOString().slice(0, 10);
  }
  const KU_CAT_LABELS = [
    { slug: '',                     label: 'Tümü' },
    { slug: 'tip',                  label: 'Tıp' },
    { slug: 'bilisim-teknoloji',    label: 'Bilişim / Teknoloji' },
    { slug: 'muhendislik',          label: 'Mühendislik' },
    { slug: 'egitim',               label: 'Eğitim' },
    { slug: 'sosyal-bilimler',      label: 'Sosyal Bilimler' },
    { slug: 'psikoloji-psikiyatri', label: 'Psikoloji / Psikiyatri' },
    { slug: 'dis-hekimligi',        label: 'Diş Hekimliği' },
    { slug: 'eczacilik-ilac',       label: 'Eczacılık / İlaç' },
    { slug: 'hemsirelik-ebelik',    label: 'Hemşirelik / Ebelik' },
    { slug: 'hukuk',                label: 'Hukuk' },
    { slug: 'gida-beslenme',        label: 'Gıda / Beslenme' },
    { slug: 'spor',                 label: 'Spor' },
    { slug: 'turizm',               label: 'Turizm' },
  ];
  async function fetchKongreUzmani(catSlug) {
    const year = new Date().getFullYear();
    const targetUrl = catSlug
      ? `https://www.kongreuzmani.com/kategoriler/${year}-${catSlug}-kongreleri.php`
      : `https://www.kongreuzmani.com/${year}/`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error('fetch_failed');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const TR_MON_RX = 'Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık';
    const links = [...doc.querySelectorAll('a[href$=".html"]')].filter(a => {
      const h = a.getAttribute('href') || '';
      return /\/[\w-]+\.html$/.test(h) && !h.includes('uye-ol') && !h.includes('iletisim') && !h.includes('kullanim');
    });
    const seen = new Set();
    const entries = [];
    for (const link of links.slice(0, 25)) {
      const text = link.textContent.replace(/\s+/g, ' ').trim();
      const dateRx = new RegExp(`(\\d{1,2}\\s+(?:${TR_MON_RX}))`);
      const firstDate = text.search(dateRx);
      const rawName = (firstDate > 0 ? text.slice(0, firstDate) : text).replace(/^[\s\W]+/, '').trim();
      if (!rawName || rawName.length < 5 || seen.has(rawName)) continue;
      seen.add(rawName);
      const dateM = text.match(new RegExp(`(\\d{1,2}\\s+(?:${TR_MON_RX})(?:[\\s\\-]+\\d{0,2}\\s*(?:${TR_MON_RX})?)?\\s+\\d{4})`));
      const locM  = text.match(new RegExp(`\\d{4},\\s*([^,\\n]+?)(?:\\s*Kongre|$)`));
      const href  = link.getAttribute('href') || '';
      entries.push({
        acronym:   rawName.split(/[\s:,(]/)[0].replace(/[^A-Za-zÇĞİÖŞÜçğışöü0-9]/g, '').slice(0, 8).toUpperCase() || rawName.slice(0, 4).toUpperCase(),
        name:      rawName,
        field:     catSlug ? catSlug.replace(/-/g, ' ') : 'Akademik',
        rank:      'B',
        location:  locM ? locM[1].trim() : 'Türkiye',
        eventDate: parseTRDate(dateM ? dateM[1] : '') || new Date(Date.now() + 86400000 * 120).toISOString().slice(0, 10),
        submitted: false,
        url:       href.startsWith('http') ? href : `https://www.kongreuzmani.com${href}`,
        deadlines: [],
        source:    'kongreuzmani',
      });
    }
    return entries;
  }

  /* ---- Conference Alerts HTML scraping ---- */
  const CA_TOPICS = [
    'Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'NLP',
    'Data Mining', 'Robotics', 'Bioinformatics', 'Security',
    'Education', 'Medicine and Medical Science', 'Engineering',
    'Social Sciences', 'Economics', 'Psychology', 'Linguistics',
  ];
  async function fetchConferenceAlerts(topic) {
    const targetUrl = `https://conferencealerts.com/topic-listing?topic=${encodeURIComponent(topic)}`;
    const proxyUrl  = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error('fetch_failed');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = [...doc.querySelectorAll('a[href*="show-event"]')];
    const seen = new Set();
    const entries = [];
    for (const link of links.slice(0, 25)) {
      const name = link.textContent.trim().replace(/\s+/g, ' ');
      if (!name || name.length < 5 || seen.has(name)) continue;
      seen.add(name);
      const row = link.closest('tr, [class*="event"], li') || link.parentElement?.parentElement;
      const rowText = row?.textContent || '';
      const dateM = rowText.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})[\-–]?(?:\d{1,2})?,?\s*(\d{4})/);
      let eventDate = new Date(Date.now() + 86400000 * 120).toISOString().slice(0, 10);
      if (dateM) { const d = new Date(`${dateM[1]} ${dateM[2]} ${dateM[3]}`); if (!isNaN(d)) eventDate = d.toISOString().slice(0, 10); }
      const href = link.getAttribute('href') || '';
      entries.push({
        acronym:   name.split(/[\s:,(]/)[0].replace(/[^A-Z0-9]/gi, '').slice(0, 10).toUpperCase() || name.slice(0, 4).toUpperCase(),
        name,
        field:     topic,
        rank:      'B',
        location:  'TBA',
        eventDate,
        submitted: false,
        url:       href.startsWith('http') ? href : `https://conferencealerts.com${href}`,
        deadlines: [],
        source:    'conferencealerts',
      });
    }
    return entries;
  }

  function AddConferenceModal({ onClose, onAdd, lang }) {
    const tr = lang === 'tr';
    const [mode, setMode]       = useState('wikicfp'); // wikicfp | conferencealerts | kongreuzmani | url
    const [q, setQ]             = useState('');
    const [url, setUrl]         = useState('');
    const [kuCat, setKuCat]     = useState('');
    const [caTopic, setCaTopic] = useState('');
    const [phase, setPhase]     = useState('idle');
    const [results, setResults] = useState([]);
    const [data, setData]       = useState(null);

    const resetSearch = () => { setPhase('idle'); setResults([]); setData(null); };

    /* shared results renderer */
    const SRC_LABEL = { wikicfp: 'wikicfp.com', conferencealerts: 'conferencealerts.com', kongreuzmani: 'kongreuzmani.com' };

    const doWikiSearch = async (query) => {
      const qry = (query !== undefined ? query : q).trim();
      if (!qry) return;
      setQ(qry); setPhase('loading'); setResults([]); setData(null);
      try {
        const list = await searchWikiCFP(qry, tr);
        setResults(list); setPhase(list.length ? 'results' : 'empty');
      } catch (_) { setPhase('error'); }
    };

    const doCASearch = async (topic) => {
      const t2 = (topic !== undefined ? topic : caTopic).trim();
      if (!t2) return;
      setCaTopic(t2); setPhase('loading'); setResults([]); setData(null);
      try {
        const list = await fetchConferenceAlerts(t2);
        setResults(list); setPhase(list.length ? 'results' : 'empty');
      } catch (_) { setPhase('error'); }
    };

    const doKUFetch = async (slug) => {
      const s = slug !== undefined ? slug : kuCat;
      setKuCat(s); setPhase('loading'); setResults([]); setData(null);
      try {
        const list = await fetchKongreUzmani(s);
        setResults(list); setPhase(list.length ? 'results' : 'empty');
      } catch (_) { setPhase('error'); }
    };

    const doUrlFetch = async () => {
      const target = url.trim(); if (!target) return;
      setPhase('loading'); setData(null);
      try { setData(await fetchConferenceInfo(target)); setPhase('review'); }
      catch (_) { setPhase('error'); }
    };

    const E = React.createElement;

    return E(Overlay, { onClose },
      E('div', { className: 'modal', style: { width: 'min(680px,95vw)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' } },

        /* header */
        E('div', { className: 'modal-h' },
          E('div', { style: { flex: 1 } },
            E('h3', { style: { fontSize: 18 } }, tr ? 'Konferans ekle' : 'Add conference'),
            E('div', { className: 'page-sub', style: { marginTop: 3 } },
              tr ? '3 kaynaktan gerçek zamanlı konferans verisi' : 'Real-time data from 3 sources'),
            E('div', { style: { fontSize: 11, color: 'var(--ink-4)', marginTop: 2 } }, 'WikiCFP · Conference Alerts · Kongre Uzmanı')),
          E('button', { className: 'x-btn', onClick: onClose }, E(Icon, { name: 'x', size: 16 }))),


        /* mode tabs */
        E('div', { style: { padding: '0 22px', borderBottom: '1px solid var(--line)', overflowX: 'auto' } },
          E('div', { className: 'flex gap-6', style: { padding: '10px 0' } },
            [['wikicfp','WikiCFP'],['conferencealerts','Conf. Alerts'],['kongreuzmani','Kongre Uzmanı'],['url','URL']].map(([v,lbl]) =>
              E('button', { key: v, className: 'chip', onClick: () => { setMode(v); resetSearch(); },
                style: mode === v ? { background: 'var(--accent)', color: '#fff', borderColor: 'transparent', fontWeight: 700 } : {} }, lbl)))),


        /* body */
        E('div', { style: { padding: 22, overflowY: 'auto', flex: 1 } },

          /* ---- shared: loading / empty / error / results ---- */
          (['wikicfp','conferencealerts','kongreuzmani'].includes(mode)) && E('div', null,

            /* WikiCFP search bar */
            mode === 'wikicfp' && E('div', { className: 'flex gap-8' },
              E('div', { className: 'search-box grow' },
                E(Icon, { name: 'search', size: 16 }),
                E('input', { className: 'input', autoFocus: true,
                  placeholder: tr ? 'Anahtar kelime (ör. NLP, HCI)…' : 'Keyword (e.g. NLP, HCI)…',
                  value: q, onChange: e => setQ(e.target.value),
                  onKeyDown: e => e.key === 'Enter' && doWikiSearch() })),
              E('button', { className: 'btn btn-primary', disabled: phase === 'loading', onClick: () => doWikiSearch() },
                phase === 'loading' ? E('div', { className: 'spinner', style: { borderTopColor:'#fff', borderColor:'rgba(255,255,255,.4)' } }) : E(Icon, { name: 'search', size: 15 }),
                tr ? 'Ara' : 'Search')),

            /* Conference Alerts search bar */
            mode === 'conferencealerts' && E('div', null,
              E('div', { className: 'flex gap-8' },
                E('div', { className: 'search-box grow' },
                  E(Icon, { name: 'search', size: 16 }),
                  E('input', { className: 'input', autoFocus: true,
                    placeholder: tr ? 'Konu (ör. Artificial Intelligence, Education)…' : 'Topic (e.g. Artificial Intelligence, Education)…',
                    value: caTopic, onChange: e => setCaTopic(e.target.value),
                    onKeyDown: e => e.key === 'Enter' && doCASearch() })),
                E('button', { className: 'btn btn-primary', disabled: phase === 'loading', onClick: () => doCASearch() },
                  phase === 'loading' ? E('div', { className: 'spinner', style: { borderTopColor:'#fff', borderColor:'rgba(255,255,255,.4)' } }) : E(Icon, { name: 'search', size: 15 }),
                  tr ? 'Ara' : 'Search')),
              phase === 'idle' && E('div', { className: 'flex gap-6 wrap', style: { marginTop: 10 } },
                CA_TOPICS.slice(0, 8).map(t2 => E('button', { key: t2, className: 'chip', onClick: () => doCASearch(t2) }, t2)))),

            /* Kongre Uzmanı category picker */
            mode === 'kongreuzmani' && E('div', null,
              E('div', { className: 'flex gap-8' },
                E('select', { className: 'input', value: kuCat, onChange: e => setKuCat(e.target.value), style: { flex: 1 } },
                  KU_CAT_LABELS.map(c => E('option', { key: c.slug, value: c.slug }, c.label))),
                E('button', { className: 'btn btn-primary', disabled: phase === 'loading', onClick: () => doKUFetch() },
                  phase === 'loading' ? E('div', { className: 'spinner', style: { borderTopColor:'#fff', borderColor:'rgba(255,255,255,.4)' } }) : E(Icon, { name: 'download', size: 15 }),
                  tr ? 'Listele' : 'Fetch')),
              phase === 'idle' && E('div', { className: 'flex gap-6', style: { marginTop: 12, padding: 10, background: 'var(--surface-2)', borderRadius: 8 } },
                E(Icon, { name: 'globe', size: 13, style: { color: 'var(--accent)', flex: '0 0 13px' } }),
                E('span', { style: { fontSize: 12, color: 'var(--ink-3)' } }, 'kongreuzmani.com · Türkiye kongre ve sempozyum takvimi'))),

            /* Shared: loading */
            phase === 'loading' && E('div', { className: 'flex gap-12', style: { alignItems: 'center', marginTop: 20, color: 'var(--ink-3)' } },
              E('div', { className: 'spinner' }),
              E('span', { style: { fontSize: 13.5, fontWeight: 500 } }, tr ? 'Veri çekiliyor…' : 'Fetching data…')),

            /* Shared: empty */
            phase === 'empty' && E('div', { style: { marginTop: 16 } },
              E(Empty, { ico: 'calendar', title: tr ? 'Sonuç bulunamadı' : 'No results',
                sub: tr ? 'Farklı bir anahtar kelime veya kategori deneyin' : 'Try a different keyword or category' })),

            /* Shared: error */
            phase === 'error' && E('div', { style: { marginTop: 16 } },
              E(Empty, { ico: 'alert', title: tr ? 'Bağlantı hatası' : 'Connection error',
                sub: tr ? 'Kaynağa erişilemedi, tekrar deneyin' : 'Could not reach source, please retry' })),

            /* Shared: results list */
            phase === 'results' && E('div', { style: { marginTop: 16 } },
              E('div', { style: { fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 } },
                `${results.length} ${tr ? 'sonuç' : 'results'} · ${SRC_LABEL[mode] || mode}`),
              E('div', { className: 'col gap-8' },
                results.map((c, i) => {
                  const isSel = data?.name === c.name && data?.url === c.url;
                  const firstDl = c.deadlines[0];
                  return E('div', { key: i,
                    style: { border: `1.5px solid ${isSel ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', background: isSel ? 'var(--accent-soft)' : 'var(--surface)', transition: 'border-color .15s' },
                    onClick: () => setData(isSel ? null : c) },
                    E('div', { className: 'flex gap-10', style: { alignItems: 'flex-start' } },
                      E('div', { style: { width: 44, height: 44, borderRadius: 10, background: isSel ? 'var(--accent)' : 'var(--surface-3)', color: isSel ? '#fff' : 'var(--ink-3)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 11, flex: '0 0 44px', textAlign: 'center', letterSpacing: '-.02em' } }, c.acronym),
                      E('div', { style: { flex: 1, minWidth: 0 } },
                        E('div', { style: { fontWeight: 700, fontSize: 14, lineHeight: 1.3 }, className: 'truncate' }, c.name),
                        E('div', { className: 'flex gap-8 wrap', style: { marginTop: 5 } },
                          c.location && c.location !== 'TBA' && E('span', { style: { fontSize: 12, color: 'var(--ink-3)' } }, c.location),
                          c.eventDate && E('span', { style: { fontSize: 12, color: 'var(--ink-3)' } }, (c.location && c.location !== 'TBA' ? '· ' : '') + c.eventDate),
                          firstDl && E('span', { className: 'badge ' + deadlineMeta(firstDl.date).cls, style: { marginLeft: 2 } }, firstDl.label + ': ' + firstDl.date))),
                      isSel && E(Icon, { name: 'check', size: 18, style: { color: 'var(--accent)', flex: '0 0 18px', marginTop: 3 } })));
                })))),


          /* ---- URL mode ---- */
          mode === 'url' && E('div', null,
            E('label', { className: 'field-label' }, tr ? 'Konferans sitesi (URL)' : 'Conference site (URL)'),
            E('div', { className: 'flex gap-8' },
              E('div', { className: 'search-box grow' },
                E(Icon, { name: 'globe', size: 16 }),
                E('input', { className: 'input', placeholder: 'https://2026.emnlp.org', value: url, style: { paddingLeft: 36 },
                  autoFocus: true,
                  onChange: e => setUrl(e.target.value),
                  onKeyDown: e => e.key === 'Enter' && doUrlFetch() })),
              E('button', { className: 'btn btn-primary', disabled: phase === 'loading', onClick: doUrlFetch },
                phase === 'loading'
                  ? E('div', { className: 'spinner', style: { borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.4)' } })
                  : E(Icon, { name: 'download', size: 15 }),
                tr ? 'Bilgileri çek' : 'Fetch')),

            phase === 'loading' && E('div', { className: 'flex gap-12', style: { alignItems: 'center', marginTop: 20, color: 'var(--ink-3)' } },
              E('div', { className: 'spinner' }),
              E('span', { style: { fontSize: 13.5, fontWeight: 500 } }, tr ? 'DBLP\'den bilgiler çekiliyor…' : 'Fetching via DBLP…')),

            phase === 'error' && E('div', { style: { marginTop: 16 } },
              E(Empty, { ico: 'alert', title: tr ? 'Bilgi çekilemedi' : 'Could not fetch info',
                sub: tr ? 'URL\'yi kontrol edin veya WikiCFP\'den arayın' : 'Check the URL or use WikiCFP search' })),

            phase === 'review' && data && E('div', { className: 'fade-in', style: { marginTop: 20 } },
              E('div', { className: 'flex gap-8', style: { alignItems: 'center', marginBottom: 14 } },
                E('span', { className: 'badge green' }, E(Icon, { name: 'check', size: 12 }), tr ? 'Bilgiler çekildi' : 'Details fetched'),
                E('span', { className: 'muted', style: { fontSize: 12 } }, tr ? 'Gerekirse düzenleyin' : 'Edit if needed')),
              E('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
                [['acronym', tr ? 'Kısaltma' : 'Acronym'], ['rank', tr ? 'Seviye' : 'Rank'], ['name', tr ? 'Tam ad' : 'Full name', true], ['field', tr ? 'Alan' : 'Field'], ['location', tr ? 'Konum' : 'Location'], ['eventDate', tr ? 'Etkinlik tarihi' : 'Event date', false, 'date']].map(([k, lbl, full, type]) =>
                  E('div', { key: k, style: full ? { gridColumn: '1 / -1' } : null },
                    E('label', { className: 'field-label' }, lbl),
                    E('input', { className: 'input', type: type || 'text', value: data[k] || '', onChange: e => setData(d => ({ ...d, [k]: e.target.value })) }))),
                data.deadlines?.length > 0 && E('div', { style: { gridColumn: '1 / -1' } },
                  E('label', { className: 'field-label' }, tr ? 'Son tarihler' : 'Deadlines'),
                  E('div', { className: 'list', style: { boxShadow: 'none' } },
                    data.deadlines.map((d, i) =>
                      E('div', { key: i, className: 'flex between', style: { padding: '9px 12px', borderBottom: i < data.deadlines.length - 1 ? '1px solid var(--line-2)' : 'none', alignItems: 'center' } },
                        E('span', { style: { fontSize: 13, fontWeight: 500 } }, d.label),
                        E('span', { className: 'badge ' + deadlineMeta(d.date).cls }, fmtDate(d.date, lang))))))))),
        ),

        /* footer */
        E('div', { className: 'drawer-f', style: { justifyContent: 'flex-end' } },
          E('button', { className: 'btn btn-ghost', onClick: onClose }, tr ? 'İptal' : 'Cancel'),
          E('button', { className: 'btn btn-primary', disabled: !data, onClick: () => onAdd(data) },
            E(Icon, { name: 'plus', size: 16 }), tr ? 'Konferansı ekle' : 'Add conference'))));
  }

  function ConfCard({ c, t, lang, expanded, onToggle, onTrack, onAlarm }) {
    const nextDl = c.deadlines.find(d => daysTo(d.date) >= 0);
    const m = nextDl ? deadlineMeta(nextDl.date) : null;
    return React.createElement('div', { className: 'card', style: { overflow: 'hidden', borderColor: c.tracked ? 'var(--line)' : 'var(--line)' } },
      React.createElement('div', { className: 'flex gap-14', style: { padding: 18, alignItems: 'center', cursor: 'pointer' }, onClick: onToggle },
        React.createElement('div', { style: { width: 52, height: 52, borderRadius: 13, background: c.tracked?'var(--accent-soft)':'var(--surface-3)', color: c.tracked?'var(--accent)':'var(--ink-3)', display: 'grid', placeItems: 'center', flex: '0 0 52px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 } }, c.acronym),
        React.createElement('div', { style: { flex: 1, minWidth: 0 } },
          React.createElement('div', { className: 'flex gap-8', style: { alignItems: 'center', flexWrap: 'wrap' } },
            React.createElement('span', { style: { fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)' } }, c.acronym + ' ' + new Date(c.eventDate).getFullYear()),
            React.createElement(Badge, { kind: 'purple', ico: 'star' }, c.rank),
            c.submitted ? React.createElement(Badge, { kind: 'green', ico: 'check' }, t('submitted')) : null),
          React.createElement('div', { className: 'truncate', style: { fontSize: 13, color: 'var(--ink-3)', marginTop: 3 } }, c.name),
          React.createElement('div', { className: 'flex gap-12', style: { fontSize: 12.5, color: 'var(--ink-3)', marginTop: 5 } },
            React.createElement('span', null, c.field), React.createElement('span', null, '·'), React.createElement('span', null, c.location), React.createElement('span', null, '·'),
            React.createElement('span', null, `${t('event')}: ${fmtDate(c.eventDate, lang)}`))),
        nextDl ? React.createElement('div', { style: { textAlign: 'right' } },
          React.createElement('div', { style: { fontSize: 11, color: 'var(--ink-4)', fontWeight: 600 } }, lang==='tr'?'Sıradaki':'Next'),
          React.createElement('span', { className: 'badge '+m.cls, style: { marginTop: 4 } }, m.urgent?React.createElement(Icon,{name:'alert',size:12}):null, relDays(nextDl.date, t))) : null,
        React.createElement(Icon, { name: expanded?'chevronDown':'chevronRight', size: 18, style: { color: 'var(--ink-4)', flex: '0 0 18px' } })),

      expanded ? React.createElement('div', { style: { padding: '4px 18px 18px', borderTop: '1px solid var(--line-2)' }, className: 'fade-in' },
        React.createElement('div', { className: 'flex gap-8', style: { padding: '14px 0', borderBottom: '1px solid var(--line-2)', marginBottom: 16 } },
          React.createElement('button', { className: 'btn btn-sm ' + (c.tracked?'btn-soft':'btn-primary'), onClick: onTrack },
            React.createElement(Icon, { name: c.tracked?'check':'bell', size: 14 }), c.tracked?t('tracked'):t('track')),
          c.tracked ? React.createElement('button', { className: 'btn btn-sm ' + (c.alarm?'btn-outline':'btn-ghost'), onClick: onAlarm },
            React.createElement(Icon, { name: c.alarm?'bellRing':'bell', size: 14 }), c.alarm?t('alarmOn'):t('setAlarm')) : null,
          React.createElement('div', { style: { flex: 1 } }),
          React.createElement('button', { className: 'btn btn-sm btn-ghost', onClick: () => toast(lang==='tr'?'Word oluşturucuya gidiliyor':'Opening Word builder') },
            React.createElement(Icon, { name: 'word', size: 14 }), lang==='tr'?'Şablon':'Template')),
        React.createElement('div', { className: 'tl' },
          c.deadlines.map((d,i) => {
            const dm = deadlineMeta(d.date); const dd = daysTo(d.date);
            const dotCls = dd < 0 ? 'done' : dm.urgent ? 'warn' : (c.deadlines.findIndex(x=>daysTo(x.date)>=0)===i ? 'next' : '');
            return React.createElement('div', { key: i, className: 'tl-item' },
              React.createElement('div', { className: 'tl-dot '+dotCls }, dd<0?React.createElement(Icon,{name:'check',size:9,style:{color:'#fff',strokeWidth:3}}):null),
              React.createElement('div', { className: 'between' },
                React.createElement('div', null,
                  React.createElement('div', { style: { fontWeight: 600, fontSize: 13.5 } }, d.label),
                  React.createElement('div', { style: { fontSize: 12, color: 'var(--ink-3)', marginTop: 1 } }, fmtDate(d.date, lang))),
                React.createElement('span', { className: 'badge '+dm.cls }, relDays(d.date, t))));
          }))) : null);
  }
  window.ScreenConferences = ScreenConferences;
})();
