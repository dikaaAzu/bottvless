const { Telegraf, Markup } = require('telegraf');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http'); // Tambahan wajib untuk Railway

// Ganti 'TOKEN_BOT_ANDA_DISINI' dengan token asli dari BotFather
const BOT_TOKEN = "8475657676:AAGaMNm1fAExcSLytKWESmx5gUcWOe4KGIs";
const ADMIN_ID = 6161529489; 
const bot = new Telegraf(BOT_TOKEN);
const USERS_FILE = 'users.json';

// ==========================================
// SERVER HTTP UNTUK RAILWAY (WAJIB)
// Agar kontainer Railway tidak dimatikan
// ==========================================
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Bot Telegram VLESS Berjalan dengan Baik di Railway!');
    res.end();
}).listen(PORT, () => {
    console.log(`Server Railway listening on port ${PORT}`);
});

// ==========================================
// DAFTAR DOMAIN ANDA
// ==========================================
const domainList = [
    'vlez.eu.cc',
    'vlzxr.eu.cc',
];

// USERNAME CHANNEL ANDA
const CHANNEL_USERNAME = '@vlazxz'; 
const CHANNEL_LINK = 'https://t.me/vlazxz'; 

// Fungsi rekam ID user 
// (Catatan: Data ini akan reset jika Railway melakukan redeploy/restart)
function saveUser(userId) {
    let users = [ADMIN_ID];
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            if (data) users = JSON.parse(data);
        }
        if (!users.includes(userId)) {
            users.push(userId);
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        }
    } catch (e) {
        console.log("Gagal save user:", e.message);
    }
}

const bugList = [
    { id: 'bug1', name: 'ava.game.naver.com', host: 'ava.game.naver.com' },
    { id: 'bug2', name: 'support.zoom.us', host: 'support.zoom.us' },
    { id: 'bug3', name: 'media-sin6-3.cdn.whatsapp.net', host: 'media-sin6-3.cdn.whatsapp.net' },
    { id: 'bug4', name: 'listen.noice.id', host: 'listen.noice.id' },
    { id: 'bug5', name: 'api24-normal.tiktokv.com', host: 'api24-normal.tiktokv.com' },
    { id: 'bug6', name: 'graph.instagram.com', host: 'graph.instagram.com' }
];

const dataServer = {
    'ID': {
        name: 'Indonesia', flag: '🇮🇩',
        providers: [
            { id: 'id_1', name: 'Akamai Technologies, Inc.', proxy: '172.232.249.224:2053' },
            { id: 'id_2', name: 'PT Deneva', proxy: '202.155.95.132:443' }
        ]
    },
    'MY': {
        name: 'Malaysia', flag: '🇲🇾',
        providers: [
            { id: 'my_1', name: 'Evoxt.com', proxy: '136.0.254.164:443' }
        ]
    },
    'SG': {
        name: 'Singapore', flag: '🇸🇬',
        providers: [
            { id: 'sg_1', name: 'Akamai Technologies, Inc.', proxy: '104.64.192.116:443' },
            { id: 'sg_2', name: 'Amazon.com, Inc.', path: '/sg-amz', proxy: '13.250.19.142:443' },
            { id: 'sg_3', name: 'Contabo Asia', proxy: '194.233.85.147:443' },
            { id: 'sg_4', name: 'Hetzner Online GmbH', proxy: '5.223.47.32:443' },
            { id: 'sg_5', name: 'Oracle Corporation', proxy: '138.2.64.229:443' },
            { id: 'sg_6', name: 'OVH SAS', proxy: '51.79.177.53:443' }
        ]
    }
};

async function checkMembership(ctx) {
    try {
        const userId = ctx.from.id;
        const chatMember = await ctx.telegram.getChatMember(CHANNEL_USERNAME, userId);
        return ['creator', 'administrator', 'member'].includes(chatMember.status);
    } catch (error) {
        return false;
    }
}

function getUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const userSession = {};

function checkSession(ctx) {
    if (!userSession[ctx.from.id]) {
        ctx.answerCbQuery('⚠️ Sesi kadaluarsa! Bot baru saja di-restart. Ketik /start.', { show_alert: true }).catch(()=>{});
        return false;
    }
    return true;
}

// ==========================================
// BROADCAST
// ==========================================
bot.command('broadcast', async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return ctx.reply('❌ Akses ditolak.');
    const broadcastMessage = ctx.message.text.split(' ').slice(1).join(' ');
    if (!broadcastMessage) return ctx.reply('⚠️ Format: /broadcast Pesan Anda');
    if (!fs.existsSync(USERS_FILE)) return ctx.reply('⚠️ Database kosong.');

    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    let successCount = 0, failCount = 0;
    await ctx.reply(`📢 Memulai broadcast ke ${users.length} pengguna...`);

    for (const userId of users) {
        try {
            await ctx.telegram.sendMessage(userId, `\n\n${broadcastMessage}`, { parse_mode: 'Markdown' });
            successCount++;
            await new Promise(resolve => setTimeout(resolve, 40)); 
        } catch (e) { failCount++; }
    }
    await ctx.reply(`✅ Selesai!\n- Berhasil: ${successCount}\n- Gagal/Blokir: ${failCount}`);
});

