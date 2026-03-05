import { useState } from 'react'
import { X, Plus, Trash2, Download } from 'lucide-react'

function shadeColor(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (n >> 16) + pct))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + pct))
  const b = Math.max(0, Math.min(255, (n & 0xff) + pct))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

const DEFAULT_DEPOIMENTOS = [
  { nome: 'Maria Silva', texto: 'Serviço incrível! Superou todas as minhas expectativas.' },
  { nome: 'João Santos', texto: 'Profissional e dedicado. Recomendo muito!' },
  { nome: 'Ana Costa', texto: 'Resultado excelente, valeu cada centavo investido.' },
]

const DEFAULT_FAQS = [
  { pergunta: 'Como funciona o serviço?', resposta: 'Nosso processo é simples e transparente. Entre em contato e agende uma consulta gratuita.' },
  { pergunta: 'Qual o prazo de entrega?', resposta: 'O prazo médio é de 3 a 5 dias úteis após a confirmação do pedido.' },
  { pergunta: 'Vocês atendem em todo o Brasil?', resposta: 'Sim! Atendemos clientes em todo o território nacional de forma online.' },
]

const DEFAULT_SERVICOS = [
  { nome: 'Pacote Básico', preco: 'R$ 97', descricao: 'Ideal para quem está começando' },
  { nome: 'Pacote Pro', preco: 'R$ 197', descricao: 'Mais recursos e suporte prioritário' },
]

