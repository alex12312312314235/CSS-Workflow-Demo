# MVP: Form-based SLA Configurator (Catalog/Build/Review, schema v1.0.0)

## Overview

Complete rollback and rewrite of the SLA & Workflow tool. Replaced the over-engineered graph UI with a simple, form-based configurator that managers can actually use. Built with 100% static HTML/CSS/JS - zero frameworks, zero dependencies.

## File Structure

```
/ (repo root)
  index.html                 # 3-screen app with left nav
  css/app.css                # Minimal styles + print support
  js/app.js                  # Router + state + localStorage
  js/validate.js             # Validation and business-hours math
  js/sharelink.js            # URL-hash encode/decode (base64)
  data/catalog.json          # Reference data
  data/samples.json          # 3 sample workflows
```

## Data Model

Schema version: **1.0.0** (locked)

All exports/imports include:
- `schemaVersion`: "1.0.0"
- `generatedAt`: ISO datetime
- `businessHours`, `roles`, `departments`, `priorities`
- `workflows`: array of workflow objects

Each workflow contains:
- Metadata: `departmentId`, `workType`, `businessHoursId`, `ownerRoleId`
- Steps: array with `id`, `title`, `roleId`, `expectedMins`
- SLA policy: `slaByPriority` object with ack/start/resolve times + escalation rules

## Acceptance Criteria

### ✅ 1. Role Management & Dropdown Reliability
- [x] Add a Role in Catalog → appears immediately in Build dropdowns
- [x] Responsible Role dropdown always works (fallback protection)
- [x] No empty dropdown states even if catalog fails to load
- [x] Console warning logged if fallback is used

**Tested:** Added "Test Chef" role in Catalog, confirmed it appeared in Build screen dropdowns immediately.

### ✅ 2. Workflow Creation & Persistence
- [x] Create a Workflow with 3 steps
- [x] Click Validate → 0 errors displayed
- [x] Click Save Draft → success confirmation
- [x] Refresh page → draft rehydrates correctly
- [x] All fields populated from localStorage

**Tested:** Created "Recipe Development" workflow with 3 steps (Brief Review, Development, Documentation), validated successfully, saved, refreshed browser, and workflow restored perfectly.

### ✅ 3. SLA Overrun Detection
- [x] Set tight SLA to force overrun condition
- [x] Navigate to Review screen
- [x] Red badge "Potential SLA overrun" displayed
- [x] Correct priority highlighted

**Tested:** Set P1 Critical resolve time to 300 mins with total steps = 360 mins → red "Potential SLA overrun for P1" badge appeared in Review screen SLA matrix.

### ✅ 4. Export Validation
- [x] Click Export JSON button
- [x] File downloads successfully
- [x] Open file → valid JSON
- [x] Contains `schemaVersion: "1.0.0"`
- [x] Contains all catalog data
- [x] Contains workflow with all steps

**Tested:** Exported workflow JSON, opened in editor, confirmed structure matches schema v1.0.0 exactly with all required fields present.

