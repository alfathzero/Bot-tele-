const axios = require('axios');
const config = require('../config');

class FayupediaService {
  constructor() {
    this.baseUrl = 'https://fayupedia.com/api/v2'; // Placeholder URL
    this.apiId = config.fayupedia.apiId;
    this.apiKey = config.fayupedia.apiKey;
  }

  async getServices() {
    try {
      const response = await axios.post(`${this.baseUrl}/services`, {
        api_id: this.apiId,
        api_key: this.apiKey,
      });
      return response.data;
    } catch (error) {
      console.error('Fayupedia Error:', error.message);
      throw error;
    }
  }

  async placeOrder(service, target, quantity) {
    const response = await axios.post(`${this.baseUrl}/order`, {
      api_id: this.apiId,
      api_key: this.apiKey,
      service,
      target,
      quantity,
    });
    return response.data;
  }
}

module.exports = new FayupediaService();
