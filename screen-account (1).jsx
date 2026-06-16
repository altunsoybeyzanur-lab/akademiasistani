/* ============================================================
   Screens: Account / membership + Auth (login) gate
   ============================================================ */
(function () {
  function planById(id) { return (window.DB.plans || []).find(p => p.id === id) || window.DB.plans[0]; }

  /* ---------------- ACCOUNT ---------------- */
  function ScreenAccount() {
    const { lang, user, setUser, setAuthed, setRoute, theme, setTheme, font, setFont, density, setDensity } = useApp();
    const tr = lang === 'tr';
    const [tab, setTab] = useState('account');
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState(user);
    useEffect(() => setForm(user), [user]);
    const plan = planById(user.plan);
    const save = () => { setUser(u => ({ ...u, ...form, initials: (form.name || 'A').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() })); setEdit(false); toast(tr ? 'Profil güncellendi' : 'Profile updated', 'check'); };

    const usage = [
      { label: 'PDF', val: 38, max: plan.id === 'free' ? 50 : 9999, unit: '' },
      { label: tr ? 'Koleksiyon' : 'Collections', val: 3, max: plan.id === 'free' ? 5 : 9999 },
      { label: tr ? 'Ortak çalışan' : 'Collaborators', val: 4, max: plan.id === 'free' ? 2 : plan.id === 'pro' ? 10 : 9999 },
      { label: tr ? 'Bu ay çeviri' : 'Translations', val: 126, max: plan.id === 'free' ? 200 : 9999 },
    ];
    const invoices = [
      { date: '2026-05-01', amt: plan.id === 'free' ? 0 : plan.price, no: 'AKD-2026-0512' },
      { date: '2026-04-01', amt: plan.id === 'free' ? 0 : plan.price, no: 'AKD-2026-0418' },
      { date: '2026-03-01', amt: plan.id === 'free' ? 0 : plan.price, no: 'AKD-2026-0331' },
    ];

    const card = (title, ico, children, action) => React.createElement('div', { className: 'card', style: { overflow: 'hidden' } },
      React.createElement('div', { className: 'between', style: { padding: '14px 18px', borderBottom: '1px solid var(--line)' } },
        React.createElement('div', { className: 'flex gap-8', style: { alignItems: 'center' } },
          React.createElement('div', { style: { width: 28, height: 28, borderRadius: 7, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' } }, React.createElement(Icon, { name: ico, size: 15 })),
          React.createElement('h3', { style: { fontSize: 15 } }, title)),
        action),
      React.createElement('div', { style: { padding: 18 } }, children));

    return React.createElement(React.Fragment, null,
      React.createElement(PageHead, { title: tr ? 'Hesabım' : 'My account', sub: tr ? 'Üyelik, profil ve tema' : 'Account, profile & theme' }),
      React.createElement('div', { className: 'acct-tab-bar' },
        React.createElement('button', { className: `acct-tab ${tab === 'account' ? 'on' : ''}`, onClick: () => setTab('account') },
          React.createElement(Icon, { name: 'users', size: 15 }), tr ? 'Hesap' : 'Account'),
        React.createElement('button', { className: `acct-tab ${tab === 'tema' ? 'on' : ''}`, onClick: () => setTab('tema') },
          React.createElement(Icon, { name: 'sparkles', size: 15 }), tr ? 'Tema' : 'Theme')),
      tab === 'account' ? React.createElement('div', { className: 'content' },
        React.createElement('div', { className: 'content-pad', style: { maxWidth: 900, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap)' } },

          // profile
          React.createElement('div', { style: { gridColumn: '1 / -1' } },
            card(tr ? 'Profil' : 'Profile', 'users',
              edit
                ? React.createElement('div', { className: 'col gap-12' },
                    [['name', tr ? 'Ad Soyad' : 'Full name'], ['email', 'E-posta'], ['institution', tr ? 'Kurum' : 'Institution'], ['field', tr ? 'Alan' : 'Field']].map(([k, l]) =>
                      React.createElement('div', { key: k },
                        React.createElement('label', { className: 'field-label' }, l),
                        React.createElement('input', { className: 'input', value: form[k] || '', onChange: e => setForm(f => ({ ...f, [k]: e.target.value })) }))),
                    React.createElement('div', { className: 'flex gap-8' },
                      React.createElement('button', { className: 'btn btn-primary', onClick: save }, React.createElement(Icon, { name: 'check', size: 15 }), tr ? 'Kaydet' : 'Save'),
                      React.createElement('button', { className: 'btn btn-ghost', onClick: () => { setForm(user); setEdit(false); } }, tr ? 'İptal' : 'Cancel')))
                : React.createElement('div', { className: 'flex gap-16', style: { alignItems: 'center' } },
                    React.createElement('div', { style: { width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(145deg,var(--accent),var(--accent-press))', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 24, fontFamily: 'var(--font-display)', flex: '0 0 64px' } }, user.initials),
                    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                      React.createElement('div', { style: { fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)' } }, user.name),
                      React.createElement('div', { style: { fontSize: 13.5, color: 'var(--ink-3)', marginTop: 2 } }, user.email),
                      React.createElement('div', { className: 'flex gap-6', style: { marginTop: 8 } },
                        React.createElement('span', { className: 'badge accent' }, plan.name),
                        React.createElement('span', { className: 'badge gray' }, user.institution))),
                    React.createElement('div', { style: { width: 0 } })),
              edit ? null : React.createElement('button', { className: 'btn btn-outline btn-sm', onClick: () => setEdit(true) }, React.createElement(Icon, { name: 'edit', size: 14 }), tr ? 'Düzenle' : 'Edit'))),

          // membership
          card(tr ? 'Üyelik' : 'Membership', 'star',
            React.createElement('div', { className: 'col gap-14' },
              React.createElement('div', { className: 'flex', style: { alignItems: 'baseline', gap: 8 } },
                React.createElement('span', { style: { fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)' } }, plan.name),
                plan.price ? React.createElement('span', { className: 'muted', style: { fontSize: 13 } }, `${plan.price.toLocaleString('tr-TR')} TL/${tr ? 'ay' : 'mo'}`) : React.createElement('span', { className: 'badge green' }, tr ? 'Ücretsiz' : 'Free')),
              React.createElement('div', { className: 'flex gap-8 wrap' },
                React.createElement('span', { className: 'badge green' }, React.createElement(Icon, { name: 'checkCircle', size: 12 }), tr ? 'Aktif' : 'Active'),
                plan.trialDays ? React.createElement('span', { className: 'badge accent' }, `${tr ? 'Deneme bitişi' : 'Trial ends'}: 8 Haz 2026`) : null),
              React.createElement('div', { style: { fontSize: 13, color: 'var(--ink-3)' } }, `${tr ? 'Sonraki yenileme' : 'Next renewal'}: 1 Tem 2026`),
              React.createElement('div', { className: 'flex gap-8' },
                React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setRoute('plans') }, React.createElement(Icon, { name: 'star', size: 14 }), tr ? 'Planı değiştir' : 'Change plan'),
                React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => toast(tr ? 'İptal talebi alındı' : 'Cancellation requested') }, tr ? 'İptal et' : 'Cancel'))),
            null),

          // usage
          card(tr ? 'Kullanım' : 'Usage', 'grid',
            React.createElement('div', { className: 'col gap-12' },
              usage.map((u, i) => React.createElement('div', { key: i },
                React.createElement('div', { className: 'between', style: { fontSize: 13, marginBottom: 4 } },
                  React.createElement('span', { style: { fontWeight: 500 } }, u.label),
                  React.createElement('span', { className: 'muted tnum' }, u.max > 9000 ? `${u.val} · ${tr ? 'sınırsız' : 'unlimited'}` : `${u.val} / ${u.max}`)),
                React.createElement('div', { className: 'bar', style: { height: 7 } }, React.createElement('i', { style: { width: Math.min(100, u.max > 9000 ? 18 : u.val / u.max * 100) + '%', background: (u.max <= 9000 && u.val / u.max > 0.85) ? 'var(--amber)' : 'var(--accent)' } }))))),
            null),

          // billing
          card(tr ? 'Faturalandırma' : 'Billing', 'fileText',
            React.createElement('div', { className: 'col gap-12' },
              React.createElement('div', { className: 'flex gap-10', style: { alignItems: 'center', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--r)' } },
                React.createElement('div', { style: { width: 36, height: 24, borderRadius: 4, background: 'linear-gradient(135deg,#1a1f71,#2f7ae0)', flex: '0 0 36px' } }),
                React.createElement('div', { style: { flex: 1 } }, React.createElement('div', { style: { fontWeight: 600, fontSize: 13 } }, 'Visa •••• 4242'), React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink-3)' } }, tr ? 'Son kullanma 09/27' : 'Expires 09/27')),
                React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => toast(tr ? 'Kart güncelleme' : 'Update card') }, tr ? 'Değiştir' : 'Update')),
              React.createElement('div', { className: 'field-label', style: { marginBottom: 0 } }, tr ? 'Son faturalar' : 'Recent invoices'),
              invoices.map((iv, i) => React.createElement('div', { key: i, className: 'between', style: { fontSize: 13, padding: '7px 0', borderBottom: i < invoices.length - 1 ? '1px solid var(--line-2)' : 'none' } },
                React.createElement('span', { className: 'mono', style: { color: 'var(--ink-3)' } }, iv.no),
                React.createElement('div', { className: 'flex gap-10', style: { alignItems: 'center' } },
                  React.createElement('span', { className: 'tnum' }, `${iv.amt.toLocaleString('tr-TR')} TL`),
                  React.createElement('button', { className: 'btn btn-ghost btn-icon btn-sm', onClick: () => toast(tr ? 'Fatura indiriliyor' : 'Downloading invoice', 'download') }, React.createElement(Icon, { name: 'download', size: 14 })))))),
            null),

          // security
          React.createElement('div', { style: { gridColumn: '1 / -1' } },
            card(tr ? 'Güvenlik' : 'Security', 'lock',
              React.createElement('div', { className: 'col gap-10' },
                React.createElement('div', { className: 'between' },
                  React.createElement('div', null, React.createElement('div', { style: { fontWeight: 600, fontSize: 13.5 } }, tr ? 'Parola' : 'Password'), React.createElement('div', { style: { fontSize: 12, color: 'var(--ink-3)' } }, tr ? '3 ay önce değiştirildi' : 'Changed 3 months ago')),
                  React.createElement('button', { className: 'btn btn-outline btn-sm', onClick: () => toast(tr ? 'Parola sıfırlama e-postası gönderildi' : 'Reset email sent') }, tr ? 'Değiştir' : 'Change')),
                React.createElement('div', { className: 'divider', style: { margin: '4px 0' } }),
                React.createElement('div', { className: 'between' },
                  React.createElement('div', null, React.createElement('div', { style: { fontWeight: 600, fontSize: 13.5 } }, tr ? 'Bağlı hesaplar' : 'Connected accounts'), React.createElement('div', { style: { fontSize: 12, color: 'var(--ink-3)' } }, 'Google · ORCID')),
                  React.createElement('span', { className: 'badge green' }, React.createElement(Icon, { name: 'check', size: 11 }), tr ? 'Bağlı' : 'Linked')),
                React.createElement('div', { className: 'divider', style: { margin: '4px 0' } }),
                React.createElement('button', { className: 'btn btn-outline', style: { color: 'var(--red)', borderColor: 'color-mix(in srgb,var(--red) 30%,var(--line))', alignSelf: 'flex-start' }, onClick: async () => { if (window._supabase) await window._supabase.auth.signOut(); setAuthed(false); } },
                  React.createElement(Icon, { name: 'externalLink', size: 15 }), tr ? 'Çıkış yap' : 'Sign out'))),
            null)))
          : React.createElement(TemaTab, { theme, setTheme, font, setFont, density, setDensity, tr }));
  }

  /* ============================================================
     TEMA TAB
  ============================================================ */
  function TemaTab({ theme, setTheme, font, setFont, density, setDensity, tr }) {
    const THEMES = [
      { id: 'indigo',   name: tr ? 'İndigo'   : 'Indigo',   accent: '#5b54f0', bg: '#ecebfe', surface: '#fff' },
      { id: 'emerald',  name: tr ? 'Zümrüt'   : 'Emerald',  accent: '#0e9f6e', bg: '#def5ec', surface: '#fff' },
      { id: 'coral',    name: tr ? 'Mercan'   : 'Coral',    accent: '#f0603f', bg: '#fde8e2', surface: '#fff' },
      { id: 'ocean',    name: tr ? 'Okyanus'  : 'Ocean',    accent: '#0891b2', bg: '#ecfeff', surface: '#fff' },
      { id: 'rose',     name: tr ? 'Gül'      : 'Rose',     accent: '#e11d48', bg: '#ffe4e6', surface: '#fff' },
      { id: 'amber',    name: tr ? 'Kehribar' : 'Amber',    accent: '#d97706', bg: '#fef3c7', surface: '#fff' },
      { id: 'midnight', name: tr ? 'Gece'     : 'Midnight', accent: '#7d78ff', bg: '#232544', surface: '#171a22', dark: true },
    ];
    const FONTS = [
      { id: 'default',   name: 'Grotesk',   ff: "'Hanken Grotesk',sans-serif",   sample: tr ? 'Modern, temiz tipografi' : 'Modern, clean typography' },
      { id: 'rounded',   name: 'Rounded',   ff: "'Hanken Grotesk',sans-serif",   sample: tr ? 'Yumuşak, dostane hissiyat' : 'Soft, friendly feel' },
      { id: 'editorial', name: 'Editorial', ff: "'Newsreader',Georgia,serif",     sample: tr ? 'Klasik akademik stil' : 'Classic academic style' },
    ];
    const DENSITIES = [
      { id: 'comfortable', label: tr ? 'Ferah'   : 'Comfortable', desc: tr ? 'Daha fazla boşluk, rahat okuma' : 'More spacing, relaxed reading' },
      { id: 'compact',     label: tr ? 'Kompakt' : 'Compact',     desc: tr ? 'Daha yoğun, daha fazla içerik' : 'Denser, more content visible' },
    ];
    const E = React.createElement;
    const Section = ({ title, children }) =>
      E('div', { className: 'tema-section' },
        E('div', { className: 'tema-section-title' }, title), children);

    return E('div', { className: 'content' },
      E('div', { className: 'content-pad', style: { maxWidth: 840 } },
        E('div', { className: 'col gap-32' },

          E(Section, { title: tr ? 'Renk Teması' : 'Color Theme' },
            E('div', { className: 'tema-color-grid' },
              THEMES.map(t =>
                E('button', { key: t.id, className: 'tema-color-card' + (theme === t.id ? ' on' : ''),
                  onClick: () => { setTheme(t.id); toast((tr ? 'Tema: ' : 'Theme: ') + t.name, 'sparkles'); } },
                  E('div', { className: 'tema-color-preview',
                    style: { background: t.dark ? ('linear-gradient(160deg,' + t.surface + ' 0%,' + t.bg + ' 100%)') : ('linear-gradient(160deg,' + t.bg + ' 0%,#fff 100%)') } },
                    E('div', { className: 'tema-color-dots' },
                      [t.accent, t.dark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.1)', t.dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)'].map((c, i) =>
                        E('div', { key: i, style: { width: i === 0 ? 22 : 14, height: 6, borderRadius: 99, background: c } }))),
                    E('div', { className: 'tema-color-minicard',
                      style: { background: t.dark ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.78)' } },
                      E('div', { className: 'tema-color-bar-line', style: { background: t.accent } }),
                      E('div', { className: 'tema-color-bar-line2', style: { background: t.dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)' } }))),
                  E('div', { className: 'tema-color-label' },
                    E('div', { className: 'tema-color-name' },
                      E('div', { className: 'tema-color-dot', style: { background: t.accent } }), t.name),
                    theme === t.id ? E(Icon, { name: 'checkCircle', size: 15, style: { color: t.accent } }) : null))))),

          E(Section, { title: tr ? 'Yazı Tipi' : 'Typeface' },
            E('div', { className: 'col gap-10' },
              FONTS.map(f =>
                E('button', { key: f.id, className: 'tema-font-card' + (font === f.id ? ' on' : ''),
                  onClick: () => { setFont(f.id); toast((tr ? 'Yazı tipi: ' : 'Font: ') + f.name, 'checkCircle'); } },
                  E('div', { style: { flex: 1, minWidth: 0, textAlign: 'left' } },
                    E('div', { style: { fontFamily: f.ff, fontWeight: 700, fontSize: 17, marginBottom: 3, color: 'var(--ink)' } }, f.name),
                    E('div', { style: { fontFamily: f.ff, fontSize: 13, color: 'var(--ink-3)' } }, f.sample)),
                  E('div', { className: 'tema-font-check',
                    style: { background: font === f.id ? 'var(--accent)' : 'transparent', border: font === f.id ? 'none' : '2px solid var(--line)' } },
                    font === f.id ? E(Icon, { name: 'check', size: 13, style: { color: '#fff' } }) : null))))),

          E(Section, { title: tr ? 'Arayüz Yoğunluğu' : 'Interface Density' },
            E('div', { className: 'tema-density-grid' },
              DENSITIES.map(d =>
                E('button', { key: d.id, className: 'tema-density-card' + (density === d.id ? ' on' : ''),
                  onClick: () => { setDensity(d.id); toast((tr ? 'Yoğunluk: ' : 'Density: ') + d.label, 'checkCircle'); } },
                  E('div', { className: 'tema-density-preview' },
                    d.id === 'comfortable'
                      ? [1,2,3].map(i => E('div', { key: i, className: 'tema-density-row' + (i === 1 ? ' accent' : ''), style: { marginBottom: 5 } }))
                      : [1,2,3,4,5].map(i => E('div', { key: i, className: 'tema-density-row' + (i === 1 ? ' accent' : ''), style: { marginBottom: 2 } }))),
                  E('div', { className: 'tema-density-name' }, d.label),
                  E('div', { className: 'tema-density-desc' }, d.desc))))))
      ));
  }

  window.ScreenAccount = ScreenAccount;

  /* ---------------- AUTH GATE — Cinematic dark entrance ---------------- */
  /* ORCID OAuth — https://orcid.org/developer-tools adresinden client_id alın */
  const ORCID_CLIENT_ID    = 'APP-XXXXXXXXXXXXXXXX'; // kendi client_id'nizi buraya yazın
  const ORCID_REDIRECT_URI = window.location.origin + window.location.pathname;
  const ORCID_AUTH_URL     = `https://orcid.org/oauth/authorize?client_id=${ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(ORCID_REDIRECT_URI)}`;

  function AuthGate() {
    const { lang, setAuthed, setRoute, user, setUser } = useApp();
    const tr = lang === 'tr';
    const [mode, setMode] = useState('login');
    const [f, setF] = useState({ name: '', email: user.email || '', institution: '', password: '' });
    const [busy, setBusy] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const signup = mode === 'signup';
    const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email) && f.password.length >= 4 && (!signup || (f.name && f.institution));

    const submit = async () => {
      if (!valid) return;
      setBusy(true);
      try {
        if (signup) {
          const { data, error } = await window._supabase.auth.signUp({
            email: f.email,
            password: f.password,
            options: { data: { name: f.name, institution: f.institution } },
          });
          if (error) throw error;
          if (data.user && !data.session) {
            setPendingEmail(f.email);
          } else if (data.session) {
            setUser(u => ({ ...u, name: f.name, email: f.email, institution: f.institution,
              initials: f.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(), plan: 'free' }));
            setAuthed(true); setRoute('welcome');
            toast(tr ? 'Hesap oluşturuldu — hoş geldiniz!' : 'Account created — welcome!', 'checkCircle');
          }
        } else {
          const { data, error } = await window._supabase.auth.signInWithPassword({
            email: f.email,
            password: f.password,
          });
          if (error) throw error;
          setUser(u => ({ ...u, email: data.user.email,
            name: data.user.user_metadata?.name || u.name,
            institution: data.user.user_metadata?.institution || u.institution,
          }));
          setAuthed(true); setRoute('welcome');
          toast(tr ? 'Giriş yapıldı' : 'Signed in', 'checkCircle');
        }
      } catch (err) {
        const msg = err.message || 'Hata';
        const friendly = msg.includes('Invalid login') ? (tr ? 'E-posta veya şifre hatalı.' : 'Incorrect email or password.')
          : msg.includes('already registered') ? (tr ? 'Bu e-posta zaten kayıtlı.' : 'Email already registered.')
          : msg.includes('confirm') ? (tr ? 'E-postanızı doğrulayın.' : 'Please confirm your email.')
          : msg;
        toast(friendly, 'alert');
      } finally {
        setBusy(false);
      }
    };
    const social = async (prov) => {
      setBusy(true);
      try {
        const provider = prov.toLowerCase();
        if (provider === 'google') {
          if (!window._supabase) throw new Error(tr ? 'Supabase yapılandırılmamış' : 'Supabase not configured');
          const { error } = await window._supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.href },
          });
          if (error) throw error;
        } else if (provider === 'orcid') {
          if (ORCID_CLIENT_ID.includes('XXXX')) {
            // Client ID henüz ayarlanmamış — ORCID sayfasını yeni sekmede aç
            window.open('https://orcid.org/signin', '_blank', 'noopener,noreferrer');
            toast(tr ? 'ORCID Client ID yapılandırılmamış — orcid.org açıldı' : 'ORCID Client ID not set — opened orcid.org', 'alert');
            setBusy(false);
          } else {
            window.location.href = ORCID_AUTH_URL;
          }
        }
      } catch (err) {
        toast(err.message || 'Hata', 'alert');
        setBusy(false);
      }
    };

    const headline = tr
      ? 'Araştırmanızın her adımı tek yerde.'
      : 'Every step of your research, in one place.';

    // E-posta onay bekleme ekranı
    if (pendingEmail) {
      return E('div', { className: 'auth-root' },
        E('div', { className: 'auth-orb auth-orb-1' }),
        E('div', { className: 'auth-orb auth-orb-2' }),
        E('div', { className: 'auth-grid' }),
        E('div', { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 1, position: 'relative' } },
          E('div', { className: 'auth-card', style: { textAlign: 'center', maxWidth: 420 } },
            E('div', { style: { width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(145deg,var(--accent),var(--accent-press))', display: 'grid', placeItems: 'center', margin: '0 auto 20px', boxShadow: '0 0 32px rgba(91,84,240,.5)' } },
              E(Icon, { name: 'mail', size: 28, style: { color: '#fff' } })),
            E('h2', { className: 'auth-card-title', style: { marginBottom: 10 } }, tr ? 'E-postaınızı doğrulayın' : 'Confirm your email'),
            E('p', { className: 'auth-card-sub', style: { marginBottom: 24, lineHeight: 1.7 } },
              tr ? `${pendingEmail} adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıklayınca otomatik giriş yapılır.`
                 : `We sent a confirmation link to ${pendingEmail}. Click it to sign in automatically.`),
            E('div', { style: { background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 } },
              tr ? '📧 Gelen kutunuzu kontrol edin. Spam/Junk klasörüne düşmüş olabilir.' : '📧 Check your inbox — it might be in spam/junk.'),
            E('button', { className: 'auth-btn', onClick: () => { setPendingEmail(''); setMode('login'); } },
              tr ? 'Giriş sayfasına dön' : 'Back to sign in'),
            E('div', { className: 'auth-switch', style: { marginTop: 16 } },
              tr ? 'Hesabınız var mı? ' : 'Already confirmed? ',
              E('span', { className: 'auth-switch-link', onClick: () => { setPendingEmail(''); setMode('login'); } },
                tr ? 'Giriş yapın' : 'Sign in')))));
    }
    const words = headline.split(' ');

    const features = tr
      ? ['DOI arama & akıllı indirme', 'Otomatik kaynakça oluşturma', 'Konferans & son tarih takibi', 'Gerçek zamanlı ortak çalışma', 'Veri analizi ve dilbilgisi araçları']
      : ['DOI search & smart download', 'Automatic citation builder', 'Conference & deadline tracker', 'Real-time collaboration', 'Data analysis & grammar tools'];

    const E = React.createElement;

    return E('div', { className: 'auth-root' },

      /* — animated background orbs — */
      E('div', { className: 'auth-orb auth-orb-1' }),
      E('div', { className: 'auth-orb auth-orb-2' }),
      E('div', { className: 'auth-orb auth-orb-3' }),
      E('div', { className: 'auth-grid' }),

      /* ——— LEFT PANEL ——— */
      E('div', { className: 'auth-left' },

        /* logo */
        E('div', { className: 'auth-logo' },
          E('div', { className: 'auth-logo-mark' }, E(Mascot, { size: 28 })),
          E('span', { className: 'auth-logo-name' }, 'Akademi')
        ),

        /* animated headline — each word flies in */
        E('h1', { className: 'auth-headline' },
          words.map((w, i) =>
            E('span', { key: i, className: 'auth-word', style: { animationDelay: `${180 + i * 75}ms` } },
              w + (i < words.length - 1 ? '\u00A0' : '')
            )
          )
        ),

        /* subtitle */
        E('p', { className: 'auth-sub', style: { animationDelay: `${180 + words.length * 75 + 80}ms` } },
          tr
            ? 'Araştırmacılar için tasarlanmış, yapay zeka destekli akademik asistan.'
            : 'AI-powered academic assistant designed for researchers.'
        ),

        /* feature list */
        E('div', { className: 'auth-features' },
          features.map((feat, i) =>
            E('div', { key: i, className: 'auth-feature', style: { animationDelay: `${620 + i * 75}ms` } },
              E('span', { className: 'auth-feature-dot' }),
              feat
            )
          )
        ),

        /* stats strip */
        E('div', { className: 'auth-stats', style: { animationDelay: '1050ms' } },
          [
            { val: '10K+', label: tr ? 'Araştırmacı'    : 'Researchers' },
            { val: '6',    label: tr ? 'Atıf formatı'   : 'Citation formats' },
            { val: 'KVKK', label: tr ? 'GDPR uyumlu'    : 'GDPR compliant' },
          ].map((s, i) =>
            E('div', { key: i, className: 'auth-stat' },
              E('div', { className: 'auth-stat-val' }, s.val),
              E('div', { className: 'auth-stat-label' }, s.label)
            )
          )
        )
      ),

      /* ——— RIGHT PANEL (form card) ——— */
      E('div', { className: 'auth-right' },
        E('div', { className: 'auth-card', style: { animationDelay: '100ms' } },

          /* card header */
          E('h2', { className: 'auth-card-title' },
            signup ? (tr ? 'Hesap oluştur' : 'Create account') : (tr ? 'Hoş geldiniz' : 'Welcome back')
          ),
          E('p', { className: 'auth-card-sub' },
            signup
              ? (tr ? 'Ücretsiz başlayın — kart gerekmez.' : 'Start free — no card needed.')
              : (tr ? 'Hesabınıza giriş yapın.' : 'Sign in to your account.')
          ),

          /* form fields */
          E('div', { className: 'auth-form' },

            signup ? E('div', { className: 'auth-field' },
              E('label', { className: 'auth-label' }, tr ? 'Ad Soyad' : 'Full name'),
              E('input', { className: 'auth-input', value: f.name, onChange: e => setF(s => ({ ...s, name: e.target.value })), placeholder: 'Dr. Elif Yılmaz' })
            ) : null,

            E('div', { className: 'auth-field' },
              E('label', { className: 'auth-label' }, 'E-posta'),
              E('input', { className: 'auth-input', type: 'email', value: f.email, onChange: e => setF(s => ({ ...s, email: e.target.value })), placeholder: 'ad@universite.edu.tr' })
            ),

            signup ? E('div', { className: 'auth-field' },
              E('label', { className: 'auth-label' }, tr ? 'Kurum' : 'Institution'),
              E('input', { className: 'auth-input', value: f.institution, onChange: e => setF(s => ({ ...s, institution: e.target.value })), placeholder: tr ? 'Üniversite adı' : 'University name' })
            ) : null,

            E('div', { className: 'auth-field' },
              E('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
                E('label', { className: 'auth-label', style: { marginBottom: 0 } }, tr ? 'Parola' : 'Password'),
                !signup ? E('span', { className: 'auth-forgot', onClick: () => toast(tr ? 'Sıfırlama e-postası gönderildi' : 'Reset email sent') }, tr ? 'Parolamı unuttum' : 'Forgot?') : null
              ),
              E('input', { className: 'auth-input', type: 'password', value: f.password, onChange: e => setF(s => ({ ...s, password: e.target.value })), placeholder: '••••••••', onKeyDown: e => { if (e.key === 'Enter') submit(); } })
            ),

            E('button', { className: `auth-btn${busy ? ' loading' : ''}`, disabled: !valid || busy, onClick: submit },
              busy ? E('div', { className: 'auth-spinner' }) : null,
              busy
                ? (tr ? 'Giriş yapılıyor…' : 'Signing in…')
                : (signup ? (tr ? 'Hesap oluştur' : 'Create account') : (tr ? 'Giriş yap' : 'Sign in'))
            )
          ),

          /* divider */
          E('div', { className: 'auth-divider' },
            E('span', { className: 'auth-div-line' }),
            E('span', { className: 'auth-div-text' }, tr ? 'veya' : 'or'),
            E('span', { className: 'auth-div-line' })
          ),

          /* social buttons */
          E('div', { className: 'auth-social' },
            E('button', { className: 'auth-social-btn', onClick: () => social('Google'), disabled: busy },
              E('svg', { width: 18, height: 18, viewBox: '0 0 48 48', style: { flexShrink: 0 } },
                E('path', { fill: '#EA4335', d: 'M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z' }),
                E('path', { fill: '#4285F4', d: 'M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z' }),
                E('path', { fill: '#FBBC05', d: 'M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z' }),
                E('path', { fill: '#34A853', d: 'M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z' })),
              tr ? 'Google ile Giriş' : 'Sign in with Google'
            ),
            E('button', { className: 'auth-social-btn', onClick: () => social('ORCID'), disabled: busy },
              E('svg', { width: 18, height: 18, viewBox: '0 0 24 24', style: { flexShrink: 0 } },
                E('path', { fill: '#A6CE39', d: 'M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z' }),
                E('path', { fill: '#fff', d: 'M7.5 4.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-.75 3.75h1.5v11.25h-1.5V8.25zm3.75 0h4.125C16.5 8.25 18 9.75 18 12.375S16.5 15.75 14.625 15.75H10.5V8.25zm1.5 1.5v4.5h2.625c1.125 0 2.25-.75 2.25-2.25s-.75-2.25-2.25-2.25H12z' })),
              tr ? 'ORCID ile Giriş' : 'Sign in with ORCID'
            )
          ),

          /* mode switch */
          E('div', { className: 'auth-switch' },
            signup ? (tr ? 'Zaten hesabınız var mı? ' : 'Have an account? ') : (tr ? 'Hesabınız yok mu? ' : 'No account? '),
            E('span', { className: 'auth-switch-link', onClick: () => setMode(signup ? 'login' : 'signup') },
              signup ? (tr ? 'Giriş yapın' : 'Sign in') : (tr ? 'Kayıt olun' : 'Sign up')
            )
          )
        )
      )
    );
  }
  window.AuthGate = AuthGate;
})();
