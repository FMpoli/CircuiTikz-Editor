# Compatibilità con Circuitikz – Roadmap

Obiettivo: rendere Tikiz2 il più possibile compatibile con la sintassi e i componenti del pacchetto [Circuitikz](https://github.com/circuitikz/circuitikz) (LaTeX), in modo da poter **importare** codice Circuitikz esistente e **esportare** codice che compili senza modifiche.

---

## 1. Cosa supporta Circuitikz (riferimento)

- **Bipoli** (due terminali): `(a) to[R, l=$R_1$] (b)`, `to[V,v=$V_s$]`, `to[C]`, `to[L]`, `to[generic]`, ecc.  
  Nomi stile: `R`, `C`, `L`, `V`, `I`, `battery1`, `sV`, `D`, `led`, `generic`, `short`, `open`, `crossing`, `vsource`, `isource`, `resistor`, `capacitor`, `inductor`, varianti european/american, ecc.
- **Monopoli** (un terminale): `node [ground] {}`, `node [vcc] {}`, `node [vee] {}`, `node [antenna] {}`.  
  Posizionamento: `\node[ground](GND) at (x,y) {}` oppure inline `(x,y) node [ground] {}`.
- **Tripoli** (transistor, op-amp): `\node[npn](Q1) at (x,y) {}`, `\node[op amp](A1) at (x,y) {}`, con anchor `(Q1.B)`, `(Q1.C)`, `(Q1.E)`, ecc.
- **Percorsi**: `--`, `|-`, `-|`, coordinate `(x,y)`, nomi nodo `(A.anchor)`.
- **Opzioni**: `l=`, `v=`, `i=`, `a=`, `invert`, `european`, stili globali con `\ctikzset`, ecc.

Il manuale e i sorgenti (es. `pgfcircbipoles.tex`) sono la referenza ufficiale per nomi e opzioni.

---

## 2. Stato attuale Tikiz2

| Aspetto                 | Supporto | Note                                                                                                                                                                                          |
| ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------ |
| **Export**              | Buono    | Genera `\node[type](name) at (x,y) {}` e `to[type, l=..., a=...]` corretti per circuitikz.                                                                                                    |
| **Import – nodi**       | Parziale | Solo `\node[opts](name) at (x,y) {}`. Manca `(x,y) node [ground] {}` (inline).                                                                                                                |
| **Import – bipoli**     | Parziale | Tutti i `(p1) to[opts] (p2)` e `--`/`                                                                                                                                                         | -`/`- | `; riconosciuti solo i tipi presenti in tikzMap. |
| **Libreria componenti** | Parziale | Resistenze, condensatori, induttori, sorgenti, diodi, LED, transistor, op-amp, interruttori, porte logiche, ecc. Manca parte dei bipoli “rari” (termistori, fotoresistenze, memristor, ecc.). |
| **Alias tikzMap**       | Parziale | R, V, led, generic, battery1, ecc. Aggiungere tutti i nomi “corto” usati in `to[X]` e `node[X]`.                                                                                              |
| **Opzioni**             | Parziale | `l=`, `a=`, `european resistor`. Manca gestione esplicita di `v=`, `i=`, `invert` in export/import.                                                                                           |

---

## 3. Roadmap (priorità)

### Fase A – Parser (import) – compatibilità sintassi

- [x] Estrazione blocco `\begin{circuitikz}...\end{circuitikz}` anche da documento completo.
- [x] Tutti i segmenti `(p1) to[X] (p2)` e `(p1) --/|-/-| (p2)` in ogni `\draw`.
- [x] **Nodi inline**: `(x,y) node [ground] {}`, `(x,y) node [vcc] {}`, `(x,y) node [vee] {}`, `(x,y) node [circ] {}` (ignorato, giunzione).
- [ ] Riconoscere opzioni `v=`, `i=`, `invert` in export/UI (i componenti V/I sono già mappati).

### Fase B – Alias e tikzMap – massima copertura nomi

- [x] Aggiungere in `getCompFromTikzName` **tutti** i nomi usati in Circuitikz per:
  - bipoli: `R`, `C`, `L`, `V`, `I`, `sV`, `battery1`, `battery2`, `generic`, `short`, `open`, `D`, `zD`, `led`, `leD`, `vsource`, `isource`, `resistor`, `capacitor`, `inductor`, `vresistor`, `potentiometer`, `vcapacitor`, `ecapacitor`, `ccapacitor`, `piezoelectric`, `cpe`, `thermistor`, `photoresistor`, `varistor`, `mov`, `memristor`, `crossing`, `fuse`, `lamp`, ecc.;
  - monopoli: `ground`, `vcc`, `vee`, `antenna`;
  - tripoli: già gestiti da `components.js` (npn, pnp, nmos, pmos, nfet, pfet, njfet, pjfet, nigbt, pigbt, hemt, op amp, ecc.).
- [x] Per tipi non presenti in Tikiz2: mappati al componente più vicino (es. thermistor → resistor, photoresistor → resistor) così l’import almeno “disegna qualcosa” e il codice può essere esportato con il nome generico.

### Fase C – Libreria componenti (opzionale, incrementale)

- [ ] Aggiungere in `components.js` i componenti Circuitikz più richiesti che ancora mancano (es. termistore, fotoresistenza, memristor, varianti induttori “cute”/“american”, ecc.) con `tikzName` e SVG appropriati.
- [ ] Allineare nomi e opzioni (es. `bulk`, `solderdot`) al manuale Circuitikz.

### Fase D – Export avanzato

- [ ] Emettere opzioni `v=`, `i=`, `invert` quando l’utente le imposta in proprietà (es. “mostra tensione”, “inverti”).
- [ ] Supportare `[american voltages]` / `[american]` e stili europei in base a preferenza progetto.

---

## 4. Riferimenti

- Repository Circuitikz: https://github.com/circuitikz/circuitikz
- Manuale (doc): `doc/circuitikzmanual.tex` e PDF su CTAN.
- Bipoli (nomi e stili): `tex/pgfcircbipoles.tex`.
- Riferimento locale Tikiz2: `CIRCUITIKZ_TRANSISTORI_RIFERIMENTO.md`.

---

## 5. Come contribuire

- Per **import**: testare con file `.tex` reali; segnalare messaggi “componente non riconosciuto” o “nodo non disegnato” con il frammento di codice.
- Per **export**: verificare che il codice generato compili in un documento `standalone` con `\usepackage[american]{circuitikz}` (e eventualmente `\usetikzlibrary{calc}`).
- Nuovi componenti: aggiungere in `components.js` con `tikzName` uguale a quello del manuale Circuitikz e registrare l’alias in `app.js` (getCompFromTikzName) se il nome in codice è diverso (es. `led` → `leD`).
