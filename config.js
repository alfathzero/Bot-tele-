/**
 * CONFIGURATION FILE
 * Edit this file to set up your bot and API keys.
 */

require('dotenv').config();

module.exports = {
  // Telegram Bot Token (Get it from @BotFather)
  botToken: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',

  // Admin Telegram ID (Get it from @userinfobot)
  adminId: process.env.ADMIN_ID || 'YOUR_ADMIN_ID_HERE',

  // Admin Username (Without @)
  adminUsername: process.env.ADMIN_USERNAME || 'ADMIN_USERNAME_HERE',

  // Pterodactyl Panel Configuration
  pterodactyl: {
    url: process.env.PTERO_URL || 'https://panel.example.com',
    apiKey: process.env.PTERO_API_KEY || 'YOUR_PTERO_API_KEY',
    userId: process.env.PTERO_USER_ID || 1, // The default user ID to create servers for
  },

  // Digital Ocean Configuration
  digitalOcean: {
    apiKey: process.env.DO_API_KEY || 'YOUR_DO_API_KEY',
  },

  // RumahOTP Configuration
  rumahOtp: {
    apiKey: process.env.RUMAHOTP_API_KEY || 'YOUR_RUMAHOTP_API_KEY',
  },

  // Premku Configuration
  premku: {
    apiKey: process.env.PREMKU_API_KEY || 'YOUR_PREMKU_API_KEY',
  },

  // Fayupedia Configuration
  fayupedia: {
    apiId: process.env.FAYUPEDIA_API_ID || 'YOUR_FAYUPEDIA_ID',
    apiKey: process.env.FAYUPEDIA_API_KEY || 'YOUR_FAYUPEDIA_KEY',
  },
};
