const axios = require('axios');
const config = require('../config');

class PakasirService {
  constructor() {
    this.baseUrl = 'https://pakasir.com/api/v1'; // Standard API base
    this.apiKey = config.pakasir.apiKey;
  }

  async createPayment(method, orderId, amount) {
    try {
      const response = await axios.post(`${this.baseUrl}/transaction/create`, {
        api_key: this.apiKey,
        method: method,
        order_id: orderId,
        amount: amount,
      });
      return response.data;
    } catch (error) {
      console.error('Pakasir Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPaymentStatus(orderId) {
    try {
      const response = await axios.get(`${this.baseUrl}/transaction/status`, {
        params: {
          api_key: this.apiKey,
          order_id: orderId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Pakasir Status Error:', error.message);
      throw error;
    }
  }
}

module.exports = new PakasirService();
