// Main application - Router, State, LocalStorage
const App = {
  state: {
    catalogs: null,
    templates: null,
    workflows: [],
    draftWorkflow: null,
    currentRoute: 'home',
    currentWorkflowId: null,
    currentDeptId: null,
    sharedWorkflow: null,
    filters: {
      department: 'all',
      owner: 'all',
      search: ''
    },
    viewMode: 'cards' // 'cards' or 'table'
  },

  // Default catalog data (fallback if files fail to load)
  DEFAULT_CATALOG: {
    schemaVersion: '1.0.0',
    roles: [
      { id: 'exec_sous', name: 'Executive Sous Chef' },
      { id: 'food_tech', name: 'Food Technologist' },
      { id: 's_s_lead', name: 'Standards & Specs Lead' },
      { id: 'h_d_lead', name: 'Health & Dietetics Lead' },
      { id: 'i_i_analyst', name: 'Insights & Intelligence Analyst' }
    ],
    departments: [
      { id: 'cd', name: 'Concept Dev' },
      { id: 'ss', name: 'Standards & Specs' },
      { id: 'ft', name: 'Food Tech' },
      { id: 'hd', name: 'Health & Dietetics' },
      { id: 'ii', name: 'Insights & Intelligence' }
    ],
    businessHours: [
      { id: 'std', name: 'Standard CSS', tz: 'Asia/Dubai', days: [1,2,3,4,5], start: '08:00', end: '18:00' }
    ],
    priorities: [
      { id: 'p1', name: 'High', ackMins: 30, startMins: 60, resolveMins: 480 },
      { id: 'p2', name: 'Medium', ackMins: 120, startMins: 240, resolveMins: 1440 },
      { id: 'p3', name: 'Low', ackMins: 1440, startMins: 2880, resolveMins: 10080 }
    ]
  },

  // Default templates (fallback if file fails to load)
  DEFAULT_TEMPLATES: {
    schemaVersion: '1.0.0',
    templates: {
      hd: [
        {
          workType: 'Nutritional Analysis',
          ownerRoleId: 'h_d_lead',
          businessHoursId: 'std',
          steps: [
            { title: 'Intake triage', roleId: 'h_d_lead', expectedMins: 30 },
            { title: 'Data collection', roleId: 'i_i_analyst', expectedMins: 180 },
            { title: 'Lab analysis', roleId: 'food_tech', expectedMins: 240 },
            { title: 'Label update', roleId: 'h_d_lead', expectedMins: 60 }
          ],
          slaPreset: 'standard'
        }
      ],
      ss: [
        {
          workType: 'Allergen Update',
          ownerRoleId: 's_s_lead',
          businessHoursId: 'std',
          steps: [
            { title: 'Intake & triage', roleId: 's_s_lead', expectedMins: 60 },
            { title: 'Verification', roleId: 'food_tech', expectedMins: 240 },
            { title: 'Publish & notify', roleId: 'exec_sous', expectedMins: 60 }
          ],
          slaPreset: 'standard'
        }
      ],
      ft: [],
      cd: [],
      ii: []
    }
  },

  // SLA Presets
  SLA_PRESETS: {
    conservative: {
      p1: { ackMins: 60, startMins: 120, resolveMins: 960 },
      p2: { ackMins: 120, startMins: 480, resolveMins: 2880 },
      p3: { ackMins: 1440, startMins: 4320, resolveMins: 15120 }
    },
    standard: {
      p1: { ackMins: 30, startMins: 60, resolveMins: 480 },
      p2: { ackMins: 120, startMins: 240, resolveMins: 1440 },
      p3: { ackMins: 1440, startMins: 2880, resolveMins: 10080 }
    },
    aggressive: {
      p1: { ackMins: 15, startMins: 30, resolveMins: 240 },
      p2: { ackMins: 60, startMins: 120, resolveMins: 720 },
      p3: { ackMins: 720, startMins: 1440, resolveMins: 5040 }
    }
  },

  /**
   * Calculate minutes per business day from business hours profile
   */
  minutesPerBusinessDay(bhProfile) {
    if (!bhProfile || !bhProfile.start || !bhProfile.end || !bhProfile.days) {
      return 480; // Default: 8 hours
    }

    const start = bhProfile.start.split(':').map(Number);
    const end = bhProfile.end.split(':').map(Number);
    const startMins = start[0] * 60 + start[1];
    const endMins = end[0] * 60 + end[1];
    const hoursPerDay = (endMins - startMins) / 60;

    return Math.round(hoursPerDay * 60);
  },

  /**
   * Convert user SLA input to minutes
   */
  convertUserSlaToMinutes(value, unit, bhProfile) {
    value = parseFloat(value);
    if (isNaN(value) || value < 0) return 0;

    if (unit === 'hours') {
      return Math.round(value * 60);
    } else if (unit === 'businessDays') {
      const minsPerDay = this.minutesPerBusinessDay(bhProfile);
      return Math.round(value * minsPerDay);
    } else {
      // Default: mins
      return Math.round(value);
    }
  },

  /**
   * Format SLA minutes for display with unit label
   */
  formatSlaForDisplay(minutes, unit, bhProfile) {
    if (!minutes && minutes !== 0) return '—';

    if (unit === 'hours') {
      const hours = (minutes / 60).toFixed(1);
      return hours + ' hours (' + minutes + ' mins)';
    } else if (unit === 'businessDays') {
      const minsPerDay = this.minutesPerBusinessDay(bhProfile);
      const days = (minutes / minsPerDay).toFixed(1);
      return days + ' business days (' + minutes + ' mins)';
    } else {
      return minutes + ' mins';
    }
  },

  /**
   * Convert minutes to Business Days (1 decimal place)
   */
  formatMinutesAsBD(minutes, bhProfile) {
    if (!minutes && minutes !== 0) return '0.0';
    const minsPerDay = this.minutesPerBusinessDay(bhProfile);
    return (minutes / minsPerDay).toFixed(1);
  },

  /**
   * Compute feasibility for a workflow with interpretation setting
   */
  computeFeasibility(workflow, catalogs, interpretAsBH) {
    if (!workflow || !workflow.steps || !workflow.slaByPriority) {
      return null;
    }

    const totalExpectedMins = workflow.steps.reduce((sum, s) => sum + (s.expectedMins || 0), 0);
    const result = {
      totalExpectedMins,
      byPriority: {}
    };

    catalogs.priorities.forEach(priority => {
      const sla = workflow.slaByPriority[priority.id];
      if (!sla) {
        result.byPriority[priority.id] = { status: 'unknown' };
        return;
      }

      let feasible = false;
      let buffer = 0;
      let bufferPct = 0;

      if (interpretAsBH) {
        // Use business-hours interpretation
        // For now, simplified: just check if total fits within resolve time
        // Full implementation would project steps onto BH calendar
        buffer = sla.resolveMins - totalExpectedMins;
        bufferPct = totalExpectedMins > 0 ? (buffer / totalExpectedMins) * 100 : 100;
        feasible = buffer >= 0;
      } else {
        // Linear calendar minutes
        buffer = sla.resolveMins - totalExpectedMins;
        bufferPct = totalExpectedMins > 0 ? (buffer / totalExpectedMins) * 100 : 100;
        feasible = buffer >= 0;
      }

      const tight = feasible && bufferPct <= 10;
      const overrun = !feasible;

      result.byPriority[priority.id] = {
        status: overrun ? 'overrun' : (tight ? 'tight' : 'ok'),
        feasible,
        tight,
        overrun,
        buffer,
        bufferPct
      };
    });

    return result;
  },

  /**
   * Slugify a string (simple version)
   */
  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start
      .replace(/-+$/, '');         // Trim - from end
  },

  /**
   * Generate random 6-character string
   */
  generateRandomId() {
    return Math.random().toString(36).substring(2, 8);
  },

  /**
   * Generate unique workflow ID
   */
  generateWorkflowId(workType) {
    const slug = this.slugify(workType || 'workflow');
    const random = this.generateRandomId();
    return slug + '-' + random;
  },

  /**
   * Initialize the application
   */
  async init() {
    console.log('Initializing CSS SLA Configurator...');

    // Load catalogs
    await this.loadCatalogs();

    // Load templates
    await this.loadTemplates();

    // Load workflows from localStorage
    this.loadWorkflows();

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
      // Check localStorage first (unless already loaded from file)
      const stored = localStorage.getItem('sla.catalog');
      if (stored) {
        this.state.catalogs = JSON.parse(stored);
        console.log('Loaded catalogs from localStorage');
        window.catalog = this.state.catalogs; // Expose for debugging
        return;
      }

      // Load from file with cache-busting
      const cacheBust = '?v=' + Date.now();
      const response = await fetch('./data/catalog.json' + cacheBust, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load catalog');

      this.state.catalogs = await response.json();
      console.log('Loaded catalogs from file');
      window.catalog = this.state.catalogs; // Expose for debugging

      // Ensure roles are available
      if (!this.state.catalogs.roles || this.state.catalogs.roles.length === 0) {
        console.warn('No roles in catalog, using defaults');
        this.state.catalogs.roles = this.DEFAULT_CATALOG.roles;
      }
    } catch (error) {
      console.error('Failed to load catalogs:', error);
      console.warn('Using default catalog data');
      // Use default catalog
      this.state.catalogs = JSON.parse(JSON.stringify(this.DEFAULT_CATALOG));
      window.catalog = this.state.catalogs; // Expose for debugging
    }
  },

  /**
   * Load templates
   */
  async loadTemplates() {
    try {
      // Load from file with cache-busting
      const cacheBust = '?v=' + Date.now();
      const response = await fetch('./data/templates.json' + cacheBust, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load templates');

      this.state.templates = await response.json();
      console.log('Loaded templates from file');
      window.templates = this.state.templates; // Expose for debugging
    } catch (error) {
      console.error('Failed to load templates:', error);
      console.warn('Using default template data');
      // Use default templates
      this.state.templates = JSON.parse(JSON.stringify(this.DEFAULT_TEMPLATES));
      window.templates = this.state.templates; // Expose for debugging
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
      // Load from file with cache-busting
      const cacheBust = '?v=' + Date.now();
      const response = await fetch('./data/catalog.json' + cacheBust, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load catalog');

      this.state.catalogs = await response.json();
      window.catalog = this.state.catalogs; // Update debug reference
      this.saveCatalogs();
      alert('Catalogs reset to defaults');
      this.router(); // Re-render current screen
    } catch (error) {
      console.error('Failed to reset catalogs:', error);
      alert('Failed to reset catalogs');
    }
  },

  /**
   * Get workflows from localStorage (fresh read)
   */
  getWorkflows() {
    try {
      const stored = localStorage.getItem('sla.workflows');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get workflows:', error);
      return [];
    }
  },

  /**
   * Set workflows to localStorage
   */
  setWorkflows(list) {
    try {
      localStorage.setItem('sla.workflows', JSON.stringify(list));
      console.log('Workflows saved to localStorage');
    } catch (error) {
      console.error('Failed to set workflows:', error);
    }
  },

  /**
   * Load workflows from localStorage
   */
  loadWorkflows() {
    try {
      this.state.workflows = this.getWorkflows();
      console.log(`Loaded ${this.state.workflows.length} workflows from localStorage`);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      this.state.workflows = [];
    }
  },

  /**
   * Save workflows to localStorage
   */
  saveWorkflows() {
    this.setWorkflows(this.state.workflows);
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
   * Save a workflow (update or create)
   */
  saveWorkflow(workflow) {
    workflow.updatedAt = new Date().toISOString();
    if (!workflow.status) workflow.status = 'draft';

    const idx = this.state.workflows.findIndex(w => w.id === workflow.id);
    if (idx > -1) {
      this.state.workflows[idx] = workflow;
    } else {
      this.state.workflows.push(workflow);
    }

    this.saveWorkflows();
  },

  /**
   * Delete a workflow
   */
  deleteWorkflow(id) {
    const list = this.getWorkflows().filter(w => w.id !== id);
    this.setWorkflows(list);
    // Reload state
    this.loadWorkflows();
  },

  /**
   * Delete all workflows for a department
   */
  deleteAllWorkflowsForDepartment(deptId) {
    const list = this.getWorkflows().filter(w => w.departmentId !== deptId);
    this.setWorkflows(list);
    // Reload state
    this.loadWorkflows();
  },

  /**
   * Get workflow by ID
   */
  getWorkflow(id) {
    return this.state.workflows.find(w => w.id === id);
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
        // Set current workflow ID and navigate to review
        this.state.currentWorkflowId = decoded.workflow.id;
        window.location.hash = `#/wf/${decoded.workflow.id}`;
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
    let hash = window.location.hash || '#/home';

    // Handle share link
    if (hash.startsWith('#wf=')) {
      return; // Already handled in checkShareLink
    }

    // Parse route - support both #/catalog and #/settings
    const match = hash.match(/#\/(home|catalog|settings|build|dept\/([^/]+)|wf\/([^/]+)|review)/);

    // Hide all screens first
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
    });

    if (!match) {
      // Show 404 instead of redirecting
      this.render404(hash);
      return;
    }

    let route = match[1];
    this.state.currentRoute = route;

    // Redirect legacy Review routes to Home
    if (route === 'review' || route.startsWith('wf/')) {
      this.showToast('Review is now shown inline on the department page.', 'info');

      // Try to redirect to department if we can infer it
      if (route.startsWith('wf/')) {
        const wfId = match[3];
        const workflow = this.getWorkflow(wfId);
        if (workflow && workflow.departmentId) {
          window.location.hash = '#/dept/' + workflow.departmentId;
          return;
        }
      }

      // Otherwise go to Home
      window.location.hash = '#/home';
      return;
    }

    // Alias: catalog → settings
    if (route === 'catalog') {
      route = 'settings';
    }

    // Extract params
    if (route.startsWith('dept/')) {
      this.state.currentDeptId = match[2];
    }

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const linkRoute = link.dataset.route;
      // Handle settings/catalog alias
      const effectiveRoute = linkRoute === 'catalog' ? 'settings' : linkRoute;
      if (effectiveRoute === route || route.startsWith(effectiveRoute + '/')) {
        link.classList.add('active');
      }
    });

    // Show and render active screen
    if (route === 'home') {
      document.getElementById('screen-home').style.display = 'block';
      HomeScreen.render();
    } else if (route === 'settings') {
      document.getElementById('screen-settings').style.display = 'block';
      CatalogScreen.render();
    } else if (route === 'build') {
      document.getElementById('screen-build').style.display = 'block';
      BuildScreen.render();
    } else if (route.startsWith('dept/')) {
      document.getElementById('screen-dept').style.display = 'block';
      DeptScreen.render(this.state.currentDeptId);
    }
  },

  /**
   * Render 404 page
   */
  render404(invalidHash) {
    const screen = document.getElementById('screen-home');
    screen.style.display = 'block';
    const container = document.getElementById('home-content');
    container.innerHTML =
      '<div style="text-align:center; padding:4rem 2rem;">' +
      '<h2>404 - Page Not Found</h2>' +
      '<p class="text-muted">The route "' + invalidHash + '" does not exist.</p>' +
      '<button class="btn-primary" onclick="location.hash=\'#/home\'">Back to Home</button>' +
      '</div>';
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
  exportJSON(includeWorkflows = null) {
    const data = {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      businessHours: this.state.catalogs.businessHours,
      roles: this.state.catalogs.roles,
      departments: this.state.catalogs.departments,
      priorities: this.state.catalogs.priorities,
      workflows: []
    };

    if (includeWorkflows) {
      data.workflows = Array.isArray(includeWorkflows) ? includeWorkflows : [includeWorkflows];
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

      // Import workflows if present
      if (data.workflows && data.workflows.length > 0) {
        data.workflows.forEach(wf => {
          this.saveWorkflow(wf);
        });
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
  },

  /**
   * Get filtered workflows
   */
  getFilteredWorkflows() {
    let filtered = this.state.workflows;

    // Department filter
    if (this.state.filters.department !== 'all') {
      filtered = filtered.filter(w => w.departmentId === this.state.filters.department);
    }

    // Owner filter
    if (this.state.filters.owner !== 'all') {
      filtered = filtered.filter(w => w.ownerRoleId === this.state.filters.owner);
    }

    // Search filter
    if (this.state.filters.search) {
      const search = this.state.filters.search.toLowerCase();
      filtered = filtered.filter(w =>
        w.workType.toLowerCase().includes(search)
      );
    }

    return filtered;
  },

  /**
   * Calculate department stats
   */
  getDepartmentStats(deptId) {
    // Only count active workflows (status !== "draft")
    const workflows = this.state.workflows.filter(w =>
      w.departmentId === deptId && (!w.status || w.status !== 'draft')
    );
    const count = workflows.length;

    if (count === 0) {
      return {
        count: 0,
        feasiblePct: '—',
        avgDuration: '—'
      };
    }

    let feasibleCount = 0;
    let totalDuration = 0;

    workflows.forEach(wf => {
      // Use workflow's interpretation setting if available, default to true
      const interpretAsBH = wf.meta?.interpretAsBusinessHours !== false;
      const feasibility = this.computeFeasibility(wf, this.state.catalogs, interpretAsBH);

      if (feasibility) {
        const p3 = feasibility.byPriority.p3;
        if (p3 && p3.status === 'ok') {
          feasibleCount++;
        }
        totalDuration += feasibility.totalExpectedMins;
      }
    });

    return {
      count,
      feasiblePct: count > 0 ? Math.round((feasibleCount / count) * 100) : '—',
      avgDuration: count > 0 ? Math.round(totalDuration / count) : '—'
    };
  },

  /**
   * Re-render current route (for refreshing after deletes)
   */
  renderCurrentRoute() {
    // Reload workflows from storage
    this.loadWorkflows();
    // Re-run the router to refresh the current screen
    this.router();
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;

    container.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  },

  /**
   * Show confirm modal with Back-friendly UI
   */
  confirm({ title = 'Confirm', message = 'Are you sure?', confirmText = 'OK', cancelText = 'Back', onConfirm = null }) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-overlay';
    wrap.innerHTML = `
      <div class="modal-card">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="actions">
          <button class="btn-cancel">${cancelText}</button>
          <button class="btn-confirm">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    const btnCancel = wrap.querySelector('.btn-cancel');
    const btnConfirm = wrap.querySelector('.btn-confirm');

    const close = () => {
      wrap.style.opacity = '0';
      setTimeout(() => {
        if (wrap.parentNode) {
          wrap.parentNode.removeChild(wrap);
        }
      }, 200);
    };

    btnCancel.addEventListener('click', close);
    btnConfirm.addEventListener('click', () => {
      close();
      if (onConfirm) {
        onConfirm();
      }
    });

    // Also close on overlay click
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) {
        close();
      }
    });
  },

  /**
   * Handle file import (moved from ReviewScreen)
   */
  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const success = App.importJSON(e.target.result);
        if (success) {
          App.showToast('Import successful! Workflows have been imported.', 'success');
          location.hash = '#/home';
        } else {
          App.showToast('Import failed. Please check the file format.', 'error');
        }
      } catch (error) {
        App.showToast('Import failed: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);

    event.target.value = '';
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
