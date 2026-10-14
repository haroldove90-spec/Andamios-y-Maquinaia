// Pure Node.js PNG generator with zlib
import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  const IHDR = Buffer.alloc(13);
  IHDR.writeUInt32BE(width, 0);
  IHDR.writeUInt32BE(height, 4);
  IHDR[8] = 8; // bit depth
  IHDR[9] = 2; // color type: 2 = RGB
  IHDR[10] = 0; // compression
  IHDR[11] = 0; // filter
  IHDR[12] = 0; // interlace

  // Raw image data with scanline filter 0
  const rowSize = width * 3 + 1;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Industrial amber border or dark blue center
      const isBorder = (x < 14 || x > width - 15 || y < 14 || y > height - 15);
      const isCross = (Math.abs(x - y) < 8 || Math.abs(x - (height - y)) < 8) && (x > 30 && x < width - 30);
      
      if (isBorder || isCross) {
        rawData[pxOffset] = 245;     // Amber R
        rawData[pxOffset + 1] = 158; // Amber G
        rawData[pxOffset + 2] = 11;  // Amber B
      } else {
        rawData[pxOffset] = 15;      // Dark Navy R
        rawData[pxOffset + 1] = 23;  // Dark Navy G
        rawData[pxOffset + 2] = 42;  // Dark Navy B
      }
    }
  }

  const IDAT = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type);
    const len = data.length;
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(len, 0);

    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', IHDR);
  const idatChunk = makeChunk('IDAT', IDAT);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 245, 158));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 245, 158));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 245, 158));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 245, 158));
console.log('PWA PNG Icons generated successfully.');
