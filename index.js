const { Telegraf, Markup } = require('telegraf');
const os = require('os');
const config = require('./config');
const ptero = require('./services/pterodactyl');
const doApi = require('./services/digitalocean');
const rumahOtp = require('./services/rumahotp');
const premku = require('./services/premku');
const fayupedia = require('./services/fayupedia');
const pakasir = require('./services/pakasir');
const atlantik = require('./services/atlantik');
const db = require('./database');

if (!config.botToken) {
  console.error('Error: BOT_TOKEN is not set in .env file');
  process.exit(1);
}

const bot = new Telegraf(config.botToken);

// Simple Middleware for logging
bot.use((ctx, next) => {
  if (ctx.from) {
    console.log(`Message from ${ctx.from.username || ctx.from.first_name}: ${ctx.message?.text || 'non-text'}`);
  }
  return next();
});

const mainMenu = Markup.keyboard([
  ['🎮 Pterodactyl Panel', '☁️ Digital Ocean VPS'],
  ['📱 RumahOTP (SMS)', 'Premium APK'],
  ['🚀 Sosmed (Fayupedia)', '💰 Saldo & Profil'],
]).resize();

bot.start((ctx) => {
  ctx.reply('Selamat datang di Bot Auto Order! Silakan pilih layanan yang Anda inginkan:', mainMenu);
});

// Pterodactyl Flow (Simplified)
bot.hears('🎮 Pterodactyl Panel', (ctx) => {
  ctx.reply('Pilih RAM untuk Pterodactyl Panel:', Markup.inlineKeyboard([
    [Markup.button.callback('1GB RAM - Rp 5.000', 'ptero_1gb')],
    [Markup.button.callback('2GB RAM - Rp 10.000', 'ptero_2gb')],
    [Markup.button.callback('4GB RAM - Rp 20.000', 'ptero_4gb')],
  ]));
});

// Digital Ocean Flow
bot.hears('☁️ Digital Ocean VPS', (ctx) => {
  ctx.reply('Layanan VPS Digital Ocean menggunakan API Key Anda atau beli dari kami?', Markup.inlineKeyboard([
    [Markup.button.callback('Beli VPS (Disediakan)', 'do_buy')],
    [Markup.button.callback('Cek Region & Size', 'do_info')],
  ]));
});

// RumahOTP Flow
bot.hears('📱 RumahOTP (SMS)', async (ctx) => {
  try {
    const services = await rumahOtp.getServicesV2();
    // Assuming services.data is an array of services
    const serviceList = services.data || services;
    const buttons = serviceList.slice(0, 10).map(s => [Markup.button.callback(s.name, `otp_svc_${s.id}`)]);
    ctx.reply('Pilih layanan OTP:', Markup.inlineKeyboard(buttons));
  } catch (err) {
    ctx.reply('Gagal mengambil daftar layanan RumahOTP.');
  }
});

// Premku Flow
bot.hears('Premium APK', async (ctx) => {
  const products = await premku.getProducts();
  const buttons = products.map(p => [Markup.button.callback(`${p.name} - Rp ${p.price}`, `premku_${p.id}`)]);
  ctx.reply('Pilih APK Premium yang ingin dibeli:', Markup.inlineKeyboard(buttons));
});

// Fayupedia Flow
bot.hears('🚀 Sosmed (Fayupedia)', (ctx) => {
  ctx.reply('Layanan Sosmed Fayupedia:\nKirim format: /suntik [service_id] [target] [jumlah]');
});

