'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import ReserveModal from './ReserveModal'
import PresenceForm from './PresenceForm'
import { API_URL } from '@/lib/api'

interface PublicItem {
  id: string
  name: string
  description: string | null
  reserved: boolean
  reservedBy: string | null
}

interface PublicList {
  event: {
    name: string
    date: string
    slug: string
  }
  items: PublicItem[]
  guestCount: number
}

export default function ListaPublicaPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const [data, setData] = useState<PublicList | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PublicItem | null>(null)
  const [showPresence, setShowPresence] = useState(false)

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/lista/${slug}`)
      if (res.status === 404) {
        setNotFound(true)
        return
      }
      if (!res.ok) {
        setNotFound(true)
        return
      }
      const json = await res.json()
      setData(json)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-pink-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando lista...</p>
      </main>
    )
  }

  if (notFound || !data) {
    return (
      <main className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎁</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Lista não encontrada</h1>
          <p className="text-gray-500">
            O link que você acessou não existe ou foi removido. Verifique com o anfitrião se o link está correto.
          </p>
        </div>
      </main>
    )
  }

  const availableCount = data.items.filter((i) => !i.reserved).length
  const reservedCount = data.items.filter((i) => i.reserved).length

  return (
    <main className="min-h-screen bg-pink-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800">{data.event.name}</h1>
          <p className="text-gray-500 mt-1">{formatDate(data.event.date)}</p>
          {data.guestCount > 0 && (
            <p className="text-sm text-pink-600 mt-2 font-medium">
              {data.guestCount} {data.guestCount === 1 ? 'pessoa confirmada' : 'pessoas confirmadas'}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{availableCount}</p>
            <p className="text-xs text-gray-500 mt-1">Disponíveis</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{reservedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Reservados</p>
          </div>
        </div>

        {/* Items */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Lista de presentes</h2>
          {data.items.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              Nenhum item na lista ainda.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.items.map((item) => (
                <li
                  key={item.id}
                  className={`bg-white rounded-xl shadow-sm p-4 flex items-start justify-between gap-3 ${
                    item.reserved ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-800">{item.name}</span>
                      {item.reserved ? (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Reservado por {item.reservedBy}
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Disponível
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  {!item.reserved && (
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="shrink-0 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Reservar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Confirm presence */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Confirmar presença</h2>
          <p className="text-sm text-gray-500 mb-4">
            Informe seu nome e telefone para confirmar que você vai comparecer ao evento.
          </p>
          {showPresence ? (
            <PresenceForm
              slug={slug}
              onSuccess={() => {
                setShowPresence(false)
                fetchList()
              }}
              onCancel={() => setShowPresence(false)}
            />
          ) : (
            <button
              onClick={() => setShowPresence(true)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Confirmar minha presença
            </button>
          )}
        </section>
      </div>

      {/* Reserve modal */}
      {selectedItem && (
        <ReserveModal
          slug={slug}
          item={selectedItem}
          onSuccess={() => {
            setSelectedItem(null)
            fetchList()
          }}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </main>
  )
}
