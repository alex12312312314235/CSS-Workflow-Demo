// Validation and business-hours calculation
const Validator = {
  /**
   * Validate a workflow against the schema and business rules
   * @param {object} workflow - The workflow to validate
   * @param {object} catalogs - Reference data (roles, departments, etc.)
   * @returns {array} Array of {path, message, severity} where severity is 'error' or 'warning'
   */
  validateWorkflow(workflow, catalogs) {
    const errors = [];

    // Required fields
    if (!workflow.departmentId) {
      errors.push({ path: 'departmentId', message: 'Department is required', severity: 'error' });
    } else if (!catalogs.departments.find(d => d.id === workflow.departmentId)) {
      errors.push({ path: 'departmentId', message: 'Invalid department ID', severity: 'error' });
    }

    if (!workflow.ownerRoleId) {
      errors.push({ path: 'ownerRoleId', message: 'Owner role is required', severity: 'error' });
    } else if (!catalogs.roles.find(r => r.id === workflow.ownerRoleId)) {
      errors.push({ path: 'ownerRoleId', message: 'Invalid owner role ID', severity: 'error' });
    }

    if (!workflow.businessHoursId) {
      errors.push({ path: 'businessHoursId', message: 'Business hours profile is required', severity: 'error' });
    } else if (!catalogs.businessHours.find(bh => bh.id === workflow.businessHoursId)) {
      errors.push({ path: 'businessHoursId', message: 'Invalid business hours ID', severity: 'error' });
    }

    if (!workflow.workType || workflow.workType.trim() === '') {
      errors.push({ path: 'workType', message: 'Work type is required', severity: 'error' });
    }

    // Steps validation
    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push({ path: 'steps', message: 'At least one step is required', severity: 'error' });
    } else {
      workflow.steps.forEach((step, idx) => {
        if (!step.title || step.title.trim() === '') {
          errors.push({ path: `steps[${idx}].title`, message: `Step ${idx + 1}: Title is required`, severity: 'error' });
        }

        if (!step.roleId) {
          errors.push({ path: `steps[${idx}].roleId`, message: `Step ${idx + 1}: Responsible role is required`, severity: 'error' });
        } else if (!catalogs.roles.find(r => r.id === step.roleId)) {
          errors.push({ path: `steps[${idx}].roleId`, message: `Step ${idx + 1}: Invalid role ID`, severity: 'error' });
        }

        if (!step.expectedMins || step.expectedMins <= 0 || !Number.isInteger(step.expectedMins)) {
          errors.push({ path: `steps[${idx}].expectedMins`, message: `Step ${idx + 1}: Expected duration must be a positive integer`, severity: 'error' });
        }
      });
    }

    // SLA validation
    if (workflow.slaByPriority && workflow.steps && workflow.steps.length > 0 && workflow.businessHoursId) {
      const bhProfile = catalogs.businessHours.find(bh => bh.id === workflow.businessHoursId);
      const totalStepMins = workflow.steps.reduce((sum, s) => sum + (s.expectedMins || 0), 0);

      catalogs.priorities.forEach(priority => {
        const sla = workflow.slaByPriority[priority.id];
        if (sla) {
          // Validate escalation
          if (sla.escalate && sla.escalate.toRoleId) {
            if (!catalogs.roles.find(r => r.id === sla.escalate.toRoleId)) {
              errors.push({
                path: `slaByPriority.${priority.id}.escalate.toRoleId`,
                message: `${priority.name}: Invalid escalation role ID`,
                severity: 'error'
              });
            }
          }

          // Check if resolve time is sufficient for total steps
          if (sla.resolveMins && totalStepMins > sla.resolveMins) {
            errors.push({
              path: `slaByPriority.${priority.id}.resolveMins`,
              message: `${priority.name}: Resolve time (${sla.resolveMins} mins) is less than total step duration (${totalStepMins} mins)`,
              severity: 'warning'
            });
          }

          // Business hours feasibility check
          if (bhProfile && sla.resolveMins) {
            const businessHoursMins = this.calculateBusinessHoursCoverage(bhProfile);
            const dailyCapacity = businessHoursMins.perDay;
            const daysNeeded = Math.ceil(totalStepMins / dailyCapacity);
            const calendarMinsNeeded = daysNeeded * 24 * 60; // rough estimate

            if (sla.resolveMins < totalStepMins * 1.2) { // 20% buffer
              errors.push({
                path: `slaByPriority.${priority.id}.resolveMins`,
                message: `${priority.name}: Tight SLA - consider adding buffer time`,
                severity: 'warning'
              });
            }
          }
        }
      });
    }

    return errors;
  },

  /**
   * Calculate business hours coverage
   * @param {object} bhProfile - Business hours profile
   * @returns {object} {perDay, perWeek}
   */
  calculateBusinessHoursCoverage(bhProfile) {
    const [startH, startM] = bhProfile.start.split(':').map(Number);
    const [endH, endM] = bhProfile.end.split(':').map(Number);
    const minsPerDay = (endH * 60 + endM) - (startH * 60 + startM);
    const workDaysPerWeek = bhProfile.days.length;

    return {
      perDay: minsPerDay,
      perWeek: minsPerDay * workDaysPerWeek
    };
  },

  /**
   * Project end timestamp within business hours
   * @param {Date} startTs - Start timestamp
   * @param {number} minutes - Duration in minutes
   * @param {object} bhProfile - Business hours profile
   * @returns {Date} End timestamp
   */
  minutesWithinBusinessHours(startTs, minutes, bhProfile) {
    const [startH, startM] = bhProfile.start.split(':').map(Number);
    const [endH, endM] = bhProfile.end.split(':').map(Number);
    const dayStartMins = startH * 60 + startM;
    const dayEndMins = endH * 60 + endM;
    const minsPerDay = dayEndMins - dayStartMins;

    let current = new Date(startTs);
    let remaining = minutes;

    // Move to next business day if starting outside business hours or on weekend
    while (!bhProfile.days.includes(current.getDay())) {
      current.setDate(current.getDate() + 1);
      current.setHours(startH, startM, 0, 0);
    }

    const currentMins = current.getHours() * 60 + current.getMinutes();
    if (currentMins < dayStartMins) {
      current.setHours(startH, startM, 0, 0);
    } else if (currentMins >= dayEndMins) {
      // Move to next business day
      current.setDate(current.getDate() + 1);
      current.setHours(startH, startM, 0, 0);
      while (!bhProfile.days.includes(current.getDay())) {
        current.setDate(current.getDate() + 1);
      }
    }

    // Consume minutes within business hours
    while (remaining > 0) {
      const currentDayMins = current.getHours() * 60 + current.getMinutes();
      const minsLeftToday = dayEndMins - currentDayMins;

      if (remaining <= minsLeftToday) {
        current.setMinutes(current.getMinutes() + remaining);
        remaining = 0;
      } else {
        remaining -= minsLeftToday;
        // Move to next business day
        current.setDate(current.getDate() + 1);
        current.setHours(startH, startM, 0, 0);
        while (!bhProfile.days.includes(current.getDay())) {
          current.setDate(current.getDate() + 1);
        }
      }
    }

    return current;
  },

  /**
   * Check if workflow will overrun SLA for a given priority
   * @param {object} workflow
   * @param {string} priorityId
   * @param {object} catalogs
   * @returns {boolean}
   */
  checkSLAOverrun(workflow, priorityId, catalogs) {
    if (!workflow.slaByPriority || !workflow.slaByPriority[priorityId]) {
      return false;
    }

    const sla = workflow.slaByPriority[priorityId];
    const totalStepMins = workflow.steps.reduce((sum, s) => sum + (s.expectedMins || 0), 0);

    return totalStepMins > sla.resolveMins;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validator;
}
