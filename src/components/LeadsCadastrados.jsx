import { useState } from 'react'
import { Plus, Edit2, Trash2, ExternalLink, X, Save, CheckCircle } from 'lucide-react'

const PLANOS = ['Básico', 'Pro', 'Premium']
const STATUS = ['Ativo', 'Pausado', 'Cancelado']

const STATUS_COLORS = {
  Ativo: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  Pausado: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  Cancelado: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
}

function emptyForm(lead = null) {
  return {
    username: lead?.username || '',
    nome: lead?.fullName || '',
    linkBio: '',
    dataContratacao: new Date().toISOString().slice(0, 10),
    plano: 'Básico',
    status: 'Ativo',
    notas: '',
    instagramId: lead?.id || null,
    avatar: lead?.avatar || null,
  }
}

function proxyUrl(url) {
  if (!url) return null
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=100&h=100&fit=cover&output=jpg`
}

function AvatarSmall({ avatar, username }) {
  const [failed, setFailed] = useState(false)
  const initials = (username || '?').slice(0, 2).toUpperCase()
  const src = proxyUrl(avatar)

  if (failed || !src) {
    return (
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        backgroundColor: '#2a2a3a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: '700', color: '#a855f7', flexShrink: 0,
      }}>{initials}</div>
    )
  }
  return (
    <img src={src} alt={username} onError={() => setFailed(true)}
      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #2a2a3a' }} />
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        backgroundColor: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: '16px',
        padding: '28px', width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#e2e8f0' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px',
            borderRadius: '4px', display: 'flex',
          }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', backgroundColor: '#16161d', border: '1px solid #2a2a3a',
  borderRadius: '8px', padding: '9px 12px', color: '#e2e8f0', fontSize: '13px', outline: 'none',
  boxSizing: 'border-box',
}

export default function LeadsCadastrados({ clientes, onAdd, onEdit, onRemove }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [confirmDelete, setConfirmDelete] = useState(null)

  function openNew() {
    setForm(emptyForm())
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(c) {
    setForm({ ...c })
    setEditId(c.id)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditId(null)
  }

  function handleSave() {
    if (!form.username.trim()) return
    if (editId !== null) {
      onEdit(editId, form)
    } else {
      onAdd(form)
    }
    closeForm()
  }

  function handleDelete(id) {
    onRemove(id)
    setConfirmDelete(null)
  }

  const F = (field) => ({
    value: form[field],
    onChange: e => setForm(f => ({ ...f, [field]: e.target.value })),
    style: inputStyle,
    onFocus: e => e.target.style.borderColor = '#a855f7',
    onBlur: e => e.target.style.borderColor = '#2a2a3a',
  })

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>
            Leads Cadastrados
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#a855f7', color: '#fff',
            border: 'none', borderRadius: '8px',
            fontSize: '13px', fontWeight: '600',
            padding: '9px 18px', cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#9333ea'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#a855f7'}
        >
          <Plus size={15} /> Adicionar Cliente
        </button>
      </div>

      {/* Table */}
      {clientes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 0', color: '#64748b',
          border: '2px dashed #2a2a3a', borderRadius: '12px',
        }}>
          <CheckCircle size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Nenhum cliente ainda</div>
          <div style={{ fontSize: '13px' }}>Marque leads como cliente ou adicione manualmente.</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
                {['', 'Username', 'Nome', 'Link Bio', 'Plano', 'Status', 'Contratação', 'Ações'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 12px', fontSize: '11px',
                    fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, i) => {
                const sc = STATUS_COLORS[c.status] || STATUS_COLORS.Ativo
                return (
                  <tr key={c.id} style={{
                    borderBottom: '1px solid #2a2a3a',
                    backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(168,85,247,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <AvatarSmall avatar={c.avatar} username={c.username} />
                    </td>
                    <td style={{ padding: '10px 12px', color: '#a855f7', fontWeight: '600' }}>
                      @{c.username}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                      {c.nome || '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {c.linkBio ? (
                        <a href={c.linkBio} target="_blank" rel="noreferrer"
                          style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                          <ExternalLink size={11} />
                          {c.linkBio.replace(/^https?:\/\//, '').slice(0, 30)}{c.linkBio.length > 35 ? '…' : ''}
                        </a>
                      ) : <span style={{ color: '#64748b' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        backgroundColor: 'rgba(168,85,247,0.12)', color: '#a855f7',
                        border: '1px solid rgba(168,85,247,0.25)',
                        fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                      }}>{c.plano}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                        fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                      }}>{c.status}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {c.dataContratacao || '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <IconBtn onClick={() => openEdit(c)} title="Editar">
                          <Edit2 size={13} />
                        </IconBtn>
                        <IconBtn onClick={() => setConfirmDelete(c.id)} title="Remover" danger>
                          <Trash2 size={13} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes column if any */}
      {clientes.some(c => c.notas) && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px' }}>Notas</h3>
          {clientes.filter(c => c.notas).map(c => (
            <div key={c.id} style={{
              backgroundColor: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: '8px',
              padding: '12px 16px', marginBottom: '8px',
            }}>
              <span style={{ color: '#a855f7', fontWeight: '600', fontSize: '13px' }}>@{c.username}</span>
              <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>{c.notas}</span>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editId !== null ? 'Editar Cliente' : 'Adicionar Cliente'} onClose={closeForm}>
          <FormField label="Username Instagram *">
            <input {...F('username')} placeholder="@username" />
          </FormField>
          <FormField label="Nome">
            <input {...F('nome')} placeholder="Nome completo" />
          </FormField>
          <FormField label="Link da Bio entregue">
            <input {...F('linkBio')} placeholder="https://..." type="url" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Plano">
              <select {...F('plano')} style={{ ...inputStyle, cursor: 'pointer' }}>
                {PLANOS.map(p => <option key={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select {...F('status')} style={{ ...inputStyle, cursor: 'pointer' }}>
                {STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Data de Contratação">
            <input {...F('dataContratacao')} type="date" />
          </FormField>
          <FormField label="Notas">
            <textarea
              {...F('notas')}
              placeholder="Observações sobre o cliente..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </FormField>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button onClick={closeForm} style={{
              padding: '9px 18px', borderRadius: '8px', border: '1px solid #2a2a3a',
              backgroundColor: 'transparent', color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button onClick={handleSave} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 18px', borderRadius: '8px', border: 'none',
              backgroundColor: '#a855f7', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <Modal title="Remover cliente?" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: 0 }}>
            Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setConfirmDelete(null)} style={{
              padding: '9px 18px', borderRadius: '8px', border: '1px solid #2a2a3a',
              backgroundColor: 'transparent', color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button onClick={() => handleDelete(confirmDelete)} style={{
              padding: '9px 18px', borderRadius: '8px', border: 'none',
              backgroundColor: '#ef4444', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}>
              Remover
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function IconBtn({ onClick, title, danger, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '28px', height: '28px', borderRadius: '6px',
        border: '1px solid',
        borderColor: danger ? 'rgba(239,68,68,0.3)' : '#2a2a3a',
        backgroundColor: danger ? 'rgba(239,68,68,0.08)' : 'transparent',
        color: danger ? '#ef4444' : '#64748b',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = danger ? '#ef4444' : '#a855f7'
        e.currentTarget.style.color = danger ? '#ef4444' : '#a855f7'
        e.currentTarget.style.backgroundColor = danger ? 'rgba(239,68,68,0.15)' : 'rgba(168,85,247,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = danger ? 'rgba(239,68,68,0.3)' : '#2a2a3a'
        e.currentTarget.style.color = danger ? '#ef4444' : '#64748b'
        e.currentTarget.style.backgroundColor = danger ? 'rgba(239,68,68,0.08)' : 'transparent'
      }}
    >
      {children}
    </button>
  )
}
