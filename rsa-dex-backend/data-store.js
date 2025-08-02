const fs = require('fs').promises;
const path = require('path');

class DataStore {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.tokensFile = path.join(this.dataDir, 'imported-tokens.json');
    this.pairsFile = path.join(this.dataDir, 'created-pairs.json');
    
    this.ensureDataDir();
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  async loadImportedTokens() {
    try {
      const data = await fs.readFile(this.tokensFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  loadImportedTokensSync() {
    try {
      const fs = require('fs');
      const data = fs.readFileSync(this.tokensFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveImportedTokens(tokens) {
    try {
      await this.ensureDataDir();
      await fs.writeFile(this.tokensFile, JSON.stringify(tokens, null, 2));
    } catch (error) {
      console.error('Failed to save imported tokens:', error);
    }
  }

  async addImportedToken(token) {
    const tokens = await this.loadImportedTokens();
    tokens.push(token);
    await this.saveImportedTokens(tokens);
    return tokens;
  }

  async loadCreatedPairs() {
    try {
      const data = await fs.readFile(this.pairsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  loadCreatedPairsSync() {
    try {
      const fs = require('fs');
      const data = fs.readFileSync(this.pairsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveCreatedPairs(pairs) {
    try {
      await this.ensureDataDir();
      await fs.writeFile(this.pairsFile, JSON.stringify(pairs, null, 2));
    } catch (error) {
      console.error('Failed to save created pairs:', error);
    }
  }

  async addCreatedPair(pair) {
    const pairs = await this.loadCreatedPairs();
    pairs.push(pair);
    await this.saveCreatedPairs(pairs);
    return pairs;
  }
}

module.exports = new DataStore();