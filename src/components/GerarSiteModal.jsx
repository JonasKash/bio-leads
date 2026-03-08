import { useState } from 'react'
import { X, Plus, Trash2, Download, Copy, CheckCircle } from 'lucide-react'

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

function buildPrompt(f, depoimentos, faqs, servicos) {
  const deps = depoimentos.map(d => `${d.nome} ⭐⭐⭐⭐⭐\n"${d.texto}"`).join('\n')
  const fs = faqs.map(faq => `Q: ${faq.pergunta}\nR: ${faq.resposta}`).join('\n')
  const svcs = servicos.map(s => `- ${s.nome} (${s.preco}): ${s.descricao}`).join('\n')

  return `📋 TEMPLATE COMPLETO DO SITE - ESTRUTURA BIO LINK

🏠 PÁGINA 1: BIO LINK (Rota: /)

**Fundo:**
Vídeo/Imagem de fundo principal (${f.bgBio || 'Fundo Escuro'})
Overlay gradiente: preto/30% no topo → transparente no meio → cor primária escura embaixo (${f.cor})
Overlay escuro adicional: preto/10%

**1. FOTO DE PERFIL / LOGO (Topo central):**
Localização: ${f.logo || 'Sem Logo'}
Tamanho: 128x128px (w-32 h-32)
Centralizado horizontalmente
Padding: pt-8 (topo), pb-4 (baixo)
Animação: fade-in de cima para baixo com delay de 3s

**2. NOME / TAGLINE (Abaixo do logo):**
Nome: "${f.nome}"
Tagline: "${f.heroSub}"
Estilo: texto centralizado, cor branca/90% opacidade, text-lg, font-medium
Margem inferior: mb-8
Animação: fade-in de baixo para cima, delay 3.1s

**3. BOTÕES (Abaixo da tagline):**
Todos dentro de um container max-w-md mx-auto, espaçados com space-y-4

Botão 1 - "Site Completo" (link interno para /site)
Botão 2 - Instagram (@${f.username.replace('@', '')})
URL: ${f.igUrl}
Botão 3 - WhatsApp/Suporte
URL: https://api.whatsapp.com/send/?phone=${(f.whatsapp || '').replace(/\D/g, '')}

**4. LOCALIZAÇÃO / MAPA (Abaixo dos botões):**
Local: ${f.local}
Coordenadas: ${f.lat}, ${f.lng}
Google Maps embed
Altura: 180px, largura 100%
Estilo: rounded-2xl, efeito glass, grayscale que remove no hover

**5. RODAPÉ:**
Texto: "${f.footer}"
Fonte: text-xs, opacidade 50%, centralizado, py-8


📄 PÁGINA 2: SITE INSTITUCIONAL (Rota: /site)

**Fundo:**
Imagem fixa (parallax): ${f.bgSite || 'Fundo Padrão'}
Overlay gradiente: preto/50% → preto/40% → cor primária escura (${f.cor})
Animação de entrada: scale 1.1→1 com fade-in

**1. BOTÃO VOLTAR (Fixo topo esquerdo):**
Texto: "Voltar" com ícone ArrowLeft, link para /

**2. HERO SECTION (70vh mínimo):**
Logo: ${f.logo} (128x128px, centralizado)
Título H1: "${f.heroTitle}"
Subtítulo: "${f.heroSub}"

**3. SEÇÃO SOBRE NÓS:**
Container glass, max-width 2xl
Título H2: "Sobre Nós"
Texto:
"${f.sobre}"

**4. SEÇÃO NÚMEROS/RESULTADOS:**
Título H2: "Nossos Números"
"${f.r1Num}" — "${f.r1Lbl}"
"${f.r2Num}" — "${f.r2Lbl}"
"${f.r3Num}" — "${f.r3Lbl}"

**5. SEÇÃO MARKETPLACE (Serviços):**
Componente: MarketplaceSection
${svcs || 'Nenhum serviço cadastrado'}

**6. SEÇÃO DEPOIMENTOS:**
Título H2: "O Que Dizem Nossos Clientes"
Scroll horizontal com cards:
${deps || 'Nenhum depoimento'}

**7. SEÇÃO CTA (Call to Action):**
Texto/Botão Shimmer: "${f.cta}" com ícone WhatsApp
Link: https://api.whatsapp.com/send/?phone=${(f.whatsapp || '').replace(/\D/g, '')}

**8. SEÇÃO FAQ:**
Título H2: "Perguntas Frequentes"
${fs || 'Nenhuma FAQ cadastrada'}

**9. RODAPÉ:**
Mesmo componente Footer da página 1


🎨 DESIGN SYSTEM GERAL:
- Estilo visual: Glassmorphism (vidro fosco com blur)
- Animações: Framer Motion em todos os elementos (fade, slide, scale)
- Paleta: Tons escuros com cor de destaque: ${f.cor}
- Tipografia: Font-weight bold para títulos, medium para botões
- Responsivo: Mobile-first

Gere o código HTML + CSS/JS (React ou Vanilla, conforme sua preferência, mas focando nos estilos acima) utilizando estas especificações e garantindo as mesmas animações descritas.
`
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
    r2Num: '10+', r2Lbl: 'Anos de Experiência',
    r3Num: '99%', r3Lbl: 'Satisfação',
    cta: 'Agendar Consulta',
    lat: '-23.5505',
    lng: '-46.6333',
    local: nomeInicial,
    footer: `© 2025 ${nomeInicial} — Feito por @mateusmachadoprod`,
  })

  const [depoimentos, setDepoimentos] = useState(DEFAULT_DEPOIMENTOS)
  const [faqs, setFaqs] = useState(DEFAULT_FAQS)
  const [servicos, setServicos] = useState(DEFAULT_SERVICOS)

  const [promptGerado, setPromptGerado] = useState(null)
  const [copiado, setCopiado] = useState(false)

  function setF(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function gerarPrompt() {
    const p = buildPrompt(form, depoimentos, faqs, servicos)
    setPromptGerado(p)
    setCopiado(false)
  }

  function copiarPrompt() {
    navigator.clipboard.writeText(promptGerado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
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
          {promptGerado ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '12px', color: '#94a3b8', fontSize: '13px' }}>
                Copie o template estruturado abaixo e cole no seu criador de IA (ex: Claude, ChatGPT):
              </div>
              <textarea
                readOnly
                value={promptGerado}
                style={{ ...ta, flex: 1, minHeight: '300px', backgroundColor: '#0f0f13', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4' }}
              />
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 22px', borderTop: '1px solid #2a2a3a',
          display: 'flex', gap: '10px', justifyContent: 'flex-end',
          flexShrink: 0,
        }}>
          {promptGerado ? (
            <>
              <button onClick={() => setPromptGerado(null)} style={{
                padding: '10px 20px', borderRadius: '8px',
                border: '1px solid #2a2a3a', background: 'none',
                color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
              }}>
                Voltar e Editar
              </button>
              <button onClick={copiarPrompt} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 22px', borderRadius: '8px', border: 'none',
                backgroundColor: copiado ? '#22c55e' : '#a855f7', color: '#fff',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              }}>
                {copiado ? <CheckCircle size={14} /> : <Copy size={14} />} {copiado ? 'Copiado!' : 'Copiar Prompt'}
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} style={{
                padding: '10px 20px', borderRadius: '8px',
                border: '1px solid #2a2a3a', background: 'none',
                color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
              }}>
                Cancelar
              </button>
              <button onClick={gerarPrompt} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 22px', borderRadius: '8px', border: 'none',
                backgroundColor: '#a855f7', color: '#fff',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              }}>
                <Download size={14} /> Gerar Prompt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
