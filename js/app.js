// Main application - Router, State, LocalStorage
// Storage keys
const LS = {
  CATALOGS: 'catalogs',
  WORKFLOWS: 'workflows',
  SLA_CATALOG: 'sla.catalog',
  SLA_WORKFLOWS: 'sla.workflows',
  DRAFT: 'sla.draftWorkflow'
};

const App = {
  __booted: false, // Boot flag
  stepUnitDefault: 'bd', // Default step unit for UI: 'bd' | 'hr' (never 'min' in UI)
  defaultTemplates: [], // Single source for templates

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
      origin: '',
      search: ''
    },
    viewMode: 'cards' // 'cards' or 'table'
  },

  /**
   * Safe JSON parsing with fallback
   */
  safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('JSON parse error:', e);
      return fallback;
    }
  },

  /**
   * Safe localStorage getter with fallback
   */
  safeGet(key, fallback) {
    return this.safeParse(localStorage.getItem(key), fallback);
  },

  // Schema version for forcing catalog reset when needed
  SCHEMA_VERSION: '1.0.1',

  /**
   * Get schema version from localStorage
   */
  getSchemaVersion() {
    return localStorage.getItem('schema_version') || '';
  },

  /**
   * Set schema version to localStorage
   */
  setSchemaVersion(version) {
    localStorage.setItem('schema_version', version);
  },

  /**
   * Validate catalog structure
   */
  _isValidCatalogs(cat) {
    return !!cat &&
      Array.isArray(cat.departments) && cat.departments.length > 0 &&
      Array.isArray(cat.roles) && cat.roles.length > 0 &&
      Array.isArray(cat.priorities) && cat.priorities.length > 0 &&
      Array.isArray(cat.businessHours) && cat.businessHours.length > 0 &&
      Array.isArray(cat.origins) && cat.origins.length > 0;
  },

  // Default catalog data v1.1 (canonical names + position titles)
  DEFAULT_CATALOG: {
    schemaVersion: '1.1.0',
    version: '1.1',
    departments: [
      { id: 'cd', name: 'Concept Development' },
      { id: 'sands', name: 'Standards & Specifications' },
      { id: 'ft', name: 'Food Technology' },
      { id: 'hd', name: 'Health & Dietetics' },
      { id: 'ii', name: 'Insights & Intelligence' }
    ],
    roles: [
      // Executive / Management (seniority order: VP > HoD > SM)
      // Used for escalation paths: P1 → VP, P2 → HoD, P3 → SM
      { id: 'vp_css', name: 'VP Culinary – Shared Services' },
      { id: 'hod_cd', name: 'Head of Concept Development' },
      { id: 'hod_sands', name: 'Head of Standards & Specifications' },
      { id: 'hod_ft', name: 'Head of Food Technology' },
      { id: 'hod_hd', name: 'Head of Health & Dietetics' },
      { id: 'hod_ii', name: 'Head of Insights & Intelligence' },
      { id: 'sm_cd', name: 'Senior Manager – Concept Development' },
      { id: 'sm_sands', name: 'Senior Manager – Standards & Specifications' },
      { id: 'sm_ft', name: 'Senior Manager – Food Technology' },
      { id: 'sm_hd', name: 'Senior Manager – Health & Dietetics' },
      { id: 'sm_ii', name: 'Senior Manager – Insights & Intelligence' },
      // Practitioners (common workflow owners across departments)
      { id: 'cd_chef', name: 'Development Chef' },
      { id: 'spec_analyst', name: 'Specifications Analyst' },
      { id: 'food_tech', name: 'Food Technologist' },
      { id: 'dietitian', name: 'Dietitian' },
      { id: 'data_analyst', name: 'Data Analyst (I&I)' },
      { id: 'planner', name: 'Production Planner (I&I)' }
    ],
    priorities: [
      // keep editable in Settings; these are just defaults
      { id: 'p1', name: 'High', ackMins: 30, startMins: 60, resolveMins: 540 },   // 9h = 1 BD default
      { id: 'p2', name: 'Medium', ackMins: 120, startMins: 240, resolveMins: 1440 }, // 1–2 BD
      { id: 'p3', name: 'Low', ackMins: 1440, startMins: 2880, resolveMins: 10080 }  // ~1w
    ],
    businessHours: [
      { id: 'bh_std', name: 'Standard (Mon–Fri, 9h/day)', hoursPerDay: 9 },
      { id: 'bh_ops', name: 'Ops Extended (Mon–Sat, 10h/day)', hoursPerDay: 10 },
      { id: 'bh_light', name: 'Light (Mon–Thu, 8h/day)', hoursPerDay: 8 }
    ],
    // for Build → "Origin" radio
    origins: [
      { id: 'client', name: 'Client-led' },
      { id: 'internal', name: 'Internal-led' }
    ]
  },

  // Default templates (fallback if file fails to load)
  DEFAULT_TEMPLATES: {
    schemaVersion: '1.0.0',
    templates: {
      hd: [
        {
          workType: 'Nutritional Analysis',
          ownerRoleId: 'dietitian',
          businessHoursId: 'bh_std',
          steps: [
            { title: 'Intake triage', roleId: 'hod_hd', expectedMins: 30 },
            { title: 'Data collection', roleId: 'data_analyst', expectedMins: 180 },
            { title: 'Lab analysis', roleId: 'food_tech', expectedMins: 240 },
            { title: 'Label update', roleId: 'dietitian', expectedMins: 60 }
          ],
          slaPreset: 'medium'
        }
      ],
      sands: [
        {
          workType: 'Allergen Update',
          ownerRoleId: 'spec_analyst',
          businessHoursId: 'bh_std',
          steps: [
            { title: 'Intake & triage', roleId: 'spec_analyst', expectedMins: 60 },
            { title: 'Verification', roleId: 'food_tech', expectedMins: 240 },
            { title: 'Publish & notify', roleId: 'hod_sands', expectedMins: 60 }
          ],
          slaPreset: 'medium'
        }
      ],
      ft: [],
      cd: [],
      ii: []
    }
  },

  // SLA Presets
  // These provide starting points for SLA configuration based on workflow urgency
  // - Low: Generous SLAs for complex, multi-step workflows (factor: 1.2, buffer: 0.2 BD)
  // - Medium: Balanced SLAs for standard workflows (factor: 1.0, buffer: 0.1 BD)
  // - High: Tight SLAs for urgent, time-sensitive workflows (factor: 0.9, buffer: 0 BD)
  SLA_PRESETS: {
    low: {
      p1: { ackMins: 60, startMins: 120, resolveMins: 960 },    // ~2 BD resolve
      p2: { ackMins: 120, startMins: 480, resolveMins: 2880 },  // ~5 BD resolve
      p3: { ackMins: 1440, startMins: 4320, resolveMins: 15120 } // ~28 BD resolve
    },
    medium: {
      p1: { ackMins: 30, startMins: 60, resolveMins: 480 },     // ~1 BD resolve
      p2: { ackMins: 120, startMins: 240, resolveMins: 1440 },  // ~3 BD resolve
      p3: { ackMins: 1440, startMins: 2880, resolveMins: 10080 } // ~19 BD resolve
    },
    high: {
      p1: { ackMins: 15, startMins: 30, resolveMins: 240 },     // ~0.5 BD resolve
      p2: { ackMins: 60, startMins: 120, resolveMins: 720 },    // ~1.3 BD resolve
      p3: { ackMins: 720, startMins: 1440, resolveMins: 5040 }  // ~9 BD resolve
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
   * Convert user SLA input to minutes (internal storage format)
   *
   * All SLA values are stored internally in minutes for consistency.
   * The UI displays values in user-selected units (BD or hours).
   *
   * @param {number} value - The numeric value from user input
   * @param {string} unit - 'hours' | 'businessDays' | 'mins'
   * @param {object} bhProfile - Business hours profile with hoursPerDay
   * @returns {number} - Value converted to minutes
   *
   * Examples:
   *   - convertUserSlaToMinutes(1, 'businessDays', {hoursPerDay: 9}) → 540 mins
   *   - convertUserSlaToMinutes(2, 'hours', null) → 120 mins
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
   *
   * Converts internal minute values to user-friendly display format.
   *
   * @param {number} minutes - The internal minute value
   * @param {string} unit - 'hours' | 'businessDays' | 'mins'
   * @param {object} bhProfile - Business hours profile
   * @returns {string} - Formatted display string
   *
   * Examples:
   *   - formatSlaForDisplay(540, 'businessDays', {hoursPerDay: 9}) → "1.0 business days (540 mins)"
   *   - formatSlaForDisplay(120, 'hours') → "2.0 hours (120 mins)"
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
   * Alias for minutesPerBusinessDay - returns minutes per BD for a given business hours profile
   */
  minsPerBD(bhProfile) {
    return this.minutesPerBusinessDay(bhProfile);
  },

  /**
   * Convert minutes to BD
   */
  minsToBD(mins, bhProfile) {
    const minsPerDay = this.minsPerBD(bhProfile);
    return mins / minsPerDay;
  },

  /**
   * Convert BD to minutes
   */
  bdToMins(bd, bhProfile) {
    const minsPerDay = this.minsPerBD(bhProfile);
    return Math.round(bd * minsPerDay);
  },

  /**
   * Convert hours to minutes
   */
  hoursToMins(hours) {
    return Math.round(hours * 60);
  },

  /**
   * Convert minutes to hours
   */
  minsToHours(mins) {
    return mins / 60;
  },

  /**
   * Rank roles by seniority for auto-escalation
   * Returns roles sorted by seniority (most senior first)
   */
  rankRolesBySeniority(roles, departmentId) {
    const seniorityKeywords = ['vp', 'head', 'hod', 'director', 'senior', 'manager', 'lead'];

    return roles.map(role => {
      // Calculate seniority score based on keywords in ID and name
      let score = 0;
      const roleText = (role.id + ' ' + role.name).toLowerCase();

      seniorityKeywords.forEach((keyword, index) => {
        if (roleText.includes(keyword)) {
          // Earlier keywords (like 'vp') get higher scores
          score += (seniorityKeywords.length - index) * 10;
        }
      });

      return { ...role, seniorityScore: score };
    })
    .filter(role => role.seniorityScore > 0) // Only roles with keywords
    .sort((a, b) => b.seniorityScore - a.seniorityScore);
  },

  /**
   * Get senior role candidates for escalation (guarded)
   * Returns VP / Sr Manager / HoD tier by department if present, otherwise fallback
   */
  getSeniorRoleCandidates(deptId) {
    try {
      const cats = this.state?.catalogs;
      if (!cats || !cats.roles) return [];
      return this.rankRolesBySeniority(cats.roles, deptId);
    } catch (e) {
      console.warn('getSeniorRoleCandidates failed', e);
      return [];
    }
  },

  /**
   * Get recommended escalation role for a priority level
   * @param {string} priorityId - Priority ID (p1, p2, p3)
   * @param {string} departmentId - Department ID
   * @returns {string|null} - Recommended role ID or null
   */
  getRecommendedEscalationRole(priorityId, departmentId) {
    const rankedRoles = this.rankRolesBySeniority(this.state.catalogs.roles, departmentId);

    if (rankedRoles.length === 0) return null;

    // p1 (Critical/High) → most senior (VP)
    if (priorityId === 'p1') {
      return rankedRoles[0]?.id || null;
    }

    // p2 (High/Medium) → department head (HOD/Head)
    if (priorityId === 'p2') {
      const head = rankedRoles.find(r =>
        r.id.includes('hod') || r.id.includes('head') ||
        r.name.toLowerCase().includes('head')
      );
      return head?.id || rankedRoles[1]?.id || rankedRoles[0]?.id || null;
    }

    // p3 (Normal/Low) → Senior Manager/Manager
    if (priorityId === 'p3') {
      const manager = rankedRoles.find(r =>
        r.id.includes('manager') || r.id.includes('senior') ||
        r.name.toLowerCase().includes('manager') || r.name.toLowerCase().includes('senior')
      );
      return manager?.id || rankedRoles[2]?.id || rankedRoles[1]?.id || rankedRoles[0]?.id || null;
    }

    return null;
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
   * Normalize name (trim extra spaces)
   */
  normalizeName(s) {
    return s.replace(/\s+/g, ' ').trim();
  },

  /**
   * Convert to Title Case
   */
  toTitle(s) {
    return this.normalizeName(s).replace(/\b\w/g, c => c.toUpperCase());
  },

  /**
   * Get minutes per Business Day for a given business hours profile
   */
  minsPerBD(bhProfile) {
    if (!bhProfile) {
      // Try to get from current catalogs
      const bh = this.state.catalogs?.businessHours?.[0];
      return (bh?.hoursPerDay || 9) * 60;
    }
    return (bhProfile.hoursPerDay || 9) * 60;
  },

  /**
   * Convert minutes to display value based on unit
   */
  stepFromMinutes(mins, unit) {
    const bhProfile = this.state.catalogs?.businessHours?.[0];
    const minsPerDay = this.minsPerBD(bhProfile);

    if (unit === 'bd') return (mins / minsPerDay).toFixed(1);
    if (unit === 'hr') return (mins / 60).toFixed(1);
    return mins;
  },

  /**
   * Convert display value to minutes based on unit
   */
  stepToMinutes(val, unit, bhProfile) {
    const n = Number(val || 0);
    if (unit === 'bd') {
      const minsPerDay = this.minsPerBD(bhProfile);
      return Math.round(n * minsPerDay);
    }
    if (unit === 'hr') return Math.round(n * 60);
    return Math.round(n);
  },

  /**
   * Migrate scheduleRef to notes (one-time migration)
   */
  migrateScheduleRef() {
    const list = this.getWorkflows();
    let changed = false;

    list.forEach(w => {
      const ref = w?.meta?.scheduleRef;
      if (ref) {
        const old = w.meta.notes || '';
        w.meta.notes = old ? `${old}\n\n[Schedule Ref]\n${ref}` : `[Schedule Ref]\n${ref}`;
        delete w.meta.scheduleRef;
        changed = true;
      }
    });

    if (changed) {
      this.setWorkflows(list);
      console.log('Migrated scheduleRef to notes');
    }
  },

  /**
   * Migrate SLA preset labels from conservative/standard/aggressive to low/medium/high
   * (wrapped with guards)
   */
  migrateSLAPresetLabels() {
    try {
      const list = this.getWorkflows();
      if (!list || !Array.isArray(list)) return;

      let changed = false;

      const presetMap = {
        'conservative': 'low',
        'standard': 'medium',
        'aggressive': 'high'
      };

      list.forEach(w => {
        // Check if workflow has old preset label in metadata
        if (w?.meta?.slaPreset) {
          const oldPreset = w.meta.slaPreset;
          if (presetMap[oldPreset]) {
            w.meta.slaPreset = presetMap[oldPreset];
            changed = true;
          }
        }
      });

      if (changed) {
        this.setWorkflows(list);
        console.log('Migrated SLA preset labels to low/medium/high');
      }
    } catch (e) {
      console.warn('migrateSLAPresetLabels failed', e);
    }
  },

  /**
   * Wrap all migrations in a safe runner
   */
  runMigrationsSafe() {
    try {
      if (this.migrateCatalogs_v11) {
        this.migrateCatalogs_v11();
      }
    } catch (e) {
      console.error('Migration migrateCatalogs_v11 error:', e);
    }

    try {
      if (this.migrateScheduleRef) {
        this.migrateScheduleRef();
      }
    } catch (e) {
      console.error('Migration migrateScheduleRef error:', e);
    }

    try {
      if (this.migrateSLAPresetLabels) {
        this.migrateSLAPresetLabels();
      }
    } catch (e) {
      console.error('Migration migrateSLAPresetLabels error:', e);
    }
  },

  /**
   * Ensure catalogs are never empty - restore known-good defaults if needed
   */
  ensureCatalogs() {
    const cat = this.state.catalogs;
    const broken = !cat || !cat.departments?.length || !cat.roles?.length || !cat.businessHours?.length;

    if (broken) {
      console.warn('Catalogs missing or empty — restoring defaults');
      this.state.catalogs = JSON.parse(JSON.stringify(this.DEFAULT_CATALOG));
      this.setCatalogs(this.state.catalogs);
    }
  },

  /**
   * Render Business Hours banner showing conversion rate
   */
  renderBHBanner(containerId, businessHoursId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Remove existing banner if present
    const existingBanner = container.querySelector('.bh-banner');
    if (existingBanner) existingBanner.remove();

    // Get business hours profile
    const bhProfile = this.state.catalogs?.businessHours?.find(bh => bh.id === businessHoursId) || this.state.catalogs?.businessHours?.[0];
    if (!bhProfile) return;

    const mins = this.minsPerBD(bhProfile);
    const div = document.createElement('div');
    div.className = 'bh-banner';
    div.textContent = `${bhProfile.name} → 1 BD = ${mins} minutes`;
    container.prepend(div);
  },

  /**
   * Ensure default catalogs are seeded (only if localStorage is empty)
   */
  ensureDefaultCatalogs() {
    // This now uses getCatalogs() which auto-repairs
    this.getCatalogs();
  },

  /**
   * Migrate catalogs to v1.1 (normalize names, update IDs, add origins)
   */
  migrateCatalogs_v11() {
    let cat = this.getCatalogs();

    // Skip if already migrated
    if (cat.version === '1.1' || cat.schemaVersion === '1.1.0') {
      return;
    }

    console.log('Migrating catalogs to v1.1...');

    // 1) Normalize department names
    const rename = {
      'Standards & Specs': 'Standards & Specifications',
      'Concept Dev': 'Concept Development',
      'Food Tech': 'Food Technology'
    };

    if (cat.departments) {
      cat.departments = cat.departments.map(d => {
        const newName = rename[d.name] || d.name;
        return { ...d, name: this.toTitle(newName) };
      });

      // 2) Ensure canonical IDs for known departments (keep user-created as-is)
      const idMap = {
        'Concept Development': 'cd',
        'Standards & Specifications': 'sands',
        'Food Technology': 'ft',
        'Health & Dietetics': 'hd',
        'Insights & Intelligence': 'ii'
      };

      cat.departments = cat.departments.map(d => {
        const canonical = idMap[d.name];
        return canonical ? { ...d, id: canonical } : d;
      });
    }

    // 3) Ensure required arrays exist with defaults if empty
    if (!cat.priorities || !cat.priorities.length) {
      cat.priorities = this.DEFAULT_CATALOG.priorities;
    }
    if (!cat.businessHours || !cat.businessHours.length) {
      cat.businessHours = this.DEFAULT_CATALOG.businessHours;
    }
    if (!cat.roles || !cat.roles.length) {
      cat.roles = this.DEFAULT_CATALOG.roles;
    }

    // 4) Add origins if not present
    if (!cat.origins || !cat.origins.length) {
      cat.origins = this.DEFAULT_CATALOG.origins;
    }

    // 5) Update schema version
    cat.version = '1.1';
    cat.schemaVersion = '1.1.0';

    this.setCatalogs(cat);
    console.log('Migration to v1.1 complete.');
  },

  /**
   * Seed demo workflows (only if storage is empty)
   */
  seedDemo() {
    if (localStorage.getItem('workflows')) {
      return; // do not overwrite existing data
    }

    console.log('Seeding demo workflows...');

    const demo = [];

    // 1 x S&S workflow
    demo.push({
      id: 'wf-' + this.generateRandomId(),
      departmentId: 'sands',
      workType: 'Spec Update – Allergen Revision',
      ownerRole: 'spec_analyst',
      origin: 'client',
      businessHoursId: 'bh_std',
      steps: [
        { title: 'Brief', roleId: 'spec_analyst', expectedMins: 30 },
        { title: 'Feasibility', roleId: 'food_tech', expectedMins: 60 },
        { title: 'CSS Gate', roleId: 'hod_sands', expectedMins: 30 },
        { title: 'Spec Pack', roleId: 'spec_analyst', expectedMins: 180 }
      ],
      slaByPriority: {
        p1: { ackMins: 60, startMins: 120, resolveMins: 1440 },
        p2: { ackMins: 120, startMins: 240, resolveMins: 2160 },
        p3: { ackMins: 1440, startMins: 2880, resolveMins: 10080 }
      },
      meta: {
        notes: 'Demo workflow'
      },
      updatedAt: Date.now(),
      status: 'ACTIVE'
    });

    if (demo.length > 0) {
      localStorage.setItem('workflows', JSON.stringify(demo));
      console.log(`Seeded ${demo.length} demo workflows.`);
    }
  },

  /**
   * Boot sequence - runs before any async loading
   * Guarantees catalogs are never empty via schema version gate
   */
  boot() {
    console.log('Booting CSS SLA Configurator...');

    // 1) Load catalogs from storage or defaults - single source
    const cat = this.getCatalogs();
    this.state.catalogs = cat;

    // 2) Attach templates from WorkflowTemplates (available via templates.js)
    if (typeof WorkflowTemplates !== 'undefined') {
      this.defaultTemplates = WorkflowTemplates.getAllTemplatesAsArray();
    } else {
      console.warn('WorkflowTemplates not loaded yet');
      this.defaultTemplates = [];
    }

    // 3) Run migrations in safe wrapper
    this.runMigrationsSafe();

    // 4) Ensure catalogs are never empty
    this.ensureCatalogs();

    // 5) Seed demo workflows only if none exist
    this.seedDemo();

    // 6) Set boot flag
    this.__booted = true;

    console.log('Boot complete', {
      booted: this.__booted,
      catalogs: !!this.state.catalogs,
      departments: this.state.catalogs?.departments?.length || 0,
      roles: this.state.catalogs?.roles?.length || 0,
      templates: this.defaultTemplates?.length || 0
    });
  },

  /**
   * Check if state is healthy and show repair banner if needed
   */
  ensureHealthyStateUI() {
    const cat = this.getCatalogs();
    const broken = !cat || !cat.departments?.length || !cat.roles?.length || !cat.businessHours?.length;
    let bar = document.getElementById('repair-bar');

    if (broken) {
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'repair-bar';
        bar.className = 'repair-bar';
        bar.innerHTML = `
          <strong>⚠ Setup incomplete.</strong>
          <button id="btnRestoreDefaults" class="btn btn-sm">Restore defaults</button>
          <button id="btnSeedDemo" class="btn btn-sm btn-ghost">Seed demo</button>
        `;
        document.body.prepend(bar);

        document.getElementById('btnRestoreDefaults').onclick = () => {
          localStorage.removeItem(LS.CATALOGS);
          localStorage.removeItem(LS.SLA_CATALOG);
          localStorage.removeItem('schema_version'); // Clear version to force reset
          this.getCatalogs(); // will recreate defaults
          this.state.catalogs = this.getCatalogs();
          window.location.reload(); // Full reload to ensure clean state
        };

        document.getElementById('btnSeedDemo').onclick = () => {
          this.setWorkflows([]); // Clear existing
          this.seedDemo(); // Seed new demo
          this.loadWorkflows(); // Reload into state
          window.location.reload(); // Full reload
        };
      }
    } else if (bar) {
      bar.remove();
    }
  },

  /**
   * Initialize the application (deterministic boot + single source)
   */
  async init() {
    console.log('Initializing CSS SLA Configurator...');

    // Boot sequence (synchronous, runs first - loads catalogs once)
    this.boot();

    // Check UI health and show repair banner if needed
    this.ensureHealthyStateUI();

    // Load templates (async from file, fallback to defaults)
    await this.loadTemplates();

    // Load workflows from localStorage
    this.loadWorkflows();

    // Load draft workflow from localStorage
    this.loadDraft();

    // Check for share link in URL hash
    this.checkShareLink();

    // Setup router
    this.setupRouter();

    // Render initial route (with catalog guard)
    await this.renderCurrentRoute();

    // Setup navigation
    this.setupNavigation();

    // Check UI health again after rendering
    this.ensureHealthyStateUI();

    console.log('App initialized');
  },

  /**
   * Load templates (async from file, fallback to defaults)
   * Note: In-code templates from WorkflowTemplates are already attached in boot()
   */
  async loadTemplates() {
    try {
      // Load from file with cache-busting
      const cacheBust = '?v=' + Date.now();
      const response = await fetch('./data/templates.json' + cacheBust, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load templates');

      const data = await response.json();
      this.state.templates = data;

      console.log('Loaded templates from file');
      window.templates = this.state.templates; // Expose for debugging
    } catch (error) {
      console.error('Failed to load templates:', error);
      console.warn('Using in-code templates from WorkflowTemplates');
      // Use default templates (already in this.defaultTemplates from boot())
      this.state.templates = this.DEFAULT_TEMPLATES;
      window.templates = this.state.templates; // Expose for debugging
    }
  },

  /**
   * Flatten templates object to array for dropdown
   */
  _flattenTemplatesToArray(templatesData) {
    const arr = [];
    const templates = templatesData.templates || templatesData;

    Object.keys(templates).forEach(deptId => {
      if (Array.isArray(templates[deptId])) {
        templates[deptId].forEach((t, idx) => {
          arr.push({
            id: `${deptId}_${idx}`,
            departmentId: deptId,
            name: t.workType || t.name || `Template ${idx + 1}`,
            ...t
          });
        });
      }
    });

    return arr;
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
    // Try both new and legacy keys
    const workflows = this.safeGet(LS.WORKFLOWS, null) || this.safeGet(LS.SLA_WORKFLOWS, []);
    return Array.isArray(workflows) ? workflows : [];
  },

  /**
   * Set workflows to localStorage
   */
  setWorkflows(list) {
    try {
      const safeList = Array.isArray(list) ? list : [];
      localStorage.setItem(LS.WORKFLOWS, JSON.stringify(safeList));
      localStorage.setItem(LS.SLA_WORKFLOWS, JSON.stringify(safeList)); // Keep legacy key
      console.log('Workflows saved to localStorage');
    } catch (error) {
      console.error('Failed to set workflows:', error);
    }
  },

  /**
   * Get catalogs from localStorage with auto-repair and schema version gate
   * Forces rebuild from defaults if schema version changed or catalogs invalid
   */
  getCatalogs() {
    // Try both new and legacy keys
    let cat = this.safeGet(LS.CATALOGS, null) || this.safeGet(LS.SLA_CATALOG, null);

    // Check schema version
    const currentVersion = this.getSchemaVersion();

    // Validate structure and check version
    const isValid = this._isValidCatalogs(cat);
    const versionMatches = currentVersion === this.SCHEMA_VERSION;

    if (!isValid || !versionMatches) {
      if (!versionMatches) {
        console.log(`Schema version mismatch (${currentVersion} → ${this.SCHEMA_VERSION}), forcing catalog reset`);
      } else {
        console.warn('Catalogs invalid or missing, restoring defaults');
      }

      // Force-replace with in-code defaults
      cat = JSON.parse(JSON.stringify(this.DEFAULT_CATALOG));
      localStorage.setItem(LS.CATALOGS, JSON.stringify(cat));
      localStorage.setItem(LS.SLA_CATALOG, JSON.stringify(cat));
      this.setSchemaVersion(this.SCHEMA_VERSION);
      console.log('Catalogs restored from hard defaults');
    }

    return cat;
  },

  /**
   * Set catalogs to localStorage (only if valid)
   * Never writes empty catalogs
   */
  setCatalogs(cat) {
    // Safety: never write empty catalogs
    if (!this._isValidCatalogs(cat)) {
      console.error('Attempted to write invalid catalogs, ignoring');
      return;
    }

    try {
      localStorage.setItem(LS.CATALOGS, JSON.stringify(cat));
      localStorage.setItem(LS.SLA_CATALOG, JSON.stringify(cat)); // Keep legacy key
      console.log('Catalogs saved to localStorage');
    } catch (error) {
      console.error('Failed to set catalogs:', error);
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
    // Catalog guard: ensure catalogs are loaded before routing
    if (!this.state?.catalogs?.departments?.length) {
      console.warn('Router: catalogs missing, cannot route yet');
      return;
    }

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

    // Origin filter (origin-safe: missing origin matches empty filter)
    if (this.state.filters.origin) {
      filtered = filtered.filter(w => {
        // If no origin is set on workflow, treat as matching when filter is empty
        if (!w.origin) return false; // Don't match if filter is active but workflow has no origin
        return w.origin === this.state.filters.origin;
      });
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
   * With catalog guard to prevent empty state
   */
  async renderCurrentRoute() {
    // Guard: ensure catalogs are present before rendering
    if (!this.state?.catalogs?.departments?.length) {
      console.warn('Catalogs missing at render — re-init and re-render');
      await this.init();
      return;
    }

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

// Expose App to window scope for inline scripts and onclick handlers
window.App = App;

// DO NOT call App.init() here - it will be called from index.html after screens are defined
