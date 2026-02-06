# Simboli opzionali da CircuiTikZ-Designer

Per usare i **simboli grafici** del [CircuiTikZ-Designer](https://github.com/Circuit2TikZ/CircuiTikZ-Designer) al posto di quelli predefiniti di Tikiz2:

1. Scarica il file dei simboli dal repository ufficiale:

   - **URL**: https://github.com/Circuit2TikZ/CircuiTikZ-Designer/raw/main/src/data/symbols.svg
   - (Oppure clona il repo e copia `src/data/symbols.svg` qui.)

2. Salva il file in questa cartella con il nome:

   ```
   symbols-designer.svg
   ```

   Percorso finale: `Tikiz2/data/symbols-designer.svg`

3. In `components.js` i **`symbolId`** sono già mappati per la maggior parte dei componenti (monopoli, resistori, condensatori, induttori, sorgenti, diodi, transistor, op-amp, interruttori, metri, NOT, misc). Le porte AND e OR non hanno un symbol corrispondente nel Designer e usano i simboli predefiniti.

4. Riavvia o ricarica l’editor (F5). Se il file è presente, Tikiz2 caricherà i simboli e userà quelli con `symbolId` configurato; gli altri restano con i simboli predefiniti.

**Nota:** gli id nel file Designer seguono il pattern `node_...` (nodi/monopoli) o `path_...` (bipoli). Per aggiungere nuovi componenti, cerca nel file la stringa `id="` per l’elenco degli id disponibili.

I simboli del Designer sono gli stessi usati nell’editor online [circuit2tikz.tf.fau.de/designer/](https://circuit2tikz.tf.fau.de/designer/) e sono ottimizzati per Circuitikz.  
Se `symbols-designer.svg` non è presente, l’editor continua a usare i simboli predefiniti.
