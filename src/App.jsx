import { useState, useCallback, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import LeadsParaCadastrar from './components/LeadsParaCadastrar'
import LeadsCadastrados from './components/LeadsCadastrados'
import ImportarPlanilha from './components/ImportarPlanilha'
import ApifyScraper from './components/ApifyScraper'

const STORAGE_CLIENTES = 'bioleads_clientes'
const STORAGE_UPLOADED = 'bioleads_uploaded'
const STORAGE_EXCLUIDOS = 'bioleads_excluidos'
const STORAGE_PERMANENTES = 'bioleads_permanentes'

function loadStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStorage(key, list) {
  localStorage.setItem(key, JSON.stringify(list))
}

let nextId = Date.now()

export default function App() {
  const [activeTab, setActiveTab] = useState('leads')
  const [clientes, setClientes] = useState(() => loadStorage(STORAGE_CLIENTES))
  const [uploadedLeads, setUploadedLeads] = useState(() => loadStorage(STORAGE_UPLOADED))
  const [excluidos, setExcluidos] = useState(() => loadStorage(STORAGE_EXCLUIDOS))
  const [permanentes, setPermanentes] = useState(() => loadStorage(STORAGE_PERMANENTES))

  const clienteIds = useMemo(() => new Set(clientes.map(c => c.instagramId).filter(Boolean)), [clientes])
  const excluidosIds = useMemo(() => new Set(excluidos.map(l => l.id).filter(Boolean)), [excluidos])
  const permanentesIds = useMemo(() => new Set(permanentes), [permanentes])
  const excluidosUsernames = useMemo(() => new Set(excluidos.map(l => l.username?.toLowerCase()).filter(Boolean)), [excluidos])

  // --- Importar planilha ---
  const handleAddLeads = useCallback((newLeads) => {
    setUploadedLeads(prev => {
      const existingUsernames = new Set(prev.map(l => l.username?.toLowerCase()))
      const deduped = newLeads.filter(l => !existingUsernames.has(l.username?.toLowerCase()))
      const updated = [...prev, ...deduped]
      saveStorage(STORAGE_UPLOADED, updated)
      return updated
    })
  }, [])

  const handleAddOrUpdateLeads = useCallback((scrapedLeads) => {
    if (!scrapedLeads || scrapedLeads.length === 0) return

    const syncUsernames = new Set(scrapedLeads.map(l => l.username?.trim().toLowerCase()))

    // 1. Atualizar ou Adicionar nos Uploaded
    setUploadedLeads(prev => {
      const newList = [...prev]
      scrapedLeads.forEach(sl => {
        const uname = sl.username?.trim().toLowerCase()
        const idx = newList.findIndex(l => l.username?.trim().toLowerCase() === uname)
        if (idx !== -1) {
          newList[idx] = { ...newList[idx], ...sl, id: String(newList[idx].id) }
        } else {
          newList.push({ ...sl, id: String(Date.now() + Math.floor(Math.random() * 10000)) })
        }
      })
      saveStorage(STORAGE_UPLOADED, newList)
      return newList
    })

    // 2. Remover da Lixeira (excluidos) se estiver lá
    setExcluidos(prev => {
      const filtered = prev.filter(l => !syncUsernames.has(l.username?.trim().toLowerCase()))
      if (filtered.length !== prev.length) saveStorage(STORAGE_EXCLUIDOS, filtered)
      return filtered
    })

    // 3. Atualizar dados no Cliente se ele já for cliente (ex: atualizar engajamento)
    setClientes(prev => {
      let changed = false
      const updated = prev.map(c => {
        const syncData = scrapedLeads.find(sl => sl.username?.trim().toLowerCase() === c.username?.trim().toLowerCase())
        if (syncData) {
          changed = true
          return { ...c, avatar: syncData.avatar || c.avatar, realEng: syncData.realEng }
        }
        return c
      })
      if (changed) saveStorage(STORAGE_CLIENTES, updated)
      return updated
    })

    setActiveTab('leads')
  }, [])

  const handleClearLeads = useCallback(() => {
    setUploadedLeads([])
    saveStorage(STORAGE_UPLOADED, [])
  }, [])

  // --- Marcar como cliente ---
  const handleMarcarCliente = useCallback((lead) => {
    setClientes(prev => {
      if (prev.some(c => c.instagramId === lead.id)) return prev
      const novo = {
        id: ++nextId,
        instagramId: lead.id,
        username: lead.username,
        nome: lead.fullName || '',
        avatar: lead.avatar || null,
        linkBio: '',
        dataContratacao: new Date().toISOString().slice(0, 10),
        plano: 'Básico',
        status: 'Ativo',
        notas: '',
      }
      const updated = [...prev, novo]
      saveStorage(STORAGE_CLIENTES, updated)
      return updated
    })
    setActiveTab('clientes')
  }, [])

  const [clientesSubView, setClientesSubView] = useState('ativos')

  // --- Excluir Lead ---
  const handleExcluirLead = useCallback((lead) => {
    setExcluidos(prev => {
      if (prev.some(l => l.id === lead.id)) return prev
      const updated = [...prev, lead]
      saveStorage(STORAGE_EXCLUIDOS, updated)
      return updated
    })
    setClientesSubView('excluidos')
    setActiveTab('clientes')
  }, [])

  const handleRestaurarLead = useCallback((id) => {
    setExcluidos(prev => {
      const updated = prev.filter(l => l.id !== id)
      saveStorage(STORAGE_EXCLUIDOS, updated)
      return updated
    })
  }, [])

  const handleRemoverDefinitivo = useCallback((id) => {
    setExcluidos(prev => {
      const updated = prev.filter(l => l.id !== id)
      saveStorage(STORAGE_EXCLUIDOS, updated)
      return updated
    })
    setPermanentes(prev => {
      const updated = [...new Set([...prev, id])]
      saveStorage(STORAGE_PERMANENTES, updated)
      return updated
    })
  }, [])

  // --- CRUD clientes ---
  const handleAdd = useCallback((form) => {
    setClientes(prev => {
      const updated = [...prev, { id: ++nextId, ...form }]
      saveStorage(STORAGE_CLIENTES, updated)
      return updated
    })
  }, [])

  const handleEdit = useCallback((id, form) => {
    setClientes(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...form } : c)
      saveStorage(STORAGE_CLIENTES, updated)
      return updated
    })
  }, [])

  const handleRemove = useCallback((id) => {
    setClientes(prev => {
      const updated = prev.filter(c => c.id !== id)
      saveStorage(STORAGE_CLIENTES, updated)
      return updated
    })
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0f13', width: '100%', overflowX: 'hidden' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientesCount={clientes.length}
        uploadedCount={uploadedLeads.length}
      />
      <main id="main-content" style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {activeTab === 'importar' && (
          <ImportarPlanilha
            uploadedLeads={uploadedLeads}
            onAddLeads={handleAddLeads}
            onClearLeads={handleClearLeads}
          />
        )}
        {activeTab === 'scraper' && (
          <ApifyScraper onAddOrUpdateLeads={handleAddOrUpdateLeads} />
        )}
        {activeTab === 'leads' && (
          <LeadsParaCadastrar
            clienteIds={clienteIds}
            excluidosIds={excluidosIds}
            permanentesIds={permanentesIds}
            onMarcarCliente={handleMarcarCliente}
            onExcluirLead={handleExcluirLead}
            uploadedLeads={uploadedLeads}
          />
        )}
        {activeTab === 'clientes' && (
          <LeadsCadastrados
            clientes={clientes}
            excluidos={excluidos}
            view={clientesSubView}
            onSetView={setClientesSubView}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onRestaurarLead={handleRestaurarLead}
            onRemoverDefinitivo={handleRemoverDefinitivo}
          />
        )}
      </main>
    </div>
  )
}