bot.use(async (ctx, next) => {
    if (!ctx.from) return next();
    saveUser(ctx.from.id);
    if (ctx.callbackQuery && ctx.callbackQuery.data === 'check_join') return next();

    const isJoined = await checkMembership(ctx);
    if (!isJoined) {
        const joinKeyboard = Markup.inlineKeyboard([
            [Markup.button.url('📢 Gabung Channel Dulu', CHANNEL_LINK)],
            [Markup.button.callback('🔄 Saya Sudah Bergabung', 'check_join')]
        ]);
        const warningText = `⚠️ **AKSES DITOLAK!**\n\nUntuk menikmati layanan VLESS gratis, silakan bergabung ke channel kami.`;
        if (ctx.callbackQuery) {
            return ctx.answerCbQuery('Anda belum bergabung ke channel!', { show_alert: true }).catch(()=>{});
        }
        return ctx.reply(warningText, { parse_mode: 'Markdown', ...joinKeyboard });
    }
    return next();
});

bot.action('check_join', async (ctx) => {
    const isJoined = await checkMembership(ctx);
    if (isJoined) {
        await ctx.answerCbQuery('Terima kasih sudah bergabung!', { show_alert: true }).catch(()=>{});
        const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🚀 Create Account VLESS', 'select_domain')]]);
        await ctx.editMessageText(`Selamat datang di layanan akun VLESS gratis!\n\nSilakan tekan tombol di bawah:`, { parse_mode: 'Markdown', ...keyboard }).catch(()=>{});
    } else {
        await ctx.answerCbQuery('❌ Anda belum bergabung ke channel!', { show_alert: true }).catch(()=>{});
    }
});

bot.start(async (ctx) => {
    const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🚀 Create Account VLESS', 'select_domain')]]);
    const welcomeText = `
╔══════════════════╗
   VLAZZ SERVERLESS VLESS
╚══════════════════╝
Selamat datang di layanan akun VLESS gratis!

:: SYSTEM INFO ————————
├ Status  : ONLINE (VLESS ONLY)
├ owner   : @heyyybangsyadd
├ Join CH : @vlazxz

Silakan tekan tombol di bawah untuk membuat akun VLESS:
    `;
    await ctx.reply(welcomeText, { parse_mode: 'Markdown', ...keyboard });
});

bot.action('select_domain', async (ctx) => {
    if (!userSession[ctx.from.id]) userSession[ctx.from.id] = {};
    const buttons = domainList.map((domain, index) => [Markup.button.callback(`🌐 ${domain}`, `setdomain_${index}`)]);
    buttons.push([Markup.button.callback('❌ Cancel', 'back_home')]);

    await ctx.editMessageText(':: SELECT DOMAIN ————————\nStatus : Choose Domain ↓', {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
    }).catch(()=>{});
});

domainList.forEach((domain, index) => {
    bot.action(`setdomain_${index}`, async (ctx) => {
        if (!userSession[ctx.from.id]) userSession[ctx.from.id] = {};
        userSession[ctx.from.id].domain = domain;
        await showCountryMenu(ctx);
    });
});

bot.action('select_country', async (ctx) => await showCountryMenu(ctx));

async function showCountryMenu(ctx) {
    const session = userSession[ctx.from.id] || {};
    const buttons = [];
    for (const [code, info] of Object.entries(dataServer)) {
        buttons.push([Markup.button.callback(`${info.flag} ${info.name}`, `country_${code}`)]);
    }
    buttons.push([Markup.button.callback('« Back', 'select_domain'), Markup.button.callback('❌ Cancel', 'back_home')]);

    const domainText = session.domain ? `├ Domain : ${session.domain}\n` : '';
    await ctx.editMessageText(`:: SELECT LOCATION ————————\n${domainText}Status : Choose Country ↓`, {
        parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons)
    }).catch(()=>{});
}

for (const code of Object.keys(dataServer)) {
    bot.action(`country_${code}`, async (ctx) => {
        if (!userSession[ctx.from.id]) userSession[ctx.from.id] = {};
        userSession[ctx.from.id].country = code;
        
        const countryData = dataServer[code];
        const buttons = countryData.providers.map(prov => [Markup.button.callback(`🏢 ${prov.name}`, `prov_${prov.id}`)]);
        buttons.push([Markup.button.callback('« Back', 'select_country')]);

        await ctx.editMessageText(`:: SELECT ISP ————————\n├ Region : ${countryData.flag} ${countryData.name}\nStatus : Choose Provider ↓`, {
            parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons)
        }).catch(()=>{});
    });
}