function buildHTML(f, depoimentos, faqs, servicos) {
  const cor = f.cor
  const corDark = shadeColor(cor, -40)
  const whatsappUrl = f.whatsapp
    ? `https://api.whatsapp.com/send/?phone=${f.whatsapp.replace(/\D/g, '')}&text=${encodeURIComponent('Olá! Vim pelo seu site e gostaria de mais informações.')}`
    : '#'

  const bgBio = f.bgBio
    ? `background: url('${f.bgBio}') center/cover no-repeat fixed; background-color: #0f0f1a;`
    : `background: linear-gradient(135deg, #0f0f1a 0%, ${corDark} 50%, #0f0f1a 100%);`

  const bgSite = f.bgSite
    ? `background: url('${f.bgSite}') center/cover no-repeat fixed; background-color: #0a0a14;`
    : `background: linear-gradient(135deg, #0a0a14 0%, ${corDark} 40%, #0a0a14 100%);`

  const avatarInitials = (f.nome || '?').slice(0, 2).toUpperCase()

  const avatarBio = f.logo
    ? `<img src="${f.logo}" alt="${f.nome}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid ${cor};box-shadow:0 0 30px ${cor}44;display:inline-block;">`
    : `<div style="width:110px;height:110px;border-radius:50%;background:${cor};display:inline-flex;align-items:center;justify-content:center;font-size:36px;font-weight:700;color:#fff;border:3px solid ${cor};box-shadow:0 0 30px ${cor}44;">${avatarInitials}</div>`

  const avatarHero = f.logo
    ? `<img src="${f.logo}" alt="${f.nome}" style="width:140px;height:140px;border-radius:50%;object-fit:cover;border:4px solid ${cor};box-shadow:0 0 40px ${cor}55;">`
    : `<div style="width:140px;height:140px;border-radius:50%;background:${cor};display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:700;color:#fff;">${avatarInitials}</div>`

  const mapSection = (f.lat && f.lng && f.lat.trim() && f.lng.trim()) ? `
    <div style="margin-top:24px;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);">
      <iframe src="https://maps.google.com/maps?q=${encodeURIComponent(f.lat + ',' + f.lng)}&z=15&output=embed" width="100%" height="200" frameborder="0" style="border:0;display:block;" allowfullscreen loading="lazy"></iframe>
      <div style="padding:10px 14px;font-size:12px;color:rgba(255,255,255,0.55);text-align:center;background:rgba(0,0,0,0.3);">${f.local}</div>
    </div>` : ''

  const servicosHTML = servicos.length > 0 ? `
    <section style="padding:0 20px 40px;max-width:800px;margin:0 auto;">
      <h2 style="text-align:center;color:#fff;font-size:22px;font-weight:700;margin-bottom:24px;">Nossos Serviços</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
        ${servicos.map(s => `
          <div class="gc" style="padding:28px 20px;text-align:center;">
            <div style="font-size:22px;font-weight:800;color:${cor};margin-bottom:6px;">${s.preco}</div>
            <div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;">${s.nome}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-bottom:18px;line-height:1.5;">${s.descricao}</div>
            ${f.whatsapp ? `<a href="${whatsappUrl}" target="_blank" style="display:inline-block;background:${cor};color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Contratar</a>` : ''}
          </div>`).join('')}
      </div>
    </section>` : ''

  const depoimentosHTML = depoimentos.length > 0 ? `
    <section style="padding:0 0 40px;overflow:hidden;">
      <h2 style="text-align:center;color:#fff;font-size:22px;font-weight:700;margin-bottom:24px;padding:0 20px;">O que dizem nossos clientes</h2>
      <div style="display:flex;gap:16px;overflow-x:auto;padding:4px 20px 20px;scrollbar-width:thin;scrollbar-color:${cor} transparent;">
        ${depoimentos.map(d => `
          <div class="gc" style="flex-shrink:0;width:270px;padding:24px;">
            <div style="font-size:32px;color:${cor};line-height:1;margin-bottom:10px;">"</div>
            <p style="font-size:14px;color:rgba(255,255,255,0.82);line-height:1.65;margin-bottom:16px;">${d.texto}</p>
            <div style="font-size:13px;font-weight:700;color:#fff;">— ${d.nome}</div>
          </div>`).join('')}
      </div>
    </section>` : ''

  const faqsHTML = faqs.length > 0 ? `
    <section style="padding:0 20px 40px;max-width:700px;margin:0 auto;">
      <h2 style="text-align:center;color:#fff;font-size:22px;font-weight:700;margin-bottom:24px;">Perguntas Frequentes</h2>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${faqs.map((faq) => `
          <div class="gc" style="overflow:hidden;">
            <button class="faq-q" onclick="toggleFaq(this)" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:none;border:none;color:#fff;font-size:15px;font-weight:600;cursor:pointer;text-align:left;gap:12px;font-family:'Inter',sans-serif;">
              <span>${faq.pergunta}</span>
              <span class="faq-arrow" style="color:${cor};font-size:18px;flex-shrink:0;display:inline-block;transition:transform 0.3s;">▾</span>
            </button>
            <div class="faq-ans" style="max-height:0;overflow:hidden;transition:max-height 0.35s ease,padding 0.3s;padding:0 20px;color:rgba(255,255,255,0.72);font-size:14px;line-height:1.65;">
              ${faq.resposta}
            </div>
          </div>`).join('')}
      </div>
    </section>` : ''

  const ctaSection = f.whatsapp ? `
    <section style="padding:0 20px 40px;max-width:700px;margin:0 auto;">
      <div class="gc" style="padding:36px 28px;text-align:center;border-color:${cor}55;">
        <div style="font-size:40px;margin-bottom:14px;">🔒</div>
        <h2 style="font-size:20px;font-weight:700;color:#fff;margin-bottom:10px;">Atendimento Garantido</h2>
        <p style="font-size:14px;color:rgba(255,255,255,0.68);margin-bottom:22px;line-height:1.65;">Fale direto conosco e tire todas as suas dúvidas sem compromisso.</p>
        <a href="${whatsappUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:${cor};color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 4px 20px ${cor}44;">💬 Falar no WhatsApp</a>
      </div>
    </section>` : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${f.nome}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',sans-serif;}
.gc{background:rgba(255,255,255,0.07);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12);border-radius:16px;}
.btn-glass{display:block;width:100%;padding:15px 20px;border-radius:14px;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.18);color:#fff;text-decoration:none;text-align:center;font-weight:600;font-size:15px;cursor:pointer;margin-bottom:12px;transition:all 0.2s;font-family:'Inter',sans-serif;}
.btn-glass:hover{background:rgba(255,255,255,0.18);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3);}
.faq-ans{max-height:0;overflow:hidden;transition:max-height 0.35s ease,padding 0.3s ease;}
.faq-ans.open{max-height:300px;padding:4px 20px 16px;}
.faq-q.active .faq-arrow{transform:rotate(180deg)!important;}
::-webkit-scrollbar{height:4px;width:4px;}
::-webkit-scrollbar-thumb{background:${cor};border-radius:4px;}
@media(max-width:600px){.hero-flex{flex-direction:column!important;text-align:center!important;align-items:center!important;}.result-grid{grid-template-columns:1fr 1fr!important;}}
</style>
</head>
<body>

