import fs from 'fs';
import path from 'path';
import https from 'https';

const STOPWORDS_URL = 'https://raw.githubusercontent.com/stopwords-iso/stopwords-id/master/stopwords-id.txt';
const DEST_DIR = path.join(process.cwd(), 'public', 'stopwords');
const DEST_FILE = path.join(DEST_DIR, 'id.txt');

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

console.log(`Downloading stopwords from ${STOPWORDS_URL}...`);

https.get(STOPWORDS_URL, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Failed to download stopwords: Status Code ${res.statusCode}`);
        process.exit(1);
    }

    const file = fs.createWriteStream(DEST_FILE);
    res.pipe(file);

    file.on('finish', () => {
        file.close();
        console.log(`Stopwords saved to ${DEST_FILE}`);
    });
}).on('error', (err) => {
    console.error('Error downloading stopwords:', err.message);
    process.exit(1);
});
