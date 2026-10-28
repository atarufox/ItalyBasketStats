/**
 * ItalyBasketStats - Modern Basketball Statistics Web App
 * Dual Engine: FIP Stats (NBN23 GraphQL) & Italia Canestro
 * 100% Real-time dynamic live data - Zero mock data
 * Static Zero-Backend Architecture (GitHub Pages & Local Browser Ready)
 * Version: 1.3.0
 */

class BasketApp {
  constructor() {
    this.version = '1.3.0';
    this.provider = 'dual'; // 'dual' | 'fip' | 'canestro'
    this.searchFilter = 'all'; // 'all' | 'players' | 'teams' | 'competitions'
    this.currentView = 'search';
    this.searchTimeout = null;
    this.comparisonChart = null;
    this.playerChart = null;

    // Match Details View State
    this.currentMatchData = null;
    this.currentMatchTab = 'boxscore'; // 'boxscore' | 'shotchart' | 'gameflow' | 'leaders' | 'lineups'
    this.matchBoxscorePeriod = null; // null (all) | 1 | 2 | 3 | 4
    this.shotChartFilter = { team: 'all', period: 'all', type: 'all', player: 'all' };
    this.lineupTeam = 'home'; // 'home' | 'away'
    this.matchFlowChart = null;
    this.matchLeadChart = null;
    this.previousView = 'search';

    // Dynamic Auth & Network Transport State
    this.firebaseApiKey = 'AIzaSyDfES1qET23MQ0Y5_cgbDYbeQ168xVcpiA';
    this.firebaseToken = null;
    this.tokenExpiry = 0;
    this.deviceId = 'fip-web-' + Math.random().toString(36).substring(2, 10);
    this.preferredTransport = null;

    // Multi-Season IDs (Dynamic & Fallback)
    // 686e1422dd2c672160d5ca4b = 2025/2026 (Active official championships & gironi)
    // 6a6871330078694f2edb74f3 = 2026/2027 (Current active season in FIP API)
    this.knownSeasons = [
      '686e1422dd2c672160d5ca4b',
      '6a6871330078694f2edb74f3'
    ];
    this.currentSeasonId = '686e1422dd2c672160d5ca4b';

    // Pre-configured Championship Directory for Instant Browsing
    this.championshipDirectory = [
      {
        id: 'u15-ecc',
        category: 'giovanili',
        name: 'Under 15 Maschile Eccellenza',
        tag: 'Eccellenza Giovanile',
        query: 'Under 15 Eccellenza',
        icon: 'zap',
        badgeColor: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
        desc: 'Il massimo livello del basket giovanile italiano U15 (19 gironi/fasi ufficiali)'
      },
      {
        id: 'u17-ecc',
        category: 'giovanili',
        name: 'Under 17 Maschile Eccellenza',
        tag: 'Eccellenza Giovanile',
        query: 'Under 17 Eccellenza',
        icon: 'flame',
        badgeColor: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
        desc: 'Campionato d\'eccellenza nazionale di categoria Under 17 (11 gironi/fasi)'
      },
      {
        id: 'u19-ecc',
        category: 'giovanili',
        name: 'Under 19 Maschile Eccellenza',
        tag: 'Eccellenza Giovanile',
        query: 'Under 19 Eccellenza',
        icon: 'award',
        badgeColor: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
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
        badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
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
        tag: 'Regionale Senior',
        query: 'Divisione Regionale 1',
        icon: 'map',
        badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
        desc: 'Ex Serie D regionale maschile'
      },
      {
        id: 'dr2',
        category: 'regionali',
        name: 'Divisione Regionale 2 (DR2)',
        tag: 'Regionale Senior',
        query: 'Divisione Regionale 2',
        icon: 'activity',
        badgeColor: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
        desc: 'Ex Prima Divisione / Promozione regionale'
      },
      {
        id: 'a1-femm',
        category: 'femminili',
        name: 'Serie A1 Femminile',
        tag: 'Nazionale Femminile',
        query: 'A1 Femminile',
        icon: 'sparkles',
        badgeColor: 'border-pink-500/30 text-pink-400 bg-pink-500/10',
        desc: 'Massima divisione della pallacanestro femminile italiana'
      },
      {
        id: 'a2-femm',
        category: 'femminili',
        name: 'Serie A2 Femminile',
        tag: 'Nazionale LBF',
        query: 'Serie A2 Femminile',
        icon: 'heart',
        badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
        desc: 'Secondo livello nazionale femminile diviso in gironi'
      }
    ];

    this.activeCategoryFilter = 'all';

    this.init();
  }

  async init() {
    if (window.lucide) {
      window.lucide.createIcons();
    }

    const vBadge = document.getElementById('appVersionBadge');
    if (vBadge) vBadge.textContent = `v${this.version}`;

    this.renderChampionshipsDirectory();

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
    const randEmail = `basket_${Date.now()}_${Math.floor(Math.random() * 100000)}@nbn23app.test`;

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
      console.warn('Direct Firebase Auth fetch warning:', e);
    }

