'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { API_URL, authFetch } from '@/lib/api'

export default function EditarEventoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    authFetch(`${API_URL}/api/events/${id}`)
      .then((res) => {
        if (res.status === 401) { router.push('/login'); return null }
        return res.json()
      })
      .then((data) => {
        if (data?.event) {
          setName(data.event.name)
          // Format date as YYYY-MM-DD for the date input
          setDate(new Date(data.event.date).toISOString().split('T')[0])
        }
      })
      .catch(() => setError('Erro ao carregar evento'))
      .finally(() => setFetching(false))
  }, [id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Nome do evento é obrigatório')
      return
    }
    if (!date) {
      setError('Data do evento é obrigatória')
      return
    }

    setLoading(true)
    try {
      const res = await authFetch(`${API_URL}/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, date }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao atualizar evento')
        return
      }

      router.push(`/eventos/${id}`)
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <p className="text-gray-500">Carregando...</p>

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/eventos/${id}`} className="text-gray-500 hover:text-gray-700">
          ← Voltar
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Editar Evento</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do evento
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Data do evento
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {error && (
            <p role="alert" className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
