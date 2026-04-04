'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Loader2, FileText, Copy, Eye, Edit3, Send, Save,
  Trash2, CheckCircle, Globe, RefreshCw, BookOpen, ExternalLink, Check
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

interface GeneratedArticle {
  title: string
  slug: string
  content: string
  meta_description: string
  keywords: string[]
  faq: { question: string; answer: string }[]
  suggested_articles: string[]
}

interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  cover_image: string
  published: boolean
  created_at: string
  updated_at: string
}

const ARTICLE_TYPES = [
  'Guide d\'import par pays',
  'Comparatif véhicules',
  'Top/Classement',
  'Actualité marché',
  'Guide marque',
  'Témoignage client (story)',
  'Prix réel livré (décomposition coûts)',
  'Erreurs à éviter',
  'FAQ thématique',
  'Fiche modèle détaillée',
  'Chine vs Europe vs Japon',
  'Guide douane par pays',
  'Guide financement/diaspora',
]

const COUNTRIES = [
  'Sénégal', 'Côte d\'Ivoire', 'Burkina Faso', 'Mali', 'Bénin',
  'Cameroun', 'Ghana', 'Diaspora Europe', 'Général',
]

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-[#111827] mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[#111827] mt-8 mb-3 pl-3 border-l-4 border-brand-500">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[#111827] mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-brand-500/30 bg-gray-50 px-4 py-3 my-4 text-gray-600 italic rounded-r-lg">$1</blockquote>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 text-gray-600">$1</li>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.replace(/^\| | \|$/g, '').split(' | ')
      return '<tr class="even:bg-gray-50">' + cells.map(c =>
        c.trim().startsWith('---')
          ? ''
          : `<td class="border border-gray-200 px-3 py-2 text-sm text-gray-700">${c.trim()}</td>`
      ).join('') + '</tr>'
    })
    .replace(/^(?!<[hluotb])((?!<).+)$/gm, '<p class="text-gray-600 leading-relaxed mb-3">$1</p>')
    .replace(new RegExp('(<li[\\s\\S]*?</li>)', 'g'), '<ul class="list-disc space-y-1 mb-4 pl-2">$1</ul>')
    .replace(new RegExp('(<tr[\\s\\S]*?</tr>(?:\\s*<tr[\\s\\S]*?</tr>)*)', 'g'),
      '<div class="overflow-x-auto mb-4"><table class="w-full border-collapse border border-gray-200 rounded-lg text-sm">$1</table></div>')
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BlogAITab() {
  const [view, setView] = useState<'generate' | 'articles'>('generate')

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-100 pb-3">
        <button
          onClick={() => setView('generate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'generate' ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Générer un article
        </button>
        <button
          onClick={() => setView('articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'articles' ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Mes articles
        </button>
      </div>

      {view === 'generate' && <GenerateView />}
      {view === 'articles' && <ArticlesListView />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Generate View
// ---------------------------------------------------------------------------

function GenerateView() {
  const [articleType, setArticleType] = useState(ARTICLE_TYPES[0])
  const [subject, setSubject] = useState('')
  const [keyword, setKeyword] = useState('')
  const [country, setCountry] = useState('Général')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [generateFaq, setGenerateFaq] = useState(true)
  const [generateTable, setGenerateTable] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [article, setArticle] = useState<GeneratedArticle | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const inputClass = 'w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  async function handleGenerate() {
    if (!subject.trim()) { toast.error('Entrez un sujet'); return }
    setGenerating(true)
    setArticle(null)
    setPublishedSlug(null)
    setProgress(0)

    // Animated progress
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 8, 90))
    }, 500)

    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleType, subject, keyword, country, length, generateFaq, generateTable }),
      })

      clearInterval(interval)
      setProgress(100)

      const data = await res.json().catch(() => null)

      if (!res.ok || !data) {
        toast.error(data?.error || `Erreur ${res.status}. Réessayez.`)
        setGenerating(false)
        setProgress(0)
        return
      }

      setArticle(data)
      setEditContent(data.content || '')
      toast.success('Article généré !')
    } catch (err) {
      clearInterval(interval)
      toast.error(err instanceof Error ? err.message : 'Erreur réseau')
    }
    setGenerating(false)
    setTimeout(() => setProgress(0), 500)
  }

  async function handleSave(published: boolean) {
    if (!article) return

    if (published && !confirm('Publier cet article sur le blog ?')) return

    setSaving(true)

    const content = editMode ? editContent : article.content

    const faqJsonLd = article.faq?.length ? JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faq.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    }) : null

    const fullContent = faqJsonLd
      ? `${content}\n\n<!-- FAQ JSON-LD -->\n<script type="application/ld+json">${faqJsonLd}</script>`
      : content

    const { error } = await supabase.from('blog_posts').upsert({
      slug: article.slug,
      title: article.title,
      content: fullContent,
      cover_image: coverImage || '',
      published,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'slug' })

    setSaving(false)

    if (error) {
      toast.error('Erreur: ' + error.message)
    } else {
      toast.success(published ? 'Article publié !' : 'Brouillon enregistré')
      if (published) setPublishedSlug(article.slug)
    }
  }

  const displayContent = editMode ? editContent : (article?.content || '')
  const wordCount = countWords(displayContent)

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-[#111827] mb-4">Générer un article</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Type d&apos;article</label>
            <select value={articleType} onChange={e => setArticleType(e.target.value)} className={inputClass}>
              {ARTICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Pays cible</label>
            <select value={country} onChange={e => setCountry(e.target.value)} className={inputClass}>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Sujet *</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className={inputClass} placeholder="ex: BYD Seal vs Tesla Model 3" />
          </div>
          <div>
            <label className={labelClass}>Mot-clé principal SEO</label>
            <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} className={inputClass} placeholder="ex: importer voiture chine sénégal" />
          </div>
          <div>
            <label className={labelClass}>Longueur</label>
            <select value={length} onChange={e => setLength(e.target.value as 'short' | 'medium' | 'long')} className={inputClass}>
              <option value="short">Court (~800 mots)</option>
              <option value="medium">Moyen (~1500 mots)</option>
              <option value="long">Long (~2500 mots)</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={generateFaq} onChange={e => setGenerateFaq(e.target.checked)} className="rounded border-gray-300" />
              Générer FAQ automatique
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={generateTable} onChange={e => setGenerateTable(e.target.checked)} className="rounded border-gray-300" />
              Générer tableau comparatif
            </label>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !subject.trim()}
          className="mt-5 flex items-center justify-center gap-2 h-11 px-6 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</> : <><FileText className="w-4 h-4" /> Générer l&apos;article</>}
        </button>

        {/* Progress bar */}
        {generating && (
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Result */}
      {article && (
        <div className="space-y-5">
          {/* Title & Meta */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-xl font-bold text-[#111827] mb-1">{article.title}</h2>
            <p className="text-sm text-gray-600 mb-3">{article.meta_description}</p>
            <p className="text-xs text-gray-400 mb-3">Slug: /{article.slug}</p>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {article.keywords?.map((kw, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-brand-500/10 text-brand-500 rounded-full font-medium">{kw}</span>
              ))}
            </div>

            {/* Cover image URL */}
            <div className="mb-4">
              <label className={labelClass}>Image de couverture (URL, optionnel)</label>
              <input type="url" value={coverImage} onChange={e => setCoverImage(e.target.value)} className={inputClass} placeholder="https://..." />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                {editMode ? <><Eye className="w-4 h-4" /> Aperçu</> : <><Edit3 className="w-4 h-4" /> Modifier</>}
              </button>
              <CopyButton text={displayContent} label="Copier markdown" />
              <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publier
              </button>
              <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" /> Brouillon
              </button>
            </div>

            {/* Published link */}
            {publishedSlug && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href={`/blog/${publishedSlug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-700 font-medium hover:underline flex items-center gap-1">
                  Voir l&apos;article sur le blog <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Content preview / edit */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#111827]">Contenu</h3>
              <span className="text-xs text-gray-400">{wordCount} mots</span>
            </div>

            {/* Cover image preview */}
            {coverImage && !editMode && (
              <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 aspect-[2/1]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="Couverture" className="w-full h-full object-cover" />
              </div>
            )}

            {editMode ? (
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full h-[500px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              />
            ) : (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(displayContent) }}
              />
            )}
          </div>

          {/* FAQ */}
          {article.faq?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-[#111827] mb-3">FAQ ({article.faq.length} questions)</h3>
              <div className="space-y-3">
                {article.faq.map((f, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-[#111827] mb-1">{f.question}</p>
                    <p className="text-sm text-gray-600">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested articles */}
          {article.suggested_articles?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-[#111827] mb-3">Articles suggérés</h3>
              <ul className="space-y-2">
                {article.suggested_articles.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4 text-brand-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Copy Button with "Copié !" feedback
// ---------------------------------------------------------------------------

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copié !')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
      {copied ? <><Check className="w-4 h-4 text-emerald-600" /> Copié !</> : <><Copy className="w-4 h-4" /> {label}</>}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Articles List View
// ---------------------------------------------------------------------------

function ArticlesListView() {
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchArticles() {
    setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setArticles(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchArticles() }, [])

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('blog_posts').update({ published: !current, updated_at: new Date().toISOString() }).eq('id', id)
    toast.success(!current ? 'Article publié' : 'Article dépublié')
    fetchArticles()
  }

  async function deleteArticle(id: string) {
    if (!confirm('Supprimer cet article ?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    toast.success('Article supprimé')
    fetchArticles()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#111827]">Articles blog ({articles.length})</h3>
        <button onClick={fetchArticles} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>Aucun article pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(a => (
            <div key={a.id} className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-[#111827] truncate">{a.title}</h4>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${a.published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {a.published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">/{a.slug} &middot; {new Date(a.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {a.published && (
                  <a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-500/5 transition-colors" title="Voir">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => togglePublish(a.id, a.published)} className="p-2 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-500/5 transition-colors" title={a.published ? 'Dépublier' : 'Publier'}>
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button onClick={() => deleteArticle(a.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
