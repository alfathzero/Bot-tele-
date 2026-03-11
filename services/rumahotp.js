const axios = require('axios');
const config = require('../config');

class RumahOTPService {
  constructor() {
    this.baseUrl = 'https://rumahotp.com/api/v1';
    this.apiKey = config.rumahOtp.apiKey;
  }

  async getBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/balance`, {
        params: { api_key: this.apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('RumahOTP Error:', error.message);
      throw error;
    }
  }

  async getServicesV2() {
    const response = await axios.get(`${this.baseUrl}/services/v2`, {
      params: { api_key: this.apiKey }
    });
    return response.data;
  }

  async getCountriesV2(serviceId) {
    const response = await axios.get(`${this.baseUrl}/countries/v2`, {
      params: {
        api_key: this.apiKey,
        service: serviceId
      }
    });
    return response.data;
  }

  async getOperatorsV2(countryId, serviceId) {
    const response = await axios.get(`${this.baseUrl}/operators/v2`, {
      params: {
        api_key: this.apiKey,
        country: countryId,
        service: serviceId
      }
    });
    return response.data;
  }

  async createOrdersV2(serviceId, countryId, operatorId) {
    const response = await axios.get(`${this.baseUrl}/order/v2`, {
      params: {
        api_key: this.apiKey,
        service: serviceId,
        country: countryId,
        operator: operatorId
      }
    });
    return response.data;
  }
}

module.exports = new RumahOTPService();
