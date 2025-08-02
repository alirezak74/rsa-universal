export default function FeatureSection() {
  return (
    <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="p-6 bg-white dark:bg-gray-900 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Fast Payments</h2>
        <p>Near-instant settlement and low fees for global transactions.</p>
      </div>
      <div className="p-6 bg-white dark:bg-gray-900 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">FBA Consensus</h2>
        <p>Federated Byzantine Agreement for secure, decentralized consensus.</p>
      </div>
      <div className="p-6 bg-white dark:bg-gray-900 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Asset Issuance</h2>
        <p>Issue, manage, and transfer digital assets with ease.</p>
      </div>
    </section>
  )
} 