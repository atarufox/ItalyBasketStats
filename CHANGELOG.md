# Changelog

Tutte le modifiche degne di nota a questo progetto sono documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/)
e questo progetto aderisce a [Semantic Versioning](https://semver.org/lang/it/).

---

## [1.2.0] - 2026-10-28

### Risolto
- **Risoluzione Multi-Stagione per i Campionati FIP**:
  - Risolto l'errore di caricamento dei campionati (`openChampionshipByQuery` e `searchCompetitions`).
  - Implementata la risoluzione iterativa multi-stagione (`686e1422dd2c672160d5ca4b` per Giovanili Eccellenza U15/U17/U19, Serie A, Serie A2 e Femminili; `6a6871330078694f2edb74f3` per Serie B, Serie C, DR1, DR2).
- **Isolamento Rigoroso dei Filtri di Ricerca**:
  - Risolto il problema per cui cercando con il filtro "Giocatori" venivano restituite anche le squadre.
  - Applicato filtro tipologico rigoroso (`type === 'player' | 'uniquePlayer'` per Giocatori, `type === 'team'` per Squadre, `type === 'competition'` per Campionati).
- **Provider Switcher e Loading Indicator**:
  - Risolto il blocco del loader infinito quando si cambiava provider su "Italia Canestro" o "FIP Stats".
  - Aggiornato dinamicamente il testo dello stato di caricamento (`loadingIndicatorText`) in base al motore attivo.
  - Garanzia di disattivazione dello spinner con blocco `try ... finally`.

### Rimosso
- **Eliminazione Dipendenze Backend**:
  - Rimossi definitivamente gli script `server.ps1`, `server.js` e `server.py`.
  - L'applicazione opera al 100% in modalità statica client-side con token Firebase generati in-browser e gateway CORS di fallback, rendendola pronta per il deploy diretto su GitHub Pages.

---

## [1.1.0] - 2026-10-28

### Aggiunto
- **Architettura Zero-Backend per Hosting Statico (GitHub Pages)**:
  - Generazione dinamica client-side dei token di autenticazione Firebase JWT (`identitytoolkit.googleapis.com`) direttamente dal browser con rotazione automatica.
  - Client GraphQL resiliente con cascata automatica: Server Proxy Locale $\rightarrow$ Connessione Diretta FIP $\rightarrow$ CORS Gateway mirrors (`corsproxy.io`, `allorigins`).
- **Hub Directory Campionati ("Campionati")**:
  - Nuova sezione e tab di navigazione per sfogliare i campionati italiani divisi per categorie (Giovanili Eccellenza, Nazionali, Regionali, Femminili).
- **Documentazione e Spiegazione Valutazione FIBA (VAL / PIR)**:
  - Modal informativo interattivo con la formula ufficiale di efficienza individuale FIBA.

### Modificato
- Ridenominata la metrica nei tabellini e schede atleta da "FIBA Rating" al termine standard federale italiano: **"Valutazione (VAL)"**.
- Ottimizzata la responsive bar per smartphone in verticale e tablet orizzontale.

---

## [1.0.0] - 2026-10-27

### Aggiunto
- **Reverse Engineering Completo APK FIP Stats (NBN23)**:
  - Endpoint GraphQL live `https://internal.nbn23.app/graphql`.
  - Introspezione e mappatura schema: `Season`, `Competition`, `Group`, `Team`, `Player`, `UniquePlayer`, `Match`, `Standing`, `StandingStats`, `PlayerStats`.
- **Reverse Engineering Completo APK Italia Canestro**:
  - Endpoint REST API `https://www.italiacanestro.it/api/App/...`.
- **Interfaccia Web Glassmorphism Responsive**:
  - Motore di ricerca universale con live debounce per atleti, squadre e campionati.
  - Schede squadra con rosa completa e medie punti/rimbalzi/assist/valutazione.
  - Schede giocatore con radar chart prestazionale Chart.js e percentuali di tiro (2PT, 3PT, TL).
  - Profilo carriera unificato aggregato (`UniquePlayer`).
  - Strumento di confronto testa a testa (Head-to-Head) con grafico radar comparativo a 2 atleti.
