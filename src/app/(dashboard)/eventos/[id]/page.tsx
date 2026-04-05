'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ItemManager, { Item } from './ItemManager'
import { API_URL, authFetch } from '@/lib/api'

interface EventDetail {
  id: string
  name: string
  date: string
  slug: string
  items: Item[]
  guests: { id: string; name: string; phone: string }[]
}

export default function EventoPainelPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchEvent = useCallback(() => {
    setLoading(true)
    authFetch(`${API_URL}/api/events/${id}`)
      .then((res) => {
        if (!res.ok) { setError('Evento não encontrado'); return null }
        return res.json()
      })
      .then((data) => {
        if (data?.event) setEvent(data.event)
      })
      .catch(() => setError('Erro ao carregar evento'))
      .finally(() => setLoading(false))
  }, [id, router])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  async function copyLink() {
    if (!event) return
    const url = `${window.location.origin}/lista/${event.slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>
  if (error) return <p role="alert" className="text-red-600">{error}</p>
  if (!event) return null

  const totalItems = event.items.length
  const reservedItems = event.items.filter((i) => i.reservation !== null).length
  const availableItems = totalItems - reservedItems
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/lista/${event.slug}`

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Meus Eventos
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{event.name}</h2>
          <p className="text-gray-500 text-sm">{formatDate(event.date)}</p>
        </div>
        <Link
          href={`/eventos/${id}/editar`}
          className="text-sm text-pink-500 hover:text-pink-700 border border-pink-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          Editar evento
        </Link>
      </div>

      {/* Share link */}
      <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-pink-700 mb-2">Link de compartilhamento</p>
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-sm text-pink-800 bg-white border border-pink-200 rounded px-2 py-1 flex-1 min-w-0 truncate">
            {shareUrl}
          </code>
          <button
            onClick={copyLink}
            className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            {copied ? '✓ Copiado!' : 'Copiar link'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
          <p className="text-xs text-gray-500 mt-1">Total de itens</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{reservedItems}</p>
          <p className="text-xs text-gray-500 mt-1">Reservados</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{availableItems}</p>
          <p className="text-xs text-gray-500 mt-1">Disponíveis</p>
        </div>
      </div>

      {/* Items */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Itens da lista</h3>
        <ItemManager eventId={id} items={event.items} onItemsChange={fetchEvent} />
      </section>

      {/* Confirmed guests */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Convidados confirmados ({event.guests.length})
        </h3>
        {event.guests.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum convidado confirmou presença ainda.</p>
        ) : (
          <ul className="space-y-2">
            {event.guests.map((guest) => (
              <li key={guest.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <span className="font-medium text-gray-800">{guest.name}</span>
                <span className="text-sm text-gray-500">{guest.phone}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
