# CircuiTikz-Editor (Tikiz2)

Create Circuitikz circuits in a traditional schematic editor. Get the code automatically.

## Anteprima LaTeX

Per vedere il circuito compilato (come uscirà in PDF) senza uscire dall’editor:

1. Installa **pdflatex** (pacchetto TeX Live) e **poppler-utils** (per `pdftocairo`).
   - Ubuntu/Debian: `sudo apt install texlive-latex-base texlive-latex-extra poppler-utils`
   - Incluso circuitikz: `sudo apt install texlive-pictures`
2. Avvia il backend: `node server.js`
3. Apri nel browser: **http://localhost:3001**
4. Usa il pulsante **«Anteprima LaTeX»** nel pannello codice: viene compilato il codice attuale e mostrata l’immagine.

Se apri solo `index.html` (file://) o se pdflatex non è installato, in caso di errore compare il link **«Apri Overleaf»**: copia il codice e incollalo in un nuovo progetto su [Overleaf](https://www.overleaf.com) per compilare online.

## Sincronizzazione codice ↔ canvas

- **Modifichi il codice a mano** (incolla, modifica): il codice non viene più sovrascritto quando clicchi o modifichi la canvas.
- **Sincronizza da canvas**: sovrascrive il codice con il contenuto attuale della canvas.
- **Importa nel canvas**: interpreta il codice (sintassi supportata) e aggiorna la canvas; da quel momento le modifiche alla canvas riscrivono di nuovo il codice.

- **Simboli CircuiTikZ-Designer (opzionale):** puoi usare i simboli grafici del [CircuiTikZ-Designer](https://github.com/Circuit2TikZ/CircuiTikZ-Designer) al posto di quelli predefiniti. Vedi [data/README.md](data/README.md) per come scaricare `symbols-designer.svg` e impostare `symbolId` in `components.js`.

Per una roadmap verso la **compatibilità con Circuitikz** (componenti, sintassi, import/export) vedi [COMPATIBILITA_CIRCUITIKZ.md](COMPATIBILITA_CIRCUITIKZ.md).

Still under development. Feel free to add any improvements to the app. Enjoy!