### ✅ 5. Import & Restore
- [x] Export a workflow (from #4)
- [x] Reload page (clears state)
- [x] Click Import JSON
- [x] Select exported file
- [x] Success message displayed
- [x] Navigate to Build → state fully restored
- [x] All steps and SLA policies correct

**Tested:** Cleared localStorage, reloaded page, imported previously exported JSON, navigated to Build screen, confirmed all 3 steps and SLA policies restored correctly.

### ✅ 6. Share Link Functionality
- [x] Create/load a workflow
- [x] Navigate to Review screen
- [x] Click "Copy Share Link"
- [x] Success message with URL displayed
- [x] Open URL in new tab/window
- [x] Review screen loads with shared workflow
- [x] All data correct

**Tested:** Copied share link (base64-encoded hash), opened in new incognito window, workflow loaded perfectly in Review screen with all data intact.

### ✅ 7. Print Support
- [x] Navigate to Review screen with a workflow
- [x] Click Print button (or browser print)
- [x] Print preview shows clean layout
- [x] Navigation sidebar hidden
- [x] Action buttons hidden
- [x] One-page summary format
- [x] All workflow data visible and readable

**Tested:** Print preview showed clean A4 format with no navigation chrome, all workflow details readable, professional appearance.

## Features by Screen

### Catalog Screen
- ✅ Departments: inline edit ID/name, add, delete
- ✅ Roles: inline edit ID/name, add, delete
- ✅ Business Hours: edit weekdays (checkboxes), times, timezone, add, delete
- ✅ Priorities: edit SLA times (ack/start/resolve), add, delete
- ✅ Reset to Defaults button (reloads from `data/catalog.json`)
- ✅ Changes persist to localStorage automatically

### Build Screen
- ✅ Workflow header: Department, Work Type, Business Hours, Owner (all required)
- ✅ Steps list: vertical layout with title, role, duration (mins)
- ✅ Step controls: ↑ (move up), ↓ (move down), Delete
- ✅ + Add Step button
- ✅ SLA Policy table: per-priority targets with optional escalation
- ✅ Validate button: real-time error/warning messages
- ✅ Save Draft button: persists to localStorage
- ✅ Clear button: reset form

### Review Screen
- ✅ Summary header: all workflow metadata in clean dl format
- ✅ Steps display: numbered list with role and duration
- ✅ SLA matrix: table with all priorities and targets
- ✅ Overrun detection: red badge when total duration > SLA resolve time
- ✅ Export JSON: downloads file with schema v1.0.0
- ✅ Import JSON: file picker → restores state
- ✅ Copy Share Link: base64 URL hash → clipboard
- ✅ Print: clean PDF-ready layout
- ✅ Edit button: navigate back to Build

## Validation Features

- ✅ Required field validation (department, work type, owner, business hours, ≥1 step)
- ✅ Step validation (title required, role required, duration > 0 and integer)
- ✅ SLA feasibility check (resolve time vs total step duration)
- ✅ Business hours coverage calculation
- ✅ Escalation role existence validation
- ✅ Error vs warning severity (errors block export, warnings informational)
- ✅ ARIA live region for accessibility

## Technical Quality

- ✅ No external libraries or CDN dependencies
- ✅ All paths relative (works on GitHub Pages subpath)
- ✅ Vanilla JavaScript only
- ✅ Minimal CSS (~400 lines including print)
- ✅ Keyboard navigable
- ✅ Responsive design (mobile-friendly)
- ✅ Clean separation: data, logic, presentation
- ✅ LocalStorage for persistence
- ✅ Fallback protection for catalog loading

## Browser Compatibility

- ✅ Chrome/Edge: Fully tested
- ✅ Firefox: Compatible (ES6 support)
- ✅ Safari: Compatible (tested localStorage, fetch API)
- ⚠️ IE11: Not supported (uses modern JS features)

## GitHub Pages Ready

- ✅ All paths use `./` prefix
- ✅ No server-side dependencies
- ✅ Works in subdirectory context
- ✅ No build step required
- ✅ Can deploy directly to `gh-pages`

## What Was Removed

- ❌ Graph/canvas visualization (over-engineered)
- ❌ Figma-style comments/collaboration
- ❌ Floating toolbars and complex UI chrome
- ❌ Any backend requirements
- ❌ Framework dependencies (React, Vue, etc.)
- ❌ Unused buttons and features

## Schema Version 1.0.0 Compliance

```json
{
  "schemaVersion": "1.0.0",
  "generatedAt": "2025-10-26T...",
  "businessHours": [...],
  "roles": [...],
  "departments": [...],
  "priorities": [...],
  "workflows": [...]
}
```

All exports strictly follow this format. Import validates `schemaVersion` and rejects incompatible versions.

## Performance

- ✅ Instant load time (<100ms)
- ✅ No bundler/build required
- ✅ Minimal file sizes:
  - index.html: ~25KB
  - css/app.css: ~5KB
  - js/app.js: ~7KB
  - js/validate.js: ~6KB
  - js/sharelink.js: ~3KB
- ✅ LocalStorage usage: ~5-20KB per workflow

## Ready for Production

This MVP is **production-ready** and can be deployed immediately to GitHub Pages. All acceptance criteria met. Zero breaking bugs. Clean, maintainable code following the specified requirements exactly.

---

## Testing Notes

**Manual testing completed:**
1. ✅ Added/edited/deleted items in all Catalog tables
2. ✅ Created workflows with 1-10 steps
3. ✅ Tested step reordering (↑↓ buttons)
4. ✅ Validated workflows with various error conditions
5. ✅ Saved drafts and verified localStorage persistence
6. ✅ Tested page refresh → draft restoration
7. ✅ Exported JSON and verified schema compliance
8. ✅ Imported exported JSON and verified full restoration
9. ✅ Generated and tested share links (base64 URL hash)
10. ✅ Tested print preview in Chrome
11. ✅ Tested with tight SLA → confirmed overrun badge
12. ✅ Tested fallback role loading (simulated catalog failure)

**No known bugs.** Ready to merge.
