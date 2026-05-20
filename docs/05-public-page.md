# Phase 5: Public Parent Landing Page - Kito Marom

This document details the parent-facing public interface designed to display camp and after-school registration options.

---

## 1. Landing Design & Brand Layout

The landing page (`/`) is designed from scratch in **Hebrew RTL** to maximize mobile readability and parent trust:
* **Typography**: Integrates Google Font **Rubik**, a premium, rounded, and modern Hebrew typeface.
* **Palette**: Deep corporate purples (`#5c1f9c`) combined with soft lavender borders and gold accents (`#f59e0b`) to draw attention to high-priority elements.
* **Layout Structure**:
  1. **Sticky Glass Header**: Semi-transparent navigation containing the corporate logo and a direct dial contact button for mobile parents.
  2. **Hero Showcase**: High-impact banner containing the main custom title, subtitle, and description text from `page_settings` overlaying a premium placeholder or user-configured cover image.
  3. **Responsive Cards Grid**: Displays active registration links. Grids adjust automatically:
     * **Desktop**: 3 columns.
     * **Tablet**: 2 columns.
     * **Mobile**: 1 column.
  4. **Support Bar**: A call-out banner highlighting office hours, contact emails, and a click-to-call button.
  5. **Footer**: Branded info block with direct contact parameters.

---

## 2. Dynamic Content Binding

* **Instant Synchrony**: All cards, contact numbers, and titles are bound directly to active database states:
  * Deactivating an area card in the Admin Panel instantly hides it from the parents' view.
  * Adjusting the sort index immediately pushes high-priority cards to the top of the grid.
* **Secure Navigation**: All registration cards feature target links opening in isolated browser tabs (`target="_blank" rel="noopener noreferrer"`) to ensure parents can return to the links list easily.
* **Resilient States**:
  * **Loading Indicator**: Renders a animated purple spinner if database queries are active.
  * **Empty State**: If all cards are deactivated, displays a helpful placeholder: *"No active registration links. Our registry department is updating content. Visit us again soon."*
  * **Error Boundaries**: Captures failed queries gracefully without breaking the layout.
