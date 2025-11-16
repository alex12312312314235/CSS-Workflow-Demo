// Workflow templates by department
// These are used for the Build "Add from Template" feature

const WorkflowTemplates = {
  byDept: {
    cd: [
      {
        workType: 'Concept – Route Launch (J/C/Y)',
        origin: 'client',
        ownerRole: 'cd_chef',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'cd_chef', expectedMins: 120 },
          { title: 'Feasibility', roleId: 'cd_chef', expectedMins: 240 },
          { title: 'CSS Gate', roleId: 'hod_cd', expectedMins: 60 },
          { title: 'Showcase', roleId: 'cd_chef', expectedMins: 60 },
          { title: 'Trial', roleId: 'cd_chef', expectedMins: 480 },
          { title: 'Spec Pack', roleId: 'spec_analyst', expectedMins: 240 }
        ],
        sla: { ack: 60, start: 240, resolve: 4320 } // 8 BD default
      },
      {
        workType: 'Concept Refresh – Seasonal (Lounges)',
        origin: 'internal',
        ownerRole: 'cd_chef',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'cd_chef', expectedMins: 60 },
          { title: 'CSS Gate', roleId: 'hod_cd', expectedMins: 60 },
          { title: 'Showcase', roleId: 'cd_chef', expectedMins: 60 },
          { title: 'Spec Pack', roleId: 'spec_analyst', expectedMins: 180 }
        ],
        sla: { ack: 60, start: 240, resolve: 2160 } // 4 BD
      },
      {
        workType: 'Menu Engineering – Premium Refresh',
        origin: 'internal',
        ownerRole: 'cd_chef',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'sm_cd', expectedMins: 60 },
          { title: 'Feasibility', roleId: 'cd_chef', expectedMins: 180 },
          { title: 'CSS Gate', roleId: 'hod_cd', expectedMins: 60 },
          { title: 'Showcase', roleId: 'cd_chef', expectedMins: 120 },
          { title: 'Trial', roleId: 'cd_chef', expectedMins: 360 },
          { title: 'Spec Pack', roleId: 'spec_analyst', expectedMins: 240 }
        ],
        sla: { ack: 60, start: 240, resolve: 3600 } // 6-7 BD
      },
      {
        workType: 'New Dish Development – Economy Class',
        origin: 'client',
        ownerRole: 'cd_chef',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'cd_chef', expectedMins: 60 },
          { title: 'Concept Development', roleId: 'cd_chef', expectedMins: 180 },
          { title: 'CSS Gate', roleId: 'hod_cd', expectedMins: 30 },
          { title: 'Recipe Testing', roleId: 'cd_chef', expectedMins: 360 },
          { title: 'Cost Analysis', roleId: 'spec_analyst', expectedMins: 120 },
          { title: 'Spec Pack', roleId: 'spec_analyst', expectedMins: 180 }
        ],
        sla: {
          p1: { firstResponseHours: 2, followUpHours: 4, resolutionHours: 72 },
          p2: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 96 },
          p3: { firstResponseHours: 12, followUpHours: 24, resolutionHours: 120 }
        }
      },
      {
        workType: 'Seasonal Refresh – Business Class',
        origin: 'internal',
        ownerRole: 'cd_chef',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'sm_cd', expectedMins: 60 },
          { title: 'Market Research', roleId: 'cd_chef', expectedMins: 120 },
          { title: 'Concept Selection', roleId: 'cd_chef', expectedMins: 180 },
          { title: 'CSS Gate', roleId: 'hod_cd', expectedMins: 60 },
          { title: 'Recipe Development', roleId: 'cd_chef', expectedMins: 360 },
          { title: 'Showcase', roleId: 'cd_chef', expectedMins: 120 },
          { title: 'Spec Pack', roleId: 'spec_analyst', expectedMins: 240 }
        ],
        sla: {
          p1: { firstResponseHours: 2, followUpHours: 4, resolutionHours: 72 },
          p2: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 96 },
          p3: { firstResponseHours: 12, followUpHours: 24, resolutionHours: 120 }
        }
      }
    ],

    sands: [
      {
        workType: 'Spec Update – Allergen Revision',
        origin: 'client',
        ownerRole: 'spec_analyst',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'spec_analyst', expectedMins: 30 },
          { title: 'Feasibility', roleId: 'food_tech', expectedMins: 60 },
          { title: 'CSS Gate', roleId: 'hod_sands', expectedMins: 30 },
          { title: 'Spec Pack', roleId: 'spec_analyst', expectedMins: 180 }
        ],
        sla: { ack: 60, start: 120, resolve: 1440 } // 1–2 BD
      },
      {
        workType: 'New Recipe Code + Costing',
        origin: 'internal',
        ownerRole: 'spec_analyst',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'spec_analyst', expectedMins: 30 },
          { title: 'CSS Gate', roleId: 'sm_sands', expectedMins: 30 },
          { title: 'Spec Pack', roleId: 'spec_analyst', expectedMins: 240 }
        ],
        sla: { ack: 60, start: 120, resolve: 1440 }
      },
      {
        workType: 'Standards Audit – Recipe Compliance',
        origin: 'internal',
        ownerRole: 'spec_analyst',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'hod_sands', expectedMins: 60 },
          { title: 'Audit', roleId: 'spec_analyst', expectedMins: 480 },
          { title: 'CSS Gate', roleId: 'hod_sands', expectedMins: 60 },
          { title: 'Report', roleId: 'spec_analyst', expectedMins: 240 }
        ],
        sla: { ack: 120, start: 240, resolve: 4320 } // 8 BD
      },
      {
        workType: 'Recipe Standardization – Route Alignment',
        origin: 'internal',
        ownerRole: 'spec_analyst',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'spec_analyst', expectedMins: 30 },
          { title: 'Recipe Review', roleId: 'spec_analyst', expectedMins: 180 },
          { title: 'CSS Gate', roleId: 'sm_sands', expectedMins: 30 },
          { title: 'Standardization', roleId: 'spec_analyst', expectedMins: 240 },
          { title: 'Spec Update', roleId: 'spec_analyst', expectedMins: 120 }
        ],
        sla: {
          p1: { firstResponseHours: 2, followUpHours: 4, resolutionHours: 48 },
          p2: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 72 },
          p3: { firstResponseHours: 12, followUpHours: 24, resolutionHours: 96 }
        }
      },
      {
        workType: 'Spec Update – Packaging Change',
        origin: 'client',
        ownerRole: 'spec_analyst',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'spec_analyst', expectedMins: 20 },
          { title: 'Impact Assessment', roleId: 'spec_analyst', expectedMins: 60 },
          { title: 'CSS Gate', roleId: 'sm_sands', expectedMins: 30 },
          { title: 'Spec Pack Update', roleId: 'spec_analyst', expectedMins: 120 }
        ],
        sla: {
          p1: { firstResponseHours: 1, followUpHours: 2, resolutionHours: 24 },
          p2: { firstResponseHours: 4, followUpHours: 8, resolutionHours: 48 },
          p3: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 72 }
        }
      },
      {
        workType: 'Calorie Validation – Menu Item',
        origin: 'client',
        ownerRole: 'spec_analyst',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'spec_analyst', expectedMins: 15 },
          { title: 'Recipe Analysis', roleId: 'spec_analyst', expectedMins: 90 },
          { title: 'Nutritional Calculation', roleId: 'dietitian', expectedMins: 120 },
          { title: 'CSS Gate', roleId: 'sm_sands', expectedMins: 30 },
          { title: 'Validation Report', roleId: 'spec_analyst', expectedMins: 60 }
        ],
        sla: {
          p1: { firstResponseHours: 1, followUpHours: 2, resolutionHours: 24 },
          p2: { firstResponseHours: 4, followUpHours: 8, resolutionHours: 48 },
          p3: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 72 }
        }
      },
      {
        workType: 'Master Spec Review – Annual Update',
        origin: 'internal',
        ownerRole: 'spec_analyst',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'hod_sands', expectedMins: 60 },
          { title: 'Spec Audit', roleId: 'spec_analyst', expectedMins: 360 },
          { title: 'Cross-functional Review', roleId: 'food_tech', expectedMins: 180 },
          { title: 'CSS Gate', roleId: 'hod_sands', expectedMins: 60 },
          { title: 'Update & Publish', roleId: 'spec_analyst', expectedMins: 240 }
        ],
        sla: {
          p1: { firstResponseHours: 4, followUpHours: 8, resolutionHours: 72 },
          p2: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 96 },
          p3: { firstResponseHours: 12, followUpHours: 24, resolutionHours: 120 }
        }
      }
    ],

    ft: [
      {
        workType: 'Shelf-life Validation (Chilled)',
        origin: 'client',
        ownerRole: 'food_tech',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'food_tech', expectedMins: 30 },
          { title: 'Feasibility', roleId: 'food_tech', expectedMins: 60 },
          { title: 'CSS Gate', roleId: 'hod_ft', expectedMins: 30 },
          { title: 'Lab Plan & Trial', roleId: 'food_tech', expectedMins: 360 },
          { title: 'Report', roleId: 'food_tech', expectedMins: 240 }
        ],
        sla: {
          p1: { firstResponseHours: 1, followUpHours: 2, resolutionHours: 48 },
          p2: { firstResponseHours: 4, followUpHours: 8, resolutionHours: 72 },
          p3: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 96 }
        }
      },
      {
        workType: 'Shelf-life Validation (Frozen)',
        origin: 'client',
        ownerRole: 'food_tech',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'food_tech', expectedMins: 30 },
          { title: 'Feasibility', roleId: 'food_tech', expectedMins: 60 },
          { title: 'CSS Gate', roleId: 'hod_ft', expectedMins: 30 },
          { title: 'Lab Plan & Trial', roleId: 'food_tech', expectedMins: 480 },
          { title: 'Report', roleId: 'food_tech', expectedMins: 240 }
        ],
        sla: {
          p1: { firstResponseHours: 1, followUpHours: 2, resolutionHours: 72 },
          p2: { firstResponseHours: 4, followUpHours: 8, resolutionHours: 96 },
          p3: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 120 }
        }
      },
      {
        workType: 'Product Safety Review – HACCP',
        origin: 'client',
        ownerRole: 'food_tech',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'food_tech', expectedMins: 60 },
          { title: 'Risk Assessment', roleId: 'food_tech', expectedMins: 240 },
          { title: 'CSS Gate', roleId: 'hod_ft', expectedMins: 60 },
          { title: 'HACCP Plan', roleId: 'food_tech', expectedMins: 360 },
          { title: 'Report', roleId: 'food_tech', expectedMins: 180 }
        ],
        sla: {
          p1: { firstResponseHours: 1, followUpHours: 2, resolutionHours: 48 },
          p2: { firstResponseHours: 4, followUpHours: 8, resolutionHours: 72 },
          p3: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 96 }
        }
      },
      {
        workType: 'Supplier Audit – Quality Assurance',
        origin: 'internal',
        ownerRole: 'food_tech',
        businessHoursId: 'bh_ops',
        steps: [
          { title: 'Brief', roleId: 'sm_ft', expectedMins: 60 },
          { title: 'Site Visit', roleId: 'food_tech', expectedMins: 480 },
          { title: 'CSS Gate', roleId: 'hod_ft', expectedMins: 60 },
          { title: 'Report', roleId: 'food_tech', expectedMins: 360 }
        ],
        sla: {
          p1: { firstResponseHours: 2, followUpHours: 4, resolutionHours: 72 },
          p2: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 96 },
          p3: { firstResponseHours: 12, followUpHours: 24, resolutionHours: 120 }
        }
      },
      {
        workType: 'Ingredient Qualification – New Supplier',
        origin: 'client',
        ownerRole: 'food_tech',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'food_tech', expectedMins: 30 },
          { title: 'Spec Review', roleId: 'food_tech', expectedMins: 60 },
          { title: 'Sample Testing', roleId: 'food_tech', expectedMins: 360 },
          { title: 'CSS Gate', roleId: 'hod_ft', expectedMins: 30 },
          { title: 'Qualification Report', roleId: 'food_tech', expectedMins: 180 }
        ],
        sla: {
          p1: { firstResponseHours: 1, followUpHours: 2, resolutionHours: 48 },
          p2: { firstResponseHours: 4, followUpHours: 8, resolutionHours: 72 },
          p3: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 96 }
        }
      },
      {
        workType: 'Allergen Investigation – Cross-Contact',
        origin: 'client',
        ownerRole: 'food_tech',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'food_tech', expectedMins: 15 },
          { title: 'Site Investigation', roleId: 'food_tech', expectedMins: 240 },
          { title: 'Risk Assessment', roleId: 'food_tech', expectedMins: 120 },
          { title: 'CSS Gate', roleId: 'hod_ft', expectedMins: 30 },
          { title: 'Report', roleId: 'food_tech', expectedMins: 120 }
        ],
        sla: {
          p1: { firstResponseHours: 1, followUpHours: 2, resolutionHours: 24 },
          p2: { firstResponseHours: 2, followUpHours: 4, resolutionHours: 48 },
          p3: { firstResponseHours: 4, followUpHours: 8, resolutionHours: 72 }
        }
      },
      {
        workType: 'Root Cause Analysis – Quality Incident',
        origin: 'client',
        ownerRole: 'food_tech',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'food_tech', expectedMins: 30 },
          { title: 'Data Collection', roleId: 'food_tech', expectedMins: 180 },
          { title: 'Analysis & Testing', roleId: 'food_tech', expectedMins: 360 },
          { title: 'CSS Gate', roleId: 'hod_ft', expectedMins: 60 },
          { title: 'CAPA Report', roleId: 'food_tech', expectedMins: 240 }
        ],
        sla: {
          p1: { firstResponseHours: 1, followUpHours: 2, resolutionHours: 48 },
          p2: { firstResponseHours: 4, followUpHours: 8, resolutionHours: 72 },
          p3: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 96 }
        }
      }
    ],

    hd: [
      {
        workType: 'Menu Nutrition Review',
        origin: 'client',
        ownerRole: 'dietitian',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'dietitian', expectedMins: 30 },
          { title: 'CSS Gate', roleId: 'hod_hd', expectedMins: 30 },
          { title: 'Analysis', roleId: 'dietitian', expectedMins: 360 },
          { title: 'Report', roleId: 'dietitian', expectedMins: 180 }
        ],
        sla: { ack: 60, start: 240, resolve: 2160 } // 4 BD
      },
      {
        workType: 'Allergen Declaration – New Product',
        origin: 'client',
        ownerRole: 'dietitian',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'dietitian', expectedMins: 30 },
          { title: 'Feasibility', roleId: 'food_tech', expectedMins: 60 },
          { title: 'CSS Gate', roleId: 'hod_hd', expectedMins: 30 },
          { title: 'Analysis', roleId: 'dietitian', expectedMins: 240 },
          { title: 'Report', roleId: 'dietitian', expectedMins: 120 }
        ],
        sla: { ack: 60, start: 120, resolve: 2160 } // 4 BD
      },
      {
        workType: 'Special Diet Plan – Medical Request',
        origin: 'client',
        ownerRole: 'dietitian',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'dietitian', expectedMins: 60 },
          { title: 'CSS Gate', roleId: 'hod_hd', expectedMins: 30 },
          { title: 'Plan Design', roleId: 'dietitian', expectedMins: 360 },
          { title: 'Stakeholder Review', roleId: 'sm_hd', expectedMins: 60 },
          { title: 'Report', roleId: 'dietitian', expectedMins: 120 }
        ],
        sla: { ack: 60, start: 120, resolve: 2700 } // 5 BD
      },
      {
        workType: 'Menu Compliance – Dietary Guidelines',
        origin: 'internal',
        ownerRole: 'dietitian',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'dietitian', expectedMins: 30 },
          { title: 'Menu Audit', roleId: 'dietitian', expectedMins: 240 },
          { title: 'Compliance Analysis', roleId: 'dietitian', expectedMins: 180 },
          { title: 'CSS Gate', roleId: 'hod_hd', expectedMins: 30 },
          { title: 'Report & Recommendations', roleId: 'dietitian', expectedMins: 120 }
        ],
        sla: {
          p1: { firstResponseHours: 2, followUpHours: 4, resolutionHours: 48 },
          p2: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 72 },
          p3: { firstResponseHours: 12, followUpHours: 24, resolutionHours: 96 }
        }
      },
      {
        workType: 'Special Meal Approval – Cultural/Religious',
        origin: 'client',
        ownerRole: 'dietitian',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'dietitian', expectedMins: 30 },
          { title: 'Requirements Review', roleId: 'dietitian', expectedMins: 60 },
          { title: 'CSS Gate', roleId: 'sm_hd', expectedMins: 30 },
          { title: 'Meal Plan Design', roleId: 'dietitian', expectedMins: 180 },
          { title: 'Approval & Documentation', roleId: 'hod_hd', expectedMins: 60 }
        ],
        sla: {
          p1: { firstResponseHours: 1, followUpHours: 2, resolutionHours: 24 },
          p2: { firstResponseHours: 4, followUpHours: 8, resolutionHours: 48 },
          p3: { firstResponseHours: 8, followUpHours: 16, resolutionHours: 72 }
        }
      }
    ],

    ii: [
      {
        workType: 'Menu Data Cleanup – Cycle (EK/OAL)',
        origin: 'internal',
        ownerRole: 'data_analyst',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'data_analyst', expectedMins: 30 },
          { title: 'CSS Gate', roleId: 'hod_ii', expectedMins: 30 },
          { title: 'Data Alignment', roleId: 'data_analyst', expectedMins: 360 },
          { title: 'Dashboard Update', roleId: 'data_analyst', expectedMins: 240 }
        ],
        sla: { ack: 60, start: 240, resolve: 2160 }
      },
      {
        workType: 'Production Forecast – Route Change',
        origin: 'client',
        ownerRole: 'planner',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'planner', expectedMins: 30 },
          { title: 'Feasibility', roleId: 'data_analyst', expectedMins: 60 },
          { title: 'CSS Gate', roleId: 'hod_ii', expectedMins: 30 },
          { title: 'Forecast Run', roleId: 'planner', expectedMins: 240 },
          { title: 'Stakeholder Review', roleId: 'sm_ii', expectedMins: 60 }
        ],
        sla: { ack: 60, start: 120, resolve: 1440 }
      },
      {
        workType: 'Demand Analysis – New Route Launch',
        origin: 'client',
        ownerRole: 'data_analyst',
        businessHoursId: 'bh_ops',
        steps: [
          { title: 'Brief', roleId: 'sm_ii', expectedMins: 60 },
          { title: 'Data Collection', roleId: 'data_analyst', expectedMins: 240 },
          { title: 'CSS Gate', roleId: 'hod_ii', expectedMins: 60 },
          { title: 'Analysis', roleId: 'data_analyst', expectedMins: 480 },
          { title: 'Forecast Model', roleId: 'planner', expectedMins: 360 },
          { title: 'Report', roleId: 'data_analyst', expectedMins: 240 }
        ],
        sla: { ack: 60, start: 240, resolve: 6480 } // ~12 BD
      },
      {
        workType: 'KPI Dashboard – Monthly Update',
        origin: 'internal',
        ownerRole: 'data_analyst',
        businessHoursId: 'bh_std',
        steps: [
          { title: 'Brief', roleId: 'hod_ii', expectedMins: 30 },
          { title: 'Data Refresh', roleId: 'data_analyst', expectedMins: 180 },
          { title: 'CSS Gate', roleId: 'sm_ii', expectedMins: 30 },
          { title: 'Dashboard Update', roleId: 'data_analyst', expectedMins: 240 }
        ],
        sla: { ack: 120, start: 240, resolve: 2160 } // 4 BD
      }
    ]
  },

  /**
   * Get templates for a specific department
   */
  getTemplatesForDept(deptId) {
    return this.byDept[deptId] || [];
  },

  /**
   * Flatten all templates to array for dropdown
   */
  getAllTemplatesAsArray() {
    const arr = [];
    Object.keys(this.byDept).forEach(deptId => {
      this.byDept[deptId].forEach((t, idx) => {
        arr.push({
          id: `${deptId}_${idx}`,
          departmentId: deptId,
          name: t.workType,
          ...t
        });
      });
    });
    return arr;
  }
};

// Expose WorkflowTemplates to window scope
window.WorkflowTemplates = WorkflowTemplates;