<!-- PAGE BIO -->
<div id="page-bio" style="min-height:100vh;${bgBio}display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;">
  <div style="width:100%;max-width:460px;">
    <div style="text-align:center;margin-bottom:20px;">${avatarBio}</div>
    <div style="text-align:center;margin-bottom:16px;">
      <h1 style="font-size:24px;font-weight:800;color:#fff;margin-bottom:4px;">${f.nome}</h1>
      <div style="font-size:14px;color:rgba(255,255,255,0.55);">${f.username}</div>
    </div>
    ${f.bio ? `<p style="text-align:center;color:rgba(255,255,255,0.78);font-size:14px;line-height:1.65;margin-bottom:28px;white-space:pre-wrap;">${f.bio}</p>` : ''}
    <div>
      <button onclick="showPage('page-site')" class="btn-glass">🌐 Ver Site Completo</button>
      ${f.igUrl ? `<a href="${f.igUrl}" target="_blank" class="btn-glass">📷 ${f.username}</a>` : ''}
      ${f.whatsapp ? `<a href="${whatsappUrl}" target="_blank" class="btn-glass" style="background:rgba(37,211,102,0.18);border-color:rgba(37,211,102,0.35);">💬 WhatsApp</a>` : ''}
    </div>
    ${mapSection}
    <div style="text-align:center;font-size:11px;color:rgba(255,255,255,0.28);margin-top:28px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">${f.footer}</div>
  </div>
</div>

<!-- PAGE SITE -->
<div id="page-site" style="display:none;min-height:100vh;${bgSite}">
  <nav style="position:sticky;top:0;z-index:100;padding:14px 20px;background:rgba(0,0,0,0.45);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.1);">
    <button onclick="showPage('page-bio')" style="background:none;border:1px solid rgba(255,255,255,0.22);color:#fff;padding:8px 18px;border-radius:8px;cursor:pointer;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;">← Voltar</button>
  </nav>

  <section style="padding:60px 20px 40px;max-width:800px;margin:0 auto;">
    <div class="hero-flex" style="display:flex;align-items:center;gap:40px;flex-wrap:wrap;">
      <div style="flex-shrink:0;">${avatarHero}</div>
      <div style="flex:1;min-width:200px;">
        <h1 style="font-size:30px;font-weight:800;color:#fff;margin-bottom:10px;line-height:1.2;">${f.heroTitle}</h1>
        <p style="font-size:16px;color:rgba(255,255,255,0.68);margin-bottom:24px;line-height:1.55;">${f.heroSub}</p>
        ${f.whatsapp
          ? `<a href="${whatsappUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:${cor};color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 4px 20px ${cor}44;">💬 ${f.cta}</a>`
          : `<div style="display:inline-block;background:${cor};color:#fff;padding:14px 28px;border-radius:12px;font-weight:700;font-size:15px;">${f.cta}</div>`}
      </div>
    </div>
  </section>

  ${f.sobre ? `
  <section style="padding:0 20px 40px;max-width:800px;margin:0 auto;">
    <div class="gc" style="padding:32px;">
      <h2 style="font-size:20px;font-weight:700;color:#fff;margin-bottom:14px;">Sobre Nós</h2>
      <p style="font-size:15px;color:rgba(255,255,255,0.78);line-height:1.7;white-space:pre-wrap;">${f.sobre}</p>
    </div>
  </section>` : ''}

  <section style="padding:0 20px 40px;max-width:800px;margin:0 auto;">
    <div class="result-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;">
      ${[{num:f.r1Num,lbl:f.r1Lbl},{num:f.r2Num,lbl:f.r2Lbl},{num:f.r3Num,lbl:f.r3Lbl}].map(r => `
        <div class="gc" style="padding:24px 12px;text-align:center;">
          <div style="font-size:26px;font-weight:800;color:${cor};margin-bottom:6px;">${r.num}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.58);font-weight:500;line-height:1.4;">${r.lbl}</div>
        </div>`).join('')}
    </div>
  </section>

  ${servicosHTML}
  ${depoimentosHTML}
  ${ctaSection}
  ${faqsHTML}

  <footer style="text-align:center;padding:28px 20px;font-size:12px;color:rgba(255,255,255,0.28);border-top:1px solid rgba(255,255,255,0.07);">${f.footer}</footer>