for (const countryCode of Object.keys(dataServer)) {
    dataServer[countryCode].providers.forEach(prov => {
        bot.action(`prov_${prov.id}`, async (ctx) => {
            if (!checkSession(ctx)) return;
            userSession[ctx.from.id].provider = prov;
            
            const countryData = dataServer[countryCode];
            const buttons = [
                [Markup.button.callback('📡 DOMAIN ONLY', 'mode_domain')],
                [Markup.button.callback('🔀 Wildcard', 'mode_wildcard_select'), Markup.button.callback('🔀 SNI/SSL', 'mode_sni_select')],
                [Markup.button.callback('« Back', `country_${countryCode}`), Markup.button.callback('❌ Cancel', 'back_home')]
            ];

            await ctx.editMessageText(`:: SELECT MODE KONEKSI ————————\n├ Region : ${countryData.flag} ${countryData.name}\n├ ISP : ${prov.name}\nPilih Mode Koneksi: ↓`, {
                parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons)
            }).catch(()=>{});
        });
    });
}

bot.action('mode_domain', async (ctx) => {
    if (!checkSession(ctx)) return;
    const session = userSession[ctx.from.id];
    if (!session.domain) return ctx.answerCbQuery('Domain belum dipilih!', { show_alert: true }).catch(()=>{});

    session.mode = 'domain';
    session.bug = { host: session.domain, name: 'Domain Only' };
    await generateAndSendVless(ctx);
});

bot.action('mode_sni_select', async (ctx) => {
    if (!checkSession(ctx)) return;
    userSession[ctx.from.id].mode = 'sni';
    await showBugMenu(ctx);
});

bot.action('mode_wildcard_select', async (ctx) => {
    if (!checkSession(ctx)) return;
    userSession[ctx.from.id].mode = 'wildcard';
    await showBugMenu(ctx);
});

async function showBugMenu(ctx) {
    const session = userSession[ctx.from.id];
    const countryData = dataServer[session.country];
    const prov = session.provider;

    const buttons = bugList.map(bug => [Markup.button.callback(bug.name, `bug_${bug.id}`)]);
    buttons.push([Markup.button.callback('« Back', `prov_${prov.id}`), Markup.button.callback('❌ Cancel', 'back_home')]);

    await ctx.editMessageText(`:: SELECT BUG HOST ————————\n├ Region : ${countryData.flag} ${countryData.name}\n├ Mode : ${session.mode.toUpperCase()}\nPilih Bug Host: ↓`, {
        parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons)
    }).catch(()=>{});
}

bugList.forEach(bug => {
    bot.action(`bug_${bug.id}`, async (ctx) => {
        if (!checkSession(ctx)) return;
        userSession[ctx.from.id].bug = bug;
        await generateAndSendVless(ctx);
    });
});

async function generateAndSendVless(ctx) {
    const session = userSession[ctx.from.id];
    const countryData = dataServer[session.country];
    const prov = session.provider;
    const selectedDomain = session.domain;

    const uuid = getUuid(); 
    const pathValue = prov.path ? prov.path : `/${prov.proxy}`;
    const accountName = `${session.country}-${prov.name} ${countryData.flag}`;
    const encodedName = encodeURIComponent(accountName);

    let targetHost = selectedDomain;
    let sniValue = selectedDomain;
    let modeTitle = 'DOMAIN ONLY';

    if (session.mode === 'sni') {
        sniValue = `${session.bug.host}.${selectedDomain}`;
        modeTitle = `SNI/SSL (${session.bug.host})`;
    } else if (session.mode === 'wildcard') {
        targetHost = session.bug.host;
        sniValue = `${session.bug.host}.${selectedDomain}`;
        modeTitle = `WILDCARD (${session.bug.host})`;
    }

    const configLink = `vless://${uuid}@${targetHost}:443?encryption=none&type=ws&host=${sniValue}&headerType=none&path=${encodeURIComponent(pathValue)}&security=tls&sni=${sniValue}#${encodedName}`;

    const resultText = `
╔═════════════════╗
   *SERVERLESS VLESS*
╚═════════════════╝

:: SERVER PROFILE ————————
├ Protokol: VLESS
├ Format: URL (V2Ray)
├ TLS: Aktif
├ Domain : ${selectedDomain}
├ Location : ${countryData.flag} ${countryData.name}
├ ISP : ${prov.name}
├ Proxy IP : ${prov.proxy}
├ Mode : ${modeTitle}
├ Host / Target : ${targetHost}
├ SNI : ${sniValue}

🔒 **TLS - PORT 443**
\`${configLink}\`
    `;

    const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔄 Buat Lagi', 'select_domain')]]);
    await ctx.editMessageText(resultText, { parse_mode: 'Markdown', ...keyboard }).catch(()=>{});
}

bot.action('back_home', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🚀 Create Account VLESS', 'select_domain')]]);
    await ctx.editMessageText('Silakan tekan tombol di bawah untuk membuat akun VLESS:', { parse_mode: 'Markdown', ...keyboard }).catch(()=>{});
});

bot.launch();
console.log('Bot VLESS Berjalan Sempurna...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
