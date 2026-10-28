# 🏀 FIP Stats Live Web App (v2.0.0)

Applicazione web moderna, reattiva e *real-time* per la consultazione e il monitoraggio di tutti i dati della **Federazione Italiana Pallacanestro (FIP)**, basata su query live dirette al backend ufficiale **NBN23 GraphQL**.

Zero dati mockati. Zero database locali obsoleti. Tutte le informazioni su atleti, squadre, campionati, calendari, classifiche e statistiche avanzate vengono interrogate in tempo reale.

---

## 📱 Schermate e Funzionalità Ufficiali

L'applicazione replica fedelmente e potenzia le 8 schermate dell'app ufficiale **FIP Stats** (`com.nbn23.fipapp`):

1. **Ricerca Universale Real-time (Screen 1 & 2)**
   - Barra di ricerca con debounce automatico (350ms) e filtri rapidi (*Tutti*, *Atleti*, *Squadre*, *Campionati*).
   - Risoluzione su oltre 25.000 atleti, 1.800 società e tutti i tornei nazionali e giovanili.
   - Schede risultati interattive con indicatori di categoria, ruolo, altezza, data di nascita e fid societari.

2. **Directory Ufficiale Campionati (Screen 3 & 4)**
   - Esploratore organizzato per categorie:
     - 🌟 **Giovanili Eccellenza**: Under 15 Eccellenza (19 gironi/fasi), Under 17 Eccellenza (11 gironi/fasi), Under 19 Eccellenza.
     - 🏆 **Nazionali Maschili**: Serie A, Serie A2, Serie B Nazionale, Serie B Interregionale.
     - 📍 **Regionali Maschili**: Serie C Unica, Divisione Regionale 1 (DR1), Divisione Regionale 2 (DR2).
     - 👑 **Femminili**: Serie A1 Femminile, Serie A2 Femminile, Serie B Femminile.
   - Cambio stagione multi-chiave (`686e1422dd2c672160d5ca4b` per Eccellenza/A/A2 e `6a6871330078694f2edb74f3` per Serie B/C/DR).

3. **Match Center Completo (Screen 4, 5, 6)**
   - **Scoreboard Ufficiale**: punteggio totale in tempo reale e parziali periodo per periodo (Q1, Q2, Q3, Q4, OT).
   - **Sub-Tab 1: Confronto Squadre**: barre percentuali di tiro (2PT, 3PT, TL), rimbalzi offensivi/difensivi, assist, palle perse, recuperi e stoppate.
   - **Sub-Tab 2: Andamento Partita**: grafico temporale dello scarto con indicatori di *Massimo Vantaggio* (`biggestLead`), *Parità* (`timesTied`) e *Cambi di Vantaggio* (`leadChanges`).
   - **Sub-Tab 3: Grafico dei Tiri (Shot Map)**: mappa campo interattiva SVG con coordinate esatte dei tiri realizzati (verdi) e sbagliati (rossi).
   - **Sub-Tab 4: Tabellino Ufficiale FIP**: tabella statistica completa per giocatore (Minuti, Punti, 2PT M/T, 3PT M/T, TL M/T, Rimbalzi O/D/Tot, Assist, Recuperi, Perse, Stoppate F/S, Falli C/S, Valutazione FIBA, Plus/Minus +/-).
   - **Sub-Tab 5: Quintetti in Campo**: analisi dei 5 atleti schierati con minuti condivisi, rendimento offensivo/difensivo e +/- cumulativo.

4. **Profilo Atleta & Squadra (Screen 7 & 8)**
   - **Atleta**: foto ufficiale, ruolo, altezza, età, statistiche medie a partita (PPG, RPG, APG, FIBA Val, +/-) e storico cronologico delle ultime partite con tabellino individuale.
   - **Squadra**: roster completo con numeri di maglia e ruoli, calendario gare con stato (Finale/In corso/Programmata) e classifica aggiornata del girone.

5. **Classifiche e Calendari in Tempo Reale**
   - Classifiche ufficiali con Punti, Giocate, Vinte, Perse, Punti Fatti (PF), Punti Subiti (PS) e Differenza Canestri (Diff).
   - Tabelloni gare completi per ciascun girone.

6. **Strumento di Confronto Head-to-Head (H2H)**
   - Comparazione testa a testa tra 2 atleti con grafico Radar Chart a 6 assi (Punti, Rimbalzi, Assist, Recuperi, Stoppate, Valutazione FIBA) e tabella dettagliata dei percentili di tiro.

---

## ⚡ Architettura Tecnica

- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Semantico, Tailwind CSS (Dark Theme FIP), Lucide Icons, Chart.js.
- **Backend API**: NBN23 GraphQL (`https://internal.nbn23.app/graphql`).
- **Autenticazione**: Acquisizione dinamica e trasparente di token Firebase (`identitytoolkit.googleapis.com`) con rinnovo automatico prima della scadenza.
- **Supporto CORS Resiliente**:
  1. *Direct Fetch* (quando eseguito in contesti che non impongono restrizioni CORS o con estensioni);
  2. *Local Proxy Endpoint* (`/graphql`);
  3. *Cloud Proxy Fallbacks* trasparenti e resilienti (`corsproxy.io`, `allorigins.win`).
- **Layout Responsivo**:
  - Modalità Desktop / Tablet orizzontale: barra di navigazione orizzontale in testata e griglie a 3 colonne.
  - Modalità Smartphone verticale: barra di navigazione inferiore fissa (*Bottom Nav Bar*) a 5 pulsanti, tabelle a scorrimento orizzontale con touch nativo.

---

## 🚀 Come Eseguire l'Applicazione

### Metodo 1: Doppio Click Locale (Standalone)
Fai doppio click su `index.html` per aprirlo direttamente in qualsiasi browser moderno (Chrome, Edge, Firefox, Safari).

### Metodo 2: Tramite Server Locale (Consigliato per massime prestazioni)
Se hai Node.js installato:
```bash
# Avvio rapido con npx serve
npx serve .
```
Oppure fai doppio click sul file `start.bat`.

---

## 📂 Struttura del Progetto

```
C:\TEMP\ItalyBasketStats2\
├── index.html           # Interfaccia grafica completa con viste e modali
├── styles.css           # Foglio di stile personalizzato Dark Theme FIP & SVG Campo
├── app.js               # Engine GraphQL, gestione stato, viste e grafici
├── README.md            # Documentazione tecnica
├── CHANGELOG.md         # Registro delle versioni
├── package.json         # Configurazione per eventuale deploy Node/Vite
└── start.bat            # Script di avvio rapido locale
```

---

## 📄 Note e Licenza

Dati e statistiche sono di proprietà della **Federazione Italiana Pallacanestro (FIP)** e forniti tramite l'infrastruttura **NBN23**.
Progetto sviluppato per finalità di analisi tecnica e consultazione sportiva.
