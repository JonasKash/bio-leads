import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react'
import leadsBase from '../data/leads.json'

// Mapa de nomes de coluna → campo interno
const COL_MAP = {
  // username
  'username': 'username', 'user': 'username', 'usuario': 'username',
  'perfil': 'username', 'login': 'username',
  // fullName
  'fullname': 'fullName', 'full name': 'fullName', 'nome': 'fullName',
  'name': 'fullName', 'nome completo': 'fullName',
  // followers
  'followers': 'followers', 'seguidores': 'followers', 'seguido por': 'followers',
  // following
  'following': 'following', 'seguindo': 'following',
  // posts
  'posts': 'posts', 'publicacoes': 'posts', 'publicações': 'posts',
  // bio
  'bio': 'bio', 'biografia': 'bio', 'description': 'bio', 'descricao': 'bio', 'descrição': 'bio',
  // email
  'email': 'email', 'e-mail': 'email',
  // phone
  'phone': 'phone', 'telefone': 'phone', 'whatsapp': 'phone', 'celular': 'phone',
  // externalUrl
  'externalurl': 'externalUrl', 'external url': 'externalUrl', 'link': 'externalUrl',
  'website': 'externalUrl', 'site': 'externalUrl', 'url': 'externalUrl',
  'link da bio': 'externalUrl', 'link bio': 'externalUrl',
  // profileLink
  'profilelink': 'profileLink', 'profile link': 'profileLink', 'profile': 'profileLink',
  'link do perfil': 'profileLink', 'perfil instagram': 'profileLink',
  // isVerified
  'isverified': 'isVerified', 'verified': 'isVerified', 'verificado': 'isVerified',
  // isBusiness
  'isbusiness': 'isBusiness', 'business': 'isBusiness', 'comercial': 'isBusiness',
  // isPrivate
  'isprivate': 'isPrivate', 'private': 'isPrivate', 'privado': 'isPrivate',
  // category
  'category': 'category', 'categoria': 'category',
  // city
  'city': 'city', 'cidade': 'city',
  // avatar
  'avatar': 'avatar', 'foto': 'avatar', 'image': 'avatar', 'imagem': 'avatar',
  // id
  'id': 'id',
}

function mapRow(row, colKeys) {
  const result = {}
  for (const [rawKey, value] of Object.entries(row)) {
    const normalized = rawKey.toString().trim().toLowerCase()
    const field = COL_MAP[normalized]
    if (field) result[field] = value !== undefined && value !== null ? String(value) : null
  }
  // Coerce numeric fields
  for (const f of ['followers', 'following', 'posts']) {
    if (result[f] !== undefined && result[f] !== null) {
      const n = parseInt(result[f], 10)
      result[f] = isNaN(n) ? null : n
    }
  }
  return result
}

function buildBaseUsernames() {
  return new Set(leadsBase.map(l => l.username?.toLowerCase()).filter(Boolean))
}

const PREVIEW_ROWS = 5

