const { Telegraf, Markup } = require('telegraf');
const crypto = require('crypto');

// Ganti 'TOKEN_BOT_ANDA_DISINI' dengan token asli dari BotFather
const BOT_TOKEN = "8475657676:AAGaMNm1fAExcSLytKWESmx5gUcWOe4KGIs";
const bot = new Telegraf(BOT_TOKEN);

const DOMAIN = 'vlez.eu.cc';

// MASUKKAN USERNAME CHANNEL ANDA DI SINI (Pastikan bot jadi Admin di channel tersebut)
const CHANNEL_USERNAME = '@vlazz🚀'; 
const CHANNEL_LINK = 'https://t.me/vlazxz'; // Link invite channel Anda

// Daftar Bug Host
const bugList = [
    { id: 'bug1', name: ' ava.game.naver.com', host: 'ava.game.naver.com' },
    { id: 'bug2', name: ' support.zoom.us', host: 'support.zoom.us' },
    { id: 'bug3', name: ' media-sin6-3.cdn.whatsapp.net', host: 'media-sin6-3.cdn.whatsapp.net' },
    { id: 'bug4', name: ' listen.noice.id', host: 'listen.noice.id' },
    { id: 'bug5', name: ' api24-normal.tiktokv.com', host: 'api24-normal.tiktokv.com' },
    { id: 'bug6', name: ' graph.instagram.com', host: 'graph.instagram.com' },
    
];

const dataServer = {
    'ID': {
        name: 'Indonesia',
        flag: '🇮🇩',
        providers: [
            { id: 'id_1', name: 'Akamai Technologies, Inc.', proxy: '172.232.249.224:2053' },
            { id: 'id_2', name: 'PT Deneva', proxy: '202.155.95.132:443' }
        ]
    },
    'MY': {
        name: 'Malaysia',
        flag: '🇲🇾',
        providers: [
            { id: 'my_1', name: 'Evoxt.com', proxy: '136.0.254.164:443' }
        ]
    },
    'SG': {
        name: 'Singapore',
        flag: '🇸🇬',
        providers: [
            { id: 'sg_1', name: 'Akamai Technologies, Inc.', proxy: '104.64.192.116:443' },
            { id: 'sg_2', name: 'Amazon.com, Inc.', path: '/sg-amz', proxy: '13.250.19.142:443' },
            { id: 'sg_3', name: 'Contabo Asia Private Limited', proxy: '194.233.85.147:443' },
            { id: 'sg_4', name: 'Hetzner Online GmbH', proxy: '5.223.47.32:443' },
            { id: 'sg_5', name: 'Oracle Corporation', proxy: '138.2.64.229:443' },
            { id: 'sg_6', name: 'OVH SAS', proxy: '51.79.177.53:443' }
        ]
    }
};

// Fungsi ambil UUID (menggunakan fetch bawaan Node.js / crypto fallback)
async function getUuid() {
    try {
        const response = await fetch('https://www.uuidgenerator.net/');
        const html = await response.text();
        const match = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
        if (match) return match[0];
    } catch (e) {}
    return crypto.randomUUID();
}

const userSession = {};

bot.start(async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🚀 Create Account VLESS', 'select_country')]
    ]);

    const welcomeText = `
╔═══════════════════╗
  VLAZZ SERVERLESS VLESS
╚═══════════════════╝

Selamat datang di layanan akun VLESS gratis!

:: SYSTEM INFO ————————
├ Status : ONLINE (VLESS ONLY)
├ owner : @heyyybangsyadd

Silakan tekan tombol di bawah untuk membuat akun VLESS:
    `;
    await ctx.reply(welcomeText, { parse_mode: 'Markdown', ...keyboard });
});

bot.action('select_country', async (ctx) => {
    const buttons = [];
    for (const [code, info] of Object.entries(dataServer)) {
        buttons.push([Markup.button.callback(`${info.flag} ${info.name}`, `country_${code}`)]);
    }
    buttons.push([Markup.button.callback('❌ Cancel', 'back_home')]);

    await ctx.editMessageText(':: SELECT LOCATION ————————\nStatus : Choose Country ↓', {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
    });
});

for (const code of Object.keys(dataServer)) {
    bot.action(`country_${code}`, async (ctx) => {
        userSession[ctx.from.id] = { country: code };
        const countryData = dataServer[code];
        
        const buttons = [];
        countryData.providers.forEach(prov => {
            buttons.push([Markup.button.callback(`🏢 ${prov.name}`, `prov_${prov.id}`)]);
        });
        buttons.push([Markup.button.callback('« Back', 'select_country')]);

        await ctx.editMessageText(`:: SELECT ISP ————————\n├ Region : ${countryData.flag} ${countryData.name}\nStatus : Choose Provider ↓`, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons)
        });
    });
}

