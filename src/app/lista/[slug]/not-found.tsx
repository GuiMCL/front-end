export default function ListaNotFound() {
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
