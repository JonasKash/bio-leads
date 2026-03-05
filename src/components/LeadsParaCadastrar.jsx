import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import ProfileCard from './ProfileCard'
import GerarSiteModal from './GerarSiteModal'
import { calcEngajamento } from './EngajamentoBadge'
import { useIsMobile } from '../hooks/useIsMobile'
import leadsRaw from '../data/leads.json'

// Leads base (do JSON fixo) — filtra inválidos
const baseLeads = leadsRaw.filter(l => l.username && l.isPrivate !== 'N/A' && l.isPrivate !== 'YES')

const PAGE_SIZE = 20

export default function LeadsParaCadastrar({ clienteIds, excluidosIds, excluidosUsernames, permanentesIds, onMarcarCliente, onExcluirLead, uploadedLeads = [] }) {
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [ordenar, setOrdenar] = useState('followers_desc')
  const [page, setPage] = useState(1)
  const [leadParaGerar, setLeadParaGerar] = useState(null)

  const filtered = useMemo(() => {
    // Mesclar leads fixos com importados e filtrar já cadastrados ou excluídos
    const currentUploaded = Array.isArray(uploadedLeads) ? uploadedLeads : []
    const combined = [
      ...currentUploaded.filter(l => l.username && l.isPrivate !== 'YES'),
      ...baseLeads.filter(bl => !currentUploaded.some(ul => ul.username?.toLowerCase() === bl.username?.toLowerCase())),
    ]

    let result = combined.filter(l => {
      const lid = l.id
      const lusername = l.username?.toLowerCase()
      const isCliente = (lid && clienteIds.has(lid))
      const isExcluido = (lid && excluidosIds.has(lid))
      const isPermanente = (lid && permanentesIds.has(lid))
      return !isCliente && !isExcluido && !isPermanente
    })

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(l =>
        (l.username || '').toLowerCase().includes(q) ||
        (l.fullName || '').toLowerCase().includes(q) ||
        (l.bio || '').toLowerCase().includes(q)
      )
    }

    // Filter
    if (filtro === 'com_link') result = result.filter(l => l.externalUrl)
    else if (filtro === 'sem_link') result = result.filter(l => !l.externalUrl)
    else if (filtro === 'business') result = result.filter(l => l.isBusiness === 'YES')
    else if (filtro === 'verificado') result = result.filter(l => l.isVerified === 'Yes')

    // Sort
    if (ordenar === 'followers_desc') result = [...result].sort((a, b) => (b.followers || 0) - (a.followers || 0))
    else if (ordenar === 'followers_asc') result = [...result].sort((a, b) => (a.followers || 0) - (b.followers || 0))
    else if (ordenar === 'eng_desc') result = [...result].sort((a, b) => {
      const ea = parseFloat(calcEngajamento(a.followers, a.following, a.posts) || 0)
      const eb = parseFloat(calcEngajamento(b.followers, b.following, b.posts) || 0)
      return eb - ea
    })
    else if (ordenar === 'eng_asc') result = [...result].sort((a, b) => {
      const ea = parseFloat(calcEngajamento(a.followers, a.following, a.posts) || 0)
      const eb = parseFloat(calcEngajamento(b.followers, b.following, b.posts) || 0)
      return ea - eb
    })
    else if (ordenar === 'nome_az') result = [...result].sort((a, b) =>
      (a.username || '').localeCompare(b.username || '')
    )

    return result
  }, [search, filtro, ordenar, clienteIds, uploadedLeads, excluidosIds, excluidosUsernames, permanentesIds])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageLeads = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleSearch(v) { setSearch(v); setPage(1) }
  function handleFiltro(v) { setFiltro(v); setPage(1) }
  function handleOrdenar(v) { setOrdenar(v); setPage(1) }

  const pad = isMobile ? '12px' : '28px 32px'

  return (
    <div style={{ padding: pad, maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', color: '#e2e8f0', margin: 0, letterSpacing: '-0.02em' }}>
          Leads para Cadastrar
        </h1>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
          <span>{filtered.length} lead{filtered.length !== 1 ? 's' : ''} disponíve{filtered.length !== 1 ? 'is' : 'l'}</span>
          {uploadedLeads.length > 0 && (
            <span style={{
              backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7',
              fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
              fontSize: '11px'
            }}>
              +{uploadedLeads.length} importados
            </span>
          )}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search — full width on mobile */}
        <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1', minWidth: '0', maxWidth: isMobile ? '100%' : '360px' }}>
          <Search size={14} style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: '#64748b', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Buscar username, nome ou bio..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{
              width: '100%', backgroundColor: '#1c1c26', border: '1px solid #2a2a3a',
              borderRadius: '8px', padding: '9px 12px 9px 34px',
              color: '#e2e8f0', fontSize: '13px', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#a855f7'}
            onBlur={e => e.target.style.borderColor = '#2a2a3a'}
          />
        </div>

        {/* Filter + Sort row on mobile */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', flex: isMobile ? '1 1 100%' : '1' }}>
          <SlidersHorizontal size={14} style={{ color: '#64748b', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: '1 1 auto' }}>
            {[
              { value: 'todos', label: 'Todos' },
              { value: 'com_link', label: 'Com link' },
              { value: 'sem_link', label: 'Sem link' },
              { value: 'business', label: 'Business' },
              { value: 'verificado', label: 'Verificados' },
            ].map(f => (
              <FilterBtn key={f.value} active={filtro === f.value} onClick={() => handleFiltro(f.value)}>
                {f.label}
              </FilterBtn>
            ))}
            {filtro !== 'todos' && (
              <button
                onClick={() => handleFiltro('todos')}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', padding: '0 4px' }}
              >
                Limpar
              </button>
            )}
          </div>

          <select
            value={ordenar}
            onChange={e => handleOrdenar(e.target.value)}
            style={{
              backgroundColor: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: '8px',
              color: '#e2e8f0', fontSize: '12px', padding: '7px 10px', outline: 'none',
              cursor: 'pointer', marginLeft: isMobile ? '0' : 'auto', flexShrink: 0
            }}
          >
            <option value="followers_desc">Seguidores ↓</option>
            <option value="followers_asc">Seguidores ↑</option>
            <option value="eng_desc">Engajamento ↓</option>
            <option value="eng_asc">Engajamento ↑</option>
            <option value="nome_az">Nome A-Z</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {pageLeads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '14px' }}>
          Nenhum lead encontrado com os filtros atuais.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: isMobile ? '12px' : '16px',
          marginBottom: '24px',
        }}>
          {pageLeads.map(lead => (
            <ProfileCard key={lead.id} lead={lead} onMarcarCliente={onMarcarCliente} onGerarSite={setLeadParaGerar} onExcluirLead={onExcluirLead} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', paddingBottom: '24px' }}>
          <PagBtn disabled={safePage === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={16} /> {!isMobile && 'Anterior'}
          </PagBtn>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            <strong style={{ color: '#e2e8f0' }}>{safePage}</strong> / <strong style={{ color: '#e2e8f0' }}>{totalPages}</strong>
          </span>
          <PagBtn disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}>
            {!isMobile && 'Próxima'} <ChevronRight size={16} />
          </PagBtn>
        </div>
      )}

      <GerarSiteModal lead={leadParaGerar} onClose={() => setLeadParaGerar(null)} />
    </div>
  )
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500',
        border: '1px solid',
        borderColor: active ? '#a855f7' : '#2a2a3a',
        backgroundColor: active ? 'rgba(168,85,247,0.15)' : 'transparent',
        color: active ? '#a855f7' : '#94a3b8',
        transition: 'all 0.15s',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function PagBtn({ disabled, onClick, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
        backgroundColor: disabled ? '#1c1c26' : '#2a2a3a',
        color: disabled ? '#64748b' : '#e2e8f0',
        border: '1px solid #2a2a3a',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}
