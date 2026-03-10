const axios = require('axios');
const config = require('../config');

class PremkuService {
  constructor() {
    this.baseUrl = 'https://premku.com/api'; // Placeholder URL
    this.apiKey = config.premku.apiKey;
  }

  async getProducts() {
    // Implement based on actual Premku API
    return [
      { id: 1, name: 'Netflix Premium', price: 35000 },
      { id: 2, name: 'Spotify Premium', price: 15000 },
    ];
  }

  async purchase(productId) {
     // Implement purchase logic
     console.log(`Purchasing product ${productId} from Premku`);
     return { success: true, code: 'PREM-XXXX-XXXX' };
  }
}

module.exports = new PremkuService();
