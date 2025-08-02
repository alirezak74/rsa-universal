const express = require('express');
const router = express.Router();
const dataStore = require('../../data-store');

function adminOnly(req, res, next) { next(); }

// List all contracts including imported tokens
router.get('/', adminOnly, async (req, res) => {
  try {
    let contracts = [];
    
    // Try to get contracts from database
    try {
      contracts = await prisma.contract.findMany({ include: { tokens: true } });
    } catch (dbError) {
      console.log('📋 CONTRACTS: Database not available, using imported tokens');
    }
    
    // 🪙 ENHANCE: Add contracts from imported tokens
    const persistedTokens = await dataStore.loadImportedTokens();
    console.log(`📋 CONTRACTS: Loading contracts for ${persistedTokens.length} imported tokens`);
    
    const importedContracts = persistedTokens.map((token, index) => ({
      id: `imported_${token.id}`,
      address: token.contract_address || `0x${token.symbol.toLowerCase()}contract${Date.now()}`,
      name: `${token.name} Contract`,
      description: `Imported token contract for ${token.symbol}`,
      status: 'active',
      type: 'ERC20',
      network: (token.networks && token.networks[0]) || 'ethereum',
      symbol: token.symbol,
      tokenName: token.name,
      decimals: token.decimals || 18,
      isImported: true,
      importedToken: true,
      totalSupply: token.totalSupply || 1000000000,
      createdAt: token.created_at,
      updatedAt: token.updated_at || token.created_at,
      metadata: {
        imported: true,
        originalSymbol: token.realSymbol || token.symbol,
        networks: token.networks || ['ethereum']
      },
      tokens: [{
        symbol: token.symbol,
        name: token.name,
        address: token.contract_address || `0x${token.symbol.toLowerCase()}contract${Date.now()}`
      }]
    }));
    
    const allContracts = [...contracts, ...importedContracts];
    
    console.log(`📋 CONTRACTS SUCCESS: ${allContracts.length} total (${contracts.length} database + ${importedContracts.length} imported)`);
    
    // Add default asset contracts for comparison
    const defaultAssets = [
      { symbol: 'BTC', name: 'Bitcoin', network: 'bitcoin' },
      { symbol: 'USDT', name: 'Tether', network: 'ethereum' },
      { symbol: 'ETH', name: 'Ethereum', network: 'ethereum' },
      { symbol: 'RSA', name: 'RSA Chain', network: 'rsa' }
    ];
    
    const defaultContracts = defaultAssets.map(asset => ({
      id: `default_contract_${asset.symbol.toLowerCase()}`,
      address: asset.symbol === 'BTC' ? 'native_bitcoin_address' : `0x${asset.symbol.toLowerCase()}defaultcontract`,
      name: `${asset.name} Contract`,
      description: `Default ${asset.symbol} asset contract`,
      status: 'active',
      type: asset.symbol === 'BTC' ? 'Native' : 'ERC20',
      network: asset.network,
      symbol: asset.symbol,
      tokenName: asset.name,
      decimals: asset.symbol === 'BTC' ? 8 : 18,
      isDefault: true,
      totalSupply: asset.symbol === 'BTC' ? 21000000 : asset.symbol === 'ETH' ? 120000000 : 100000000000,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), // 30 days ago
      updatedAt: new Date().toISOString(),
      tokens: [{
        symbol: asset.symbol,
        name: asset.name,
        address: asset.symbol === 'BTC' ? 'native_bitcoin_address' : `0x${asset.symbol.toLowerCase()}defaultcontract`
      }]
    }));
    
    const allContractsWithDefaults = [...defaultContracts, ...allContracts];
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContracts = allContractsWithDefaults.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedContracts,
        pagination: {
          page,
          limit,
          total: allContractsWithDefaults.length,
          totalPages: Math.ceil(allContractsWithDefaults.length / limit)
        }
      },
      count: allContractsWithDefaults.length,
      imported: importedContracts.length,
      default: defaultContracts.length
    });
    
  } catch (error) {
    console.error('📋 CONTRACTS ERROR:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch contracts' 
    });
  }
});

// Get contract by ID
router.get('/:id', adminOnly, async (req, res) => {
  const contract = await prisma.contract.findUnique({ where: { id: req.params.id }, include: { tokens: true } });
  if (!contract) return res.status(404).json({ error: 'Contract not found' });
  res.json(contract);
});

// Create contract
router.post('/', adminOnly, async (req, res) => {
  const { address, name, status } = req.body;
  const contract = await prisma.contract.create({ data: { address, name, status } });
  res.status(201).json(contract);
});

// Update contract (status)
router.put('/:id', adminOnly, async (req, res) => {
  const { status } = req.body;
  const contract = await prisma.contract.update({ where: { id: req.params.id }, data: { status } });
  res.json(contract);
});

// Delete contract
router.delete('/:id', adminOnly, async (req, res) => {
  await prisma.contract.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

module.exports = router; 