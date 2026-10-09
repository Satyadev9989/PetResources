/**
 * Pet Care Resources Platform - Main Application Logic
 * Modular controller managing Routing, LocalStorage sync, UI Rendering, and Interactivity.
 */

const App = {
  // Application State
  state: {
    currentTab: 'home',
    guideFilterCategory: 'all',
    guideFilterSpecies: 'all',
    guideSearchQuery: '',
    trackerFilterStatus: 'all',
    trackerFilterPet: 'all',
    adminFilterStatus: 'all',
    pendingConfirmAction: null
  },

  /**
   * Initializes the application, attaches event listeners, and renders initial views.
   */
  init() {
    this.setupRouter();
    this.setupEventListeners();
    this.refreshAllViews();
    this.setupToxicFoodDatabase();

    // Check URL hash on load
    const hash = window.location.hash.replace('#', '') || 'home';
    this.navigateTo(hash);
  },

  /* ==========================================================================
     ROUTING & TAB SWITCHING
     ========================================================================== */

  setupRouter() {
    // Listen for hash changes (browser back/forward button)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      this.switchTab(hash, false);
    });

    // Nav click handlers
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.navigateTo(tab);
      });
    });

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileIcon = document.getElementById('mobileMenuIcon');

    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
          mobileMenu.classList.remove('hidden');
          mobileIcon.classList.replace('fa-bars', 'fa-xmark');
        } else {
          mobileMenu.classList.add('hidden');
          mobileIcon.classList.replace('fa-xmark', 'fa-bars');
        }
      });
    }
  },

  navigateTo(tabName, options = {}) {
    window.location.hash = tabName;
    this.switchTab(tabName, true, options);
  },

  switchTab(tabName, updateHash = true, options = {}) {
    const validTabs = ['home', 'guides', 'tracker', 'profiles', 'admin'];
    const targetTab = validTabs.includes(tabName) ? tabName : 'home';
    this.state.currentTab = targetTab;

    if (updateHash && window.location.hash !== `#${targetTab}`) {
      window.location.hash = targetTab;
    }

    // Hide all view panels and display the active one
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`view-${targetTab}`);
    if (activePanel) {
      activePanel.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update Desktop Nav styles
    document.querySelectorAll('nav .nav-link').forEach(link => {
      const linkTab = link.getAttribute('data-tab');
      if (linkTab === targetTab) {
        link.className = 'nav-link px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 text-pink-600 bg-pink-50/90 shadow-xs border border-pink-100';
      } else {
        link.className = 'nav-link px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 text-slate-600 hover:text-pink-600 hover:bg-pink-50/60';
      }
    });

    // Update Mobile Nav styles
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      const linkTab = link.getAttribute('data-tab');
      if (linkTab === targetTab) {
        link.className = 'mobile-nav-link w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-pink-600 bg-pink-50 flex items-center gap-3';
      } else {
        link.className = 'mobile-nav-link w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-pink-50/60 flex items-center gap-3';
      }
    });

    // Auto-close mobile drawer
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileIcon = document.getElementById('mobileMenuIcon');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      if (mobileIcon) mobileIcon.classList.replace('fa-xmark', 'fa-bars');
    }

    // Handle view-specific actions
    if (targetTab === 'profiles' && options.openAddModal) {
      this.openAddPetModal();
    } else if (targetTab === 'tracker' && options.prefillPetId) {
      this.prefillTrackerWithPet(options.prefillPetId);
    }

    // Refresh view-specific rendering
    this.refreshAllViews();
  },

  /* ==========================================================================
     EVENT LISTENERS & FORM BINDINGS
     ========================================================================== */

  setupEventListeners() {
    // 1. Hero Search Input
    const heroInput = document.getElementById('heroSearchInput');
    const heroClear = document.getElementById('heroSearchClearBtn');
    if (heroInput) {
      heroInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (heroClear) {
          heroClear.classList.toggle('hidden', query.length === 0);
        }
        this.handleHeroSearch(query);
      });

      if (heroClear) {
        heroClear.addEventListener('click', () => {
          heroInput.value = '';
          heroClear.classList.add('hidden');
          this.handleHeroSearch('');
        });
      }
    }

    // 2. Guides View Filters
    const guidesSearch = document.getElementById('guidesSearchInput');
    if (guidesSearch) {
      guidesSearch.addEventListener('input', (e) => {
        this.state.guideSearchQuery = e.target.value.toLowerCase().trim();
        this.renderGuides();
      });
    }

    const speciesSelect = document.getElementById('guidesSpeciesSelect');
    if (speciesSelect) {
      speciesSelect.addEventListener('change', (e) => {
        this.state.guideFilterSpecies = e.target.value;
        this.renderGuides();
      });
    }

    // Guide category pills
    document.querySelectorAll('#guidesCategoryPills button').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const cat = e.currentTarget.getAttribute('data-cat');
        this.filterGuidesByCategory(cat);
      });
    });

    // 3. Pet Registration Form Submit & Species Photo Sync
    const petForm = document.getElementById('petForm');
    if (petForm) {
      petForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePetFormSubmit();
      });
    }

    const petSpeciesSelect = document.getElementById('petSpeciesSelect');
    if (petSpeciesSelect) {
      petSpeciesSelect.addEventListener('change', (e) => {
        const sp = e.target.value;
        if (typeof DEFAULT_SPECIES_PHOTOS !== 'undefined' && DEFAULT_SPECIES_PHOTOS[sp]) {
          this.selectPresetPhoto(DEFAULT_SPECIES_PHOTOS[sp]);
        }
      });
    }

    // 4. Vaccination Form Submit
    const vacForm = document.getElementById('addVaccineForm');
    if (vacForm) {
      vacForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddVaccineSubmit();
      });
    }

    // 5. Edit Vaccine Form Submit
    const editVacForm = document.getElementById('editVaccineForm');
    if (editVacForm) {
      editVacForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEditVaccineSubmit();
      });
    }

    // 6. Article Submission / Edit Form Submit
    const articleForm = document.getElementById('articleEditForm');
    if (articleForm) {
      articleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleArticleFormSubmit();
      });
    }

    // 7. Tracker Table Filters
    const trackerStatus = document.getElementById('trackerFilterStatus');
    if (trackerStatus) {
      trackerStatus.addEventListener('change', (e) => {
        this.state.trackerFilterStatus = e.target.value;
        this.renderVaccinesTable();
      });
    }

    const trackerPet = document.getElementById('trackerFilterPet');
    if (trackerPet) {
      trackerPet.addEventListener('change', (e) => {
        this.state.trackerFilterPet = e.target.value;
        this.renderVaccinesTable();
      });
    }

    // 8. Pet Selector in Tracker -> Updates Quick Vaccine Chips
    const petSelectInTracker = document.getElementById('vacPetSelect');
    if (petSelectInTracker) {
      petSelectInTracker.addEventListener('change', (e) => {
        const petId = e.target.value;
        this.updateQuickVaccineChips(petId);
      });
    }

    // 9. Close Modals on Backdrop Click or Escape Key
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.add('hidden');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
          modal.classList.add('hidden');
        });
      }
    });

    // 10. Confirmation Modal Handler
    const confirmCancelBtn = document.getElementById('confirmModalCancelBtn');
    if (confirmCancelBtn) {
      confirmCancelBtn.addEventListener('click', () => {
        this.closeModal('confirmModal');
        this.state.pendingConfirmAction = null;
      });
    }

    const confirmActionBtn = document.getElementById('confirmModalActionBtn');
    if (confirmActionBtn) {
      confirmActionBtn.addEventListener('click', () => {
        if (typeof this.state.pendingConfirmAction === 'function') {
          this.state.pendingConfirmAction();
        }
        this.closeModal('confirmModal');
        this.state.pendingConfirmAction = null;
      });
    }

    // 11. Food Checker Input
    const foodInput = document.getElementById('foodCheckInput');
    const foodClear = document.getElementById('foodCheckClear');
    if (foodInput) {
      foodInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (foodClear) {
          foodClear.classList.toggle('hidden', val.length === 0);
        }
        this.checkFoodItem(val);
      });

      if (foodClear) {
        foodClear.addEventListener('click', () => {
          foodInput.value = '';
          foodClear.classList.add('hidden');
          this.checkFoodItem('');
        });
      }
    }
  },

  /**
   * Refreshes all data views and counters synchronously
   */
  refreshAllViews() {
    this.renderHomeFeatured();
    this.updateHomeHealthBanner();
    this.renderGuides();
    this.renderPetProfiles();
    this.populatePetDropdowns();
    this.renderVaccinesTable();
    this.renderAdminArticles();
    this.updateGlobalMetrics();
  },

  /* ==========================================================================
     MODULE 1: HOME / SEARCH VIEW & WIDGETS
     ========================================================================== */

  handleHeroSearch(query) {
    const resultsBox = document.getElementById('heroSearchResultsBox');
    if (!resultsBox) return;

    if (!query) {
      resultsBox.classList.add('hidden');
      resultsBox.innerHTML = '';
      return;
    }

    const q = query.toLowerCase();
    const articles = StorageManager.getArticles().filter(a => a.status === 'Published');
    const pets = StorageManager.getPets();

    const matchedArticles = articles.filter(a => 
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
    );

    const matchedPets = pets.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q) ||
      (p.breed && p.breed.toLowerCase().includes(q))
    );

    if (matchedArticles.length === 0 && matchedPets.length === 0) {
      resultsBox.innerHTML = `
        <div class="p-4 text-center text-sm text-slate-500">
          <i class="fa-solid fa-circle-question text-slate-400 mr-1.5"></i>
          No matching care guides or pets found for "<strong>${this.escapeHtml(query)}</strong>".
        </div>
      `;
      resultsBox.classList.remove('hidden');
      return;
    }

    let html = '';

    // Matched Guides
    if (matchedArticles.length > 0) {
      html += `<div class="px-4 py-2 bg-pink-50/50 text-[11px] font-bold text-pink-500 uppercase tracking-wider">Care Guides (${matchedArticles.length})</div>`;
      matchedArticles.slice(0, 4).forEach(a => {
        html += `
          <div onclick="App.openArticleModal('${a.id}')" class="p-3.5 hover:bg-pink-50/60 cursor-pointer transition-colors flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold shrink-0">
                <i class="fa-solid fa-book-open"></i>
              </div>
              <div>
                <h5 class="text-sm font-bold text-slate-900">${this.escapeHtml(a.title)}</h5>
                <p class="text-xs text-slate-500 line-clamp-1">${this.escapeHtml(a.summary)}</p>
              </div>
            </div>
            <span class="text-xs text-pink-600 font-semibold px-2.5 py-0.5 bg-pink-50 rounded-lg shrink-0 ml-2">Read</span>
          </div>
        `;
      });
    }

    // Matched Pets
    if (matchedPets.length > 0) {
      html += `<div class="px-4 py-2 bg-pink-50/80 text-[11px] font-bold text-pink-700 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-heart text-pink-500 text-[10px]"></i> Registered Furry Family (${matchedPets.length})</div>`;
      matchedPets.slice(0, 3).forEach(p => {
        const petPic = p.photoUrl || (typeof DEFAULT_SPECIES_PHOTOS !== 'undefined' ? DEFAULT_SPECIES_PHOTOS[p.species] : 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=100&q=80');
        html += `
          <div onclick="App.navigateTo('profiles')" class="p-3.5 hover:bg-pink-50/60 cursor-pointer transition-colors flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="${petPic}" alt="${this.escapeHtml(p.name)}" class="w-10 h-10 rounded-xl object-cover ring-2 ring-pink-300 shadow-xs shrink-0" onerror="this.src='https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=100&q=80'" />
              <div>
                <h5 class="text-sm font-bold text-slate-900">${this.escapeHtml(p.name)} <span class="text-xs font-semibold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded-md ml-1">(${this.escapeHtml(p.breed || p.species)})</span></h5>
                <p class="text-xs text-slate-500">${p.ageText ? p.ageText : ''} • ${p.weight ? p.weight + ' kg' : ''}</p>
              </div>
            </div>
            <span class="text-xs text-pink-700 font-bold px-2.5 py-1 bg-pink-100/70 hover:bg-pink-200 rounded-lg shrink-0 ml-2">View Profile</span>
          </div>
        `;
      });
    }

    resultsBox.innerHTML = html;
    resultsBox.classList.remove('hidden');
  },

  updateHomeHealthBanner() {
    const banner = document.getElementById('homeVaccineStatusBanner');
    const title = document.getElementById('homeBannerTitle');
    const subtitle = document.getElementById('homeBannerSubtitle');
    if (!banner || !title || !subtitle) return;

    const vaccines = StorageManager.getVaccines();
    const overdue = vaccines.filter(v => v.status === 'Overdue');
    const upcoming = vaccines.filter(v => v.status === 'Upcoming');

    if (overdue.length > 0) {
      banner.className = 'bg-gradient-to-r from-rose-500/10 via-rose-50 to-pink-50 rounded-3xl p-6 border border-rose-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm';
      title.innerHTML = `<span class="text-rose-600 font-bold flex items-center gap-2"><i class="fa-solid fa-triangle-exclamation"></i> Immediate Health Action Required</span>`;
      subtitle.textContent = `You have ${overdue.length} overdue vaccination booster${overdue.length > 1 ? 's' : ''} for: ${overdue.map(v => v.petName + ' (' + v.vaccineName + ')').slice(0, 2).join(', ')}${overdue.length > 2 ? ' and more' : ''}.`;
    } else if (upcoming.length > 0) {
      banner.className = 'bg-gradient-to-r from-pink-100/80 via-rose-50/60 to-pink-50 rounded-3xl p-6 border border-pink-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm';
      title.innerHTML = `<span class="text-slate-900 font-bold flex items-center gap-2"><i class="fa-solid fa-calendar-check text-pink-500"></i> ${upcoming.length} Upcoming Vaccination Schedule${upcoming.length > 1 ? 's' : ''}</span>`;
      subtitle.textContent = `Next due: ${upcoming[0].petName}'s ${upcoming[0].vaccineName} on ${upcoming[0].dueDate}. All other records are compliant.`;
    } else {
      banner.className = 'bg-gradient-to-r from-emerald-500/10 via-pink-50/40 to-slate-50 rounded-3xl p-6 border border-emerald-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm';
      title.innerHTML = `<span class="text-emerald-700 font-bold flex items-center gap-2"><i class="fa-solid fa-shield-cat"></i> All Pet Immunizations Up to Date!</span>`;
      subtitle.textContent = `Great job! No overdue or pending vaccination boosters found. Your pets are fully protected.`;
    }
  },

  renderHomeFeatured() {
    const list = document.getElementById('homeFeaturedList');
    if (!list) return;

    const articles = StorageManager.getArticles()
      .filter(a => a.status === 'Published')
      .slice(0, 3);

    list.innerHTML = articles.map(art => `
      <div onclick="App.openArticleModal('${art.id}')" class="group bg-white p-4 sm:p-5 rounded-2xl border border-pink-100 hover:border-pink-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <img src="${art.image}" alt="${this.escapeHtml(art.title)}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-100 group-hover:scale-105 transition-transform" onerror="this.src='https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150&q=80'" />
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full ${this.getCategoryBadgeColor(art.category)}">${art.category}</span>
              <span class="text-xs text-slate-400"><i class="fa-regular fa-clock text-[10px]"></i> ${art.readTime}</span>
            </div>
            <h4 class="font-bold text-slate-900 group-hover:text-pink-600 transition-colors text-sm sm:text-base leading-snug">${this.escapeHtml(art.title)}</h4>
            <p class="text-xs text-slate-500 mt-1 line-clamp-1">${this.escapeHtml(art.summary)}</p>
          </div>
        </div>
        <div class="hidden sm:flex items-center text-pink-300 group-hover:text-pink-600 group-hover:translate-x-1 transition-all pl-2">
          <i class="fa-solid fa-chevron-right text-sm"></i>
        </div>
      </div>
    `).join('');
  },

  setupToxicFoodDatabase() {
    this.toxicDatabase = {
      'xylitol': { status: 'Lethal', text: 'EXTREME HAZARD: Xylitol (birch sugar in sugar-free gum, peanut butter) causes rapid life-threatening hypoglycemia and acute liver failure in dogs within 30 minutes.' },
      'chocolate': { status: 'Toxic', text: 'DANGEROUS: Theobromine and caffeine can trigger tachyarrhythmia, seizures, internal bleeding, and cardiac arrest. Dark chocolate is especially lethal.' },
      'grapes': { status: 'Lethal', text: 'FATAL: Grapes, raisins, and currants cause sudden acute kidney failure in dogs even in microscopic quantities.' },
      'raisins': { status: 'Lethal', text: 'FATAL: Concentrated grape compounds induce acute renal failure.' },
      'onions': { status: 'Toxic', text: 'TOXIC: Contains thiosulfate which oxidizes hemoglobin, causing severe hemolytic anemia in both dogs and cats.' },
      'garlic': { status: 'Toxic', text: 'TOXIC: About 5 times more toxic than onions per gram. Destroys red blood cells.' },
      'macadamia': { status: 'Toxic', text: 'TOXIC: Causes extreme canine weakness, hind limb tremors, hyperthermia, and vomiting.' },
      'avocado': { status: 'Caution', text: 'CAUTION: Contains persin, mildly toxic to dogs/cats, highly toxic to pet birds. Pit is also a choking hazard.' },
      'caffeine': { status: 'Lethal', text: 'DANGEROUS: Coffee, tea, energy drinks cause hyperactivity, palpitations, hypertension, and seizures.' },
      'alcohol': { status: 'Lethal', text: 'EXTREME: Even small sips cause ethanol poisoning, metabolic acidosis, hypothermia, and coma.' },
      'lily': { status: 'Lethal', text: '100% FATAL TO CATS: Even brushing against lily pollen causes catastrophic kidney necrosis.' },
      'pumpkin': { status: 'Safe', text: 'SAFE & BENEFICIAL: Plain cooked pumpkin is packed with fiber and soothes digestive upset in dogs and cats.' },
      'carrots': { status: 'Safe', text: 'SAFE: Raw or cooked carrots are low-calorie, vitamin-rich crunchy treats that clean teeth.' },
      'apples': { status: 'Safe', text: 'SAFE: Slices without seeds are rich in Vitamin C and fiber. (Remove apple seeds as they contain cyanide).' },
      'peanut butter': { status: 'Caution', text: 'CAUTION: Plain unsalted peanut butter is safe ONLY IF 100% free of Xylitol (birch sugar). Always check ingredients.' },
      'cheese': { status: 'Caution', text: 'CAUTION: Safe in small bites, but many adult pets are lactose intolerant. High fat can cause pancreatitis.' }
    };
  },

  checkFoodItem(query) {
    const input = document.getElementById('foodCheckInput');
    const resultBox = document.getElementById('foodCheckResult');
    if (!resultBox) return;

    if (input && input.value !== query) {
      input.value = query;
      const clearBtn = document.getElementById('foodCheckClear');
      if (clearBtn) clearBtn.classList.remove('hidden');
    }

    const q = query.toLowerCase().trim();
    if (!q) {
      resultBox.className = 'p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm';
      resultBox.innerHTML = `
        <div class="flex items-start gap-2.5 text-slate-500">
          <i class="fa-solid fa-circle-info text-indigo-500 mt-0.5"></i>
          <span>Try searching common pantry items like <strong>Onions</strong>, <strong>Xylitol</strong>, <strong>Peanut Butter</strong>, or <strong>Pumpkin</strong>.</span>
        </div>
      `;
      return;
    }

    const matchedKey = Object.keys(this.toxicDatabase).find(k => k.includes(q) || q.includes(k));
    if (matchedKey) {
      const item = this.toxicDatabase[matchedKey];
      let badge = '';
      let boxBg = '';

      if (item.status === 'Lethal') {
        boxBg = 'bg-rose-50 border-rose-200 text-rose-900';
        badge = '<span class="px-2 py-0.5 bg-rose-600 text-white font-extrabold text-xs rounded-md uppercase">Lethal / Emergency</span>';
      } else if (item.status === 'Toxic') {
        boxBg = 'bg-amber-50 border-amber-200 text-amber-900';
        badge = '<span class="px-2 py-0.5 bg-amber-600 text-white font-bold text-xs rounded-md uppercase">Toxic / Harmful</span>';
      } else if (item.status === 'Caution') {
        boxBg = 'bg-yellow-50 border-yellow-200 text-yellow-900';
        badge = '<span class="px-2 py-0.5 bg-yellow-500 text-white font-bold text-xs rounded-md uppercase">Caution / Check Label</span>';
      } else {
        boxBg = 'bg-emerald-50 border-emerald-200 text-emerald-900';
        badge = '<span class="px-2 py-0.5 bg-emerald-600 text-white font-bold text-xs rounded-md uppercase">Pet Safe</span>';
      }

      resultBox.className = `p-4 rounded-xl border ${boxBg} text-sm`;
      resultBox.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <strong class="capitalize font-extrabold text-base">${matchedKey}</strong>
          ${badge}
        </div>
        <p class="text-xs leading-relaxed opacity-90">${item.text}</p>
      `;
    } else {
      resultBox.className = 'p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm';
      resultBox.innerHTML = `
        <div class="flex items-start gap-2.5 text-slate-600">
          <i class="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5"></i>
          <div>
            <strong>"${this.escapeHtml(query)}" not found in quick database.</strong>
            <p class="text-xs text-slate-500 mt-1">When in doubt, never feed unknown processed foods or seasonings to pets. Consult ASPCA Animal Poison Control or your vet.</p>
          </div>
        </div>
      `;
    }
  },

  /* ==========================================================================
     MODULE 2: CARE GUIDES VIEW & MODAL READER
     ========================================================================== */

  filterGuidesByCategory(category) {
    this.state.guideFilterCategory = category;
    
    // Update active pill UI in Care Guides view
    document.querySelectorAll('#guidesCategoryPills button').forEach(pill => {
      const cat = pill.getAttribute('data-cat');
      if (cat === category || (category === 'all' && cat === 'all')) {
        pill.className = 'guide-filter-pill px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-pink-500 text-white shadow-sm';
      } else {
        pill.className = 'guide-filter-pill px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-slate-100 text-slate-700 hover:bg-pink-50 hover:text-pink-600';
      }
    });

    // If currently on another tab, switch to guides tab
    if (this.state.currentTab !== 'guides') {
      this.navigateTo('guides');
    } else {
      this.renderGuides();
    }
  },

  resetGuideFilters() {
    this.state.guideFilterCategory = 'all';
    this.state.guideFilterSpecies = 'all';
    this.state.guideSearchQuery = '';

    const searchInput = document.getElementById('guidesSearchInput');
    if (searchInput) searchInput.value = '';

    const speciesSelect = document.getElementById('guidesSpeciesSelect');
    if (speciesSelect) speciesSelect.value = 'all';

    this.filterGuidesByCategory('all');
  },

  renderGuides() {
    const grid = document.getElementById('guidesGrid');
    const emptyState = document.getElementById('guidesEmptyState');
    if (!grid || !emptyState) return;

    let articles = StorageManager.getArticles().filter(a => a.status === 'Published');

    // Filter by Category
    if (this.state.guideFilterCategory !== 'all') {
      articles = articles.filter(a => a.category === this.state.guideFilterCategory);
    }

    // Filter by Species
    if (this.state.guideFilterSpecies !== 'all') {
      articles = articles.filter(a => a.species === this.state.guideFilterSpecies || a.species === 'All Pets');
    }

    // Filter by Search Query
    if (this.state.guideSearchQuery) {
      const q = this.state.guideSearchQuery;
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (articles.length === 0) {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = articles.map(art => `
      <div class="group bg-white rounded-3xl border border-pink-100 hover:border-pink-300 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
        
        <!-- Article Image Banner -->
        <div class="relative h-48 overflow-hidden bg-pink-50">
          <img 
            src="${art.image}" 
            alt="${this.escapeHtml(art.title)}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            onerror="this.src='https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&q=80'" 
          />
          <div class="absolute top-3 left-3 flex items-center gap-1.5">
            <span class="px-3 py-1 rounded-full text-xs font-bold shadow-sm ${this.getCategoryBadgeColor(art.category)}">
              ${art.category}
            </span>
            ${art.featured ? '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500 text-white shadow-sm flex items-center gap-1"><i class="fa-solid fa-star text-[10px]"></i> Featured</span>' : ''}
          </div>
          <div class="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-medium">
            <i class="fa-regular fa-clock mr-1"></i> ${art.readTime}
          </div>
        </div>

        <!-- Article Card Body -->
        <div class="p-6 flex-grow flex flex-col justify-between">
          <div>
            <div class="text-[11px] font-bold text-pink-400 uppercase tracking-wider mb-1 flex items-center gap-2">
              <span>${art.species || 'All Pets'}</span>
              <span>•</span>
              <span class="text-pink-600 font-semibold">${art.difficulty || 'Essential'}</span>
            </div>
            <h3 class="font-extrabold text-slate-900 text-lg group-hover:text-pink-600 transition-colors leading-snug">
              ${this.escapeHtml(art.title)}
            </h3>
            <p class="text-slate-600 text-xs sm:text-sm mt-2 line-clamp-3 leading-relaxed">
              ${this.escapeHtml(art.summary)}
            </p>
          </div>

          <!-- Card Footer (Author & Action) -->
          <div class="pt-5 mt-5 border-t border-pink-50 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <img 
                src="${art.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80'}" 
                alt="${this.escapeHtml(art.author.name)}" 
                class="w-8 h-8 rounded-full object-cover border border-pink-100"
                onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80'"
              />
              <div>
                <div class="text-xs font-bold text-slate-800 leading-none">${this.escapeHtml(art.author.name)}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">${this.escapeHtml(art.author.role || 'Veterinary Contributor')}</div>
              </div>
            </div>

            <button onclick="App.openArticleModal('${art.id}')" class="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
              Read Guide <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>

        </div>

      </div>
    `).join('');
  },

  openArticleModal(articleId) {
    const article = StorageManager.getArticles().find(a => a.id === articleId);
    if (!article) return;

    const modalContent = document.getElementById('articleReaderContent');
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="space-y-6">
        <!-- Header Info -->
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-bold ${this.getCategoryBadgeColor(article.category)}">${article.category}</span>
            <span class="text-xs text-slate-500 font-medium"><i class="fa-regular fa-clock mr-1"></i> ${article.readTime}</span>
            <span class="text-xs text-slate-400">•</span>
            <span class="text-xs text-slate-500 font-medium">Published on ${article.createdAt}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">${this.escapeHtml(article.title)}</h2>
          <p class="text-base text-slate-600 font-medium mt-2 leading-relaxed">${this.escapeHtml(article.summary)}</p>
        </div>

        <!-- Featured Banner Image -->
        <div class="rounded-2xl overflow-hidden border border-pink-100 max-h-80">
          <img src="${article.image}" alt="${this.escapeHtml(article.title)}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80'" />
        </div>

        <!-- Author Byline Card -->
        <div class="p-4 rounded-2xl bg-pink-50/40 border border-pink-100/70 flex items-center gap-3">
          <img src="${article.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80'}" class="w-12 h-12 rounded-full object-cover border border-pink-100" />
          <div>
            <div class="text-sm font-bold text-slate-900">${this.escapeHtml(article.author.name)}</div>
            <div class="text-xs text-slate-500">${this.escapeHtml(article.author.role || 'Clinical Contributor')}</div>
            <div class="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <i class="fa-solid fa-circle-check text-[10px]"></i> Board Verified Article
            </div>
          </div>
        </div>

        <!-- Article Rich Content -->
        <div class="prose max-w-none text-slate-700 leading-relaxed border-t border-pink-50 pt-6">
          ${article.content || `<p>${this.escapeHtml(article.summary)}</p>`}
        </div>

        <!-- Article Tags -->
        ${article.tags && article.tags.length > 0 ? `
          <div class="pt-4 border-t border-pink-50 flex flex-wrap items-center gap-1.5">
            <span class="text-xs text-slate-400 font-bold mr-1">Tags:</span>
            ${article.tags.map(t => `<span class="text-xs px-2.5 py-1 bg-pink-50 rounded-lg text-pink-700 font-medium">#${t}</span>`).join('')}
          </div>
        ` : ''}

        <!-- Bottom Action CTA -->
        <div class="bg-pink-50/70 p-5 rounded-2xl border border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div class="text-center sm:text-left">
            <div class="font-bold text-pink-950 text-sm">Need to track immunization schedules?</div>
            <div class="text-xs text-pink-700 mt-0.5">Keep track of your pet's boosters directly on PetCare Hub.</div>
          </div>
          <button onclick="App.closeModal('articleReaderModal'); App.navigateTo('tracker');" class="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-sm shadow-pink-200 transition-all shrink-0">
            Open Vaccination Tracker
          </button>
        </div>
      </div>
    `;

    this.openModal('articleReaderModal');
  },

  openArticleSubmissionModal() {
    const title = document.getElementById('articleEditModalTitle');
    const form = document.getElementById('articleEditForm');
    const idField = document.getElementById('articleEditId');
    const statusContainer = document.getElementById('articleEditStatusContainer');

    if (form) form.reset();
    if (idField) idField.value = '';
    if (title) title.textContent = 'Submit a Community Care Guide';
    
    // Non-admin submissions default to "Pending Review"
    const statusSelect = document.getElementById('articleEditStatus');
    if (statusSelect) statusSelect.value = 'Pending Review';
    if (statusContainer) statusContainer.classList.add('hidden');

    this.openModal('articleEditModal');
  },

  /* ==========================================================================
     MODULE 3: PET PROFILES VIEW
     ========================================================================== */

  renderPetProfiles() {
    const grid = document.getElementById('petsGrid');
    const emptyState = document.getElementById('petsEmptyState');
    if (!grid || !emptyState) return;

    const pets = StorageManager.getPets();

    if (pets.length === 0) {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = pets.map(pet => {
      const photo = pet.photoUrl || (typeof DEFAULT_SPECIES_PHOTOS !== 'undefined' ? DEFAULT_SPECIES_PHOTOS[pet.species] : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80');
      return `
      <div class="cute-card bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
        
        <!-- Subtle Top Pastel Accent Strip -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-300 to-indigo-400"></div>

        <div>
          <!-- Avatar & Header Row -->
          <div class="flex items-start justify-between mb-4 pt-1">
            <div class="flex items-center gap-3.5">
              <!-- Cute Framed Photo -->
              <div class="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden ring-4 ring-pink-100 ring-offset-2 shadow-sm shrink-0 cute-avatar-frame bg-pink-50">
                <img src="${photo}" alt="${this.escapeHtml(pet.name)}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300&q=80'" />
                <div class="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" title="Active Pet Member"></div>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-extrabold text-slate-900 text-lg leading-tight">${this.escapeHtml(pet.name)}</h3>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/60">${this.escapeHtml(pet.species)}</span>
                </div>
                <span class="text-xs font-semibold text-slate-500 mt-0.5 block">${this.escapeHtml(pet.breed || pet.species)}</span>
              </div>
            </div>

            <!-- Options Dropdown / Delete -->
            <div class="flex items-center gap-1">
              <button onclick="App.openEditPetModal('${pet.id}')" title="Edit Profile" class="p-2 text-slate-400 hover:text-pink-600 rounded-xl hover:bg-pink-50 transition-colors">
                <i class="fa-solid fa-pen-to-square text-sm"></i>
              </button>
              <button onclick="App.confirmDeletePet('${pet.id}', '${this.escapeHtml(pet.name)}')" title="Delete Profile" class="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
                <i class="fa-regular fa-trash-can text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Pet Metadata Badges -->
          <div class="grid grid-cols-2 gap-2 my-4">
            <div class="p-2.5 rounded-2xl bg-pink-50/50 border border-pink-100/80">
              <div class="text-[10px] uppercase font-bold text-pink-600/80 flex items-center gap-1"><i class="fa-solid fa-cake-candles text-[9px]"></i> Age</div>
              <div class="text-xs font-extrabold text-slate-800 mt-0.5">${pet.ageText || 'Not specified'}</div>
            </div>
            <div class="p-2.5 rounded-2xl bg-rose-50/50 border border-rose-100/80">
              <div class="text-[10px] uppercase font-bold text-rose-600/80 flex items-center gap-1"><i class="fa-solid fa-weight-scale text-[9px]"></i> Weight</div>
              <div class="text-xs font-extrabold text-slate-800 mt-0.5">${pet.weight ? pet.weight + ' kg' : 'Not recorded'}</div>
            </div>
          </div>

          <!-- Tags: Gender & Microchip -->
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <span class="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold">
              ${pet.gender === 'Female' ? '♀ Female' : '♂ Male'}
            </span>
            ${pet.neutered ? '<span class="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 flex items-center gap-1"><i class="fa-solid fa-circle-check text-[10px]"></i> Spayed/Neutered</span>' : ''}
            ${pet.microchip ? `<span class="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-mono text-[11px]"><i class="fa-solid fa-id-badge text-[10px] text-slate-400"></i> ${pet.microchip}</span>` : ''}
          </div>

          <!-- Notes / Sensitive health details -->
          ${pet.notes ? `
            <p class="text-xs text-slate-600 mt-3 bg-pink-50/40 p-2.5 rounded-2xl border border-pink-100/60 line-clamp-2">
              <strong class="text-pink-800 font-bold">Care Note:</strong> ${this.escapeHtml(pet.notes)}
            </p>
          ` : ''}
        </div>

        <!-- Action CTA: Direct link to log vaccine for this pet -->
        <div class="pt-4 mt-4 border-t border-pink-50 flex items-center justify-between">
          <button onclick="App.navigateTo('tracker', { prefillPetId: '${pet.id}' })" class="w-full py-2.5 px-3 bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs group-hover:bg-pink-600 group-hover:text-white">
            <i class="fa-solid fa-syringe text-xs"></i> Log Vaccine for ${this.escapeHtml(pet.name)}
          </button>
        </div>

      </div>
      `;
    }).join('');
  },

  renderPresetAvatarGallery(selectedUrl) {
    const gallery = document.getElementById('petPresetAvatarGallery');
    if (!gallery || typeof CUTE_PET_PRESETS === 'undefined') return;

    gallery.innerHTML = CUTE_PET_PRESETS.map(item => {
      const isSelected = item.url === selectedUrl;
      return `
        <button 
          type="button" 
          onclick="App.selectPresetPhoto('${item.url}')" 
          title="${item.name} (${item.species})"
          class="preset-avatar-option relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${isSelected ? 'border-pink-500 ring-2 ring-pink-300 scale-105' : 'border-slate-200 hover:border-pink-300'}"
        >
          <img src="${item.url}" alt="${item.name}" class="w-full h-full object-cover" />
          ${isSelected ? '<div class="absolute inset-0 bg-pink-500/25 flex items-center justify-center"><i class="fa-solid fa-check text-white text-xs drop-shadow"></i></div>' : ''}
        </button>
      `;
    }).join('');
  },

  selectPresetPhoto(url) {
    const input = document.getElementById('petPhotoUrlInput');
    const headerAvatar = document.getElementById('petModalHeaderAvatar');
    if (input) input.value = url;
    if (headerAvatar) headerAvatar.src = url;
    this.renderPresetAvatarGallery(url);
  },

  applyCustomPetPhoto() {
    const customInput = document.getElementById('petCustomPhotoInput');
    if (!customInput || !customInput.value.trim()) {
      this.toast('Please enter an image URL first.', 'warning');
      return;
    }
    const url = customInput.value.trim();
    this.selectPresetPhoto(url);
    this.toast('Pet photo applied to preview!', 'success');
  },

  openAddPetModal() {
    const form = document.getElementById('petForm');
    if (form) form.reset();
    document.getElementById('petFormId').value = '';
    document.getElementById('petModalTitle').textContent = 'Register New Pet';
    
    const initialPhoto = (typeof DEFAULT_SPECIES_PHOTOS !== 'undefined' ? DEFAULT_SPECIES_PHOTOS.Dog : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80');
    this.selectPresetPhoto(initialPhoto);
    
    const customInput = document.getElementById('petCustomPhotoInput');
    if (customInput) customInput.value = '';

    this.openModal('petModal');
  },

  openEditPetModal(petId) {
    const pet = StorageManager.getPetById(petId);
    if (!pet) return;

    document.getElementById('petFormId').value = pet.id;
    document.getElementById('petModalTitle').textContent = `Edit Profile: ${pet.name}`;
    document.getElementById('petNameInput').value = pet.name || '';
    document.getElementById('petSpeciesSelect').value = pet.species || 'Dog';
    document.getElementById('petGenderSelect').value = pet.gender || 'Female';
    document.getElementById('petBreedInput').value = pet.breed || '';
    document.getElementById('petDobInput').value = pet.dob || '';
    document.getElementById('petWeightInput').value = pet.weight || '';
    document.getElementById('petMicrochipInput').value = pet.microchip || '';
    document.getElementById('petNeuteredCheckbox').checked = !!pet.neutered;
    document.getElementById('petNotesInput').value = pet.notes || '';

    const currentPhoto = pet.photoUrl || (typeof DEFAULT_SPECIES_PHOTOS !== 'undefined' ? DEFAULT_SPECIES_PHOTOS[pet.species] : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80');
    this.selectPresetPhoto(currentPhoto);

    const customInput = document.getElementById('petCustomPhotoInput');
    if (customInput) customInput.value = '';

    this.openModal('petModal');
  },

  handlePetFormSubmit() {
    const id = document.getElementById('petFormId').value;
    const name = document.getElementById('petNameInput').value.trim();
    const species = document.getElementById('petSpeciesSelect').value;
    const gender = document.getElementById('petGenderSelect').value;
    const breed = document.getElementById('petBreedInput').value.trim();
    const dob = document.getElementById('petDobInput').value;
    const weight = parseFloat(document.getElementById('petWeightInput').value) || null;
    const microchip = document.getElementById('petMicrochipInput').value.trim();
    const neutered = document.getElementById('petNeuteredCheckbox').checked;
    const notes = document.getElementById('petNotesInput').value.trim();
    const photoUrl = document.getElementById('petPhotoUrlInput').value || (typeof DEFAULT_SPECIES_PHOTOS !== 'undefined' ? DEFAULT_SPECIES_PHOTOS[species] : '');

    if (!name) {
      this.toast('Pet name is required!', 'warning');
      return;
    }

    const petData = {
      name,
      species,
      gender,
      breed,
      dob,
      weight,
      microchip,
      neutered,
      notes,
      photoUrl,
      avatarBg: StorageManager.getAvatarBgForSpecies(species)
    };

    if (id) {
      StorageManager.updatePet(id, petData);
      this.toast(`🐾 Profile for "${name}" updated successfully!`, 'success');
    } else {
      StorageManager.savePet(petData);
      this.toast(`🐾 Welcome to PetCare Hub, ${name}! Profile registered.`, 'success');
    }

    this.closeModal('petModal');
    this.refreshAllViews();
  },

  confirmDeletePet(petId, petName) {
    this.confirmDialog(
      `Delete "${petName}"?`,
      `This will permanently remove ${petName}'s profile and all associated vaccination records from local storage.`,
      () => {
        StorageManager.deletePet(petId);
        this.toast(`Profile for "${petName}" was removed.`, 'danger');
        this.refreshAllViews();
      }
    );
  },

  /* ==========================================================================
     MODULE 4: VACCINATION & HEALTH TRACKER MODULE
     ========================================================================== */

  populatePetDropdowns() {
    const pets = StorageManager.getPets();

    // 1. Pet selector in Left Side Vaccine Form
    const vacSelect = document.getElementById('vacPetSelect');
    if (vacSelect) {
      const currentVal = vacSelect.value;
      vacSelect.innerHTML = `<option value="" disabled ${!currentVal ? 'selected' : ''}>Select from registered pets...</option>`;
      pets.forEach(p => {
        vacSelect.innerHTML += `<option value="${p.id}" ${currentVal === p.id ? 'selected' : ''}>${this.escapeHtml(p.name)} — ${p.breed ? this.escapeHtml(p.breed) + ' (' + p.species + ')' : p.species}</option>`;
      });
    }

    // 2. Filter by Pet in Right Side Vaccine Table
    const filterSelect = document.getElementById('trackerFilterPet');
    if (filterSelect) {
      const curFilter = this.state.trackerFilterPet;
      filterSelect.innerHTML = `<option value="all">All Pets</option>`;
      pets.forEach(p => {
        filterSelect.innerHTML += `<option value="${p.id}" ${curFilter === p.id ? 'selected' : ''}>${this.escapeHtml(p.name)}</option>`;
      });
    }
  },

  prefillTrackerWithPet(petId) {
    const vacSelect = document.getElementById('vacPetSelect');
    if (vacSelect) {
      vacSelect.value = petId;
      this.updateQuickVaccineChips(petId);
    }
  },

  updateQuickVaccineChips(petId) {
    const pet = StorageManager.getPetById(petId);
    const chipsContainer = document.getElementById('quickVaccineChips');
    if (!chipsContainer) return;

    const species = pet ? pet.species : 'Dog';
    const suggestions = COMMON_VACCINES[species] || COMMON_VACCINES.Dog;

    chipsContainer.innerHTML = suggestions.slice(0, 4).map(v => `
      <button type="button" onclick="App.setVaccineInputName('${this.escapeHtml(v)}')" class="text-[11px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
        ${this.escapeHtml(v.split(' ')[0])}
      </button>
    `).join('');
  },

  setVaccineInputName(name) {
    const input = document.getElementById('vacNameInput');
    if (input) {
      input.value = name;
      input.focus();
    }
  },

  handleAddVaccineSubmit() {
    const petId = document.getElementById('vacPetSelect').value;
    const vaccineName = document.getElementById('vacNameInput').value.trim();
    const dueDate = document.getElementById('vacDueDateInput').value;
    const initialStatusChoice = document.getElementById('vacInitialStatus').value;
    const clinic = document.getElementById('vacClinicInput').value.trim();
    const notes = document.getElementById('vacNotesInput').value.trim();

    if (!petId) {
      this.toast('Please select a registered pet.', 'warning');
      return;
    }
    if (!vaccineName) {
      this.toast('Vaccine name is required.', 'warning');
      return;
    }
    if (!dueDate) {
      this.toast('Please pick a due date.', 'warning');
      return;
    }

    const pet = StorageManager.getPetById(petId);
    const petName = pet ? pet.name : 'Unknown Pet';

    let status = initialStatusChoice === 'Completed' ? 'Completed' : 'Upcoming';

    const vaccineData = {
      petId,
      petName,
      vaccineName,
      dueDate,
      status,
      clinic,
      veterinarian: '',
      notes,
      dateAdministered: initialStatusChoice === 'Completed' ? new Date().toISOString().split('T')[0] : ''
    };

    StorageManager.saveVaccine(vaccineData);
    this.toast(`💉 Vaccine record for ${petName} saved!`, 'success');

    // Reset Form
    document.getElementById('addVaccineForm').reset();
    this.refreshAllViews();
  },

  renderVaccinesTable() {
    const tbody = document.getElementById('trackerTableBody');
    const emptyState = document.getElementById('trackerEmptyState');
    const countText = document.getElementById('trackerCountText');
    if (!tbody || !emptyState) return;

    let vaccines = StorageManager.getVaccines();

    // Filter by Status
    if (this.state.trackerFilterStatus !== 'all') {
      vaccines = vaccines.filter(v => v.status === this.state.trackerFilterStatus);
    }

    // Filter by Pet
    if (this.state.trackerFilterPet !== 'all') {
      vaccines = vaccines.filter(v => v.petId === this.state.trackerFilterPet);
    }

    if (countText) {
      countText.textContent = `Showing ${vaccines.length} record${vaccines.length === 1 ? '' : 's'}`;
    }

    if (vaccines.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    tbody.innerHTML = vaccines.map((vac, index) => {
      const isStriped = index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white';
      const statusBadge = this.getVaccineStatusBadge(vac.status, vac.dueDate);
      
      const pet = StorageManager.getPetById(vac.petId) || StorageManager.getPets().find(p => p.name.toLowerCase() === (vac.petName || '').toLowerCase());
      const petPic = pet && pet.photoUrl ? pet.photoUrl : (typeof DEFAULT_SPECIES_PHOTOS !== 'undefined' ? DEFAULT_SPECIES_PHOTOS.Dog : 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=100&q=80');

      return `
        <tr class="${isStriped} hover:bg-pink-50/40 transition-colors">
          <!-- Pet & Vaccine with Cute Photo -->
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-3">
              <img src="${petPic}" alt="${this.escapeHtml(vac.petName)}" class="w-10 h-10 rounded-xl object-cover ring-2 ring-pink-200/80 shadow-xs shrink-0" onerror="this.src='https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=100&q=80'" />
              <div>
                <div class="font-bold text-slate-900">${this.escapeHtml(vac.petName)}</div>
                <div class="text-xs text-pink-600 font-semibold mt-0.5">${this.escapeHtml(vac.vaccineName)}</div>
              </div>
            </div>
          </td>

          <!-- Due Date & Relative Days -->
          <td class="py-3.5 px-4 whitespace-nowrap">
            <div class="text-xs font-bold text-slate-800">${vac.dueDate}</div>
            <div class="text-[11px] text-slate-400 mt-0.5">${this.getRelativeDateText(vac.dueDate, vac.status)}</div>
          </td>

          <!-- Status Badge -->
          <td class="py-3.5 px-4 whitespace-nowrap">
            ${statusBadge}
          </td>

          <!-- Notes / Clinic -->
          <td class="py-3.5 px-4 max-w-xs">
            <div class="text-xs text-slate-700 font-medium truncate" title="${this.escapeHtml(vac.clinic || 'No clinic specified')}">
              ${vac.clinic ? `<i class="fa-solid fa-hospital-user text-slate-400 mr-1"></i> ${this.escapeHtml(vac.clinic)}` : '<span class="text-slate-400 italic">No clinic listed</span>'}
            </div>
            ${vac.notes ? `<div class="text-[11px] text-slate-500 truncate mt-0.5" title="${this.escapeHtml(vac.notes)}">${this.escapeHtml(vac.notes)}</div>` : ''}
          </td>

          <!-- Actions -->
          <td class="py-3.5 px-4 text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-1.5">
              <!-- Toggle Status Button -->
              <button 
                onclick="App.toggleVaccineStatus('${vac.id}')" 
                title="${vac.status === 'Completed' ? 'Mark as Incomplete' : 'Mark as Completed'}" 
                class="p-1.5 rounded-lg ${vac.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'} transition-colors"
              >
                <i class="fa-solid fa-check text-xs"></i>
              </button>

              <!-- Edit Button -->
              <button 
                onclick="App.openEditVaccineModal('${vac.id}')" 
                title="Edit Record" 
                class="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-colors"
              >
                <i class="fa-solid fa-pen text-xs"></i>
              </button>

              <!-- Delete Button -->
              <button 
                onclick="App.confirmDeleteVaccine('${vac.id}', '${this.escapeHtml(vac.vaccineName)}')" 
                title="Delete Record" 
                class="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <i class="fa-regular fa-trash-can text-xs"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  getVaccineStatusBadge(status, dueDate) {
    if (status === 'Completed') {
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Completed
        </span>
      `;
    } else if (status === 'Overdue') {
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 animate-pulse">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Overdue
        </span>
      `;
    } else {
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-800">
          <span class="w-1.5 h-1.5 rounded-full bg-pink-500"></span> Upcoming
        </span>
      `;
    }
  },

  getRelativeDateText(dueDate, status) {
    if (status === 'Completed') return 'Shot Administered';
    if (!dueDate) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [y, m, d] = dueDate.split('-').map(Number);
    const due = new Date(y, m - 1, d);
    due.setHours(0, 0, 0, 0);

    const diffMs = due - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today!';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays > 1) return `Due in ${diffDays} days`;
    if (diffDays === -1) return 'Overdue by 1 day';
    return `Overdue by ${Math.abs(diffDays)} days`;
  },

  toggleVaccineStatus(id) {
    const updated = StorageManager.toggleVaccineStatus(id);
    if (updated) {
      if (updated.status === 'Completed') {
        this.toast(`✅ Marked "${updated.vaccineName}" for ${updated.petName} as Completed!`, 'success');
      } else {
        this.toast(`Immunization "${updated.vaccineName}" marked as ${updated.status}.`, 'info');
      }
      this.refreshAllViews();
    }
  },

  openEditVaccineModal(id) {
    const vaccines = StorageManager.getVaccines();
    const vac = vaccines.find(v => v.id === id);
    if (!vac) return;

    document.getElementById('editVacId').value = vac.id;
    document.getElementById('editVacPetName').value = vac.petName;
    document.getElementById('editVacName').value = vac.vaccineName;
    document.getElementById('editVacDueDate').value = vac.dueDate;
    document.getElementById('editVacStatus').value = vac.status;
    document.getElementById('editVacClinic').value = vac.clinic || '';
    document.getElementById('editVacNotes').value = vac.notes || '';

    this.openModal('editVaccineModal');
  },

  handleEditVaccineSubmit() {
    const id = document.getElementById('editVacId').value;
    const vaccineName = document.getElementById('editVacName').value.trim();
    const dueDate = document.getElementById('editVacDueDate').value;
    const status = document.getElementById('editVacStatus').value;
    const clinic = document.getElementById('editVacClinic').value.trim();
    const notes = document.getElementById('editVacNotes').value.trim();

    if (!vaccineName || !dueDate) {
      this.toast('Vaccine name and due date are required.', 'warning');
      return;
    }

    StorageManager.updateVaccine(id, {
      vaccineName,
      dueDate,
      status,
      clinic,
      notes
    });

    this.toast('Vaccine record updated successfully!', 'success');
    this.closeModal('editVaccineModal');
    this.refreshAllViews();
  },

  confirmDeleteVaccine(id, name) {
    this.confirmDialog(
      `Remove Vaccine Record?`,
      `Are you sure you want to delete the record for "${name}"? This action cannot be undone.`,
      () => {
        StorageManager.deleteVaccine(id);
        this.toast(`Record for "${name}" deleted.`, 'danger');
        this.refreshAllViews();
      }
    );
  },

  openVaccinePassportPrintModal() {
    const pets = StorageManager.getPets();
    const vaccines = StorageManager.getVaccines();

    const printableContainer = document.getElementById('printableVaccineCard');
    if (!printableContainer) return;

    if (pets.length === 0) {
      this.toast('Register a pet first before generating a health passport.', 'warning');
      return;
    }

    printableContainer.innerHTML = `
      <div class="border-2 border-pink-950 rounded-3xl p-6 sm:p-8 bg-white text-slate-800">
        
        <!-- Passport Header -->
        <div class="border-b-2 border-pink-950 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-pink-950 text-white flex items-center justify-center text-2xl font-bold">
              🐾
            </div>
            <div>
              <h2 class="text-2xl font-black text-pink-950 uppercase tracking-tight">Official Pet Health & Vaccination Passport</h2>
              <p class="text-xs font-semibold text-pink-700">PETCARE HUB VETERINARY SURVEILLANCE SYSTEM</p>
            </div>
          </div>
          <div class="text-right text-xs text-slate-500">
            <div>Issue Date: <strong>${new Date().toLocaleDateString()}</strong></div>
            <div>Registry ID: <span class="font-mono font-bold text-slate-800">PCH-2026-REG</span></div>
          </div>
        </div>

        <!-- Registered Pets Health Summary -->
        <div class="space-y-6">
          ${pets.map(pet => {
            const petVaccines = vaccines.filter(v => v.petId === pet.id);
            return `
              <div class="border border-pink-100 rounded-2xl p-5 bg-pink-50/20 page-break-inside-avoid">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-pink-100 gap-3">
                  <div class="flex items-center gap-3">
                    <img src="${pet.photoUrl || (typeof DEFAULT_SPECIES_PHOTOS !== 'undefined' ? DEFAULT_SPECIES_PHOTOS[pet.species] : '')}" alt="${this.escapeHtml(pet.name)}" class="w-14 h-14 rounded-2xl object-cover ring-2 ring-pink-950/20 shadow-xs shrink-0" onerror="this.src='https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200&q=80'" />
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="text-lg font-black text-slate-900">${this.escapeHtml(pet.name)}</h3>
                        <span class="text-xs px-2.5 py-0.5 rounded-md bg-pink-100 text-pink-900 font-bold">${this.escapeHtml(pet.species)}</span>
                      </div>
                      <span class="text-xs text-slate-500 font-semibold">${this.escapeHtml(pet.breed || pet.species)}</span>
                    </div>
                  </div>
                  <div class="text-xs text-slate-600 font-medium">
                    Age: <strong>${pet.ageText || 'N/A'}</strong> | Weight: <strong>${pet.weight ? pet.weight + ' kg' : 'N/A'}</strong> | Chip: <strong class="font-mono">${pet.microchip || 'None'}</strong>
                  </div>
                </div>

                <!-- Pet Vaccines List -->
                <table class="w-full text-left text-xs border border-pink-100 bg-white rounded-lg overflow-hidden">
                  <thead class="bg-pink-50 text-pink-950 font-bold">
                    <tr>
                      <th class="p-2 border-b border-pink-100">Vaccine / Biologic</th>
                      <th class="p-2 border-b border-pink-100">Status</th>
                      <th class="p-2 border-b border-pink-100">Due Date</th>
                      <th class="p-2 border-b border-pink-100">Administered Date</th>
                      <th class="p-2 border-b border-pink-100">Clinic & Notes</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-pink-50">
                    ${petVaccines.length > 0 ? petVaccines.map(v => `
                      <tr>
                        <td class="p-2 font-bold text-slate-900">${this.escapeHtml(v.vaccineName)}</td>
                        <td class="p-2 font-bold ${v.status === 'Completed' ? 'text-emerald-700' : v.status === 'Overdue' ? 'text-rose-700' : 'text-pink-700'}">${v.status}</td>
                        <td class="p-2 font-mono">${v.dueDate}</td>
                        <td class="p-2 font-mono text-slate-500">${v.dateAdministered || 'Pending'}</td>
                        <td class="p-2 text-slate-600">${this.escapeHtml(v.clinic || '')} ${v.notes ? ' - ' + this.escapeHtml(v.notes) : ''}</td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td colspan="5" class="p-3 text-center text-slate-400 italic">No vaccines recorded yet for ${this.escapeHtml(pet.name)}.</td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer Sign-off -->
        <div class="mt-8 pt-6 border-t border-pink-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>This digital passport is recognized for transport verification and boarding registries.</div>
          <div class="text-right">Veterinarian Stamp / Signature: _________________________</div>
        </div>

      </div>
    `;

    this.openModal('passportModal');
  },

  /* ==========================================================================
     MODULE 5: ADMIN CONTENT MODERATION PANEL
     ========================================================================== */

  filterAdminArticles(status) {
    this.state.adminFilterStatus = status;

    // Toggle Filter Button styles
    const allBtn = document.getElementById('adminFilterAll');
    const pendingBtn = document.getElementById('adminFilterPending');
    const publishedBtn = document.getElementById('adminFilterPublished');

    [allBtn, pendingBtn, publishedBtn].forEach(b => {
      if (b) b.className = 'admin-filter-pill px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-pink-50 hover:text-pink-600';
    });

    if (status === 'all' && allBtn) {
      allBtn.className = 'admin-filter-pill px-3 py-1.5 rounded-lg text-xs font-bold bg-pink-600 text-white';
    } else if (status === 'Pending Review' && pendingBtn) {
      pendingBtn.className = 'admin-filter-pill px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-white';
    } else if (status === 'Published' && publishedBtn) {
      publishedBtn.className = 'admin-filter-pill px-3 py-1.5 rounded-lg text-xs font-bold bg-pink-600 text-white';
    }

    this.renderAdminArticles();
  },

  renderAdminArticles() {
    const tbody = document.getElementById('adminArticlesTableBody');
    const emptyState = document.getElementById('adminEmptyState');
    if (!tbody || !emptyState) return;

    let articles = StorageManager.getArticles();

    if (this.state.adminFilterStatus !== 'all') {
      articles = articles.filter(a => a.status === this.state.adminFilterStatus);
    }

    if (articles.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    tbody.innerHTML = articles.map(art => `
      <tr class="hover:bg-pink-50/30 transition-colors">
        
        <!-- Article Title & Snippet -->
        <td class="py-4 px-6 max-w-sm">
          <div class="font-bold text-slate-900 line-clamp-1">${this.escapeHtml(art.title)}</div>
          <div class="text-xs text-slate-500 line-clamp-1 mt-0.5">${this.escapeHtml(art.summary)}</div>
        </td>

        <!-- Category & Species -->
        <td class="py-4 px-6 whitespace-nowrap">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${this.getCategoryBadgeColor(art.category)}">
            ${art.category}
          </span>
          <div class="text-[11px] text-slate-400 mt-1 font-medium">${art.species || 'All Pets'}</div>
        </td>

        <!-- Author Details -->
        <td class="py-4 px-6 whitespace-nowrap">
          <div class="text-xs font-bold text-slate-800">${this.escapeHtml(art.author ? art.author.name : 'Unknown')}</div>
          <div class="text-[11px] text-slate-400">${this.escapeHtml(art.author ? art.author.role : '')}</div>
        </td>

        <!-- Status -->
        <td class="py-4 px-6 whitespace-nowrap">
          ${art.status === 'Published' 
            ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Published</span>'
            : '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending Review</span>'
          }
        </td>

        <!-- Date Added -->
        <td class="py-4 px-6 whitespace-nowrap text-xs text-slate-500 font-mono">
          ${art.createdAt || 'Recent'}
        </td>

        <!-- Moderation Actions -->
        <td class="py-4 px-6 text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-2">
            
            <!-- Approve Button (if pending) -->
            ${art.status !== 'Published' ? `
              <button onclick="App.approveArticle('${art.id}', '${this.escapeHtml(art.title)}')" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors">
                <i class="fa-solid fa-check"></i> Approve
              </button>
            ` : ''}

            <!-- Edit Button -->
            <button onclick="App.openAdminEditArticleModal('${art.id}')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>

            <!-- Remove Button -->
            <button onclick="App.confirmDeleteArticle('${art.id}', '${this.escapeHtml(art.title)}')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
              <i class="fa-regular fa-trash-can"></i> Remove
            </button>

          </div>
        </td>

      </tr>
    `).join('');
  },

  approveArticle(id, title) {
    StorageManager.approveArticle(id);
    this.toast(`✅ Article "${title}" approved and published to public catalog!`, 'success');
    this.refreshAllViews();
  },

  openAdminAddArticleModal() {
    const form = document.getElementById('articleEditForm');
    if (form) form.reset();
    document.getElementById('articleEditId').value = '';
    document.getElementById('articleEditModalTitle').textContent = 'Create New Platform Resource';
    
    // Status is editable for admins
    const statusContainer = document.getElementById('articleEditStatusContainer');
    if (statusContainer) statusContainer.classList.remove('hidden');
    document.getElementById('articleEditStatus').value = 'Published';

    this.openModal('articleEditModal');
  },

  openAdminEditArticleModal(id) {
    const article = StorageManager.getArticles().find(a => a.id === id);
    if (!article) return;

    document.getElementById('articleEditId').value = article.id;
    document.getElementById('articleEditModalTitle').textContent = `Edit Resource: ${article.title}`;
    document.getElementById('articleEditTitle').value = article.title || '';
    document.getElementById('articleEditCategory').value = article.category || 'Dog Care';
    document.getElementById('articleEditSpecies').value = article.species || 'All Pets';
    document.getElementById('articleEditAuthorName').value = article.author ? article.author.name : '';
    document.getElementById('articleEditAuthorRole').value = article.author ? article.author.role : '';
    document.getElementById('articleEditSummary').value = article.summary || '';
    document.getElementById('articleEditContent').value = article.content || '';
    
    const statusContainer = document.getElementById('articleEditStatusContainer');
    if (statusContainer) statusContainer.classList.remove('hidden');
    document.getElementById('articleEditStatus').value = article.status || 'Published';
    document.getElementById('articleEditImage').value = article.image || '';

    this.openModal('articleEditModal');
  },

  handleArticleFormSubmit() {
    const id = document.getElementById('articleEditId').value;
    const title = document.getElementById('articleEditTitle').value.trim();
    const category = document.getElementById('articleEditCategory').value;
    const species = document.getElementById('articleEditSpecies').value;
    const authorName = document.getElementById('articleEditAuthorName').value.trim();
    const authorRole = document.getElementById('articleEditAuthorRole').value.trim();
    const summary = document.getElementById('articleEditSummary').value.trim();
    const content = document.getElementById('articleEditContent').value.trim();
    const status = document.getElementById('articleEditStatus').value;
    let image = document.getElementById('articleEditImage').value.trim();

    if (!image) {
      image = category === 'Dog Care' ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80'
            : category === 'Cat Care' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80'
            : category === 'Nutrition' ? 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80'
            : 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80';
    }

    const articleData = {
      title,
      category,
      species,
      author: {
        name: authorName,
        role: authorRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
      },
      readTime: '4 min read',
      difficulty: 'Practical',
      summary,
      content: content || `<p class="mb-4 text-slate-700">${summary}</p>`,
      status,
      image,
      tags: [category, species]
    };

    if (id) {
      StorageManager.updateArticle(id, articleData);
      this.toast(`Resource "${title}" updated successfully!`, 'success');
    } else {
      StorageManager.saveArticle(articleData);
      if (status === 'Pending Review') {
        this.toast(`Thank you! Your guide has been submitted for veterinary review.`, 'info');
      } else {
        this.toast(`New article "${title}" published to Care Guides!`, 'success');
      }
    }

    this.closeModal('articleEditModal');
    this.refreshAllViews();
  },

  confirmDeleteArticle(id, title) {
    this.confirmDialog(
      `Remove "${title}"?`,
      `Are you sure you want to remove this resource from PetCare Hub? It will be deleted from public access.`,
      () => {
        StorageManager.deleteArticle(id);
        this.toast(`Article "${title}" was removed.`, 'danger');
        this.refreshAllViews();
      }
    );
  },

  confirmResetData() {
    this.confirmDialog(
      `Reset Platform Demo Data?`,
      `This will reset all articles, pet profiles, and vaccination trackers back to the pristine initial seed dataset.`,
      () => {
        StorageManager.resetToDefaults();
        this.toast('Platform restored to pristine sample demo data.', 'info');
        this.refreshAllViews();
      }
    );
  },

  /* ==========================================================================
     METRICS & SYSTEM SYNCHRONIZATION
     ========================================================================== */

  updateGlobalMetrics() {
    const articles = StorageManager.getArticles();
    const pets = StorageManager.getPets();
    const vaccines = StorageManager.getVaccines();

    const upcoming = vaccines.filter(v => v.status === 'Upcoming').length;
    const overdue = vaccines.filter(v => v.status === 'Overdue').length;
    const completed = vaccines.filter(v => v.status === 'Completed').length;
    const pendingModeration = articles.filter(a => a.status === 'Pending Review').length;

    // Tracker module mini-cards
    const mTotal = document.getElementById('trackerMetricTotal');
    const mUpcoming = document.getElementById('trackerMetricUpcoming');
    const mOverdue = document.getElementById('trackerMetricOverdue');
    const mCompleted = document.getElementById('trackerMetricCompleted');

    if (mTotal) mTotal.textContent = vaccines.length;
    if (mUpcoming) mUpcoming.textContent = upcoming;
    if (mOverdue) mOverdue.textContent = overdue;
    if (mCompleted) mCompleted.textContent = completed;

    // Admin Panel Stat Counters
    const aTotalRes = document.getElementById('adminStatTotalResources');
    const aPets = document.getElementById('adminStatRegisteredPets');
    const aTrackers = document.getElementById('adminStatActiveTrackers');
    const aPending = document.getElementById('adminStatPendingQueue');

    if (aTotalRes) aTotalRes.textContent = articles.length;
    if (aPets) aPets.textContent = pets.length;
    if (aTrackers) aTrackers.textContent = vaccines.length;
    if (aPending) aPending.textContent = pendingModeration;

    // Navigation badges for overdue immunizations
    const navOverdue = document.getElementById('navOverdueBadge');
    const mobileOverdue = document.getElementById('mobileOverdueBadge');

    if (navOverdue) {
      if (overdue > 0) {
        navOverdue.textContent = overdue;
        navOverdue.classList.remove('hidden');
      } else {
        navOverdue.classList.add('hidden');
      }
    }

    if (mobileOverdue) {
      if (overdue > 0) {
        mobileOverdue.textContent = overdue;
        mobileOverdue.classList.remove('hidden');
      } else {
        mobileOverdue.classList.add('hidden');
      }
    }
  },

  /* ==========================================================================
     UI HELPERS, TOASTS & MODALS
     ========================================================================== */

  toast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-card';

    let bg = 'bg-white/95 backdrop-blur-md border-pink-200 text-slate-800 shadow-pink-200/50';
    let icon = '<i class="fa-solid fa-heart text-pink-500 text-lg animate-pulse"></i>';

    if (type === 'success') {
      bg = 'bg-white/95 backdrop-blur-md border-l-4 border-l-pink-500 border border-pink-200 shadow-pink-200/50';
      icon = '<i class="fa-solid fa-heart text-pink-500 text-lg"></i>';
    } else if (type === 'danger' || type === 'error') {
      bg = 'bg-white/95 backdrop-blur-md border-l-4 border-l-rose-500 border border-rose-200 shadow-rose-200/50';
      icon = '<i class="fa-solid fa-heart-crack text-rose-500 text-lg"></i>';
    } else if (type === 'warning') {
      bg = 'bg-white/95 backdrop-blur-md border-l-4 border-l-amber-400 border border-amber-200 shadow-amber-100/50';
      icon = '<i class="fa-solid fa-paw text-amber-500 text-lg"></i>';
    } else if (type === 'info') {
      bg = 'bg-white/95 backdrop-blur-md border-l-4 border-l-pink-400 border border-pink-200 shadow-pink-200/50';
      icon = '<i class="fa-solid fa-sparkles text-pink-500 text-lg"></i>';
    }

    toast.innerHTML = `
      <div class="${bg} p-4 flex items-center justify-between gap-3 shadow-lg rounded-2xl">
        <div class="flex items-center gap-3">
          ${icon}
          <div class="text-xs sm:text-sm font-semibold text-slate-800">${this.escapeHtml(message)}</div>
        </div>
        <button class="text-pink-300 hover:text-pink-500 text-xs p-1 transition-colors" onclick="this.closest('.toast-card').remove()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      // If no other modals are visible, unlock scroll
      const visibleModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
      if (visibleModals.length === 0) {
        document.body.classList.remove('overflow-hidden');
      }
    }
  },

  confirmDialog(title, message, callback) {
    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    this.state.pendingConfirmAction = callback;
    this.openModal('confirmModal');
  },

  getCategoryBadgeColor(category) {
    const map = {
      'Dog Care': 'bg-pink-100 text-pink-800 border border-pink-200/80',
      'Cat Care': 'bg-rose-100 text-rose-800 border border-rose-200/80',
      'Nutrition': 'bg-amber-100 text-amber-800 border border-amber-200/80',
      'Grooming': 'bg-purple-100 text-purple-800 border border-purple-200/80'
    };
    return map[category] || 'bg-pink-50 text-pink-700 border border-pink-100';
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

// Initialize Application once DOM Content is Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
