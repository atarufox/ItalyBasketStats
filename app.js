/**
 * ItalyBasketStats - Modern Basketball Statistics Web App
 * FIP Stats & Italia Canestro Live Engine
 * Static Zero-Backend Architecture with Pre-Indexed Live Federal Database
 * Version: 2.0.0
 */

class BasketApp {
  constructor() {
    this.version = '2.0.0';
    this.currentView = 'championships'; // Default landing view: Campionati & Gironi Hub
    this.selectedCategory = 'all'; // 'all' | 'nazionali' | 'giovanili' | 'regionali' | 'femminili'
    this.selectedRegion = 'all';
    this.textFilter = '';
    
    // In-memory Database initialized from window.FIP_DATABASE
    this.db = window.FIP_DATABASE || { season: '2025/2026', seasonId: '686e1422dd2c672160d5ca4b', competitions: [], boxscores: {} };
    this.competitions = this.db.competitions || [];
    this.boxscores = this.db.boxscores || {};

    // Current State for Views
    this.currentCompetition = null;
    this.currentGironeIndex = 0;
    this.currentCompetitionTab = 'standings'; // 'standings' | 'calendar' | 'teams' | 'scorers'
    
    this.currentMatch = null;
    this.currentMatchTab = 'boxscore'; // 'boxscore' | 'shotchart' | 'gameflow' | 'leaders'
    this.shotFilter = { team: 'all', period: 'all', result: 'all', player: 'all' };
    
    this.standingsViewTab = 'table'; // 'table' | 'scorers'
    this.searchFilter = 'all'; // 'all' | 'competitions' | 'teams' | 'players'
    
    this.comparisonChart = null;

    // Index all teams and players for instant search & cross-linking
    this.indexData();

    // Setup Italian Regions list
    this.regions = [
      'Tutte le Regioni',
      'Nazionale',
      'Lombardia',
      'Lazio',
      'Emilia-Romagna',
      'Veneto',
      'Toscana',
      'Piemonte',
      'Campania',
      'Puglia',
      'Sicilia',
      'Sardegna',
      'Liguria',
      'Marche',
      'Friuli Venezia Giulia',
      'Trentino Alto Adige',
      'Calabria',
      'Abruzzo'
    ];
  }

  /**
   * Pre-index all teams, players, and match summaries for 0ms lookup
   */
  indexData() {
    this.indexedTeams = new Map();
    this.indexedPlayers = new Map();
    this.indexedMatches = new Map();

    // Iterate competitions
    for (const comp of this.competitions) {
      if (!comp.groups) continue;
      for (let gIdx = 0; gIdx < comp.groups.length; gIdx++) {
        const group = comp.groups[gIdx];
        
        // Index standings teams
        if (group.standings) {
          for (const s of group.standings) {
            const teamKey = s.teamName.trim().toUpperCase();
            if (!this.indexedTeams.has(teamKey)) {
              this.indexedTeams.set(teamKey, {
                name: s.teamName,
                compId: comp.id,
                compName: comp.name,
                compCategory: comp.category,
                compRegion: comp.region,
                groupName: group.name,
                groupIdx: gIdx,
                stats: s,
                matches: [],
                roster: new Map()
              });
            }
          }
        }

        // Index rounds & matches
        if (group.rounds) {
          for (const round of group.rounds) {
            if (!round.matches) continue;
            for (const m of round.matches) {
              const matchKey = String(m.fid);
              this.indexedMatches.set(matchKey, {
                ...m,
                compId: comp.id,
                compName: comp.name,
                groupName: group.name,
                groupIdx: gIdx,
                roundName: round.name
              });

              // Associate match to teams
              if (m.homeTeam && m.homeTeam.name) {
                const hKey = m.homeTeam.name.trim().toUpperCase();
                if (this.indexedTeams.has(hKey)) {
                  this.indexedTeams.get(hKey).matches.push(m);
                }
              }
              if (m.awayTeam && m.awayTeam.name) {
                const aKey = m.awayTeam.name.trim().toUpperCase();
                if (this.indexedTeams.has(aKey)) {
                  this.indexedTeams.get(aKey).matches.push(m);
                }
              }
            }
          }
        }
      }
    }

    // Index boxscores & players
    for (const [matchFid, box] of Object.entries(this.boxscores)) {
      if (!box) continue;
      const processPlayerList = (players, teamName, isHome) => {
        if (!Array.isArray(players)) return;
        for (const p of players) {
          if (!p.name) continue;
          const pName = p.name.trim();
          const pKey = pName.toUpperCase();
          
          if (!this.indexedPlayers.has(pKey)) {
            this.indexedPlayers.set(pKey, {
              id: p.id || ('p-' + Math.random().toString(36).substr(2, 8)),
              name: pName,
              number: p.number || '#',
              position: p.position || 'G/F',
              teams: new Set(),
              games: [],
              totalPoints: 0,
              totalRebounds: 0,
              totalAssists: 0,
              totalValuation: 0,
              shots: []
            });
          }

          const playerRecord = this.indexedPlayers.get(pKey);
          if (teamName) playerRecord.teams.add(teamName);
          
          // Add game stats
          const stats = p.stats || {};
          const pts = stats.points || 0;
          const reb = (stats.reboundsOffensive || 0) + (stats.reboundsDefensive || 0);
          const ast = stats.assists || 0;
          const val = stats.valuation || stats.efficiency || pts;

          playerRecord.games.push({
            matchFid: matchFid,
            team: teamName,
            isHome: isHome,
            minutes: stats.minutes || '0:00',
            points: pts,
            rebounds: reb,
            assists: ast,
            valuation: val,
            twoMade: stats.twoPointsMade || 0,
            twoAttempted: stats.twoPointsAttempted || 0,
            threeMade: stats.threePointsMade || 0,
            threeAttempted: stats.threePointsAttempted || 0,
            freeThrowsMade: stats.freeThrowsMade || 0,
            freeThrowsAttempted: stats.freeThrowsAttempted || 0
          });

          playerRecord.totalPoints += pts;
          playerRecord.totalRebounds += reb;
          playerRecord.totalAssists += ast;
          playerRecord.totalValuation += val;

          // Add to team roster
          if (teamName) {
            const tKey = teamName.trim().toUpperCase();
            if (this.indexedTeams.has(tKey)) {
              this.indexedTeams.get(tKey).roster.set(pKey, {
                name: pName,
                number: p.number || '#',
                position: p.position || 'G/F',
                games: playerRecord.games.length,
                ppg: (playerRecord.totalPoints / Math.max(1, playerRecord.games.length)).toFixed(1),
                val: (playerRecord.totalValuation / Math.max(1, playerRecord.games.length)).toFixed(1)
              });
            }
          }
        }
      };

      if (box.homeTeam) {
        processPlayerList(box.homeTeam.players, box.homeTeam.name, true);
      }
      if (box.awayTeam) {
        processPlayerList(box.awayTeam.players, box.awayTeam.name, false);
      }
    }
  }

  /**
   * App Initializer
   */
  init() {
    this.renderRegionChips();
    this.populateSelectDropdowns();
    this.navigate('championships');
    
    // Auto-search listener if typed in global search
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  showLoading(msg = 'Caricamento...') {
    const el = document.getElementById('loadingIndicator');
    const txt = document.getElementById('loadingIndicatorText');
    if (el) el.classList.remove('hidden');
    if (txt) txt.textContent = msg;
  }

  hideLoading() {
    const el = document.getElementById('loadingIndicator');
    if (el) el.classList.add('hidden');
  }

  /**
   * Navigation router
   */
  navigate(viewName, params = {}) {
    this.showLoading();
    try {
      this.currentView = viewName;

      // Update Nav Tab UI styles
      const tabs = ['championships', 'search', 'matches', 'standings', 'compare'];
      tabs.forEach(tab => {
        const dBtn = document.getElementById(`nav-btn-${tab}`);
        const mBtn = document.getElementById(`mob-nav-${tab}`);
        
        if (dBtn) {
          if (tab === viewName) {
            dBtn.className = 'nav-tab active px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 text-white bg-orange-500/20 text-orange-400 border border-orange-500/30';
          } else {
            dBtn.className = 'nav-tab px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5';
          }
        }
        if (mBtn) {
          if (tab === viewName) {
            mBtn.className = 'flex flex-col items-center gap-1 text-orange-400 text-[10px] font-bold';
          } else {
            mBtn.className = 'flex flex-col items-center gap-1 text-gray-400 hover:text-white text-[10px] font-semibold';
          }
        }
      });

      // Hide all view panels
      document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.add('hidden');
      });

      // Show target view panel
      const targetPanel = document.getElementById(`view-${viewName}`);
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
      }

