/**
 * SLA & Workflow Mapping Tool - Dropdown Configuration
 * Version 2.0 - Enhanced with Dropdowns
 *
 * This file contains all dropdown options, configurations, and mappings
 * for the workflow tool. Designed to be generic and reusable across
 * different organizations.
 */

const dropdownConfig = {
  /**
   * Departments and Functions
   * Used in: Workflow header, Step responsible departments, Filters
   */
  departments: [
    { id: 'css', label: 'Culinary Shared Services (CSS)', abbrev: 'CSS', color: '#4ECDC4' },
    { id: 'ss', label: 'Standards & Specifications (S&S)', abbrev: 'S&S', color: '#9B59B6' },
    { id: 'hd', label: 'Health & Dietetics (H&D)', abbrev: 'H&D', color: '#27AE60' },
    { id: 'md', label: 'Menu Development (MD)', abbrev: 'MD', color: '#E74C3C' },
    { id: 'ft', label: 'Food Technology', abbrev: 'FT', color: '#F39C12' },
    { id: 'ii', label: 'Insight & Intelligence', abbrev: 'I&I', color: '#3498DB' },
    { id: 'wwp', label: 'West Wing Production', abbrev: 'WWP', color: '#8E44AD' },
    { id: 'ewp', label: 'East Wing Production', abbrev: 'EWP', color: '#16A085' },
    { id: 'fp', label: 'Food Point', abbrev: 'FP', color: '#D35400' },
    { id: 'ccu', label: 'CCU (Concourse Catering Unit)', abbrev: 'CCU', color: '#C0392B' },
    { id: 'lounges', label: 'Lounges', abbrev: 'Lounges', color: '#2C3E50' },
    { id: 'comm', label: 'Commercial Operations', abbrev: 'Commercial', color: '#7F8C8D' },
    { id: 'qa', label: 'Quality Assurance', abbrev: 'QA', color: '#E67E22' },
    { id: 'custom', label: '[Custom - Enter Name]', abbrev: 'Custom', color: '#95A5A6' }
  ],

  /**
   * Workflow Categories/Types
   * Used in: Workflow header
   */
  categories: [
    { id: 'new-product', label: 'New Product Development', icon: '🆕' },
    { id: 'menu-revision', label: 'Menu Revision/Modification', icon: '📝' },
    { id: 'menu-engineering', label: 'Menu Engineering', icon: '⚙️' },
    { id: 'concept-dev', label: 'Concept Development & Research', icon: '💡' },
    { id: 'recipe-std', label: 'Recipe Standardization', icon: '📖' },
    { id: 'allergen-verify', label: 'Allergen Verification', icon: '⚠️' },
    { id: 'qc-process', label: 'Quality Control Process', icon: '✓' },
    { id: 'data-mgmt', label: 'Data Management', icon: '📊' },
    { id: 'approval', label: 'Approval Workflow', icon: '✅' },
    { id: 'procurement', label: 'Procurement Process', icon: '🛒' },
    { id: 'training', label: 'Training & Onboarding', icon: '🎓' },
    { id: 'reporting', label: 'Reporting Cycle', icon: '📈' },
    { id: 'compliance', label: 'Compliance Process', icon: '📋' },
    { id: 'cost-analysis', label: 'Cost Analysis', icon: '💰' },
    { id: 'custom', label: '[Custom - Enter Type]', icon: '✏️' }
  ],

  /**
   * Initiation Sources
   * How the workflow was initiated
   */
  initiationSources: [
    { id: 'client', label: 'Initiated by Client' },
    { id: 'internal', label: 'Initiated by Internal Team' },
    { id: 'management', label: 'Initiated by Management' },
    { id: 'shared-services', label: 'Initiated by Shared Services' },
    { id: 'customer', label: 'Customer Request' },
    { id: 'regulatory', label: 'Regulatory Requirement' },
    { id: 'improvement', label: 'Internal Improvement Initiative' },
    { id: 'scheduled', label: 'Scheduled/Recurring Process' },
    { id: 'quality', label: 'Quality Issue Response' },
    { id: 'cost-opt', label: 'Cost Optimization Initiative' },
    { id: 'safety', label: 'Safety Incident Response' },
    { id: 'custom', label: '[Custom - Enter Source]' }
  ],

  /**
   * Priority Levels
   * With color coding
   */
  priorities: [
    { id: 'high', label: 'High (Urgent/Critical)', color: '#E74C3C', style: 'priority-high' },
    { id: 'medium', label: 'Medium (Standard)', color: '#F39C12', style: 'priority-medium' },
    { id: 'low', label: 'Low (Nice to have)', color: '#27AE60', style: 'priority-low' }
  ],

  /**
   * Workflow Status
   * Lifecycle state of the workflow
   */
  statuses: [
    { id: 'draft', label: 'Draft', color: '#95A5A6', description: 'Work in progress' },
    { id: 'active', label: 'Active', color: '#3498DB', description: 'Currently in use' },
    { id: 'under-review', label: 'Under Review', color: '#F39C12', description: 'Being reviewed' },
    { id: 'approved', label: 'Approved', color: '#27AE60', description: 'Approved and finalized' },
    { id: 'on-hold', label: 'On Hold', color: '#E67E22', description: 'Temporarily paused' },
    { id: 'archived', label: 'Archived', color: '#7F8C8D', description: 'No longer active' },
    { id: 'obsolete', label: 'Obsolete', color: '#2C3E50', description: 'Replaced or outdated' }
  ],

  /**
   * Step Types
   * Different types of workflow steps with icons and associated activities
   */
  stepTypes: [
    {
      id: 'task',
      label: 'Standard Task',
      icon: '📋',
      color: '#4ECDC4',
      activities: ['feasibility', 'develop-recipe', 'create-specs', 'project-brief', 'source-ingredients', 'calc-costs', 'arrange-logistics', 'conduct-training', 'document-procedures', 'update-db', 'prepare-materials']
    },
    {
      id: 'approval',
      label: 'Approval/Sign-Off',
      icon: '✅',
      color: '#9B59B6',
      activities: ['internal-preapproval', 'final-approval', 'signoff-specs', 'budget-approval', 'concept-approval', 'mgmt-approval', 'client-approval', 'compliance-approval']
    },
    {
      id: 'review',
      label: 'Review/Verification',
      icon: '🔍',
      color: '#F39C12',
      activities: ['quality-review', 'hd-verification', 'allergen-verify', 'recipe-verify', 'compliance-check', 'standards-review', 'safety-verify', 'cost-verify']
    },
    {
      id: 'workshop',
      label: 'Workshop/Meeting',
      icon: '👥',
      color: '#E67E22',
      activities: ['workshop-dept', 'stakeholder-align', 'feedback-session', 'tasting-session', 'concept-present', 'planning-meeting', 'review-meeting']
    },
    {
      id: 'presentation',
      label: 'Presentation/Showcase',
      icon: '📊',
      color: '#3498DB',
      activities: ['present-leadership', 'present-stakeholders', 'sample-present', 'concept-showcase', 'product-demo', 'training-present']
    },
    {
      id: 'decision',
      label: 'Decision Point',
      icon: '🔀',
      color: '#F1C40F',
      activities: ['approve-reject', 'select-option', 'go-nogo', 'budget-decision', 'resource-decision']
    },
    {
      id: 'external',
      label: 'External Dependency',
      icon: '🔗',
      color: '#95A5A6',
      activities: ['client-request', 'supplier-response', 'external-approval', 'lab-results', 'external-review', 'regulatory-approval']
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: '📄',
      color: '#16A085',
      activities: ['photo-products', 'create-recipe-cards', 'prepare-specs-doc', 'haccp-doc', 'generate-reports', 'update-manuals']
    },
    {
      id: 'testing',
      label: 'Testing/Sampling',
      icon: '🧪',
      color: '#8E44AD',
      activities: ['prepare-sample', 'reheat-trials', 'scaling-tests', 'shelf-life', 'taste-testing', 'quality-testing']
    },
    {
      id: 'quality-check',
      label: 'Quality Check',
      icon: '✓',
      color: '#27AE60',
      activities: ['visual-inspection', 'taste-eval', 'temp-check', 'weight-verify', 'portion-control', 'compliance-audit']
    },
    {
      id: 'feedback',
      label: 'Feedback Loop',
      icon: '🔄',
      color: '#C0392B',
      activities: ['collect-feedback', 'address-concerns', 'incorporate-changes', 'resubmit-review', 'iterate-concept']
    },
    {
      id: 'handoff',
      label: 'Handoff',
      icon: '🤝',
      color: '#D35400',
      activities: ['transfer-production', 'handover-dept', 'provide-specs-supplier', 'send-implementation']
    },
    {
      id: 'data-entry',
      label: 'Data Entry',
      icon: '⌨️',
      color: '#34495E',
      activities: ['generic-data-entry']
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: '📢',
      color: '#1ABC9C',
      activities: ['generic-communication']
    },
    {
      id: 'custom',
      label: '[Custom - Enter Type]',
      icon: '✏️',
      color: '#7F8C8D',
      activities: ['custom-activity']
    }
  ],

  /**
   * Common Activities
   * Mapped to step types for cascading dropdowns
   */
  activities: {
    // Standard Task activities
    'feasibility': { label: 'Conduct feasibility assessment', types: ['task'] },
    'develop-recipe': { label: 'Develop recipe', types: ['task'] },
    'create-specs': { label: 'Create product specifications', types: ['task'] },
    'project-brief': { label: 'Prepare project brief', types: ['task'] },
    'source-ingredients': { label: 'Source ingredients', types: ['task'] },
    'calc-costs': { label: 'Calculate costs', types: ['task'] },
    'arrange-logistics': { label: 'Arrange logistics', types: ['task'] },
    'conduct-training': { label: 'Conduct training', types: ['task'] },
    'document-procedures': { label: 'Document procedures', types: ['task'] },
    'update-db': { label: 'Update database', types: ['task'] },
    'prepare-materials': { label: 'Prepare materials', types: ['task'] },

    // Approval activities
    'internal-preapproval': { label: 'Internal pre-approval', types: ['approval'] },
    'final-approval': { label: 'Final approval', types: ['approval'] },
    'signoff-specs': { label: 'Sign-off on specifications', types: ['approval'] },
    'budget-approval': { label: 'Budget approval', types: ['approval'] },
    'concept-approval': { label: 'Concept alignment approval', types: ['approval'] },
    'mgmt-approval': { label: 'Management approval', types: ['approval'] },
    'client-approval': { label: 'Client approval', types: ['approval'] },
    'compliance-approval': { label: 'Compliance approval', types: ['approval'] },

    // Review activities
    'quality-review': { label: 'Quality review', types: ['review'] },
    'hd-verification': { label: 'Health & Dietetics verification', types: ['review'] },
    'allergen-verify': { label: 'Allergen verification', types: ['review'] },
    'recipe-verify': { label: 'Recipe verification', types: ['review'] },
    'compliance-check': { label: 'Compliance check', types: ['review'] },
    'standards-review': { label: 'Standards alignment review', types: ['review'] },
    'safety-verify': { label: 'Safety verification', types: ['review'] },
    'cost-verify': { label: 'Cost verification', types: ['review'] },

    // Workshop/Meeting activities
    'workshop-dept': { label: 'Workshop with initiating department', types: ['workshop'] },
    'stakeholder-align': { label: 'Stakeholder alignment meeting', types: ['workshop'] },
    'feedback-session': { label: 'Feedback session', types: ['workshop'] },
    'tasting-session': { label: 'Tasting session', types: ['workshop'] },
    'concept-present': { label: 'Concept presentation meeting', types: ['workshop'] },
    'planning-meeting': { label: 'Planning meeting', types: ['workshop'] },
    'review-meeting': { label: 'Review meeting', types: ['workshop'] },

    // Presentation activities
    'present-leadership': { label: 'Present to leadership', types: ['presentation'] },
    'present-stakeholders': { label: 'Present to stakeholders', types: ['presentation'] },
    'sample-present': { label: 'Sample presentation', types: ['presentation'] },
    'concept-showcase': { label: 'Concept showcase', types: ['presentation'] },
    'product-demo': { label: 'Final product demonstration', types: ['presentation'] },
    'training-present': { label: 'Training presentation', types: ['presentation'] },

    // Decision Point activities
    'approve-reject': { label: 'Approve or reject concept', types: ['decision'] },
    'select-option': { label: 'Select preferred option', types: ['decision'] },
    'go-nogo': { label: 'Go/No-go decision', types: ['decision'] },
    'budget-decision': { label: 'Budget allocation decision', types: ['decision'] },
    'resource-decision': { label: 'Resource allocation decision', types: ['decision'] },

    // External Dependency activities
    'client-request': { label: 'Receive client request', types: ['external'] },
    'supplier-response': { label: 'Await supplier response', types: ['external'] },
    'external-approval': { label: 'Pending external approval', types: ['external'] },
    'lab-results': { label: 'Wait for lab results', types: ['external'] },
    'external-review': { label: 'External review', types: ['external'] },
    'regulatory-approval': { label: 'Regulatory approval wait', types: ['external'] },

    // Documentation activities
    'photo-products': { label: 'Photograph products', types: ['documentation'] },
    'create-recipe-cards': { label: 'Create recipe cards', types: ['documentation'] },
    'prepare-specs-doc': { label: 'Prepare specifications', types: ['documentation'] },
    'haccp-doc': { label: 'Complete HACCP documentation', types: ['documentation'] },
    'generate-reports': { label: 'Generate reports', types: ['documentation'] },
    'update-manuals': { label: 'Update manuals', types: ['documentation'] },

    // Testing/Sampling activities
    'prepare-sample': { label: 'Prepare sample product', types: ['testing'] },
    'reheat-trials': { label: 'Conduct reheating trials', types: ['testing'] },
    'scaling-tests': { label: 'Scaling tests', types: ['testing'] },
    'shelf-life': { label: 'Shelf-life testing', types: ['testing'] },
    'taste-testing': { label: 'Taste testing', types: ['testing'] },
    'quality-testing': { label: 'Quality testing', types: ['testing'] },

    // Quality Check activities
    'visual-inspection': { label: 'Visual inspection', types: ['quality-check'] },
    'taste-eval': { label: 'Taste evaluation', types: ['quality-check'] },
    'temp-check': { label: 'Temperature check', types: ['quality-check'] },
    'weight-verify': { label: 'Weight verification', types: ['quality-check'] },
    'portion-control': { label: 'Portion control check', types: ['quality-check'] },
    'compliance-audit': { label: 'Compliance audit', types: ['quality-check'] },

    // Feedback Loop activities
    'collect-feedback': { label: 'Collect feedback', types: ['feedback'] },
    'address-concerns': { label: 'Address concerns', types: ['feedback'] },
    'incorporate-changes': { label: 'Incorporate changes', types: ['feedback'] },
    'resubmit-review': { label: 'Re-submit for review', types: ['feedback'] },
    'iterate-concept': { label: 'Iterate on concept', types: ['feedback'] },

    // Handoff activities
    'transfer-production': { label: 'Transfer to production team', types: ['handoff'] },
    'handover-dept': { label: 'Hand over to next department', types: ['handoff'] },
    'provide-specs-supplier': { label: 'Provide specifications to supplier', types: ['handoff'] },
    'send-implementation': { label: 'Send for implementation', types: ['handoff'] },

    // Generic activities
    'generic-data-entry': { label: '[Custom activity]', types: ['data-entry'] },
    'generic-communication': { label: '[Custom activity]', types: ['communication'] },
    'custom-activity': { label: '[Custom - Enter activity]', types: ['custom'] }
  },

  /**
   * Responsible Person Roles
   * Organized by hierarchy level
   */
  roles: {
    executive: [
      'SVP Culinary',
      'VP Culinary Shared Services',
      'Assistant Vice President',
      'Director'
    ],
    management: [
      'Senior Manager',
      'Manager',
      'Assistant Manager',
      'Executive Chef'
    ],
    specialist: [
      'Executive Sous Chef',
      'Chef de Cuisine',
      'Sous Chef',
      'Chef de Partie',
      'Specialist (Health & Dietetics)',
      'Specialist (Standards & Specifications)',
      'Specialist (Food Technology)',
      'Analyst',
      'Coordinator'
    ],
    support: [
      'Admin Assistant',
      'Team Member',
      'Coordinator'
    ],
    external: [
      'Client Representative',
      'External Consultant',
      'Supplier Representative'
    ],
    custom: [
      '[Custom - Enter Name]'
    ]
  },

  /**
   * Dependencies
   * Things a step might depend on
   */
  dependencies: [
    { id: 'client-approval', label: 'Client Approval Required', category: 'external' },
    { id: 'customer-approval', label: 'Customer Approval Required', category: 'external' },
    { id: 'external-stakeholder', label: 'External Stakeholder Approval', category: 'external' },
    { id: 'css-review', label: 'CSS Review Required', category: 'internal' },
    { id: 'hd-verify', label: 'H&D Verification Required', category: 'internal' },
    { id: 'ss-specs', label: 'S&S Specifications Required', category: 'internal' },
    { id: 'ft-assessment', label: 'Food Tech Assessment Required', category: 'internal' },
    { id: 'production-input', label: 'Production Team Input', category: 'internal' },
    { id: 'qa-team', label: 'Quality Assurance Team', category: 'internal' },
    { id: 'health-safety', label: 'Health & Safety Verification', category: 'internal' },
    { id: 'standards-verify', label: 'Standards Verification', category: 'internal' },
    { id: 'costing-dept', label: 'Costing Department', category: 'internal' },
    { id: 'procurement', label: 'Procurement Team', category: 'internal' },
    { id: 'commercial', label: 'Commercial Team', category: 'internal' },
    { id: 'finance', label: 'Finance Approval', category: 'internal' },
    { id: 'it-systems', label: 'IT/Systems Support', category: 'internal' },
    { id: 'external-supplier', label: 'External Supplier', category: 'external' },
    { id: 'lab-testing', label: 'Laboratory Testing', category: 'external' },
    { id: 'regulatory', label: 'Regulatory Compliance', category: 'external' },
    { id: 'training-complete', label: 'Training Completion', category: 'internal' },
    { id: 'equipment', label: 'Equipment Availability', category: 'internal' },
    { id: 'recipe-dev', label: 'Recipe Development', category: 'internal' },
    { id: 'photo-media', label: 'Photograph/Media Production', category: 'internal' },
    { id: 'custom', label: '[Custom - Enter Dependency]', category: 'custom' }
  ],

  /**
   * Duration Units
   */
  durationUnits: [
    { id: 'hours', label: 'Hours', multiplier: 1 },
    { id: 'business-days', label: 'Business Days', multiplier: 8 },
    { id: 'calendar-days', label: 'Calendar Days', multiplier: 24 / 7 }, // Approximate
    { id: 'weeks', label: 'Weeks', multiplier: 40 }
  ],

  /**
   * Step Status
   * For active workflow tracking
   */
  stepStatuses: [
    { id: 'not-started', label: 'Not Started', color: '#95A5A6', icon: '⭕' },
    { id: 'in-progress', label: 'In Progress', color: '#3498DB', icon: '▶️' },
    { id: 'waiting', label: 'Waiting for Input', color: '#F39C12', icon: '⏸️' },
    { id: 'under-review', label: 'Under Review', color: '#9B59B6', icon: '🔍' },
    { id: 'completed', label: 'Completed', color: '#27AE60', icon: '✅' },
    { id: 'blocked', label: 'Blocked', color: '#E74C3C', icon: '🚫' },
    { id: 'delayed', label: 'Delayed', color: '#E67E22', icon: '⚠️' }
  ],

  /**
   * Risk Levels
   * Indicates complexity and potential issues
   */
  riskLevels: [
    {
      id: 'low',
      label: 'Low Risk',
      color: '#27AE60',
      description: 'Routine, well-established process',
      icon: '🟢'
    },
    {
      id: 'medium',
      label: 'Medium Risk',
      color: '#F39C12',
      description: 'Some complexity/dependencies',
      icon: '🟡'
    },
    {
      id: 'high',
      label: 'High Risk',
      color: '#E74C3C',
      description: 'Critical path, multiple dependencies, tight timeline',
      icon: '🔴'
    }
  ],

  /**
   * Known Issues/Challenges Tags
   * Multi-select tags for common issues
   */
  knownIssuesTags: [
    { id: 'supplier-delays', label: 'Supplier delays', color: '#E74C3C' },
    { id: 'seasonal', label: 'Seasonal availability', color: '#F39C12' },
    { id: 'complex-prep', label: 'Complex preparation', color: '#E67E22' },
    { id: 'equipment-limits', label: 'Equipment limitations', color: '#C0392B' },
    { id: 'skill-req', label: 'Skill requirements', color: '#8E44AD' },
    { id: 'cost-constraints', label: 'Cost constraints', color: '#D35400' },
    { id: 'regulatory', label: 'Regulatory hurdles', color: '#C0392B' },
    { id: 'tight-timeline', label: 'Tight timeline', color: '#E74C3C' },
    { id: 'multi-approvals', label: 'Multiple approvals needed', color: '#9B59B6' },
    { id: 'coordination', label: 'Coordination challenges', color: '#34495E' },
    { id: 'resource-constraints', label: 'Resource constraints', color: '#7F8C8D' },
    { id: 'technical', label: 'Technical complexity', color: '#2C3E50' },
    { id: 'weather', label: 'Weather dependent', color: '#3498DB' },
    { id: 'custom', label: '[Custom tag]', color: '#95A5A6' }
  ],

  /**
   * Best Practices/Tips Tags
   * Multi-select tags for common practices
   */
  bestPracticesTags: [
    { id: 'early-engagement', label: 'Early stakeholder engagement', color: '#27AE60' },
    { id: 'buffer-time', label: 'Buffer time recommended', color: '#3498DB' },
    { id: 'parallel-processing', label: 'Parallel processing possible', color: '#1ABC9C' },
    { id: 'template-available', label: 'Template available', color: '#16A085' },
    { id: 'training-required', label: 'Training required', color: '#9B59B6' },
    { id: 'doc-critical', label: 'Documentation critical', color: '#E67E22' },
    { id: 'photo-prep', label: 'Photography prep needed', color: '#F39C12' },
    { id: 'sample-guidelines', label: 'Sample prep guidelines', color: '#27AE60' },
    { id: 'clear-comms', label: 'Clear communication essential', color: '#3498DB' },
    { id: 'regular-checkins', label: 'Regular check-ins advised', color: '#2ECC71' },
    { id: 'backup-plan', label: 'Backup plan needed', color: '#E74C3C' },
    { id: 'custom', label: '[Custom tag]', color: '#95A5A6' }
  ]
};

