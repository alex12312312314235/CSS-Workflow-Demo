// Share link functionality using URL hash
const ShareLink = {
  /**
   * Encode workflow and minimal catalogs to URL hash
   * @param {object} workflow - The workflow to share
   * @param {object} catalogs - Full catalog data
   * @returns {string} Base64 encoded hash
   */
  encodeToHash(workflow, catalogs) {
    // Build minimal catalog subset needed for this workflow
    const usedRoleIds = new Set([workflow.ownerRoleId]);
    workflow.steps.forEach(step => usedRoleIds.add(step.roleId));

    // Add escalation roles
    if (workflow.slaByPriority) {
      Object.values(workflow.slaByPriority).forEach(sla => {
        if (sla.escalate && sla.escalate.toRoleId) {
          usedRoleIds.add(sla.escalate.toRoleId);
        }
      });
    }

    const usedPriorityIds = new Set(Object.keys(workflow.slaByPriority || {}));

    const minimalData = {
      schemaVersion: "1.0.0",
      workflow: workflow,
      catalogs: {
        roles: catalogs.roles.filter(r => usedRoleIds.has(r.id)),
        departments: catalogs.departments.filter(d => d.id === workflow.departmentId),
        businessHours: catalogs.businessHours.filter(bh => bh.id === workflow.businessHoursId),
        priorities: catalogs.priorities.filter(p => usedPriorityIds.has(p.id))
      }
    };

    const json = JSON.stringify(minimalData);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    return base64;
  },

  /**
   * Decode workflow from URL hash
   * @param {string} hash - Location hash (with or without #wf=)
   * @returns {object|null} {workflow, catalogs} or null if invalid
   */
  decodeFromHash(hash) {
    try {
      // Remove #wf= prefix if present
      let base64 = hash;
      if (hash.startsWith('#wf=')) {
        base64 = hash.substring(4);
      } else if (hash.startsWith('wf=')) {
        base64 = hash.substring(3);
      } else if (hash.startsWith('#')) {
        base64 = hash.substring(1);
      }

      const json = decodeURIComponent(escape(atob(base64)));
      const data = JSON.parse(json);

      if (!data.workflow || !data.catalogs) {
        console.error('Invalid share link format');
        return null;
      }

      return {
        workflow: data.workflow,
        catalogs: data.catalogs,
        schemaVersion: data.schemaVersion
      };
    } catch (error) {
      console.error('Failed to decode share link:', error);
      return null;
    }
  },

  /**
   * Set the current URL hash
   * @param {string} base64Hash
   */
  setLocationHash(base64Hash) {
    window.location.hash = '#wf=' + base64Hash;
  },

  /**
   * Get share URL for a workflow
   * @param {object} workflow
   * @param {object} catalogs
   * @returns {string} Full URL with hash
   */
  getShareURL(workflow, catalogs) {
    const hash = this.encodeToHash(workflow, catalogs);
    const baseURL = window.location.origin + window.location.pathname;
    return baseURL + '#wf=' + hash;
  },

  /**
   * Copy share link to clipboard
   * @param {object} workflow
   * @param {object} catalogs
   * @returns {Promise<string>} The URL that was copied
   */
  async copyToClipboard(workflow, catalogs) {
    const url = this.getShareURL(workflow, catalogs);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    return url;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShareLink;
}