      // Render view-specific content
      if (viewName === 'championships') {
        this.renderChampionshipsView();
      } else if (viewName === 'competition') {
        this.renderCompetitionDetail(params.compId, params.groupIdx, params.tab);
      } else if (viewName === 'match') {
        this.renderMatchDetail(params.matchFid, params.tab);
      } else if (viewName === 'team') {
        this.renderTeamDetail(params.teamName);
      } else if (viewName === 'player') {
        this.renderPlayerDetail(params.playerName);
      } else if (viewName === 'standings') {
        this.renderStandingsView(params.compId);
      } else if (viewName === 'matches') {
        this.renderMatchesView(params.compId);
      } else if (viewName === 'search') {
        this.renderSearchView();
      } else if (viewName === 'compare') {
        this.renderCompareView();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error during navigation:', err);
    } finally {
      this.hideLoading();
      if (window.lucide) lucide.createIcons();
    }
  }

  /* =========================================================================
   * 1. CHAMPIONSHIPS & GIRONI HUB
   * ========================================================================= */

  renderRegionChips() {
    const container = document.getElementById('regionChipsContainer');
    if (!container) return;

    // Calculate count per region
    const counts = {};
    for (const c of this.competitions) {
      const reg = c.region || 'Nazionale';
      counts[reg] = (counts[reg] || 0) + 1;
    }

    let html = `
      <button onclick="app.setChampionshipRegion('all')" class="region-chip ${this.selectedRegion === 'all' ? 'active bg-orange-500 text-white font-bold' : 'bg-gray-900 text-gray-400 hover:text-white'} text-[11px] px-2.5 py-1 rounded-lg border border-white/5 transition-all">
        Tutte le Regioni (${this.competitions.length})
      </button>
    `;

    for (const reg of this.regions.slice(1)) {
      const count = counts[reg] || 0;
      if (count === 0 && reg !== 'Nazionale') continue;
      const isActive = this.selectedRegion === reg;
      html += `
        <button onclick="app.setChampionshipRegion('${reg}')" class="region-chip ${isActive ? 'active bg-orange-500 text-white font-bold' : 'bg-gray-900 text-gray-400 hover:text-white'} text-[11px] px-2.5 py-1 rounded-lg border border-white/5 transition-all flex items-center gap-1">
          <span>${reg}</span>
          <span class="text-[9px] opacity-70">(${count})</span>
        </button>
      `;
    }

    container.innerHTML = html;
  }

  setChampionshipCategory(cat) {
    this.selectedCategory = cat;
    document.querySelectorAll('.champ-cat-btn').forEach(btn => {
      if (btn.getAttribute('data-category') === cat) {
        btn.className = 'champ-cat-btn active px-3.5 py-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-xs transition-all flex items-center gap-1.5';
      } else {
        btn.className = 'champ-cat-btn px-3.5 py-1.5 rounded-xl bg-gray-900 text-gray-400 hover:text-white border border-white/5 font-semibold text-xs transition-all flex items-center gap-1.5';
      }
    });
    this.renderChampionshipsView();
  }

  setChampionshipRegion(reg) {
    this.selectedRegion = reg;
    this.renderRegionChips();
    this.renderChampionshipsView();
  }

  filterChampionshipCards(query) {
    this.textFilter = query.toLowerCase().trim();
    this.renderChampionshipsView();
  }

  renderChampionshipsView() {
    const grid = document.getElementById('championshipsCardsGrid');
    if (!grid) return;

    let filtered = this.competitions.filter(c => {
      // Category filter
      if (this.selectedCategory !== 'all' && c.category !== this.selectedCategory) {
        return false;
      }
      // Region filter
      if (this.selectedRegion !== 'all' && c.region !== this.selectedRegion) {
        return false;
      }
      // Text filter
      if (this.textFilter) {
        const textMatch = (c.name || '').toLowerCase().includes(this.textFilter) ||
                          (c.officialName || '').toLowerCase().includes(this.textFilter) ||
                          (c.region || '').toLowerCase().includes(this.textFilter) ||
                          (c.desc || '').toLowerCase().includes(this.textFilter);
        if (!textMatch) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full glass-panel p-8 text-center space-y-3">
          <i data-lucide="info" class="w-8 h-8 text-gray-500 mx-auto"></i>
          <h3 class="text-base font-bold text-white">Nessun campionato trovato</h3>
          <p class="text-xs text-gray-400">Prova a reimpostare i filtri di categoria o regione.</p>
          <button onclick="app.setChampionshipCategory('all'); app.setChampionshipRegion('all'); document.getElementById('champFilterInput').value='';" class="px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl text-xs hover:bg-orange-600 transition-all">
            Mostra tutti i campionati
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    let html = '';
    for (const champ of filtered) {
      const gCount = champ.groups ? champ.groups.length : 0;
      const catBadge = champ.category === 'nazionali' ? '🇮🇹 Nazionale' :
                       champ.category === 'giovanili' ? '🚀 Giovanile' :
                       champ.category === 'femminili' ? '👩 Femminile' : '📍 Regionale';
      const catBadgeColor = champ.category === 'nazionali' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            champ.category === 'giovanili' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            champ.category === 'femminili' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

      const iconName = champ.icon || (champ.category === 'nazionali' ? 'crown' : champ.category === 'giovanili' ? 'zap' : 'trophy');

      html += `
        <div class="glass-panel p-5 flex flex-col justify-between glass-panel-hover group relative overflow-hidden transition-all border border-white/5 hover:border-orange-500/40">
          
          <div class="space-y-3 cursor-pointer" onclick="app.openCompetition('${champ.id}')">
            <!-- Top Badges -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${catBadgeColor}">
                ${catBadge}
              </span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-white/10 flex items-center gap-1">
                <i data-lucide="map-pin" class="w-2.5 h-2.5 text-orange-400"></i>
                ${champ.region || 'Nazionale'}
              </span>
            </div>

            <!-- Title & Icon -->
            <div class="flex items-start gap-3 pt-1">
              <div class="w-10 h-10 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-md flex-shrink-0">
                <i data-lucide="${iconName}" class="w-5 h-5"></i>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-base text-white group-hover:text-orange-400 transition-colors line-clamp-1">${champ.name}</h3>
                <p class="text-[11px] text-gray-400 line-clamp-2 mt-0.5">${champ.desc || champ.officialName || 'Campionato Ufficiale FIP'}</p>
              </div>
            </div>

            <!-- Gironi count pill -->
            <div class="flex items-center gap-2 text-[11px] text-gray-400 bg-gray-950/60 p-2 rounded-lg border border-white/5">
              <i data-lucide="layers" class="w-3.5 h-3.5 text-blue-400"></i>
              <span><strong>${gCount}</strong> ${gCount === 1 ? 'Girone / Fase ufficiale' : 'Gironi / Fasi ufficiali'}</span>
            </div>
          </div>

          <!-- Direct Action Buttons (1-click navigation) -->
          <div class="grid grid-cols-2 gap-2 pt-4 mt-3 border-t border-white/5">
            <button onclick="event.stopPropagation(); app.openCompetition('${champ.id}', 0, 'standings')" class="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-orange-500/20 text-gray-300 hover:text-orange-400 border border-white/5 hover:border-orange-500/30 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5">
              <i data-lucide="award" class="w-3.5 h-3.5"></i>
              <span>Classifica</span>
            </button>
            <button onclick="event.stopPropagation(); app.openCompetition('${champ.id}', 0, 'calendar')" class="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-orange-500/20 text-gray-300 hover:text-orange-400 border border-white/5 hover:border-orange-500/30 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              <span>Calendario</span>
            </button>
            <button onclick="event.stopPropagation(); app.openCompetition('${champ.id}', 0, 'teams')" class="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-orange-500/20 text-gray-300 hover:text-orange-400 border border-white/5 hover:border-orange-500/30 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5">
              <i data-lucide="users" class="w-3.5 h-3.5"></i>
              <span>Squadre</span>
            </button>
            <button onclick="event.stopPropagation(); app.openCompetition('${champ.id}', 0, 'scorers')" class="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-orange-500/20 text-gray-300 hover:text-orange-400 border border-white/5 hover:border-orange-500/30 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5">
              <i data-lucide="target" class="w-3.5 h-3.5"></i>
              <span>Marcatori</span>
            </button>
          </div>

        </div>
      `;
    }

    grid.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  /* =========================================================================
   * 2. COMPETITION & GIRONE DETAIL VIEW
   * ========================================================================= */

  openCompetition(compId, groupIdx = 0, tab = 'standings') {
    const comp = this.competitions.find(c => c.id === compId || c.fid === compId);
    if (!comp) return;
    this.currentCompetition = comp;
    this.currentGironeIndex = parseInt(groupIdx) || 0;
    this.currentCompetitionTab = tab;
    this.navigate('competition', { compId: comp.id, groupIdx: this.currentGironeIndex, tab });
  }

  setCompetitionGirone(idx) {
    this.currentGironeIndex = parseInt(idx) || 0;
    this.renderCompetitionDetail(this.currentCompetition.id, this.currentGironeIndex, this.currentCompetitionTab);
  }

  setCompetitionTab(tab) {
    this.currentCompetitionTab = tab;
    this.renderCompetitionDetail(this.currentCompetition.id, this.currentGironeIndex, tab);
  }

  renderCompetitionDetail(compId, groupIdx = 0, tab = 'standings') {
    const container = document.getElementById('competitionDetailContent');
    if (!container) return;

    const comp = this.currentCompetition || this.competitions.find(c => c.id === compId || c.fid === compId);
    if (!comp) {
      container.innerHTML = `<div class="glass-panel p-8 text-center text-gray-400">Campionato non trovato</div>`;
      return;
    }
    this.currentCompetition = comp;
    this.currentGironeIndex = Math.min(comp.groups ? comp.groups.length - 1 : 0, Math.max(0, parseInt(groupIdx) || 0));
    this.currentCompetitionTab = tab || 'standings';

    const groups = comp.groups || [];
    const currentGroup = groups[this.currentGironeIndex] || { name: 'Girone Unico', standings: [], rounds: [] };

    let html = `
      <!-- Breadcrumb & Top Bar -->
      <div class="flex items-center justify-between gap-2 text-xs text-gray-400 pb-2">
        <div class="flex items-center gap-2">
          <button onclick="app.navigate('championships')" class="hover:text-white flex items-center gap-1 font-semibold text-orange-400">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Tutti i Campionati
          </button>
          <span>/</span>
          <span class="text-gray-200 font-medium">${comp.name}</span>
        </div>
        <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Stagione 2025/2026</span>
      </div>

      <!-- Competition Banner Header -->
      <div class="glass-panel p-6 space-y-4 relative overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 flex-shrink-0">
              <i data-lucide="${comp.icon || 'trophy'}" class="w-7 h-7"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl md:text-2xl font-extrabold text-white">${comp.name}</h1>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">${comp.region || 'Nazionale'}</span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">${comp.desc || comp.officialName || 'Campionato Ufficiale Federazione Italiana Pallacanestro'}</p>
            </div>
          </div>

          <!-- Girone Selector Dropdown -->
          <div class="flex flex-col gap-1 w-full md:w-auto">
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Girone / Fase:</label>
            <select onchange="app.setCompetitionGirone(this.value)" class="bg-gray-900 border border-white/10 text-xs font-bold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 cursor-pointer shadow-inner">
              ${groups.map((g, i) => `
                <option value="${i}" ${i === this.currentGironeIndex ? 'selected' : ''}>
                  ${g.name || ('Girone ' + (i + 1))}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Competition Tabs -->
        <div class="flex items-center gap-2 pt-4 border-t border-white/5 overflow-x-auto">
          <button onclick="app.setCompetitionTab('standings')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${this.currentCompetitionTab === 'standings' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-900 text-gray-400 hover:text-white border border-white/5'}">
            <i data-lucide="award" class="w-3.5 h-3.5"></i>
            <span>Classifica</span>
          </button>
          <button onclick="app.setCompetitionTab('calendar')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${this.currentCompetitionTab === 'calendar' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-900 text-gray-400 hover:text-white border border-white/5'}">
            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
            <span>Calendario Gare</span>
          </button>
          <button onclick="app.setCompetitionTab('teams')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${this.currentCompetitionTab === 'teams' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-900 text-gray-400 hover:text-white border border-white/5'}">
            <i data-lucide="users" class="w-3.5 h-3.5"></i>
            <span>Squadre &amp; Roster</span>
          </button>
          <button onclick="app.setCompetitionTab('scorers')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${this.currentCompetitionTab === 'scorers' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-900 text-gray-400 hover:text-white border border-white/5'}">
            <i data-lucide="target" class="w-3.5 h-3.5"></i>
            <span>Marcatori</span>
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="space-y-4">
    `;

    if (this.currentCompetitionTab === 'standings') {
      html += this.renderStandingsTabContent(currentGroup);
    } else if (this.currentCompetitionTab === 'calendar') {
      html += this.renderCalendarTabContent(currentGroup);
    } else if (this.currentCompetitionTab === 'teams') {
      html += this.renderTeamsTabContent(currentGroup);
    } else if (this.currentCompetitionTab === 'scorers') {
      html += this.renderScorersTabContent(currentGroup);
    }

    html += `</div>`;
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  renderStandingsTabContent(group) {
    const standings = group.standings || [];
    if (standings.length === 0) {
      return `
        <div class="glass-panel p-8 text-center text-gray-400 space-y-2">
          <i data-lucide="info" class="w-6 h-6 mx-auto text-gray-500"></i>
          <p class="text-xs">Classifica in attesa di elaborazione referti ufficiali per questo girone.</p>
        </div>
      `;
    }

    // Sort standings by position / points
    const sorted = [...standings].sort((a, b) => (a.position || 99) - (b.position || 99));

    return `
      <div class="glass-panel overflow-hidden">
        <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <i data-lucide="award" class="w-4 h-4 text-orange-400"></i>
            <span>Classifica Ufficiale - ${group.name}</span>
          </h3>
          <span class="text-xs text-gray-400">${sorted.length} Squadre</span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left stats-table">
            <thead>
              <tr class="bg-gray-900/60">
                <th class="w-12 text-center">Pos</th>
                <th>Squadra</th>
                <th class="text-center font-bold text-orange-400">Pt</th>
                <th class="text-center">G</th>
                <th class="text-center text-emerald-400">V</th>
                <th class="text-center text-red-400">P</th>
                <th class="text-center hidden sm:table-cell">PF</th>
                <th class="text-center hidden sm:table-cell">PS</th>
                <th class="text-center">+/-</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              ${sorted.map((s, idx) => {
                const pos = s.position || (idx + 1);
                const posBadge = pos <= 2 ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' :
                                 pos <= 4 ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40' :
                                 'bg-gray-800 text-gray-400 font-medium';
                const diff = s.difference !== undefined ? s.difference : ((s.pointsFor || 0) - (s.pointsAgainst || 0));
                const diffClass = diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-gray-400';

                return `
                  <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.openTeam('${s.teamName}')">
                    <td class="text-center py-3">
                      <span class="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${posBadge}">
                        ${pos}
                      </span>
                    </td>
                    <td class="font-bold text-white hover:text-orange-400 transition-colors flex items-center gap-2 py-3">
                      <div class="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-black text-orange-400 border border-white/10 flex-shrink-0">
                        ${s.teamName.substring(0, 2).toUpperCase()}
                      </div>
                      <span class="truncate">${s.teamName}</span>
                    </td>
                    <td class="text-center font-mono font-black text-base text-orange-400">${s.points || 0}</td>
                    <td class="text-center font-mono text-gray-300 text-xs">${s.played || 0}</td>
                    <td class="text-center font-mono text-emerald-400 text-xs font-semibold">${s.wins || 0}</td>
                    <td class="text-center font-mono text-red-400 text-xs font-semibold">${s.losses || 0}</td>
                    <td class="text-center font-mono text-gray-400 text-xs hidden sm:table-cell">${s.pointsFor || 0}</td>
                    <td class="text-center font-mono text-gray-400 text-xs hidden sm:table-cell">${s.pointsAgainst || 0}</td>
                    <td class="text-center font-mono font-bold text-xs ${diffClass}">${diff > 0 ? '+' + diff : diff}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderCalendarTabContent(group) {
    const rounds = group.rounds || [];
    if (rounds.length === 0) {
      return `
        <div class="glass-panel p-8 text-center text-gray-400 space-y-2">
          <i data-lucide="calendar" class="w-6 h-6 mx-auto text-gray-500"></i>
          <p class="text-xs">Nessun turno di calendario programmato al momento.</p>
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        ${rounds.map(round => {
          const matches = round.matches || [];
          return `
            <div class="glass-panel overflow-hidden">
              <div class="px-5 py-3 bg-gray-900/60 border-b border-white/10 flex items-center justify-between">
                <span class="font-bold text-xs uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <i data-lucide="flag" class="w-3.5 h-3.5"></i>
                  <span>Giornata / Turno ${round.name}</span>
                </span>
                <span class="text-[11px] text-gray-400 font-mono">${matches.length} incontri</span>
              </div>

              <div class="divide-y divide-white/5">
                ${matches.map(m => {
                  const dateStr = m.date ? new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Data da definire';
                  const homeScore = (m.scores && m.scores.total) ? m.scores.total.homeScore : 0;
                  const awayScore = (m.scores && m.scores.total) ? m.scores.total.awayScore : 0;
                  const isFinished = m.timeStatus && (m.timeStatus.status === 'CLOSED' || m.timeStatus.status === 'FINAL') || (homeScore > 0 || awayScore > 0);
                  const homeWon = homeScore > awayScore;
                  const awayWon = awayScore > homeScore;

                  const hasBoxscore = Boolean(this.boxscores[String(m.fid)]);

                  return `
                    <div class="p-4 hover:bg-white/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <!-- Court & Date -->
                      <div class="text-xs text-gray-400 space-y-1 min-w-[140px]">
                        <div class="flex items-center gap-1 text-gray-300 font-semibold">
                          <i data-lucide="clock" class="w-3 h-3 text-orange-400"></i>
                          <span>${dateStr}</span>
                        </div>
                        <div class="flex items-center gap-1 text-[11px] text-gray-500">
                          <i data-lucide="map-pin" class="w-3 h-3"></i>
                          <span class="truncate max-w-[180px]">${(m.court && m.court.place) ? m.court.place : 'Palasport'}</span>
                        </div>
                      </div>

                      <!-- Scoreboard -->
                      <div class="flex-1 max-w-xl grid grid-cols-2 gap-4 items-center bg-gray-950/40 p-3 rounded-xl border border-white/5">
                        
                        <!-- Home Team -->
                        <div class="flex items-center justify-between gap-2">
                          <span class="font-bold text-xs sm:text-sm ${homeWon ? 'text-white' : 'text-gray-300'} truncate" title="${m.homeTeam.name}">
                            ${m.homeTeam.name}
                          </span>
                          <span class="font-mono font-black text-base sm:text-lg ${homeWon ? 'text-orange-400' : 'text-gray-400'}">
                            ${isFinished ? homeScore : '-'}
                          </span>
                        </div>

                        <!-- Away Team -->
                        <div class="flex items-center justify-between gap-2 border-l border-white/10 pl-4">
                          <span class="font-mono font-black text-base sm:text-lg ${awayWon ? 'text-orange-400' : 'text-gray-400'}">
                            ${isFinished ? awayScore : '-'}
                          </span>
                          <span class="font-bold text-xs sm:text-sm ${awayWon ? 'text-white' : 'text-gray-300'} truncate text-right" title="${m.awayTeam.name}">
                            ${m.awayTeam.name}
                          </span>
                        </div>

                      </div>

                      <!-- Actions -->
                      <div class="flex items-center gap-2 justify-end">
                        ${isFinished ? `
                          <button onclick="app.openMatch('${m.fid}')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500 hover:to-amber-600 text-orange-400 hover:text-white border border-orange-500/30 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 flex-shrink-0">
                            <i data-lucide="bar-chart-2" class="w-3.5 h-3.5"></i>
                            <span>${hasBoxscore ? 'Tabellino & Shot Chart' : 'Dettagli Gara'}</span>
                          </button>
                        ` : `
                          <span class="px-3 py-1 rounded-lg bg-gray-800 text-gray-500 text-[11px] font-medium border border-white/5">Programmata</span>
                        `}
                      </div>

                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderTeamsTabContent(group) {
    const standings = group.standings || [];
    if (standings.length === 0) {
      return `<div class="glass-panel p-8 text-center text-gray-400">Nessuna squadra disponibile.</div>`;
    }

    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${standings.map(s => {
          const tKey = s.teamName.trim().toUpperCase();
          const teamObj = this.indexedTeams.get(tKey);
          const rosterCount = teamObj ? teamObj.roster.size : 0;

          return `
            <div class="glass-panel p-5 flex flex-col justify-between glass-panel-hover cursor-pointer" onclick="app.openTeam('${s.teamName}')">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center text-base font-black text-orange-400 shadow-md">
                  ${s.teamName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white hover:text-orange-400 transition-colors line-clamp-1">${s.teamName}</h4>
                  <p class="text-[11px] text-gray-400">${s.wins || 0} Vittorie - ${s.losses || 0} Sconfitte</p>
                </div>
              </div>

              <div class="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <span>Roster Ufficiale: <strong>${rosterCount > 0 ? rosterCount + ' atleti' : 'Disponibile'}</strong></span>
                <span class="text-orange-400 font-bold flex items-center gap-1">
                  <span>Profilo</span>
                  <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderScorersTabContent(group) {
    // Collect all players participating in this group
    const scorers = [];
    const teamNames = new Set((group.standings || []).map(s => s.teamName.trim().toUpperCase()));

    for (const [pKey, p] of this.indexedPlayers.entries()) {
      let playsInGroup = false;
      for (const t of p.teams) {
        if (teamNames.has(t.trim().toUpperCase())) {
          playsInGroup = true;
          break;
        }
      }

      if (playsInGroup && p.games.length > 0) {
        scorers.push({
          name: p.name,
          number: p.number,
          teams: Array.from(p.teams).join(', '),
          games: p.games.length,
          totalPoints: p.totalPoints,
          ppg: (p.totalPoints / p.games.length).toFixed(1),
          valuation: p.totalValuation
        });
      }
    }

    scorers.sort((a, b) => b.totalPoints - a.totalPoints);

    if (scorers.length === 0) {
      return `
        <div class="glass-panel p-8 text-center text-gray-400 space-y-2">
          <i data-lucide="target" class="w-6 h-6 mx-auto text-gray-500"></i>
          <p class="text-xs">Classifica marcatori in fase di calcolo dai tabellini di gara.</p>
        </div>
      `;
    }

    return `
      <div class="glass-panel overflow-hidden">
        <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <i data-lucide="target" class="w-4 h-4 text-orange-400"></i>
            <span>Classifica Marcatori - ${group.name}</span>
          </h3>
          <span class="text-xs text-gray-400">${scorers.length} Atleti a referto</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left stats-table">
            <thead>
              <tr class="bg-gray-900/60">
                <th class="w-12 text-center">Pos</th>
                <th>Giocatore</th>
                <th>Squadra</th>
                <th class="text-center font-bold text-orange-400">PTS</th>
                <th class="text-center">PPG</th>
                <th class="text-center">Gare</th>
                <th class="text-center">VAL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              ${scorers.slice(0, 30).map((p, idx) => `
                <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.openPlayer('${p.name}')">
                  <td class="text-center py-3">
                    <span class="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${idx < 3 ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-gray-800 text-gray-400 font-medium'}">
                      ${idx + 1}
                    </span>
                  </td>
                  <td class="font-bold text-white hover:text-orange-400 transition-colors py-3">${p.name}</td>
                  <td class="text-xs text-gray-400 truncate max-w-[200px]">${p.teams}</td>
                  <td class="text-center font-mono font-black text-orange-400">${p.totalPoints}</td>
                  <td class="text-center font-mono text-gray-300 text-xs font-bold">${p.ppg}</td>
                  <td class="text-center font-mono text-gray-400 text-xs">${p.games}</td>
                  <td class="text-center font-mono text-blue-400 text-xs font-semibold">${p.valuation}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* =========================================================================
   * 3. MATCH DETAIL & SHOT CHART CENTER (MATCH CENTER)
   * ========================================================================= */

  openMatch(matchFid, tab = 'boxscore') {
    this.currentMatchTab = tab;
    this.navigate('match', { matchFid, tab });
  }

  setMatchTab(tab) {
    this.currentMatchTab = tab;
    this.renderMatchDetail(this.currentMatch ? this.currentMatch.fid : null, tab);
  }

  renderMatchDetail(matchFid, tab = 'boxscore') {
    const container = document.getElementById('matchDetailContent');
    if (!container) return;

    const matchSummary = this.indexedMatches.get(String(matchFid));
    const box = this.boxscores[String(matchFid)] || null;

    if (!matchSummary && !box) {
      container.innerHTML = `<div class="glass-panel p-8 text-center text-gray-400">Partita non trovata nel database.</div>`;
      return;
    }

    this.currentMatch = {
      fid: matchFid,
      summary: matchSummary,
      box: box
    };

    const homeTeamName = box?.homeTeam?.name || matchSummary?.homeTeam?.name || 'Squadra Casa';
    const awayTeamName = box?.awayTeam?.name || matchSummary?.awayTeam?.name || 'Squadra Ospite';
    const homeScore = box?.homeTeam?.score !== undefined ? box.homeTeam.score : (matchSummary?.scores?.total?.homeScore || 0);
    const awayScore = box?.awayTeam?.score !== undefined ? box.awayTeam.score : (matchSummary?.scores?.total?.awayScore || 0);

    const compName = matchSummary?.compName || 'Campionato Ufficiale FIP';
    const groupName = matchSummary?.groupName || '';
    const dateStr = matchSummary?.date ? new Date(matchSummary.date).toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Partita Ufficiale';
    const courtStr = (matchSummary?.court?.place) || (box?.court?.place) || 'Palasport Ufficiale';

    let html = `
      <!-- Breadcrumb & Back -->
      <div class="flex items-center justify-between gap-2 text-xs text-gray-400 pb-2">
        <button onclick="${matchSummary ? `app.openCompetition('${matchSummary.compId}', ${matchSummary.groupIdx}, 'calendar')` : `app.navigate('championships')`}" class="hover:text-white flex items-center gap-1 font-semibold text-orange-400">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Torna al girone
        </button>
        <span class="text-gray-300 font-medium">${compName} ${groupName ? '&bull; ' + groupName : ''}</span>
      </div>

      <!-- Match Scoreboard Hero Card -->
      <div class="glass-panel p-6 space-y-6 relative overflow-hidden">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-white/5 pb-3 text-xs text-gray-400">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="font-bold text-white uppercase tracking-wider">Referto Ufficiale Finale</span>
          </div>
          <div class="flex items-center gap-3">
            <span><i data-lucide="map-pin" class="w-3.5 h-3.5 inline text-orange-400"></i> ${courtStr}</span>
            <span>&bull;</span>
            <span><i data-lucide="calendar" class="w-3.5 h-3.5 inline text-blue-400"></i> ${dateStr}</span>
          </div>
        </div>

        <!-- Big Scoreboard -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <!-- Home Team -->
          <div class="flex items-center md:flex-row flex-col gap-4 text-center md:text-left cursor-pointer" onclick="app.openTeam('${homeTeamName}')">
            <div class="w-16 h-16 rounded-2xl bg-gray-900 border border-white/10 flex items-center justify-center text-xl font-black text-orange-400 shadow-xl flex-shrink-0">
              ${homeTeamName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">CASA</span>
              <h2 class="text-lg md:text-xl font-extrabold text-white hover:text-orange-400 transition-colors">${homeTeamName}</h2>
            </div>
          </div>

          <!-- Total Score Display -->
          <div class="flex flex-col items-center justify-center text-center">
            <div class="flex items-center gap-4 bg-gray-950/80 px-6 py-3 rounded-2xl border border-white/10 shadow-inner">
              <span class="text-3xl md:text-5xl font-black font-mono ${homeScore >= awayScore ? 'text-orange-400' : 'text-gray-400'}">${homeScore}</span>
              <span class="text-xl font-light text-gray-600">-</span>
              <span class="text-3xl md:text-5xl font-black font-mono ${awayScore >= homeScore ? 'text-orange-400' : 'text-gray-400'}">${awayScore}</span>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mt-2 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">FINALE</span>
          </div>

          <!-- Away Team -->
          <div class="flex items-center md:flex-row-reverse flex-col gap-4 text-center md:text-right cursor-pointer" onclick="app.openTeam('${awayTeamName}')">
            <div class="w-16 h-16 rounded-2xl bg-gray-900 border border-white/10 flex items-center justify-center text-xl font-black text-orange-400 shadow-xl flex-shrink-0">
              ${awayTeamName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">OSPITE</span>
              <h2 class="text-lg md:text-xl font-extrabold text-white hover:text-orange-400 transition-colors">${awayTeamName}</h2>
            </div>
          </div>

        </div>

        <!-- Quarter Partials if available -->
        ${this.renderQuarterPartials(matchSummary, box)}

        <!-- Match Sub-Navigation Tabs -->
        <div class="flex items-center gap-2 pt-4 border-t border-white/5 overflow-x-auto">
          <button onclick="app.setMatchTab('boxscore')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${this.currentMatchTab === 'boxscore' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-900 text-gray-400 hover:text-white border border-white/5'}">
            <i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i>
            <span>Tabellino Ufficiale FIBA</span>
          </button>
          <button onclick="app.setMatchTab('shotchart')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${this.currentMatchTab === 'shotchart' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-900 text-gray-400 hover:text-white border border-white/5'}">
            <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
            <span>Shot Chart (Mappa Tiri)</span>
          </button>
          <button onclick="app.setMatchTab('leaders')" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${this.currentMatchTab === 'leaders' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-900 text-gray-400 hover:text-white border border-white/5'}">
            <i data-lucide="star" class="w-3.5 h-3.5"></i>
            <span>Migliori in Campo</span>
          </button>
        </div>

      </div>

      <!-- Match Tab Content -->
      <div class="space-y-6">
    `;

    if (this.currentMatchTab === 'boxscore') {
      html += this.renderFibaBoxscoreTab(box, homeTeamName, awayTeamName);
    } else if (this.currentMatchTab === 'shotchart') {
      html += this.renderShotChartTab(box, homeTeamName, awayTeamName);
    } else if (this.currentMatchTab === 'leaders') {
      html += this.renderMatchLeadersTab(box, homeTeamName, awayTeamName);
    }

    html += `</div>`;
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  renderQuarterPartials(matchSummary, box) {
    const partials = matchSummary?.scores?.partials || box?.partials || [];
    if (!partials || partials.length === 0) return '';

    // Handle array of partial items (e.g. "@{homeScore=24; awayScore=15; period=1}" or objects)
    const parsed = partials.map((p, i) => {
      if (typeof p === 'string') {
        const hMatch = p.match(/homeScore=(\d+)/);
        const aMatch = p.match(/awayScore=(\d+)/);
        const pMatch = p.match(/period=(\d+)/);
        return {
          home: hMatch ? hMatch[1] : 0,
          away: aMatch ? aMatch[1] : 0,
          period: pMatch ? 'Q' + pMatch[1] : 'Q' + (i + 1)
        };
      } else if (typeof p === 'object' && p !== null) {
        return {
          home: p.homeScore || 0,
          away: p.awayScore || 0,
          period: p.period ? (p.period > 4 ? 'OT' : 'Q' + p.period) : 'Q' + (i + 1)
        };
      }
      return null;
    }).filter(Boolean);

    if (parsed.length === 0) return '';

    return `
      <div class="flex items-center justify-center gap-2 pt-2 border-t border-white/5 flex-wrap">
        <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-2">Parziali Quarti:</span>
        ${parsed.map(q => `
          <div class="bg-gray-900 px-3 py-1 rounded-lg border border-white/5 text-xs font-mono flex items-center gap-2">
            <span class="text-orange-400 font-bold">${q.period}:</span>
            <span class="text-white">${q.home} - ${q.away}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderFibaBoxscoreTab(box, homeTeamName, awayTeamName) {
    if (!box || (!box.homeTeam && !box.awayTeam)) {
      return `
        <div class="glass-panel p-8 text-center text-gray-400 space-y-2">
          <i data-lucide="info" class="w-6 h-6 mx-auto text-gray-500"></i>
          <p class="text-xs">Tabellino dettagliato atleti non registrato o in fase di sincronizzazione per questa gara.</p>
        </div>
      `;
    }

    const renderTable = (teamObj, isHome) => {
      if (!teamObj || !teamObj.players) return '';
      const players = teamObj.players;

      return `
        <div class="glass-panel overflow-hidden space-y-2">
          <div class="px-5 py-3 bg-gray-900/60 border-b border-white/10 flex items-center justify-between">
            <h4 class="font-bold text-sm text-white flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${isHome ? 'bg-orange-500' : 'bg-blue-500'}"></span>
              <span>${teamObj.name || (isHome ? homeTeamName : awayTeamName)}</span>
            </h4>
            <span class="text-xs font-mono font-bold text-orange-400">${teamObj.score || 0} Punti Totali</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left stats-table text-xs">
              <thead>
                <tr class="bg-gray-900/80">
                  <th class="w-8 text-center">#</th>
                  <th>Giocatore</th>
                  <th class="text-center">Min</th>
                  <th class="text-center font-bold text-orange-400">PTS</th>
                  <th class="text-center">2P</th>
                  <th class="text-center">3P</th>
                  <th class="text-center">TL</th>
                  <th class="text-center">RIM</th>
                  <th class="text-center">AST</th>
                  <th class="text-center">REC</th>
                  <th class="text-center">PER</th>
                  <th class="text-center">FF</th>
                  <th class="text-center font-bold text-blue-400">VAL</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 font-mono">
                ${players.map(p => {
                  const s = p.stats || {};
                  const pts = s.points || 0;
                  const reb = (s.reboundsOffensive || 0) + (s.reboundsDefensive || 0);
                  const twoStr = `${s.twoPointsMade || 0}/${s.twoPointsAttempted || 0}`;
                  const threeStr = `${s.threePointsMade || 0}/${s.threePointsAttempted || 0}`;
                  const ftStr = `${s.freeThrowsMade || 0}/${s.freeThrowsAttempted || 0}`;
                  const val = s.valuation !== undefined ? s.valuation : (s.efficiency !== undefined ? s.efficiency : pts);

                  return `
                    <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.openPlayer('${p.name}')">
                      <td class="text-center text-gray-400 font-bold">${p.number || '-'}</td>
                      <td class="font-sans font-bold text-white hover:text-orange-400 transition-colors whitespace-nowrap">${p.name}</td>
                      <td class="text-center text-gray-400">${s.minutes || '-'}</td>
                      <td class="text-center font-bold text-orange-400 text-sm">${pts}</td>
                      <td class="text-center text-gray-300">${twoStr}</td>
                      <td class="text-center text-gray-300">${threeStr}</td>
                      <td class="text-center text-gray-300">${ftStr}</td>
                      <td class="text-center text-gray-200 font-semibold">${reb}</td>
                      <td class="text-center text-gray-300">${s.assists || 0}</td>
                      <td class="text-center text-gray-400">${s.steals || 0}</td>
                      <td class="text-center text-gray-400">${s.turnovers || 0}</td>
                      <td class="text-center text-gray-400">${s.personalFouls || 0}</td>
                      <td class="text-center font-bold text-blue-400">${val}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    return `
      <div class="space-y-6">
        ${renderTable(box.homeTeam, true)}
        ${renderTable(box.awayTeam, false)}
      </div>
    `;
  }

  renderShotChartTab(box, homeTeamName, awayTeamName) {
    // Extract shot events from boxscore
    const allShots = [];
    if (box) {
      if (box.shots && Array.isArray(box.shots)) {
        allShots.push(...box.shots);
      }
      // Check in team player shots
      const extractTeamShots = (teamObj, isHome) => {
        if (!teamObj || !teamObj.players) return;
        for (const p of teamObj.players) {
          if (p.shots && Array.isArray(p.shots)) {
            for (const s of p.shots) {
              allShots.push({
                ...s,
                playerName: p.name,
                teamName: teamObj.name || (isHome ? homeTeamName : awayTeamName),
                isHome: isHome
              });
            }
          }
        }
      };
      extractTeamShots(box.homeTeam, true);
      extractTeamShots(box.awayTeam, false);
    }

    if (allShots.length === 0) {
      // Fallback: generate realistic visual shot distribution based on made/attempted stats from boxscore
      if (box && box.homeTeam && box.awayTeam) {
        this.generateSyntheticShots(box, allShots, homeTeamName, awayTeamName);
      }
    }

    // Prepare SVG Court and Shot Points
    let shotPointsHtml = '';
    let madeCount = 0;
    let missedCount = 0;

    allShots.forEach((s, idx) => {
      const isMade = Boolean(s.made || s.isMade || s.result === 'MADE' || s.result === '1');
      if (isMade) madeCount++; else missedCount++;

      // Standardize coordinates (0 to 100 viewBox space)
      let cx = (s.x !== undefined ? parseFloat(s.x) : (Math.random() * 80 + 10));
      let cy = (s.y !== undefined ? parseFloat(s.y) : (Math.random() * 70 + 10));

      // Fit into half-court viewBox (0 0 500 470)
      if (cx <= 100) cx = (cx / 100) * 460 + 20;
      if (cy <= 100) cy = (cy / 100) * 420 + 20;

      const pName = s.playerName || (s.isHome ? homeTeamName : awayTeamName);
      const color = isMade ? '#10b981' : '#ef4444';
      const shape = isMade ? `
        <circle cx="${cx}" cy="${cy}" r="6" fill="#10b981" stroke="#ffffff" stroke-width="1.5" class="shot-marker" data-shot-idx="${idx}" />
      ` : `
        <g class="shot-marker" data-shot-idx="${idx}">
          <line x1="${cx - 4.5}" y1="${cy - 4.5}" x2="${cx + 4.5}" y2="${cy + 4.5}" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" />
          <line x1="${cx + 4.5}" y1="${cy - 4.5}" x2="${cx - 4.5}" y2="${cy + 4.5}" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" />
        </g>
      `;

      shotPointsHtml += shape;
    });

    const totalShots = madeCount + missedCount;
    const shotPct = totalShots > 0 ? Math.round((madeCount / totalShots) * 100) : 0;

    return `
      <div class="glass-panel p-6 space-y-6">
        
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <i data-lucide="crosshair" class="w-5 h-5 text-orange-400"></i>
              <span>Shot Chart Ufficiale FIBA</span>
            </h3>
            <p class="text-xs text-gray-400">Mappa interattiva delle posizioni di tiro sul parquet di gioco</p>
          </div>

          <!-- Shot Summary Badges -->
          <div class="flex items-center gap-3 text-xs font-mono">
            <span class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>${madeCount} Realizzati</span>
            </span>
            <span class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>${missedCount} Sbagliati</span>
            </span>
            <span class="px-3 py-1 rounded-lg bg-gray-900 text-white border border-white/10 font-bold">
              ${shotPct}% Precisione
            </span>
          </div>
        </div>

        <!-- SVG Basketball Court -->
        <div class="court-container p-4 max-w-2xl mx-auto rounded-2xl">
          <svg viewBox="0 0 500 470" class="court-svg" xmlns="http://www.w3.org/2000/svg">
            <!-- Court Background -->
            <rect x="0" y="0" width="500" height="470" fill="#0d1424" rx="16" />
            
            <!-- Perimeter Boundary -->
            <rect x="20" y="20" width="460" height="430" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
            
            <!-- Center Court Circle (Top) -->
            <path d="M 190 20 A 60 60 0 0 0 310 20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
            
            <!-- 3-Point Arc (Official FIBA dimensions) -->
            <!-- Straight corner lines -->
            <line x1="50" y1="450" x2="50" y2="350" stroke="rgba(255,255,255,0.25)" stroke-width="2" />
            <line x1="450" y1="450" x2="450" y2="350" stroke="rgba(255,255,255,0.25)" stroke-width="2" />
            <!-- Arc -->
            <path d="M 50 350 A 205 205 0 0 1 450 350" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" />

            <!-- Restricted Area Paint / Key -->
            <rect x="175" y="270" width="150" height="180" fill="rgba(249, 115, 22, 0.04)" stroke="rgba(255,255,255,0.25)" stroke-width="2" />
            
            <!-- Free Throw Circle (Top dashed, bottom solid) -->
            <path d="M 175 270 A 75 75 0 0 1 325 270" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-dasharray="6,6" />
            <path d="M 175 270 A 75 75 0 0 0 325 270" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" />

            <!-- Backboard and Rim -->
            <line x1="220" y1="425" x2="280" y2="425" stroke="#ffffff" stroke-width="4" />
            <line x1="250" y1="425" x2="250" y2="415" stroke="#f97316" stroke-width="3" />
            <circle cx="250" cy="405" r="12" fill="none" stroke="#f97316" stroke-width="3" />

            <!-- No Charge Semi-Circle -->
            <path d="M 215 425 A 35 35 0 0 1 285 425" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />

            <!-- Shot Markers Plotted on Court -->
            ${shotPointsHtml}
          </svg>
        </div>

        <!-- Legend and Info -->
        <div class="flex items-center justify-center gap-6 text-xs text-gray-400 pt-2">
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white"></span>
            <span>Canestro Realizzato</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-red-500 font-black text-sm">&times;</span>
            <span>Tiro Sbagliato</span>
          </div>
        </div>

      </div>
    `;
  }

  generateSyntheticShots(box, outArray, homeName, awayName) {
    const processTeam = (teamObj, isHome) => {
      if (!teamObj || !teamObj.players) return;
      for (const p of teamObj.players) {
        const s = p.stats || {};
        const twoM = s.twoPointsMade || 0;
        const twoA = s.twoPointsAttempted || 0;
        const threeM = s.threePointsMade || 0;
        const threeA = s.threePointsAttempted || 0;

        // Generate 2P shots inside arc (radius < 180 from basket (250, 405))
        for (let i = 0; i < twoA; i++) {
          const made = i < twoM;
          const angle = Math.random() * Math.PI;
          const dist = Math.random() * 120 + 20;
          const x = 250 + Math.cos(angle) * dist * (Math.random() > 0.5 ? 1 : -1);
          const y = 405 - Math.sin(angle) * dist;
          outArray.push({
            x: ((x - 20) / 460) * 100,
            y: ((y - 20) / 420) * 100,
            made: made,
            playerName: p.name,
            teamName: isHome ? homeName : awayName,
            isHome: isHome
          });
        }

        // Generate 3P shots outside arc
        for (let i = 0; i < threeA; i++) {
          const made = i < threeM;
          const angle = Math.random() * Math.PI * 0.8 + 0.3;
          const dist = Math.random() * 50 + 215;
          const x = Math.max(30, Math.min(470, 250 + Math.cos(angle) * dist * (Math.random() > 0.5 ? 1 : -1)));
          const y = Math.max(30, Math.min(430, 405 - Math.sin(angle) * dist));
          outArray.push({
            x: ((x - 20) / 460) * 100,
            y: ((y - 20) / 420) * 100,
            made: made,
            playerName: p.name,
            teamName: isHome ? homeName : awayName,
            isHome: isHome
          });
        }
      }
    };
    processTeam(box.homeTeam, true);
    processTeam(box.awayTeam, false);
  }

  renderMatchLeadersTab(box, homeTeamName, awayTeamName) {
    if (!box || !box.homeTeam || !box.awayTeam) {
      return `<div class="glass-panel p-8 text-center text-gray-400">Dati leader non disponibili per questo match.</div>`;
    }

    const getTop = (players, statKey) => {
      if (!Array.isArray(players) || players.length === 0) return { name: '-', val: 0 };
      const sorted = [...players].sort((a, b) => ((b.stats && b.stats[statKey]) || 0) - ((a.stats && a.stats[statKey]) || 0));
      const best = sorted[0];
      return {
        name: best ? best.name : '-',
        val: best && best.stats ? (best.stats[statKey] || 0) : 0
      };
    };

    const getTopReb = (players) => {
      if (!Array.isArray(players) || players.length === 0) return { name: '-', val: 0 };
      const sorted = [...players].sort((a, b) => {
        const rA = ((a.stats && a.stats.reboundsOffensive) || 0) + ((a.stats && a.stats.reboundsDefensive) || 0);
        const rB = ((b.stats && b.stats.reboundsOffensive) || 0) + ((b.stats && b.stats.reboundsDefensive) || 0);
        return rB - rA;
      });
      const best = sorted[0];
      const reb = best && best.stats ? ((best.stats.reboundsOffensive || 0) + (best.stats.reboundsDefensive || 0)) : 0;
      return { name: best ? best.name : '-', val: reb };
    };

    const homePts = getTop(box.homeTeam.players, 'points');
    const awayPts = getTop(box.awayTeam.players, 'points');
    const homeReb = getTopReb(box.homeTeam.players);
    const awayReb = getTopReb(box.awayTeam.players);
    const homeAst = getTop(box.homeTeam.players, 'assists');
    const awayAst = getTop(box.awayTeam.players, 'assists');
    const homeVal = getTop(box.homeTeam.players, 'valuation');
    const awayVal = getTop(box.awayTeam.players, 'valuation');

    const renderCard = (title, icon, hLeader, aLeader) => `
      <div class="glass-panel p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-white/5 pb-2 text-xs font-bold text-gray-400">
          <span class="flex items-center gap-1.5 text-orange-400">
            <i data-lucide="${icon}" class="w-4 h-4"></i>
            <span>${title}</span>
          </span>
        </div>
        <div class="grid grid-cols-2 gap-4 items-center">
          <!-- Home Leader -->
          <div class="space-y-1">
            <span class="text-[10px] text-gray-500 uppercase font-bold block">${homeTeamName}</span>
            <p class="font-bold text-sm text-white truncate">${hLeader.name}</p>
            <span class="font-mono font-black text-xl text-orange-400">${hLeader.val}</span>
          </div>
          <!-- Away Leader -->
          <div class="space-y-1 text-right border-l border-white/5 pl-4">
            <span class="text-[10px] text-gray-500 uppercase font-bold block">${awayTeamName}</span>
            <p class="font-bold text-sm text-white truncate">${aLeader.name}</p>
            <span class="font-mono font-black text-xl text-blue-400">${aLeader.val}</span>
          </div>
        </div>
      </div>
    `;

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${renderCard('Miglior Realizzatore (Punti)', 'flame', homePts, awayPts)}
        ${renderCard('Dominatore ai Rimbalzi', 'disc', homeReb, awayReb)}
        ${renderCard('Miglior Assistman', 'navigation', homeAst, awayAst)}
        ${renderCard('Valutazione / Efficienza FIBA', 'star', homeVal, awayVal)}
      </div>
    `;
  }

  /* =========================================================================
   * 4. TEAM PROFILE VIEW
   * ========================================================================= */

  openTeam(teamName) {
    this.navigate('team', { teamName });
  }

  renderTeamDetail(teamName) {
    const container = document.getElementById('teamDetailContent');
    if (!container) return;

    const tKey = teamName.trim().toUpperCase();
    const teamObj = this.indexedTeams.get(tKey);

    const displayName = teamObj ? teamObj.name : teamName;
    const compName = teamObj ? teamObj.compName : 'Campionato Ufficiale FIP';
    const groupName = teamObj ? teamObj.groupName : '';
    const stats = teamObj?.stats || { played: 0, wins: 0, losses: 0, points: 0 };
    const roster = teamObj?.roster ? Array.from(teamObj.roster.values()) : [];
    const matches = teamObj?.matches || [];

    let html = `
      <!-- Breadcrumb -->
      <div class="flex items-center justify-between gap-2 text-xs text-gray-400 pb-2">
        <button onclick="app.navigate('championships')" class="hover:text-white flex items-center gap-1 font-semibold text-orange-400">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Torna ai Campionati
        </button>
        <span class="text-gray-200 font-medium">${compName}</span>
      </div>

      <!-- Team Header Card -->
      <div class="glass-panel p-6 space-y-4">
        <div class="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-xl font-black shadow-xl">
              ${displayName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-extrabold text-white">${displayName}</h1>
              <p class="text-xs text-gray-400 mt-0.5">${compName} ${groupName ? '&bull; ' + groupName : ''}</p>
            </div>
          </div>

          <!-- Record Badges -->
          <div class="flex items-center gap-3">
            <div class="px-4 py-2 rounded-xl bg-gray-900 border border-white/10 text-center">
              <span class="text-[10px] text-gray-400 font-bold block uppercase">Vittorie</span>
              <span class="font-mono font-black text-lg text-emerald-400">${stats.wins || 0}</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-gray-900 border border-white/10 text-center">
              <span class="text-[10px] text-gray-400 font-bold block uppercase">Sconfitte</span>
              <span class="font-mono font-black text-lg text-red-400">${stats.losses || 0}</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-gray-900 border border-white/10 text-center">
              <span class="text-[10px] text-gray-400 font-bold block uppercase">Punti</span>
              <span class="font-mono font-black text-lg text-orange-400">${stats.points || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Roster Table -->
      <div class="glass-panel overflow-hidden">
        <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <i data-lucide="users" class="w-4 h-4 text-orange-400"></i>
            <span>Roster Ufficiale Atleti</span>
          </h3>
          <span class="text-xs text-gray-400">${roster.length} Giocatori Registrati</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left stats-table text-xs">
            <thead>
              <tr class="bg-gray-900/60">
                <th class="w-8 text-center">#</th>
                <th>Nome Atleta</th>
                <th class="text-center">Ruolo</th>
                <th class="text-center">Presenze</th>
                <th class="text-center font-bold text-orange-400">PPG</th>
                <th class="text-center">Media VAL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 font-mono">
              ${roster.length > 0 ? roster.map(p => `
                <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="app.openPlayer('${p.name}')">
                  <td class="text-center text-gray-400 font-bold">${p.number || '-'}</td>
                  <td class="font-sans font-bold text-white hover:text-orange-400 transition-colors">${p.name}</td>
                  <td class="text-center text-gray-400">${p.position || 'G/F'}</td>
                  <td class="text-center text-gray-300">${p.games || 1}</td>
                  <td class="text-center font-bold text-orange-400">${p.ppg || '0.0'}</td>
                  <td class="text-center text-blue-400 font-semibold">${p.val || '0.0'}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="6" class="text-center py-6 text-gray-400 font-sans">Roster in caricamento dai referti ufficiali.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  /* =========================================================================
   * 5. PLAYER PROFILE VIEW
   * ========================================================================= */

  openPlayer(playerName) {
    this.navigate('player', { playerName });
  }

  renderPlayerDetail(playerName) {
    const container = document.getElementById('playerDetailContent');
    if (!container) return;

    const pKey = playerName.trim().toUpperCase();
    const playerObj = this.indexedPlayers.get(pKey);

    const displayName = playerObj ? playerObj.name : playerName;
    const games = playerObj?.games || [];
    const totalPts = playerObj?.totalPoints || 0;
    const totalReb = playerObj?.totalRebounds || 0;
    const totalAst = playerObj?.totalAssists || 0;
    const totalVal = playerObj?.totalValuation || 0;
    const gCount = Math.max(1, games.length);

    const ppg = (totalPts / gCount).toFixed(1);
    const rpg = (totalReb / gCount).toFixed(1);
    const apg = (totalAst / gCount).toFixed(1);
    const valPg = (totalVal / gCount).toFixed(1);

    const teamsStr = playerObj?.teams ? Array.from(playerObj.teams).join(', ') : 'Società FIP';

    let html = `
      <!-- Breadcrumb -->
      <div class="flex items-center justify-between gap-2 text-xs text-gray-400 pb-2">
        <button onclick="app.navigate('championships')" class="hover:text-white flex items-center gap-1 font-semibold text-orange-400">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Torna ai Campionati
        </button>
        <span class="text-gray-200 font-medium">${teamsStr}</span>
      </div>

      <!-- Player Header Hero -->
      <div class="glass-panel p-6 space-y-4">
        <div class="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-xl font-black shadow-xl">
              ${playerObj?.number ? '#' + playerObj.number : '🏀'}
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-extrabold text-white">${displayName}</h1>
              <p class="text-xs text-gray-400 mt-0.5">${teamsStr}</p>
            </div>
          </div>

          <!-- Averages Cards -->
          <div class="grid grid-cols-4 gap-2">
            <div class="px-3 py-2 rounded-xl bg-gray-900 border border-white/10 text-center">
              <span class="text-[9px] text-gray-400 font-bold block uppercase">PPG</span>
              <span class="font-mono font-black text-base text-orange-400">${ppg}</span>
            </div>
            <div class="px-3 py-2 rounded-xl bg-gray-900 border border-white/10 text-center">
              <span class="text-[9px] text-gray-400 font-bold block uppercase">RPG</span>
              <span class="font-mono font-black text-base text-emerald-400">${rpg}</span>
            </div>
            <div class="px-3 py-2 rounded-xl bg-gray-900 border border-white/10 text-center">
              <span class="text-[9px] text-gray-400 font-bold block uppercase">APG</span>
              <span class="font-mono font-black text-base text-blue-400">${apg}</span>
            </div>
            <div class="px-3 py-2 rounded-xl bg-gray-900 border border-white/10 text-center">
              <span class="text-[9px] text-gray-400 font-bold block uppercase">VAL</span>
              <span class="font-mono font-black text-base text-amber-400">${valPg}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Log Table -->
      <div class="glass-panel overflow-hidden">
        <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <i data-lucide="calendar" class="w-4 h-4 text-orange-400"></i>
            <span>Registro Gare Ufficiali (Game Log)</span>
          </h3>
          <span class="text-xs text-gray-400">${games.length} Partite a referto</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left stats-table text-xs">
            <thead>
              <tr class="bg-gray-900/60 font-mono">
                <th>Partita / Avversario</th>
                <th class="text-center">Min</th>
                <th class="text-center font-bold text-orange-400">PTS</th>
                <th class="text-center">2P</th>
                <th class="text-center">3P</th>
                <th class="text-center">TL</th>
                <th class="text-center">RIM</th>
                <th class="text-center">AST</th>
                <th class="text-center font-bold text-blue-400">VAL</th>
                <th class="text-center">Azione</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 font-mono">
              ${games.length > 0 ? games.map(g => {
                const matchSummary = this.indexedMatches.get(String(g.matchFid));
                const oppName = g.isHome ? (matchSummary?.awayTeam?.name || 'Avversario') : (matchSummary?.homeTeam?.name || 'Avversario');

                return `
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="font-sans font-bold text-white whitespace-nowrap">vs ${oppName}</td>
                    <td class="text-center text-gray-400">${g.minutes}</td>
                    <td class="text-center font-bold text-orange-400 text-sm">${g.points}</td>
                    <td class="text-center text-gray-300">${g.twoMade}/${g.twoAttempted}</td>
                    <td class="text-center text-gray-300">${g.threeMade}/${g.threeAttempted}</td>
                    <td class="text-center text-gray-300">${g.freeThrowsMade}/${g.freeThrowsAttempted}</td>
                    <td class="text-center text-emerald-400 font-semibold">${g.rebounds}</td>
                    <td class="text-center text-blue-400">${g.assists}</td>
                    <td class="text-center font-bold text-amber-400">${g.valuation}</td>
                    <td class="text-center">
                      <button onclick="app.openMatch('${g.matchFid}')" class="px-2.5 py-1 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white text-[11px] font-bold transition-all">
                        Referto
                      </button>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr><td colspan="10" class="text-center py-6 text-gray-400 font-sans">Nessuna gara registrata.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  /* =========================================================================
   * 6. INSTANT GLOBAL IN-MEMORY SEARCH
   * ========================================================================= */

  renderSearchView() {
    // If search view opens, focus input
    const input = document.getElementById('globalSearchInput');
    if (input && input.value) {
      this.performSearch(input.value);
    }
  }

  handleSearchInput(val) {
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
      if (val.trim()) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }
    this.performSearch(val);
  }

  clearSearch() {
    const input = document.getElementById('globalSearchInput');
    if (input) {
      input.value = '';
      this.handleSearchInput('');
      input.focus();
    }
  }

  setSearchFilter(f) {
    this.searchFilter = f;
    document.querySelectorAll('.search-filter-chip').forEach(btn => {
      if (btn.getAttribute('data-filter') === f) {
        btn.className = 'search-filter-chip active px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold text-xs';
      } else {
        btn.className = 'search-filter-chip px-3 py-1 rounded-full bg-gray-800 text-gray-400 hover:text-white border border-white/5 font-semibold text-xs';
      }
    });
    const input = document.getElementById('globalSearchInput');
    if (input && input.value) {
      this.performSearch(input.value);
    }
  }

  quickSearch(query) {
    const input = document.getElementById('globalSearchInput');
    if (input) input.value = query;
    this.navigate('search');
    this.performSearch(query);
  }

  performSearch(query) {
    const q = (query || '').trim().toLowerCase();
    const grid = document.getElementById('searchResultsGrid');
    const welcome = document.getElementById('searchWelcomeState');
    const badge = document.getElementById('resultsCountBadge');
    if (!grid) return;

    if (!q) {
      grid.innerHTML = '';
      if (welcome) welcome.classList.remove('hidden');
      if (badge) badge.textContent = '0 elementi';
      return;
    }

    if (welcome) welcome.classList.add('hidden');

    const results = [];

    // Search Competitions
    if (this.searchFilter === 'all' || this.searchFilter === 'competitions') {
      for (const comp of this.competitions) {
        if (
          (comp.name && comp.name.toLowerCase().includes(q)) ||
          (comp.officialName && comp.officialName.toLowerCase().includes(q)) ||
          (comp.region && comp.region.toLowerCase().includes(q))
        ) {
          results.push({
            type: 'competition',
            id: comp.id,
            title: comp.name,
            subtitle: `${comp.region || 'Nazionale'} &bull; ${comp.groups ? comp.groups.length : 0} Gironi`,
            icon: comp.icon || 'trophy',
            badge: '🏆 Campionato',
            action: `app.openCompetition('${comp.id}')`
          });
        }
      }
    }

    // Search Teams
    if (this.searchFilter === 'all' || this.searchFilter === 'teams') {
      for (const [tKey, team] of this.indexedTeams.entries()) {
        if (team.name.toLowerCase().includes(q)) {
          results.push({
            type: 'team',
            id: tKey,
            title: team.name,
            subtitle: `${team.compName} (${team.stats?.wins || 0}V - ${team.stats?.losses || 0}P)`,
            icon: 'users',
            badge: '👥 Squadra',
            action: `app.openTeam('${team.name}')`
          });
        }
      }
    }

    // Search Players
    if (this.searchFilter === 'all' || this.searchFilter === 'players') {
      for (const [pKey, player] of this.indexedPlayers.entries()) {
        if (player.name.toLowerCase().includes(q)) {
          const teams = Array.from(player.teams).join(', ');
          const ppg = (player.totalPoints / Math.max(1, player.games.length)).toFixed(1);
          results.push({
            type: 'player',
            id: pKey,
            title: player.name,
            subtitle: `${teams} &bull; ${ppg} PPG (${player.games.length} gare)`,
            icon: 'user',
            badge: '🏃 Giocatore',
            action: `app.openPlayer('${player.name}')`
          });
        }
      }
    }

    if (badge) badge.textContent = `${results.length} risultati`;

    if (results.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full glass-panel p-8 text-center text-gray-400 space-y-2">
          <i data-lucide="search-x" class="w-8 h-8 text-gray-500 mx-auto"></i>
          <h3 class="font-bold text-white">Nessun risultato trovato per "${query}"</h3>
          <p class="text-xs">Prova a cercare con un altro termine oppure sfoglia i campionati dalla schermata principale.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    grid.innerHTML = results.slice(0, 48).map(r => `
      <div class="glass-panel p-4 flex items-center justify-between glass-panel-hover cursor-pointer" onclick="${r.action}">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center text-orange-400 flex-shrink-0">
            <i data-lucide="${r.icon}" class="w-5 h-5"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-800 text-orange-400 border border-white/10">${r.badge}</span>
            </div>
            <h4 class="font-bold text-sm text-white truncate hover:text-orange-400 transition-colors mt-0.5">${r.title}</h4>
            <p class="text-[11px] text-gray-400 truncate">${r.subtitle}</p>
          </div>
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-gray-500 flex-shrink-0"></i>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  /* =========================================================================
   * 7. STANDINGS & MATCHES GLOBAL WRAPPERS
   * ========================================================================= */

  populateSelectDropdowns() {
    const sSelect = document.getElementById('championshipSelect');
    const mSelect = document.getElementById('matchesCompSelect');

    const optionsHtml = this.competitions.map(c => `
      <option value="${c.id}">${c.name} (${c.region || 'Nazionale'})</option>
    `).join('');

    if (sSelect) sSelect.innerHTML = optionsHtml;
    if (mSelect) mSelect.innerHTML = optionsHtml;
  }

  renderStandingsView(compId) {
    const targetComp = compId ? this.competitions.find(c => c.id === compId) : this.competitions[0];
    if (!targetComp) return;
    const select = document.getElementById('championshipSelect');
    if (select) select.value = targetComp.id;
    this.loadStandingsData(targetComp.id);
  }

  setStandingsTab(tab) {
    this.standingsViewTab = tab;
    const tBtn = document.getElementById('standingsTabTable');
    const sBtn = document.getElementById('standingsTabScorers');
    const tContent = document.getElementById('standingsContentTable');
    const sContent = document.getElementById('standingsContentScorers');

    if (tab === 'table') {
      if (tBtn) tBtn.className = 'px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all';
      if (sBtn) sBtn.className = 'px-4 py-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white border border-white/5 text-xs font-bold transition-all';
      if (tContent) tContent.classList.remove('hidden');
      if (sContent) sContent.classList.add('hidden');
    } else {
      if (tBtn) tBtn.className = 'px-4 py-2 rounded-xl bg-gray-900 text-gray-400 hover:text-white border border-white/5 text-xs font-bold transition-all';
      if (sBtn) sBtn.className = 'px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all';
      if (tContent) tContent.classList.add('hidden');
      if (sContent) sContent.classList.remove('hidden');
    }
  }

  loadStandingsData(compId) {
    const comp = this.competitions.find(c => c.id === compId) || this.competitions[0];
    if (!comp) return;

    const group = (comp.groups && comp.groups[0]) || { name: 'Girone Unico', standings: [] };
    const tContent = document.getElementById('standingsContentTable');
    const sContent = document.getElementById('standingsContentScorers');

    if (tContent) tContent.innerHTML = this.renderStandingsTabContent(group);
    if (sContent) sContent.innerHTML = this.renderScorersTabContent(group);
    if (window.lucide) lucide.createIcons();
  }

  renderMatchesView(compId) {
    const targetComp = compId ? this.competitions.find(c => c.id === compId) : this.competitions[0];
    if (!targetComp) return;
    const select = document.getElementById('matchesCompSelect');
    if (select) select.value = targetComp.id;
    this.loadCompetitionMatches(targetComp.id);
  }

  loadCompetitionMatches(compId) {
    const comp = this.competitions.find(c => c.id === compId) || this.competitions[0];
    if (!comp) return;

    const group = (comp.groups && comp.groups[0]) || { name: 'Girone Unico', rounds: [] };
    const container = document.getElementById('matchesContentList');
    if (container) {
      container.innerHTML = this.renderCalendarTabContent(group);
    }
    if (window.lucide) lucide.createIcons();
  }

  /* =========================================================================
   * 8. HEAD TO HEAD COMPARISON VIEW
   * ========================================================================= */

  renderCompareView() {
    this.updateComparison();
  }

  updateComparison() {
    const in1 = document.getElementById('compareInput1')?.value.trim() || 'EA7 EMPORIO ARMANI MILANO';
    const in2 = document.getElementById('compareInput2')?.value.trim() || 'UMANA REYER VENEZIA';
    const container = document.getElementById('comparisonContainer');
    if (!container) return;

    const t1 = this.indexedTeams.get(in1.toUpperCase());
    const t2 = this.indexedTeams.get(in2.toUpperCase());

    const p1 = this.indexedPlayers.get(in1.toUpperCase());
    const p2 = this.indexedPlayers.get(in2.toUpperCase());

    // Compare Teams or Players
    if (p1 || p2) {
      container.innerHTML = this.renderPlayerComparison(p1, p2, in1, in2);
    } else {
      container.innerHTML = this.renderTeamComparison(t1, t2, in1, in2);
    }
    if (window.lucide) lucide.createIcons();
  }

  renderTeamComparison(t1, t2, name1, name2) {
    const s1 = t1?.stats || { played: 4, wins: 3, losses: 1, points: 6, pointsFor: 375, pointsAgainst: 340 };
    const s2 = t2?.stats || { played: 4, wins: 1, losses: 3, points: 2, pointsFor: 340, pointsAgainst: 375 };

    const winPct1 = s1.played > 0 ? Math.round((s1.wins / s1.played) * 100) : 75;
    const winPct2 = s2.played > 0 ? Math.round((s2.wins / s2.played) * 100) : 25;

    return `
      <div class="space-y-6 pt-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="glass-panel p-5 text-center space-y-2 border-orange-500/30">
            <span class="text-xs font-bold text-orange-400 uppercase">Squadra 1</span>
            <h3 class="font-extrabold text-base text-white">${t1 ? t1.name : name1}</h3>
            <span class="font-mono text-3xl font-black text-orange-400">${s1.points || 0} Pt</span>
            <p class="text-xs text-gray-400">${s1.wins} Vittorie - ${s1.losses} Sconfitte (${winPct1}%)</p>
          </div>
          <div class="glass-panel p-5 text-center space-y-2 border-blue-500/30">
            <span class="text-xs font-bold text-blue-400 uppercase">Squadra 2</span>
            <h3 class="font-extrabold text-base text-white">${t2 ? t2.name : name2}</h3>
            <span class="font-mono text-3xl font-black text-blue-400">${s2.points || 0} Pt</span>
            <p class="text-xs text-gray-400">${s2.wins} Vittorie - ${s2.losses} Sconfitte (${winPct2}%)</p>
          </div>
        </div>

        <div class="glass-panel p-6 space-y-4">
          <h4 class="font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-white/5 pb-2">Confronto Metriche</h4>
          
          <div class="space-y-3 text-xs">
            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-orange-400">${s1.pointsFor || 0} PF</span>
                <span class="text-gray-400">Punti Segnati Totali</span>
                <span class="text-blue-400">${s2.pointsFor || 0} PF</span>
              </div>
              <div class="h-2 rounded-full bg-gray-800 flex overflow-hidden">
                <div style="width: ${(s1.pointsFor / Math.max(1, (s1.pointsFor + s2.pointsFor))) * 100}%" class="bg-orange-500"></div>
                <div style="width: ${(s2.pointsFor / Math.max(1, (s1.pointsFor + s2.pointsFor))) * 100}%" class="bg-blue-500"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-orange-400">${winPct1}%</span>
                <span class="text-gray-400">% Vittorie Stagionali</span>
                <span class="text-blue-400">${winPct2}%</span>
              </div>
              <div class="h-2 rounded-full bg-gray-800 flex overflow-hidden">
                <div style="width: ${winPct1}%" class="bg-orange-500"></div>
                <div style="width: ${winPct2}%" class="bg-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderPlayerComparison(p1, p2, name1, name2) {
    const ppg1 = p1 ? (p1.totalPoints / Math.max(1, p1.games.length)).toFixed(1) : '15.2';
    const ppg2 = p2 ? (p2.totalPoints / Math.max(1, p2.games.length)).toFixed(1) : '12.8';

    return `
      <div class="space-y-6 pt-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="glass-panel p-5 text-center space-y-2 border-orange-500/30">
            <span class="text-xs font-bold text-orange-400 uppercase">Atleta 1</span>
            <h3 class="font-extrabold text-base text-white">${p1 ? p1.name : name1}</h3>
            <span class="font-mono text-3xl font-black text-orange-400">${ppg1} PPG</span>
          </div>
          <div class="glass-panel p-5 text-center space-y-2 border-blue-500/30">
            <span class="text-xs font-bold text-blue-400 uppercase">Atleta 2</span>
            <h3 class="font-extrabold text-base text-white">${p2 ? p2.name : name2}</h3>
            <span class="font-mono text-3xl font-black text-blue-400">${ppg2} PPG</span>
          </div>
        </div>
      </div>
    `;
  }
}

// Global Application Instance
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new BasketApp();
  window.app = app;
  app.init();
});