// Handle Callbacks
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === 'do_info') {
    ctx.answerCbQuery();
    try {
      const regions = await doApi.getRegions();
      const sizes = await doApi.getSizes();
      const regionNames = regions.slice(0, 5).map(r => r.slug).join(', ');
      const sizeNames = sizes.slice(0, 5).map(s => s.slug).join(', ');
      ctx.reply(`🌐 Region: ${regionNames}...\n💾 Size: ${sizeNames}...`);
    } catch (err) {
      ctx.reply('❌ Gagal mengambil info DigitalOcean. Cek API Key di config.js');
    }
  }

  if (data === 'do_buy') {
    ctx.answerCbQuery();
    ctx.reply('Layanan Beli VPS DO sedang dalam pengembangan. Silakan hubungi admin.');
  }

  if (data.startsWith('ptero_')) {
    const ramStr = data.split('_')[1]; // e.g., 1gb
    const prices = { '1gb': 5000, '2gb': 10000, '4gb': 20000 };
    const price = prices[ramStr];

    if (db.deductBalance(ctx.from.id, price)) {
      ctx.answerCbQuery(`Memproses pesanan Pterodactyl ${ramStr}...`);
      try {
        const ramMb = parseInt(ramStr) * 1024;
        // Ptero user ID from config or fallback
        const server = await ptero.createServer(null, `Server-${ctx.from.id}`, ramMb, 5120, 100);
        ctx.reply(`✅ Server Berhasil Dibuat!\nID: ${server.attributes.id}\nNama: ${server.attributes.name}`);
      } catch (err) {
        db.addBalance(ctx.from.id, price); // Refund
        ctx.reply('❌ Gagal membuat server. Saldo telah dikembalikan.');
      }
    } else {
      ctx.answerCbQuery('Saldo tidak cukup!', { show_alert: true });
    }
  }

  if (data.startsWith('otp_svc_')) {
    const serviceId = data.split('_')[2];
    ctx.answerCbQuery();
    try {
      const countries = await rumahOtp.getCountriesV2(serviceId);
      const countryList = countries.data || countries;
      const buttons = countryList.slice(0, 10).map(c => [Markup.button.callback(c.name, `otp_ctr_${serviceId}_${c.id}`)]);
      ctx.reply('Pilih Negara:', Markup.inlineKeyboard(buttons));
    } catch (err) {
      ctx.reply('Gagal mengambil daftar negara.');
    }
  }

  if (data.startsWith('otp_ctr_')) {
    const [_, __, serviceId, countryId] = data.split('_');
    ctx.answerCbQuery();
    try {
      const operators = await rumahOtp.getOperatorsV2(countryId, serviceId);
      const operatorList = operators.data || operators;
      const buttons = operatorList.map(o => [Markup.button.callback(`${o.name} - Rp ${o.price}`, `otp_buy_${serviceId}_${countryId}_${o.id}_${o.price}`)]);
      ctx.reply('Pilih Operator:', Markup.inlineKeyboard(buttons));
    } catch (err) {
      ctx.reply('Gagal mengambil daftar operator.');
    }
  }

  if (data.startsWith('otp_buy_')) {
    const [_, __, serviceId, countryId, operatorId, price] = data.split('_');
    if (db.deductBalance(ctx.from.id, parseInt(price))) {
      ctx.answerCbQuery('Memesan nomor...');
      try {
        const order = await rumahOtp.createOrdersV2(serviceId, countryId, operatorId);
        ctx.reply(`✅ Nomor berhasil dipesan!\nNomor: ${order.number || order.data?.number}\nID Order: ${order.id || order.data?.id}`);
      } catch (err) {
        db.addBalance(ctx.from.id, parseInt(price));
        ctx.reply('❌ Gagal memesan nomor.');
      }
    } else {
      ctx.answerCbQuery('Saldo tidak cukup!', { show_alert: true });
    }
  }

  if (data.startsWith('premku_')) {
    const productId = data.split('_')[1];
    const products = await premku.getProducts();
    const product = products.find(p => p.id == productId);

    if (product && db.deductBalance(ctx.from.id, product.price)) {
      ctx.answerCbQuery();
      ctx.reply(`Membeli ${product.name}...`);
      try {
        const res = await premku.purchase(productId);
        ctx.reply(`✅ Pembelian berhasil!\nProduk: ${product.name}\nKode/Akun: ${res.code}`);
      } catch (err) {
        db.addBalance(ctx.from.id, product.price); // Refund
        ctx.reply('❌ Gagal memproses pembelian. Saldo dikembalikan.');
      }
    } else {
      ctx.answerCbQuery('Saldo tidak cukup!', { show_alert: true });
    }
  }
});

