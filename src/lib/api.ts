export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://191.252.184.121:5900'

export function authFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}
