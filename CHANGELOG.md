# Changelog - ItalyBasketStats2

Tutte le modifiche degne di nota a questo progetto sono documentate in questo file.

---

## [2.0.0] - 2026-10-28

### 🌟 Ricostruzione Completa & Focus Esclusivo su FIP Stats Live

- **Zero Mock Data & Live GraphQL Engine**:
  - Implementato client GraphQL puro con autenticazione Firebase automatica e gestione trasparente dei token di sessione FIP (`com.nbn23.fipapp` v2.13.0).
  - Supporto per query a stagioni multiple: `686e1422dd2c672160d5ca4b` (Giovanili Eccellenza U15/U17/U19, Serie A, Serie A2) e `6a6871330078694f2edb74f3` (Serie B Nazionale, Interregionale, Serie C, DR1, DR2).

- **Replicazione Fedele delle 8 Schermate Ufficiali**:
  - **Schermata 1 & 2 (Ricerca Universale & Risultati)**: Barra di ricerca in tempo reale con debounce 350ms, filtri rapidi (*Tutti*, *Atleti*, *Squadre*, *Campionati*) e rendering dinamico con ruoli, altezza, data di nascita e loghi società.
  - **Schermata 3 (Directory Campionati)**: Esploratore gerarchico di tutti i campionati italiani ufficiali con gironi, fasi e badge personalizzati.
  - **Schermata 4, 5, 6 (Match Center Completo)**:
    - Scoreboard con punteggio totale e parziali periodo per periodo (Q1, Q2, Q3, Q4, OT).
    - Sub-Tab *Confronto*: barre di confronto percentuali (2PT, 3PT, TL, Rimbalzi, Assist, Perse, Recuperi, Stoppate).
    - Sub-Tab *Andamento Partita*: grafico scarto con statistiche ufficiali di Massimo Vantaggio (`biggestLead`), Parità (`timesTied`) e Cambi di Vantaggio (`leadChanges`).
    - Sub-Tab *Grafico dei Tiri*: mappa interattiva SVG del campo di gioco con coordinate dei tiri realizzati e sbagliati.
    - Sub-Tab *Tabellino*: boxscore completo per atleta conforme agli standard FIP/FIBA.
    - Sub-Tab *Quintetti*: analisi dei 5 atleti in campo (`matchLineupStats`) con minuti, rendimento e +/-.
  - **Schermata 7 & 8 (Profili Atleti & Società)**:
    - Profilo atleta con medie a partita (PPG, RPG, APG, Valutazione FIBA, +/-) e storico partite con tabellino individuale.
    - Profilo squadra con roster, calendario gare e classifica di girone.
  - **Head-to-Head**: Strumento di comparazione testa a testa tra due atleti con Radar Chart a 6 dimensioni.

- **Design & UI**:
  - Dark Theme ufficiale FIP (*Deep Navy*, *FIP Blue*, *Gold*, *Emerald*).
  - Layout completamente reattivo ottimizzato sia per desktop/tablet orizzontale che per smartphone verticale con barra di navigazione inferiore.
  - Nessuna dipendenza obbligatoria da script PowerShell o proxy locali proprietari.
