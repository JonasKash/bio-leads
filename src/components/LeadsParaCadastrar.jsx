import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import ProfileCard from './ProfileCard'
import GerarSiteModal from './GerarSiteModal'
import { calcEngajamento } from './EngajamentoBadge'
import leadsRaw from '../data/leads.json'

// Leads base (do JSON fixo) — filtra inválidos
const baseLeads = leadsRaw.filter(l => l.username && l.isPrivate !== 'N/A' && l.isPrivate !== 'YES')

const PAGE_SIZE = 20

export default function LeadsParaCadastrar({ clienteIds, onMarcarCliente, uploadedLeads = [] }) {
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [ordenar, setOrdenar] = useState('followers_desc')
  const [page, setPage] = useState(1)
  const [leadParaGerar, setLeadParaGerar] = useState(null)

  const filtered = useMemo(() => {
    // Merge base + uploaded (uploaded primeiro para aparecerem destacados)
    const merged = [
      ...uploadedLeads.filter(l => l.username && l.isPrivate !== 'YES'),
      ...baseLeads,
    ]
    let result = merged.filter(l => !clienteIds.has(l.id))

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
  }, [search, filtro, ordenar, clienteIds, uploadedLeads])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageLeads = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleSearch(v) { setSearch(v); setPage(1) }
  function handleFiltro(v) { setFiltro(v); setPage(1) }
  function handleOrdenar(v) { setOrdenar(v); setPage(1) }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>
          Leads para Cadastrar
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
          {filtered.length} lead{filtered.length !== 1 ? 's' : ''} disponíve{filtered.length !== 1 ? 'is' : 'l'}
          {uploadedLeads.length > 0 && (
            <span style={{
              marginLeft: '10px', backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7',
              border: '1px solid rgba(168,85,247,0.3)', fontSize: '11px', fontWeight: '600',
              padding: '1px 8px', borderRadius: '20px',
            }}>
              +{uploadedLeads.length} importados
            </span>
          )}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
          <Search size={14} style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: '#64748b', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Buscar por username, nome ou bio..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{
              width: '100%', backgroundColor: '#1c1c26', border: '1px solid #2a2a3a',
              borderRadius: '8px', padding: '8px 12px 8px 34px',
              color: '#e2e8f0', fontSize: '13px', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#a855f7'}
            onBlur={e => e.target.style.borderColor = '#2a2a3a'}
          />
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <SlidersHorizontal size={14} style={{ color: '#64748b' }} />
          {[
            { value: 'todos', label: 'Todos' },
            { value: 'com_link', label: 'Com link' },
            { value: 'business', label: 'Business' },
            { value: 'verificado', label: 'Verificados' },
          ].map(f => (
            <FilterBtn key={f.value} active={filtro === f.value} onClick={() => handleFiltro(f.value)}>
              {f.label}
            </FilterBtn>
          ))}
        </div>

        {/* Sort */}
        <select
          value={ordenar}
          onChange={e => handleOrdenar(e.target.value)}
          style={{
            backgroundColor: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: '8px',
            color: '#e2e8f0', fontSize: '12px', padding: '7px 10px', outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="followers_desc">Seguidores ↓</option>
          <option value="followers_asc">Seguidores ↑</option>
          <option value="eng_desc">Engajamento ↓</option>
          <option value="eng_asc">Engajamento ↑</option>
          <option value="nome_az">Nome A-Z</option>
        </select>
      </div>

      {/* Grid */}
      {pageLeads.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 0', color: '#64748b', fontSize: '14px',
        }}>
          Nenhum lead encontrado com os filtros atuais.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {pageLeads.map(lead => (
            <ProfileCard key={lead.id} lead={lead} onMarcarCliente={onMarcarCliente} onGerarSite={setLeadParaGerar} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', paddingBottom: '32px' }}>
          <PagBtn disabled={safePage === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={16} /> Anterior
          </PagBtn>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            Página <strong style={{ color: '#e2e8f0' }}>{safePage}</strong> de <strong style={{ color: '#e2e8f0' }}>{totalPages}</strong>
          </span>
          <PagBtn disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}>
            Próxima <ChevronRight size={16} />
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
