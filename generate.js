const QRCode = require('qrcode');
const fs = require('fs');

async function generateBottleQR(bottleId) {
    const qrData = `BOTTLE_${bottleId}_${Date.now()}`;
    const path = `./qrcodes/${qrData}.png`;

    try {
        await QRCode.toFile(path, qrData, {
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        console.log(`✅ QR Code generated for: ${qrData}`);
    } catch (err) {
        console.error('❌ Failed to generate QR:', err);
    }
}

generateBottleQR('000001'); // You can loop this for batches
