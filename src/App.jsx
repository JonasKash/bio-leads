import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import LeadsParaCadastrar from './components/LeadsParaCadastrar'
import LeadsCadastrados from './components/LeadsCadastrados'
import ImportarPlanilha from './components/ImportarPlanilha'

const STORAGE_CLIENTES = 'bioleads_clientes'
const STORAGE_UPLOADED = 'bioleads_uploaded'

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
  const [activeTab, setActiveTab] = useState('importar')
  const [clientes, setClientes] = useState(() => loadStorage(STORAGE_CLIENTES))
  const [uploadedLeads, setUploadedLeads] = useState(() => loadStorage(STORAGE_UPLOADED))

  const clienteIds = new Set(clientes.map(c => c.instagramId).filter(Boolean))

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0f13' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientesCount={clientes.length}
        uploadedCount={uploadedLeads.length}
      />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {activeTab === 'importar' && (
          <ImportarPlanilha
            uploadedLeads={uploadedLeads}
            onAddLeads={handleAddLeads}
            onClearLeads={handleClearLeads}
          />
        )}
        {activeTab === 'leads' && (
          <LeadsParaCadastrar
            clienteIds={clienteIds}
            onMarcarCliente={handleMarcarCliente}
            uploadedLeads={uploadedLeads}
          />
        )}
        {activeTab === 'clientes' && (
          <LeadsCadastrados
            clientes={clientes}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onRemove={handleRemove}
          />
        )}
      </main>
    </div>
  )
}
