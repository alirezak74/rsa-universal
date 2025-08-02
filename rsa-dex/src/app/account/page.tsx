'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function AccountPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to wallet page where account info is shown
    router.push('/wallet')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Redirecting to Wallet...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your account information is available on the Wallet page. Redirecting you now.
          </p>
        </div>
      </div>
    </div>
  )
}