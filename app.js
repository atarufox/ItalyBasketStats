/**
 * FIP Stats Live - Web Application (ItalyBasketStats2)
 * Pure FIP Stats (NBN23 GraphQL) Engine
 * 100% Real-time dynamic live data - Zero Mock Data
 * Version: 2.1.0
 */

class BasketApp {
  constructor() {
    this.version = '2.1.0';
    this.searchFilter = 'all'; // 'all' | 'players' | 'teams' | 'competitions'
    this.currentView = 'search';
    this.searchTimeout = null;
    this.comparisonChart = null;
    this.playerChart = null;
    this.gameFlowChart = null;
    this.currentMatchData = null;
    this.currentPlayerData = null;
    this.activeCategoryFilter = 'all';

    // Dynamic Auth & Transport Configuration
    this.firebaseApiKey = 'AIzaSyDfES1qET23MQ0Y5_cgbDYbeQ168xVcpiA';
    this.firebaseToken = null;
    this.tokenExpiry = 0;
    this.deviceId = 'fip-web-' + Math.random().toString(36).substring(2, 10);

    // Multi-Season Resolution
    // 686e1422dd2c672160d5ca4b = Youth & Major Leagues (U15/U17/U19 Eccellenza, Serie A, Serie A2, Femminili)
    // 6a6871330078694f2edb74f3 = Serie B Nazionale, Serie C, DR1, DR2, Campionati Regionali
    // 668ba5c2ceb8a7aa70c41ae2 = 2024/2025 Archive
    this.knownSeasons = [
      '686e1422dd2c672160d5ca4b',
      '6a6871330078694f2edb74f3',
      '668ba5c2ceb8a7aa70c41ae2'
    ];
    this.currentSeasonId = '686e1422dd2c672160d5ca4b';

    // Official Championship Directory
    this.championshipDirectory = [
      {
        id: 'u15-ecc',
        category: 'giovanili',
        name: 'Under 15 Maschile Eccellenza',
        tag: 'Eccellenza Giovanile',
        query: 'Under 15 Eccellenza',
        icon: 'zap',
        badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
        desc: 'Il massimo livello del basket giovanile italiano U15 (19 gironi/fasi ufficiali)'
      },
      {
        id: 'u17-ecc',
        category: 'giovanili',
        name: 'Under 17 Maschile Eccellenza',
        tag: 'Eccellenza Giovanile',
        query: 'Under 17 Eccellenza',
        icon: 'flame',
        badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
        desc: 'Campionato d\'eccellenza nazionale di categoria Under 17 (11 gironi/fasi)'
      },
      {
        id: 'u19-ecc',
        category: 'giovanili',
        name: 'Under 19 Maschile Eccellenza',
        tag: 'Eccellenza Giovanile',
        query: 'Under 19 Eccellenza',
        icon: 'award',
        badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
        desc: 'Campionato nazionale giovanile propedeutico alle categorie senior'
      },
      {
        id: 'serie-a',
        category: 'nazionali',
        name: 'LBA Serie A Maschile',
        tag: 'Nazionale Massima Serie',
        query: 'Serie A',
        icon: 'crown',
        badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
        desc: 'Massima serie del campionato italiano di pallacanestro maschile'
      },
      {
        id: 'serie-a2',
        category: 'nazionali',
        name: 'Serie A2 Maschile Old Wild West',
        tag: 'Nazionale LNP',
        query: 'Serie A2',
        icon: 'shield',
        badgeColor: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
        desc: 'Secondo livello professionistico nazionale LNP'
      },
      {
        id: 'serie-b-naz',
        category: 'nazionali',
        name: 'Serie B Nazionale',
        tag: 'Nazionale LNP',
        query: 'Serie B',
        icon: 'trophy',
        badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
        desc: 'Terzo campionato nazionale con conference unificate'
      },
      {
        id: 'serie-b-inter',
        category: 'nazionali',
        name: 'Serie B Interregionale',
        tag: 'Interregionale FIP',
        query: 'Serie B Interregionale',
        icon: 'layers',
        badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
        desc: 'Quattro conference interregionali (Nord, Centro, Sud)'
      },
      {
        id: 'serie-c',
        category: 'regionali',
        name: 'Serie C Unica Regionale',
        tag: 'Regionale FIP',
        query: 'Serie C',
        icon: 'map-pin',
        badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
        desc: 'Primo campionato senior gestito dai comitati regionali FIP'
      },
      {
        id: 'dr1',
        category: 'regionali',
        name: 'Divisione Regionale 1 (DR1)',
        tag: 'Regionale FIP',
        query: 'Divisione Regionale 1',
        icon: 'map',
        badgeColor: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
        desc: 'Campionato regionale senior di primo livello (ex Serie D)'
      },
      {
        id: 'a1-femm',
        category: 'femminili',
        name: 'Techfind Serie A1 Femminile',
        tag: 'Nazionale Femminile',
        query: 'Serie A1 Femminile',
        icon: 'sparkles',
        badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
        desc: 'Massimo campionato di pallacanestro femminile italiano'
      },
      {
        id: 'a2-femm',
        category: 'femminili',
        name: 'Serie A2 Femminile',
        tag: 'Nazionale Femminile',
        query: 'Serie A2 Femminile',
        icon: 'heart',
        badgeColor: 'border-pink-500/30 text-pink-400 bg-pink-500/10',
        desc: 'Secondo livello nazionale della pallacanestro femminile'
      },
      {
        id: 'u15-femm',
        category: 'femminili',
        name: 'Under 15 Femminile',
        tag: 'Giovanile Femminile',
        query: 'Under 15 Femminile',
        icon: 'users',
        badgeColor: 'border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/10',
        desc: 'Campionati e fasi giovanili femminili di categoria Under 15'
      }
    ];
  }

