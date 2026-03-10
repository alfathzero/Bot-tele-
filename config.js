require('dotenv').config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  adminId: process.env.ADMIN_ID,
  pterodactyl: {
    url: process.env.PTERO_URL,
    apiKey: process.env.PTERO_API_KEY,
  },
  digitalOcean: {
    apiKey: process.env.DO_API_KEY,
  },
  rumahOtp: {
    apiKey: process.env.RUMAHOTP_API_KEY,
  },
  premku: {
    apiKey: process.env.PREMKU_API_KEY,
  },
  fayupedia: {
    apiId: process.env.FAYUPEDIA_API_ID,
    apiKey: process.env.FAYUPEDIA_API_KEY,
  },
};
