'use client'

import { useState } from 'react'
import { API_URL } from '@/lib/api'

interface PublicItem {
  id: string
  name: string
  description: string | null
}

interface ReserveModalProps {
  slug: string
  item: PublicItem
  onSuccess: () => void
  onClose: () => void
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function ReserveModal({ slug, item, onSuccess, onClose }: ReserveModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhone(e.target.value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (name.trim().length < 2) {
      setError('Nome deve ter no mínimo 2 caracteres')
      return
    }

    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 11) {
      setError('Telefone inválido. Use formato brasileiro com DDD (ex: (11) 99999-9999)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/lista/${slug}/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          guestName: name.trim(),
          guestPhone: digits,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || 'Erro ao reservar item')
        return
      }

      setSuccess(true)
      setTimeout(() => onSuccess(), 1200)
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {success ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Reserva confirmada!</h2>
            <p className="text-gray-500 text-sm">
              Você reservou <strong>{item.name}</strong>.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Reservar item</h2>
                <p className="text-sm text-gray-500 mt-0.5">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="reserve-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Seu nome
                </label>
                <input
                  id="reserve-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mínimo 2 caracteres"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label htmlFor="reserve-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (com DDD)
                </label>
                <input
                  id="reserve-phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {error && (
                <p role="alert" className="text-red-600 text-sm">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Reservando...' : 'Confirmar reserva'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
