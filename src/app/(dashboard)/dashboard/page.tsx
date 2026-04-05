'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { API_URL, authFetch } from '@/lib/api'

interface Event {
  id: string
  name: string
  date: string
  slug: string
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    authFetch(`\${API_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setError('Erro ao carregar eventos'))
      .finally(() => setLoading(false))
  }, [])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Meus Eventos</h2>
        <Link href="/eventos/novo" className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
          + Novo Evento
        </Link>
      </div>
      {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}
      {events.length === 0 ? (
        <p className="text-center py-16 text-gray-500">Nenhum evento criado ainda.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link href={`\/eventos/\${event.id}`} className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{event.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(event.date)}</p>
                  </div>
                  <span className="text-pink-400 text-lg">›</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}