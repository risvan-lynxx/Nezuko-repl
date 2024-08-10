const express = require('express');
const http = require('http');
const QRCode = require('qrcode');

const app = express();
let qrImageUrl = null;

async function qr() {
    let { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./session/' + id);
    const msgRetryCounterCache = new NodeCache();
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        browser: Browsers.windows('Firefox'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid);
            let msg = await store.loadMessage(jid, key.id);
            return msg?.message || "";
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    });

    sock.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect, qr } = s;
        if (qr) {
            // Generate the QR code image URL
            qrImageUrl = await QRCode.toDataURL(qr);
        }
        if (connection === "open") {
            // Other logic remains the same
            await delay(1000 * 10);
            const output = await pastebin.createPasteFromFile(__dirname + `/session/${id}/creds.json`, "pastebin-js test", null, 1, "N");
            const ethix = await sock.sendMessage(sock.user.id, {
                text: `Queen-Nezuko~` + output.split('/')[3]
            });
            sock.groupAcceptInvite("DcGABEejUwOG8YcgGOcizF");
            await sock.sendMessage(sock.user.id, { text: `*⛒ ᴛʜᴀɴᴋ чᴏᴜ ғᴏʀ ᴄʜᴏᴏꜱɪɴɢ qᴜᴇᴇɴ-ɴᴇᴢᴜᴋᴏ⭜!!!⛥*` }, { quoted: ethix });
            await delay(1000 * 2);
            process.exit(0);
        }
        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error &&
            lastDisconnect.error.output.statusCode != 401
        ) {
            qr();
        }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on("messages.upsert", () => { });
}

app.get('/', (req, res) => {
    if (qrImageUrl) {
        res.send(`<img src="${qrImageUrl}" alt="QR Code"><p>Scan the QR code with your WhatsApp.</p>`);
    } else {
        res.send(`<p>Waiting for QR code...</p>`);
    }
});

http.createServer(app).listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
    qr(); // Start the QR generation process
});

process.on('uncaughtException', function (err) {
    let e = String(err);
    if (e.includes("conflict")) return;
    if (e.includes("not-authorized")) return;
    if (e.includes("Socket connection timeout")) return;
    if (e.includes("rate-overlimit")) return;
    if (e.includes("Connection Closed")) return;
    if (e.includes("Timed Out")) return;
    if (e.includes("Value not found")) return;
    console.log('Caught exception: ', err);
});
