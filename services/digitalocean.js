const axios = require('axios');
const config = require('../config');

class DigitalOceanService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.digitalocean.com/v2',
      headers: {
        'Authorization': `Bearer ${config.digitalOcean.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createDroplet(name, region, size, image) {
    try {
      const response = await this.client.post('/droplets', {
        name,
        region,
        size,
        image,
      });
      return response.data;
    } catch (error) {
      console.error('DigitalOcean Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRegions() {
    const response = await this.client.get('/regions');
    return response.data.regions;
  }

  async getSizes() {
    const response = await this.client.get('/sizes');
    return response.data.sizes;
  }
}

module.exports = new DigitalOceanService();
