# Instrução: Adicionar Feature "Gerar Site" ao BioLeads CRM

## O que fazer

Adicionar um botão **"Gerar Site"** em cada card da aba "Leads para Cadastrar" que abre um modal. O modal pré-preenche os dados do lead e, ao confirmar, **baixa um arquivo `.html` completo** — o site de bio personalizado pronto para o cliente.

**Não alterar** nenhuma outra funcionalidade existente. Só adicionar.

---

## 1. Criar o componente `GerarSiteModal.jsx`

Criar o arquivo `src/components/GerarSiteModal.jsx`.

### Props
```js
// lead: objeto do lead selecionado (pode ser null quando fechado)
// onClose: função para fechar o modal
({ lead, onClose })
```

### Comportamento
- Quando `lead` for `null` ou `undefined`, não renderizar nada (retornar `null`)
- Quando abrir, pré-preencher todos os campos com os dados do lead
- Ao clicar em "Gerar Site HTML", gerar o HTML e fazer download automático
- Ao clicar em "Cancelar" ou no overlay, chamar `onClose()`

### Campos do formulário (organizados em seções)

**Seção — Identidade Visual**
| Campo | ID | Valor inicial |
|---|---|---|
| URL da Foto / Logo | `f-logo` | `lead.avatar` (com proxy weserv: `https://images.weserv.nl/?url=ENCODED&w=150`) |
| Imagem de Fundo (Bio) | `f-bg-bio` | vazio |
| Imagem de Fundo (Site) | `f-bg-site` | vazio |
| Cor Primária | `f-cor` | `#a855f7` (input type="color") |

**Seção — Perfil**
| Campo | ID | Valor inicial |
|---|---|---|
| Nome / Tagline | `f-nome` | `lead.fullName \|\| lead.username` |
| Username | `f-username` | `@${lead.username}` |
| URL do Instagram | `f-ig-url` | `lead.profileLink` |
| Número WhatsApp | `f-whatsapp` | `lead.phone \|\| ''` |
| Bio | `f-bio` | `lead.bio` (textarea) |

**Seção — Site Institucional**
| Campo | ID | Valor inicial |
|---|---|---|
| Título Hero | `f-hero-title` | `lead.fullName \|\| lead.username` |
| Subtítulo Hero | `f-hero-sub` | primeira linha da bio |
| Texto Sobre Nós | `f-sobre` | `lead.bio` (textarea) |
| Resultado 1 (número) | `f-r1-num` | `500+` |
| Resultado 1 (label) | `f-r1-lbl` | `Clientes Atendidos` |
| Resultado 2 (número) | `f-r2-num` | `10+` |
| Resultado 2 (label) | `f-r2-lbl` | `Anos de Experiência` |
| Resultado 3 (número) | `f-r3-num` | `99%` |
| Resultado 3 (label) | `f-r3-lbl` | `Satisfação` |
| Texto do CTA | `f-cta` | `Agendar Consulta` |

**Seção — Localização**
| Campo | ID | Valor inicial |
|---|---|---|
| Latitude | `f-lat` | `-23.5505` |
| Longitude | `f-lng` | `-46.6333` |
| Nome do Local | `f-local` | `lead.fullName \|\| lead.username` |
| Texto do Rodapé | `f-footer` | `© 2025 ${nome} — Feito por @mateusmachadoprod` |

**Seção — Depoimentos** (estado local, array)
- Estado inicial: 3 depoimentos genéricos
- Cada item: `{ nome: string, texto: string }`
- UI: lista de linhas com dois inputs (nome + texto) e botão remover (×)
- Botão "+ Adicionar depoimento"

**Seção — Perguntas Frequentes** (estado local, array)
- Estado inicial: 3 FAQs genéricas
- Cada item: `{ pergunta: string, resposta: string }`
- UI: lista de linhas com input (pergunta) + textarea (resposta) e botão remover (×)
- Botão "+ Adicionar pergunta"

**Seção — Serviços** (estado local, array)
- Estado inicial: 2 serviços genéricos
- Cada item: `{ nome: string, preco: string, descricao: string }`
- UI: lista de linhas com três inputs e botão remover (×)
- Botão "+ Adicionar serviço"

### Função `gerarSite()` — lógica de geração do HTML

Ler todos os campos do formulário e os estados de depoimentos/faqs/serviços, depois montar uma string HTML completa e fazer download.

#### Download automático
```js
const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `bio-${lead.username}.html`
a.click()
URL.revokeObjectURL(url)
onClose()
```

#### Helper de cor
```js
function shadeColor(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (n >> 16) + pct))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + pct))
  const b = Math.max(0, Math.min(255, (n & 0xff) + pct))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}
// uso: const corDark = shadeColor(cor, -40)
```

#### Estrutura do HTML gerado

O HTML gerado deve ser um arquivo único (`bio-[username].html`) com duas "páginas" em divs — navegação feita via `display:none/block` com JS inline, sem router.

**Página 1 — Bio Link** (`id="page-bio"`)
- Fundo: imagem de `f-bg-bio` se preenchida, senão gradient escuro com a cor primária
- Foto de perfil (circular, com borda na cor primária)
- Nome / tagline
- Bio em texto
- Botões (glassmorphism):
  - "🌐 Ver Site Completo" → muda para page-site
  - "📷 @username" → abre Instagram
  - "💬 WhatsApp" → abre `https://api.whatsapp.com/send/?phone=NUMERO`
- Mapa Google embed (se lat/lng preenchidos)
- Rodapé

**Página 2 — Site Institucional** (`id="page-site"`, `display:none` inicial)
- Fundo: imagem de `f-bg-site` se preenchida, senão gradient
- Botão "← Voltar" (volta para page-bio)
- Hero: foto + título + subtítulo + botão CTA (WhatsApp)
- Card "Sobre Nós" (glassmorphism)
- Grid de 3 resultados/números
- Grid de serviços (se houver) com botão WhatsApp por serviço
- Scroll horizontal de depoimentos (se houver)
- Card CTA de segurança
- FAQ accordion (JS inline para abrir/fechar)
- Rodapé

**CSS do site gerado:** embutido em `<style>` no próprio HTML. Usar glassmorphism (`backdrop-filter: blur(16px)`), fonte Inter via Google Fonts, responsivo mobile-first, sem dependências externas além do Google Fonts e Google Maps embed.

---

## 2. Adicionar o botão em `LeadsParaCadastrar.jsx` (ou `ProfileCard.jsx`)

Localizar onde estão os botões de ação de cada lead (provavelmente dentro do `ProfileCard` ou direto no map de LeadsParaCadastrar).

Adicionar o botão:
```jsx
<button onClick={() => setLeadParaGerar(lead)}>
  Gerar Site
</button>
```

Estilo do botão: roxo (`bg-purple-600 hover:bg-purple-700`), texto branco, pequeno, inline com os outros botões de ação.

---

## 3. Conectar o modal em `LeadsParaCadastrar.jsx`

```jsx
// Adicionar no topo do componente:
import GerarSiteModal from './GerarSiteModal'

// Adicionar estado:
const [leadParaGerar, setLeadParaGerar] = useState(null)

// Adicionar no JSX (fora da tabela/lista, antes do return fechar):
<GerarSiteModal
  lead={leadParaGerar}
  onClose={() => setLeadParaGerar(null)}
/>
```

---

## Resumo dos arquivos alterados

| Arquivo | Ação |
|---|---|
| `src/components/GerarSiteModal.jsx` | **Criar** (novo) |
| `src/components/LeadsParaCadastrar.jsx` | **Editar** — adicionar import, estado e botão |

Nenhum outro arquivo deve ser modificado.