for (const countryCode of Object.keys(dataServer)) {
    dataServer[countryCode].providers.forEach(prov => {
        bot.action(`prov_${prov.id}`, async (ctx) => {
            userSession[ctx.from.id].provider = prov;
            const countryData = dataServer[countryCode];

            const buttons = [
                [Markup.button.callback('📡 DOMAIN ONLY', 'mode_domain')],
                [Markup.button.callback('🔀 Wildcard', 'mode_wildcard_select'), Markup.button.callback('🔀 SNI/SSL', 'mode_sni_select')],
                [Markup.button.callback('« Back', `country_${countryCode}`), Markup.button.callback('❌ Cancel', 'back_home')]
            ];

            await ctx.editMessageText(`:: SELECT MODE KONEKSI ————————\n├ Region : ${countryData.flag} ${countryData.name}\n├ ISP : ${prov.name}\nPilih Mode Koneksi: ↓`, {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard(buttons)
            });
        });
    });
}

bot.action('mode_domain', async (ctx) => {
    const session = userSession[ctx.from.id];
    if (!session) return ctx.reply('Sesi habis, silakan ketik /start ulang.');

    session.mode = 'domain';
    session.bug = { host: DOMAIN, name: 'Domain Only' };
    await generateAndSendVless(ctx);
});

bot.action('mode_sni_select', async (ctx) => {
    userSession[ctx.from.id].mode = 'sni';
    await showBugMenu(ctx);
});

bot.action('mode_wildcard_select', async (ctx) => {
    userSession[ctx.from.id].mode = 'wildcard';
    await showBugMenu(ctx);
});

async function showBugMenu(ctx) {
    const session = userSession[ctx.from.id];
    const countryData = dataServer[session.country];
    const prov = session.provider;

    const buttons = [];
    bugList.forEach(bug => {
        buttons.push([Markup.button.callback(bug.name, `bug_${bug.id}`)]);
    });
    buttons.push([Markup.button.callback('« Back', `prov_${prov.id}`), Markup.button.callback('❌ Cancel', 'back_home')]);

    await ctx.editMessageText(`:: SELECT BUG HOST ————————\n├ Region : ${countryData.flag} ${countryData.name}\n├ Mode : ${session.mode.toUpperCase()}\nPilih Bug Host: ↓`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
    });
}

bugList.forEach(bug => {
    bot.action(`bug_${bug.id}`, async (ctx) => {
        const session = userSession[ctx.from.id];
        if (!session) return ctx.reply('Sesi habis, silakan ketik /start ulang.');

        session.bug = bug;
        await generateAndSendVless(ctx);
    });
});

async function generateAndSendVless(ctx) {
    const session = userSession[ctx.from.id];
    const countryData = dataServer[session.country];
    const prov = session.provider;

    const uuid = await getUuid();
    const pathValue = prov.path ? prov.path : `/${prov.proxy}`;
    const accountName = `${session.country}-${prov.name} ${countryData.flag}`;
    const encodedName = encodeURIComponent(accountName);

    let targetHost = DOMAIN;
    let sniValue = DOMAIN;
    let modeTitle = 'DOMAIN ONLY';

    if (session.mode === 'domain') {
        targetHost = DOMAIN;
        sniValue = DOMAIN;
        modeTitle = 'DOMAIN ONLY';
    } else if (session.mode === 'sni') {
        targetHost = DOMAIN;
        sniValue = `${session.bug.host}.${DOMAIN}`;
        modeTitle = `SNI/SSL (${session.bug.host})`;
    } else if (session.mode === 'wildcard') {
        targetHost = session.bug.host;
        sniValue = `${session.bug.host}.${DOMAIN}`;
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
├ Location : ${countryData.flag} ${countryData.name}
├ ISP : ${prov.name}
├ Proxy IP : ${prov.proxy}
├ Mode : ${modeTitle}
├ Host / Target : ${targetHost}
├ SNI : ${sniValue}

🔒 **TLS - PORT 443**
\`${configLink}\`
    `;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Buat Lagi', 'select_country')]
    ]);

    await ctx.editMessageText(resultText, { parse_mode: 'Markdown', ...keyboard });
}

bot.action('back_home', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🚀 Create Account VLESS', 'select_country')]
    ]);
    await ctx.editMessageText('Silakan tekan tombol di bawah untuk membuat akun VLESS:', { parse_mode: 'Markdown', ...keyboard });
});

bot.launch();
console.log('Bot VLESS Berjalan Sempurna...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));