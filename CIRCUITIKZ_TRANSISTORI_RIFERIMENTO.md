# Circuitikz e transistor – Uso corretto della libreria

Riferimento per Tikiz2: verifiche e miglioramenti per i transistor (e in generale per Circuitikz).

---

## 1. State usando la libreria giusta

Tikiz2 usa **Circuitikz** (pacchetto LaTeX che estende TikZ per i circuiti), non “TikZ da solo”. La sintassi che generate è quella corretta per Circuitikz:

- **Transistor (tripoli)** = componenti **node-style**:
  ```latex
  \node[npn] (Q1) at (x,y) {};
  ```
- **Anchor** per i terminali: `(Q1.B)`, `(Q1.C)`, `(Q1.E)` per BJT; `(Q1.G)`, `(Q1.D)`, `(Q1.S)` per FET/MOS.
- **Bipoli** (R, C, diodi, ecc.) = **path-style** con `to[R]`, `to[C]`, ecc.: anche questo è corretto.

Quindi, a livello di “libreria”, l’uso è **corretto**.

---

## 2. Cosa dice il manuale Circuitikz sui transistor

- **Posizionamento**: si usa `node[npn] (nome) at (x,y) {}` oppure, per allineare un terminale a un punto, `anchor=...`:

  ```latex
  \draw (bjt) node[npn, anchor=B](Q2){};
  ```

  Così la **base** del transistor è esattamente nel punto `(bjt)`.

- **Scala e rotazione** (sezione “Known bugs and limitation”):

  - **Non** usare scale **negativi** globali (`scale`, `xscale`, `yscale` negativi) senza `transform shape`; con scale negativi il comportamento può essere errato.
  - Per nodi (transistor, op-amp) **è lecito** usare `xscale=-1` / `yscale=-1` sul singolo nodo (es. per specchiare). Il manuale lo fa negli esempi (op-amp, transistor).

- **Dimensioni tripoli**: si possono impostare con `\ctikzset`, ad esempio:

  ```latex
  \ctikzset{tripoles/npn/height=2.0, tripoles/npn/width=1.0}
  ```

  Lo state già emettendo nel codice generato; è corretto.

- **Bug noto (issue #74)**: con i tripoli **scalati**, le posizioni degli anchor possono essere sbagliate. Se in uscita il PDF ha fili staccati dai terminali, può dipendere da questo (o da scale globale senza `transform shape`).

---

## 3. Possibili cause per cui “i transistor non vengono disegnati bene”

### A) Disegno in canvas (SVG) vs output LaTeX

- In **Tikiz2** il disegno a schermo è fatto con **SVG custom** in `components.js` (path e polygon per ogni tipo di transistor).
- Il **PDF** è prodotto da **Circuitikz**, che ha forme proprie (diverse da quelle SVG).
- È normale che canvas e PDF non siano identici. Se il problema è “sulla pagina non sono belli” ma i collegamenti sono giusti, la causa è questa differenza di disegno, non un uso sbagliato della libreria.

### B) Posizionamento senza `anchor`

- Oggi generate sempre:
  ```latex
  \node[npn, rotate=..., xscale=...] (Q) at (x,y) {};
  ```
  cioè il nodo è posizionato per **centro** in `(x,y)`.
- In Circuitikz, con `rotate`, il nodo ruota attorno al suo center, quindi gli anchor B/C/E si muovono insieme e i fili che usano `(Q.B)`, `(Q.C)`, `(Q.E)` restano coerenti.
- Se però l’utente si aspetta che un filo “attacchi” esattamente a un certo punto (es. la base su una coordinata precisa), può essere utile generare **anche** `anchor=B` (o C/E) quando si posiziona il transistor in base al primo filo collegato. Esempio:
  ```latex
  \draw (2,1) node[npn, anchor=B](Q1){};
  ```
  così la base è esattamente in `(2,1)`.

### C) Scala/rotazione globale e `transform shape`

- Se in futuro aggiungete uno **scale globale** all’ambiente (es. `\begin{circuitikz}[scale=0.8]`), il manuale raccomanda di usare anche **`transform shape`**:
  ```latex
  \begin{circuitikz}[american, scale=0.8, transform shape]
  ```
  Altrimenti Circuitikz può dare risultati strani (in particolare con scale negativi).

### D) Opzioni BJT in `components.js`

- Per **npn/pnp** avete `availableOptions: ['bulk', 'solderdot']`.
- In Circuitikz i BJT **non** hanno il concetto di “bulk” (è per MOSFET/FET). L’opzione `solderdot` può esistere per alcuni transistor. Se nel codice generato passate `bulk` a un npn/pnp e Circuitikz vi dà errore o stranezze, conviene togliere `bulk` dalle opzioni dei BJT e lasciarlo solo per FET/MOS.

---

## 4. Verifica degli anchor e orientamento (BJT)

In Circuitikz, per **npn** (e analogamente per **pnp**):

- **B** (base) = a sinistra
- **C** (collettore) = in alto
- **E** (emettitore) = in basso

Le vostre definizioni in `components.js` sono coerenti:

- **npn**: `B` a (-40,0), `C` a (0,-40), `E` a (0,40) → base sinistra, collettore sopra, emettitore sotto. **OK**.
- **pnp**: `B` (-40,0), `C` (0,40), `E` (0,-40) → base sinistra, collettore sotto, emettitore sopra. **OK**.

Quindi **orientamento e nomi anchor** sono corretti rispetto a Circuitikz.

---

## 5. Suggerimenti operativi

1. **Mantenere** la generazione di `\ctikzset{tripoles/.../height=..., width=...}` per i tipi usati (come già fate).
2. **Opzionale**: quando si piazza un transistor, se il primo filo collegato è su un terminale (es. B), generare `anchor=B` e usare come coordinate del nodo il punto di quel terminale invece del centro; così in LaTeX il simbolo è ancorato al filo e il disegno risulta più pulito.
3. **Se** usate scale globale nell’ambiente circuitikz, aggiungete **sempre** `transform shape` nelle opzioni dell’ambiente.
4. **BJT**: rimuovere `bulk` da `availableOptions` per npn/pnp se non è supportato da Circuitikz per i BJT (e lasciarlo solo per nmos/pmos/nfet/pfet dove ha senso).
5. **SVG in canvas**: se l’obiettivo è che il disegno in editor assomigli di più al PDF, si possono rifinire le path SVG dei transistor (proporzioni, spessore linea base, freccia emettitore) ispirandosi alle figure del manuale Circuitikz; la libreria però la state già usando in modo corretto.

---

## 6. Riepilogo

- **Libreria**: uso di **Circuitikz** e sintassi `\node[npn]...`, `(Q.B)` ecc. è **corretto**.
- **Problemi possibili**: (1) differenza aspetto SVG vs PDF; (2) posizionamento senza `anchor` quando serve un attacco preciso; (3) scale globale senza `transform shape`; (4) opzione `bulk` sui BJT se non supportata.
- **Transistor “non disegnati bene”**: spesso è il **disegno** (canvas o proporzioni nel PDF), non la correttezza della libreria; allineare meglio con `anchor=...` e con `transform shape` quando si scala migliora il risultato lato LaTeX.

Se mi dici se il problema è soprattutto **in editor** (SVG) o **nel PDF** (Circuitikz), si può puntare il fix in una delle due direzioni (migliorare le SVG in `components.js` oppure la generazione del codice LaTeX).