</div>

<script>
function showPage(id){
  document.getElementById('page-bio').style.display='none';
  document.getElementById('page-site').style.display='none';
  document.getElementById(id).style.display='block';
  window.scrollTo(0,0);
}
function toggleFaq(btn){
  var ans=btn.nextElementSibling;
  var isOpen=btn.classList.contains('active');
  document.querySelectorAll('.faq-q').forEach(function(q){q.classList.remove('active');});
  document.querySelectorAll('.faq-ans').forEach(function(a){a.classList.remove('open');});
  if(!isOpen){btn.classList.add('active');ans.classList.add('open');}
}
</script>
</body>
</html>`
}

// ─── Shared input style ───────────────────────────────────────────────────────
const inp = {
  width: '100%',
  backgroundColor: '#0f0f13',
  border: '1px solid #2a2a3a',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#e2e8f0',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
}

const ta = { ...inp, resize: 'vertical', minHeight: '72px', lineHeight: '1.5' }

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: '700', color: '#64748b',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: '14px', marginTop: '24px',
      paddingBottom: '8px', borderBottom: '1px solid #2a2a3a',
    }}>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '500' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Row2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>{children}</div>
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GerarSiteModal({ lead, onClose }) {
  if (!lead) return null

  const proxiedAvatar = lead.avatar
    ? `https://images.weserv.nl/?url=${encodeURIComponent(lead.avatar)}&w=150`
    : ''
  const nomeInicial = lead.fullName || lead.username || ''
  const primeiraLinha = (lead.bio || '').split('\n')[0] || ''

  const [form, setForm] = useState({
    logo: proxiedAvatar,
    bgBio: '',
    bgSite: '',
    cor: '#a855f7',
    nome: nomeInicial,
    username: `@${lead.username || ''}`,
    igUrl: lead.profileLink || `https://instagram.com/${lead.username}`,
    whatsapp: lead.phone || '',
    bio: lead.bio || '',
    heroTitle: nomeInicial,
    heroSub: primeiraLinha,
    sobre: lead.bio || '',
    r1Num: '500+', r1Lbl: 'Clientes Atendidos',
    r2Num: '10+',  r2Lbl: 'Anos de Experiência',
    r3Num: '99%',  r3Lbl: 'Satisfação',
    cta: 'Agendar Consulta',
    lat: '-23.5505',
    lng: '-46.6333',
    local: nomeInicial,
    footer: `© 2025 ${nomeInicial} — Feito por @mateusmachadoprod`,
  })

  const [depoimentos, setDepoimentos] = useState(DEFAULT_DEPOIMENTOS)
  const [faqs, setFaqs] = useState(DEFAULT_FAQS)
  const [servicos, setServicos] = useState(DEFAULT_SERVICOS)

  function setF(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function gerarSite() {
    const html = buildHTML(form, depoimentos, faqs, servicos)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bio-${lead.username}.html`
    a.click()
    URL.revokeObjectURL(url)
    onClose()
  }

  // ─── Depoimentos helpers
  function setDep(i, key, val) {
    setDepoimentos(prev => prev.map((d, idx) => idx === i ? { ...d, [key]: val } : d))
  }
  function removeDep(i) { setDepoimentos(prev => prev.filter((_, idx) => idx !== i)) }
  function addDep() { setDepoimentos(prev => [...prev, { nome: '', texto: '' }]) }

  // ─── FAQs helpers
  function setFaq(i, key, val) {
    setFaqs(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: val } : f))
  }
  function removeFaq(i) { setFaqs(prev => prev.filter((_, idx) => idx !== i)) }
  function addFaq() { setFaqs(prev => [...prev, { pergunta: '', resposta: '' }]) }

  // ─── Serviços helpers
  function setSvc(i, key, val) {
    setServicos(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s))
  }
  function removeSvc(i) { setServicos(prev => prev.filter((_, idx) => idx !== i)) }
  function addSvc() { setServicos(prev => [...prev, { nome: '', preco: '', descricao: '' }]) }

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  }

  const boxStyle = {
    backgroundColor: '#16161d',
    border: '1px solid #2a2a3a',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const listRowStyle = {
    display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start',
  }

  const removeBtn = (onClick) => (
    <button onClick={onClick} style={{
      background: 'none', border: '1px solid #2a2a3a', borderRadius: '6px',
      color: '#64748b', cursor: 'pointer', padding: '6px 8px', flexShrink: 0,
      marginTop: '2px',
    }}>
      <Trash2 size={13} />
    </button>
  )

  const addBtn = (onClick, label) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '7px 14px', borderRadius: '8px',
      border: '1px dashed #2a2a3a', background: 'none',
      color: '#64748b', fontSize: '12px', cursor: 'pointer',
      marginTop: '4px',
    }}>
      <Plus size={13} /> {label}
    </button>
  )

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={boxStyle}>

        {/* Header */}
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid #2a2a3a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0' }}>Gerar Site</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>@{lead.username}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '4px 22px 22px' }}>

          {/* Identidade Visual */}
          <SectionLabel>Identidade Visual</SectionLabel>
          <Field label="URL da Foto / Logo">
            <input style={inp} value={form.logo} onChange={setF('logo')} placeholder="https://..." />
          </Field>
          <Row2>
            <Field label="Imagem de Fundo (Bio)">
              <input style={inp} value={form.bgBio} onChange={setF('bgBio')} placeholder="URL da imagem..." />
            </Field>
            <Field label="Imagem de Fundo (Site)">
              <input style={inp} value={form.bgSite} onChange={setF('bgSite')} placeholder="URL da imagem..." />
            </Field>
          </Row2>
          <Field label="Cor Primária">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="color" value={form.cor} onChange={setF('cor')}
                style={{ width: '44px', height: '34px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent' }} />
              <input style={{ ...inp, flex: 1 }} value={form.cor} onChange={setF('cor')} placeholder="#a855f7" />
            </div>
          </Field>

          {/* Perfil */}
          <SectionLabel>Perfil</SectionLabel>
          <Row2>
            <Field label="Nome / Tagline">
              <input style={inp} value={form.nome} onChange={setF('nome')} />
            </Field>
            <Field label="Username">
              <input style={inp} value={form.username} onChange={setF('username')} />
            </Field>
          </Row2>
          <Row2>
            <Field label="URL do Instagram">
              <input style={inp} value={form.igUrl} onChange={setF('igUrl')} />
            </Field>
            <Field label="Número WhatsApp (só dígitos)">
              <input style={inp} value={form.whatsapp} onChange={setF('whatsapp')} placeholder="5511999999999" />
            </Field>
          </Row2>
          <Field label="Bio">
            <textarea style={ta} value={form.bio} onChange={setF('bio')} />
          </Field>

          {/* Site Institucional */}
          <SectionLabel>Site Institucional</SectionLabel>
          <Row2>
            <Field label="Título Hero">
              <input style={inp} value={form.heroTitle} onChange={setF('heroTitle')} />
            </Field>
            <Field label="Subtítulo Hero">
              <input style={inp} value={form.heroSub} onChange={setF('heroSub')} />
            </Field>
          </Row2>
          <Field label="Texto Sobre Nós">
            <textarea style={ta} value={form.sobre} onChange={setF('sobre')} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { numKey: 'r1Num', lblKey: 'r1Lbl' },
              { numKey: 'r2Num', lblKey: 'r2Lbl' },
              { numKey: 'r3Num', lblKey: 'r3Lbl' },
            ].map(({ numKey, lblKey }, i) => (
              <div key={i}>
                <Field label={`Resultado ${i + 1} — Número`}>
                  <input style={inp} value={form[numKey]} onChange={setF(numKey)} />
                </Field>
                <Field label="Label">
                  <input style={inp} value={form[lblKey]} onChange={setF(lblKey)} />
                </Field>
              </div>
            ))}
          </div>
          <Field label="Texto do Botão CTA">
            <input style={inp} value={form.cta} onChange={setF('cta')} />
          </Field>

          {/* Localização */}
          <SectionLabel>Localização</SectionLabel>
          <Row2>
            <Field label="Latitude">
              <input style={inp} value={form.lat} onChange={setF('lat')} placeholder="-23.5505" />
            </Field>
            <Field label="Longitude">
              <input style={inp} value={form.lng} onChange={setF('lng')} placeholder="-46.6333" />
            </Field>
          </Row2>
          <Field label="Nome do Local">
            <input style={inp} value={form.local} onChange={setF('local')} />
          </Field>
          <Field label="Texto do Rodapé">
            <input style={inp} value={form.footer} onChange={setF('footer')} />
          </Field>

          {/* Depoimentos */}
          <SectionLabel>Depoimentos</SectionLabel>
          {depoimentos.map((d, i) => (
            <div key={i} style={listRowStyle}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px' }}>
                <input style={inp} value={d.nome} onChange={e => setDep(i, 'nome', e.target.value)} placeholder="Nome" />
                <input style={inp} value={d.texto} onChange={e => setDep(i, 'texto', e.target.value)} placeholder="Texto do depoimento" />
              </div>
              {removeBtn(() => removeDep(i))}
            </div>
          ))}
          {addBtn(addDep, 'Adicionar depoimento')}

          {/* FAQs */}
          <SectionLabel>Perguntas Frequentes</SectionLabel>
          {faqs.map((faq, i) => (
            <div key={i} style={listRowStyle}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input style={inp} value={faq.pergunta} onChange={e => setFaq(i, 'pergunta', e.target.value)} placeholder="Pergunta" />
                <textarea style={{ ...ta, minHeight: '52px' }} value={faq.resposta} onChange={e => setFaq(i, 'resposta', e.target.value)} placeholder="Resposta" />
              </div>
              {removeBtn(() => removeFaq(i))}
            </div>
          ))}
          {addBtn(addFaq, 'Adicionar pergunta')}

          {/* Serviços */}
          <SectionLabel>Serviços</SectionLabel>
          {servicos.map((s, i) => (
            <div key={i} style={listRowStyle}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 90px 1fr', gap: '8px' }}>
                <input style={inp} value={s.nome} onChange={e => setSvc(i, 'nome', e.target.value)} placeholder="Nome" />
                <input style={inp} value={s.preco} onChange={e => setSvc(i, 'preco', e.target.value)} placeholder="Preço" />
                <input style={inp} value={s.descricao} onChange={e => setSvc(i, 'descricao', e.target.value)} placeholder="Descrição" />
              </div>
              {removeBtn(() => removeSvc(i))}
            </div>
          ))}
          {addBtn(addSvc, 'Adicionar serviço')}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 22px', borderTop: '1px solid #2a2a3a',
          display: 'flex', gap: '10px', justifyContent: 'flex-end',
          flexShrink: 0,
        }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: '8px',
            border: '1px solid #2a2a3a', background: 'none',
            color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={gerarSite} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 22px', borderRadius: '8px', border: 'none',
            backgroundColor: '#a855f7', color: '#fff',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
          }}>
            <Download size={14} /> Gerar Site HTML
          </button>
        </div>
      </div>
    </div>
  )
}
