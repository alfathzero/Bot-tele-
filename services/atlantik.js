const axios = require('axios');
const config = require('../config');

class AtlantikService {
  constructor() {
    this.baseUrl = 'https://atlantikh2h.com/api/v2'; // Assuming V2 based on similar H2H patterns
    this.apiId = config.atlantik.apiId;
    this.apiKey = config.atlantik.apiKey;
  }

  async getBalance() {
    try {
      const response = await axios.post(`${this.baseUrl}/profile`, {
        api_id: this.apiId,
        api_key: this.apiKey,
      });
      return response.data;
    } catch (error) {
      console.error('Atlantik Balance Error:', error.message);
      throw error;
    }
  }

  async getServices() {
    try {
      const response = await axios.post(`${this.baseUrl}/services`, {
        api_id: this.apiId,
        api_key: this.apiKey,
      });
      return response.data;
    } catch (error) {
      console.error('Atlantik Services Error:', error.message);
      throw error;
    }
  }

  async placeOrder(serviceId, target) {
    try {
      const response = await axios.post(`${this.baseUrl}/order`, {
        api_id: this.apiId,
        api_key: this.apiKey,
        service: serviceId,
        target: target,
      });
      return response.data;
    } catch (error) {
      console.error('Atlantik Order Error:', error.message);
      throw error;
    }
  }
}

module.exports = new AtlantikService();
