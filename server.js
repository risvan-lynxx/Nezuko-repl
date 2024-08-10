const express = require('express');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/generate-qr', async (req, res) => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
        const sock = makeWASocket({
            auth: state,
            logger: Pino({ level: 'silent' }),
            printQRInTerminal: false
        });

        sock.ev.on('connection.update', async (update) => {
            const { qr } = update;
            if (qr) {
                const qrCodeUrl = await qrcode.toDataURL(qr);
                res.send(qrCodeUrl);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating QR code');
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
