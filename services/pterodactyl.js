const axios = require('axios');
const config = require('../config');

class PterodactylService {
  constructor() {
    this.client = axios.create({
      baseURL: `${config.pterodactyl.url}/api/application`,
      headers: {
        'Authorization': `Bearer ${config.pterodactyl.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json',
      },
    });
  }

  async createServer(userId, name, ram, disk, cpu) {
    try {
      const response = await this.client.post('/servers', {
        name: name,
        user: userId,
        egg: 15, // Default egg, should be configurable
        docker_image: 'ghcr.io/pterodactyl/yolks:debian',
        startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
        environment: {
          SERVER_JARFILE: 'server.jar',
          BUILD_NUMBER: 'latest',
        },
        limits: {
          memory: ram,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 0,
          allocations: 1,
          backups: 0,
        },
        deploy: {
          locations: [1], // Default location
          dedicated_ip: false,
          port_range: [],
        },
      });
      return response.data;
    } catch (error) {
      console.error('Pterodactyl Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new PterodactylService();
