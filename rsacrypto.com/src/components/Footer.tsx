export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-300">
        <div>© 2025 RSA Chain</div>
        <div className="space-x-4">
          <a href="https://github.com/rsacrypt/rsachane" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="http://localhost:4000" target="_blank" rel="noopener noreferrer">Explorer</a>
          <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">Wallet</a>
        </div>
      </div>
    </footer>
  )
} 