/**
 * ItalyBasketStats - Modern Basketball Statistics Web App
 * Dual Engine: FIP Stats (NBN23 GraphQL) & Italia Canestro
 * 100% Real-time dynamic live data - Zero mock data
 * Static Zero-Backend Architecture (GitHub Pages & Local Browser Ready)
 * Version: 1.2.0
 */

class BasketApp {
  constructor() {
    this.version = '1.2.0';
    this.provider = 'dual'; // 'dual' | 'fip' | 'canestro'
    this.searchFilter = 'all'; // 'all' | 'players' | 'teams' | 'competitions'
    this.currentView = 'search';
    this.searchTimeout = null;
    this.comparisonChart = null;
    this.playerChart = null;

    // Dynamic Auth & Network Transport State
    this.firebaseApiKey = 'AIzaSyDfES1qET23MQ0Y5_cgbDYbeQ168xVcpiA';
    this.firebaseToken = null;
    this.tokenExpiry = 0;
    this.deviceId = 'fip-web-' + Math.random().toString(36).substring(2, 10);
    this.preferredTransport = null; // 'direct' | 'allorigins' | 'corsproxy'

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
    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Set version badge
    const vBadge = document.getElementById('appVersionBadge');
    if (vBadge) vBadge.textContent = `v${this.version}`;

    // Render Championships Hub Directory
    this.renderChampionshipsDirectory();

    // Authenticate & Fetch Live Active Season
    try {
      await this.getFirebaseAuthToken();
      await this.fetchCurrentSeason();
    } catch (e) {
      console.warn('Initial session bootstrap notice:', e);
    }

    // Default view
    this.showWelcomeState();
  }

  // ==========================================
  // AUTHENTICATION & MULTI-STRATEGY NETWORKING
  // ==========================================