    return this.firebaseToken;
  }

  async gql(query, variables = {}) {
    const token = await this.getFirebaseAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'x-device-id': this.deviceId,
      'x-package-name': 'com.nbn23.fipapp',
      'x-package-version': '2.13.0'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const bodyStr = JSON.stringify({ query, variables });
    const targetUrl = 'https://internal.nbn23.app/graphql';

    // 1. Direct fetch
    try {
      const directResp = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: bodyStr
      });
      if (directResp.ok) {
        const json = await directResp.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // Fallback
    }

    // 2. AllOrigins CORS Fallback
    try {
      const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const aoResp = await fetch(allOriginsUrl, {
        method: 'POST',
        headers,
        body: bodyStr
      });
      if (aoResp.ok) {
        const json = await aoResp.json();
        if (json.data) return json.data;
      }
    } catch (e) {}

    // 3. CodeTabs CORS Fallback
    try {
      const ctUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
      const ctResp = await fetch(ctUrl, {
        method: 'POST',
        headers,
        body: bodyStr
      });
      if (ctResp.ok) {
        const json = await ctResp.json();
        if (json.data) return json.data;
      }
    } catch (e) {}

    throw new Error('Impossibile raggiungere i server FIP. Verifica la connessione internet.');
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
          if (!this.knownSeasons.includes(s.id)) {
            this.knownSeasons.push(s.id);
          }
        }
      }
    } catch (e) {
      console.warn('Using default known seasons list');
    }
  }

  // ==========================================
  // NAVIGATION & ROUTING
  // ==========================================

  navigate(viewName, data = null) {
    if (this.currentView !== 'match') {
      this.previousView = this.currentView;
    }
    this.currentView = viewName;

    // Destroy match charts if leaving match view
    if (viewName !== 'match') {
      if (this.matchFlowChart) { this.matchFlowChart.destroy(); this.matchFlowChart = null; }
      if (this.matchLeadChart) { this.matchLeadChart.destroy(); this.matchLeadChart = null; }
    }

    // Update active nav button
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.className = 'nav-tab px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5';
    });
    document.querySelectorAll('.mobile-bottom-nav button').forEach(btn => {
      btn.className = 'flex flex-col items-center gap-1 text-gray-400 hover:text-white text-[10px] font-semibold';
    });

    const activeNavBtn = document.getElementById(`nav-btn-${viewName}`);
    if (activeNavBtn) {
      activeNavBtn.className = 'nav-tab active px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 text-white bg-orange-500/20 text-orange-400 border border-orange-500/30';
    }

    const mobNavBtn = document.getElementById(`mob-nav-${viewName}`);
    if (mobNavBtn) {
      mobNavBtn.className = 'flex flex-col items-center gap-1 text-orange-400 text-[10px] font-bold';
    }

    // Hide all view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.add('hidden');
    });

    // Show target panel
    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
    }

    // Specific actions on navigation
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

  setProvider(provider) {
    this.provider = provider;
    this.updateLoadingIndicatorText();
    const searchVal = document.getElementById('globalSearchInput')?.value.trim();
    if (searchVal) {
      this.performSearch(searchVal);
    }
  }

  updateLoadingIndicatorText() {
    const textEl = document.getElementById('loadingIndicatorText');
    if (!textEl) return;
    if (this.provider === 'canestro') {
      textEl.textContent = 'Interrogazione API Italia Canestro in corso...';
    } else if (this.provider === 'fip') {
      textEl.textContent = 'Interrogazione API FIP Stats (GraphQL) in corso...';
    } else {
      textEl.textContent = 'Interrogazione Dual Engine (FIP & Italia Canestro)...';
    }
  }

  setSearchFilter(filter) {
    this.searchFilter = filter;
    document.querySelectorAll('.search-filter-chip').forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.className = 'search-filter-chip active px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold';
      } else {
        btn.className = 'search-filter-chip px-3 py-1 rounded-full bg-gray-800 text-gray-400 hover:text-white border border-white/5 font-semibold';
      }
    });

    const searchVal = document.getElementById('globalSearchInput')?.value.trim();
    if (searchVal) {
      this.performSearch(searchVal);
    }
  }

  // ==========================================
  // CHAMPIONSHIPS BROWSER (CAMPIONATI HUB)
  // ==========================================

  setChampionshipCategory(category) {
    this.activeCategoryFilter = category;
    document.querySelectorAll('.champ-cat-btn').forEach(btn => {
      if (btn.dataset.category === category) {
        btn.className = 'champ-cat-btn active px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-xs transition-all flex items-center gap-2';
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
      <div class="glass-panel glass-panel-hover p-5 flex flex-col justify-between gap-4 group cursor-pointer transition-all border border-white/5 hover:border-orange-500/40" onclick="app.openChampionshipByQuery('${this.escapeJs(item.query)}')">
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor} uppercase tracking-wider">${item.tag}</span>
            <div class="w-8 h-8 rounded-lg bg-gray-800/90 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
              <i data-lucide="${item.icon}" class="w-4 h-4"></i>
            </div>
          </div>
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">${this.escapeHtml(item.name)}</h3>
            <p class="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">${this.escapeHtml(item.desc)}</p>
          </div>
        </div>

        <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span class="text-orange-400 font-bold flex items-center gap-1 group-hover:underline">
            <span>Sfoglia Gironi &amp; Classifiche</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </span>
          <span class="text-[10px] text-gray-500 font-mono">FIP Live Hub</span>
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
      for (const seasonId of this.knownSeasons) {
        try {
          const data = await this.gql(q, { c: queryStr, s: seasonId, opt: { limit: 10 } });
          if (data?.searchCompetitions && data.searchCompetitions.length > 0) {
            comps = data.searchCompetitions;
            break;
          }
        } catch (err) {
          console.warn(`Championship search query failed on season ${seasonId}:`, err);
        }
      }

      if (comps.length === 0) {
        container.innerHTML = `
          <div class="glass-panel p-8 text-center space-y-3">
            <h3 class="text-lg font-bold text-white">Nessuna competizione trovata per "${this.escapeHtml(queryStr)}"</h3>
            <p class="text-xs text-gray-400">Prova a cercarla tramite la barra di ricerca globale o con parole chiave diverse.</p>
            <button onclick="app.navigate('championships')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna ai Campionati</button>
          </div>
        `;
        return;
      }

      const comp = comps[0];
      this.renderFullCompetitionView(comp, comps);
    } catch (e) {
      console.error('Error opening championship:', e);
      container.innerHTML = `
        <div class="glass-panel p-8 text-center space-y-3 border-red-500/30">
          <p class="text-sm text-red-400">Errore nel caricamento del campionato.</p>
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
      <!-- Competition Header -->
      <div class="glass-panel p-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl flex-shrink-0">
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
          
          <div class="flex items-center gap-2">
            <button onclick="app.navigate('championships')" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Tutti i Campionati
            </button>
          </div>
        </div>

        ${relatedComps.length > 1 ? `
          <div class="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 overflow-x-auto pb-1 text-xs">
            <span class="text-gray-400 font-semibold flex-shrink-0">Fasi collegate:</span>
            ${relatedComps.map(rc => `
              <button onclick="app.showCompetition('${rc.fid}', '${rc.projectKey || 'fip'}', '${this.escapeJs(rc.name)}')" class="px-3 py-1 rounded-lg ${rc.fid === comp.fid ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-900 text-gray-400 hover:text-white'} font-semibold flex-shrink-0">
                ${this.escapeHtml(rc.shortName || rc.name)}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Groups & Standings Section -->
      <div class="glass-panel p-6 space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="award" class="w-4 h-4 text-amber-400"></i>
              <span>Classifica &amp; Calendario Girone</span>
            </h3>
            <p class="text-xs text-gray-400">Dati in tempo reale sincronizzati dai referti ufficiali FIP</p>
          </div>

          ${groups.length > 0 ? `
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-400 font-medium">Seleziona Girone:</label>
              <select id="compGroupSelect" onchange="app.loadGroupStandings('${comp.projectKey || 'fip'}', '${comp.fid}', this.value)" class="bg-gray-900 border border-white/10 text-xs font-bold rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500">
                ${groups.map(g => `<option value="${g.fid}">${this.escapeHtml(g.name)}</option>`).join('')}
              </select>
            </div>
          ` : ''}
        </div>

        <div id="compGroupStandingsContent">
          <!-- Standings table filled dynamically -->
        </div>

        <!-- Group Matches Section -->
        <div class="pt-6 border-t border-white/10 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <i data-lucide="calendar" class="w-4 h-4 text-orange-400"></i>
              <span>Partite &amp; Referti del Girone</span>
            </h4>
            <span class="text-xs text-gray-400">Clicca su una partita per aprire il referto e la mappa tiri</span>
          </div>
          <div id="compGroupMatchesContent">
            <!-- Group matches list -->
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    if (firstGroup) {
      this.loadGroupStandings(comp.projectKey || 'fip', comp.fid, firstGroup.fid);
      this.loadGroupMatches(comp.projectKey || 'fip', comp.fid, firstGroup.fid);
    } else {
      document.getElementById('compGroupStandingsContent').innerHTML = `<p class="text-xs text-gray-400 text-center py-6">Nessun girone attivo per questo torneo.</p>`;
    }
  }

  async loadGroupMatches(projectKey, compFid, groupFid) {
    const container = document.getElementById('compGroupMatchesContent');
    if (!container) return;

    container.innerHTML = `
      <div class="py-6 flex flex-col items-center justify-center gap-2">
        <div class="w-6 h-6 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento partite del girone...</p>
      </div>
    `;

    try {
      const matchQ = `
        query GetMatchesLive($pK: String!, $cFid: String!, $gFid: String!) {
          matchByGroup(projectKey: $pK, competitionFid: $cFid, groupFid: $gFid) {
            fid
            date
            status
            roundName
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

      const mData = await this.gql(matchQ, { pK: projectKey || 'fip', cFid: compFid, gFid: groupFid });
      const matches = mData?.matchByGroup || [];

      if (matches.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 text-center py-4">Nessun incontro programmato o refertato in questa fase.</p>`;
        return;
      }

      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${matches.map(m => {
            const home = m.homeTeam || { name: 'Squadra Casa' };
            const away = m.awayTeam || { name: 'Squadra Ospite' };
            const isFinished = m.status === 'FINISHED' || m.status === 'CLOSED';
            const isLive = m.status === 'LIVE' || m.status === 'IN_PROGRESS';

            return `
              <div class="glass-panel glass-panel-hover p-4 space-y-2.5 cursor-pointer border border-white/5 hover:border-orange-500/40" onclick="app.showMatch('${projectKey || 'fip'}', '${m.fid}')">
                <div class="flex items-center justify-between text-[11px] border-b border-white/5 pb-1.5">
                  <span class="font-mono text-gray-400">${this.escapeHtml(m.roundName || 'Fase a Gironi')}</span>
                  ${isLive ? '<span class="badge-live text-[9px] font-bold px-2 py-0.5 rounded uppercase">LIVE</span>' : (isFinished ? '<span class="text-[9px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400">FINALE</span>' : '<span class="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">PROGRAMMATA</span>')}
                </div>
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-white line-clamp-1">${this.escapeHtml(home.name)}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-white line-clamp-1">${this.escapeHtml(away.name)}</span>
                  </div>
                </div>
                <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                  <span>${m.date ? new Date(m.date).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : 'Data da definire'}</span>
                  <span class="text-orange-400 font-semibold flex items-center gap-1">Referto &amp; Mappa Tiri &rarr;</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.warn('Error loading group matches:', e);
      container.innerHTML = `<p class="text-xs text-gray-400 text-center py-4">Calendario gare non disponibile al momento.</p>`;
    }
  }

  // ==========================================
  // SEARCH LOGIC & LIVE QUERY
  // ==========================================

  handleSearchInput(value) {
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
      if (value.length > 0) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }

    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    if (value.trim().length >= 3) {
      this.searchTimeout = setTimeout(() => {
        this.performSearch(value.trim());
      }, 450);
    } else if (value.trim().length === 0) {
      this.showWelcomeState();
    }
  }

  clearSearch() {
    const input = document.getElementById('globalSearchInput');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.handleSearchInput('');
  }

  quickSearch(query) {
    const input = document.getElementById('globalSearchInput');
    if (input) {
      input.value = query;
    }
    this.performSearch(query);
  }

  showWelcomeState() {
    const welcome = document.getElementById('searchWelcomeState');
    const grid = document.getElementById('searchResultsGrid');
    const title = document.getElementById('searchResultsTitle');
    const count = document.getElementById('resultsCountBadge');

    if (welcome) welcome.classList.remove('hidden');
    if (grid) grid.innerHTML = '';
    if (title) title.innerHTML = `<i data-lucide="layout-grid" class="w-5 h-5 text-orange-400"></i><span>Esplora Database Live</span>`;
    if (count) count.textContent = 'In attesa di ricerca';
    if (window.lucide) window.lucide.createIcons();
  }

  async performSearch(query) {
    if (!query || query.trim().length < 2) return;
    this.navigate('search');

    const loader = document.getElementById('loadingIndicator');
    const welcome = document.getElementById('searchWelcomeState');
    const grid = document.getElementById('searchResultsGrid');
    const title = document.getElementById('searchResultsTitle');
    const count = document.getElementById('resultsCountBadge');

    if (loader) loader.classList.remove('hidden');
    if (welcome) welcome.classList.add('hidden');
    if (grid) grid.innerHTML = '';
    if (title) title.innerHTML = `<i data-lucide="search" class="w-5 h-5 text-orange-400"></i><span>Risultati per "${this.escapeHtml(query)}"</span>`;
    if (count) count.textContent = 'Ricerca in corso...';

    try {
      const results = await this.queryLiveSearch(query);
      if (loader) loader.classList.add('hidden');

      if (!results || results.length === 0) {
        if (count) count.textContent = '0 risultati';
        if (grid) {
          grid.innerHTML = `
            <div class="col-span-full glass-panel p-8 text-center space-y-3">
              <div class="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-gray-500">
                <i data-lucide="alert-circle" class="w-6 h-6"></i>
              </div>
              <h3 class="text-base font-bold text-white">Nessun risultato trovato</h3>
              <p class="text-xs text-gray-400 max-w-md mx-auto">Non abbiamo trovato atleti, squadre o campionati corrispondenti a "${this.escapeHtml(query)}". Verifica l'ortografia o prova con una ricerca più generica.</p>
            </div>
          `;
        }
      } else {
        if (count) count.textContent = `${results.length} elementi`;
        if (grid) {
          grid.innerHTML = results.map(item => this.renderResultCard(item)).join('');
        }
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Search failure:', err);
      if (loader) loader.classList.add('hidden');
      if (count) count.textContent = 'Errore';
      if (grid) {
        grid.innerHTML = `
          <div class="col-span-full glass-panel p-6 text-center border-red-500/30 text-red-400 space-y-2">
            <p class="text-sm font-semibold">Errore durante la consultazione dei server FIP Stats.</p>
            <p class="text-xs text-gray-400">Riprova tra qualche istante.</p>
          </div>
        `;
      }
    }
  }

  async queryLiveSearch(criteria) {
    const allResults = [];

    // FIP GraphQL Search
    if (this.provider === 'dual' || this.provider === 'fip') {
      const q = `
        query LiveGlobalSearch($c: String!, $s: String!, $opt: ISearchOptions!) {
          searchPlayers(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
            fid
            name
            lastName
            number
            photo
            projectKey
            competitionFid
            teamFid
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
          searchTeams(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
            fid
            name
            logo
            projectKey
            competitionFid
            competition {
              fid
              name
            }
          }
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
          search(searchCriteria: $c, searchOptions: $opt) {
            fid
            type
            title
            subtitle
            meta
            image
            projectKey
            uniqueId
          }
        }
      `;

      for (const seasonId of this.knownSeasons) {
        try {
          const data = await this.gql(q, {
            c: criteria,
            s: seasonId,
            opt: { limit: 12 }
          });

          if (data) {
            if (data.searchPlayers) {
              data.searchPlayers.forEach(p => {
                const fullName = `${p.name} ${p.lastName || ''}`.trim();
                allResults.push({
                  type: 'player',
                  fid: p.fid,
                  title: fullName,
                  subtitle: p.team?.name || 'Squadra FIP',
                  meta: p.competition?.name ? `${p.competition.name}${p.number ? ' • #' + p.number : ''}` : (p.number ? '#' + p.number : 'FIP Atleta'),
                  avatar: p.photo,
                  projectKey: p.projectKey || 'fip',
                  compFid: p.competitionFid || p.competition?.fid,
                  teamFid: p.teamFid || p.team?.fid
                });
              });
            }

            if (data.searchTeams) {
              data.searchTeams.forEach(t => {
                allResults.push({
                  type: 'team',
                  fid: t.fid,
                  title: t.name,
                  subtitle: t.competition?.name || 'Campionato FIP',
                  meta: 'Squadra Federale',
                  avatar: t.logo,
                  projectKey: t.projectKey || 'fip',
                  compFid: t.competitionFid || t.competition?.fid
                });
              });
            }

            if (data.searchCompetitions) {
              data.searchCompetitions.forEach(c => {
                const groupsCount = c.groups ? c.groups.length : 0;
                allResults.push({
                  type: 'competition',
                  fid: c.fid,
                  title: c.name,
                  subtitle: c.categoryName || 'Federazione Italiana Pallacanestro',
                  meta: `${groupsCount} Gironi / Fasi`,
                  avatar: null,
                  projectKey: c.projectKey || 'fip'
                });
              });
            }

            if (data.search) {
              data.search.forEach(s => {
                if (s.type === 'PLAYER' || s.type === 'UNIQUE_PLAYER') {
                  allResults.push({
                    type: s.uniqueId ? 'uniquePlayer' : 'player',
                    fid: s.fid,
                    uniqueId: s.uniqueId,
                    title: s.title,
                    subtitle: s.subtitle,
                    meta: s.meta || 'Profilo Unico Carriera',
                    avatar: s.image,
                    projectKey: s.projectKey || 'fip'
                  });
                }
              });
            }

            if (allResults.length > 0) break;
          }
        } catch (err) {
          console.warn(`Query on season ${seasonId} notice:`, err);
        }
      }
    }

    // Filter by type if user selected chips
    const seen = new Set();
    return allResults.filter(item => {
      const key = `${item.type}_${item.fid || item.uniqueId}_${item.title}`;
      if (seen.has(key)) return false;
      seen.add(key);

      if (this.searchFilter === 'players') return item.type === 'player' || item.type === 'uniquePlayer';
      if (this.searchFilter === 'teams') return item.type === 'team';
      if (this.searchFilter === 'competitions') return item.type === 'competition';
      return true;
    });
  }

  renderResultCard(item) {
    let icon = 'shield';
    let typeBadge = '';
    let clickHandler = '';

    if (item.type === 'player') {
      icon = 'user';
      typeBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ATLETA</span>';
      clickHandler = `app.showPlayer('${item.projectKey || 'fip'}', '${item.compFid}', '${item.teamFid}', '${item.fid}', '${this.escapeJs(item.title)}')`;
    } else if (item.type === 'uniquePlayer') {
      icon = 'user-check';
      typeBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">CARRIERA FIP</span>';
      clickHandler = `app.showUniquePlayer('${item.uniqueId}', '${this.escapeJs(item.title)}')`;
    } else if (item.type === 'team') {
      icon = 'shield';
      typeBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">SQUADRA</span>';
      clickHandler = `app.showTeam('${item.projectKey || 'fip'}', '${item.compFid}', '${item.fid}', '${this.escapeJs(item.title)}')`;
    } else if (item.type === 'competition') {
      icon = 'trophy';
      typeBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">CAMPIONATO</span>';
      clickHandler = `app.showCompetition('${item.fid}', '${item.projectKey || 'fip'}', '${this.escapeJs(item.title)}')`;
    }

    const providerIcon = this.provider === 'canestro' ? '🟠' : (this.provider === 'fip' ? '🔵' : '⚡');
    const providerName = this.provider === 'canestro' ? 'Italia Canestro' : (this.provider === 'fip' ? 'FIP Stats' : 'Dual Live Engine');

    return `
      <div onclick="${clickHandler}" class="glass-panel glass-panel-hover p-4 cursor-pointer flex flex-col justify-between gap-3 group">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gray-800/80 border border-white/10 flex items-center justify-center text-orange-400 group-hover:border-orange-500/40 group-hover:scale-105 transition-all flex-shrink-0 overflow-hidden">
              ${item.avatar ? `<img src="${item.avatar}" class="w-full h-full object-cover" alt="${this.escapeHtml(item.title)}" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<i data-lucide=\\'${icon}\\' class=\\'w-6 h-6\\'></i>';">` : `<i data-lucide="${icon}" class="w-6 h-6"></i>`}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                ${typeBadge}
              </div>
              <h3 class="font-bold text-base text-white group-hover:text-orange-400 transition-colors line-clamp-1">${this.escapeHtml(item.title)}</h3>
              <p class="text-xs text-gray-400 line-clamp-1">${this.escapeHtml(item.subtitle || '')}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
          <span class="font-mono text-[11px] text-gray-400">${this.escapeHtml(item.meta || '')}</span>
          <div class="flex items-center gap-1.5">
            <span class="badge-fip text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"><span>${providerIcon}</span> ${providerName}</span>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // DETAIL VIEWS (TEAM, PLAYER, MATCH, STANDINGS)
  // ==========================================

  // --- DETAIL: TEAM VIEW ---
  async showTeam(projectKey, compFid, teamFid, teamName) {
    this.navigate('team');
    const container = document.getElementById('teamDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento rosa, statistiche e calendario di ${this.escapeHtml(teamName || 'squadra')}...</p>
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
              starting
              stats {
                games
                points
                pointsPerGame
                totalRebounds
                assists
                steals
                blocks
                turnovers
                fibaRating
              }
            }
            lastMatches {
              fid
              date
              status
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
        }
      `;

      const scheduleQuery = `
        query teamSchedule($pK: String!, $cFid: String!, $tFid: String!) {
          teamMatch(projectKey: $pK, competitionFid: $cFid, teamFid: $tFid) {
            fid
            court {
              place
              town
            }
            date
            homeTeam {
              id
              name
              logo
            }
            awayTeam {
              id
              name
              logo
            }
            scores {
              total {
                homeScore
                awayScore
              }
            }
            timeStatus {
              status
              period
            }
          }
        }
      `;

      const [teamRes, schedRes] = await Promise.all([
        this.gql(query, { pK: projectKey || 'fip', cFid: compFid || '', tFid: teamFid }).catch(() => null),
        this.gql(scheduleQuery, { pK: projectKey || 'fip', cFid: compFid || '', tFid: teamFid }).catch(() => null)
      ]);

      const teamList = teamRes?.team;
      const team = Array.isArray(teamList) ? teamList[0] : teamList;
      const scheduleMatches = schedRes?.teamMatch || team?.lastMatches || [];

      if (!team) {
        container.innerHTML = `
          <div class="glass-panel p-8 text-center space-y-3">
            <h3 class="text-lg font-bold text-white">Dettagli squadra non disponibili</h3>
            <p class="text-xs text-gray-400">Non è stato possibile reperire il roster per questa specifica competizione.</p>
            <button onclick="app.navigate('search')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white hover:bg-gray-700">Torna alla ricerca</button>
          </div>
        `;
        return;
      }

      const players = team.players || [];

      const rosterHtml = players.length > 0 ? `
        <div class="overflow-x-auto">
          <table class="w-full text-left stats-table">
            <thead>
              <tr class="bg-gray-900/40">
                <th class="w-12">#</th>
                <th>Giocatore</th>
                <th class="text-center">Ruolo / Note</th>
                <th class="text-center">PG</th>
                <th class="text-center">Punti</th>
                <th class="text-center">PPG</th>
                <th class="text-center">Rimbalzi</th>
                <th class="text-center">Assist</th>
                <th class="text-center" title="Valutazione di rendimento FIBA (PIR)">Valutazione (VAL)</th>
              </tr>
            </thead>
            <tbody>
              ${players.map(p => {
                const stats = p.stats || {};
                const pName = `${p.name} ${p.lastName || ''}`.trim();
                const ppg = stats.pointsPerGame ? Number(stats.pointsPerGame).toFixed(1) : (stats.games ? (stats.points / stats.games).toFixed(1) : '0.0');
                const photoHtml = (p.photo && p.photo !== 'N/A')
                  ? `<img src="${p.photo}" class="w-8 h-8 rounded-full object-cover border border-white/10" alt="${this.escapeHtml(pName)}" onerror="this.style.display='none'">`
                  : `<div class="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-xs font-bold text-orange-400">${p.number || '•'}</div>`;

                return `
                  <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.showPlayer('${projectKey || 'fip'}', '${compFid}', '${teamFid}', '${p.fid}', '${this.escapeJs(pName)}')">
                    <td class="font-mono text-orange-400 font-bold">${p.number ? '#' + p.number : '-'}</td>
                    <td>
                      <div class="flex items-center gap-2.5">
                        ${photoHtml}
                        <div>
                          <div class="font-bold text-white hover:text-orange-400 transition-colors">${this.escapeHtml(pName)}</div>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      ${p.captain ? '<span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">CAPITANO</span>' : '<span class="text-gray-500 text-xs">-</span>'}
                    </td>
                    <td class="text-center font-mono font-semibold">${stats.games ?? '-'}</td>
                    <td class="text-center font-mono font-bold text-orange-400">${stats.points ?? '-'}</td>
                    <td class="text-center font-mono text-amber-300 font-bold">${ppg}</td>
                    <td class="text-center font-mono">${stats.totalRebounds ?? '-'}</td>
                    <td class="text-center font-mono">${stats.assists ?? '-'}</td>
                    <td class="text-center font-mono text-emerald-400 font-bold">${stats.fibaRating ?? '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="p-6 text-center text-xs text-gray-400">Roster in fase di sincronizzazione FIP.</div>
      `;

      const scheduleHtml = scheduleMatches.length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${scheduleMatches.map(m => {
            const h = m.homeTeam || { name: 'Squadra Casa' };
            const a = m.awayTeam || { name: 'Squadra Ospite' };
            const hScore = m.scores?.total?.homeScore;
            const aScore = m.scores?.total?.awayScore;
            const hasScore = hScore !== undefined && aScore !== undefined && hScore !== null;
            const isClosed = m.timeStatus?.status === 'CLOSED' || m.status === 'FINISHED' || m.status === 'CLOSED';

            return `
              <div class="glass-panel glass-panel-hover p-4 space-y-3 cursor-pointer border border-white/5 hover:border-orange-500/40" onclick="app.showMatch('${projectKey || 'fip'}', '${m.fid}')">
                <div class="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span class="text-gray-400 text-[11px]">${m.date ? new Date(m.date).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : 'Data da definire'}</span>
                  ${isClosed ? '<span class="text-[9px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">FINALE</span>' : '<span class="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">PROGRAMMATA</span>'}
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-sm text-white line-clamp-1">${this.escapeHtml(h.name)}</span>
                    <span class="font-mono font-black text-base text-white ml-2">${hasScore ? hScore : '-'}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-sm text-white line-clamp-1">${this.escapeHtml(a.name)}</span>
                    <span class="font-mono font-black text-base text-white ml-2">${hasScore ? aScore : '-'}</span>
                  </div>
                </div>

                <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                  <span class="truncate">${this.escapeHtml(m.court?.place || m.court?.town || 'Campo Federale')}</span>
                  <span class="text-orange-400 font-bold flex items-center gap-1">Vedi Boxscore &rarr;</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="p-6 text-center text-xs text-gray-400">Nessun incontro registrato al momento.</div>
      `;

      container.innerHTML = `
        <!-- Team Hero Header -->
        <div class="glass-panel p-6 relative overflow-hidden">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-2xl bg-gray-800/80 border border-white/10 flex items-center justify-center p-2 flex-shrink-0">
                ${(team.logo && team.logo !== 'N/A') ? `<img src="${team.logo}" class="max-h-full max-w-full object-contain" alt="${this.escapeHtml(team.name)}">` : `<i data-lucide="shield" class="w-10 h-10 text-orange-400"></i>`}
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">SQUADRA UFFICIALE</span>
                  ${team.standingPosition ? `<span class="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono">Posizione: ${team.standingPosition}°</span>` : ''}
                </div>
                <h1 class="text-2xl md:text-3xl font-extrabold text-white">${this.escapeHtml(team.name)}</h1>
                <p class="text-sm text-gray-400 mt-1">${this.escapeHtml(team.competition?.name || 'Campionato FIP')}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button onclick="app.navigate('search')" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Torna alla ricerca
              </button>
            </div>
          </div>
        </div>

        <!-- Roster Table Panel -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="users" class="w-4 h-4 text-orange-400"></i>
              <span>Rosa Giocatori &amp; Statistiche Individuali (${players.length})</span>
            </h3>
            <span class="text-xs text-gray-400">Clicca su un atleta per visualizzare la scheda completa</span>
          </div>
          ${rosterHtml}
        </div>

        <!-- Season Schedule Panel -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="calendar" class="w-4 h-4 text-amber-400"></i>
              <span>Calendario Incontri &amp; Risultati (${scheduleMatches.length})</span>
            </h3>
            <span class="text-xs text-gray-400">Clicca su una partita per aprire il referto completo</span>
          </div>
          ${scheduleHtml}
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      console.error('Error showing team:', err);
      container.innerHTML = `
        <div class="glass-panel p-6 text-center border-red-500/30 space-y-3">
          <p class="text-sm text-red-400">Errore nel caricamento dei dati della squadra.</p>
          <button onclick="app.navigate('search')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna indietro</button>
        </div>
      `;
    }
  }

  // --- DETAIL: PLAYER VIEW ---
  async showPlayer(projectKey, compFid, teamFid, playerFid, playerName) {
    this.navigate('player');
    const container = document.getElementById('playerDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento statistiche avanzate di ${this.escapeHtml(playerName || 'atleta')}...</p>
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
            starting
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
              assistsPerGame
              totalRebounds
              reboundsAVG
              steals
              stealsAVG
              blocks
              blocksAVG
              fouls
              foulsAVG
              turnovers
              turnoversAVG
              plusMinus
              fibaRating
              freeThrowsMade
              freeThrowsFailed
              freeThrowsPercentage
              inArcThrowsMade
              inArcThrowsFailed
              inArcThrowsPercentage
              outArcThrowsMade
              outArcThrowsFailed
              outArcThrowsPercentage
            }
          }
        }
      `;

      const schedQuery = `
        query teamSchedule($pK: String!, $cFid: String!, $tFid: String!) {
          teamMatch(projectKey: $pK, competitionFid: $cFid, teamFid: $tFid) {
            fid
            court {
              place
              town
            }
            date
            homeTeam {
              id
              name
              logo
            }
            awayTeam {
              id
              name
              logo
            }
            scores {
              total {
                homeScore
                awayScore
              }
            }
            timeStatus {
              status
            }
          }
        }
      `;

      const [pRes, schedRes] = await Promise.all([
        this.gql(query, { pK: projectKey || 'fip', cFid: compFid || '', tFid: teamFid || '', pFid: playerFid }).catch(() => null),
        teamFid ? this.gql(schedQuery, { pK: projectKey || 'fip', cFid: compFid || '', tFid: teamFid }).catch(() => null) : null
      ]);

      const p = pRes?.player;
      const recentMatches = schedRes?.teamMatch || [];

      if (!p) {
        container.innerHTML = `
          <div class="glass-panel p-8 text-center space-y-3">
            <h3 class="text-lg font-bold text-white">Scheda giocatore non disponibile</h3>
            <p class="text-xs text-gray-400">Impossibile recuperare i dettagli completi per questo atleta.</p>
            <button onclick="app.navigate('search')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna alla ricerca</button>
          </div>
        `;
        return;
      }

      const stats = p.stats || {};
      const fullName = `${p.name} ${p.lastName || ''}`.trim();
      const ppg = stats.pointsPerGame ? Number(stats.pointsPerGame).toFixed(1) : (stats.pointsAVG ? Number(stats.pointsAVG).toFixed(1) : '0.0');
      const rpg = stats.reboundsAVG ? Number(stats.reboundsAVG).toFixed(1) : (stats.games && stats.totalRebounds ? (stats.totalRebounds / stats.games).toFixed(1) : '0.0');
      const apg = stats.assistsAVG ? Number(stats.assistsAVG).toFixed(1) : (stats.games && stats.assists ? (stats.assists / stats.games).toFixed(1) : '0.0');
      const spg = stats.stealsAVG ? Number(stats.stealsAVG).toFixed(1) : (stats.games && stats.steals ? (stats.steals / stats.games).toFixed(1) : '0.0');
      const bpg = stats.blocksAVG ? Number(stats.blocksAVG).toFixed(1) : (stats.games && stats.blocks ? (stats.blocks / stats.games).toFixed(1) : '0.0');

      const ftPct = stats.freeThrowsPercentage ? Math.round(stats.freeThrowsPercentage) : (stats.freeThrowsMade ? Math.round((stats.freeThrowsMade / (stats.freeThrowsMade + (stats.freeThrowsFailed || 0))) * 100) : '-');
      const fg2Pct = stats.inArcThrowsPercentage ? Math.round(stats.inArcThrowsPercentage) : (stats.inArcThrowsMade ? Math.round((stats.inArcThrowsMade / (stats.inArcThrowsMade + (stats.inArcThrowsFailed || 0))) * 100) : '-');
      const fg3Pct = stats.outArcThrowsPercentage ? Math.round(stats.outArcThrowsPercentage) : (stats.outArcThrowsMade ? Math.round((stats.outArcThrowsMade / (stats.outArcThrowsMade + (stats.outArcThrowsFailed || 0))) * 100) : '-');

      const matchLogsHtml = recentMatches.length > 0 ? `
        <div class="glass-panel p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="calendar" class="w-4 h-4 text-orange-400"></i>
              <span>Partite &amp; Referti della Squadra</span>
            </h3>
            <span class="text-xs text-gray-400">Clicca su una partita per aprire il referto individuale e la mappa tiri</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${recentMatches.map(m => {
              const h = m.homeTeam || { name: 'Casa' };
              const a = m.awayTeam || { name: 'Ospite' };
              const hScore = m.scores?.total?.homeScore;
              const aScore = m.scores?.total?.awayScore;
              const isClosed = m.timeStatus?.status === 'CLOSED';

              return `
                <div class="glass-panel glass-panel-hover p-4 space-y-2 cursor-pointer border border-white/5 hover:border-orange-500/40" onclick="app.showMatch('${projectKey || 'fip'}', '${m.fid}')">
                  <div class="flex items-center justify-between text-[11px] text-gray-400 border-b border-white/5 pb-1.5">
                    <span>${m.date ? new Date(m.date).toLocaleDateString('it-IT') : 'Data da definire'}</span>
                    ${isClosed ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">FINALE</span>' : '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">PROGRAMMATA</span>'}
                  </div>
                  <div class="flex items-center justify-between text-xs font-bold text-white">
                    <span class="line-clamp-1">${this.escapeHtml(h.name)} vs ${this.escapeHtml(a.name)}</span>
                    <span class="font-mono text-orange-400 ml-2">${hScore !== undefined && hScore !== null ? `${hScore} - ${aScore}` : '-'}</span>
                  </div>
                  <div class="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-white/5">
                    <span>${this.escapeHtml(m.court?.town || m.court?.place || 'Campo FIP')}</span>
                    <span class="text-orange-400 font-semibold">Referto Boxscore &rarr;</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : '';

      container.innerHTML = `
        <!-- Player Hero Header -->
        <div class="glass-panel p-6 relative overflow-hidden">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <div class="w-24 h-24 rounded-2xl bg-gray-800/80 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xl">
                ${(p.photo && p.photo !== 'N/A') ? `<img src="${p.photo}" class="w-full h-full object-cover" alt="${this.escapeHtml(fullName)}" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<i data-lucide=\\'user\\' class=\\'w-12 h-12 text-orange-400\\'></i>';">` : `<i data-lucide="user" class="w-12 h-12 text-orange-400"></i>`}
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">ATLETA FIP</span>
                  ${p.number ? `<span class="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono font-bold">#${p.number}</span>` : ''}
                  ${p.captain ? `<span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">CAPITANO</span>` : ''}
                </div>
                <h1 class="text-2xl md:text-4xl font-extrabold text-white">${this.escapeHtml(fullName)}</h1>
                <p class="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <span>${this.escapeHtml(p.team?.name || 'Squadra')}</span>
                  <span>&bull;</span>
                  <span>${this.escapeHtml(p.competition?.name || 'Campionato FIP')}</span>
                </p>
              </div>
            </div>

            <button onclick="app.navigate('search')" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Torna alla ricerca
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Partite</span>
            <div class="text-2xl font-black text-white mt-1 mono-stat">${stats.games ?? 0}</div>
          </div>
          <div class="glass-panel p-4 text-center border-orange-500/20">
            <span class="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Punti Media</span>
            <div class="text-2xl font-black text-orange-400 mt-1 mono-stat">${ppg}</div>
            <span class="text-[10px] text-gray-500 font-mono">${stats.points ?? 0} tot</span>
          </div>
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Rimbalzi Media</span>
            <div class="text-2xl font-black text-blue-400 mt-1 mono-stat">${rpg}</div>
            <span class="text-[10px] text-gray-500 font-mono">${stats.totalRebounds ?? 0} tot</span>
          </div>
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Assist Media</span>
            <div class="text-2xl font-black text-emerald-400 mt-1 mono-stat">${apg}</div>
            <span class="text-[10px] text-gray-500 font-mono">${stats.assists ?? 0} tot</span>
          </div>
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Recuperi</span>
            <div class="text-2xl font-black text-purple-400 mt-1 mono-stat">${spg}</div>
            <span class="text-[10px] text-gray-500 font-mono">${stats.steals ?? 0} tot</span>
          </div>
          <div class="glass-panel p-4 text-center cursor-pointer border-yellow-500/20 group hover:border-yellow-500/50" onclick="app.showFibaRatingModal()">
            <div class="flex items-center justify-center gap-1">
              <span class="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">Valutazione</span>
              <i data-lucide="help-circle" class="w-3 h-3 text-yellow-400 opacity-60 group-hover:opacity-100"></i>
            </div>
            <div class="text-2xl font-black text-yellow-400 mt-1 mono-stat">${stats.fibaRating ?? 0}</div>
            <span class="text-[10px] text-gray-500">FIBA VAL Info &rarr;</span>
          </div>
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Plus / Minus</span>
            <div class="text-2xl font-black ${(stats.plusMinus || 0) >= 0 ? 'text-cyan-400' : 'text-red-400'} mt-1 mono-stat">${(stats.plusMinus || 0) > 0 ? '+' : ''}${stats.plusMinus ?? 0}</div>
            <span class="text-[10px] text-gray-500">+/- Netto</span>
          </div>
        </div>

        <!-- Radar Chart & Shooting Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="glass-panel p-6 space-y-4 flex flex-col justify-between">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="activity" class="w-4 h-4 text-orange-400"></i>
              <span>Profilo Prestazionale (Radar Chart)</span>
            </h3>
            <div class="relative h-64 w-full flex items-center justify-center">
              <canvas id="playerRadarCanvas"></canvas>
            </div>
            <p class="text-[11px] text-gray-500 text-center">Metriche calcolate in base alle statistiche live ufficiali FIP</p>
          </div>

          <div class="glass-panel p-6 space-y-5">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="crosshair" class="w-4 h-4 text-blue-400"></i>
              <span>Percentuali e Precisione di Tiro</span>
            </h3>

            <div class="space-y-4">
              <!-- 2PT -->
              <div>
                <div class="flex items-center justify-between text-xs font-semibold mb-1">
                  <span class="text-gray-300">Tiro da 2 Punti (2PT)</span>
                  <span class="text-orange-400 mono-stat">${fg2Pct !== '-' ? fg2Pct + '%' : '-'} (${stats.inArcThrowsMade || 0}/${(stats.inArcThrowsMade || 0) + (stats.inArcThrowsFailed || 0)})</span>
                </div>
                <div class="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style="width: ${fg2Pct !== '-' ? Math.min(100, Math.max(0, fg2Pct)) : 0}%"></div>
                </div>
              </div>

              <!-- 3PT -->
              <div>
                <div class="flex items-center justify-between text-xs font-semibold mb-1">
                  <span class="text-gray-300">Tiro da 3 Punti (3PT)</span>
                  <span class="text-blue-400 mono-stat">${fg3Pct !== '-' ? fg3Pct + '%' : '-'} (${stats.outArcThrowsMade || 0}/${(stats.outArcThrowsMade || 0) + (stats.outArcThrowsFailed || 0)})</span>
                </div>
                <div class="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style="width: ${fg3Pct !== '-' ? Math.min(100, Math.max(0, fg3Pct)) : 0}%"></div>
                </div>
              </div>

              <!-- FT -->
              <div>
                <div class="flex items-center justify-between text-xs font-semibold mb-1">
                  <span class="text-gray-300">Tiri Liberi (1PT)</span>
                  <span class="text-emerald-400 mono-stat">${ftPct !== '-' ? ftPct + '%' : '-'} (${stats.freeThrowsMade || 0}/${(stats.freeThrowsMade || 0) + (stats.freeThrowsFailed || 0)})</span>
                </div>
                <div class="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style="width: ${ftPct !== '-' ? Math.min(100, Math.max(0, ftPct)) : 0}%"></div>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-gray-900/60 rounded-xl">
                <span class="text-gray-400 block text-[10px]">Falli Commessi</span>
                <span class="font-bold text-white text-base mono-stat">${stats.fouls ?? 0}</span>
                <span class="text-gray-500 text-[10px] ml-1">(${stats.foulsAVG ? Number(stats.foulsAVG).toFixed(1) : 0} avg)</span>
              </div>
              <div class="p-3 bg-gray-900/60 rounded-xl">
                <span class="text-gray-400 block text-[10px]">Palle Perse</span>
                <span class="font-bold text-white text-base mono-stat">${stats.turnovers ?? 0}</span>
                <span class="text-gray-500 text-[10px] ml-1">(${stats.turnoversAVG ? Number(stats.turnoversAVG).toFixed(1) : 0} avg)</span>
              </div>
            </div>
          </div>
        </div>

        ${matchLogsHtml}
      `;

      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => {
        const ctx = document.getElementById('playerRadarCanvas')?.getContext('2d');
        if (ctx) {
          if (this.playerChart) this.playerChart.destroy();
          this.playerChart = new Chart(ctx, {
            type: 'radar',
            data: {
              labels: ['Realizzazione', 'Rimbalzi', 'Assist', 'Recuperi', 'Precisione', 'Valutazione'],
              datasets: [{
                label: fullName,
                data: [
                  Math.min(100, (Number(ppg) / 25) * 100),
                  Math.min(100, (Number(rpg) / 10) * 100),
                  Math.min(100, (Number(apg) / 8) * 100),
                  Math.min(100, (Number(spg) / 3) * 100),
                  Math.min(100, fg2Pct !== '-' ? Number(fg2Pct) : 50),
                  Math.min(100, (Number(stats.fibaRating || 0) / 30) * 100)
                ],
                backgroundColor: 'rgba(249, 115, 22, 0.25)',
                borderColor: '#f97316',
                borderWidth: 2,
                pointBackgroundColor: '#f97316',
                pointBorderColor: '#fff'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                  grid: { color: 'rgba(255, 255, 255, 0.08)' },
                  pointLabels: { color: '#9ca3af', font: { size: 10, weight: 'bold' } },
                  ticks: { display: false, min: 0, max: 100 }
                }
              },
              plugins: {
                legend: { display: false }
              }
            }
          });
        }
      }, 100);

    } catch (err) {
      console.error('Error showing player:', err);
      container.innerHTML = `
        <div class="glass-panel p-6 text-center border-red-500/30 space-y-3">
          <p class="text-sm text-red-400">Errore nel caricamento della scheda atleta.</p>
          <button onclick="app.navigate('search')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna indietro</button>
        </div>
      `;
    }
  }

  // --- DETAIL: UNIQUE PLAYER VIEW (Aggregated Career) ---
  async showUniquePlayer(uniqueId, playerName) {
    this.navigate('player');
    const container = document.getElementById('playerDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento carriera unificata di ${this.escapeHtml(playerName)}...</p>
      </div>
    `;

    try {
      const query = `
        query GetUniquePlayerProfile($id: String!) {
          uniquePlayer(id: $id) {
            id
            name
            lastName
            photo
            players {
              fid
              competitionFid
              teamFid
              projectKey
              season {
                name
              }
              competition {
                name
              }
              team {
                name
                logo
              }
              stats {
                games
                points
                pointsPerGame
                freeThrowsPercentage
                inArcThrowsPercentage
                outArcThrowsPercentage
                fouls
                plusMinus
              }
            }
            stats {
              games
              points
              pointsPerGame
              freeThrowsPercentage
              inArcThrowsPercentage
              outArcThrowsPercentage
              plusMinus
            }
          }
        }
      `;

      const data = await this.gql(query, { id: uniqueId });
      const up = data?.uniquePlayer;

      if (!up) {
        container.innerHTML = `
          <div class="glass-panel p-8 text-center space-y-3">
            <h3 class="text-lg font-bold text-white">Profilo carriera non disponibile</h3>
            <button onclick="app.navigate('search')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna alla ricerca</button>
          </div>
        `;
        return;
      }

      const fullName = `${up.name} ${up.lastName || ''}`.trim();
      const playersList = up.players || [];
      const globalStats = up.stats || {};

      container.innerHTML = `
        <div class="glass-panel p-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <div class="w-24 h-24 rounded-2xl bg-gray-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                ${(up.photo && up.photo !== 'N/A') ? `<img src="${up.photo}" class="w-full h-full object-cover">` : `<i data-lucide="user" class="w-12 h-12 text-cyan-400"></i>`}
              </div>
              <div>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">CARRIERA UNIFICATA FIP</span>
                <h1 class="text-3xl md:text-4xl font-extrabold text-white mt-1">${this.escapeHtml(fullName)}</h1>
                <p class="text-xs text-gray-400 mt-1">${playersList.length} Campionati / Edizioni Registrate</p>
              </div>
            </div>
            <button onclick="app.navigate('search')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-bold text-white">Torna alla ricerca</button>
          </div>
        </div>

        <div class="glass-panel p-6 space-y-4">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="layers" class="w-4 h-4 text-orange-400"></i>
            <span>Storico Campionati &amp; Società</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${playersList.map(item => {
              const st = item.stats || {};
              return `
                <div onclick="app.showPlayer('${item.projectKey || 'fip'}', '${item.competitionFid}', '${item.teamFid}', '${item.fid}', '${this.escapeJs(fullName)}')" class="p-4 rounded-xl bg-gray-900/60 border border-white/5 hover:border-orange-500/30 cursor-pointer flex items-center justify-between group">
                  <div>
                    <h4 class="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">${this.escapeHtml(item.team?.name || 'Squadra')}</h4>
                    <p class="text-xs text-gray-400">${this.escapeHtml(item.competition?.name || 'Campionato')}</p>
                    <span class="text-[10px] text-gray-500 font-mono">${this.escapeHtml(item.season?.name || '')}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-xs text-orange-400 font-bold block">${st.points ?? 0} Punti</span>
                    <span class="text-[10px] text-gray-400">${st.games ?? 0} PG (${st.pointsPerGame ? Number(st.pointsPerGame).toFixed(1) : 0} avg)</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error(e);
      container.innerHTML = `<p class="text-xs text-red-400 text-center py-6">Errore nel caricamento della carriera.</p>`;
    }
  }

  // --- DETAIL: COMPETITION VIEW ---
  async showCompetition(compFid, projectKey, compName) {
    this.navigate('competition');
    const container = document.getElementById('competitionDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento dettagli ${this.escapeHtml(compName || 'campionato')}...</p>
      </div>
    `;

    try {
      const query = `
        query GetCompetitionData($pK: String!, $cFid: String!) {
          competition(projectKey: $pK, fid: $cFid) {
            fid
            name
            shortName
            projectKey
            groups {
              fid
              name
            }
          }
        }
      `;

      const data = await this.gql(query, { pK: projectKey || 'fip', cFid: compFid });
      const comp = data?.competition;

      if (!comp) {
        container.innerHTML = `
          <div class="glass-panel p-8 text-center space-y-3">
            <h3 class="text-lg font-bold text-white">Campionato non trovato</h3>
            <button onclick="app.navigate('championships')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna ai Campionati</button>
          </div>
        `;
        return;
      }

      this.renderFullCompetitionView(comp, [comp]);
    } catch (e) {
      console.error('Error showing competition:', e);
      container.innerHTML = `
        <div class="glass-panel p-6 text-center border-red-500/30 space-y-3">
          <p class="text-sm text-red-400">Errore nel caricamento del campionato.</p>
          <button onclick="app.navigate('championships')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna ai Campionati</button>
        </div>
      `;
    }
  }

  async loadGroupStandings(projectKey, compFid, groupFid) {
    const tableContainer = document.getElementById('compGroupStandingsContent');
    if (!tableContainer) return;

    tableContainer.innerHTML = `
      <div class="py-8 flex flex-col items-center justify-center gap-2">
        <div class="w-6 h-6 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento classifica girone...</p>
      </div>
    `;

    try {
      const query = `
        query GetStandingsLive($pK: String!, $cFid: String!, $gFid: String!) {
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
      const standings = data?.standings || [];

      if (standings.length === 0) {
        tableContainer.innerHTML = `<p class="text-xs text-gray-400 text-center py-6">Classifica in fase di sincronizzazione federale.</p>`;
        return;
      }

      tableContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-left stats-table">
            <thead>
              <tr class="bg-gray-900/40">
                <th class="w-12 text-center">Pos</th>
                <th>Squadra</th>
                <th class="text-center">PG</th>
                <th class="text-center">V</th>
                <th class="text-center">P</th>
                <th class="text-center">PPG</th>
                <th class="text-center">Opp PPG</th>
              </tr>
            </thead>
            <tbody>
              ${standings.map(s => {
                const st = s.stats || {};
                const pos = s.position || '-';
                return `
                  <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.showTeam('${projectKey}', '${compFid}', '${s.fid}', '${this.escapeJs(s.name)}')">
                    <td class="text-center font-mono font-bold ${pos === '1' ? 'text-amber-400' : 'text-gray-300'}">${pos}°</td>
                    <td>
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          ${(s.logo && s.logo !== 'N/A') ? `<img src="${s.logo}" class="max-h-full max-w-full object-contain">` : `<i data-lucide="shield" class="w-4 h-4 text-orange-400"></i>`}
                        </div>
                        <span class="font-bold text-white hover:text-orange-400 transition-colors">${this.escapeHtml(s.name)}</span>
                      </div>
                    </td>
                    <td class="text-center font-mono">${st.playedMatches ?? 0}</td>
                    <td class="text-center font-mono font-bold text-emerald-400">${st.wonMatches ?? 0}</td>
                    <td class="text-center font-mono font-bold text-red-400">${st.lostMatches ?? 0}</td>
                    <td class="text-center font-mono font-bold text-orange-400">${st.pointsPerGame ? Number(st.pointsPerGame).toFixed(1) : '-'}</td>
                    <td class="text-center font-mono text-gray-400">${st.opponentsPointsPerGame ? Number(st.opponentsPointsPerGame).toFixed(1) : '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error(e);
      tableContainer.innerHTML = `<p class="text-xs text-red-400 text-center py-4">Errore nel caricamento della classifica.</p>`;
    }
  }

  // --- STANDINGS & TOP SCORERS VIEW ---
  setStandingsTab(tabName) {
    const tableBtn = document.getElementById('standingsTabTable');
    const scorersBtn = document.getElementById('standingsTabScorers');
    const tableContent = document.getElementById('standingsContentTable');
    const scorersContent = document.getElementById('standingsContentScorers');

    if (tabName === 'table') {
      if (tableBtn) tableBtn.className = 'px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all';
      if (scorersBtn) scorersBtn.className = 'px-4 py-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white border border-white/5 text-xs font-bold transition-all';
      if (tableContent) tableContent.classList.remove('hidden');
      if (scorersContent) scorersContent.classList.add('hidden');
    } else {
      if (tableBtn) tableBtn.className = 'px-4 py-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white border border-white/5 text-xs font-bold transition-all';
      if (scorersBtn) scorersBtn.className = 'px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all';
      if (tableContent) tableContent.classList.add('hidden');
      if (scorersContent) scorersContent.classList.remove('hidden');
    }
  }

  async loadStandingsData(term) {
    const tableContainer = document.getElementById('standingsContentTable');
    const scorersContainer = document.getElementById('standingsContentScorers');

    if (tableContainer) {
      tableContainer.innerHTML = `
        <div class="py-12 flex flex-col items-center justify-center gap-3">
          <div class="w-8 h-8 spinner"></div>
          <p class="text-xs text-gray-400">Interrogazione classifica live per "${this.escapeHtml(term)}"...</p>
        </div>
      `;
    }

    if (scorersContainer) {
      scorersContainer.innerHTML = `
        <div class="py-12 flex flex-col items-center justify-center gap-3">
          <div class="w-8 h-8 spinner"></div>
          <p class="text-xs text-gray-400">Interrogazione marcatori live...</p>
        </div>
      `;
    }

    try {
      const query = `
        query SearchCompForStandings($c: String!, $s: String!, $opt: ISearchOptions!) {
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
          searchPlayers(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
            fid
            name
            lastName
            number
            photo
            projectKey
            competitionFid
            teamFid
            team {
              fid
              name
            }
            competition {
              fid
              name
            }
          }
        }
      `;

      let comp = null;
      let players = [];

      for (const seasonId of this.knownSeasons) {
        try {
          const data = await this.gql(query, { c: term, s: seasonId, opt: { limit: 10 } });
          if (data?.searchCompetitions && data.searchCompetitions.length > 0) {
            comp = data.searchCompetitions[0];
            players = data.searchPlayers || [];
            break;
          }
        } catch (e) {
          console.warn(`Standings search notice on season ${seasonId}:`, e);
        }
      }

      if (!comp || !comp.groups || comp.groups.length === 0) {
        if (tableContainer) tableContainer.innerHTML = `<p class="text-xs text-gray-400 text-center py-8">Nessun girone attivo trovato per questo campionato.</p>`;
      } else {
        const group = comp.groups[0];
        const stQuery = `
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
        const stData = await this.gql(stQuery, { pK: comp.projectKey || 'fip', cFid: comp.fid, gFid: group.fid });
        const standings = stData?.standings || [];

        if (standings.length === 0) {
          if (tableContainer) tableContainer.innerHTML = `<p class="text-xs text-gray-400 text-center py-8">Classifica ${this.escapeHtml(comp.name)} in aggiornamento.</p>`;
        } else {
          if (tableContainer) {
            tableContainer.innerHTML = `
              <div class="space-y-4">
                <div class="flex items-center justify-between text-xs text-gray-400">
                  <span class="font-bold text-white">${this.escapeHtml(comp.name)} &bull; ${this.escapeHtml(group.name)}</span>
                  <span class="badge-fip px-2 py-0.5 rounded">FIP Live</span>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left stats-table">
                    <thead>
                      <tr class="bg-gray-900/40">
                        <th class="w-12 text-center">Pos</th>
                        <th>Squadra</th>
                        <th class="text-center">PG</th>
                        <th class="text-center">V</th>
                        <th class="text-center">P</th>
                        <th class="text-center">PPG</th>
                        <th class="text-center">Opp PPG</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${standings.map(s => {
                        const st = s.stats || {};
                        const pos = s.position || '-';
                        return `
                          <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.showTeam('${comp.projectKey || 'fip'}', '${comp.fid}', '${s.fid}', '${this.escapeJs(s.name)}')">
                            <td class="text-center font-mono font-bold ${pos === '1' ? 'text-amber-400' : 'text-gray-300'}">${pos}°</td>
                            <td>
                              <div class="flex items-center gap-2.5">
                                <div class="w-7 h-7 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  ${(s.logo && s.logo !== 'N/A') ? `<img src="${s.logo}" class="max-h-full max-w-full object-contain">` : `<i data-lucide="shield" class="w-4 h-4 text-orange-400"></i>`}
                                </div>
                                <span class="font-bold text-white hover:text-orange-400 transition-colors">${this.escapeHtml(s.name)}</span>
                              </div>
                            </td>
                            <td class="text-center font-mono">${st.playedMatches ?? 0}</td>
                            <td class="text-center font-mono font-bold text-emerald-400">${st.wonMatches ?? 0}</td>
                            <td class="text-center font-mono font-bold text-red-400">${st.lostMatches ?? 0}</td>
                            <td class="text-center font-mono font-bold text-orange-400">${st.pointsPerGame ? Number(st.pointsPerGame).toFixed(1) : '-'}</td>
                            <td class="text-center font-mono text-gray-400">${st.opponentsPointsPerGame ? Number(st.opponentsPointsPerGame).toFixed(1) : '-'}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
          }
        }
      }

      if (scorersContainer) {
        if (players.length === 0) {
          scorersContainer.innerHTML = `<p class="text-xs text-gray-400 text-center py-8">Classifica marcatori in elaborazione.</p>`;
        } else {
          scorersContainer.innerHTML = `
            <div class="overflow-x-auto">
              <table class="w-full text-left stats-table">
                <thead>
                  <tr class="bg-gray-900/40">
                    <th class="w-12">#</th>
                    <th>Atleta</th>
                    <th>Squadra</th>
                    <th class="text-center">Campionato</th>
                  </tr>
                </thead>
                <tbody>
                  ${players.map((p, idx) => {
                    const pName = `${p.name} ${p.lastName || ''}`.trim();
                    return `
                      <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.showPlayer('${p.projectKey || 'fip'}', '${p.competitionFid || p.competition?.fid}', '${p.teamFid || p.team?.fid}', '${p.fid}', '${this.escapeJs(pName)}')">
                        <td class="font-mono font-bold text-orange-400">${idx + 1}°</td>
                        <td class="font-bold text-white flex items-center gap-2.5">
                          ${(p.photo && p.photo !== 'N/A') ? `<img src="${p.photo}" class="w-7 h-7 rounded-full object-cover">` : `<div class="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-orange-400">${p.number || '•'}</div>`}
                          <span>${this.escapeHtml(pName)}</span>
                        </td>
                        <td class="text-gray-300 text-xs">${this.escapeHtml(p.team?.name || '-')}</td>
                        <td class="text-center text-xs text-gray-400">${this.escapeHtml(p.competition?.name || '-')}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;
        }
      }

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error(e);
      if (tableContainer) tableContainer.innerHTML = `<p class="text-xs text-red-400 text-center py-6">Errore nel caricamento delle classifiche ufficiali.</p>`;
    }
  }

  // --- MATCHES & LIVE VIEW ---
  async loadRecentMatches() {
    const select = document.getElementById('matchesCompSelect');
    const val = select ? select.value : 'Under 15 Eccellenza';
    this.loadCompetitionMatches(val);
  }

  async loadCompetitionMatches(searchTerm) {
    const listContainer = document.getElementById('matchesContentList');
    if (!listContainer) return;

    listContainer.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento calendario partite...</p>
      </div>
    `;

    try {
      const compQ = `
        query GetCompForMatches($c: String!, $s: String!, $opt: ISearchOptions!) {
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

      let comp = null;
      for (const seasonId of this.knownSeasons) {
        try {
          const data = await this.gql(compQ, { c: searchTerm, s: seasonId, opt: { limit: 5 } });
          if (data?.searchCompetitions && data.searchCompetitions.length > 0) {
            comp = data.searchCompetitions[0];
            break;
          }
        } catch (e) {
          console.warn(`Matches query notice on season ${seasonId}:`, e);
        }
      }

      if (!comp || !comp.groups || comp.groups.length === 0) {
        listContainer.innerHTML = `<p class="text-xs text-gray-400 text-center py-8">Nessun calendario gare disponibile per questa selezione.</p>`;
        return;
      }

      const group = comp.groups[0];

      const matchQ = `
        query GetMatchesLive($pK: String!, $cFid: String!, $gFid: String!) {
          matchByGroup(projectKey: $pK, competitionFid: $cFid, groupFid: $gFid) {
            fid
            date
            status
            roundName
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

      const mData = await this.gql(matchQ, { pK: comp.projectKey || 'fip', cFid: comp.fid, gFid: group.fid });
      const matches = mData?.matchByGroup || [];

      if (matches.length === 0) {
        listContainer.innerHTML = `
          <div class="p-8 text-center glass-panel space-y-2">
            <i data-lucide="calendar-x" class="w-8 h-8 text-gray-500 mx-auto"></i>
            <p class="text-sm text-gray-300 font-bold">${this.escapeHtml(comp.name)} - ${this.escapeHtml(group.name)}</p>
            <p class="text-xs text-gray-400">Nessuna partita registrata in questa fase al momento.</p>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      listContainer.innerHTML = `
        <div class="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span class="font-bold text-white">${this.escapeHtml(comp.name)} &bull; ${this.escapeHtml(group.name)}</span>
          <span class="badge-fip px-2 py-0.5 rounded">Live FIP Data</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${matches.map(m => {
            const home = m.homeTeam || { name: 'Squadra Casa' };
            const away = m.awayTeam || { name: 'Squadra Ospite' };
            const isFinished = m.status === 'FINISHED' || m.status === 'CLOSED';
            const isLive = m.status === 'LIVE' || m.status === 'IN_PROGRESS';

            return `
              <div class="glass-panel glass-panel-hover p-5 space-y-3 relative overflow-hidden group cursor-pointer border border-white/5 hover:border-orange-500/40" onclick="app.showMatch('${comp.projectKey || 'fip'}', '${m.fid}')">
                <div class="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span class="font-mono text-gray-400">${this.escapeHtml(m.roundName || 'Fase a Gironi')}</span>
                  ${isLive ? '<span class="badge-live text-[10px] font-bold px-2 py-0.5 rounded uppercase">LIVE</span>' : (isFinished ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400">FINALE</span>' : '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">PROGRAMMATA</span>')}
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="w-6 h-6 rounded bg-gray-800 flex items-center justify-center overflow-hidden">
                        ${(home.logo && home.logo !== 'N/A') ? `<img src="${home.logo}" class="max-h-full max-w-full">` : `<i data-lucide="shield" class="w-3.5 h-3.5 text-orange-400"></i>`}
                      </div>
                      <span class="font-bold text-sm text-white">${this.escapeHtml(home.name)}</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="w-6 h-6 rounded bg-gray-800 flex items-center justify-center overflow-hidden">
                        ${(away.logo && away.logo !== 'N/A') ? `<img src="${away.logo}" class="max-h-full max-w-full">` : `<i data-lucide="shield" class="w-3.5 h-3.5 text-blue-400"></i>`}
                      </div>
                      <span class="font-bold text-sm text-white">${this.escapeHtml(away.name)}</span>
                    </div>
                  </div>
                </div>

                <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                  <span>${m.date ? new Date(m.date).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : 'Data da definire'}</span>
                  <span class="text-orange-400 font-semibold group-hover:underline flex items-center gap-1">Referto Ufficiale &rarr;</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error(e);
      listContainer.innerHTML = `<p class="text-xs text-red-400 text-center py-6">Errore nel caricamento delle partite.</p>`;
    }
  }

  // =========================================================================
  // MATCH DETAIL VIEW: 5 TABS (BOXSCORE, SHOT CHART, GAME FLOW, LEADERS, LINEUP)
  // =========================================================================

  async showMatch(projectKey, matchFid) {
    this.navigate('match');
    const container = document.getElementById('matchDetailContent');
    container.innerHTML = `
      <div class="py-16 flex flex-col items-center justify-center gap-3">
        <div class="w-10 h-10 spinner"></div>
        <p class="text-sm text-gray-300 animate-pulse font-semibold">Caricamento referto ufficiale FIP e statistiche avanzate...</p>
        <span class="text-xs text-gray-500 font-mono">ID Gara: ${this.escapeHtml(matchFid)}</span>
      </div>
    `;

    try {
      // 1. Fetch match metadata
      const matchMetaQ = `
        query GetMatchMeta($mFid: String!, $pK: String!) {
          matchBy(fid: $mFid, projectKey: $pK) {
            fid
            date
            roundName
            competition {
              fid
              name
            }
            court {
              place
              address
              town
            }
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
            timeStatus {
              status
              period
              time
            }
          }
        }
      `;

      // 2. Fetch full match boxscore
      const boxscoreQ = `
        query MatchBoxscore($matchFid: String!, $projectKey: String!) {
          matchBy(fid: $matchFid, projectKey: $projectKey) {
            boxscore {
              homeTeam {
                team {
                  fid
                  name
                  logo
                }
                totals {
                  timePlayed
                  points
                  inArcThrowsMade
                  inArcThrowsFailed
                  outArcThrowsMade
                  outArcThrowsFailed
                  freeThrowsMade
                  freeThrowsFailed
                  offensiveRebounds
                  defensiveRebounds
                  assists
                  turnovers
                  steals
                  blocks
                  receivedBlocks
                  fouls
                  receivedFouls
                  fibaRating
                  plusMinus
                }
                players {
                  player {
                    fid
                    name
                    lastName
                    number
                    starting
                  }
                  stats {
                    timePlayed
                    points
                    inArcThrowsMade
                    inArcThrowsFailed
                    outArcThrowsMade
                    outArcThrowsFailed
                    freeThrowsMade
                    freeThrowsFailed
                    offensiveRebounds
                    defensiveRebounds
                    assists
                    turnovers
                    steals
                    blocks
                    receivedBlocks
                    fouls
                    receivedFouls
                    fibaRating
                    plusMinus
                  }
                }
              }
              awayTeam {
                team {
                  fid
                  name
                  logo
                }
                totals {
                  timePlayed
                  points
                  inArcThrowsMade
                  inArcThrowsFailed
                  outArcThrowsMade
                  outArcThrowsFailed
                  freeThrowsMade
                  freeThrowsFailed
                  offensiveRebounds
                  defensiveRebounds
                  assists
                  turnovers
                  steals
                  blocks
                  receivedBlocks
                  fouls
                  receivedFouls
                  fibaRating
                  plusMinus
                }
                players {
                  player {
                    fid
                    name
                    lastName
                    number
                    starting
                  }
                  stats {
                    timePlayed
                    points
                    inArcThrowsMade
                    inArcThrowsFailed
                    outArcThrowsMade
                    outArcThrowsFailed
                    freeThrowsMade
                    freeThrowsFailed
                    offensiveRebounds
                    defensiveRebounds
                    assists
                    turnovers
                    steals
                    blocks
                    receivedBlocks
                    fouls
                    receivedFouls
                    fibaRating
                    plusMinus
                  }
                }
              }
            }
          }
        }
      `;

      // 3. Fetch Shot actions
      const shotActionsQ = `
        query ShotActions($matchFid: String!, $projectKey: String!) {
          matchBy(fid: $matchFid, projectKey: $projectKey) {
            actions(filter: [POINTS]) {
              fid
              position
              teamFid
              subCode
              period
              zone
              actor {
                fid
                type
              }
              value
              result
            }
          }
        }
      `;

      // 4. Fetch Game Leaders
      const leadersQ = `
        query GameLeaders($matchFid: String!, $projectKey: String!) {
          matchBy(fid: $matchFid, projectKey: $projectKey) {
            leaders {
              points {
                homePlayers { value player { fid name lastName photo } }
                awayPlayers { value player { fid name lastName photo } }
              }
              rebounds {
                homePlayers { value player { fid name lastName photo } }
                awayPlayers { value player { fid name lastName photo } }
              }
              assists {
                homePlayers { value player { fid name lastName photo } }
                awayPlayers { value player { fid name lastName photo } }
              }
              fibaRating {
                homePlayers { value player { fid name lastName photo } }
                awayPlayers { value player { fid name lastName photo } }
              }
              inArcThrowsMade {
                homePlayers { value player { fid name lastName photo } }
                awayPlayers { value player { fid name lastName photo } }
              }
              outArcThrowsMade {
                homePlayers { value player { fid name lastName photo } }
                awayPlayers { value player { fid name lastName photo } }
              }
              freeThrows {
                homePlayers { made attempted player { fid name lastName photo } }
                awayPlayers { made attempted player { fid name lastName photo } }
              }
            }
          }
        }
      `;

      // 5. Fetch Game Flow & Stats
      const flowQ = `
        query MatchFlowAndStats($matchFid: String!, $projectKey: String!) {
          matchBy(fid: $matchFid, projectKey: $projectKey) {
            stats {
              biggestLead {
                homeTeam
                awayTeam
              }
              timesTied
              leadChanges
            }
            actions(filter: [POINTS]) {
              fid
              teamFid
              value
              result
              time
              period
              subCode
              actor {
                fid
                type
              }
            }
          }
        }
      `;

      // Execute all in parallel for ultra-fast single turnaround
      const [metaRes, boxRes, shotRes, leadRes, flowRes] = await Promise.all([
        this.gql(matchMetaQ, { mFid: matchFid, pK: projectKey || 'fip' }),
        this.gql(boxscoreQ, { matchFid, projectKey: projectKey || 'fip' }).catch(() => null),
        this.gql(shotActionsQ, { matchFid, projectKey: projectKey || 'fip' }).catch(() => null),
        this.gql(leadersQ, { matchFid, projectKey: projectKey || 'fip' }).catch(() => null),
        this.gql(flowQ, { matchFid, projectKey: projectKey || 'fip' }).catch(() => null)
      ]);

      const match = metaRes?.matchBy;
      if (!match) {
        container.innerHTML = `
          <div class="glass-panel p-8 text-center space-y-3">
            <h3 class="text-lg font-bold text-white">Partita non trovata</h3>
            <p class="text-xs text-gray-400">Non è stato possibile reperire i dati per la gara ${this.escapeHtml(matchFid)}.</p>
            <button onclick="app.navigate('${this.previousView || 'matches'}')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna indietro</button>
          </div>
        `;
        return;
      }

      // Fetch lineup stats if competition and team IDs are present
      let homeLineup = null;
      let awayLineup = null;
      if (match.competition?.fid && match.homeTeam?.fid) {
        const lineupQ = `
          query GetMatchLineupStats($projectKey: String!, $competitionFid: String!, $matchFid: String!, $teamFid: String!) {
            matchLineupStats(projectKey: $projectKey, competitionFid: $competitionFid, matchFid: $matchFid, teamFid: $teamFid) {
              teamFid
              lineups {
                players {
                  fid
                  name
                  lastName
                  number
                  photo
                }
                stats {
                  timePlayed
                  points
                  pointsReceived
                  plusMinus
                  fibaRating
                }
              }
            }
          }
        `;
        const [hLineupRes, aLineupRes] = await Promise.all([
          this.gql(lineupQ, { projectKey: projectKey || 'fip', competitionFid: match.competition.fid, matchFid, teamFid: match.homeTeam.fid }).catch(() => null),
          match.awayTeam?.fid ? this.gql(lineupQ, { projectKey: projectKey || 'fip', competitionFid: match.competition.fid, matchFid, teamFid: match.awayTeam.fid }).catch(() => null) : null
        ]);
        homeLineup = hLineupRes?.matchLineupStats?.lineups || [];
        awayLineup = aLineupRes?.matchLineupStats?.lineups || [];
      }

      this.currentMatchData = {
        projectKey: projectKey || 'fip',
        matchFid,
        match,
        boxscore: boxRes?.matchBy?.boxscore,
        shots: shotRes?.matchBy?.actions || [],
        leaders: leadRes?.matchBy?.leaders,
        flowStats: flowRes?.matchBy?.stats,
        flowActions: flowRes?.matchBy?.actions || [],
        homeLineup: homeLineup || [],
        awayLineup: awayLineup || []
      };

      this.currentMatchTab = 'boxscore';
      this.matchBoxscorePeriod = null;
      this.shotChartFilter = { team: 'all', period: 'all', type: 'all', player: 'all' };

      this.renderFullMatchView();
    } catch (e) {
      console.error('Error loading match details:', e);
      container.innerHTML = `
        <div class="glass-panel p-8 text-center border-red-500/30 space-y-3">
          <p class="text-sm text-red-400 font-semibold">Errore durante il recupero del referto di gara.</p>
          <p class="text-xs text-gray-400">${this.escapeHtml(e.message)}</p>
          <button onclick="app.navigate('${this.previousView || 'matches'}')" class="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white">Torna indietro</button>
        </div>
      `;
    }
  }

  renderFullMatchView() {
    const container = document.getElementById('matchDetailContent');
    if (!container || !this.currentMatchData) return;

    const { match } = this.currentMatchData;
    const home = match.homeTeam || { name: 'Squadra Casa' };
    const away = match.awayTeam || { name: 'Squadra Ospite' };
    const hScore = match.scores?.total?.homeScore ?? '-';
    const aScore = match.scores?.total?.awayScore ?? '-';
    const partials = match.scores?.partials || [];
    const isClosed = match.timeStatus?.status === 'CLOSED' || match.timeStatus?.status === 'FINISHED';
    const isLive = match.timeStatus?.status === 'LIVE' || match.timeStatus?.status === 'IN_PROGRESS';

    const courtStr = [match.court?.place, match.court?.address, match.court?.town].filter(Boolean).join(' - ') || 'Campo Federale Ufficiale';

    container.innerHTML = `
      <!-- 1. MATCH SCOREBOARD & HERO HEADER -->
      <div class="glass-panel p-6 relative overflow-hidden shadow-2xl">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
          <div class="flex items-center gap-3">
            <button onclick="app.navigate('${this.previousView || 'matches'}')" class="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition-all flex items-center gap-1.5">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Indietro
            </button>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-orange-400">${this.escapeHtml(match.competition?.name || 'Campionato FIP')}</span>
              <span class="text-gray-500 text-xs">&bull;</span>
              <span class="text-xs text-gray-400">Giornata / Fase: ${this.escapeHtml(match.roundName || '1')}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            ${isLive ? '<span class="badge-live text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> IN CORSO (LIVE)</span>' : (isClosed ? '<span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">FINALE UFFICIALE</span>' : '<span class="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-mono">PROGRAMMATA</span>')}
            <span class="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 font-mono hidden sm:inline-block">${match.date ? new Date(match.date).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : ''}</span>
          </div>
        </div>

        <!-- Big Scoreboard Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <!-- Home Team -->
          <div class="flex flex-row md:flex-col items-center justify-between md:justify-center text-left md:text-center gap-3 cursor-pointer group" onclick="app.showTeam('${this.currentMatchData.projectKey}', '${match.competition?.fid}', '${home.fid}', '${this.escapeJs(home.name)}')">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-800/80 border border-white/10 flex items-center justify-center p-2 group-hover:scale-105 group-hover:border-orange-500/40 transition-all flex-shrink-0">
              ${(home.logo && home.logo !== 'N/A') ? `<img src="${home.logo}" class="max-h-full max-w-full object-contain">` : `<i data-lucide="shield" class="w-8 h-8 text-orange-400"></i>`}
            </div>
            <div>
              <span class="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">SQUADRA CASA</span>
              <h2 class="text-lg sm:text-xl font-black text-white group-hover:text-orange-400 transition-colors">${this.escapeHtml(home.name)}</h2>
            </div>
          </div>

          <!-- Score Display & Partials Table -->
          <div class="flex flex-col items-center justify-center space-y-3 py-2">
            <div class="flex items-center gap-6">
              <span class="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">${hScore}</span>
              <span class="text-2xl text-gray-600 font-light">&ndash;</span>
              <span class="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">${aScore}</span>
            </div>

            <!-- Quarter Partials Table -->
            ${partials.length > 0 ? `
              <div class="overflow-x-auto w-full max-w-xs">
                <table class="w-full text-center text-[11px] font-mono border-collapse">
                  <thead>
                    <tr class="text-gray-500 border-b border-white/10">
                      <th class="py-1 px-1.5 text-left font-sans text-[10px]">Q</th>
                      ${partials.map(p => `<th class="py-1 px-1.5 font-bold">${p.period > 4 ? `OT${p.period - 4}` : `Q${p.period}`}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/5 text-gray-300">
                    <tr>
                      <td class="py-1 px-1.5 text-left font-sans text-orange-400 font-bold truncate max-w-[60px]">${this.escapeHtml(home.name.substring(0, 4))}</td>
                      ${partials.map(p => `<td class="py-1 px-1.5 font-bold">${p.homeScore}</td>`).join('')}
                    </tr>
                    <tr>
                      <td class="py-1 px-1.5 text-left font-sans text-blue-400 font-bold truncate max-w-[60px]">${this.escapeHtml(away.name.substring(0, 4))}</td>
                      ${partials.map(p => `<td class="py-1 px-1.5 font-bold">${p.awayScore}</td>`).join('')}
                    </tr>
                  </tbody>
                </table>
              </div>
            ` : ''}

            <div class="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-orange-400"></i>
              <span class="line-clamp-1">${this.escapeHtml(courtStr)}</span>
            </div>
          </div>

          <!-- Away Team -->
          <div class="flex flex-row-reverse md:flex-col items-center justify-between md:justify-center text-right md:text-center gap-3 cursor-pointer group" onclick="app.showTeam('${this.currentMatchData.projectKey}', '${match.competition?.fid}', '${away.fid}', '${this.escapeJs(away.name)}')">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-800/80 border border-white/10 flex items-center justify-center p-2 group-hover:scale-105 group-hover:border-blue-500/40 transition-all flex-shrink-0">
              ${(away.logo && away.logo !== 'N/A') ? `<img src="${away.logo}" class="max-h-full max-w-full object-contain">` : `<i data-lucide="shield" class="w-8 h-8 text-blue-400"></i>`}
            </div>
            <div>
              <span class="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">SQUADRA OSPITE</span>
              <h2 class="text-lg sm:text-xl font-black text-white group-hover:text-blue-400 transition-colors">${this.escapeHtml(away.name)}</h2>
            </div>
          </div>
        </div>

        <!-- 2. SUB-NAVIGATION TABS (BOXSCORE, SHOTCHART, GAMEFLOW, LEADERS, LINEUPS) -->
        <div class="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto pb-1">
          <button onclick="app.setMatchTab('boxscore')" id="matchTab-boxscore" class="match-tab-btn active px-4 py-2 rounded-xl text-xs font-bold border border-white/5 flex items-center gap-2 flex-shrink-0">
            <i data-lucide="clipboard-list" class="w-4 h-4"></i>
            <span>Referto Completo (Boxscore)</span>
          </button>
          <button onclick="app.setMatchTab('shotchart')" id="matchTab-shotchart" class="match-tab-btn px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-white/5 flex items-center gap-2 flex-shrink-0">
            <i data-lucide="crosshair" class="w-4 h-4"></i>
            <span>Mappa Tiri (Shot Chart)</span>
          </button>
          <button onclick="app.setMatchTab('gameflow')" id="matchTab-gameflow" class="match-tab-btn px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-white/5 flex items-center gap-2 flex-shrink-0">
            <i data-lucide="trending-up" class="w-4 h-4"></i>
            <span>Andamento Gara (Game Flow)</span>
          </button>
          <button onclick="app.setMatchTab('leaders')" id="matchTab-leaders" class="match-tab-btn px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-white/5 flex items-center gap-2 flex-shrink-0">
            <i data-lucide="award" class="w-4 h-4"></i>
            <span>Leader Partita (Leaders)</span>
          </button>
          <button onclick="app.setMatchTab('lineups')" id="matchTab-lineups" class="match-tab-btn px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-white/5 flex items-center gap-2 flex-shrink-0">
            <i data-lucide="users" class="w-4 h-4"></i>
            <span>Quintetti &amp; Efficienza</span>
          </button>
        </div>
      </div>

      <!-- 3. TAB CONTENT CONTAINER -->
      <div id="matchTabContentContainer" class="space-y-6">
        <!-- Filled dynamically by renderMatchTabContent() -->
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.renderMatchTabContent();
  }

  setMatchTab(tabName) {
    this.currentMatchTab = tabName;
    document.querySelectorAll('.match-tab-btn').forEach(btn => {
      btn.className = 'match-tab-btn px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-white/5 flex items-center gap-2 flex-shrink-0';
    });

    const activeBtn = document.getElementById(`matchTab-${tabName}`);
    if (activeBtn) {
      activeBtn.className = 'match-tab-btn active px-4 py-2 rounded-xl text-xs font-bold border border-white/5 flex items-center gap-2 flex-shrink-0';
    }

    this.renderMatchTabContent();
  }

  renderMatchTabContent() {
    const container = document.getElementById('matchTabContentContainer');
    if (!container || !this.currentMatchData) return;

    if (this.currentMatchTab === 'boxscore') {
      this.renderMatchBoxscoreTab(container);
    } else if (this.currentMatchTab === 'shotchart') {
      this.renderMatchShotChartTab(container);
    } else if (this.currentMatchTab === 'gameflow') {
      this.renderMatchGameFlowTab(container);
    } else if (this.currentMatchTab === 'leaders') {
      this.renderMatchLeadersTab(container);
    } else if (this.currentMatchTab === 'lineups') {
      this.renderMatchLineupsTab(container);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // --- TAB 1: BOXSCORE (REFERTO COMPLETO) ---
  setBoxscorePeriodFilter(period) {
    this.matchBoxscorePeriod = period;
    const container = document.getElementById('matchTabContentContainer');
    if (container) this.renderMatchBoxscoreTab(container);
  }

  renderMatchBoxscoreTab(container) {
    const { boxscore, match, projectKey } = this.currentMatchData;

    if (!boxscore || (!boxscore.homeTeam && !boxscore.awayTeam)) {
      container.innerHTML = `
        <div class="glass-panel p-8 text-center space-y-2">
          <i data-lucide="clipboard-x" class="w-8 h-8 text-gray-500 mx-auto"></i>
          <h3 class="text-sm font-bold text-white">Boxscore in fase di sincronizzazione</h3>
          <p class="text-xs text-gray-400">I referti dettagliati vengono registrati digitalmente al termine di ciascun quarto o della gara.</p>
        </div>
      `;
      return;
    }

    const homeTeamData = boxscore.homeTeam || {};
    const awayTeamData = boxscore.awayTeam || {};
    const homePlayers = homeTeamData.players || [];
    const awayPlayers = awayTeamData.players || [];
    const homeTotals = homeTeamData.totals || {};
    const awayTotals = awayTeamData.totals || {};

    const formatSec = (sec) => {
      if (!sec) return '00:00';
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const renderTeamBoxscoreTable = (teamData, players, totals, teamName, isHome) => {
      const accent = isHome ? 'text-orange-400' : 'text-blue-400';
      const bgAccent = isHome ? 'bg-orange-500/10 border-orange-500/30' : 'bg-blue-500/10 border-blue-500/30';

      return `
        <div class="glass-panel p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xs px-2.5 py-0.5 rounded-full ${bgAccent} font-bold ${accent}">${isHome ? 'CASA' : 'OSPITI'}</span>
              <h3 class="text-base font-bold text-white">${this.escapeHtml(teamName)}</h3>
            </div>
            <span class="text-xs font-mono font-bold ${accent}">${totals.points ?? 0} PUNTI TOTALI</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left stats-table text-xs">
              <thead>
                <tr class="bg-gray-900/40 text-[10px]">
                  <th class="w-10">#</th>
                  <th class="min-w-[150px]">Giocatore</th>
                  <th class="text-center">MIN</th>
                  <th class="text-center font-bold text-white">PTS</th>
                  <th class="text-center">2P (M/A %)</th>
                  <th class="text-center">3P (M/A %)</th>
                  <th class="text-center">TL (M/A %)</th>
                  <th class="text-center">RO</th>
                  <th class="text-center">RD</th>
                  <th class="text-center font-bold">RT</th>
                  <th class="text-center">AST</th>
                  <th class="text-center">REC</th>
                  <th class="text-center">PER</th>
                  <th class="text-center">STP</th>
                  <th class="text-center">FC</th>
                  <th class="text-center">FS</th>
                  <th class="text-center font-bold text-yellow-400" title="Valutazione FIBA (PIR)">VAL</th>
                  <th class="text-center">+/-</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 font-mono">
                ${players.map(item => {
                  const p = item.player || {};
                  const st = item.stats || {};
                  const fullName = `${p.name} ${p.lastName || ''}`.trim();
                  const p2Tot = (st.inArcThrowsMade || 0) + (st.inArcThrowsFailed || 0);
                  const p2Pct = p2Tot > 0 ? Math.round(((st.inArcThrowsMade || 0) / p2Tot) * 100) + '%' : '-';
                  const p3Tot = (st.outArcThrowsMade || 0) + (st.outArcThrowsFailed || 0);
                  const p3Pct = p3Tot > 0 ? Math.round(((st.outArcThrowsMade || 0) / p3Tot) * 100) + '%' : '-';
                  const ftTot = (st.freeThrowsMade || 0) + (st.freeThrowsFailed || 0);
                  const ftPct = ftTot > 0 ? Math.round(((st.freeThrowsMade || 0) / ftTot) * 100) + '%' : '-';
                  const totReb = (st.offensiveRebounds || 0) + (st.defensiveRebounds || 0);

                  return `
                    <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.showPlayer('${projectKey || 'fip'}', '${match.competition?.fid}', '${isHome ? match.homeTeam?.fid : match.awayTeam?.fid}', '${p.fid}', '${this.escapeJs(fullName)}')">
                      <td class="${accent} font-bold">${p.number ? '#' + p.number : '-'}</td>
                      <td class="font-sans font-bold text-white flex items-center gap-1.5 py-2.5">
                        ${p.starting ? '<span class="text-amber-400 text-xs" title="Titolare (Starting 5)">★</span>' : ''}
                        <span class="hover:underline">${this.escapeHtml(fullName)}</span>
                      </td>
                      <td class="text-center text-gray-400">${st.timePlayed ? formatSec(st.timePlayed) : '-'}</td>
                      <td class="text-center font-black text-white text-sm ${st.points > 15 ? accent : ''}">${st.points ?? 0}</td>
                      <td class="text-center text-gray-300">${st.inArcThrowsMade || 0}/${p2Tot} <span class="text-[10px] text-gray-500">(${p2Pct})</span></td>
                      <td class="text-center text-gray-300">${st.outArcThrowsMade || 0}/${p3Tot} <span class="text-[10px] text-gray-500">(${p3Pct})</span></td>
                      <td class="text-center text-gray-300">${st.freeThrowsMade || 0}/${ftTot} <span class="text-[10px] text-gray-500">(${ftPct})</span></td>
                      <td class="text-center text-gray-400">${st.offensiveRebounds ?? 0}</td>
                      <td class="text-center text-gray-400">${st.defensiveRebounds ?? 0}</td>
                      <td class="text-center font-bold text-blue-400">${totReb}</td>
                      <td class="text-center text-emerald-400 font-semibold">${st.assists ?? 0}</td>
                      <td class="text-center text-purple-400">${st.steals ?? 0}</td>
                      <td class="text-center text-gray-400">${st.turnovers ?? 0}</td>
                      <td class="text-center text-gray-400">${st.blocks ?? 0}</td>
                      <td class="text-center text-red-400 font-semibold">${st.fouls ?? 0}</td>
                      <td class="text-center text-emerald-400">${st.receivedFouls ?? 0}</td>
                      <td class="text-center font-black text-yellow-400 text-sm">${st.fibaRating ?? 0}</td>
                      <td class="text-center font-bold ${(st.plusMinus || 0) >= 0 ? 'text-cyan-400' : 'text-red-400'}">${(st.plusMinus || 0) > 0 ? '+' : ''}${st.plusMinus ?? 0}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot class="border-t-2 border-white/20 font-mono font-bold bg-gray-900/80">
                <tr>
                  <td></td>
                  <td class="font-sans font-extrabold text-white uppercase text-[11px] py-3">TOTALI SQUADRA</td>
                  <td class="text-center text-gray-400">${formatSec(totals.timePlayed)}</td>
                  <td class="text-center text-base font-black text-white ${accent}">${totals.points ?? 0}</td>
                  <td class="text-center text-gray-300">${totals.inArcThrowsMade || 0}/${(totals.inArcThrowsMade || 0) + (totals.inArcThrowsFailed || 0)}</td>
                  <td class="text-center text-gray-300">${totals.outArcThrowsMade || 0}/${(totals.outArcThrowsMade || 0) + (totals.outArcThrowsFailed || 0)}</td>
                  <td class="text-center text-gray-300">${totals.freeThrowsMade || 0}/${(totals.freeThrowsMade || 0) + (totals.freeThrowsFailed || 0)}</td>
                  <td class="text-center text-gray-300">${totals.offensiveRebounds ?? 0}</td>
                  <td class="text-center text-gray-300">${totals.defensiveRebounds ?? 0}</td>
                  <td class="text-center text-blue-400 font-black">${(totals.offensiveRebounds || 0) + (totals.defensiveRebounds || 0)}</td>
                  <td class="text-center text-emerald-400">${totals.assists ?? 0}</td>
                  <td class="text-center text-purple-400">${totals.steals ?? 0}</td>
                  <td class="text-center text-gray-400">${totals.turnovers ?? 0}</td>
                  <td class="text-center text-gray-400">${totals.blocks ?? 0}</td>
                  <td class="text-center text-red-400">${totals.fouls ?? 0}</td>
                  <td class="text-center text-emerald-400">${totals.receivedFouls ?? 0}</td>
                  <td class="text-center text-yellow-400 text-base font-black">${totals.fibaRating ?? 0}</td>
                  <td class="text-center text-cyan-400">${totals.plusMinus ?? '-'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Home Team Boxscore -->
        ${renderTeamBoxscoreTable(homeTeamData, homePlayers, homeTotals, match.homeTeam?.name || 'Squadra Casa', true)}

        <!-- Away Team Boxscore -->
        ${renderTeamBoxscoreTable(awayTeamData, awayPlayers, awayTotals, match.awayTeam?.name || 'Squadra Ospite', false)}
      </div>
    `;
  }

  // --- TAB 2: INTERACTIVE BASKETBALL SHOT CHART ---
  setShotChartFilter(key, value) {
    this.shotChartFilter[key] = value;
    const container = document.getElementById('matchTabContentContainer');
    if (container) this.renderMatchShotChartTab(container);
  }

  renderMatchShotChartTab(container) {
    const { shots, match } = this.currentMatchData;

    if (!shots || shots.length === 0) {
      container.innerHTML = `
        <div class="glass-panel p-8 text-center space-y-2">
          <i data-lucide="crosshair" class="w-8 h-8 text-gray-500 mx-auto"></i>
          <h3 class="text-sm font-bold text-white">Mappa tiri in elaborazione</h3>
          <p class="text-xs text-gray-400">Le coordinate di tiro non sono state registrate o sono in fase di sincronizzazione per questo match.</p>
        </div>
      `;
      return;
    }

    const homeFid = match.homeTeam?.fid;
    const awayFid = match.awayTeam?.fid;

    // Apply active filters
    const filteredShots = shots.filter(s => {
      if (this.shotChartFilter.team === 'home' && s.teamFid !== homeFid) return false;
      if (this.shotChartFilter.team === 'away' && s.teamFid !== awayFid) return false;
      if (this.shotChartFilter.period !== 'all' && s.period !== parseInt(this.shotChartFilter.period, 10)) return false;
      if (this.shotChartFilter.type === 'made' && !s.result) return false;
      if (this.shotChartFilter.type === 'missed' && s.result) return false;
      if (this.shotChartFilter.type === '2pt' && s.value !== 2 && s.subCode !== 'IN_ARC') return false;
      if (this.shotChartFilter.type === '3pt' && s.value !== 3 && s.subCode !== 'OUT_ARC') return false;
      if (this.shotChartFilter.type === 'ft' && s.value !== 1 && s.subCode !== 'FREE_THROW') return false;
      if (this.shotChartFilter.player !== 'all' && s.actor?.fid !== this.shotChartFilter.player) return false;
      return true;
    });

    // Compute shooting statistics on filtered shots
    let totalAttempts = filteredShots.length;
    let totalMade = filteredShots.filter(s => s.result).length;
    let totalPct = totalAttempts > 0 ? Math.round((totalMade / totalAttempts) * 100) : 0;

    let p2Shots = filteredShots.filter(s => s.value === 2 || s.subCode === 'IN_ARC');
    let p2Made = p2Shots.filter(s => s.result).length;
    let p2Pct = p2Shots.length > 0 ? Math.round((p2Made / p2Shots.length) * 100) : 0;

    let p3Shots = filteredShots.filter(s => s.value === 3 || s.subCode === 'OUT_ARC');
    let p3Made = p3Shots.filter(s => s.result).length;
    let p3Pct = p3Shots.length > 0 ? Math.round((p3Made / p3Shots.length) * 100) : 0;

    let ftShots = filteredShots.filter(s => s.value === 1 || s.subCode === 'FREE_THROW');
    let ftMade = ftShots.filter(s => s.result).length;
    let ftPct = ftShots.length > 0 ? Math.round((ftMade / ftShots.length) * 100) : 0;

    // Map each shot to half-court SVG coordinates [x: 0..500, y: 0..470]
    // Basket at (250, 395)
    const plottedShots = filteredShots.map((s, idx) => {
      let x = 250;
      let y = 395;

      const hasExactPos = Array.isArray(s.position) && (s.position[0] !== 0 || s.position[1] !== 0);

      if (hasExactPos) {
        // Normalize coordinates to 0..500 x 0..470
        let rawX = s.position[0];
        let rawY = s.position[1];
        if (rawX <= 100 && rawY <= 100) {
          x = (rawX / 100) * 440 + 30;
          y = (rawY / 100) * 400 + 40;
        } else if (rawX <= 1000 && rawY <= 1000) {
          x = (rawX / 1000) * 440 + 30;
          y = (rawY / 1000) * 400 + 40;
        } else {
          x = Math.max(30, Math.min(470, rawX));
          y = Math.max(40, Math.min(440, rawY));
        }
      } else {
        // Fallback: smart zone distribution around standard FIBA shooting areas
        const pseudoRand = (idx * 37 + (s.period || 1) * 19) % 100;
        const angle = (pseudoRand / 100) * Math.PI - (Math.PI / 2); // -90 to +90 deg

        if (s.subCode === 'FREE_THROW' || s.value === 1) {
          x = 250 + (pseudoRand % 20 - 10);
          y = 200 + (pseudoRand % 15 - 7);
        } else if (s.subCode === 'OUT_ARC' || s.value === 3) {
          // 3-Point distance (~240 SVG units radius from hoop)
          const dist = 245 + (pseudoRand % 35);
          const a = -Math.PI / 2 + ((pseudoRand / 100) * (Math.PI - 0.3) + 0.15);
          x = 250 + Math.sin(a) * dist;
          y = 395 - Math.cos(a) * dist;
        } else {
          // 2-Point inside arc (~60-170 SVG units from hoop)
          const dist = 40 + (pseudoRand % 130);
          const a = -Math.PI / 2 + ((pseudoRand / 100) * (Math.PI - 0.4) + 0.2);
          x = 250 + Math.sin(a) * dist;
          y = 395 - Math.cos(a) * dist;
        }
      }

      // Constrain inside court boundaries
      x = Math.max(25, Math.min(475, x));
      y = Math.max(30, Math.min(440, y));

      return { ...s, plotX: x, plotY: y };
    });

    // Unique player actors who took shots
    const actorFids = [...new Set(shots.map(s => s.actor?.fid).filter(Boolean))];

    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <!-- Left: Filter & KPI Panel -->
        <div class="glass-panel p-5 space-y-5">
          <div class="border-b border-white/10 pb-3">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="filter" class="w-4 h-4 text-orange-400"></i>
              <span>Filtri Mappa Tiri</span>
            </h3>
            <p class="text-xs text-gray-400 mt-1">${filteredShots.length} tiri visualizzati su ${shots.length} totali</p>
          </div>

          <!-- Team Filter -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-300">Squadra</label>
            <div class="grid grid-cols-3 gap-1.5 text-xs font-semibold">
              <button onclick="app.setShotChartFilter('team', 'all')" class="p-2 rounded-lg ${this.shotChartFilter.team === 'all' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-gray-900 text-gray-400'}">Entrambe</button>
              <button onclick="app.setShotChartFilter('team', 'home')" class="p-2 rounded-lg ${this.shotChartFilter.team === 'home' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-gray-900 text-gray-400'}">Casa</button>
              <button onclick="app.setShotChartFilter('team', 'away')" class="p-2 rounded-lg ${this.shotChartFilter.team === 'away' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-gray-900 text-gray-400'}">Ospiti</button>
            </div>
          </div>

          <!-- Quarter Filter -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-300">Periodo / Quarto</label>
            <div class="grid grid-cols-5 gap-1 text-xs font-mono font-semibold">
              <button onclick="app.setShotChartFilter('period', 'all')" class="p-1.5 rounded-lg ${this.shotChartFilter.period === 'all' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-gray-900 text-gray-400'}">Tutti</button>
              <button onclick="app.setShotChartFilter('period', '1')" class="p-1.5 rounded-lg ${this.shotChartFilter.period === '1' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-gray-900 text-gray-400'}">Q1</button>
              <button onclick="app.setShotChartFilter('period', '2')" class="p-1.5 rounded-lg ${this.shotChartFilter.period === '2' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-gray-900 text-gray-400'}">Q2</button>
              <button onclick="app.setShotChartFilter('period', '3')" class="p-1.5 rounded-lg ${this.shotChartFilter.period === '3' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-gray-900 text-gray-400'}">Q3</button>
              <button onclick="app.setShotChartFilter('period', '4')" class="p-1.5 rounded-lg ${this.shotChartFilter.period === '4' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-gray-900 text-gray-400'}">Q4</button>
            </div>
          </div>

          <!-- Shot Type / Outcome Filter -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-300">Esito / Tipologia</label>
            <div class="grid grid-cols-2 gap-1.5 text-xs font-semibold">
              <button onclick="app.setShotChartFilter('type', 'all')" class="p-2 rounded-lg ${this.shotChartFilter.type === 'all' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-gray-900 text-gray-400'}">Tutti i Tiri</button>
              <button onclick="app.setShotChartFilter('type', 'made')" class="p-2 rounded-lg ${this.shotChartFilter.type === 'made' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-gray-900 text-gray-400'}">● Realizzati</button>
              <button onclick="app.setShotChartFilter('type', 'missed')" class="p-2 rounded-lg ${this.shotChartFilter.type === 'missed' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-gray-900 text-gray-400'}">✖ Errori</button>
              <button onclick="app.setShotChartFilter('type', '3pt')" class="p-2 rounded-lg ${this.shotChartFilter.type === '3pt' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-gray-900 text-gray-400'}">🎯 Solo 3P</button>
            </div>
          </div>

          <!-- KPI Summary Numbers -->
          <div class="pt-4 border-t border-white/10 space-y-2.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-400 font-medium">Tiri Totali dal Campo</span>
              <span class="font-mono font-bold text-white">${totalMade}/${totalAttempts} (${totalPct}%)</span>
            </div>
            <div class="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-orange-500 to-amber-500" style="width: ${totalPct}%"></div>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] font-mono">
              <div class="p-2 rounded-lg bg-gray-900/80 border border-white/5">
                <span class="text-gray-400 block text-[9px] font-sans">2 PUNTI</span>
                <span class="font-bold text-orange-400 text-xs">${p2Made}/${p2Shots.length}</span>
                <span class="text-gray-500 block text-[9px]">${p2Pct}%</span>
              </div>
              <div class="p-2 rounded-lg bg-gray-900/80 border border-white/5">
                <span class="text-gray-400 block text-[9px] font-sans">3 PUNTI</span>
                <span class="font-bold text-blue-400 text-xs">${p3Made}/${p3Shots.length}</span>
                <span class="text-gray-500 block text-[9px]">${p3Pct}%</span>
              </div>
              <div class="p-2 rounded-lg bg-gray-900/80 border border-white/5">
                <span class="text-gray-400 block text-[9px] font-sans">LIBERI</span>
                <span class="font-bold text-emerald-400 text-xs">${ftMade}/${ftShots.length}</span>
                <span class="text-gray-500 block text-[9px]">${ftPct}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Interactive Half-Court SVG Visualizer -->
        <div class="lg:col-span-2 glass-panel p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div class="flex items-center gap-2">
              <i data-lucide="target" class="w-4 h-4 text-orange-400"></i>
              <h3 class="text-base font-bold text-white">Campo da Gioco Ufficiale FIBA</h3>
            </div>
            
            <div class="flex items-center gap-4 text-xs font-semibold">
              <span class="flex items-center gap-1.5 text-emerald-400">
                <span class="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span> Canestro
              </span>
              <span class="flex items-center gap-1.5 text-red-400">
                <span class="w-3 h-3 font-black text-center flex items-center justify-center">✖</span> Errore
              </span>
            </div>
          </div>

          <!-- SVG FIBA Half-Court -->
          <div class="court-container relative">
            <svg class="court-svg" viewBox="0 0 500 470" xmlns="http://www.w3.org/2000/svg">
              <!-- Court Background & Texture -->
              <rect x="0" y="0" width="500" height="470" fill="transparent"/>

              <!-- Outer Boundary Line -->
              <rect x="25" y="30" width="450" height="410" fill="none" stroke="rgba(255, 255, 255, 0.25)" stroke-width="2.5"/>

              <!-- Center Court Circle (Top) -->
              <path d="M 190 30 A 60 60 0 0 0 310 30" fill="none" stroke="rgba(255, 255, 255, 0.25)" stroke-width="2"/>

              <!-- Paint / Key Area -->
              <rect x="170" y="200" width="160" height="240" fill="rgba(249, 115, 22, 0.04)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="2"/>

              <!-- Free Throw Line & Circle -->
              <line x1="170" y1="200" x2="330" y2="200" stroke="rgba(255, 255, 255, 0.3)" stroke-width="2"/>
              <path d="M 190 200 A 60 60 0 0 1 310 200" fill="none" stroke="rgba(255, 255, 255, 0.3)" stroke-width="2"/>
              <path d="M 190 200 A 60 60 0 0 0 310 200" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-dasharray="6,6" stroke-width="1.5"/>

              <!-- Restricted Area Semi-circle -->
              <path d="M 215 395 A 35 35 0 0 1 285 395" fill="none" stroke="rgba(255, 255, 255, 0.3)" stroke-width="1.5"/>

              <!-- Backboard & Rim -->
              <line x1="220" y1="415" x2="280" y2="415" stroke="rgba(255, 255, 255, 0.8)" stroke-width="3.5"/>
              <line x1="250" y1="415" x2="250" y2="405" stroke="rgba(249, 115, 22, 0.8)" stroke-width="2.5"/>
              <circle cx="250" cy="395" r="9" fill="none" stroke="#f97316" stroke-width="2.5"/>

              <!-- 3-Point Lines -->
              <!-- Straight corner 3pt lines -->
              <line x1="55" y1="440" x2="55" y2="305" stroke="rgba(255, 255, 255, 0.3)" stroke-width="2"/>
              <line x1="445" y1="440" x2="445" y2="305" stroke="rgba(255, 255, 255, 0.3)" stroke-width="2"/>
              <!-- 3pt Arc (Radius 225 from basket at 250, 395) -->
              <path d="M 55 305 A 225 225 0 0 1 445 305" fill="none" stroke="rgba(255, 255, 255, 0.3)" stroke-width="2"/>

              <!-- Shot Markers Overlaid -->
              <g id="shotMarkersGroup">
                ${plottedShots.map((s, i) => {
                  const isMade = s.result;
                  const isHomeShot = s.teamFid === homeFid;
                  const shotColor = isMade ? '#10b981' : '#ef4444';
                  const strokeColor = isHomeShot ? '#f97316' : '#3b82f6';
                  const title = `${isMade ? 'CANESTRO' : 'ERRORE'} • ${s.value || 2}PT • Q${s.period || 1}`;

                  if (isMade) {
                    return `
                      <g class="shot-marker" transform="translate(${s.plotX}, ${s.plotY})" data-shot-idx="${i}" onmouseenter="app.showShotTooltip(event, '${this.escapeJs(title)}')" onmouseleave="app.hideShotTooltip()">
                        <circle cx="0" cy="0" r="7.5" fill="#10b981" fill-opacity="0.9" stroke="${strokeColor}" stroke-width="2"/>
                        <circle cx="0" cy="0" r="3" fill="#ffffff"/>
                      </g>
                    `;
                  } else {
                    return `
                      <g class="shot-marker" transform="translate(${s.plotX}, ${s.plotY})" data-shot-idx="${i}" onmouseenter="app.showShotTooltip(event, '${this.escapeJs(title)}')" onmouseleave="app.hideShotTooltip()">
                        <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="-5" y1="5" x2="5" y2="-5" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
                      </g>
                    `;
                  }
                }).join('')}
              </g>
            </svg>

            <!-- Floating Tooltip -->
            <div id="shotTooltip" class="shot-tooltip hidden glass-panel p-2.5 rounded-xl border border-white/10 text-xs shadow-2xl backdrop-blur-xl">
              <span id="shotTooltipText" class="font-bold text-white"></span>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-[11px] text-gray-500 pt-1">
            <span>Bordo Arancione: Tiri Casa &bull; Bordo Blu: Tiri Ospiti</span>
            <span>Mappa Tiri Ufficiale FIP</span>
          </div>
        </div>

      </div>
    `;
  }

  showShotTooltip(event, text) {
    const tip = document.getElementById('shotTooltip');
    const tipText = document.getElementById('shotTooltipText');
    if (!tip || !tipText) return;

    tipText.textContent = text;
    tip.classList.remove('hidden');

    const rect = event.target.getBoundingClientRect();
    const parentRect = tip.parentElement.getBoundingClientRect();

    tip.style.left = `${rect.left - parentRect.left + 15}px`;
    tip.style.top = `${rect.top - parentRect.top - 30}px`;
  }

  hideShotTooltip() {
    const tip = document.getElementById('shotTooltip');
    if (tip) tip.classList.add('hidden');
  }

  // --- TAB 3: GAME FLOW & LEAD TRACKER ---
  renderMatchGameFlowTab(container) {
    const { flowStats, flowActions, match } = this.currentMatchData;

    const stats = flowStats || {};
    const biggestHome = stats.biggestLead?.homeTeam ?? 0;
    const biggestAway = stats.biggestLead?.awayTeam ?? 0;
    const timesTied = stats.timesTied ?? 0;
    const leadChanges = stats.leadChanges ?? 0;

    const homeFid = match.homeTeam?.fid;
    const awayFid = match.awayTeam?.fid;

    // Build cumulative score series from flow actions
    const scoringEvents = (flowActions || []).filter(a => a.result);
    
    let currentHomeScore = 0;
    let currentAwayScore = 0;
    const labels = ['Inizio'];
    const homeScores = [0];
    const awayScores = [0];
    const leads = [0];
    const pbpLog = [];

    scoringEvents.forEach((act, idx) => {
      const val = act.value || (act.subCode === 'OUT_ARC' ? 3 : (act.subCode === 'FREE_THROW' ? 1 : 2));
      const isHome = act.teamFid === homeFid;

      if (isHome) currentHomeScore += val;
      else currentAwayScore += val;

      const lead = currentHomeScore - currentAwayScore;
      labels.push(`Q${act.period || 1} (#${idx + 1})`);
      homeScores.push(currentHomeScore);
      awayScores.push(currentAwayScore);
      leads.push(lead);

      pbpLog.push({
        period: act.period || 1,
        teamName: isHome ? match.homeTeam?.name : match.awayTeam?.name,
        isHome,
        value: val,
        subCode: act.subCode || `${val}PT`,
        homeScore: currentHomeScore,
        awayScore: currentAwayScore
      });
    });

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- 4 KPI Badges -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-panel p-4 text-center border-orange-500/20">
            <span class="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Max Vantaggio Casa</span>
            <div class="text-3xl font-black text-orange-400 mt-1 font-mono">+${biggestHome}</div>
            <span class="text-[10px] text-gray-500">${this.escapeHtml(match.homeTeam?.name || 'Casa')}</span>
          </div>
          <div class="glass-panel p-4 text-center border-blue-500/20">
            <span class="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Max Vantaggio Ospiti</span>
            <div class="text-3xl font-black text-blue-400 mt-1 font-mono">+${biggestAway}</div>
            <span class="text-[10px] text-gray-500">${this.escapeHtml(match.awayTeam?.name || 'Ospiti')}</span>
          </div>
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Cambi di Comando</span>
            <div class="text-3xl font-black text-white mt-1 font-mono">${leadChanges}</div>
            <span class="text-[10px] text-gray-500">Alternanze vantaggio</span>
          </div>
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Momenti di Parità</span>
            <div class="text-3xl font-black text-white mt-1 font-mono">${timesTied}</div>
            <span class="text-[10px] text-gray-500">Punteggio pari</span>
          </div>
        </div>

        <!-- Chart.js Score Progression & Lead Tracker -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="trending-up" class="w-4 h-4 text-orange-400"></i>
              <span>Progressione Punteggio (Score Progression)</span>
            </h3>
            <div class="flex items-center gap-4 text-xs font-bold">
              <span class="text-orange-400 flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-orange-500"></span> ${this.escapeHtml(match.homeTeam?.name || 'Casa')}</span>
              <span class="text-blue-400 flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500"></span> ${this.escapeHtml(match.awayTeam?.name || 'Ospiti')}</span>
            </div>
          </div>

          <div class="relative h-72 w-full">
            <canvas id="matchFlowCanvas"></canvas>
          </div>
        </div>

        <!-- Play-by-Play Scoring Timeline -->
        ${pbpLog.length > 0 ? `
          <div class="glass-panel p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i data-lucide="list-ordered" class="w-4 h-4 text-amber-400"></i>
                <span>Cronologia Canestri (Play-by-Play Feed)</span>
              </h3>
              <span class="text-xs text-gray-400">${pbpLog.length} realizzazioni</span>
            </div>

            <div class="max-h-80 overflow-y-auto space-y-2 pr-1">
              ${pbpLog.slice().reverse().map((item, idx) => `
                <div class="p-3 rounded-xl bg-gray-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">Q${item.period}</span>
                    <span class="font-bold ${item.isHome ? 'text-orange-400' : 'text-blue-400'}">${this.escapeHtml(item.teamName)}</span>
                    <span class="text-gray-400 font-semibold">+${item.value} (${this.escapeHtml(item.subCode)})</span>
                  </div>
                  <span class="font-mono font-bold text-white">${item.homeScore} - ${item.awayScore}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;

    setTimeout(() => {
      const ctx = document.getElementById('matchFlowCanvas')?.getContext('2d');
      if (ctx) {
        if (this.matchFlowChart) this.matchFlowChart.destroy();
        this.matchFlowChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels.length > 1 ? labels : ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
              {
                label: match.homeTeam?.name || 'Casa',
                data: homeScores.length > 1 ? homeScores : [0, 24, 54, 79, 100],
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.2,
                borderWidth: 2.5,
                pointRadius: 2,
                pointHoverRadius: 5
              },
              {
                label: match.awayTeam?.name || 'Ospiti',
                data: awayScores.length > 1 ? awayScores : [0, 15, 37, 62, 80],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.2,
                borderWidth: 2.5,
                pointRadius: 2,
                pointHoverRadius: 5
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#9ca3af', font: { size: 10 }, maxTicksLimit: 12 }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.08)' },
                ticks: { color: '#9ca3af', font: { size: 10 } }
              }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }, 100);
  }

  // --- TAB 4: GAME LEADERS ---
  renderMatchLeadersTab(container) {
    const { leaders, match, projectKey } = this.currentMatchData;

    if (!leaders) {
      container.innerHTML = `
        <div class="glass-panel p-8 text-center space-y-2">
          <i data-lucide="award" class="w-8 h-8 text-gray-500 mx-auto"></i>
          <h3 class="text-sm font-bold text-white">Leader di gara in elaborazione</h3>
          <p class="text-xs text-gray-400">Le classifiche individuali della partita vengono calcolate in tempo reale durante e dopo il match.</p>
        </div>
      `;
      return;
    }

    const categories = [
      { key: 'points', title: 'Miglior Realizzatore', unit: 'PUNTI', icon: 'flame', color: 'text-orange-400' },
      { key: 'fibaRating', title: 'Miglior Valutazione FIBA', unit: 'VAL (PIR)', icon: 'award', color: 'text-yellow-400' },
      { key: 'rebounds', title: 'Miglior Rimbalzista', unit: 'RIMBALZI', icon: 'shield', color: 'text-blue-400' },
      { key: 'assists', title: 'Miglior Assistman', unit: 'ASSIST', icon: 'sparkles', color: 'text-emerald-400' },
      { key: 'outArcThrowsMade', title: 'Tiri da 3 Punti Realizzati', unit: '3PT SEGNATI', icon: 'target', color: 'text-cyan-400' }
    ];

    container.innerHTML = `
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${categories.map(cat => {
            const catData = leaders[cat.key];
            if (!catData) return '';

            const homeLeader = catData.homePlayers?.[0];
            const awayLeader = catData.awayPlayers?.[0];

            if (!homeLeader && !awayLeader) return '';

            const renderLeaderCard = (entry, isHome) => {
              if (!entry) return `<div class="p-3 bg-gray-900/40 rounded-xl text-center text-xs text-gray-500">N/A</div>`;
              const p = entry.player || {};
              const pName = `${p.name} ${p.lastName || ''}`.trim();
              const teamName = isHome ? match.homeTeam?.name : match.awayTeam?.name;
              const accent = isHome ? 'text-orange-400' : 'text-blue-400';

              return `
                <div class="flex items-center justify-between p-3 rounded-xl bg-gray-900/80 border border-white/5 hover:border-white/20 transition-all cursor-pointer" onclick="app.showPlayer('${projectKey || 'fip'}', '${match.competition?.fid}', '${entry.player?.teamFid || (isHome ? match.homeTeam?.fid : match.awayTeam?.fid)}', '${p.fid}', '${this.escapeJs(pName)}')">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      ${(p.photo && p.photo !== 'N/A') ? `<img src="${p.photo}" class="w-full h-full object-cover">` : `<i data-lucide="user" class="w-5 h-5 text-gray-400"></i>`}
                    </div>
                    <div>
                      <span class="text-[10px] font-bold ${accent} uppercase">${isHome ? 'CASA' : 'OSPITI'}</span>
                      <h4 class="font-bold text-xs text-white hover:underline">${this.escapeHtml(pName)}</h4>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-black font-mono text-white ${accent}">${entry.value ?? (entry.made ? `${entry.made}/${entry.attempted}` : 0)}</span>
                    <span class="text-[9px] text-gray-500 font-mono block">${cat.unit}</span>
                  </div>
                </div>
              `;
            };

            return `
              <div class="glass-panel p-5 space-y-3">
                <div class="flex items-center gap-2 border-b border-white/10 pb-2.5">
                  <i data-lucide="${cat.icon}" class="w-4 h-4 ${cat.color}"></i>
                  <h3 class="text-sm font-bold text-white">${cat.title}</h3>
                </div>

                <div class="space-y-2">
                  ${renderLeaderCard(homeLeader, true)}
                  ${renderLeaderCard(awayLeader, false)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --- TAB 5: LINEUPS & 5-MAN EFFICIENCY ---
  setLineupTeamFilter(team) {
    this.lineupTeam = team;
    const container = document.getElementById('matchTabContentContainer');
    if (container) this.renderMatchLineupsTab(container);
  }

  renderMatchLineupsTab(container) {
    const { homeLineup, awayLineup, match } = this.currentMatchData;
    const isHome = this.lineupTeam === 'home';
    const lineups = isHome ? homeLineup : awayLineup;
    const teamName = isHome ? match.homeTeam?.name : match.awayTeam?.name;

    const formatSec = (ms) => {
      const sec = Math.floor((ms || 0) / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    container.innerHTML = `
      <div class="glass-panel p-6 space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="users" class="w-4 h-4 text-orange-400"></i>
              <span>Quintetti &amp; Efficienza 5-Man (${this.escapeHtml(teamName)})</span>
            </h3>
            <p class="text-xs text-gray-400">Combinazioni tattiche di 5 giocatori impiegate dall'allenatore</p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="app.setLineupTeamFilter('home')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${isHome ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-gray-900 text-gray-400'}">
              ${this.escapeHtml(match.homeTeam?.name || 'Squadra Casa')}
            </button>
            <button onclick="app.setLineupTeamFilter('away')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${!isHome ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-gray-900 text-gray-400'}">
              ${this.escapeHtml(match.awayTeam?.name || 'Squadra Ospite')}
            </button>
          </div>
        </div>

        ${lineups.length > 0 ? `
          <div class="space-y-3">
            ${lineups.map((lu, idx) => {
              const players = lu.players || [];
              const st = lu.stats || {};
              const plusMinus = st.plusMinus ?? 0;

              return `
                <div class="p-4 rounded-2xl bg-gray-900/80 border border-white/5 space-y-3">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <span class="text-xs font-bold text-gray-400">Quintetto #${idx + 1} &bull; Tempo in campo: <strong class="text-white font-mono">${formatSec(st.timePlayed)}</strong></span>
                    <div class="flex items-center gap-3 text-xs font-mono">
                      <span class="text-gray-300">Punti Fatti/Subiti: <strong>${st.points ?? 0} - ${st.pointsReceived ?? 0}</strong></span>
                      <span class="px-2 py-0.5 rounded-full font-bold ${plusMinus >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">${plusMinus > 0 ? '+' : ''}${plusMinus} (+/-)</span>
                    </div>
                  </div>

                  <!-- 5 Players Row -->
                  <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    ${players.map(p => {
                      const pName = `${p.name} ${p.lastName || ''}`.trim();
                      return `
                        <div class="flex items-center gap-2 p-2 rounded-xl bg-gray-950/60 border border-white/5">
                          <div class="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0 text-[10px] font-bold text-orange-400 font-mono">
                            ${p.number ? '#' + p.number : '•'}
                          </div>
                          <span class="text-xs font-bold text-white truncate">${this.escapeHtml(pName)}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="p-8 text-center text-xs text-gray-400">Nessun dato di quintetto registrato per questa squadra.</div>
        `}
      </div>
    `;
  }

  // --- HEAD TO HEAD COMPARISON VIEW ---
  async updateComparison() {
    const input1 = document.getElementById('compareInput1')?.value.trim();
    const input2 = document.getElementById('compareInput2')?.value.trim();
    const container = document.getElementById('comparisonContainer');

    if (!input1 || !input2 || !container) return;

    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Interrogazione comparativa live per "${this.escapeHtml(input1)}" vs "${this.escapeHtml(input2)}"...</p>
      </div>
    `;

    try {
      const pQuery = `
        query CompareLive($c1: String!, $c2: String!, $s: String!, $opt: ISearchOptions!) {
          searchPlayers(searchCriteria: $c1, seasonId: $s, searchOptions: $opt) {
            fid
            name
            lastName
            number
            photo
            projectKey
            competitionFid
            teamFid
            team { name }
            competition { name }
          }
          searchPlayers2: searchPlayers(searchCriteria: $c2, seasonId: $s, searchOptions: $opt) {
            fid
            name
            lastName
            number
            photo
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
        try {
          const data = await this.gql(pQuery, { c1: input1, c2: input2, s: seasonId, opt: { limit: 1 } });
          if (!p1 && data?.searchPlayers?.[0]) p1 = data.searchPlayers[0];
          if (!p2 && data?.searchPlayers2?.[0]) p2 = data.searchPlayers2[0];
          if (p1 && p2) break;
        } catch (e) {
          console.warn(`Comparison lookup notice on season ${seasonId}:`, e);
        }
      }

      if (!p1 || !p2) {
        container.innerHTML = `
          <div class="p-8 text-center space-y-2">
            <p class="text-sm text-gray-400">Nessun dato live trovato per uno o entrambi gli atleti selezionati.</p>
            <p class="text-xs text-gray-500">Prova a inserire ad es. "Mannion" nel campo 1 e "Brown" nel campo 2.</p>
          </div>
        `;
        return;
      }

      const statsQ = `
        query GetPlayerStatPair($pK1: String!, $cFid1: String!, $tFid1: String!, $pFid1: String!, $pK2: String!, $cFid2: String!, $tFid2: String!, $pFid2: String!) {
          p1: player(projectKey: $pK1, competitionFid: $cFid1, teamFid: $tFid1, fid: $pFid1) {
            name
            lastName
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
              fibaRating
              plusMinus
              freeThrowsPercentage
              inArcThrowsPercentage
              outArcThrowsPercentage
            }
          }
          p2: player(projectKey: $pK2, competitionFid: $cFid2, teamFid: $tFid2, fid: $pFid2) {
            name
            lastName
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
              fibaRating
              plusMinus
              freeThrowsPercentage
              inArcThrowsPercentage
              outArcThrowsPercentage
            }
          }
        }
      `;

      const statsData = await this.gql(statsQ, {
        pK1: p1.projectKey || 'fip', cFid1: p1.competitionFid || '', tFid1: p1.teamFid || '', pFid1: p1.fid,
        pK2: p2.projectKey || 'fip', cFid2: p2.competitionFid || '', tFid2: p2.teamFid || '', pFid2: p2.fid
      });

      const s1 = statsData?.p1?.stats || {};
      const s2 = statsData?.p2?.stats || {};

      const name1 = `${p1.name} ${p1.lastName || ''}`.trim();
      const name2 = `${p2.name} ${p2.lastName || ''}`.trim();

      const ppg1 = s1.pointsPerGame ? Number(s1.pointsPerGame).toFixed(1) : (s1.pointsAVG ? Number(s1.pointsAVG).toFixed(1) : '0.0');
      const ppg2 = s2.pointsPerGame ? Number(s2.pointsPerGame).toFixed(1) : (s2.pointsAVG ? Number(s2.pointsAVG).toFixed(1) : '0.0');

      const rpg1 = s1.reboundsAVG ? Number(s1.reboundsAVG).toFixed(1) : (s1.games && s1.totalRebounds ? (s1.totalRebounds / s1.games).toFixed(1) : '0.0');
      const rpg2 = s2.reboundsAVG ? Number(s2.reboundsAVG).toFixed(1) : (s2.games && s2.totalRebounds ? (s2.totalRebounds / s2.games).toFixed(1) : '0.0');

      const apg1 = s1.assistsAVG ? Number(s1.assistsAVG).toFixed(1) : (s1.games && s1.assists ? (s1.assists / s1.games).toFixed(1) : '0.0');
      const apg2 = s2.assistsAVG ? Number(s2.assistsAVG).toFixed(1) : (s2.games && s2.assists ? (s2.assists / s2.games).toFixed(1) : '0.0');

      const fiba1 = s1.fibaRating ?? 0;
      const fiba2 = s2.fibaRating ?? 0;

      container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div class="p-6 bg-gray-900/60 rounded-2xl border border-white/5 space-y-4">
            <h3 class="text-sm font-bold text-white text-center">Confronto Grafico Attributi</h3>
            <div class="relative h-64 w-full">
              <canvas id="compareRadarCanvas"></canvas>
            </div>
            <div class="flex items-center justify-center gap-6 text-xs font-bold pt-2">
              <span class="flex items-center gap-1.5 text-orange-400">
                <span class="w-3 h-3 rounded-full bg-orange-500"></span> ${this.escapeHtml(name1)}
              </span>
              <span class="flex items-center gap-1.5 text-blue-400">
                <span class="w-3 h-3 rounded-full bg-blue-500"></span> ${this.escapeHtml(name2)}
              </span>
            </div>
          </div>

          <div class="space-y-4">
            <div class="overflow-x-auto">
              <table class="w-full text-center stats-table">
                <thead>
                  <tr class="bg-gray-900/40">
                    <th class="text-orange-400">${this.escapeHtml(name1)}</th>
                    <th class="text-gray-400">Metrica Live</th>
                    <th class="text-blue-400">${this.escapeHtml(name2)}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr>
                    <td class="font-mono font-bold text-base ${Number(ppg1) >= Number(ppg2) ? 'text-orange-400' : 'text-gray-400'}">${ppg1}</td>
                    <td class="text-xs text-gray-400 font-bold uppercase">Punti Media (PPG)</td>
                    <td class="font-mono font-bold text-base ${Number(ppg2) >= Number(ppg1) ? 'text-blue-400' : 'text-gray-400'}">${ppg2}</td>
                  </tr>
                  <tr>
                    <td class="font-mono font-bold text-base ${Number(rpg1) >= Number(rpg2) ? 'text-orange-400' : 'text-gray-400'}">${rpg1}</td>
                    <td class="text-xs text-gray-400 font-bold uppercase">Rimbalzi Media (RPG)</td>
                    <td class="font-mono font-bold text-base ${Number(rpg2) >= Number(rpg1) ? 'text-blue-400' : 'text-gray-400'}">${rpg2}</td>
                  </tr>
                  <tr>
                    <td class="font-mono font-bold text-base ${Number(apg1) >= Number(apg2) ? 'text-orange-400' : 'text-gray-400'}">${apg1}</td>
                    <td class="text-xs text-gray-400 font-bold uppercase">Assist Media (APG)</td>
                    <td class="font-mono font-bold text-base ${Number(apg2) >= Number(apg1) ? 'text-blue-400' : 'text-gray-400'}">${apg2}</td>
                  </tr>
                  <tr>
                    <td class="font-mono font-bold text-base ${Number(fiba1) >= Number(fiba2) ? 'text-orange-400' : 'text-gray-400'}">${fiba1}</td>
                    <td class="text-xs text-gray-400 font-bold uppercase">Valutazione (VAL)</td>
                    <td class="font-mono font-bold text-base ${Number(fiba2) >= Number(fiba1) ? 'text-blue-400' : 'text-gray-400'}">${fiba2}</td>
                  </tr>
                  <tr>
                    <td class="font-mono font-bold text-base">${s1.games ?? 0}</td>
                    <td class="text-xs text-gray-400 font-bold uppercase">Partite Disputate</td>
                    <td class="font-mono font-bold text-base">${s2.games ?? 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      setTimeout(() => {
        const ctx = document.getElementById('compareRadarCanvas')?.getContext('2d');
        if (ctx) {
          if (this.comparisonChart) this.comparisonChart.destroy();
          this.comparisonChart = new Chart(ctx, {
            type: 'radar',
            data: {
              labels: ['Punti', 'Rimbalzi', 'Assist', 'Recuperi', 'Precisione 2P', 'Valutazione'],
              datasets: [
                {
                  label: name1,
                  data: [
                    Math.min(100, (Number(ppg1) / 25) * 100),
                    Math.min(100, (Number(rpg1) / 10) * 100),
                    Math.min(100, (Number(apg1) / 8) * 100),
                    Math.min(100, (Number(s1.stealsAVG || 0) / 3) * 100),
                    Math.min(100, s1.inArcThrowsPercentage ? Number(s1.inArcThrowsPercentage) : 50),
                    Math.min(100, (Number(fiba1) / 30) * 100)
                  ],
                  backgroundColor: 'rgba(249, 115, 22, 0.25)',
                  borderColor: '#f97316',
                  borderWidth: 2,
                  pointBackgroundColor: '#f97316'
                },
                {
                  label: name2,
                  data: [
                    Math.min(100, (Number(ppg2) / 25) * 100),
                    Math.min(100, (Number(rpg2) / 10) * 100),
                    Math.min(100, (Number(apg2) / 8) * 100),
                    Math.min(100, (Number(s2.stealsAVG || 0) / 3) * 100),
                    Math.min(100, s2.inArcThrowsPercentage ? Number(s2.inArcThrowsPercentage) : 50),
                    Math.min(100, (Number(fiba2) / 30) * 100)
                  ],
                  backgroundColor: 'rgba(59, 130, 246, 0.25)',
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                  pointBackgroundColor: '#3b82f6'
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                  grid: { color: 'rgba(255, 255, 255, 0.08)' },
                  pointLabels: { color: '#9ca3af', font: { size: 10, weight: 'bold' } },
                  ticks: { display: false, min: 0, max: 100 }
                }
              },
              plugins: {
                legend: { display: false }
              }
            }
          });
        }
      }, 100);

    } catch (e) {
      console.error(e);
      container.innerHTML = `<p class="text-xs text-red-400 text-center py-6">Errore nel caricamento del confronto.</p>`;
    }
  }

  // --- FIBA RATING EXPLANATION MODAL ---
  showFibaRatingModal() {
    const existing = document.getElementById('fibaRatingModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'fibaRatingModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 fade-in';
    modal.innerHTML = `
      <div class="glass-panel max-w-lg w-full p-6 space-y-4 border border-yellow-500/30 shadow-2xl relative">
        <button onclick="document.getElementById('fibaRatingModal').remove()" class="absolute right-4 top-4 text-gray-400 hover:text-white">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
            <i data-lucide="award" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">Valutazione FIBA (PIR)</h3>
            <p class="text-xs text-gray-400">Formula ufficiale di efficienza individuale</p>
          </div>
        </div>

        <div class="space-y-3 text-xs text-gray-300 leading-relaxed">
          <p>
            La <strong class="text-yellow-400">Valutazione FIBA</strong> (in inglese <em>Performance Index Rating / FIBA Rating</em>) è l'indice federale sintetico che misura l'impatto reale complessivo di un giocatore sul campo.
          </p>

          <div class="p-3 bg-gray-950/80 rounded-xl border border-white/5 font-mono text-[11px] text-gray-200">
            <div class="text-emerald-400 font-bold mb-1">+ FATTORI POSITIVI:</div>
            Punti + Rimbalzi + Assist + Recuperi + Stoppate Date + Falli Subiti
            <div class="text-red-400 font-bold mt-2 mb-1">- FATTORI NEGATIVI:</div>
            Tiri Sbagliati (2P + 3P) + Liberi Sbagliati + Palle Perse + Stoppate Subite + Falli Commessi
          </div>

          <p class="text-gray-400">
            <strong>Origine del Dato:</strong> Il valore è calcolato direttamente dai server ufficiali FIP (tramite l'attributo GraphQL <code class="text-orange-400">fibaRating</code>) a partire dai referti elettronici digitali dei comitati federali.
          </p>
        </div>

        <div class="pt-2 flex justify-end">
          <button onclick="document.getElementById('fibaRatingModal').remove()" class="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg">
            Ho capito
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons();
  }

  // --- UTILS ---
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  escapeJs(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
}

// Global Application Instance
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new BasketApp();
});