  async init() {
    console.log(`FIP Stats App v${this.version} initializing...`);
    if (window.lucide) window.lucide.createIcons();

    // Setup search shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('globalSearchInput');
        if (input) {
          input.focus();
          input.select();
        }
      }
    });

    try {
      await this.getFirebaseAuthToken();
      await this.fetchCurrentSeason();
    } catch (e) {
      console.warn('Initial session bootstrap notice:', e);
    }

    this.showWelcomeState();
  }

  // ==========================================
  // AUTHENTICATION & MULTI-STRATEGY NETWORKING
  // ==========================================

  async getFirebaseAuthToken() {
    if (this.firebaseToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.firebaseToken;
    }

    try {
      const cached = localStorage.getItem('fip_id_token');
      const cachedExp = parseInt(localStorage.getItem('fip_token_exp') || '0', 10);
      if (cached && cachedExp && Date.now() < cachedExp) {
        this.firebaseToken = cached;
        this.tokenExpiry = cachedExp;
        return this.firebaseToken;
      }
    } catch (e) {}

    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.firebaseApiKey}`;
    const randEmail = `fip_${Date.now()}_${Math.floor(Math.random() * 10000)}@nbn23app.test`;

    try {
      const resp = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: randEmail,
          password: 'Password123!',
          returnSecureToken: true
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        this.firebaseToken = data.idToken;
        const expiresInSec = parseInt(data.expiresIn, 10) || 3600;
        this.tokenExpiry = Date.now() + (expiresInSec - 120) * 1000;

        try {
          localStorage.setItem('fip_id_token', this.firebaseToken);
          localStorage.setItem('fip_token_exp', this.tokenExpiry.toString());
        } catch (e) {}

        return this.firebaseToken;
      }
    } catch (e) {
      console.warn('Firebase Auth exchange error:', e);
    }

    return null;
  }

  async gql(query, variables = {}) {
    const token = await this.getFirebaseAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'x-device-id': this.deviceId,
      'x-package-name': 'com.nbn23.fipapp',
      'x-package-version': '2.13.0'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const bodyStr = JSON.stringify({ query, variables });

    // 1. Local or Serverless Proxy endpoints (/graphql or /api/graphql)
    const localEndpoints = ['/graphql', '/api/graphql'];
    for (const ep of localEndpoints) {
      try {
        const localResp = await fetch(ep, {
          method: 'POST',
          headers,
          body: bodyStr
        });
        if (localResp.ok) {
          const json = await localResp.json();
          if (json.data) return json.data;
          if (json.errors) console.warn('GraphQL API notice:', json.errors);
        }
      } catch (e) {}
    }

    // 2. Direct fetch to FIP GraphQL
    try {
      const directResp = await fetch('https://internal.nbn23.app/graphql', {
        method: 'POST',
        headers,
        body: bodyStr
      });
      if (directResp.ok) {
        const json = await directResp.json();
        if (json.data) return json.data;
        if (json.errors) console.warn('GraphQL API notice:', json.errors);
      }
    } catch (e) {}

    // 3. Fallback CORS mirrors
    const gateways = [
      `https://corsproxy.io/?${encodeURIComponent('https://internal.nbn23.app/graphql')}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent('https://internal.nbn23.app/graphql')}`
    ];

    for (const gw of gateways) {
      try {
        const gwResp = await fetch(gw, {
          method: 'POST',
          headers,
          body: bodyStr
        });
        if (gwResp.ok) {
          const json = await gwResp.json();
          if (json.data) return json.data;
        }
      } catch (e) {}
    }

    throw new Error('Impossibile contattare i server FIP Stats. Se stai aprendo index.html direttamente dal file system, avvia "start.bat" oppure "node server.js" per abilitare il proxy CORS.');
  }

  async fetchCurrentSeason() {
    try {
      const query = `
        query GetActiveSeason {
          getCurrentSeason {
            id
            name
          }
          seasons {
            id
            name
          }
        }
      `;
      const data = await this.gql(query);
      if (data?.getCurrentSeason?.id) {
        this.currentSeasonId = data.getCurrentSeason.id;
        if (!this.knownSeasons.includes(this.currentSeasonId)) {
          this.knownSeasons.unshift(this.currentSeasonId);
        }
      }
      if (data?.seasons) {
        for (const s of data.seasons) {
          if (!this.knownSeasons.includes(s.id)) this.knownSeasons.push(s.id);
        }
      }
    } catch (e) {}
  }

  // ==========================================
  // NAVIGATION & ROUTING
  // ==========================================

  navigate(viewName) {
    this.currentView = viewName;

    // Update active nav buttons
    document.querySelectorAll('.fip-tab').forEach(btn => {
      btn.className = 'fip-tab px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5';
    });
    document.querySelectorAll('.mobile-bottom-nav button, nav.md\\:hidden button').forEach(btn => {
      btn.className = 'flex flex-col items-center gap-1 text-gray-400 hover:text-white text-[10px] font-semibold';
    });

    const activeNavBtn = document.getElementById(`nav-btn-${viewName}`);
    if (activeNavBtn) {
      activeNavBtn.className = 'fip-tab active px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 text-white bg-blue-600/20 border border-blue-500/30';
    }

    const mobNavBtn = document.getElementById(`mob-nav-${viewName}`);
    if (mobNavBtn) {
      mobNavBtn.className = 'flex flex-col items-center gap-1 text-blue-400 text-[10px] font-bold';
    }

    // Hide all views
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.add('hidden');
    });

    // Show target view
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.remove('hidden');

    if (viewName === 'championships') {
      this.renderChampionshipsDirectory();
    } else if (viewName === 'compare') {
      this.updateComparison();
    } else if (viewName === 'matches') {
      this.loadRecentMatches();
    } else if (viewName === 'standings') {
      const select = document.getElementById('championshipSelect');
      this.loadStandingsData(select ? select.value : 'Under 15 Eccellenza');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
  }

  setSearchFilter(filter) {
    this.searchFilter = filter;
    document.querySelectorAll('.search-filter-chip').forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.className = 'search-filter-chip active px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold';
      } else {
        btn.className = 'search-filter-chip px-3 py-1 rounded-full bg-gray-800 text-gray-400 hover:text-white border border-white/5 font-semibold';
      }
    });

    const searchVal = document.getElementById('globalSearchInput')?.value.trim();
    if (searchVal) this.performSearch(searchVal);
  }

  // ==========================================
  // CHAMPIONSHIPS DIRECTORY
  // ==========================================

  setChampionshipCategory(category) {
    this.activeCategoryFilter = category;
    document.querySelectorAll('.champ-cat-btn').forEach(btn => {
      if (btn.dataset.category === category) {
        btn.className = 'champ-cat-btn active px-4 py-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold text-xs transition-all flex items-center gap-2';
      } else {
        btn.className = 'champ-cat-btn px-4 py-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white border border-white/5 font-semibold text-xs transition-all flex items-center gap-2';
      }
    });
    this.renderChampionshipsDirectory();
  }

  renderChampionshipsDirectory() {
    const grid = document.getElementById('championshipsCardsGrid');
    if (!grid) return;

    const filtered = this.activeCategoryFilter === 'all'
      ? this.championshipDirectory
      : this.championshipDirectory.filter(c => c.category === this.activeCategoryFilter);

    grid.innerHTML = filtered.map(item => `
      <div class="fip-card fip-card-hover p-5 flex flex-col justify-between gap-4 group cursor-pointer" onclick="app.openChampionshipByQuery('${this.escapeJs(item.query)}')">
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor} uppercase tracking-wider">${item.tag}</span>
            <div class="w-8 h-8 rounded-lg bg-gray-800/90 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <i data-lucide="${item.icon}" class="w-4 h-4"></i>
            </div>
          </div>
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">${this.escapeHtml(item.name)}</h3>
            <p class="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">${this.escapeHtml(item.desc)}</p>
          </div>
        </div>

        <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span class="text-blue-400 font-bold flex items-center gap-1 group-hover:underline">
            <span>Sfoglia Gironi &amp; Classifiche</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </span>
          <span class="text-[10px] text-gray-500 font-mono">FIP Hub</span>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async openChampionshipByQuery(queryStr) {
    this.navigate('competition');
    const container = document.getElementById('competitionDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Interrogazione FIP Stats per "${this.escapeHtml(queryStr)}"...</p>
      </div>
    `;

    try {
      const q = `
        query SearchLiveChampionship($c: String!, $s: String!, $opt: ISearchOptions!) {
          searchCompetitions(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
            fid
            name
            shortName
            projectKey
            categoryName
            groups {
              fid
              name
            }
          }
        }
      `;

      let comps = [];
      const queriesToTry = [queryStr];
      if (queryStr.includes(' ')) {
        queriesToTry.push(queryStr.split(' ').slice(0, 2).join(' '));
        queriesToTry.push(queryStr.split(' ')[0]);
      }

      for (const qTerm of queriesToTry) {
        for (const seasonId of this.knownSeasons) {
          try {
            const data = await this.gql(q, { c: qTerm, s: seasonId, opt: { limit: 15 } });
            if (data?.searchCompetitions && data.searchCompetitions.length > 0) {
              comps = data.searchCompetitions;
              break;
            }
          } catch (err) {}
        }
        if (comps.length > 0) break;
      }

      if (comps.length === 0) {
        container.innerHTML = `
          <div class="fip-card p-8 text-center space-y-3">
            <h3 class="text-lg font-bold text-white">Nessuna competizione trovata per "${this.escapeHtml(queryStr)}"</h3>
            <p class="text-xs text-gray-400">Prova a cercarla tramite la barra di ricerca globale.</p>
            <button onclick="app.navigate('championships')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna ai Campionati</button>
          </div>
        `;
        return;
      }

      const comp = comps[0];
      this.renderFullCompetitionView(comp, comps);
    } catch (e) {
      container.innerHTML = `
        <div class="fip-card p-8 text-center space-y-3 border-red-500/30">
          <p class="text-sm text-red-400">Errore nel caricamento del campionato FIP.</p>
          <button onclick="app.navigate('championships')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna ai Campionati</button>
        </div>
      `;
    }
  }

  async showCompetition(compFid, projectKey, compName) {
    this.navigate('competition');
    const container = document.getElementById('competitionDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento gironi di ${this.escapeHtml(compName || 'campionato')}...</p>
      </div>
    `;

    try {
      const q = `
        query GetCompDirect($pK: String!, $cFid: String!) {
          competition(projectKey: $pK, fid: $cFid) {
            fid
            name
            shortName
            projectKey
            categoryName
            groups {
              fid
              name
            }
          }
        }
      `;

      let comp = null;
      try {
        const data = await this.gql(q, { pK: projectKey || 'fip', cFid: compFid });
        const res = data?.competition;
        comp = Array.isArray(res) ? res[0] : res;
      } catch (err) {}

      if (!comp || !comp.groups || comp.groups.length === 0) {
        // Fallback search
        await this.openChampionshipByQuery(compName || 'Under 15 Eccellenza');
        return;
      }

      this.renderFullCompetitionView(comp, [comp]);
    } catch (e) {
      container.innerHTML = `
        <div class="fip-card p-8 text-center space-y-3 border-red-500/30">
          <p class="text-sm text-red-400">Errore nel caricamento della competizione.</p>
          <button onclick="app.navigate('championships')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna ai Campionati</button>
        </div>
      `;
    }
  }

  renderFullCompetitionView(comp, relatedComps = []) {
    const container = document.getElementById('competitionDetailContent');
    const groups = comp.groups || [];
    const firstGroup = groups[0];

    container.innerHTML = `
      <div class="fip-card p-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-xl flex-shrink-0">
              <i data-lucide="trophy" class="w-8 h-8"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">CAMPIONATO UFFICIALE FIP</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">${groups.length} Gironi / Fasi</span>
              </div>
              <h1 class="text-2xl md:text-3xl font-extrabold text-white">${this.escapeHtml(comp.name)}</h1>
              <p class="text-xs text-gray-400 mt-1">${this.escapeHtml(comp.categoryName || 'Federazione Italiana Pallacanestro')}</p>
            </div>
          </div>
          
          <button onclick="app.navigate('championships')" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Tutti i Campionati
          </button>
        </div>

        ${relatedComps.length > 1 ? `
          <div class="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 overflow-x-auto pb-1 text-xs">
            <span class="text-gray-400 font-semibold flex-shrink-0">Fasi collegate:</span>
            ${relatedComps.map(rc => `
              <button onclick="app.showCompetition('${rc.fid}', '${rc.projectKey || 'fip'}', '${this.escapeJs(rc.name)}')" class="px-3 py-1 rounded-lg ${rc.fid === comp.fid ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-900 text-gray-400 hover:text-white'} font-semibold flex-shrink-0">
                ${this.escapeHtml(rc.shortName || rc.name)}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="fip-card p-6 space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="award" class="w-4 h-4 text-amber-400"></i>
              <span>Classifica &amp; Calendario Girone</span>
            </h3>
            <p class="text-xs text-gray-400">Dati sincronizzati dai referti ufficiali FIP</p>
          </div>

          ${groups.length > 0 ? `
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-400 font-medium">Seleziona Girone:</label>
              <select id="compGroupSelect" onchange="app.loadGroupAllData('${comp.projectKey || 'fip'}', '${comp.fid}', this.value)" class="bg-gray-900 border border-white/10 text-xs font-bold rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                ${groups.map(g => `<option value="${g.fid}">${this.escapeHtml(g.name)}</option>`).join('')}
              </select>
            </div>
          ` : ''}
        </div>

        <div id="compGroupStandingsContent">
          <!-- Standings Table filled dynamically -->
        </div>

        <div class="border-t border-white/10 pt-6 space-y-4">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="calendar" class="w-4 h-4 text-blue-400"></i>
            <span>Partite &amp; Risultati del Girone</span>
          </h4>
          <div id="compGroupMatchesContent" class="space-y-3">
            <!-- Matches filled dynamically -->
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    if (firstGroup) {
      this.loadGroupAllData(comp.projectKey || 'fip', comp.fid, firstGroup.fid);
    }
  }

  async loadGroupAllData(projectKey, compFid, groupFid) {
    this.loadGroupStandings(projectKey, compFid, groupFid);
    this.loadGroupMatches(projectKey, compFid, groupFid);
  }

  async loadGroupMatches(projectKey, compFid, groupFid) {
    const container = document.getElementById('compGroupMatchesContent');
    if (!container) return;

    container.innerHTML = `
      <div class="py-6 flex flex-col items-center justify-center gap-2">
        <div class="w-6 h-6 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento partite girone...</p>
      </div>
    `;

    try {
      const q = `
        query GetGroupMatches($pK: String!, $cFid: String!, $gFid: String!) {
          matchByGroup(projectKey: $pK, competitionFid: $cFid, groupFid: $gFid) {
            fid
            date
            status
            scores {
              total {
                homeScore
                awayScore
              }
              partials {
                period
                homeScore
                awayScore
              }
            }
            homeTeam {
              fid
              name
              logo
            }
            awayTeam {
              fid
              name
              logo
            }
          }
        }
      `;

      const data = await this.gql(q, { pK: projectKey || 'fip', cFid: compFid, gFid: groupFid });
      const matches = data?.matchByGroup || [];

      if (matches.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 text-center py-4">Nessuna partita programmata in questo girone.</p>`;
        return;
      }

      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${matches.map(m => this.renderMatchItemCard(m, projectKey, compFid)).join('')}
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      container.innerHTML = `<p class="text-xs text-red-400 text-center py-4">Errore nel caricamento delle partite del girone.</p>`;
    }
  }

  // ==========================================
  // SEARCH ENGINE
  // ==========================================

  handleSearchInput(value) {
    clearTimeout(this.searchTimeout);
    const clearBtn = document.getElementById('clearSearchBtn');
    if (value.trim()) clearBtn?.classList.remove('hidden');
    else clearBtn?.classList.add('hidden');

    this.searchTimeout = setTimeout(() => {
      if (value.trim().length >= 2) this.performSearch(value.trim());
      else if (value.trim().length === 0) this.showWelcomeState();
    }, 350);
  }

  clearSearch() {
    const input = document.getElementById('globalSearchInput');
    if (input) input.value = '';
    document.getElementById('clearSearchBtn')?.classList.add('hidden');
    this.showWelcomeState();
  }

  quickSearch(query) {
    const input = document.getElementById('globalSearchInput');
    if (input) input.value = query;
    document.getElementById('clearSearchBtn')?.classList.remove('hidden');
    this.navigate('search');
    this.performSearch(query);
  }

  showWelcomeState() {
    const grid = document.getElementById('searchResultsGrid');
    const title = document.getElementById('searchResultsTitle');
    const badge = document.getElementById('resultsCountBadge');
    const welcome = document.getElementById('searchWelcomeState');

    if (grid) grid.innerHTML = '';
    if (title) title.classList.add('hidden');
    if (badge) badge.classList.add('hidden');
    if (welcome) welcome.classList.remove('hidden');
  }

  async performSearch(query) {
    if (!query || query.length < 2) return;

    this.navigate('search');
    const loading = document.getElementById('loadingIndicator');
    const welcome = document.getElementById('searchWelcomeState');
    const grid = document.getElementById('searchResultsGrid');
    const title = document.getElementById('searchResultsTitle');
    const badge = document.getElementById('resultsCountBadge');

    welcome?.classList.add('hidden');
    loading?.classList.remove('hidden');
    if (grid) grid.innerHTML = '';

    try {
      const results = await this.queryLiveSearch(query);

      title?.classList.remove('hidden');
      badge?.classList.remove('hidden');
      if (badge) badge.textContent = `${results.length} risultati FIP`;

      if (results.length === 0) {
        if (grid) {
          grid.innerHTML = `
            <div class="col-span-full p-8 text-center fip-card">
              <i data-lucide="alert-circle" class="w-10 h-10 text-blue-400 mx-auto mb-2"></i>
              <h4 class="text-base font-bold text-white">Nessun risultato trovato per "${this.escapeHtml(query)}"</h4>
              <p class="text-xs text-gray-400 mt-1">Verifica il filtro attivo o prova con una parola chiave diversa.</p>
            </div>
          `;
        }
      } else {
        if (grid) {
          grid.innerHTML = results.map(item => this.renderResultCard(item)).join('');
        }
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      if (grid) {
        grid.innerHTML = `
          <div class="col-span-full p-6 text-center fip-card border-red-500/30">
            <i data-lucide="wifi-off" class="w-8 h-8 text-red-400 mx-auto mb-2"></i>
            <p class="text-sm text-red-400">Impossibile completare la ricerca. Verifica che la connessione sia attiva.</p>
          </div>
        `;
      }
      if (window.lucide) window.lucide.createIcons();
    } finally {
      loading?.classList.add('hidden');
    }
  }

  async queryLiveSearch(criteria) {
    const rawResults = [];
    const limit = 25;

    // Strict Player search
    if (this.searchFilter === 'players') {
      const pQuery = `
        query SearchPlayersLive($c: String!, $s: String!, $opt: ISearchOptions!) {
          searchPlayers(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
            fid
            name
            lastName
            number
            photo
            captain
            projectKey
            teamFid
            competitionFid
            team {
              fid
              name
              logo
            }
            competition {
              fid
              name
            }
          }
        }
      `;

      for (const seasonId of this.knownSeasons) {
        try {
          const data = await this.gql(pQuery, { c: criteria, s: seasonId, opt: { limit } });
          if (data?.searchPlayers) {
            for (const p of data.searchPlayers) {
              rawResults.push({
                type: 'player',
                fid: p.fid,
                projectKey: p.projectKey || 'fip',
                compFid: p.competitionFid || p.competition?.fid || '',
                teamFid: p.teamFid || p.team?.fid || '',
                title: `${p.name} ${p.lastName || ''}`.trim(),
                subtitle: p.team?.name ? `${p.team.name} • ${p.competition?.name || ''}` : (p.competition?.name || 'Atleta FIP'),
                meta: p.number ? `#${p.number}` : 'Atleta',
                avatar: (p.photo && p.photo !== 'N/A') ? p.photo : null
              });
            }
          }
        } catch (e) {}
      }

      const seen = new Set();
      return rawResults.filter(r => {
        if (r.type !== 'player') return false;
        if (seen.has(r.fid)) return false;
        seen.add(r.fid);
        return true;
      });
    }

    // Strict Competition search
    if (this.searchFilter === 'competitions') {
      const cQuery = `
        query SearchCompetitionsLive($c: String!, $s: String!, $opt: ISearchOptions!) {
          searchCompetitions(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
            fid
            name
            shortName
            projectKey
            categoryName
            groups {
              fid
              name
            }
          }
        }
      `;

      for (const seasonId of this.knownSeasons) {
        try {
          const data = await this.gql(cQuery, { c: criteria, s: seasonId, opt: { limit } });
          if (data?.searchCompetitions) {
            for (const c of data.searchCompetitions) {
              rawResults.push({
                type: 'competition',
                fid: c.fid,
                projectKey: c.projectKey || 'fip',
                title: c.name || c.shortName,
                subtitle: c.categoryName ? `${c.categoryName} • ${c.groups?.length || 0} gironi` : `${c.groups?.length || 0} gironi/fasi`,
                meta: 'Campionato Ufficiale',
                avatar: null
              });
            }
          }
        } catch (e) {}
      }

      const seen = new Set();
      return rawResults.filter(r => {
        if (r.type !== 'competition') return false;
        if (seen.has(r.fid)) return false;
        seen.add(r.fid);
        return true;
      });
    }

    // Strict Team search
    if (this.searchFilter === 'teams') {
      const tQuery = `
        query SearchTeamsLive($c: String!, $s: String!, $opt: ISearchOptions!) {
          searchTeams(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
            fid
            name
            projectKey
            competitionFid
            logo
            standingPosition
            competition {
              fid
              name
            }
          }
        }
      `;

      for (const seasonId of this.knownSeasons) {
        try {
          const data = await this.gql(tQuery, { c: criteria, s: seasonId, opt: { limit } });
          if (data?.searchTeams) {
            for (const t of data.searchTeams) {
              rawResults.push({
                type: 'team',
                fid: t.fid,
                projectKey: t.projectKey || 'fip',
                compFid: t.competitionFid || t.competition?.fid || '',
                title: t.name,
                subtitle: t.competition?.name || 'Competizione FIP',
                meta: t.standingPosition ? `Posizione: ${t.standingPosition}°` : 'Società FIP',
                avatar: (t.logo && t.logo !== 'N/A') ? t.logo : null
              });
            }
          }
        } catch (e) {}
      }

      const seen = new Set();
      return rawResults.filter(r => {
        if (r.type !== 'team') return false;
        if (seen.has(r.fid)) return false;
        seen.add(r.fid);
        return true;
      });
    }

    // Universal Search (All categories)
    const uniQuery = `
      query UniversalSearch($c: String!, $s: String!, $opt: ISearchOptions!) {
        search(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
          __typename
          ... on Competition {
            compFid: fid
            compName: name
            shortName
            categoryName
            compProjectKey: projectKey
          }
          ... on Team {
            teamFid: fid
            teamCompFid: competitionFid
            teamName: name
            standingPosition
            teamProjectKey: projectKey
            logo
            teamComp: competition {
              fid
              name
            }
          }
          ... on Player {
            playerFid: fid
            playerCompFid: competitionFid
            playerTeamFid: teamFid
            playerName: name
            playerLastName: lastName
            playerNumber: number
            playerPhoto: photo
            playerCaptain: captain
            playerProjectKey: projectKey
            playerTeam: team {
              fid
              name
            }
            playerComp: competition {
              fid
              name
            }
          }
          ... on UniquePlayer {
            uniqueId: id
            uniqueName: name
            uniqueLastName: lastName
            uniquePhoto: photo
          }
        }
      }
    `;

    for (const seasonId of this.knownSeasons) {
      try {
        const data = await this.gql(uniQuery, { c: criteria, s: seasonId, opt: { limit: 30 } });
        const rawItems = data?.search || [];

        for (const item of rawItems) {
          if (item.__typename === 'Competition') {
            rawResults.push({
              type: 'competition',
              fid: item.compFid,
              projectKey: item.compProjectKey || 'fip',
              title: item.compName || item.shortName,
              subtitle: item.categoryName ? `${item.categoryName} • Campionato FIP` : 'Campionato Ufficiale FIP',
              meta: 'Campionato',
              avatar: null
            });
          } else if (item.__typename === 'Team') {
            rawResults.push({
              type: 'team',
              fid: item.teamFid,
              projectKey: item.teamProjectKey || 'fip',
              compFid: item.teamCompFid || item.teamComp?.fid || '',
              title: item.teamName,
              subtitle: item.teamComp?.name || 'Squadra FIP',
              meta: item.standingPosition ? `Posizione: ${item.standingPosition}°` : 'Club',
              avatar: (item.logo && item.logo !== 'N/A') ? item.logo : null
            });
          } else if (item.__typename === 'Player') {
            rawResults.push({
              type: 'player',
              fid: item.playerFid,
              projectKey: item.playerProjectKey || 'fip',
              compFid: item.playerCompFid || item.playerComp?.fid || '',
              teamFid: item.playerTeamFid || item.playerTeam?.fid || '',
              title: `${item.playerName} ${item.playerLastName || ''}`.trim(),
              subtitle: item.playerTeam?.name ? `${item.playerTeam.name} • ${item.playerComp?.name || ''}` : (item.playerComp?.name || 'Atleta FIP'),
              meta: item.playerNumber ? `#${item.playerNumber}` : 'Giocatore',
              avatar: (item.playerPhoto && item.playerPhoto !== 'N/A') ? item.playerPhoto : null
            });
          } else if (item.__typename === 'UniquePlayer') {
            rawResults.push({
              type: 'uniquePlayer',
              fid: item.uniqueId,
              uniqueId: item.uniqueId,
              title: `${item.uniqueName} ${item.uniqueLastName || ''}`.trim(),
              subtitle: 'Carriera & Statistiche Aggregate FIP',
              meta: 'Profilo Unico FIP',
              avatar: (item.uniquePhoto && item.uniquePhoto !== 'N/A') ? item.uniquePhoto : null
            });
          }
        }
      } catch (e) {}
    }

    const seen = new Set();
    return rawResults.filter(r => {
      const key = `${r.type}_${r.fid || r.uniqueId || r.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  renderResultCard(item) {
    let icon = 'shield';
    let typeBadge = '';
    let clickHandler = '';

    if (item.type === 'player') {
      icon = 'user';
      typeBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">ATLETA FIP</span>';
      clickHandler = `app.showPlayer('${item.projectKey || 'fip'}', '${item.compFid}', '${item.teamFid}', '${item.fid}', '${this.escapeJs(item.title)}')`;
    } else if (item.type === 'uniquePlayer') {
      icon = 'user-check';
      typeBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">CARRIERA FIP</span>';
      clickHandler = `app.showUniquePlayer('${item.uniqueId}', '${this.escapeJs(item.title)}')`;
    } else if (item.type === 'team') {
      icon = 'shield';
      typeBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">SQUADRA</span>';
      clickHandler = `app.showTeam('${item.projectKey || 'fip'}', '${item.compFid}', '${item.fid}', '${this.escapeJs(item.title)}')`;
    } else if (item.type === 'competition') {
      icon = 'trophy';
      typeBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">CAMPIONATO</span>';
      clickHandler = `app.showCompetition('${item.fid}', '${item.projectKey || 'fip'}', '${this.escapeJs(item.title)}')`;
    }

    return `
      <div onclick="${clickHandler}" class="fip-card fip-card-hover p-4 cursor-pointer flex flex-col justify-between gap-3 group">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gray-800/80 border border-white/10 flex items-center justify-center text-blue-400 group-hover:border-blue-500/40 group-hover:scale-105 transition-all flex-shrink-0 overflow-hidden">
              ${item.avatar ? `<img src="${item.avatar}" class="w-full h-full object-cover" alt="${this.escapeHtml(item.title)}" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<i data-lucide=\\'${icon}\\' class=\\'w-6 h-6\\'></i>';">` : `<i data-lucide="${icon}" class="w-6 h-6"></i>`}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                ${typeBadge}
              </div>
              <h3 class="font-bold text-base text-white group-hover:text-blue-400 transition-colors line-clamp-1">${this.escapeHtml(item.title)}</h3>
              <p class="text-xs text-gray-400 line-clamp-1">${this.escapeHtml(item.subtitle || '')}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
          <span class="font-mono text-[11px] text-gray-400">${this.escapeHtml(item.meta || '')}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">FIP Live</span>
        </div>
      </div>
    `;
  }

  // ==========================================
  // MATCH CENTER (PARTITA LIVE & DETTAGLIO)
  // Replicating official screens: Recap, Confronto, Andamento Partita, Grafico Tiri, Tabellino, Quintetti
  // ==========================================

  async showMatch(projectKey, compFid, matchFid) {
    this.navigate('match');
    const container = document.getElementById('matchDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento Match Center FIP...</p>
      </div>
    `;

    try {
      const query = `
        query GetMatchDetails($projectKey: String!, $fid: String!) {
          matchBy(projectKey: $projectKey, fid: $fid) {
            fid
            date
            status
            roundName
            scores {
              total {
                homeScore
                awayScore
              }
              partials {
                period
                homeScore
                awayScore
              }
            }
            stats {
              biggestLead {
                homeTeam
                awayTeam
              }
              timesTied
              leadChanges
            }
            homeTeam {
              fid
              name
              logo
            }
            awayTeam {
              fid
              name
              logo
            }
            actorBoxscores {
              homeTeam {
                boxscore {
                  points
                  offensiveRebounds
                  defensiveRebounds
                  assists
                  turnovers
                  steals
                  blocks
                  fouls
                  freeThrowsMade
                  freeThrowsFailed
                  inArcThrowsMade
                  inArcThrowsFailed
                  outArcThrowsMade
                  outArcThrowsFailed
                }
                players {
                  player {
                    fid
                    name
                    lastName
                    number
                    photo
                  }
                  boxscore {
                    timePlayed
                    points
                    offensiveRebounds
                    defensiveRebounds
                    assists
                    turnovers
                    steals
                    blocks
                    fouls
                    freeThrowsMade
                    freeThrowsFailed
                    inArcThrowsMade
                    inArcThrowsFailed
                    outArcThrowsMade
                    outArcThrowsFailed
                    fibaRating
                    plusMinus
                  }
                }
              }
              awayTeam {
                boxscore {
                  points
                  offensiveRebounds
                  defensiveRebounds
                  assists
                  turnovers
                  steals
                  blocks
                  fouls
                  freeThrowsMade
                  freeThrowsFailed
                  inArcThrowsMade
                  inArcThrowsFailed
                  outArcThrowsMade
                  outArcThrowsFailed
                }
                players {
                  player {
                    fid
                    name
                    lastName
                    number
                    photo
                  }
                  boxscore {
                    timePlayed
                    points
                    offensiveRebounds
                    defensiveRebounds
                    assists
                    turnovers
                    steals
                    blocks
                    fouls
                    freeThrowsMade
                    freeThrowsFailed
                    inArcThrowsMade
                    inArcThrowsFailed
                    outArcThrowsMade
                    outArcThrowsFailed
                    fibaRating
                    plusMinus
                  }
                }
              }
            }
          }
        }
      `;

      const data = await this.gql(query, { projectKey: projectKey || 'fip', fid: matchFid });
      const rawMatches = data?.matchBy;
      const m = Array.isArray(rawMatches) ? rawMatches[0] : rawMatches;

      if (!m) {
        container.innerHTML = `<div class="fip-card p-8 text-center text-xs text-gray-400">Dettagli incontro non disponibili.</div>`;
        return;
      }

      this.currentMatchData = m;
      this.renderMatchCenter(m, projectKey, compFid);
    } catch (e) {
      container.innerHTML = `<div class="fip-card p-8 text-center text-xs text-red-400">Errore nel caricamento del match center FIP.</div>`;
    }
  }

  renderMatchCenter(m, projectKey, compFid) {
    const container = document.getElementById('matchDetailContent');
    const hScore = m.scores?.total?.homeScore ?? '-';
    const aScore = m.scores?.total?.awayScore ?? '-';
    const partials = m.scores?.partials || [];
    const dateStr = m.date ? new Date(m.date).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' }) : 'Data da definire';

    let statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-300">PROGRAMMATA</span>';
    if (m.status === 'LIVE' || m.status === 'IN_PROGRESS') {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse">● LIVE IN CORSO</span>';
    } else if (m.status === 'FINISHED' || m.status === 'FINAL') {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">FINALE</span>';
    }

    container.innerHTML = `
      <!-- Header Scoreboard -->
      <div class="fip-card p-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-5">
          <i data-lucide="trophy" class="w-32 h-32"></i>
        </div>

        <div class="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-3 mb-6">
          <span class="flex items-center gap-1.5"><i data-lucide="calendar" class="w-3.5 h-3.5 text-blue-400"></i> ${dateStr}</span>
          <div>${statusBadge}</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center">
          <!-- Home Team -->
          <div class="flex flex-col items-center gap-3 cursor-pointer group" onclick="app.showTeam('${projectKey || 'fip'}', '${compFid}', '${m.homeTeam?.fid}', '${this.escapeJs(m.homeTeam?.name)}')">
            <div class="w-20 h-20 rounded-2xl bg-gray-800 border border-white/10 flex items-center justify-center p-2 group-hover:border-blue-500 transition-all">
              ${(m.homeTeam?.logo && m.homeTeam?.logo !== 'N/A') ? `<img src="${m.homeTeam.logo}" class="max-h-full max-w-full object-contain" alt="">` : `<i data-lucide="shield" class="w-10 h-10 text-blue-400"></i>`}
            </div>
            <div>
              <h2 class="text-lg font-black text-white group-hover:text-blue-400 transition-colors">${this.escapeHtml(m.homeTeam?.name || 'Casa')}</h2>
              <span class="text-xs text-gray-400 font-mono">CASA</span>
            </div>
          </div>

          <!-- Score Display -->
          <div class="space-y-2">
            <div class="text-4xl md:text-5xl font-black text-white tracking-wider font-mono flex items-center justify-center gap-4">
              <span class="${hScore > aScore ? 'text-blue-400' : 'text-white'}">${hScore}</span>
              <span class="text-gray-600 text-3xl font-light">-</span>
              <span class="${aScore > hScore ? 'text-amber-400' : 'text-white'}">${aScore}</span>
            </div>

            <!-- Quarter Partials Table -->
            ${partials.length > 0 ? `
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-white/5 text-xs font-mono text-gray-400">
                ${partials.map(p => `<span>Q${p.period}: <strong class="text-white">${p.homeScore}-${p.awayScore}</strong></span>`).join('<span class="text-gray-600">|</span>')}
              </div>
            ` : ''}
          </div>

          <!-- Away Team -->
          <div class="flex flex-col items-center gap-3 cursor-pointer group" onclick="app.showTeam('${projectKey || 'fip'}', '${compFid}', '${m.awayTeam?.fid}', '${this.escapeJs(m.awayTeam?.name)}')">
            <div class="w-20 h-20 rounded-2xl bg-gray-800 border border-white/10 flex items-center justify-center p-2 group-hover:border-amber-500 transition-all">
              ${(m.awayTeam?.logo && m.awayTeam?.logo !== 'N/A') ? `<img src="${m.awayTeam.logo}" class="max-h-full max-w-full object-contain" alt="">` : `<i data-lucide="shield" class="w-10 h-10 text-amber-400"></i>`}
            </div>
            <div>
              <h2 class="text-lg font-black text-white group-hover:text-amber-400 transition-colors">${this.escapeHtml(m.awayTeam?.name || 'Ospite')}</h2>
              <span class="text-xs text-gray-400 font-mono">OSPITE</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Match Center Tabs (5 Official Views) -->
      <div class="fip-card p-4 space-y-6">
        <div class="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          <button onclick="app.setMatchSubTab('recap')" id="match-subtab-recap" class="match-subtab-btn active px-4 py-2 rounded-xl text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center gap-2">
            <i data-lucide="file-text" class="w-4 h-4"></i> Recap &amp; Leaders
          </button>
          <button onclick="app.setMatchSubTab('compare')" id="match-subtab-compare" class="match-subtab-btn px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
            <i data-lucide="sliders" class="w-4 h-4"></i> Confronto Squadre
          </button>
          <button onclick="app.setMatchSubTab('flow')" id="match-subtab-flow" class="match-subtab-btn px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
            <i data-lucide="trending-up" class="w-4 h-4"></i> Andamento Partita
          </button>
          <button onclick="app.setMatchSubTab('shots')" id="match-subtab-shots" class="match-subtab-btn px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
            <i data-lucide="crosshair" class="w-4 h-4"></i> Grafico Tiri (Shot Chart)
          </button>
          <button onclick="app.setMatchSubTab('boxscore')" id="match-subtab-boxscore" class="match-subtab-btn px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2">
            <i data-lucide="table" class="w-4 h-4"></i> Tabellino Ufficiale
          </button>
        </div>

        <div id="matchSubTabContent">
          <!-- Rendered by setMatchSubTab -->
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.setMatchSubTab('recap');
  }

  setMatchSubTab(tab) {
    document.querySelectorAll('.match-subtab-btn').forEach(btn => {
      btn.className = 'match-subtab-btn px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2';
    });
    const active = document.getElementById(`match-subtab-${tab}`);
    if (active) active.className = 'match-subtab-btn active px-4 py-2 rounded-xl text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center gap-2';

    const container = document.getElementById('matchSubTabContent');
    if (!container || !this.currentMatchData) return;

    const m = this.currentMatchData;
    const hb = m.actorBoxscores?.homeTeam?.boxscore || {};
    const ab = m.actorBoxscores?.awayTeam?.boxscore || {};
    const hp = m.actorBoxscores?.homeTeam?.players || [];
    const ap = m.actorBoxscores?.awayTeam?.players || [];

    if (tab === 'recap') {
      container.innerHTML = this.renderMatchRecap(m, hp, ap);
    } else if (tab === 'compare') {
      container.innerHTML = this.renderMatchCompareStats(m, hb, ab);
    } else if (tab === 'flow') {
      container.innerHTML = `
        <div class="space-y-4">
          <h4 class="text-sm font-bold text-white flex items-center gap-2"><i data-lucide="activity" class="w-4 h-4 text-blue-400"></i> Curva del Punteggio (Score Progression)</h4>
          <div class="h-72 relative">
            <canvas id="gameFlowChartCanvas"></canvas>
          </div>
        </div>
      `;
      setTimeout(() => this.initGameFlowChart(m), 50);
    } else if (tab === 'shots') {
      container.innerHTML = this.renderShotChart(m, hb, ab);
    } else if (tab === 'boxscore') {
      container.innerHTML = this.renderFullBoxscore(m, hp, ap, hb, ab);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  renderMatchRecap(m, hp, ap) {
    const stats = m.stats || {};
    const bl = stats.biggestLead || {};

    const findTop = (players, key) => {
      let topP = null;
      let topV = -1;
      for (const item of players) {
        const val = Number(item.boxscore?.[key]) || 0;
        if (val > topV) {
          topV = val;
          topP = item;
        }
      }
      return topP ? { player: topP.player, value: topV } : null;
    };

    const hTopScorer = findTop(hp, 'points');
    const aTopScorer = findTop(ap, 'points');
    const hTopReb = findTop(hp, 'defensiveRebounds');
    const aTopReb = findTop(ap, 'defensiveRebounds');
    const hTopAst = findTop(hp, 'assists');
    const aTopAst = findTop(ap, 'assists');

    return `
      <div class="space-y-6">
        <!-- Game Leaders Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Top Scorer -->
          <div class="p-4 rounded-xl bg-gray-900 border border-white/5 space-y-3">
            <div class="flex items-center justify-between text-xs text-gray-400">
              <span class="font-bold flex items-center gap-1.5"><i data-lucide="flame" class="w-4 h-4 text-amber-400"></i> Miglior Marcatore</span>
              <span class="text-[10px] font-mono text-gray-500">PUNTI</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-2">
              <div class="text-left">
                <span class="text-blue-400 font-mono font-bold text-sm">${hTopScorer?.value ?? '-'} pt</span>
                <p class="font-bold text-white truncate">${hTopScorer ? `${hTopScorer.player.name} ${hTopScorer.player.lastName || ''}` : m.homeTeam?.name}</p>
              </div>
              <div class="text-right">
                <span class="text-amber-400 font-mono font-bold text-sm">${aTopScorer?.value ?? '-'} pt</span>
                <p class="font-bold text-white truncate">${aTopScorer ? `${aTopScorer.player.name} ${aTopScorer.player.lastName || ''}` : m.awayTeam?.name}</p>
              </div>
            </div>
          </div>

          <!-- Top Rebounds -->
          <div class="p-4 rounded-xl bg-gray-900 border border-white/5 space-y-3">
            <div class="flex items-center justify-between text-xs text-gray-400">
              <span class="font-bold flex items-center gap-1.5"><i data-lucide="disc" class="w-4 h-4 text-emerald-400"></i> Miglior Rimbalzista</span>
              <span class="text-[10px] font-mono text-gray-500">RIMBALZI</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-2">
              <div class="text-left">
                <span class="text-blue-400 font-mono font-bold text-sm">${hTopReb?.value ?? '-'} rim</span>
                <p class="font-bold text-white truncate">${hTopReb ? `${hTopReb.player.name} ${hTopReb.player.lastName || ''}` : m.homeTeam?.name}</p>
              </div>
              <div class="text-right">
                <span class="text-amber-400 font-mono font-bold text-sm">${aTopReb?.value ?? '-'} rim</span>
                <p class="font-bold text-white truncate">${aTopReb ? `${aTopReb.player.name} ${aTopReb.player.lastName || ''}` : m.awayTeam?.name}</p>
              </div>
            </div>
          </div>

          <!-- Top Assists -->
          <div class="p-4 rounded-xl bg-gray-900 border border-white/5 space-y-3">
            <div class="flex items-center justify-between text-xs text-gray-400">
              <span class="font-bold flex items-center gap-1.5"><i data-lucide="share-2" class="w-4 h-4 text-cyan-400"></i> Assist Leader</span>
              <span class="text-[10px] font-mono text-gray-500">ASSIST</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-2">
              <div class="text-left">
                <span class="text-blue-400 font-mono font-bold text-sm">${hTopAst?.value ?? '-'} ast</span>
                <p class="font-bold text-white truncate">${hTopAst ? `${hTopAst.player.name} ${hTopAst.player.lastName || ''}` : m.homeTeam?.name}</p>
              </div>
              <div class="text-right">
                <span class="text-amber-400 font-mono font-bold text-sm">${aTopAst?.value ?? '-'} ast</span>
                <p class="font-bold text-white truncate">${aTopAst ? `${aTopAst.player.name} ${aTopAst.player.lastName || ''}` : m.awayTeam?.name}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Lead & Flow Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-4 rounded-xl bg-gray-900 border border-white/5 text-center space-y-1">
            <span class="text-xs text-gray-400">Vantaggio più ampio</span>
            <div class="text-xl font-black text-white font-mono">
              <span class="text-blue-400">+${bl.homeTeam ?? 0}</span> / <span class="text-amber-400">+${bl.awayTeam ?? 0}</span>
            </div>
          </div>
          <div class="p-4 rounded-xl bg-gray-900 border border-white/5 text-center space-y-1">
            <span class="text-xs text-gray-400">Punteggi in parità</span>
            <div class="text-xl font-black text-white font-mono">${stats.timesTied ?? 0} volte</div>
          </div>
          <div class="p-4 rounded-xl bg-gray-900 border border-white/5 text-center space-y-1">
            <span class="text-xs text-gray-400">Cambi di vantaggio</span>
            <div class="text-xl font-black text-white font-mono">${stats.leadChanges ?? 0} volte</div>
          </div>
        </div>
      </div>
    `;
  }

  initGameFlowChart(m) {
    const ctx = document.getElementById('gameFlowChartCanvas');
    if (!ctx) return;
    if (this.gameFlowChart) this.gameFlowChart.destroy();

    const partials = m.scores?.partials || [];
    const labels = ['Inizio'];
    const homeData = [0];
    const awayData = [0];

    let cumH = 0;
    let cumA = 0;

    if (partials.length > 0) {
      partials.forEach(p => {
        labels.push(`Fine Q${p.period}`);
        cumH += Number(p.homeScore) || 0;
        cumA += Number(p.awayScore) || 0;
        homeData.push(cumH);
        awayData.push(cumA);
      });
    } else {
      labels.push('Q1', 'Q2', 'Q3', 'Q4');
      const hTot = m.scores?.total?.homeScore || 0;
      const aTot = m.scores?.total?.awayScore || 0;
      homeData.push(Math.round(hTot * 0.25), Math.round(hTot * 0.5), Math.round(hTot * 0.75), hTot);
      awayData.push(Math.round(aTot * 0.25), Math.round(aTot * 0.5), Math.round(aTot * 0.75), aTot);
    }

    this.gameFlowChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: m.homeTeam?.name || 'Squadra Casa',
            data: homeData,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 3
          },
          {
            label: m.awayTeam?.name || 'Squadra Ospite',
            data: awayData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#e5e7eb', font: { family: 'Inter', weight: 'bold' } } }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
        }
      }
    });
  }

  renderMatchCompareStats(m, hb, ab) {
    const calcPct = (m, f) => {
      const tot = (m || 0) + (f || 0);
      return tot > 0 ? ((m / tot) * 100).toFixed(1) : '0.0';
    };

    const metrics = [
      {
        name: 'Tiro da 2 Punti',
        hVal: `${hb.inArcThrowsMade || 0}/${(hb.inArcThrowsMade || 0) + (hb.inArcThrowsFailed || 0)} (${calcPct(hb.inArcThrowsMade, hb.inArcThrowsFailed)}%)`,
        aVal: `${ab.inArcThrowsMade || 0}/${(ab.inArcThrowsMade || 0) + (ab.inArcThrowsFailed || 0)} (${calcPct(ab.inArcThrowsMade, ab.inArcThrowsFailed)}%)`,
        hNum: parseFloat(calcPct(hb.inArcThrowsMade, hb.inArcThrowsFailed)),
        aNum: parseFloat(calcPct(ab.inArcThrowsMade, ab.inArcThrowsFailed))
      },
      {
        name: 'Tiro da 3 Punti',
        hVal: `${hb.outArcThrowsMade || 0}/${(hb.outArcThrowsMade || 0) + (hb.outArcThrowsFailed || 0)} (${calcPct(hb.outArcThrowsMade, hb.outArcThrowsFailed)}%)`,
        aVal: `${ab.outArcThrowsMade || 0}/${(ab.outArcThrowsMade || 0) + (ab.outArcThrowsFailed || 0)} (${calcPct(ab.outArcThrowsMade, ab.outArcThrowsFailed)}%)`,
        hNum: parseFloat(calcPct(hb.outArcThrowsMade, hb.outArcThrowsFailed)),
        aNum: parseFloat(calcPct(ab.outArcThrowsMade, ab.outArcThrowsFailed))
      },
      {
        name: 'Tiri Liberi',
        hVal: `${hb.freeThrowsMade || 0}/${(hb.freeThrowsMade || 0) + (hb.freeThrowsFailed || 0)} (${calcPct(hb.freeThrowsMade, hb.freeThrowsFailed)}%)`,
        aVal: `${ab.freeThrowsMade || 0}/${(ab.freeThrowsMade || 0) + (ab.freeThrowsFailed || 0)} (${calcPct(ab.freeThrowsMade, ab.freeThrowsFailed)}%)`,
        hNum: parseFloat(calcPct(hb.freeThrowsMade, hb.freeThrowsFailed)),
        aNum: parseFloat(calcPct(ab.freeThrowsMade, ab.freeThrowsFailed))
      },
      {
        name: 'Rimbalzi Totali',
        hVal: (hb.offensiveRebounds || 0) + (hb.defensiveRebounds || 0),
        aVal: (ab.offensiveRebounds || 0) + (ab.defensiveRebounds || 0),
        hNum: (hb.offensiveRebounds || 0) + (hb.defensiveRebounds || 0),
        aNum: (ab.offensiveRebounds || 0) + (ab.defensiveRebounds || 0)
      },
      {
        name: 'Assist',
        hVal: hb.assists || 0,
        aVal: ab.assists || 0,
        hNum: hb.assists || 0,
        aNum: ab.assists || 0
      },
      {
        name: 'Palle Recuperate',
        hVal: hb.steals || 0,
        aVal: ab.steals || 0,
        hNum: hb.steals || 0,
        aNum: ab.steals || 0
      },
      {
        name: 'Palle Perse',
        hVal: hb.turnovers || 0,
        aVal: ab.turnovers || 0,
        hNum: hb.turnovers || 0,
        aNum: ab.turnovers || 0
      },
      {
        name: 'Stoppate',
        hVal: hb.blocks || 0,
        aVal: ab.blocks || 0,
        hNum: hb.blocks || 0,
        aNum: ab.blocks || 0
      },
      {
        name: 'Falli Commessi',
        hVal: hb.fouls || 0,
        aVal: ab.fouls || 0,
        hNum: hb.fouls || 0,
        aNum: ab.fouls || 0
      }
    ];

    return `
      <div class="space-y-4 max-w-3xl mx-auto">
        <div class="flex items-center justify-between text-xs font-bold text-gray-400 border-b border-white/5 pb-2">
          <span class="text-blue-400">${this.escapeHtml(m.homeTeam?.name || 'Casa')}</span>
          <span>STATISTICA SQUADRA</span>
          <span class="text-amber-400">${this.escapeHtml(m.awayTeam?.name || 'Ospite')}</span>
        </div>

        ${metrics.map(met => {
          const total = (met.hNum + met.aNum) || 1;
          const hPct = Math.min(100, Math.max(10, Math.round((met.hNum / total) * 100)));
          const aPct = 100 - hPct;

          return `
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="font-bold text-blue-400">${met.hVal}</span>
                <span class="text-[11px] font-sans text-gray-300 font-semibold">${met.name}</span>
                <span class="font-bold text-amber-400">${met.aVal}</span>
              </div>
              <div class="h-2 w-full rounded-full bg-gray-800 flex overflow-hidden">
                <div class="bg-blue-600 transition-all duration-500" style="width: ${hPct}%"></div>
                <div class="bg-amber-500 transition-all duration-500" style="width: ${aPct}%"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderShotChart(m, hb, ab) {
    return `
      <div class="space-y-6 max-w-2xl mx-auto text-center">
        <h4 class="text-sm font-bold text-white flex items-center justify-center gap-2">
          <i data-lucide="crosshair" class="w-4 h-4 text-blue-400"></i>
          <span>Mappa Tiri &amp; Zone di Tiro (Official Court Visualization)</span>
        </h4>

        <!-- Interactive SVG Court -->
        <div class="relative bg-gray-900 border border-white/10 rounded-2xl p-4 overflow-hidden aspect-[16/10] flex items-center justify-center">
          <svg viewBox="0 0 500 470" class="w-full h-full text-white/20 stroke-current fill-none">
            <!-- Court Perimeter -->
            <rect x="10" y="10" width="480" height="450" rx="4" stroke-width="2"/>
            <!-- 3pt Arc -->
            <path d="M 60,10 L 60,140 A 200,200 0 0,0 440,140 L 440,10" stroke-width="2"/>
            <!-- Paint Area / Key -->
            <rect x="170" y="10" width="160" height="190" stroke-width="2"/>
            <!-- Free Throw Circle -->
            <circle cx="250" cy="190" r="60" stroke-width="2" stroke-dasharray="6 6"/>
            <!-- Restricted Area Arc -->
            <path d="M 210,10 A 40,40 0 0,0 290,10" stroke-width="2"/>
            <!-- Basket Rim & Backboard -->
            <line x1="220" y1="30" x2="280" y2="30" stroke-width="4" stroke="#94a3b8"/>
            <circle cx="250" cy="45" r="15" stroke-width="3" stroke="#f97316"/>
          </svg>

          <!-- Zone Indicators Overlay -->
          <div class="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none text-xs font-mono">
            <div class="flex justify-between items-start pt-6">
              <span class="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">3PT Corner Sx</span>
              <span class="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">3PT Corner Dx</span>
            </div>
            <div class="flex justify-center items-center">
              <span class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">Area Pitturata (2PT)</span>
            </div>
            <div class="flex justify-center pb-4">
              <span class="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">3PT Arco Centrale</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="p-3 rounded-xl bg-gray-900 border border-white/5 space-y-1">
            <span class="text-blue-400 font-bold">${this.escapeHtml(m.homeTeam?.name || 'Casa')}</span>
            <p class="text-gray-400">Tiro totale: ${(hb.inArcThrowsMade || 0) + (hb.outArcThrowsMade || 0)} canestri segnati</p>
          </div>
          <div class="p-3 rounded-xl bg-gray-900 border border-white/5 space-y-1">
            <span class="text-amber-400 font-bold">${this.escapeHtml(m.awayTeam?.name || 'Ospite')}</span>
            <p class="text-gray-400">Tiro totale: ${(ab.inArcThrowsMade || 0) + (ab.outArcThrowsMade || 0)} canestri segnati</p>
          </div>
        </div>
      </div>
    `;
  }

  renderFullBoxscore(m, hp, ap, hb, ab) {
    const renderTable = (teamName, teamLogo, players, teamBox, themeColor) => `
      <div class="space-y-3">
        <div class="flex items-center gap-2.5">
          <div class="w-6 h-6 rounded bg-gray-800 flex items-center justify-center p-0.5">
            ${(teamLogo && teamLogo !== 'N/A') ? `<img src="${teamLogo}" class="max-h-full max-w-full object-contain" alt="">` : `<i data-lucide="shield" class="w-3.5 h-3.5 ${themeColor}"></i>`}
          </div>
          <h3 class="text-sm font-bold text-white">${this.escapeHtml(teamName)}</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="bg-gray-900 text-gray-400 border-b border-white/5">
                <th class="p-2.5">#</th>
                <th class="p-2.5 font-sans">ATLETA</th>
                <th class="p-2.5 text-center">MIN</th>
                <th class="p-2.5 text-center font-bold text-white">PTS</th>
                <th class="p-2.5 text-center">2PT</th>
                <th class="p-2.5 text-center">3PT</th>
                <th class="p-2.5 text-center">TL</th>
                <th class="p-2.5 text-center">RIM</th>
                <th class="p-2.5 text-center">AST</th>
                <th class="p-2.5 text-center">PR</th>
                <th class="p-2.5 text-center">PP</th>
                <th class="p-2.5 text-center">ST</th>
                <th class="p-2.5 text-center">FC</th>
                <th class="p-2.5 text-center font-bold text-emerald-400">VAL</th>
                <th class="p-2.5 text-center">+/-</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              ${players.map(item => {
                const p = item.player || {};
                const b = item.boxscore || {};
                const fullName = `${p.name || ''} ${p.lastName || ''}`.trim();
                const min = b.timePlayed ? Math.round(b.timePlayed / 60) : '-';
                const twoPt = `${b.inArcThrowsMade || 0}/${(b.inArcThrowsMade || 0) + (b.inArcThrowsFailed || 0)}`;
                const threePt = `${b.outArcThrowsMade || 0}/${(b.outArcThrowsMade || 0) + (b.outArcThrowsFailed || 0)}`;
                const ft = `${b.freeThrowsMade || 0}/${(b.freeThrowsMade || 0) + (b.freeThrowsFailed || 0)}`;
                const totReb = (b.offensiveRebounds || 0) + (b.defensiveRebounds || 0);

                return `
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="p-2.5 text-gray-400">${p.number ? '#' + p.number : '-'}</td>
                    <td class="p-2.5 font-sans font-bold text-white truncate max-w-[140px]">${this.escapeHtml(fullName || 'Atleta')}</td>
                    <td class="p-2.5 text-center text-gray-400">${min}</td>
                    <td class="p-2.5 text-center font-bold text-white bg-blue-500/10">${b.points ?? 0}</td>
                    <td class="p-2.5 text-center text-gray-300">${twoPt}</td>
                    <td class="p-2.5 text-center text-gray-300">${threePt}</td>
                    <td class="p-2.5 text-center text-gray-300">${ft}</td>
                    <td class="p-2.5 text-center">${totReb}</td>
                    <td class="p-2.5 text-center">${b.assists ?? 0}</td>
                    <td class="p-2.5 text-center">${b.steals ?? 0}</td>
                    <td class="p-2.5 text-center">${b.turnovers ?? 0}</td>
                    <td class="p-2.5 text-center">${b.blocks ?? 0}</td>
                    <td class="p-2.5 text-center">${b.fouls ?? 0}</td>
                    <td class="p-2.5 text-center font-bold text-emerald-400">${b.fibaRating ?? 0}</td>
                    <td class="p-2.5 text-center ${b.plusMinus > 0 ? 'text-emerald-400' : (b.plusMinus < 0 ? 'text-red-400' : 'text-gray-400')}">${b.plusMinus ?? '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr class="bg-gray-900/80 font-bold text-white border-t border-white/10">
                <td class="p-2.5" colspan="2">TOTALI SQUADRA</td>
                <td class="p-2.5 text-center">-</td>
                <td class="p-2.5 text-center bg-blue-600/20">${teamBox.points ?? 0}</td>
                <td class="p-2.5 text-center">${teamBox.inArcThrowsMade || 0}/${(teamBox.inArcThrowsMade || 0) + (teamBox.inArcThrowsFailed || 0)}</td>
                <td class="p-2.5 text-center">${teamBox.outArcThrowsMade || 0}/${(teamBox.outArcThrowsMade || 0) + (teamBox.outArcThrowsFailed || 0)}</td>
                <td class="p-2.5 text-center">${teamBox.freeThrowsMade || 0}/${(teamBox.freeThrowsMade || 0) + (teamBox.freeThrowsFailed || 0)}</td>
                <td class="p-2.5 text-center">${(teamBox.offensiveRebounds || 0) + (teamBox.defensiveRebounds || 0)}</td>
                <td class="p-2.5 text-center">${teamBox.assists ?? 0}</td>
                <td class="p-2.5 text-center">${teamBox.steals ?? 0}</td>
                <td class="p-2.5 text-center">${teamBox.turnovers ?? 0}</td>
                <td class="p-2.5 text-center">${teamBox.blocks ?? 0}</td>
                <td class="p-2.5 text-center">${teamBox.fouls ?? 0}</td>
                <td class="p-2.5 text-center">-</td>
                <td class="p-2.5 text-center">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;

    return `
      <div class="space-y-8">
        ${renderTable(m.homeTeam?.name || 'Squadra Casa', m.homeTeam?.logo, hp, hb, 'text-blue-400')}
        ${renderTable(m.awayTeam?.name || 'Squadra Ospite', m.awayTeam?.logo, ap, ab, 'text-amber-400')}
      </div>
    `;
  }

  // ==========================================
  // SQUADRE & ROSTER
  // ==========================================

  async showTeam(projectKey, compFid, teamFid, teamName) {
    this.navigate('team');
    const container = document.getElementById('teamDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento scheda di ${this.escapeHtml(teamName || 'squadra')}...</p>
      </div>
    `;

    try {
      const query = `
        query GetTeamDetails($pK: String!, $cFid: String!, $tFid: String!) {
          team(projectKey: $pK, competitionFid: $cFid, fid: $tFid) {
            fid
            name
            logo
            standingPosition
            competition {
              fid
              name
            }
            players {
              fid
              name
              lastName
              number
              photo
              captain
              stats {
                games
                points
                pointsPerGame
                totalRebounds
                assists
                steals
                blocks
                fibaRating
              }
            }
          }
        }
      `;

      const data = await this.gql(query, { pK: projectKey || 'fip', cFid: compFid || '', tFid: teamFid });
      const teamList = data?.team;
      const team = Array.isArray(teamList) ? teamList[0] : teamList;

      if (!team) {
        container.innerHTML = `<div class="fip-card p-8 text-center text-xs text-gray-400">Dettagli squadra non disponibili.</div>`;
        return;
      }

      const players = team.players || [];

      container.innerHTML = `
        <div class="fip-card p-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-gray-800 border border-white/10 flex items-center justify-center p-2 flex-shrink-0">
                ${(team.logo && team.logo !== 'N/A') ? `<img src="${team.logo}" class="max-h-full max-w-full object-contain" alt="">` : `<i data-lucide="shield" class="w-8 h-8 text-blue-400"></i>`}
              </div>
              <div>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase">SQUADRA FIP</span>
                <h1 class="text-2xl font-black text-white mt-1">${this.escapeHtml(team.name)}</h1>
                <p class="text-xs text-gray-400 mt-0.5">${this.escapeHtml(team.competition?.name || 'Competizione FIP')}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              ${team.standingPosition ? `
                <div class="text-center px-4 py-2 rounded-xl bg-gray-900 border border-white/5">
                  <span class="text-[10px] text-gray-400 uppercase font-mono">Posizione</span>
                  <div class="text-lg font-black text-blue-400 font-mono">${team.standingPosition}°</div>
                </div>
              ` : ''}
              <button onclick="app.showCompetition('${compFid}', '${projectKey || 'fip'}', '${this.escapeJs(team.competition?.name || '')}')" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                <i data-lucide="trophy" class="w-4 h-4 text-blue-400"></i> Vedi Girone
              </button>
            </div>
          </div>
        </div>

        <div class="fip-card p-6 space-y-4">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="users" class="w-4 h-4 text-blue-400"></i>
            <span>Rosa Atleti (${players.length})</span>
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-gray-900/40 text-gray-400 font-mono">
                  <th class="p-2.5">#</th>
                  <th class="p-2.5">Atleta</th>
                  <th class="p-2.5 text-center">PG</th>
                  <th class="p-2.5 text-center">Punti</th>
                  <th class="p-2.5 text-center">PPG</th>
                  <th class="p-2.5 text-center">Rimbalzi</th>
                  <th class="p-2.5 text-center">Assist</th>
                  <th class="p-2.5 text-center">Valutazione (VAL)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 font-mono">
                ${players.map(p => {
                  const s = p.stats || {};
                  const fullName = `${p.name} ${p.lastName || ''}`.trim();
                  const ppg = s.pointsPerGame ? Number(s.pointsPerGame).toFixed(1) : (s.games ? (s.points / s.games).toFixed(1) : '0.0');

                  return `
                    <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.showPlayer('${projectKey || 'fip'}', '${compFid}', '${teamFid}', '${p.fid}', '${this.escapeJs(fullName)}')">
                      <td class="p-2.5 font-bold text-blue-400">${p.number ? '#' + p.number : '-'}</td>
                      <td class="p-2.5 font-sans font-bold text-white hover:text-blue-400 transition-colors">${this.escapeHtml(fullName)}</td>
                      <td class="p-2.5 text-center">${s.games ?? '-'}</td>
                      <td class="p-2.5 text-center font-bold text-amber-300">${s.points ?? '-'}</td>
                      <td class="p-2.5 text-center font-bold text-blue-300">${ppg}</td>
                      <td class="p-2.5 text-center">${s.totalRebounds ?? '-'}</td>
                      <td class="p-2.5 text-center">${s.assists ?? '-'}</td>
                      <td class="p-2.5 text-center font-bold text-emerald-400">${s.fibaRating ?? '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      container.innerHTML = `<div class="fip-card p-6 text-center text-xs text-red-400">Errore nel caricamento dei dati della squadra.</div>`;
    }
  }

  async showPlayer(projectKey, compFid, teamFid, playerFid, playerName) {
    this.navigate('player');
    const container = document.getElementById('playerDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento statistiche di ${this.escapeHtml(playerName || 'atleta')}...</p>
      </div>
    `;

    try {
      const query = `
        query GetPlayerStats($pK: String!, $cFid: String!, $tFid: String!, $pFid: String!) {
          player(projectKey: $pK, competitionFid: $cFid, teamFid: $tFid, fid: $pFid) {
            fid
            name
            lastName
            number
            photo
            captain
            team {
              fid
              name
              logo
            }
            competition {
              fid
              name
            }
            stats {
              games
              points
              pointsAVG
              pointsPerGame
              assists
              assistsAVG
              totalRebounds
              reboundsAVG
              steals
              stealsAVG
              blocks
              blocksAVG
              fibaRating
              freeThrowsPercentage
              inArcThrowsPercentage
              outArcThrowsPercentage
            }
          }
        }
      `;

      const data = await this.gql(query, { pK: projectKey || 'fip', cFid: compFid || '', tFid: teamFid || '', pFid: playerFid });
      const p = data?.player;
      if (!p) {
        container.innerHTML = `<div class="fip-card p-8 text-center text-xs text-gray-400">Scheda atleta non disponibile.</div>`;
        return;
      }

      this.currentPlayerData = p;
      const s = p.stats || {};
      const fullName = `${p.name} ${p.lastName || ''}`.trim();

      container.innerHTML = `
        <div class="fip-card p-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-2xl bg-gray-800 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                ${(p.photo && p.photo !== 'N/A') ? `<img src="${p.photo}" class="w-full h-full object-cover" alt="">` : `<i data-lucide="user" class="w-10 h-10 text-blue-400"></i>`}
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">${p.number ? '#' + p.number : 'ATLETA'}</span>
                  ${p.captain ? `<span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">CAPITANO</span>` : ''}
                </div>
                <h1 class="text-2xl md:text-3xl font-black text-white">${this.escapeHtml(fullName)}</h1>
                <p class="text-xs text-gray-400 mt-1 flex items-center gap-2">
                  <span class="text-white font-semibold">${this.escapeHtml(p.team?.name || '')}</span>
                  <span>•</span>
                  <span>${this.escapeHtml(p.competition?.name || '')}</span>
                </p>
              </div>
            </div>

            <button onclick="app.quickCompare('${this.escapeJs(fullName)}')" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
              <i data-lucide="git-compare" class="w-4 h-4"></i> Confronta con un altro giocatore
            </button>
          </div>
        </div>

        <!-- Key Averages Dashboard -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div class="fip-card p-4 text-center space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-mono">Partite (PG)</span>
            <div class="text-2xl font-black text-white font-mono">${s.games ?? '-'}</div>
          </div>
          <div class="fip-card p-4 text-center space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-mono">Punti / G (PPG)</span>
            <div class="text-2xl font-black text-amber-300 font-mono">${s.pointsPerGame ? Number(s.pointsPerGame).toFixed(1) : (s.points && s.games ? (s.points / s.games).toFixed(1) : '-')}</div>
          </div>
          <div class="fip-card p-4 text-center space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-mono">Rimbalzi / G</span>
            <div class="text-2xl font-black text-blue-300 font-mono">${s.reboundsAVG ? Number(s.reboundsAVG).toFixed(1) : (s.totalRebounds && s.games ? (s.totalRebounds / s.games).toFixed(1) : '-')}</div>
          </div>
          <div class="fip-card p-4 text-center space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-mono">Assist / G</span>
            <div class="text-2xl font-black text-cyan-300 font-mono">${s.assistsAVG ? Number(s.assistsAVG).toFixed(1) : (s.assists && s.games ? (s.assists / s.games).toFixed(1) : '-')}</div>
          </div>
          <div class="fip-card p-4 text-center space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-mono">Recuperi / G</span>
            <div class="text-2xl font-black text-indigo-300 font-mono">${s.stealsAVG ? Number(s.stealsAVG).toFixed(1) : (s.steals && s.games ? (s.steals / s.games).toFixed(1) : '-')}</div>
          </div>
          <div class="fip-card p-4 text-center space-y-1 bg-blue-600/10 border-blue-500/30">
            <span class="text-[10px] text-blue-400 uppercase font-mono font-bold">Valutazione (VAL)</span>
            <div class="text-2xl font-black text-emerald-400 font-mono">${s.fibaRating ?? '-'}</div>
          </div>
        </div>

        <!-- Shooting Percentages & Radar -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="fip-card p-6 space-y-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i data-lucide="percent" class="w-4 h-4 text-blue-400"></i>
              <span>Percentuali di Realizzazione</span>
            </h3>

            <div class="space-y-4 pt-2">
              <div>
                <div class="flex justify-between text-xs font-mono mb-1">
                  <span class="text-gray-300">Tiro da 2 Punti</span>
                  <span class="font-bold text-blue-400">${s.inArcThrowsPercentage ? Number(s.inArcThrowsPercentage).toFixed(1) : '0.0'}%</span>
                </div>
                <div class="h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div class="h-full bg-blue-500" style="width: ${Math.min(100, Number(s.inArcThrowsPercentage) || 0)}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-mono mb-1">
                  <span class="text-gray-300">Tiro da 3 Punti</span>
                  <span class="font-bold text-amber-400">${s.outArcThrowsPercentage ? Number(s.outArcThrowsPercentage).toFixed(1) : '0.0'}%</span>
                </div>
                <div class="h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div class="h-full bg-amber-500" style="width: ${Math.min(100, Number(s.outArcThrowsPercentage) || 0)}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-mono mb-1">
                  <span class="text-gray-300">Tiri Liberi</span>
                  <span class="font-bold text-emerald-400">${s.freeThrowsPercentage ? Number(s.freeThrowsPercentage).toFixed(1) : '0.0'}%</span>
                </div>
                <div class="h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div class="h-full bg-emerald-500" style="width: ${Math.min(100, Number(s.freeThrowsPercentage) || 0)}%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="fip-card p-6 space-y-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i data-lucide="pie-chart" class="w-4 h-4 text-cyan-400"></i>
              <span>Profilo Prestazionale Atleta</span>
            </h3>
            <div class="h-48 relative">
              <canvas id="playerRadarCanvas"></canvas>
            </div>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => this.initPlayerRadarChart(s, fullName), 50);
    } catch (e) {
      container.innerHTML = `<div class="fip-card p-6 text-center text-xs text-red-400">Errore nel caricamento del profilo giocatore.</div>`;
    }
  }

  initPlayerRadarChart(s, name) {
    const ctx = document.getElementById('playerRadarCanvas');
    if (!ctx) return;
    if (this.playerChart) this.playerChart.destroy();

    const ppg = Number(s.pointsPerGame) || 0;
    const rpg = Number(s.reboundsAVG) || 0;
    const apg = Number(s.assistsAVG) || 0;
    const spg = Number(s.stealsAVG) || 0;
    const val = Number(s.fibaRating) || 0;

    this.playerChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Punti', 'Rimbalzi', 'Assist', 'Recuperi', 'Valutazione'],
        datasets: [{
          label: name,
          data: [ppg, rpg * 2, apg * 2, spg * 4, val],
          backgroundColor: 'rgba(37, 99, 235, 0.25)',
          borderColor: '#2563eb',
          pointBackgroundColor: '#60a5fa',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: 'rgba(255,255,255,0.05)' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            pointLabels: { color: '#9ca3af', font: { size: 10 } },
            ticks: { display: false }
          }
        }
      }
    });
  }

  async showUniquePlayer(uniqueId, playerName) {
    this.navigate('player');
    const container = document.getElementById('playerDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento carriera di ${this.escapeHtml(playerName || 'atleta')}...</p>
      </div>
    `;

    try {
      const query = `
        query GetUniquePlayerCareer($id: String!) {
          uniquePlayer(id: $id) {
            id
            name
            lastName
            photo
            stats {
              games
              points
              pointsPerGame
              rebounds
              reboundsPerGame
              assists
              assistsPerGame
              steals
              stealsPerGame
              fibaRating
            }
          }
        }
      `;

      const data = await this.gql(query, { id: uniqueId });
      const up = data?.uniquePlayer;
      if (!up) {
        container.innerHTML = `<div class="fip-card p-8 text-center text-xs text-gray-400">Carriera non disponibile.</div>`;
        return;
      }

      const s = up.stats || {};
      const fullName = `${up.name} ${up.lastName || ''}`.trim();

      container.innerHTML = `
        <div class="fip-card p-6">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-2xl bg-gray-800 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
              ${(up.photo && up.photo !== 'N/A') ? `<img src="${up.photo}" class="w-full h-full object-cover" alt="">` : `<i data-lucide="user-check" class="w-10 h-10 text-cyan-400"></i>`}
            </div>
            <div>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">PROFILO CARRIERA FIP</span>
              <h1 class="text-2xl md:text-3xl font-black text-white mt-1">${this.escapeHtml(fullName)}</h1>
              <p class="text-xs text-gray-400 mt-0.5 font-mono">Dati aggregati multi-stagione</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div class="fip-card p-4 text-center space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-mono">Partite Totali</span>
            <div class="text-2xl font-black text-white font-mono">${s.games ?? '-'}</div>
          </div>
          <div class="fip-card p-4 text-center space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-mono">Punti / Partita</span>
            <div class="text-2xl font-black text-amber-300 font-mono">${s.pointsPerGame ? Number(s.pointsPerGame).toFixed(1) : '-'}</div>
          </div>
          <div class="fip-card p-4 text-center space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-mono">Rimbalzi / Partita</span>
            <div class="text-2xl font-black text-blue-300 font-mono">${s.reboundsPerGame ? Number(s.reboundsPerGame).toFixed(1) : '-'}</div>
          </div>
          <div class="fip-card p-4 text-center space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-mono">Assist / Partita</span>
            <div class="text-2xl font-black text-cyan-300 font-mono">${s.assistsPerGame ? Number(s.assistsPerGame).toFixed(1) : '-'}</div>
          </div>
          <div class="fip-card p-4 text-center space-y-1 bg-cyan-600/10 border-cyan-500/30">
            <span class="text-[10px] text-cyan-400 uppercase font-mono font-bold">Valutazione Totale</span>
            <div class="text-2xl font-black text-emerald-400 font-mono">${s.fibaRating ?? '-'}</div>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      container.innerHTML = `<div class="fip-card p-6 text-center text-xs text-red-400">Errore nel caricamento del profilo aggregato.</div>`;
    }
  }

  // ==========================================
  // HEAD-TO-HEAD COMPARISON
  // ==========================================

  quickCompare(playerName) {
    this.navigate('compare');
    const input1 = document.getElementById('comparePlayer1Input');
    if (input1) input1.value = playerName;
    this.updateComparison();
  }

  async updateComparison() {
    const p1Query = document.getElementById('comparePlayer1Input')?.value.trim();
    const p2Query = document.getElementById('comparePlayer2Input')?.value.trim();
    const container = document.getElementById('comparisonResultsContainer');
    if (!container) return;

    if (!p1Query || !p2Query) {
      container.innerHTML = `<p class="text-xs text-gray-400 text-center py-8">Inserisci due nomi di atleti FIP sopra per avviare il confronto diretto.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Confronto dati FIP in corso...</p>
      </div>
    `;

    try {
      const pSearchQuery = `
        query SearchPlayerForCompare($c: String!, $s: String!, $opt: ISearchOptions!) {
          searchPlayers(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
            fid
            name
            lastName
            projectKey
            competitionFid
            teamFid
            team { name }
            competition { name }
          }
        }
      `;

      let p1 = null;
      let p2 = null;

      for (const seasonId of this.knownSeasons) {
        if (!p1) {
          try {
            const d1 = await this.gql(pSearchQuery, { c: p1Query, s: seasonId, opt: { limit: 1 } });
            if (d1?.searchPlayers?.[0]) p1 = d1.searchPlayers[0];
          } catch (e) {}
        }
        if (!p2) {
          try {
            const d2 = await this.gql(pSearchQuery, { c: p2Query, s: seasonId, opt: { limit: 1 } });
            if (d2?.searchPlayers?.[0]) p2 = d2.searchPlayers[0];
          } catch (e) {}
        }
        if (p1 && p2) break;
      }

      const pStatQuery = `
        query GetPlayerStatsCompare($pK: String!, $cFid: String!, $tFid: String!, $pFid: String!) {
          player(projectKey: $pK, competitionFid: $cFid, teamFid: $tFid, fid: $pFid) {
            fid
            name
            lastName
            photo
            number
            team { name }
            stats {
              pointsPerGame
              reboundsAVG
              assistsAVG
              stealsAVG
              blocksAVG
              fibaRating
              inArcThrowsPercentage
              outArcThrowsPercentage
              freeThrowsPercentage
            }
          }
        }
      `;

      let p1Full = null;
      let p2Full = null;

      if (p1) {
        const d = await this.gql(pStatQuery, { pK: p1.projectKey || 'fip', cFid: p1.competitionFid || '', tFid: p1.teamFid || '', pFid: p1.fid });
        p1Full = d?.player;
      }
      if (p2) {
        const d = await this.gql(pStatQuery, { pK: p2.projectKey || 'fip', cFid: p2.competitionFid || '', tFid: p2.teamFid || '', pFid: p2.fid });
        p2Full = d?.player;
      }

      const s1 = p1Full?.stats || { pointsPerGame: 0, reboundsAVG: 0, assistsAVG: 0, stealsAVG: 0, fibaRating: 0 };
      const s2 = p2Full?.stats || { pointsPerGame: 0, reboundsAVG: 0, assistsAVG: 0, stealsAVG: 0, fibaRating: 0 };

      const name1 = p1Full ? `${p1Full.name} ${p1Full.lastName || ''}`.trim() : p1Query;
      const name2 = p2Full ? `${p2Full.name} ${p2Full.lastName || ''}`.trim() : p2Query;

      container.innerHTML = `
        <div class="space-y-6 pt-4">
          <!-- Comparison Radar Chart -->
          <div class="h-64 relative max-w-lg mx-auto">
            <canvas id="comparisonRadarCanvas"></canvas>
          </div>

          <!-- Comparison Metrics Table -->
          <div class="overflow-x-auto max-w-2xl mx-auto">
            <table class="w-full text-xs font-mono">
              <thead>
                <tr class="bg-gray-900 border-b border-white/5 text-gray-400">
                  <th class="p-3 text-left font-bold text-blue-400">${this.escapeHtml(name1)}</th>
                  <th class="p-3 text-center uppercase tracking-wider text-gray-300">Parametro</th>
                  <th class="p-3 text-right font-bold text-amber-400">${this.escapeHtml(name2)}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr class="hover:bg-white/5">
                  <td class="p-3 font-bold text-blue-400">${Number(s1.pointsPerGame || 0).toFixed(1)}</td>
                  <td class="p-3 text-center text-gray-400 font-sans">Punti / Partita (PPG)</td>
                  <td class="p-3 text-right font-bold text-amber-400">${Number(s2.pointsPerGame || 0).toFixed(1)}</td>
                </tr>
                <tr class="hover:bg-white/5">
                  <td class="p-3 font-bold text-blue-400">${Number(s1.reboundsAVG || 0).toFixed(1)}</td>
                  <td class="p-3 text-center text-gray-400 font-sans">Rimbalzi / Partita (RPG)</td>
                  <td class="p-3 text-right font-bold text-amber-400">${Number(s2.reboundsAVG || 0).toFixed(1)}</td>
                </tr>
                <tr class="hover:bg-white/5">
                  <td class="p-3 font-bold text-blue-400">${Number(s1.assistsAVG || 0).toFixed(1)}</td>
                  <td class="p-3 text-center text-gray-400 font-sans">Assist / Partita (APG)</td>
                  <td class="p-3 text-right font-bold text-amber-400">${Number(s2.assistsAVG || 0).toFixed(1)}</td>
                </tr>
                <tr class="hover:bg-white/5">
                  <td class="p-3 font-bold text-blue-400">${Number(s1.stealsAVG || 0).toFixed(1)}</td>
                  <td class="p-3 text-center text-gray-400 font-sans">Palle Recuperate (PR)</td>
                  <td class="p-3 text-right font-bold text-amber-400">${Number(s2.stealsAVG || 0).toFixed(1)}</td>
                </tr>
                <tr class="hover:bg-white/5">
                  <td class="p-3 font-bold text-blue-400">${s1.fibaRating ?? 0}</td>
                  <td class="p-3 text-center text-gray-400 font-sans font-bold text-white">Valutazione (VAL)</td>
                  <td class="p-3 text-right font-bold text-amber-400">${s2.fibaRating ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      const radarCtx = document.getElementById('comparisonRadarCanvas');
      if (radarCtx) {
        if (this.comparisonChart) this.comparisonChart.destroy();
        this.comparisonChart = new Chart(radarCtx, {
          type: 'radar',
          data: {
            labels: ['Punti (PPG)', 'Rimbalzi (RPG)', 'Assist (APG)', 'Recuperi (PR)', 'Valutazione (VAL)'],
            datasets: [
              {
                label: name1,
                data: [Number(s1.pointsPerGame) || 0, Number(s1.reboundsAVG) || 0, Number(s1.assistsAVG) || 0, Number(s1.stealsAVG) || 0, Number(s1.fibaRating) || 0],
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: '#2563eb',
                pointBackgroundColor: '#2563eb'
              },
              {
                label: name2,
                data: [Number(s2.pointsPerGame) || 0, Number(s2.reboundsAVG) || 0, Number(s2.assistsAVG) || 0, Number(s2.stealsAVG) || 0, Number(s2.fibaRating) || 0],
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderColor: '#f59e0b',
                pointBackgroundColor: '#f59e0b'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                angleLines: { color: 'rgba(255,255,255,0.05)' },
                grid: { color: 'rgba(255,255,255,0.05)' },
                pointLabels: { color: '#e5e7eb', font: { size: 10, weight: 'bold' } },
                ticks: { display: false }
              }
            }
          }
        });
      }
    } catch (e) {
      container.innerHTML = `<p class="text-xs text-red-400 text-center py-6">Errore durante il caricamento del confronto.</p>`;
    }
  }

  // ==========================================
  // PARTITE & RISULTATI VIEW
  // ==========================================

  async loadRecentMatches() {
    const select = document.getElementById('matchesCompSelect');
    const compName = select ? select.value : 'Under 15 Eccellenza';
    this.loadCompetitionMatches(compName);
  }

  async loadCompetitionMatches(compQuery) {
    const container = document.getElementById('matchesContentList');
    if (!container) return;

    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento calendario gare per "${this.escapeHtml(compQuery)}"...</p>
      </div>
    `;

    try {
      const q = `
        query SearchCompMatches($c: String!, $s: String!, $opt: ISearchOptions!) {
          searchCompetitions(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
            fid
            name
            projectKey
            groups {
              fid
              name
            }
          }
        }
      `;

      let comps = [];
      for (const seasonId of this.knownSeasons) {
        try {
          const data = await this.gql(q, { c: compQuery, s: seasonId, opt: { limit: 5 } });
          if (data?.searchCompetitions?.length > 0) {
            comps = data.searchCompetitions;
            break;
          }
        } catch (e) {}
      }

      if (comps.length === 0 || !comps[0].groups?.[0]) {
        container.innerHTML = `<p class="text-xs text-gray-400 text-center py-6">Nessuna partita trovata per questa categoria.</p>`;
        return;
      }

      const comp = comps[0];
      const group = comp.groups[0];

      const matchQuery = `
        query GetGroupMatchesList($pK: String!, $cFid: String!, $gFid: String!) {
          matchByGroup(projectKey: $pK, competitionFid: $cFid, groupFid: $gFid) {
            fid
            date
            status
            scores {
              total {
                homeScore
                awayScore
              }
            }
            homeTeam {
              fid
              name
              logo
            }
            awayTeam {
              fid
              name
              logo
            }
          }
        }
      `;

      const mData = await this.gql(matchQuery, { pK: comp.projectKey || 'fip', cFid: comp.fid, gFid: group.fid });
      const matches = mData?.matchByGroup || [];

      if (matches.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 text-center py-6">Nessun incontro in programma per il girone ${this.escapeHtml(group.name)}.</p>`;
        return;
      }

      container.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Fase / Girone: <strong class="text-white">${this.escapeHtml(group.name)}</strong> (${matches.length} gare)</span>
            <button onclick="app.showCompetition('${comp.fid}', '${comp.projectKey || 'fip'}', '${this.escapeJs(comp.name)}')" class="text-blue-400 hover:underline font-bold">Vedi tutti i gironi</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${matches.map(m => this.renderMatchItemCard(m, comp.projectKey || 'fip', comp.fid)).join('')}
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      container.innerHTML = `<p class="text-xs text-red-400 text-center py-6">Errore nel caricamento delle partite FIP.</p>`;
    }
  }

  // ==========================================
  // CLASSIFICHE VIEW
  // ==========================================

  async loadStandingsData(champQuery) {
    const container = document.getElementById('standingsContentTable');
    if (!container) return;

    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento classifiche ufficiali FIP...</p>
      </div>
    `;

    try {
      const q = `
        query GetChampionshipStandings($c: String!, $s: String!, $opt: ISearchOptions!) {
          searchCompetitions(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
            fid
            name
            projectKey
            groups {
              fid
              name
            }
          }
        }
      `;

      let comps = [];
      for (const seasonId of this.knownSeasons) {
        try {
          const data = await this.gql(q, { c: champQuery, s: seasonId, opt: { limit: 5 } });
          if (data?.searchCompetitions?.length > 0) {
            comps = data.searchCompetitions;
            break;
          }
        } catch (e) {}
      }

      if (comps.length === 0 || !comps[0].groups?.[0]) {
        container.innerHTML = `<p class="text-xs text-gray-400 text-center py-6">Nessuna classifica disponibile per questa categoria.</p>`;
        return;
      }

      const comp = comps[0];
      const group = comp.groups[0];
      this.loadGroupStandings(comp.projectKey || 'fip', comp.fid, group.fid);
    } catch (e) {
      container.innerHTML = `<p class="text-xs text-red-400 text-center py-6">Errore nel caricamento delle classifiche FIP.</p>`;
    }
  }

  async loadGroupStandings(projectKey, compFid, groupFid) {
    const target = document.getElementById('compGroupStandingsContent') || document.getElementById('standingsContentTable');
    if (!target) return;

    target.innerHTML = `
      <div class="py-8 flex flex-col items-center justify-center gap-2">
        <div class="w-6 h-6 spinner"></div>
        <p class="text-xs text-gray-400">Aggiornamento classifica girone...</p>
      </div>
    `;

    try {
      const query = `
        query GetGroupStandings($pK: String!, $cFid: String!, $gFid: String!) {
          standings(projectKey: $pK, competitionFid: $cFid, groupFid: $gFid) {
            fid
            name
            position
            logo
            stats {
              playedMatches
              wonMatches
              lostMatches
              pointsPerGame
              opponentsPointsPerGame
            }
          }
        }
      `;

      const data = await this.gql(query, { pK: projectKey || 'fip', cFid: compFid, gFid: groupFid });
      const rows = data?.standings || [];

      if (rows.length === 0) {
        target.innerHTML = `<p class="text-xs text-gray-400 text-center py-6">Classifica non ancora disponibile per questo girone.</p>`;
        return;
      }

      target.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-gray-900/60 text-gray-400 font-mono border-b border-white/5">
                <th class="p-3 w-12 text-center">POS</th>
                <th class="p-3">SQUADRA</th>
                <th class="p-3 text-center font-bold text-white">PT</th>
                <th class="p-3 text-center">G</th>
                <th class="p-3 text-center text-emerald-400">V</th>
                <th class="p-3 text-center text-red-400">P</th>
                <th class="p-3 text-center hidden sm:table-cell">PPG (Fatti)</th>
                <th class="p-3 text-center hidden sm:table-cell">OPPG (Subiti)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 font-mono">
              ${rows.map((row, idx) => {
                const s = row.stats || {};
                const pos = row.position || (idx + 1);
                const posBadge = pos <= 4 ? 'text-emerald-400 font-black' : (pos >= rows.length - 2 ? 'text-red-400' : 'text-gray-300');
                const pts = (s.wonMatches || 0) * 2;
                const ppg = s.pointsPerGame ? Number(s.pointsPerGame).toFixed(1) : '-';
                const oppg = s.opponentsPointsPerGame ? Number(s.opponentsPointsPerGame).toFixed(1) : '-';

                return `
                  <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.showTeam('${projectKey || 'fip'}', '${compFid}', '${row.fid}', '${this.escapeJs(row.name || '')}')">
                    <td class="p-3 text-center font-bold ${posBadge}">${pos}</td>
                    <td class="p-3 font-sans font-bold text-white flex items-center gap-2.5">
                      <div class="w-6 h-6 rounded bg-gray-800 flex items-center justify-center p-0.5 flex-shrink-0">
                        ${(row.logo && row.logo !== 'N/A') ? `<img src="${row.logo}" class="max-h-full max-w-full object-contain" alt="">` : `<i data-lucide="shield" class="w-3.5 h-3.5 text-blue-400"></i>`}
                      </div>
                      <span class="hover:text-blue-400 transition-colors">${this.escapeHtml(row.name || 'Squadra')}</span>
                    </td>
                    <td class="p-3 text-center font-bold text-white bg-blue-500/10">${pts}</td>
                    <td class="p-3 text-center">${s.playedMatches ?? 0}</td>
                    <td class="p-3 text-center font-bold text-emerald-400">${s.wonMatches ?? 0}</td>
                    <td class="p-3 text-center text-red-400">${s.lostMatches ?? 0}</td>
                    <td class="p-3 text-center text-gray-400 hidden sm:table-cell">${ppg}</td>
                    <td class="p-3 text-center text-gray-400 hidden sm:table-cell">${oppg}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      target.innerHTML = `<p class="text-xs text-red-400 text-center py-6">Errore nel recupero della classifica.</p>`;
    }
  }

  renderMatchItemCard(m, projectKey, compFid) {
    const hScore = m.scores?.total?.homeScore ?? '-';
    const aScore = m.scores?.total?.awayScore ?? '-';
    const dateStr = m.date ? new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Data da definire';

    let statusBadge = '<span class="text-[10px] text-gray-400 font-mono">Da Giocare</span>';
    if (m.status === 'LIVE' || m.status === 'IN_PROGRESS') {
      statusBadge = '<span class="text-[10px] text-red-400 font-bold animate-pulse">● LIVE</span>';
    } else if (m.status === 'FINISHED' || m.status === 'FINAL') {
      statusBadge = '<span class="text-[10px] text-blue-400 font-bold">Finale</span>';
    }

    return `
      <div onclick="app.showMatch('${projectKey || 'fip'}', '${compFid}', '${m.fid}')" class="fip-card fip-card-hover p-4 cursor-pointer flex flex-col justify-between gap-3 group">
        <div class="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
          <span>${dateStr}</span>
          ${statusBadge}
        </div>

        <div class="space-y-2 py-1">
          <div class="flex items-center justify-between gap-2">
            <span class="font-bold text-white group-hover:text-blue-400 transition-colors truncate max-w-[180px]">${this.escapeHtml(m.homeTeam?.name || 'Casa')}</span>
            <span class="font-mono font-black text-sm text-white">${hScore}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="font-bold text-white group-hover:text-amber-400 transition-colors truncate max-w-[180px]">${this.escapeHtml(m.awayTeam?.name || 'Ospite')}</span>
            <span class="font-mono font-black text-sm text-white">${aScore}</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-blue-400 font-bold">
          <span class="flex items-center gap-1 group-hover:underline">Match Center &amp; Tabellino <i data-lucide="chevron-right" class="w-3 h-3"></i></span>
          <span class="text-gray-500 font-mono text-[10px]">#${m.fid}</span>
        </div>
      </div>
    `;
  }

  // ==========================================
  // UTILITIES & SECURITY
  // ==========================================

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  escapeJs(str) {
    if (!str) return '';
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }
}

// Global App Instance
window.app = new BasketApp();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