export default function ImportarPlanilha({ uploadedLeads, onAddLeads, onClearLeads }) {
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState(null) // { leads, filename, duplicates, unmapped }
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const fileRef = useRef()

  const baseUsernames = buildBaseUsernames()
  const uploadedUsernames = new Set(uploadedLeads.map(l => l.username?.toLowerCase()).filter(Boolean))

  function parseFile(file) {
    if (!file) return
    setParsing(true)
    setParsed(null)
    setImportDone(false)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx')
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: null })

        if (rows.length === 0) {
          setParsed({ error: 'Planilha vazia ou sem dados.' })
          setParsing(false)
          return
        }

        // Mapeamento posicional para arquivos sem header
        const POSITIONAL_MAP = {
          id: 0, username: 1, fullName: 2, profileLink: 3,
          avatar: 4, isVerified: 5, isPrivate: 6, followers: 7,
          following: 8, bio: 9, category: 10, email: 11,
          posts: 12, externalUrl: 19
        }

        const sampleRow = rows[0]
        const hasRecognizedHeader = Object.keys(sampleRow).some(k => COL_MAP[k.trim().toLowerCase()])

        let unmapped = []
        let leads

        if (!hasRecognizedHeader) {
          // Sem header reconhecido — mapear por índice posicional, pular primeira linha
          const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })
          leads = rawRows.slice(1).map((row, i) => {
            const mapped = {}
            for (const [field, idx] of Object.entries(POSITIONAL_MAP)) {
              const val = row[idx]
              mapped[field] = val !== undefined && val !== null ? String(val) : null
            }
            if (!mapped.username) return null
            mapped.username = mapped.username.replace(/^@/, '').trim()
            if (!mapped.id) mapped.id = `upload_${Date.now()}_${i}`
            if (!mapped.profileLink && mapped.username) {
              mapped.profileLink = `https://www.instagram.com/${mapped.username}/`
            }
            if (!mapped.isPrivate) mapped.isPrivate = 'NO'
            if (!mapped.isBusiness) mapped.isBusiness = 'NO'
            if (!mapped.isVerified) mapped.isVerified = 'No'
            for (const f of ['followers', 'following', 'posts']) {
              if (mapped[f] !== undefined && mapped[f] !== null) {
                const n = parseInt(mapped[f], 10)
                mapped[f] = isNaN(n) ? null : n
              }
            }
            return mapped
          }).filter(Boolean)
        } else {
          unmapped = Object.keys(sampleRow).filter(k => !COL_MAP[k.trim().toLowerCase()])
          leads = rows.map((row, i) => {
            const mapped = mapRow(row, Object.keys(sampleRow))
            if (!mapped.username) return null
            // clean username
            mapped.username = mapped.username.replace(/^@/, '').trim()
            if (!mapped.id) mapped.id = `upload_${Date.now()}_${i}`
            if (!mapped.profileLink && mapped.username) {
              mapped.profileLink = `https://www.instagram.com/${mapped.username}/`
            }
            if (!mapped.isPrivate) mapped.isPrivate = 'NO'
            if (!mapped.isBusiness) mapped.isBusiness = 'NO'
            if (!mapped.isVerified) mapped.isVerified = 'No'
            return mapped
          }).filter(Boolean)
        }

        const duplicates = leads.filter(l => {
          const u = l.username?.toLowerCase()
          return baseUsernames.has(u) || uploadedUsernames.has(u)
        })

        const newLeads = leads.filter(l => {
          const u = l.username?.toLowerCase()
          return !baseUsernames.has(u) && !uploadedUsernames.has(u)
        })

        setParsed({ leads: newLeads, allCount: leads.length, filename: file.name, duplicates: duplicates.length, unmapped })
      } catch (err) {
        setParsed({ error: `Erro ao ler o arquivo: ${err.message}` })
      }
      setParsing(false)
    }
    reader.readAsArrayBuffer(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) parseFile(file)
    e.target.value = ''
  }

  function handleImport() {
    if (!parsed?.leads?.length) return
    onAddLeads(parsed.leads)
    setImportDone(true)
    setParsed(null)
  }

  function handleCancelParsed() {
    setParsed(null)
    setImportDone(false)
  }

  const previewLeads = parsed?.leads?.slice(0, previewExpanded ? 20 : PREVIEW_ROWS) || []

  return (
    <div style={{ padding: '28px 32px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>
          Importar Planilha
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
          Envie um arquivo .xlsx ou .csv exportado da sua ferramenta de extração
        </p>
      </div>

      {/* Upload Area */}
      {!parsed && (
        <div
          onDragEnter={() => setDragging(true)}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#a855f7' : '#2a2a3a'}`,
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragging ? 'rgba(168,85,247,0.06)' : '#16161d',
            transition: 'all 0.2s',
            marginBottom: '28px',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#a855f7'; e.currentTarget.style.backgroundColor = 'rgba(168,85,247,0.04)' }}
          onMouseLeave={e => { if (!dragging) { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.backgroundColor = '#16161d' } }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            backgroundColor: 'rgba(168,85,247,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            {parsing
              ? <div style={{ width: '28px', height: '28px', border: '3px solid #a855f7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <Upload size={28} color="#a855f7" />
            }
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
            {parsing ? 'Processando...' : 'Arraste o arquivo aqui ou clique para selecionar'}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Suporta .xlsx, .xls e .csv — qualquer ferramenta de extração
          </div>
        </div>
      )}

      {/* Error */}
      {parsed?.error && (
        <div style={{
          backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px', padding: '16px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444',
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '14px' }}>{parsed.error}</span>
          <button onClick={handleCancelParsed} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Preview */}
      {parsed && !parsed.error && (
        <div style={{
          backgroundColor: '#16161d', border: '1px solid #2a2a3a', borderRadius: '14px',
          overflow: 'hidden', marginBottom: '24px',
        }}>
          {/* Preview Header */}
          <div style={{
            padding: '18px 20px', borderBottom: '1px solid #2a2a3a',
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
          }}>
            <FileSpreadsheet size={20} color="#a855f7" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{parsed.filename}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {parsed.allCount} linhas lidas
                {parsed.duplicates > 0 && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>· {parsed.duplicates} duplicados ignorados</span>}
                {parsed.leads.length > 0 && <span style={{ color: '#22c55e', marginLeft: '8px' }}>· {parsed.leads.length} novos leads</span>}
              </div>
            </div>
            <button onClick={handleCancelParsed} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
              <X size={16} />
            </button>
          </div>

          {/* Unmapped columns warning */}
          {parsed.unmapped?.length > 0 && (
            <div style={{
              padding: '10px 20px', borderBottom: '1px solid #2a2a3a',
              backgroundColor: 'rgba(245,158,11,0.06)',
              fontSize: '12px', color: '#f59e0b',
            }}>
              ⚠ Colunas não reconhecidas (ignoradas): {parsed.unmapped.join(', ')}
            </div>
          )}

          {parsed.leads.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              Nenhum lead novo encontrado. Todos já estão na lista.
            </div>
          ) : (
            <>
              {/* Preview Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
                      {['Username', 'Nome', 'Seguidores', 'Seguindo', 'Posts', 'Email', 'Telefone', 'Link Bio'].map(h => (
                        <th key={h} style={{
                          padding: '10px 14px', textAlign: 'left',
                          fontSize: '10px', fontWeight: '600', color: '#64748b',
                          textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewLeads.map((l, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #2a2a3a' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(168,85,247,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '9px 14px', color: '#a855f7', fontWeight: '600' }}>@{l.username}</td>
                        <td style={{ padding: '9px 14px', color: '#94a3b8', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.fullName || '—'}</td>
                        <td style={{ padding: '9px 14px', color: '#e2e8f0' }}>{l.followers ?? '—'}</td>
                        <td style={{ padding: '9px 14px', color: '#e2e8f0' }}>{l.following ?? '—'}</td>
                        <td style={{ padding: '9px 14px', color: '#e2e8f0' }}>{l.posts ?? '—'}</td>
                        <td style={{ padding: '9px 14px', color: '#94a3b8' }}>{l.email || '—'}</td>
                        <td style={{ padding: '9px 14px', color: '#94a3b8' }}>{l.phone || '—'}</td>
                        <td style={{ padding: '9px 14px', color: '#94a3b8', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.externalUrl || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Expand preview */}
              {parsed.leads.length > PREVIEW_ROWS && (
                <button
                  onClick={() => setPreviewExpanded(!previewExpanded)}
                  style={{
                    width: '100%', padding: '10px', background: 'none', border: 'none',
                    borderTop: '1px solid #2a2a3a',
                    color: '#64748b', fontSize: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  {previewExpanded
                    ? <><ChevronUp size={13} /> Ver menos</>
                    : <><ChevronDown size={13} /> Ver mais {parsed.leads.length - PREVIEW_ROWS} leads</>}
                </button>
              )}

              {/* Import Button */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid #2a2a3a', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={handleCancelParsed} style={{
                  padding: '9px 18px', borderRadius: '8px', border: '1px solid #2a2a3a',
                  backgroundColor: 'transparent', color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
                }}>
                  Cancelar
                </button>
                <button onClick={handleImport} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 22px', borderRadius: '8px', border: 'none',
                  backgroundColor: '#a855f7', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}>
                  <CheckCircle size={14} />
                  Importar {parsed.leads.length} leads
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Success toast */}
      {importDone && (
        <div style={{
          backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '10px', padding: '14px 18px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px', color: '#22c55e', fontSize: '13px',
        }}>
          <CheckCircle size={16} />
          Leads importados com sucesso! Acesse a aba <strong>Leads para Cadastrar</strong> para visualizá-los.
        </div>
      )}

      {/* Uploaded leads summary */}
      {uploadedLeads.length > 0 && (
        <div style={{
          backgroundColor: '#16161d', border: '1px solid #2a2a3a', borderRadius: '14px',
          padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#e2e8f0' }}>
                Leads importados via planilha
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {uploadedLeads.length} lead{uploadedLeads.length !== 1 ? 's' : ''} adicionado{uploadedLeads.length !== 1 ? 's' : ''} a Leads para Cadastrar
              </div>
            </div>
            <button
              onClick={onClearLeads}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.3)',
                backgroundColor: 'rgba(239,68,68,0.08)',
                color: '#ef4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              }}
            >
              <Trash2 size={13} /> Limpar importados
            </button>
          </div>

          {/* Mini table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
                  {['Username', 'Nome', 'Seguidores', 'Email', 'Telefone'].map(h => (
                    <th key={h} style={{
                      padding: '8px 12px', textAlign: 'left',
                      fontSize: '10px', fontWeight: '600', color: '#64748b',
                      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uploadedLeads.slice(0, 10).map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1c1c26' }}>
                    <td style={{ padding: '7px 12px', color: '#a855f7', fontWeight: '600' }}>@{l.username}</td>
                    <td style={{ padding: '7px 12px', color: '#94a3b8' }}>{l.fullName || '—'}</td>
                    <td style={{ padding: '7px 12px', color: '#e2e8f0' }}>{l.followers ?? '—'}</td>
                    <td style={{ padding: '7px 12px', color: '#94a3b8' }}>{l.email || '—'}</td>
                    <td style={{ padding: '7px 12px', color: '#94a3b8' }}>{l.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {uploadedLeads.length > 10 && (
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>
              + {uploadedLeads.length - 10} outros leads — veja todos em Leads para Cadastrar
            </div>
          )}
        </div>
      )}

      {/* CSS animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
