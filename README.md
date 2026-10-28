# ItalyBasketStats 🏀

> **Statistiche Ufficiali del Basket Italiano Live** (FIP Stats &amp; NBN23 Swish Engine)  
> Web Application 100% Client-Side, Zero Mock Data, pronta per il deploy su **GitHub Pages**.

---

## 🚀 Caratteristiche Principali

- **⚡ Zero Mock Data & Zero Backend Required**:
  - Interroga direttamente le API federali ufficiali FIP (GraphQL su NBN23) e Italia Canestro.
  - Autenticazione dinamica con token Firebase generati in automatico nel browser con caching sicuro in `localStorage`.
  - Cascata di fallback CORS per garantire il funzionamento senza server proxy locali.
- **🏆 Directory Campionati Ufficiali FIP**:
  - Sfoglia per categoria: **Giovanili Eccellenza** (Under 15, Under 17, Under 19), **Nazionali Maschili** (Serie A, Serie A2, Serie B), **Regionali** (Serie C, DR1, DR2) e **Femminili** (A1, A2).
  - Risoluzione automatica multi-stagione per tutti i gironi, classifiche e calendari.
- **🔍 Ricerca Globale Live con Filtri Rigorosi**:
  - Filtri dedicati per **Giocatori**, **Squadre** e **Campionati** con isolamento stretto dei risultati.
  - Debounce live e ricerca su oltre 25.000 atleti e 1.800 società.
- **📊 Schede Atleta e Squadra Complete**:
  - Medie PPG, RPG, APG, Recuperi, Stoppate, Falli, Palle Perse e Percentuali di Tiro (2P, 3P, TL).
  - Grafico Radar Chart interattivo sulle performance complessive con Chart.js.
- **🌟 Valutazione Ufficiale FIBA (VAL / PIR)**:
  - Calcolo e visualizzazione della Valutazione federale ufficiale con popup esplicativo della formula di efficienza.
- **⚖️ Confronto Testa a Testa (Head-to-Head)**:
  - Grafico radar comparativo sovrapposto tra due atleti o squadre.
- **📱 Responsive Mobile & Tablet Ready**:
  - Interfaccia ottimizzata sia per l'uso verticale su smartphone sia per l'orientamento orizzontale su tablet e desktop.

---

## 📦 Struttura del Progetto

```text
ItalyBasketStats/
├── index.html        # UI dark glassmorphism responsive (Tailwind CSS + Lucide Icons)
├── styles.css        # Stili, animazioni e utility glassmorphism
├── app.js            # Motore GraphQL client-side, Auth Firebase, multi-season routing
├── CHANGELOG.md      # Registro dettagliato delle versioni (v1.2.0)
└── README.md         # Documentazione ufficiale del progetto
```

---

## 🌐 Pubblicazione su GitHub Pages

1. Inizializza la repository Git e pubblica su GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: release v1.2.0 zero-backend static app"
   git remote add origin https://github.com/<tuo-utente>/ItalyBasketStats.git
   git branch -M main
   git push -u origin main
   ```
2. Vai su **Settings** &rarr; **Pages** della tua repository GitHub.
3. Seleziona **Deploy from a branch**, branch `main`, cartella `/ (root)`.
4. La web app sarà accessibile all'indirizzo `https://<tuo-utente>.github.io/ItalyBasketStats/`.

---

## 🔬 Dettagli Tecnici & API Endpoints

- **Autenticazione**: Firebase Identity Toolkit Endpoint (`accounts:signUp`) con token JWT client NBN23.
- **GraphQL Endpoint**: `https://internal.nbn23.app/graphql`
- **Tipi GraphQL gestiti**: `Season`, `Competition`, `Group`, `Team`, `Player`, `UniquePlayer`, `Match`, `Standing`, `StandingStats`, `PlayerStats`.

---

## 📜 Licenza & Note

Progetto sviluppato a scopo statistico e divulgativo. I marchi e i dati appartengono ai rispettivi titolari e alla Federazione Italiana Pallacanestro (FIP / NBN23).
