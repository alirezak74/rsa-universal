import React from 'react';

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-800">Help & Wallet Setup Guide</h1>

      {/* RSA Chain Network Details */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">RSA Chain Network Configuration</h2>
        <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-2">
          <div className="text-sm text-gray-800">
            <div className="mb-2 text-blue-900 font-semibold">For use with MetaMask, WalletConnect, and compatible wallets:</div>
            <div className="flex justify-between"><span className="font-medium">Network Name:</span> <span className="font-mono">RSA Chain</span></div>
            <div className="flex justify-between"><span className="font-medium">RPC URL:</span> <span className="font-mono">https://rpc.rsachain.com</span></div>
            <div className="flex justify-between"><span className="font-medium">Chain ID:</span> <span className="font-mono">12345</span></div>
            <div className="flex justify-between"><span className="font-medium">Currency Symbol:</span> <span className="font-mono">RSA</span></div>
            <div className="flex justify-between"><span className="font-medium">Block Explorer:</span> <a href="https://explorer.rsachain.com" className="text-blue-700 underline font-mono" target="_blank" rel="noopener noreferrer">explorer.rsachain.com</a></div>
          </div>
        </div>
        <div className="text-xs text-gray-600 mb-2">Use these settings to add RSA Chain to MetaMask or any EVM-compatible wallet. The block explorer lets you view transactions and account balances.</div>
      </section>

      {/* Stellar Network Details */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Stellar Network Configuration</h2>
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mb-2">
          <div className="text-sm text-gray-800">
            <div className="mb-2 text-yellow-900 font-semibold">For use with Stellar wallets and explorers:</div>
            <div className="flex justify-between"><span className="font-medium">Network Name:</span> <span className="font-mono">Stellar Public Network</span></div>
            <div className="flex justify-between"><span className="font-medium">Horizon URL:</span> <span className="font-mono">https://horizon.stellar.org</span></div>
            <div className="flex justify-between"><span className="font-medium">Network Passphrase:</span> <span className="font-mono">Public Global Stellar Network ; September 2015</span></div>
            <div className="flex justify-between"><span className="font-medium">Currency Symbol:</span> <span className="font-mono">XLM</span></div>
            <div className="flex justify-between"><span className="font-medium">Block Explorer:</span> <a href="https://stellar.expert/explorer/public" className="text-yellow-700 underline font-mono" target="_blank" rel="noopener noreferrer">stellar.expert/explorer/public</a></div>
          </div>
        </div>
        <div className="text-xs text-gray-600 mb-2">Use these settings for Stellar wallets, SDKs, and to view your account on the Stellar public network. The block explorer lets you view transactions and balances for any Stellar address.</div>
      </section>

      {/* Wallet Setup Instructions */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Wallet Setup</h2>
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">MetaMask (Browser & Mobile)</h3>
          <ol className="list-decimal ml-6 text-gray-700 space-y-1">
            <li>Open MetaMask and go to <b>Settings → Networks → Add Network</b></li>
            <li>Enter the RSA Chain network configuration above</li>
            <li>Export your private key from RSA DEX and import it into MetaMask</li>
            <li>Switch to the RSA Chain network in MetaMask</li>
          </ol>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">WalletConnect Compatible Wallets</h3>
          <ol className="list-decimal ml-6 text-gray-700 space-y-1">
            <li>Open your wallet's WalletConnect feature</li>
            <li>Scan the QR code from RSA DEX</li>
            <li>Add RSA Chain as a custom network (use the config above)</li>
            <li>Approve the connection</li>
          </ol>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">Hardware Wallets (Ledger, Trezor)</h3>
          <ol className="list-decimal ml-6 text-gray-700 space-y-1">
            <li>Check if RSA Chain has a dedicated app in Ledger Live or Trezor Suite</li>
            <li>Connect via WalletConnect or direct connection</li>
            <li>Ensure you are on the RSA Chain network</li>
          </ol>
        </div>
        <a href="/wallet" className="text-blue-700 underline text-xs font-medium" target="_blank" rel="noopener noreferrer">Full Wallet Setup Guide</a>
      </section>

      {/* Troubleshooting, Security, FAQ, Support (unchanged) */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li><b>Invalid Network:</b> Double-check the network config and chain ID</li>
          <li><b>Insufficient Balance:</b> Make sure you have enough RSA for gas fees</li>
          <li><b>Transaction Failed:</b> Check network connectivity and gas settings</li>
          <li><b>Wallet Not Showing:</b> Refresh the page or reconnect your wallet</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Security Best Practices</h2>
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li>Never share your private key</li>
          <li>Store your backup securely offline</li>
          <li>Use hardware wallets for large balances</li>
          <li>Always verify the network you are connected to</li>
          <li>Start with small test transactions</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
        <div className="mb-2"><b>Q:</b> Can I use my wallet in MetaMask?<br/><b>A:</b> Yes! Just import your private key and add the RSA Chain network.</div>
        <div className="mb-2"><b>Q:</b> What if I lose my private key?<br/><b>A:</b> You cannot recover your funds. Always back up your key securely.</div>
        <div className="mb-2"><b>Q:</b> Where can I get support?<br/><b>A:</b> See below for support links.</div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Support</h2>
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li>Discord: <a href="https://discord.gg/rsachain" className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">Join our Discord</a></li>
          <li>Email: <a href="mailto:support@rsachain.com" className="text-blue-700 underline">support@rsachain.com</a></li>
          <li>Status: <a href="https://status.rsachain.com" className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">Network Status</a></li>
        </ul>
      </section>
    </div>
  );
} 