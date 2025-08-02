# RSA DEX - Decentralized Exchange

A modern, feature-rich decentralized exchange (DEX) built for the RSA Chain ecosystem. Trade cryptocurrencies with advanced tools, real-time data, and seamless wallet integration.

## 🚀 Features

### Core Trading
- **Spot Trading**: Buy and sell cryptocurrencies with real-time order execution
- **Advanced Order Types**: Market, limit, and stop orders
- **Real-time Order Book**: Live bid/ask displays with depth visualization
- **Trading Charts**: Interactive candlestick charts with technical indicators
- **Recent Trades**: Live trade history and market activity

### Multi-Asset Support
- **RSA Chain (RSA)**: Native network asset with full functionality
- **Ethereum (ETH)**: Complete trading and wallet support
- **Bitcoin (BTC)**: All features working identically
- **Tether USD (USDT)**: Stablecoin support with smart contracts
- **Extensible**: Easy addition of new assets through admin sync

### Wallet Integration
- **Multi-Provider Support**: RSA Wallet, Freighter, Albedo, Ledger
- **Secure Connections**: Industry-standard security protocols
- **Real-time Balances**: Live balance tracking and portfolio management
- **Transaction History**: Complete transaction logs with filtering

### Admin Synchronization
- **Asset Sync**: Automatic synchronization with RSA DEX Admin
- **Price Feeds**: Real-time price updates from CoinGecko API
- **Visibility Controls**: Asset visibility based on admin settings
- **Status Management**: Automatic handling of active/inactive assets

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand with persistence
- **Icons**: Lucide React
- **API Integration**: CoinGecko, Custom Admin API
- **Blockchain**: Stellar SDK for wallet operations

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd rsa-dex

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

## 🔧 Configuration

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3001
NEXT_PUBLIC_DEX_API_URL=http://localhost:3002
NEXT_PUBLIC_RSA_NETWORK_URL=https://rsa-chain-network.com
NEXT_PUBLIC_RSA_HORIZON_URL=https://horizon.rsa-chain.com
```

## 🚀 Development

```bash
# Start development server on port 3002
PORT=3002 npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📊 Page Structure

### Main Pages
- **Home (`/`)**: Trading dashboard with all components
- **Exchange (`/exchange`)**: Advanced trading interface
- **Markets (`/markets`)**: Asset listings and market overview
- **Wallet (`/wallet`)**: Portfolio management and balances

### Navigation Pages
- **Login**: Redirects to home (wallet connection is global)
- **Account**: Redirects to wallet page
- **Buy/Swap**: Redirects to exchange page

## 🔌 API Integration

### RSA DEX Admin Sync
The application automatically syncs with RSA DEX Admin:

```typescript
// Fetch assets from admin
const response = await fetch(`${adminUrl}/api/admin/assets`)

// Sync prices from CoinGecko
const priceData = await fetch(
  `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`
)
```

### Real-time Updates
- **Price Updates**: Every 30 seconds
- **Order Book**: Every 5 seconds  
- **Trade History**: Every 5 seconds
- **Balance Sync**: On wallet connection and manual refresh

## 🎨 Components

### Core Components
- **Header**: Navigation and wallet connection
- **TradingView**: Interactive price charts
- **OrderBook**: Real-time bid/ask display
- **TradingForm**: Order placement interface
- **RecentTrades**: Live trade history
- **TradingPairs**: Asset pair selection
- **WalletConnect**: Multi-provider wallet connection

### Store Management
- **TradingStore**: Assets, pairs, orders, trades
- **WalletStore**: Wallet connection and balances

## 🔐 Security Features

- **Content Security Policy**: Configurable CSP for production
- **Safe Storage**: Error-handling for localStorage restrictions
- **Input Validation**: Comprehensive form validation
- **Error Boundaries**: Graceful error handling
- **Demo Mode**: Fallback when APIs are unavailable

## 📱 Responsive Design

- **Mobile-First**: Optimized for all screen sizes
- **Dark Mode**: Complete dark/light theme support
- **Touch-Friendly**: Mobile-optimized interactions
- **Grid Layouts**: Responsive component arrangements

## 🚦 Status

✅ **Fully Operational**
- All build errors resolved
- CSP issues fixed
- Merge conflicts resolved
- Complete admin synchronization
- Real-time trading functionality
- Multi-wallet support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the configuration
- Test with demo data
- Contact the development team

---

**Built with ❤️ for the RSA Chain ecosystem** 