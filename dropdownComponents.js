/**
 * SLA & Workflow Mapping Tool - Dropdown Components Library
 * Version 2.0 - Enhanced with Dropdowns
 *
 * Reusable dropdown UI components with advanced features:
 * - Standard dropdowns
 * - Searchable dropdowns
 * - Multi-select with tags
 * - Cascading dropdowns
 * - Recent selections
 * - Keyboard navigation
 * - Validation warnings
 */

const DropdownComponents = {
  /**
   * Create a standard dropdown select element
   * @param {Object} options Configuration object
   * @returns {string} HTML string for dropdown
   */
  createStandardDropdown(options) {
    const {
      id,
      name,
      items,
      selectedValue = '',
      placeholder = 'Select an option',
      required = false,
      onChange = '',
      showIcons = false,
      includeRecent = false,
      recentField = ''
    } = options;

    let html = `<select id="${id}" name="${name}" class="dropdown-standard" ${required ? 'required' : ''} ${onChange ? `onchange="${onChange}"` : ''}>`;

    // Placeholder option
    if (placeholder) {
      html += `<option value="">${placeholder}</option>`;
    }

    // Recent selections section
    if (includeRecent && recentField) {
      const recentItems = DropdownHelpers.getRecentSelections(recentField);
      if (recentItems.length > 0) {
        html += `<optgroup label="Recently Used">`;
        recentItems.forEach(value => {
          const item = items.find(i => i.id === value || i.label === value);
          if (item) {
            const label = showIcons && item.icon ? `${item.icon} ${item.label}` : item.label;
            html += `<option value="${item.id}" ${selectedValue === item.id ? 'selected' : ''}>${label}</option>`;
          }
        });
        html += `</optgroup>`;
        html += `<optgroup label="All Options">`;
      }
    }

    // All options
    items.forEach(item => {
      const label = showIcons && item.icon ? `${item.icon} ${item.label}` : item.label;
      const isSelected = selectedValue === item.id;
      html += `<option value="${item.id}" ${isSelected ? 'selected' : ''}>${label}</option>`;
    });

    if (includeRecent && recentField && DropdownHelpers.getRecentSelections(recentField).length > 0) {
      html += `</optgroup>`;
    }

    html += `</select>`;

    return html;
  },

  /**
   * Create a searchable dropdown with custom UI
   * @param {Object} options Configuration object
   * @returns {string} HTML string for searchable dropdown
   */
  createSearchableDropdown(options) {
    const {
      id,
      name,
      items,
      selectedValue = '',
      placeholder = 'Search or select...',
      required = false,
      onChange = '',
      showCategories = false
    } = options;

    const selectedItem = items.find(i => i.id === selectedValue);
    const displayValue = selectedItem ? selectedItem.label : '';

    let html = `
      <div class="searchable-dropdown" id="${id}-container">
        <input
          type="text"
          id="${id}"
          name="${name}"
          class="searchable-dropdown-input"
          placeholder="${placeholder}"
          value="${displayValue}"
          autocomplete="off"
          ${required ? 'required' : ''}
          onfocus="DropdownUI.openSearchableDropdown('${id}')"
          oninput="DropdownUI.filterSearchableDropdown('${id}', this.value)"
        />
        <input type="hidden" id="${id}-value" value="${selectedValue}" />
        <div class="searchable-dropdown-arrow" onclick="DropdownUI.toggleSearchableDropdown('${id}')">▼</div>
        <div class="searchable-dropdown-options" id="${id}-options" style="display:none;">
    `;

    if (showCategories) {
      // Group items by category
      const grouped = {};
      items.forEach(item => {
        if (item.type === 'category') {
          grouped[item.label] = [];
        }
      });

      let currentCategory = null;
      items.forEach(item => {
        if (item.type === 'category') {
          currentCategory = item.label;
        } else if (item.type === 'option') {
          if (currentCategory && grouped[currentCategory]) {
            grouped[currentCategory].push(item);
          }
        }
      });

      // Render grouped options
      Object.keys(grouped).forEach(category => {
        if (grouped[category].length > 0) {
          html += `<div class="dropdown-category">${category}</div>`;
          grouped[category].forEach(item => {
            html += `
              <div class="dropdown-option"
                   data-value="${item.value}"
                   data-label="${item.label}"
                   onclick="DropdownUI.selectSearchableOption('${id}', '${item.value}', '${item.label.replace(/'/g, "\\'")}', '${onChange}')">
                ${item.label}
              </div>
            `;
          });
        }
      });
    } else {
      // Render flat list
      items.forEach(item => {
        const icon = item.icon ? `${item.icon} ` : '';
        html += `
          <div class="dropdown-option"
               data-value="${item.id}"
               data-label="${item.label}"
               onclick="DropdownUI.selectSearchableOption('${id}', '${item.id}', '${item.label.replace(/'/g, "\\'")}', '${onChange}')">
            ${icon}${item.label}
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;

    return html;
  },

  /**
   * Create a multi-select dropdown with tag display
   * @param {Object} options Configuration object
   * @returns {string} HTML string for multi-select dropdown
   */
  createMultiSelectDropdown(options) {
    const {
      id,
      name,
      items,
      selectedValues = [],
      placeholder = 'Select options...',
      showColors = true,
      categoryColors = {}
    } = options;

    let html = `
      <div class="multi-select-dropdown" id="${id}-container">
        <div class="multi-select-tags" id="${id}-tags">
    `;

    // Render selected tags
    selectedValues.forEach(value => {
      const item = items.find(i => i.id === value);
      if (item) {
        const color = showColors && item.color ? item.color : (categoryColors[item.category] || '#95A5A6');
        html += this.createTag(item.label, value, color, id);
      }
    });

    html += `
          <input
            type="text"
            class="multi-select-input"
            placeholder="${selectedValues.length === 0 ? placeholder : ''}"
            onfocus="DropdownUI.openMultiSelect('${id}')"
            oninput="DropdownUI.filterMultiSelect('${id}', this.value)"
            id="${id}-input"
          />
        </div>
        <input type="hidden" id="${id}" name="${name}" value="${selectedValues.join(',')}" />
        <div class="multi-select-options" id="${id}-options" style="display:none;">
    `;

    // Render options with checkboxes
    items.forEach(item => {
      const isSelected = selectedValues.includes(item.id);
      const icon = item.icon ? `${item.icon} ` : '';
      html += `
        <div class="multi-select-option ${isSelected ? 'selected' : ''}" data-value="${item.id}">
          <input
            type="checkbox"
            ${isSelected ? 'checked' : ''}
            onchange="DropdownUI.toggleMultiSelectOption('${id}', '${item.id}', '${item.label.replace(/'/g, "\\'")}', '${item.color || '#95A5A6'}')"
          />
          <span>${icon}${item.label}</span>
        </div>
      `;
    });

    html += `
        </div>
        <div class="multi-select-count" id="${id}-count">${selectedValues.length} selected</div>
      </div>
    `;

    return html;
  },

  /**
   * Create a tag element
   */
  createTag(label, value, color, dropdownId) {
    return `
      <span class="tag" style="background-color: ${color}20; border: 1px solid ${color}; color: ${color}">
        ${label}
        <span class="tag-remove" onclick="DropdownUI.removeTag('${dropdownId}', '${value}')">&times;</span>
      </span>
    `;
  },

  /**
   * Create a cascading dropdown (parent affects child options)
   * @param {Object} options Configuration object
   * @returns {Object} HTML strings for both parent and child dropdowns
   */
  createCascadingDropdown(options) {
    const {
      parentId,
      childId,
      parentItems,
      childItemsMap, // Map of parent value to child items
      selectedParent = '',
      selectedChild = '',
      parentLabel = 'Parent',
      childLabel = 'Child',
      onChange = ''
    } = options;

    const childItems = selectedParent ? (childItemsMap[selectedParent] || []) : [];

    return {
      parent: this.createStandardDropdown({
        id: parentId,
        name: parentId,
        items: parentItems,
        selectedValue: selectedParent,
        onChange: `DropdownUI.updateCascadingChild('${parentId}', '${childId}', ${JSON.stringify(childItemsMap).replace(/"/g, '&quot;')}); ${onChange}`
      }),
      child: this.createStandardDropdown({
        id: childId,
        name: childId,
        items: childItems,
        selectedValue: selectedChild,
        placeholder: selectedParent ? 'Select...' : 'Select parent first',
        onChange: onChange
      })
    };
  },

  /**
   * Create validation warning
   */
  createValidationWarning(message, type = 'warning') {
    const icons = {
      warning: '⚠️',
      error: '❌',
      info: '💡',
      tip: '💡'
    };

    const colors = {
      warning: '#F39C12',
      error: '#E74C3C',
      info: '#3498DB',
      tip: '#27AE60'
    };

    return `
      <div class="validation-warning validation-${type}" style="background: ${colors[type]}20; border-left: 3px solid ${colors[type]}; padding: 8px 12px; margin-top: 8px; border-radius: 3px; font-size: 12px;">
        ${icons[type]} ${message}
      </div>
    `;
  }
};

/**
 * Dropdown UI Interaction Handlers
 * These functions handle user interactions with custom dropdowns
 */
const DropdownUI = {
  /**
   * Open searchable dropdown
   */
  openSearchableDropdown(id) {
    const optionsDiv = document.getElementById(`${id}-options`);
    if (optionsDiv) {
      // Close all other dropdowns first
      document.querySelectorAll('.searchable-dropdown-options').forEach(el => {
        if (el.id !== `${id}-options`) {
          el.style.display = 'none';
        }
      });
      optionsDiv.style.display = 'block';
    }
  },

  /**
   * Close searchable dropdown
   */
  closeSearchableDropdown(id) {
    const optionsDiv = document.getElementById(`${id}-options`);
    if (optionsDiv) {
      optionsDiv.style.display = 'none';
    }
  },

  /**
   * Toggle searchable dropdown
   */
  toggleSearchableDropdown(id) {
    const optionsDiv = document.getElementById(`${id}-options`);
    if (optionsDiv) {
      optionsDiv.style.display = optionsDiv.style.display === 'none' ? 'block' : 'none';
    }
  },

  /**
   * Filter searchable dropdown options
   */
  filterSearchableDropdown(id, searchTerm) {
    const optionsDiv = document.getElementById(`${id}-options`);
    if (!optionsDiv) return;

    const options = optionsDiv.querySelectorAll('.dropdown-option');
    const term = searchTerm.toLowerCase();

    let hasVisibleOptions = false;
    options.forEach(option => {
      const label = option.getAttribute('data-label').toLowerCase();
      if (label.includes(term)) {
        option.style.display = 'block';
        hasVisibleOptions = true;
      } else {
        option.style.display = 'none';
      }
    });

    // Show "No results" if needed
    let noResultsDiv = optionsDiv.querySelector('.no-results');
    if (!hasVisibleOptions) {
      if (!noResultsDiv) {
        noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.style.padding = '10px';
        noResultsDiv.style.color = '#999';
        noResultsDiv.style.textAlign = 'center';
        noResultsDiv.textContent = 'No results found';
        optionsDiv.appendChild(noResultsDiv);
      }
      noResultsDiv.style.display = 'block';
    } else if (noResultsDiv) {
      noResultsDiv.style.display = 'none';
    }
  },

  /**
   * Select option from searchable dropdown
   */
  selectSearchableOption(id, value, label, onChange) {
    const input = document.getElementById(id);
    const hiddenInput = document.getElementById(`${id}-value`);

    if (input) input.value = label;
    if (hiddenInput) hiddenInput.value = value;

    this.closeSearchableDropdown(id);

    // Save to recent selections
    DropdownHelpers.saveRecentSelection(id, value);

    // Trigger onChange if provided
    if (onChange) {
      try {
        eval(onChange);
      } catch (e) {
        console.error('Error in onChange handler:', e);
      }
    }
  },

  /**
   * Open multi-select dropdown
   */
  openMultiSelect(id) {
    const optionsDiv = document.getElementById(`${id}-options`);
    if (optionsDiv) {
      // Close all other multi-selects first
      document.querySelectorAll('.multi-select-options').forEach(el => {
        if (el.id !== `${id}-options`) {
          el.style.display = 'none';
        }
      });
      optionsDiv.style.display = 'block';
    }
  },

  /**
   * Filter multi-select options
   */
  filterMultiSelect(id, searchTerm) {
    const optionsDiv = document.getElementById(`${id}-options`);
    if (!optionsDiv) return;

    const options = optionsDiv.querySelectorAll('.multi-select-option');
    const term = searchTerm.toLowerCase();

    options.forEach(option => {
      const label = option.textContent.toLowerCase();
      option.style.display = label.includes(term) ? 'flex' : 'none';
    });
  },

  /**
   * Toggle multi-select option
   */
  toggleMultiSelectOption(dropdownId, value, label, color) {
    const hiddenInput = document.getElementById(dropdownId);
    const tagsContainer = document.getElementById(`${dropdownId}-tags`);
    const countDiv = document.getElementById(`${dropdownId}-count`);

    if (!hiddenInput || !tagsContainer) return;

    let selectedValues = hiddenInput.value ? hiddenInput.value.split(',') : [];

    if (selectedValues.includes(value)) {
      // Remove value
      selectedValues = selectedValues.filter(v => v !== value);
      // Remove tag
      const tag = tagsContainer.querySelector(`[onclick*="'${value}'"]`)?.parentElement;
      if (tag) tag.remove();
    } else {
      // Add value
      selectedValues.push(value);
      // Add tag
      const tagHTML = DropdownComponents.createTag(label, value, color, dropdownId);
      const input = tagsContainer.querySelector('.multi-select-input');
      if (input) {
        input.insertAdjacentHTML('beforebegin', tagHTML);
      }
    }

    hiddenInput.value = selectedValues.join(',');

    // Update count
    if (countDiv) {
      countDiv.textContent = `${selectedValues.length} selected`;
    }

    // Update placeholder
    const input = tagsContainer.querySelector('.multi-select-input');
    if (input) {
      input.placeholder = selectedValues.length === 0 ? 'Select options...' : '';
    }
  },

  /**
   * Remove tag from multi-select
   */
  removeTag(dropdownId, value) {
    const option = document.querySelector(`#${dropdownId}-options .multi-select-option[data-value="${value}"] input[type="checkbox"]`);
    if (option) {
      option.checked = false;
      option.onchange();
    }
  },

  /**
   * Update cascading dropdown child options
   */
  updateCascadingChild(parentId, childId, childItemsMap) {
    const parentSelect = document.getElementById(parentId);
    const childSelect = document.getElementById(childId);

    if (!parentSelect || !childSelect) return;

    const parentValue = parentSelect.value;
    const childItems = childItemsMap[parentValue] || [];

    // Clear child options
    childSelect.innerHTML = '<option value="">Select...</option>';

    // Add new options
    childItems.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.label;
      childSelect.appendChild(option);
    });

    // Enable/disable based on parent selection
    childSelect.disabled = !parentValue || childItems.length === 0;
  },

  /**
   * Show validation warnings based on workflow state
   */
  showValidationWarning(containerId, warnings) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Remove existing warnings
    container.querySelectorAll('.validation-warning').forEach(el => el.remove());

    // Add new warnings
    warnings.forEach(warning => {
      const warningHTML = DropdownComponents.createValidationWarning(warning.message, warning.type);
      container.insertAdjacentHTML('beforeend', warningHTML);
    });
  }
};

/**
 * Close dropdowns when clicking outside
 */
document.addEventListener('click', function(event) {
  // Close searchable dropdowns
  if (!event.target.closest('.searchable-dropdown')) {
    document.querySelectorAll('.searchable-dropdown-options').forEach(el => {
      el.style.display = 'none';
    });
  }

  // Close multi-select dropdowns
  if (!event.target.closest('.multi-select-dropdown')) {
    document.querySelectorAll('.multi-select-options').forEach(el => {
      el.style.display = 'none';
    });
  }
});

/**
 * Keyboard navigation for dropdowns
 */
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    // Close all custom dropdowns
    document.querySelectorAll('.searchable-dropdown-options, .multi-select-options').forEach(el => {
      el.style.display = 'none';
    });
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DropdownComponents, DropdownUI };
}
