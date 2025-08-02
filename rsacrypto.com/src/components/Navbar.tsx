import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <span className="font-bold text-xl">RSA Chain</span>
        </Link>
        <div className="space-x-4">
          <Link href="/network">Network</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/wallet">Wallet</Link>
          <Link href="/developers">Developers</Link>
          <Link href="/contact">Contact</Link>
                      <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 font-semibold">Admin</a>
        </div>
      </div>
    </nav>
  )
} 