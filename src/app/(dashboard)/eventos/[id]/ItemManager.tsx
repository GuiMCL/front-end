'use client'

import { useState } from 'react'
import { API_URL, authFetch } from '@/lib/api'

export interface Item {
  id: string
  name: string
  description: string | null
  reservation: {
    id: string
    guestName: string
    guestPhone: string
  } | null
}

interface ItemManagerProps {
  eventId: string
  items: Item[]
  onItemsChange: () => void
}

export default function ItemManager({ eventId, items, onItemsChange }: ItemManagerProps) {
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmReservedId, setConfirmReservedId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')

    if (!newName.trim()) {
      setAddError('Nome do item é obrigatório')
      return
    }

    setAdding(true)
    try {
      const res = await authFetch(`${API_URL}/api/events/${eventId}/items`, {
        method: 'POST',
        body: JSON.stringify({ name: newName, description: newDescription || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        setAddError(data.error || 'Erro ao adicionar item')
        return
      }

      setNewName('')
      setNewDescription('')
      onItemsChange()
    } catch {
      setAddError('Erro ao conectar com o servidor')
    } finally {
      setAdding(false)
    }
  }

  function startEdit(item: Item) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditDescription(item.description ?? '')
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
  }

  async function handleSaveEdit(itemId: string) {
    setEditError('')

    if (!editName.trim()) {
      setEditError('Nome do item é obrigatório')
      return
    }

    setSaving(true)
    try {
      const res = await authFetch(`${API_URL}/api/events/${eventId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName, description: editDescription || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        setEditError(data.error || 'Erro ao salvar item')
        return
      }

      setEditingId(null)
      onItemsChange()
    } catch {
      setEditError('Erro ao conectar com o servidor')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(itemId: string, force = false) {
    setDeletingId(itemId)
    try {
      const url = `${API_URL}/api/events/${eventId}/items/${itemId}${force ? '?force=true' : ''}`
      const res = await authFetch(url, { method: 'DELETE' })

      if (res.status === 409) {
        // Item is reserved — ask for confirmation
        setConfirmReservedId(itemId)
        return
      }

      if (!res.ok) {
        return
      }

      setConfirmReservedId(null)
      onItemsChange()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Add item form */}
      <form onSubmit={handleAdd} noValidate className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <p className="font-medium text-gray-700 mb-3">Adicionar item</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nome do item *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {adding ? 'Adicionando...' : '+ Adicionar'}
          </button>
        </div>
        {addError && (
          <p role="alert" className="text-red-600 text-sm mt-2">
            {addError}
          </p>
        )}
      </form>

      {/* Item list */}
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">
          Nenhum item na lista ainda. Adicione o primeiro item acima.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="bg-white rounded-xl shadow-sm p-4">
              {editingId === item.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Descrição (opcional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  {editError && (
                    <p role="alert" className="text-red-600 text-sm">
                      {editError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      disabled={saving}
                      className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-800">{item.name}</span>
                      {item.reservation ? (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Reservado por {item.reservation.guestName}
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
                    {item.reservation && (
                      <p className="text-xs text-gray-400 mt-1">
                        Tel: {item.reservation.guestPhone}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      Editar
                    </button>
                    {confirmReservedId === item.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-600">Item reservado. Confirmar?</span>
                        <button
                          onClick={() => handleDelete(item.id, true)}
                          disabled={deletingId === item.id}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors"
                        >
                          Sim, remover
                        </button>
                        <button
                          onClick={() => setConfirmReservedId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === item.id ? '...' : 'Remover'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
