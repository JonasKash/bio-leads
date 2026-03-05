import { useState } from 'react'
import { Search, Loader2, CheckCircle, AlertCircle, UserPlus, Zap } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'

const API_TOKEN = import.meta.env.VITE_APIFY_TOKEN
const ACTOR_ID = 'dSCLg0C3YEZ83HzYX' // instagram-profile-scraper

export default function ApifyScraper({ onAddOrUpdateLeads }) {
  const isMobile = useIsMobile()
  const [usernames, setUsernames] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleRunScraper() {
    if (!usernames.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(false)
    setResults([])

    try {
      const list = usernames
        .split(/[\n,]+/)
        .map(u => u.trim().replace(/^@/, ''))
        .filter(Boolean)

      if (list.length === 0) throw new Error('Nenhum username válido inserido.')

      // Usando fetch diretamente para evitar dependências de Node do apify-client
      const response = await fetch(`https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?token=${API_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: list,
          includeAboutSection: false
        })
      });

      if (!response.ok) throw new Error('Falha ao iniciar extração no Apify.');

      const run = await response.json();

      // Polling para esperar o resultado (simplificado)
      let items = [];
      let attempts = 0;
      while (attempts < 60) { // Max 2 minutos de espera
        const runId = run?.id || run?.data?.id;
        if (!runId) throw new Error('ID da execução não encontrado na resposta do Apify.');

        const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${API_TOKEN}`);
        const statusData = await statusRes.json();
        const runData = statusData?.data || statusData;

        if (!runData) throw new Error('Não foi possível obter o status da execução.');

        if (runData.status === 'SUCCEEDED') {
          const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${runData.defaultDatasetId}/items?token=${API_TOKEN}`);
          items = await datasetRes.json();
          break;
        } else if (runData.status === 'FAILED' || runData.status === 'ABORTED' || runData.status === 'TIMED-OUT') {
          throw new Error('Extração falhou ou expirou no servidor do Apify.');
        }

        await new Promise(r => setTimeout(r, 2000));
        attempts++;
      }

      if (items.length === 0) {
        setError('Nenhum dado encontrado ou tempo esgotado.');
        return;
      }

      const formatted = items.map(item => {
        let avgLikes = 0
        let avgComments = 0
        if (item.latestPosts && item.latestPosts.length > 0) {
          const validPosts = item.latestPosts.filter(p => p.likesCount !== null && p.likesCount !== undefined)
          if (validPosts.length > 0) {
            const totalLikes = validPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0)
            const totalComments = validPosts.reduce((acc, p) => acc + (p.commentsCount || 0), 0)
            avgLikes = totalLikes / validPosts.length
            avgComments = totalComments / validPosts.length
          }
        }

        const followers = item.followersCount || 0
        const realEng = followers > 0
          ? (((avgLikes + avgComments) / followers) * 100).toFixed(2)
          : "0.00"

        return {
          id: item.id,
          username: item.username,
          fullName: item.fullName,
          avatar: item.profilePicUrlHD || item.profilePicUrl,
          bio: item.biography,
          followers: item.followersCount,
          following: item.followsCount,
          posts: item.postsCount,
          externalUrl: item.externalUrl,
          profileLink: item.url,
          isVerified: item.verified ? 'Yes' : 'No',
          isBusiness: item.isBusinessAccount ? 'YES' : 'NO',
          isPrivate: item.private ? 'YES' : 'NO',
          category: item.businessCategoryName,
          realEng: realEng,
          avgLikes,
          avgComments
        }
      })

      setResults(formatted)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Erro ao executar scraper.')
    } finally {
      setLoading(false)
    }
  }

  function handleImport() {
    if (results.length === 0) return
    onAddOrUpdateLeads(results)
    setSuccess(true)
    setResults([])
    setUsernames('')
    setTimeout(() => setSuccess(false), 3000)
  }

  const containerStyle = {
    padding: isMobile ? '12px' : '28px 32px',
    maxWidth: '1000px',
    margin: '0 auto',
    color: '#e2e8f0'
  }

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={24} color="#a855f7" fill="#a855f7" /> Extrair via Apify
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
          Busque dados reais e atualize o engajamento de perfis no Instagram.
        </p>
      </div>

      <div style={{
        backgroundColor: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px',
        marginBottom: '24px'
      }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>
          Usernames do Instagram
        </label>
        <textarea
          value={usernames}
          onChange={e => setUsernames(e.target.value)}
          placeholder="Ex: brunamalucelli (um por linha)"
          style={{
            width: '100%', minHeight: '100px', backgroundColor: '#0f0f13', border: '1px solid #2a2a3a',
            borderRadius: '8px', padding: '12px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
            resize: 'vertical', marginBottom: '16px'
          }}
        />

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleRunScraper}
            disabled={loading || !usernames.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#a855f7', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '8px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
            {loading ? 'Extraindo...' : 'Iniciar Extração'}
          </button>

          {results.length > 0 && !loading && (
            <button
              onClick={handleImport}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)',
                padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              <UserPlus size={18} /> Sincronizar {results.length} Leads
            </button>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '16px', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {results.map(r => (
            <div key={r.id || r.username} style={{ backgroundColor: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <img src={r.avatar} alt={r.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{r.username}</div>
                  <div style={{ color: '#22c55e', fontSize: '12px', fontWeight: '600' }}>{r.realEng}% Engajamento</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {success && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#22c55e' }}>
          <CheckCircle size={40} style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: '600' }}>Sincronizado com sucesso!</div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}
