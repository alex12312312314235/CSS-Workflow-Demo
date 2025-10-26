// Main application - Router, State, LocalStorage
const App = {
  state: {
    catalogs: null,
    draftWorkflow: null,
    currentRoute: 'build',
    sharedWorkflow: null
  },

  // Fallback roles in case catalog fails to load
  FALLBACK_ROLES: [
    { id: 'exec_sous', name: 'Executive Sous Chef' },
    { id: 'food_tech', name: 'Food Technologist' },
    { id: 's_s_lead', name: 'Standards & Specs Lead' },
    { id: 'h_d_lead', name: 'Health & Dietetics Lead' },
    { id: 'i_i_analyst', name: 'Insights & Intelligence Analyst' }
  ],

  /**
   * Initialize the application
   */
  async init() {
    console.log('Initializing SLA Configurator...');

    // Load catalogs
    await this.loadCatalogs();

    // Load draft workflow from localStorage
    this.loadDraft();

    // Check for share link in URL hash
    this.checkShareLink();

    // Setup router
    this.setupRouter();

    // Render initial route
    this.router();

    // Setup navigation
    this.setupNavigation();

    console.log('App initialized');
  },

  /**
   * Load catalog data
   */
  async loadCatalogs() {
    try {
      // Check localStorage first
      const stored = localStorage.getItem('sla.catalog');
      if (stored) {
        this.state.catalogs = JSON.parse(stored);
        console.log('Loaded catalogs from localStorage');
        return;
      }

      // Load from file
      const response = await fetch('./data/catalog.json');
      if (!response.ok) throw new Error('Failed to load catalog');

      this.state.catalogs = await response.json();
      console.log('Loaded catalogs from file');

      // Ensure roles are available
      if (!this.state.catalogs.roles || this.state.catalogs.roles.length === 0) {
        console.warn('No roles in catalog, using fallback');
        this.state.catalogs.roles = this.FALLBACK_ROLES;
      }
    } catch (error) {
      console.error('Failed to load catalogs:', error);
      // Use fallback with minimal data
      this.state.catalogs = {
        schemaVersion: '1.0.0',
        roles: this.FALLBACK_ROLES,
        departments: [{ id: 'css', name: 'Culinary Support Services' }],
        businessHours: [{ id: 'std', name: 'Standard', tz: 'Asia/Dubai', days: [1,2,3,4,5], start: '08:00', end: '18:00' }],
        priorities: [
          { id: 'p1', name: 'Critical', ackMins: 30, startMins: 60, resolveMins: 480 },
          { id: 'p2', name: 'High', ackMins: 120, startMins: 240, resolveMins: 1440 },
          { id: 'p3', name: 'Normal', ackMins: 1440, startMins: 2880, resolveMins: 10080 }
        ]
      };
    }
  },

  /**
   * Save catalogs to localStorage
   */
  saveCatalogs() {
    try {
      localStorage.setItem('sla.catalog', JSON.stringify(this.state.catalogs));
      console.log('Catalogs saved to localStorage');
    } catch (error) {
      console.error('Failed to save catalogs:', error);
    }
  },

  /**
   * Reset catalogs to defaults
   */
  async resetCatalogs() {
    try {
      const response = await fetch('./data/catalog.json');
      if (!response.ok) throw new Error('Failed to load catalog');

      this.state.catalogs = await response.json();
      this.saveCatalogs();
      alert('Catalogs reset to defaults');
      this.router(); // Re-render current screen
    } catch (error) {
      console.error('Failed to reset catalogs:', error);
      alert('Failed to reset catalogs');
    }
  },

  /**
   * Load draft workflow from localStorage
   */
  loadDraft() {
    try {
      const stored = localStorage.getItem('sla.draftWorkflow');
      if (stored) {
        this.state.draftWorkflow = JSON.parse(stored);
        console.log('Loaded draft workflow from localStorage');
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  },

  /**
   * Save draft workflow to localStorage
   */
  saveDraft(workflow) {
    try {
      this.state.draftWorkflow = workflow;
      localStorage.setItem('sla.draftWorkflow', JSON.stringify(workflow));
      console.log('Draft saved to localStorage');
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  },

  /**
   * Check for share link in URL hash
   */
  checkShareLink() {
    const hash = window.location.hash;
    if (hash.startsWith('#wf=')) {
      const decoded = ShareLink.decodeFromHash(hash);
      if (decoded) {
        this.state.sharedWorkflow = decoded.workflow;
        // Merge catalogs if needed
        if (decoded.catalogs) {
          this.mergeCatalogs(decoded.catalogs);
        }
        console.log('Loaded workflow from share link');
        // Navigate to review
        window.location.hash = '#/review';
      }
    }
  },

  /**
   * Merge shared catalogs with existing
   */
  mergeCatalogs(sharedCatalogs) {
    ['roles', 'departments', 'businessHours', 'priorities'].forEach(key => {
      if (sharedCatalogs[key]) {
        sharedCatalogs[key].forEach(item => {
          const exists = this.state.catalogs[key].find(c => c.id === item.id);
          if (!exists) {
            this.state.catalogs[key].push(item);
          }
        });
      }
    });
  },

  /**
   * Setup hash router
   */
  setupRouter() {
    window.addEventListener('hashchange', () => this.router());
  },

  /**
   * Router - handle navigation
   */
  router() {
    let hash = window.location.hash || '#/build';

    // Handle share link
    if (hash.startsWith('#wf=')) {
      hash = '#/review';
    }

    // Extract route
    const route = hash.replace(/^#\//, '') || 'build';
    this.state.currentRoute = route;

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.route === route) {
        link.classList.add('active');
      }
    });

    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
    });

    // Show active screen
    const activeScreen = document.getElementById(`screen-${route}`);
    if (activeScreen) {
      activeScreen.style.display = 'block';

      // Render screen content
      if (route === 'catalog') {
        CatalogScreen.render();
      } else if (route === 'build') {
        BuildScreen.render();
      } else if (route === 'review') {
        ReviewScreen.render();
      }
    }
  },

  /**
   * Setup navigation clicks
   */
  setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.dataset.route;
        window.location.hash = `#/${route}`;
      });
    });
  },

  /**
   * Export full schema with workflows
   */
  exportJSON(includeWorkflow = null) {
    const data = {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      businessHours: this.state.catalogs.businessHours,
      roles: this.state.catalogs.roles,
      departments: this.state.catalogs.departments,
      priorities: this.state.catalogs.priorities,
      workflows: []
    };

    if (includeWorkflow) {
      data.workflows = [includeWorkflow];
    }

    return data;
  },

  /**
   * Import JSON data
   */
  importJSON(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      // Validate schema version
      if (data.schemaVersion !== '1.0.0') {
        throw new Error('Unsupported schema version');
      }

      // Import catalogs
      if (data.businessHours) this.state.catalogs.businessHours = data.businessHours;
      if (data.roles) this.state.catalogs.roles = data.roles;
      if (data.departments) this.state.catalogs.departments = data.departments;
      if (data.priorities) this.state.catalogs.priorities = data.priorities;

      this.saveCatalogs();

      // Import workflow if present
      if (data.workflows && data.workflows.length > 0) {
        this.state.draftWorkflow = data.workflows[0];
        this.saveDraft(this.state.draftWorkflow);
      }

      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  },

  /**
   * Download JSON file
   */
  downloadJSON(data, filename = 'sla-workflow.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
