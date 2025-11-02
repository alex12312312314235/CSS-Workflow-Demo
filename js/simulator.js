// ============================
// SIMULATOR MODULE
// ============================
App.simulator = {
  state: {
    status: 'idle', // 'idle' | 'playing' | 'paused' | 'done'
    stepIndex: 0,
    speed: 'normal',
    params: null,
    steps: [],
    result: null,
    timeline: []
  },

  /**
   * Run simulation with given parameters
   */
  run(params) {
    this.reset();
    this.state.params = params;
    this.state.steps = this.buildSteps(params);
    this.state.status = 'playing';
    this.playLoop();
  },

  /**
   * Pause simulation
   */
  pause() {
    this.state.status = 'paused';
    document.getElementById('sim-play').disabled = false;
    document.getElementById('sim-pause').disabled = true;
  },

  /**
   * Resume simulation
   */
  resume() {
    if (this.state.status === 'paused') {
      this.state.status = 'playing';
      document.getElementById('sim-play').disabled = true;
      document.getElementById('sim-pause').disabled = false;
      this.playLoop();
    }
  },

  /**
   * Execute one step
   */
  async next() {
    if (this.state.stepIndex >= this.state.steps.length) return;
    const step = this.state.steps[this.state.stepIndex];
    await this.executeStep(step);
    this.state.stepIndex++;
  },

  /**
   * Reset simulation state
   */
  reset() {
    this.state = {
      status: 'idle',
      stepIndex: 0,
      speed: 'normal',
      params: null,
      steps: [],
      result: null,
      timeline: []
    };

    // Reset UI
    document.querySelectorAll('.step-card .badge').forEach(badge => {
      badge.className = 'badge';
      badge.textContent = 'PENDING';
    });
    document.querySelectorAll('.step-card .body').forEach(body => {
      body.innerHTML = '';
    });

    // Reset stats
    document.getElementById('stat-feasible').textContent = '–';
    document.getElementById('stat-buffer').textContent = '–';
    document.getElementById('stat-fr').textContent = '–';
    document.getElementById('stat-res').textContent = '–';
    document.getElementById('stat-esc').textContent = '–';
    document.getElementById('stat-errors').textContent = '–';
    document.getElementById('stat-warnings').textContent = '–';
    document.getElementById('sim-timeline').innerHTML = '';

    // Reset buttons
    document.getElementById('sim-play').disabled = false;
    document.getElementById('sim-pause').disabled = true;
  },

  /**
   * Build steps array for simulation
   */
  buildSteps(params) {
    const self = this;
    return [
      { key: 'load', fn: () => self.stepLoadSLA(params) },
      { key: 'sanity', fn: () => self.stepSanity(params.sla) },
      { key: 'calendar', fn: () => self.stepCalendar(params.sla, params.bh, params) },
      { key: 'first-response', fn: () => self.stepFirstResponse(params.sla, params.bh, params) },
      { key: 'resolution', fn: () => self.stepResolution(params.sla, params.bh, params) },
      { key: 'escalations', fn: () => self.stepEscalations(params.sla, params.bh, params) },
      { key: 'verdict', fn: () => self.stepVerdict() }
    ];
  },

  /**
   * Main play loop
   */
  async playLoop() {
    while (this.state.status === 'playing' && this.state.stepIndex < this.state.steps.length) {
      const step = this.state.steps[this.state.stepIndex];
      await this.executeStep(step);
      this.state.stepIndex++;
    }

    if (this.state.stepIndex >= this.state.steps.length) {
      this.state.status = 'done';
      document.getElementById('sim-play').disabled = true;
      document.getElementById('sim-pause').disabled = true;
    }
  },

  /**
   * Execute a single step with delay
   */
  async executeStep(step) {
    const delay = this.getDelay();
    await this.sleep(delay);

    if (this.state.status !== 'playing' && this.state.status !== 'idle') return;

    const result = step.fn();
    this.renderStep(step.key, result);
  },

  /**
   * Get delay based on speed setting + jitter
   */
  getDelay() {
    const baseDelay = {
      slow: 1800,
      normal: 1100,
      fast: 600
    }[this.state.speed] || 1100;

    const jitter = Math.random() * 300 - 150; // ±150ms
    return Math.max(300, baseDelay + jitter);
  },

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Step 1: Load SLA
   */
  stepLoadSLA(params) {
    const sla = params.sla;
    if (!sla) {
      return {
        status: 'fail',
        html: '<p style="color:red;">SLA not found for selected workflow</p>'
      };
    }

    const dept = App.state.catalogs.departments.find(d => d.id === sla.departmentId);
    const bh = App.state.catalogs.businessHours.find(b => b.id === sla.businessHoursId);
    const priority = params.priority || App.state.catalogs.priorities[1]; // default to P2

    const html = `
      <dl class="sim-details">
        <dt>Department:</dt><dd>${dept?.name || 'Unknown'}</dd>
        <dt>Request Type:</dt><dd>${sla.workType}</dd>
        <dt>Priority:</dt><dd>${priority.name}</dd>
        <dt>Business Hours:</dt><dd>${bh?.name || 'Unknown'} (${bh?.hoursPerDay || 9} hrs/day)</dd>
      </dl>
    `;

    return { status: 'pass', html };
  },

  /**
   * Step 2: Sanity Checks
   */
  stepSanity(sla) {
    const validation = App.validateSLA(sla);

    let html = '';
    if (validation.errors.length > 0) {
      html += '<p style="color:red;"><strong>Errors:</strong></p><ul>';
      validation.errors.forEach(err => {
        html += `<li>${err}</li>`;
      });
      html += '</ul>';
    }

    if (validation.warnings.length > 0) {
      html += '<p style="color:orange;"><strong>Warnings:</strong></p><ul>';
      validation.warnings.forEach(warn => {
        html += `<li>${warn}</li>`;
      });
      html += '</ul>';
    }

    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      html = '<p style="color:green;">✓ All checks passed</p>';
    }

    // Update stats
    document.getElementById('stat-errors').textContent = validation.errors.length;
    document.getElementById('stat-warnings').textContent = validation.warnings.length;

    const status = validation.errors.length > 0 ? 'fail' : (validation.warnings.length > 0 ? 'warn' : 'pass');
    return { status, html };
  },

  /**
   * Step 3: Clock & Calendar
   */
  stepCalendar(sla, bh, params) {
    const start = App.time.parseLocal(params.startTime);
    const nextOpen = App.time.nextOpen(start, bh);
    const bands = App.time.workingBands(nextOpen, bh, 3);

    let html = `
      <dl class="sim-details">
        <dt>Start:</dt><dd>${start.toLocaleString()}</dd>
        <dt>Next Open:</dt><dd>${nextOpen.toLocaleString()}</dd>
      </dl>
      <p><strong>Working Bands:</strong></p>
      <ul>
    `;

    bands.forEach(band => {
      html += `<li>${band.date}: ${band.start} - ${band.end}</li>`;
    });

    html += '</ul>';

    this.state.timeline.push({
      t: start.toISOString(),
      event: 'start'
    });

    return { status: 'pass', html };
  },

  /**
   * Step 4: First Response
   */
  stepFirstResponse(sla, bh, params) {
    const priority = params.priority || App.state.catalogs.priorities[1];
    const pSla = sla.slaByPriority?.[priority.id];
    if (!pSla) {
      return { status: 'fail', html: '<p style="color:red;">No SLA defined for this priority</p>' };
    }

    const start = App.time.parseLocal(params.startTime);
    const queueDelay = parseInt(params.queueDelay) || 0;

    const queueEnd = App.time.addMinutes(start, queueDelay);
    const frDue = App.time.addMinutesWithinCalendar(queueEnd, pSla.ackMins, bh);
    const buffer = App.time.bufferToEdge(queueEnd, frDue, bh);

    const html = `
      <dl class="sim-details">
        <dt>Queue Start:</dt><dd>${start.toLocaleString()}</dd>
        ${queueDelay > 0 ? `<dt>Queue End:</dt><dd>${queueEnd.toLocaleString()}</dd>` : ''}
        <dt>FR Due:</dt><dd>${frDue.toLocaleString()}</dd>
        <dt>Buffer:</dt><dd>${buffer} minutes</dd>
      </dl>
    `;

    // Update stats
    document.getElementById('stat-fr').textContent = frDue.toLocaleString();
    document.getElementById('stat-buffer').textContent = buffer;

    this.state.timeline.push({
      t: frDue.toISOString(),
      event: 'fr_due'
    });

    if (queueDelay > 0) {
      this.state.timeline.push({
        t: queueEnd.toISOString(),
        event: 'queue_end'
      });
    }

    return { status: buffer > 0 ? 'pass' : 'warn', html };
  },

  /**
   * Step 5: Resolution
   */
  stepResolution(sla, bh, params) {
    const priority = params.priority || App.state.catalogs.priorities[1];
    const pSla = sla.slaByPriority?.[priority.id];
    if (!pSla) {
      return { status: 'fail', html: '<p style="color:red;">No SLA defined</p>' };
    }

    const start = App.time.parseLocal(params.startTime);
    const queueDelay = parseInt(params.queueDelay) || 0;
    const queueEnd = App.time.addMinutes(start, queueDelay);

    // Calculate resolution due time
    const resDue = App.time.addMinutesWithinCalendar(queueEnd, pSla.resolveMins, bh);

    // Simulate pauses based on scenario
    let pauseCount = 0;
    let pauseDuration = 0;
    if (params.scenario === 'waiting' || params.scenario === 'blocker') {
      pauseCount = 1;
      pauseDuration = 120;
      this.state.timeline.push({
        t: App.time.addMinutes(start, 60).toISOString(),
        event: 'pause_start',
        reason: 'waiting_requester'
      });
      this.state.timeline.push({
        t: App.time.addMinutes(start, 60 + pauseDuration).toISOString(),
        event: 'pause_end'
      });
    }

    const totalWorkMins = pSla.resolveMins - pauseDuration;

    const html = `
      <dl class="sim-details">
        <dt>RES Due:</dt><dd>${resDue.toLocaleString()}</dd>
        <dt>Pauses:</dt><dd>${pauseCount} (${pauseDuration} mins)</dd>
        <dt>Work Time:</dt><dd>${totalWorkMins} mins</dd>
      </dl>
    `;

    // Update stats
    document.getElementById('stat-res').textContent = resDue.toLocaleString();

    this.state.timeline.push({
      t: resDue.toISOString(),
      event: 'res_due'
    });

    return { status: 'pass', html };
  },

  /**
   * Step 6: Escalations
   */
  stepEscalations(sla, bh, params) {
    const priority = params.priority || App.state.catalogs.priorities[1];
    const pSla = sla.slaByPriority?.[priority.id];

    let escalations = [];
    if (pSla?.escalate?.afterMins) {
      const start = App.time.parseLocal(params.startTime);
      const escTime = App.time.addMinutesWithinCalendar(start, pSla.escalate.afterMins, bh);
      escalations.push({
        tier: 1,
        time: escTime,
        toRole: pSla.escalate.toRoleId || 'Unknown'
      });

      this.state.timeline.push({
        t: escTime.toISOString(),
        event: 'tier1'
      });
    }

    let html = '';
    if (escalations.length === 0) {
      html = '<p style="color:#666;">No escalations configured</p>';
    } else {
      html = '<ul>';
      escalations.forEach(esc => {
        const role = App.state.catalogs.roles.find(r => r.id === esc.toRole);
        html += `<li>Tier ${esc.tier}: ${esc.time.toLocaleString()} → ${role?.name || esc.toRole}</li>`;
      });
      html += '</ul>';
    }

    // Update stats
    document.getElementById('stat-esc').textContent = escalations.length;

    return { status: escalations.length > 0 ? 'warn' : 'pass', html };
  },

  /**
   * Step 7: Verdict
   */
  stepVerdict() {
    const errors = parseInt(document.getElementById('stat-errors').textContent) || 0;
    const warnings = parseInt(document.getElementById('stat-warnings').textContent) || 0;
    const buffer = parseInt(document.getElementById('stat-buffer').textContent) || 0;

    const feasible = errors === 0 && buffer >= 0;

    let html = `
      <dl class="sim-details">
        <dt>Feasible:</dt><dd style="color:${feasible ? 'green' : 'red'};">${feasible ? 'Yes' : 'No'}</dd>
        <dt>Buffer:</dt><dd>${buffer} minutes</dd>
        <dt>Errors:</dt><dd>${errors}</dd>
        <dt>Warnings:</dt><dd>${warnings}</dd>
      </dl>
    `;

    // Update stats
    document.getElementById('stat-feasible').textContent = feasible ? 'Yes' : 'No';
    document.getElementById('stat-feasible').style.color = feasible ? 'green' : 'red';

    // Render timeline
    this.renderTimeline();

    return { status: feasible ? 'pass' : 'fail', html };
  },

  /**
   * Render step result to DOM
   */
  renderStep(key, result) {
    const card = document.querySelector(`.step-card[data-step="${key}"]`);
    if (!card) return;

    const badge = card.querySelector('.badge');
    const body = card.querySelector('.body');

    // Update badge
    badge.className = 'badge ' + result.status;
    badge.textContent = result.status.toUpperCase();

    // Update body
    body.innerHTML = result.html;
  },

  /**
   * Render timeline markers
   */
  renderTimeline() {
    const container = document.getElementById('sim-timeline');
    if (!container || this.state.timeline.length === 0) return;

    const timeline = this.state.timeline.sort((a, b) => new Date(a.t) - new Date(b.t));
    const start = new Date(timeline[0].t);
    const end = new Date(timeline[timeline.length - 1].t);
    const duration = end - start;

    let html = '';
    timeline.forEach(event => {
      const eventTime = new Date(event.t);
      const offset = ((eventTime - start) / duration) * 100;
      const color = {
        start: '#3498db',
        queue_end: '#95a5a6',
        fr_due: '#2ecc71',
        pause_start: '#e74c3c',
        pause_end: '#2ecc71',
        tier1: '#f39c12',
        res_due: '#9b59b6'
      }[event.event] || '#666';

      html += `<div class="marker" style="left:${offset}%; background:${color};" title="${event.event}: ${eventTime.toLocaleString()}"></div>`;
    });

    container.innerHTML = html;
  }
};