  /**
   * Acquire or refresh Firebase Auth ID Token directly in the browser (100% Client-Side)
   */
  async getFirebaseAuthToken() {
    // 1. In-memory valid token
    if (this.firebaseToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.firebaseToken;
    }

    // 2. LocalStorage cached token
    try {
      const cached = localStorage.getItem('fip_id_token');
      const cachedExp = parseInt(localStorage.getItem('fip_token_exp') || '0', 10);
      if (cached && cachedExp && Date.now() < cachedExp) {
        this.firebaseToken = cached;
        this.tokenExpiry = cachedExp;
        return this.firebaseToken;
      }
    } catch (e) {
      // localStorage disabled or restricted
    }

    // 3. Generate dynamic token via Google Identity Toolkit
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.firebaseApiKey}`;
    const randEmail = `basket_${Date.now()}_${Math.floor(Math.random() * 10000)}@nbn23app.test`;

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

  /**
   * Execute GraphQL Query with client-side cascading network transports
   */
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

    // 1. Direct fetch to FIP GraphQL endpoint
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
      console.warn('Direct GraphQL fetch attempt notice, testing fallback gateway...');
    }

    // 2. AllOrigins CORS Gateway Fallback
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
    } catch (e) {
      console.warn('AllOrigins fallback notice:', e);
    }

    // 3. CodeTabs CORS Gateway Fallback
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
    } catch (e) {
      console.warn('CodeTabs fallback notice:', e);
    }

    throw new Error('Impossibile raggiungere i server FIP. Verifica la connessione internet.');
  }

  // --- DYNAMIC SEASON RESOLUTION ---
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
      console.log('Seasons resolved:', this.knownSeasons);
    } catch (e) {
      console.warn('Using default known seasons list');
    }
  }

  // ==========================================
  // NAVIGATION & ROUTING
  // ==========================================

  navigate(viewName, data = null) {
    this.currentView = viewName;

    // Update active nav button (desktop & mobile)
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
      this.loadStandingsData(select ? select.value : 'under 15 eccellenza');
    }

    // Scroll to top
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

  /**
   * Robust multi-season competition lookup
   */
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
          <!-- Sub-categories / Phases picker if available -->
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
              <span>Classifica Ufficiale Live</span>
            </h3>
            <p class="text-xs text-gray-400">Dati in tempo reale sincronizzati dai referti ufficiali FIP</p>
          </div>

          <!-- Girone Picker -->
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
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    if (firstGroup) {
      this.loadGroupStandings(comp.projectKey || 'fip', comp.fid, firstGroup.fid);
    } else {
      document.getElementById('compGroupStandingsContent').innerHTML = `<p class="text-xs text-gray-400 text-center py-6">Nessun girone attivo per questo torneo.</p>`;
    }
  }

  // ==========================================
  // SEARCH LOGIC & LIVE QUERY
  // ==========================================

  handleSearchInput(value) {
    clearTimeout(this.searchTimeout);
    const clearBtn = document.getElementById('clearSearchBtn');
    if (value.trim()) {
      clearBtn?.classList.remove('hidden');
    } else {
      clearBtn?.classList.add('hidden');
    }

    this.searchTimeout = setTimeout(() => {
      if (value.trim().length >= 2) {
        this.performSearch(value.trim());
      } else if (value.trim().length === 0) {
        this.showWelcomeState();
      }
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

    this.updateLoadingIndicatorText();
    welcome?.classList.add('hidden');
    loading?.classList.remove('hidden');
    if (grid) grid.innerHTML = '';

    try {
      const results = await this.queryLiveSearch(query);

      title?.classList.remove('hidden');
      badge?.classList.remove('hidden');
      if (badge) badge.textContent = `${results.length} risultati live`;

      if (results.length === 0) {
        if (grid) {
          grid.innerHTML = `
            <div class="col-span-full p-8 text-center glass-panel">
              <i data-lucide="alert-circle" class="w-10 h-10 text-orange-400 mx-auto mb-2"></i>
              <h4 class="text-base font-bold text-white">Nessun risultato trovato per "${this.escapeHtml(query)}"</h4>
              <p class="text-xs text-gray-400 mt-1">Verifica il filtro attivo (Giocatori, Squadre, Campionati) o prova con un altro nome.</p>
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
      console.error('Search error:', err);
      if (grid) {
        grid.innerHTML = `
          <div class="col-span-full p-6 text-center glass-panel border-red-500/30">
            <i data-lucide="wifi-off" class="w-8 h-8 text-red-400 mx-auto mb-2"></i>
            <p class="text-sm text-red-400">Impossibile completare la ricerca live. Verifica la connessione di rete.</p>
          </div>
        `;
      }
      if (window.lucide) window.lucide.createIcons();
    } finally {
      loading?.classList.add('hidden');
    }
  }

  /**
   * Multi-Season & Strict Type Search Engine
   */
  async queryLiveSearch(criteria) {
    const rawResults = [];
    const limit = 25;

    // Source tags based on selected provider
    const sourceLabel = this.provider === 'canestro' ? 'Italia Canestro' : (this.provider === 'fip' ? 'FIP' : 'FIP Live');

    // 1. FILTER: PLAYERS STRICT MODE
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
          if (data?.searchPlayers && data.searchPlayers.length > 0) {
            for (const p of data.searchPlayers) {
              rawResults.push({
                type: 'player',
                fid: p.fid,
                projectKey: p.projectKey || 'fip',
                compFid: p.competitionFid || p.competition?.fid || '',
                teamFid: p.teamFid || p.team?.fid || '',
                title: `${p.name} ${p.lastName || ''}`.trim(),
                subtitle: p.team?.name ? `${p.team.name} • ${p.competition?.name || ''}` : (p.competition?.name || 'Atleta FIP'),
                meta: p.number ? `#${p.number}` : 'Giocatore',
                avatar: (p.photo && p.photo !== 'N/A') ? p.photo : null,
                source: sourceLabel
              });
            }
          }
        } catch (e) {
          console.warn(`Player search notice on season ${seasonId}:`, e);
        }
      }

      // Deduplicate by fid & Strictly filter for player types only
      const seen = new Set();
      return rawResults.filter(r => {
        if (r.type !== 'player' && r.type !== 'uniquePlayer') return false;
        if (seen.has(r.fid)) return false;
        seen.add(r.fid);
        return true;
      });
    }

    // 2. FILTER: COMPETITIONS STRICT MODE
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
          if (data?.searchCompetitions && data.searchCompetitions.length > 0) {
            for (const c of data.searchCompetitions) {
              rawResults.push({
                type: 'competition',
                fid: c.fid,
                projectKey: c.projectKey || 'fip',
                title: c.name || c.shortName,
                subtitle: c.categoryName ? `${c.categoryName} • ${c.groups?.length || 0} gironi` : `${c.groups?.length || 0} gironi/fasi`,
                meta: 'Campionato Ufficiale',
                avatar: null,
                source: sourceLabel
              });
            }
          }
        } catch (e) {
          console.warn(`Competition search notice on season ${seasonId}:`, e);
        }
      }

      // Deduplicate by fid & Strictly filter for competition types only
      const seen = new Set();
      return rawResults.filter(r => {
        if (r.type !== 'competition') return false;
        if (seen.has(r.fid)) return false;
        seen.add(r.fid);
        return true;
      });
    }

    // 3. FILTER: TEAMS STRICT MODE
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
          if (data?.searchTeams && data.searchTeams.length > 0) {
            for (const t of data.searchTeams) {
              rawResults.push({
                type: 'team',
                fid: t.fid,
                projectKey: t.projectKey || 'fip',
                compFid: t.competitionFid || t.competition?.fid || '',
                title: t.name,
                subtitle: t.competition?.name || 'Competizione FIP',
                meta: t.standingPosition ? `Posizione: ${t.standingPosition}°` : 'Società FIP',
                avatar: (t.logo && t.logo !== 'N/A') ? t.logo : null,
                source: sourceLabel
              });
            }
          }
        } catch (e) {
          console.warn(`Team search notice on season ${seasonId}:`, e);
        }
      }

      // Deduplicate by fid & Strictly filter for team types only
      const seen = new Set();
      return rawResults.filter(r => {
        if (r.type !== 'team') return false;
        if (seen.has(r.fid)) return false;
        seen.add(r.fid);
        return true;
      });
    }

    // 4. FILTER: ALL (UNIVERSAL SEARCH)
    const uniQuery = `
      query UniversalSearch($c: String!, $s: String!, $opt: ISearchOptions!) {
        search(searchCriteria: $c, seasonId: $s, searchOptions: $opt) {
          __typename
          ... on Competition {
            compFid: fid
            compName: name
            shortName
            categoryName
            projectKey
          }
          ... on Team {
            teamFid: fid
            teamCompFid: competitionFid
            teamName: name
            standingPosition
            projectKey
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
            projectKey
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
              projectKey: item.projectKey || 'fip',
              title: item.compName || item.shortName,
              subtitle: item.categoryName || 'Campionato FIP',
              meta: 'Campionato',
              avatar: null,
              source: sourceLabel
            });
          } else if (item.__typename === 'Team') {
            rawResults.push({
              type: 'team',
              fid: item.teamFid,
              projectKey: item.projectKey || 'fip',
              compFid: item.teamCompFid || item.teamComp?.fid || '',
              title: item.teamName,
              subtitle: item.teamComp?.name || 'Competizione FIP',
              meta: item.standingPosition ? `Posizione: ${item.standingPosition}°` : 'Squadra',
              avatar: (item.logo && item.logo !== 'N/A') ? item.logo : null,
              source: sourceLabel
            });
          } else if (item.__typename === 'Player') {
            rawResults.push({
              type: 'player',
              fid: item.playerFid,
              projectKey: item.projectKey || 'fip',
              compFid: item.playerCompFid || item.playerComp?.fid || '',
              teamFid: item.playerTeamFid || item.playerTeam?.fid || '',
              title: `${item.playerName} ${item.playerLastName || ''}`.trim(),
              subtitle: item.playerTeam?.name ? `${item.playerTeam.name} • ${item.playerComp?.name || ''}` : (item.playerComp?.name || 'Atleta FIP'),
              meta: item.playerNumber ? `#${item.playerNumber}` : 'Giocatore',
              avatar: (item.playerPhoto && item.playerPhoto !== 'N/A') ? item.playerPhoto : null,
              source: sourceLabel
            });
          } else if (item.__typename === 'UniquePlayer') {
            rawResults.push({
              type: 'uniquePlayer',
              fid: item.uniqueId,
              uniqueId: item.uniqueId,
              title: `${item.uniqueName} ${item.uniqueLastName || ''}`.trim(),
              subtitle: 'Carriera & Statistiche Aggregate FIP',
              meta: 'Profilo Unico FIP',
              avatar: (item.uniquePhoto && item.uniquePhoto !== 'N/A') ? item.uniquePhoto : null,
              source: sourceLabel
            });
          }
        }
      } catch (e) {
        console.warn(`Universal search notice on season ${seasonId}:`, e);
      }
    }

    // Deduplicate items
    const seen = new Set();
    return rawResults.filter(r => {
      const key = `${r.type}_${r.fid || r.uniqueId || r.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // --- RENDER SEARCH CARD ---
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
        <p class="text-xs text-gray-400">Caricamento rosa e statistiche di ${this.escapeHtml(teamName || 'squadra')}...</p>
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

      const data = await this.gql(query, { pK: projectKey || 'fip', cFid: compFid || '', tFid: teamFid });
      const teamList = data?.team;
      const team = Array.isArray(teamList) ? teamList[0] : teamList;

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

            <!-- Back button & actions -->
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

      const data = await this.gql(query, { pK: projectKey || 'fip', cFid: compFid || '', tFid: teamFid || '', pFid: playerFid });
      const p = data?.player;

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
          <!-- Chart -->
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

          <!-- Shooting Stats -->
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
      `;

      if (window.lucide) window.lucide.createIcons();

      // Render Player Radar Chart with Chart.js
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
            stats {
              games
              points
              pointsPerGame
              assists
              assistsPerGame
              rebounds
              reboundsPerGame
              steals
              stealsPerGame
              blocks
              blocksPerGame
              fibaRating
              plusMinus
              freeThrowsPercentage
              inArcThrowsPercentage
              outArcThrowsPercentage
            }
          }
        }
      `;

      const data = await this.gql(query, { id: uniqueId });
      const up = data?.uniquePlayer;

      if (!up) {
        container.innerHTML = `<div class="glass-panel p-8 text-center text-xs text-gray-400">Profilo atleta non trovato.</div>`;
        return;
      }

      const fullName = `${up.name} ${up.lastName || ''}`.trim();
      const stats = up.stats || {};
      const linkedTeams = up.players || [];

      container.innerHTML = `
        <div class="glass-panel p-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <div class="w-24 h-24 rounded-2xl bg-gray-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                ${(up.photo && up.photo !== 'N/A') ? `<img src="${up.photo}" class="w-full h-full object-cover">` : `<i data-lucide="user" class="w-12 h-12 text-orange-400"></i>`}
              </div>
              <div>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">PROFILO UNIFICATO FIP</span>
                <h1 class="text-3xl font-extrabold text-white mt-1">${this.escapeHtml(fullName)}</h1>
                <p class="text-xs text-gray-400 mt-1">${linkedTeams.length} squadre / campionati collegati</p>
              </div>
            </div>
            <button onclick="app.navigate('search')" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Torna alla ricerca
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-gray-400 uppercase">Partite Totali</span>
            <div class="text-2xl font-black text-white mt-1 mono-stat">${stats.games ?? 0}</div>
          </div>
          <div class="glass-panel p-4 text-center border-orange-500/20">
            <span class="text-[11px] font-bold text-orange-400 uppercase">Punti Totali</span>
            <div class="text-2xl font-black text-orange-400 mt-1 mono-stat">${stats.points ?? 0}</div>
            <span class="text-[10px] text-gray-500">${stats.pointsPerGame ? Number(stats.pointsPerGame).toFixed(1) : 0} PPG</span>
          </div>
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-blue-400 uppercase">Rimbalzi Totali</span>
            <div class="text-2xl font-black text-blue-400 mt-1 mono-stat">${stats.rebounds ?? 0}</div>
          </div>
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-emerald-400 uppercase">Assist Totali</span>
            <div class="text-2xl font-black text-emerald-400 mt-1 mono-stat">${stats.assists ?? 0}</div>
          </div>
          <div class="glass-panel p-4 text-center cursor-pointer border-yellow-500/20 group hover:border-yellow-500/50" onclick="app.showFibaRatingModal()">
            <div class="flex items-center justify-center gap-1">
              <span class="text-[11px] font-bold text-yellow-400 uppercase">Valutazione</span>
              <i data-lucide="help-circle" class="w-3 h-3 text-yellow-400 opacity-60"></i>
            </div>
            <div class="text-2xl font-black text-yellow-400 mt-1 mono-stat">${stats.fibaRating ?? 0}</div>
            <span class="text-[10px] text-gray-500">FIBA VAL Info &rarr;</span>
          </div>
          <div class="glass-panel p-4 text-center">
            <span class="text-[11px] font-bold text-cyan-400 uppercase">Plus / Minus</span>
            <div class="text-2xl font-black text-cyan-400 mt-1 mono-stat">${stats.plusMinus ?? 0}</div>
          </div>
        </div>

        <!-- Linked Teams List -->
        <div class="glass-panel p-6 space-y-4">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="shield" class="w-4 h-4 text-orange-400"></i>
            <span>Società e Competizioni (${linkedTeams.length})</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${linkedTeams.map(item => `
              <div onclick="app.showPlayer('${item.projectKey || 'fip'}', '${item.competitionFid || item.competition?.fid}', '${item.teamFid || item.team?.fid}', '${item.fid}', '${this.escapeJs(fullName)}')" class="p-4 rounded-xl bg-gray-900/60 border border-white/5 hover:border-orange-500/30 cursor-pointer flex items-center justify-between group">
                <div>
                  <h4 class="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">${this.escapeHtml(item.team?.name || 'Squadra')}</h4>
                  <p class="text-xs text-gray-400">${this.escapeHtml(item.competition?.name || 'Campionato')}</p>
                </div>
                <i data-lucide="chevron-right" class="w-4 h-4 text-gray-500 group-hover:text-white transition-colors"></i>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error(e);
      container.innerHTML = `<div class="glass-panel p-6 text-center text-xs text-red-400">Errore nel caricamento della carriera atleta.</div>`;
    }
  }

  // --- DETAIL: COMPETITION VIEW ---
  async showCompetition(compFid, projectKey, compName) {
    this.navigate('competition');
    const container = document.getElementById('competitionDetailContent');
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 spinner"></div>
        <p class="text-xs text-gray-400">Caricamento gironi e classifiche di ${this.escapeHtml(compName || 'campionato')}...</p>
      </div>
    `;

    try {
      const query = `
        query GetCompetitionData($c: String!, $s: String!, $opt: ISearchOptions!) {
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

      let comp = null;
      let comps = [];

      for (const seasonId of this.knownSeasons) {
        try {
          const data = await this.gql(query, { c: compName || '', s: seasonId, opt: { limit: 10 } });
          comps = data?.searchCompetitions || [];
          comp = comps.find(c => c.fid === compFid) || comps[0];
          if (comp) break;
        } catch (e) {
          console.warn(`Competition query notice on season ${seasonId}:`, e);
        }
      }

      if (!comp) {
        container.innerHTML = `<div class="glass-panel p-8 text-center text-xs text-gray-400">Campionato non trovato.</div>`;
        return;
      }

      this.renderFullCompetitionView(comp, comps);
    } catch (e) {
      console.error(e);
      container.innerHTML = `<div class="glass-panel p-6 text-center text-xs text-red-400">Errore nel caricamento del campionato.</div>`;
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
      tableContent?.classList.remove('hidden');
      scorersContent?.classList.add('hidden');
    } else {
      if (scorersBtn) scorersBtn.className = 'px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all';
      if (tableBtn) tableBtn.className = 'px-4 py-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white border border-white/5 text-xs font-bold transition-all';
      tableContent?.classList.add('hidden');
      scorersContent?.classList.remove('hidden');
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

      // Top Scorers / Players for this competition
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
    const val = select ? select.value : 'under 15 eccellenza';
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
              <div class="glass-panel p-5 space-y-3 relative overflow-hidden group">
                <div class="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span class="font-mono text-gray-400">${this.escapeHtml(m.roundName || 'Fase a Gironi')}</span>
                  ${isLive ? '<span class="badge-live text-[10px] font-bold px-2 py-0.5 rounded uppercase">LIVE</span>' : (isFinished ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400">FINALE</span>' : '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">PROGRAMMATA</span>')}
                </div>

                <div class="space-y-2">
                  <!-- Home -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="w-6 h-6 rounded bg-gray-800 flex items-center justify-center overflow-hidden">
                        ${(home.logo && home.logo !== 'N/A') ? `<img src="${home.logo}" class="max-h-full max-w-full">` : `<i data-lucide="shield" class="w-3.5 h-3.5 text-orange-400"></i>`}
                      </div>
                      <span class="font-bold text-sm text-white">${this.escapeHtml(home.name)}</span>
                    </div>
                  </div>

                  <!-- Away -->
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
                  <span class="text-orange-400 font-semibold group-hover:underline">Referto Ufficiale &rarr;</span>
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

      // Fetch both detailed stats
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
          <!-- Chart -->
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

          <!-- Comparison Table -->
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
            <strong>Origine del Dato:</strong> Il valore è calcolato direttamente dai server ufficiali FIP (tramite l'attributo GraphQL <code class="text-orange-400">fibaRating</code> / <code class="text-orange-400">fibaRatingAVG</code>) a partire dai referti elettronici digitali dei comitati federali.
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
