import { Target, CheckCircle, Zap, FileSpreadsheet } from 'lucide-react'

export default function Sidebar({ activeTab, setActiveTab, clientesCount, uploadedCount }) {
  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      backgroundColor: '#16161d',
      borderRight: '1px solid #2a2a3a',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #2a2a3a',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: '#a855f7',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Zap size={18} color="#fff" fill="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0' }}>BioLeads</div>
          <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: '600', letterSpacing: '0.05em' }}>CRM</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>
          Módulos
        </div>

        <NavItem
          icon={<FileSpreadsheet size={18} />}
          label="Importar Planilha"
          count={uploadedCount > 0 ? uploadedCount : undefined}
          countColor="#a855f7"
          active={activeTab === 'importar'}
          onClick={() => setActiveTab('importar')}
        />

        <NavItem
          icon={<Target size={18} />}
          label="Leads para Cadastrar"
          active={activeTab === 'leads'}
          onClick={() => setActiveTab('leads')}
        />

        <NavItem
          icon={<CheckCircle size={18} />}
          label="Leads Cadastrados"
          count={clientesCount}
          active={activeTab === 'clientes'}
          onClick={() => setActiveTab('clientes')}
          countColor="#22c55e"
        />
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #2a2a3a',
        fontSize: '11px',
        color: '#64748b',
      }}>
        v1.0 · Bio Inteligente
      </div>
    </aside>
  )
}

function NavItem({ icon, label, count, active, onClick, countColor = '#a855f7' }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: active ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
        color: active ? '#a855f7' : '#94a3b8',
        fontSize: '13px',
        fontWeight: active ? '600' : '400',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'left',
        marginBottom: '4px',
        boxShadow: active ? 'inset 0 0 0 1px rgba(168, 85, 247, 0.3)' : 'none',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.color = '#e2e8f0'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = '#94a3b8'
        }
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, lineHeight: '1.3' }}>{label}</span>
      {count !== undefined && (
        <span style={{
          backgroundColor: active ? 'rgba(168, 85, 247, 0.3)' : '#1c1c26',
          color: countColor,
          fontSize: '11px',
          fontWeight: '700',
          padding: '2px 7px',
          borderRadius: '20px',
          flexShrink: 0,
        }}>
          {count}
        </span>
      )}
    </button>
  )
}
