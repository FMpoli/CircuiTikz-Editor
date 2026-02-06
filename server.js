#!/usr/bin/env node
/**
 * Backend per Anteprima LaTeX di Tikiz2.
 * Compila il codice Circuitikz e restituisce un'immagine PNG.
 *
 * Richiede: pdflatex, poppler-utils (pdftocairo)
 * Avvio: node server.js
 * Poi apri http://localhost:3001
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const url = require('url');

const PORT = process.env.PORT || 3001;

const DOC_TEMPLATE = `\\documentclass[border=2pt]{standalone}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[american]{circuitikz}
\\usetikzlibrary{calc}
\\begin{document}
BODY
\\end{document}
`;

/**
 * Estrae il blocco \\begin{circuitikz}...\\end{circuitikz} dal codice.
 * Se il codice è un documento completo, usa solo quel blocco per evitare conflitti.
 * Altrimenti restituisce il codice così com'è (snippet).
 */
function extractCircuitikzBody(code) {
    const trimmed = code.trim();
    const match = trimmed.match(/\\begin\s*\{\s*circuitikz\s*\}\s*(\[[^\]]*\])?\s*([\s\S]*?)\\end\s*\{\s*circuitikz\s*\}/i);
    if (match) {
        const opt = (match[1] || '').trim();
        const inner = match[2];
        return '\\begin{circuitikz}' + opt + '\n' + inner + '\\end{circuitikz}';
    }
    return trimmed;
}

function compileLatex(code) {
    const tmpDir = path.join(os.tmpdir(), `tikiz2-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const texPath = path.join(tmpDir, 'circuit.tex');
    const pdfPath = path.join(tmpDir, 'circuit.pdf');
    const pngPath = path.join(tmpDir, 'circuit-1.png');

    const body = extractCircuitikzBody(code);

    return fs.mkdir(tmpDir, { recursive: true })
        .then(() => {
            const doc = DOC_TEMPLATE.replace('BODY', body);
            return fs.writeFile(texPath, doc, 'utf8');
        })
        .then(() => new Promise((resolve, reject) => {
            execFile('pdflatex', [
                '-interaction=nonstopmode',
                '-halt-on-error',
                '-output-directory', tmpDir,
                texPath
            ], { cwd: tmpDir, timeout: 20000 }, (err, stdout, stderr) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        reject(new Error('pdflatex non trovato. Installa TeX Live (es. sudo apt install texlive-latex-base texlive-latex-extra texlive-latex-recommended) e poppler-utils (pdftocairo).'));
                        return;
                    }
                    const logPath = path.join(tmpDir, 'circuit.log');
                    return fs.readFile(logPath, 'utf8').catch(() => stdout + stderr).then(log => {
                        const lines = log.split('\n');
                        const errLines = [];
                        let capture = false;
                        for (let i = lines.length - 1; i >= 0 && errLines.length < 35; i--) {
                            const l = lines[i];
                            if (l.includes('!') || l.includes('Error') || l.includes('Undefined') || l.includes('emergency')) capture = true;
                            if (capture) errLines.unshift(lines[i]);
                        }
                        const excerpt = (errLines.length ? errLines.join('\n') : log).slice(-3000);
                        reject(new Error(excerpt.trim() || 'pdflatex fallito. Verifica che TeX Live e il pacchetto circuitikz siano installati.'));
                    });
                }
                resolve();
            });
        }))
        .then(() => new Promise((resolve, reject) => {
            execFile('pdftocairo', ['-png', '-r', '150', pdfPath, path.join(tmpDir, 'circuit')], { cwd: tmpDir, timeout: 5000 }, (err) => {
                if (err) {
                    reject(new Error('pdftocairo non disponibile. Installa poppler-utils (es. sudo apt install poppler-utils)'));
                    return;
                }
                resolve();
            });
        }))
        .then(() => fs.readFile(pngPath))
        .then(buf => buf.toString('base64'))
        .finally(() => fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {}));
}

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);

    // Servi file statici (index.html, app.js, index.css, ecc.)
    if (req.method === 'GET' && parsed.pathname !== '/api/preview') {
        const rel = parsed.pathname === '/' ? 'index.html' : path.normalize(parsed.pathname).replace(/^\//, '');
        if (rel.startsWith('..')) {
            res.writeHead(404);
            res.end();
            return;
        }
        const filePath = path.join(__dirname, rel || 'index.html');
        fs.readFile(filePath).then(data => {
            const ext = path.extname(filePath);
            const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.ico': 'image/x-icon' };
            res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
            res.end(data);
        }).catch(() => {
            res.writeHead(404);
            res.end('Not found');
        });
        return;
    }

    if (req.method === 'POST' && parsed.pathname === '/api/preview') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            let payload;
            try {
                payload = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'JSON non valido' }));
                return;
            }
            const code = payload.code;
            if (!code || typeof code !== 'string') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Manca il campo code' }));
                return;
            }
            compileLatex(code)
                .then(imageBase64 => {
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ imageBase64 }));
                })
                .catch(err => {
                    const msg = err.message || 'Errore di compilazione';
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ error: msg }));
                });
        });
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(PORT, () => {
    console.log(`Tikiz2: http://localhost:${PORT}`);
    console.log('Anteprima LaTeX: avvia da questa URL e usa il pulsante "Anteprima LaTeX".');
});