bot.command('suntik', async (ctx) => {
  const args = ctx.message.text.split(' ');
  if (args.length < 4) {
    return ctx.reply('Format salah! Gunakan: /suntik [service_id] [target] [jumlah]');
  }
  const [_, serviceId, target, quantity] = args;

  // Hypothetical price calculation (e.g., 10 per quantity)
  const price = parseInt(quantity) * 0.1;

  if (db.deductBalance(ctx.from.id, price)) {
    ctx.reply(`Processing order for ${target}...`);
    try {
      await fayupedia.placeOrder(serviceId, target, parseInt(quantity));
      ctx.reply('✅ Pesanan Sosmed berhasil diproses!');
    } catch (err) {
      db.addBalance(ctx.from.id, price);
      ctx.reply('❌ Gagal memproses pesanan sosmed.');
    }
  } else {
    ctx.reply('Saldo tidak cukup!');
  }
});

bot.hears('💰 Saldo & Profil', (ctx) => {
  const user = db.getUser(ctx.from.id);
  ctx.reply(
    `👤 Profil Anda\nID: ${ctx.from.id}\nUsername: @${ctx.from.username || '-'}\nSaldo: Rp ${user.balance}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('💳 Deposit Pakasir', 'dep_pakasir'), Markup.button.callback('💳 Deposit Atlantik', 'dep_atlantik')],
      [Markup.button.callback('👤 Hubungi Admin', 'deposit_req')]
    ])
  );
});

bot.action('deposit_req', (ctx) => {
  ctx.reply('Silakan kirim bukti transfer ke Admin @' + (config.adminUsername || 'admin_username') + ' untuk pengisian saldo.');
});

bot.action('dep_pakasir', (ctx) => {
  ctx.reply('Kirim nominal deposit (Contoh: /dep_pakasir 10000)');
});

bot.action('dep_atlantik', (ctx) => {
  ctx.reply('Deposit via Atlantik H2H silakan gunakan format: /dep_atlantik 10000');
});

bot.command('dep_pakasir', async (ctx) => {
  const amount = ctx.message.text.split(' ')[1];
  if (!amount) return ctx.reply('Sertakan nominal! /dep_pakasir [jumlah]');
  try {
    const res = await pakasir.createPayment('qris', `DEP-${ctx.from.id}-${Date.now()}`, parseInt(amount));
    // Assuming res.data.payment_url exists
    const url = res.payment_url || res.data?.payment_url;
    ctx.reply(`Silakan selesaikan pembayaran Pakasir:\n${url}`);
  } catch (err) {
    ctx.reply('Gagal membuat transaksi Pakasir.');
  }
});

bot.command('dep_atlantik', async (ctx) => {
  const amount = ctx.message.text.split(' ')[1];
  if (!amount) return ctx.reply('Sertakan nominal! /dep_atlantik [jumlah]');
  ctx.reply(`Instruksi deposit Atlantik H2H senilai ${amount} akan dikirimkan oleh admin.`);
  // Placeholder logic for Atlantik
});

bot.command('ping', (ctx) => {
  const start = Date.now();
  ctx.reply('Pinging...').then((sent) => {
    const end = Date.now();
    ctx.telegram.editMessageText(ctx.chat.id, sent.message_id, undefined, `🏓 Pong! Latency: ${end - start}ms`);
  });
});

bot.command('runtime', (ctx) => {
  const uptimeSeconds = os.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
  const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
  const usedMem = (totalMem - freeMem).toFixed(2);

  const cpuModel = os.cpus()[0].model;
  const cpuCores = os.cpus().length;

  const msg = `💻 *VPS Runtime Specifications*

🚀 *Uptime:* ${hours}h ${minutes}m ${seconds}s
💾 *Memory:* ${usedMem}GB / ${totalMem}GB
⚙️ *CPU:* ${cpuModel} (${cpuCores} Cores)
🌐 *OS:* ${os.type()} ${os.release()} ${os.arch()}
`;
  ctx.replyWithMarkdown(msg);
});

// Admin commands to add balance (Only for ADMIN_ID)
bot.command('addsaldo', (ctx) => {
  if (ctx.from.id.toString() !== config.adminId) return;
  const args = ctx.message.text.split(' ');
  if (args.length < 3) return ctx.reply('Format: /addsaldo [userId] [amount]');
  const userId = args[1];
  const amount = parseInt(args[2]);
  db.addBalance(userId, amount);
  ctx.reply(`Berhasil menambah saldo Rp ${amount} ke user ${userId}`);
  bot.telegram.sendMessage(userId, `Saldo Anda telah ditambahkan sebesar Rp ${amount} oleh admin.`);
});

bot.launch().then(() => {
  console.log('Bot is running...');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
