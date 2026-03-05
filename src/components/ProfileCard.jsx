import { useState } from 'react'
import { ExternalLink, Users, UserCheck, FileText, Building2, BadgeCheck, Lock, ChevronDown, ChevronUp, UserPlus, MessageCircle, Globe } from 'lucide-react'
import EngajamentoBadge from './EngajamentoBadge'

function formatNum(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toString()
}

// Proxy gratuito para contornar CORS e URLs expiradas do Instagram
function proxyUrl(url) {
  if (!url) return null
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=150&h=150&fit=cover&output=jpg`
}

function Avatar({ avatar, username }) {
  const [failed, setFailed] = useState(false)
  const initials = (username || '?').slice(0, 2).toUpperCase()
  const src = proxyUrl(avatar)

  if (failed || !src) {
    return (
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%',
        backgroundColor: '#2a2a3a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: '700', color: '#a855f7',
        flexShrink: 0,
      }}>
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={username}
      onError={() => setFailed(true)}
      style={{
        width: '52px', height: '52px', borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
        border: '2px solid #2a2a3a',
      }}
    />
  )
}

export default function ProfileCard({ lead, onMarcarCliente, onGerarSite }) {
  const [bioExpanded, setBioExpanded] = useState(false)

  const hasBio = lead.bio && lead.bio.trim().length > 0
  const bioLong = hasBio && lead.bio.length > 120

  return (
    <div style={{
      backgroundColor: '#1c1c26',
      border: '1px solid #2a2a3a',
      borderRadius: '12px',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(168,85,247,0.1), 0 4px 20px rgba(168,85,247,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#2a2a3a'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Avatar avatar={lead.avatar} username={lead.username} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <a
              href={lead.profileLink}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '14px', fontWeight: '700', color: '#e2e8f0',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#a855f7'}
              onMouseLeave={e => e.currentTarget.style.color = '#e2e8f0'}
            >
              @{lead.username}
              <ExternalLink size={12} style={{ opacity: 0.5 }} />
            </a>
            {lead.isVerified === 'Yes' && (
              <span title="Verificado" style={{ color: '#3b82f6' }}><BadgeCheck size={14} /></span>
            )}
            {lead.isBusiness === 'YES' && (
              <span style={{
                backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6',
                fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '4px',
                border: '1px solid rgba(59,130,246,0.3)',
              }}>BIZ</span>
            )}
            {lead.isPrivate === 'YES' && (
              <span style={{
                backgroundColor: 'rgba(100,116,139,0.15)', color: '#64748b',
                fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '4px',
                border: '1px solid rgba(100,116,139,0.25)',
                display: 'flex', alignItems: 'center', gap: '3px',
              }}>
                <Lock size={9} />PRIVADO
              </span>
            )}
          </div>
          {lead.fullName && (
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lead.fullName}
            </div>
          )}
          {lead.category && (
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{lead.category}</div>
          )}
        </div>
        <EngajamentoBadge followers={lead.followers} following={lead.following} posts={lead.posts} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: '4px',
        backgroundColor: '#0f0f13', borderRadius: '8px', padding: '10px 12px',
      }}>
        <Stat icon={<Users size={13} />} label="Seguidores" value={formatNum(lead.followers)} />
        <div style={{ width: '1px', backgroundColor: '#2a2a3a' }} />
        <Stat icon={<UserCheck size={13} />} label="Seguindo" value={formatNum(lead.following)} />
        <div style={{ width: '1px', backgroundColor: '#2a2a3a' }} />
        <Stat icon={<FileText size={13} />} label="Posts" value={formatNum(lead.posts)} />
      </div>

      {/* Bio */}
      {hasBio && (
        <div>
          <div style={{
            fontSize: '12px', color: '#94a3b8', lineHeight: '1.5',
            overflow: bioExpanded ? 'visible' : 'hidden',
            display: bioExpanded ? 'block' : '-webkit-box',
            WebkitLineClamp: bioExpanded ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            whiteSpace: 'pre-wrap',
          }}>
            {lead.bio}
          </div>
          {bioLong && (
            <button
              onClick={() => setBioExpanded(!bioExpanded)}
              style={{
                background: 'none', border: 'none', padding: '2px 0', marginTop: '4px',
                fontSize: '11px', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '3px',
                cursor: 'pointer',
              }}
            >
              {bioExpanded ? <><ChevronUp size={12} /> Ver menos</> : <><ChevronDown size={12} /> Ver mais</>}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
        {lead.externalUrl ? (
          <a
            href={lead.externalUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)',
              color: '#a855f7', fontSize: '11px', fontWeight: '500',
              padding: '6px 10px', borderRadius: '6px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(168,85,247,0.15)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(168,85,247,0.08)'}
          >
            <ExternalLink size={11} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {lead.externalUrl.replace(/^https?:\/\//, '')}
            </span>
          </a>
        ) : (
          <div style={{
            flex: 1, fontSize: '11px', color: '#64748b',
            padding: '6px 10px',
          }}>
            — sem link na bio
          </div>
        )}
        {lead.phone && (
          <a
            href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            title="Chamar no WhatsApp"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#22c55e', color: '#fff',
              border: 'none', borderRadius: '6px',
              width: '32px', height: '28px', flexShrink: 0,
              transition: 'background-color 0.15s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#16a34a'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#22c55e'}
          >
            <MessageCircle size={14} />
          </a>
        )}

        {onGerarSite && (
          <button
            onClick={() => onGerarSite(lead)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              backgroundColor: '#7c3aed', color: '#fff',
              border: 'none', borderRadius: '6px',
              fontSize: '11px', fontWeight: '600',
              padding: '6px 12px', flexShrink: 0,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
          >
            <Globe size={12} />
            Gerar Site
          </button>
        )}
        <button
          onClick={() => onMarcarCliente(lead)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            backgroundColor: '#a855f7', color: '#fff',
            border: 'none', borderRadius: '6px',
            fontSize: '11px', fontWeight: '600',
            padding: '6px 12px', flexShrink: 0,
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#9333ea'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#a855f7'}
        >
          <UserPlus size={12} />
          Cliente
        </button>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '10px' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>{value}</div>
    </div>
  )
}