/**
 * Helper Functions
 */
const DropdownHelpers = {
  /**
   * Get activities for a specific step type
   */
  getActivitiesForStepType(stepTypeId) {
    const stepType = dropdownConfig.stepTypes.find(st => st.id === stepTypeId);
    if (!stepType) return [];

    return stepType.activities.map(activityId => ({
      id: activityId,
      ...dropdownConfig.activities[activityId]
    }));
  },

  /**
   * Get all roles as a flat array with category headers
   */
  getAllRolesWithCategories() {
    const result = [];
    const categories = {
      executive: 'Executive Level',
      management: 'Management Level',
      specialist: 'Specialist Level',
      support: 'Support Level',
      external: 'External',
      custom: 'Custom'
    };

    Object.keys(dropdownConfig.roles).forEach(category => {
      result.push({
        type: 'category',
        label: categories[category]
      });
      dropdownConfig.roles[category].forEach(role => {
        result.push({
          type: 'option',
          value: role,
          label: role,
          category: category
        });
      });
    });

    return result;
  },

  /**
   * Get color for a department by ID
   */
  getDepartmentColor(deptId) {
    const dept = dropdownConfig.departments.find(d => d.id === deptId);
    return dept ? dept.color : '#95A5A6';
  },

  /**
   * Get icon for a step type
   */
  getStepTypeIcon(stepTypeId) {
    const stepType = dropdownConfig.stepTypes.find(st => st.id === stepTypeId);
    return stepType ? stepType.icon : '📋';
  },

  /**
   * Filter dependencies by category
   */
  getDependenciesByCategory(category) {
    return dropdownConfig.dependencies.filter(d => d.category === category);
  },

  /**
   * Get recent selections from localStorage
   */
  getRecentSelections(fieldName, maxItems = 5) {
    const key = `recent_${fieldName}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    try {
      return JSON.parse(stored).slice(0, maxItems);
    } catch (e) {
      return [];
    }
  },

  /**
   * Save recent selection to localStorage
   */
  saveRecentSelection(fieldName, value) {
    const key = `recent_${fieldName}`;
    let recent = this.getRecentSelections(fieldName, 10);

    // Remove if already exists
    recent = recent.filter(v => v !== value);

    // Add to front
    recent.unshift(value);

    // Keep max 10
    recent = recent.slice(0, 10);

    localStorage.setItem(key, JSON.stringify(recent));
  }
};

// Export for use in other modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { dropdownConfig, DropdownHelpers };
}
