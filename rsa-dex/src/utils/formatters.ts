// Comprehensive formatting utilities for RSA DEX
// Ensures consistent number display across all components

export const formatPrice = (price: number): string => {
  if (price >= 100000) {
    // For very large prices like BTC (119459.107269 -> 119,459.10)
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } else if (price >= 1000) {
    // For large prices (1234.567890 -> 1,234.57)
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } else if (price >= 1) {
    // For medium prices (12.345678 -> 12.3457)
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    })
  } else if (price >= 0.01) {
    // For small prices (0.123456 -> 0.1235)
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    })
  } else {
    // For very small prices (0.000123 -> 0.000123)
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 8
    })
  }
}

export const formatAmount = (amount: number): string => {
  if (amount >= 1000000) {
    // For millions (1234567.89 -> 1.23M)
    return `${(amount / 1000000).toFixed(2)}M`
  } else if (amount >= 1000) {
    // For thousands (1234.567 -> 1.23K)
    return `${(amount / 1000).toFixed(2)}K`
  } else if (amount >= 1) {
    // For regular amounts (12.3456 -> 12.35)
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    })
  } else {
    // For small amounts (0.123456 -> 0.1235)
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    })
  }
}

export const formatTotal = (total: number): string => {
  if (total >= 1000000) {
    // For millions (1234567.89 -> 1,234,567.89)
    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } else if (total >= 1000) {
    // For thousands (1234.567 -> 1,234.57)
    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } else if (total >= 1) {
    // For regular totals (12.3456 -> 12.35)
    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    })
  } else {
    // For small totals (0.123456 -> 0.1235)
    return total.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    })
  }
}

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
}

export const formatVolume = (volume: number): string => {
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(2)}B`
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(2)}M`
  } else if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(2)}K`
  } else {
    return `$${volume.toFixed(2)}`
  }
}

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Compact number formatter for charts and small displays
export const formatCompactNumber = (num: number): string => {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B`
  } else if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M`
  } else if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K`
  } else {
    return num.toFixed(2)
  }
}