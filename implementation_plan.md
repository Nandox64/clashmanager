# Redesign Sidebar with Premium UI

## Goal Description
Create a premium‑quality side menu (Sidebar) that replaces the current metallic look with a coordinated color palette, refined borders, subtle shadows, bevels, and texture effects. The design must feel elegant, modern, and consistent across dark/light themes, using the existing Inter typography.

## User Review Required
> [!IMPORTANT]
> The visual direction (color palette and texture style) needs your approval. I propose a gold‑silver‑bronze metallic theme with a subtle glass‑morphism background. Let me know if you prefer a different hue or more muted tones.

## Open Questions
> [!QUESTION]
> - Do you want the sidebar to be always visible on desktop (fixed) and hidden behind a hamburger on mobile, as currently implemented?
> - Should the navigation icons retain the current `lucide-react` set or would you like alternative icons?
> - Do you prefer a glossy glass effect (`backdrop-filter: blur`) or a solid metallic gradient?

## Proposed Changes
---
### Theme & CSS
- **Create `src/app/styles/premium.css`** with CSS variables for the premium palette (gold, silver, bronze) and utility classes:
  ```css
  :root {
    --color-primary: hsl(45, 90%, 55%);   /* metallic gold */
    --color-secondary: hsl(30, 85%, 45%); /* bronze */
    --color-accent: hsl(210, 15%, 25%);   /* deep shadow */
  }
  .premium-sidebar {
    background: linear-gradient(135deg, hsla(45,90%,55%,0.15), hsla(30,85%,45%,0.10));
    border-right: 1px solid hsla(0,0%,100%,0.08);
    box-shadow: inset -4px 0 8px rgba(0,0,0,0.12), 4px 0 12px rgba(0,0,0,0.08);
    backdrop-filter: blur(12px);
    border-radius: 0 12px 12px 0;
    overflow: hidden;
  }
  .premium-sidebar .nav-item {
    position: relative;
    border-radius: 8px;
    transition: background 0.2s, transform 0.1s;
  }
  .premium-sidebar .nav-item:hover {
    background: hsla(0,0%,100%,0.08);
    transform: translateX(2px);
  }
  .premium-sidebar .nav-item.active::before {
    content: "";
    position: absolute;
    inset: 0;
    border: 2px solid var(--color-primary);
    border-radius: 8px;
    box-shadow: 0 0 6px var(--color-primary);
  }
  ```
- **Import the stylesheet** in `src/app/globals.css` (or via `import "@/app/styles/premium.css";`).

---
### `MetalPanel` Component
- Rename the file to `PremiumPanel.tsx` (keep old file for fallback) and add the class `premium-sidebar`.
- Update the component signature to accept `className` and merge it with `premium-sidebar`.
- Ensure the component forwards any additional props to the root `<aside>` element.

---
### `Sidebar` Component
- Replace the `<MetalPanel>` import with the new `PremiumPanel`.
- Update navigation item markup to use the new `.nav-item` class.
- Adjust active‑state logic to add the `active` class.
- Refine the logo area: add a subtle metallic sheen using CSS `background: linear-gradient` and a faint inner‑glow `box-shadow: inset 0 0 8px hsla(45,90%,55%,0.3)`.
- Add a small decorative bevel on the sidebar’s left edge using a pseudo‑element:
  ```tsx
  <style jsx>{`
    .bevel::before {
      content: "";
      position: absolute;
      left: -4px; top: 0; bottom: 0;
      width: 4px;
      background: linear-gradient(to bottom, #fff4, transparent);
      transform: skewX(-12deg);
    }
  `}</style>
  ```
- Ensure the mobile toggle button (`<button>` with `Menu`/`X`) matches the new color palette (gold background, subtle shadow).

---
### Accessibility & Responsiveness
- Keep the existing responsive behavior: hidden on mobile, toggled via the top‑left button.
- Add `aria-current="page"` on the active navigation link for screen readers.
- Ensure contrast ratios meet WCAG AA (gold text on dark background → use `text-clash-gold` with sufficient opacity).

## Verification Plan
### Automated Tests
- Run `npm run dev` and verify compilation succeeds.
- Use Cypress (or Playwright) to snapshot‑test the sidebar’s DOM classes on desktop and mobile breakpoints.

### Manual Verification
- Open the app in a browser and inspect the sidebar:
  1. Verify the gradient, glass‑morphism blur, and shadow are present.
  2. Hover over each navigation item and confirm subtle lift and highlight.
  3. Check the active item shows the gold border/bevel.
  4. Validate the mobile toggle button appears and uses the premium colors.
  5. Confirm the design looks cohesive with the rest of the UI (fonts, spacing).

---
**Next Steps**
- Await your feedback on the proposed color palette and texture choice.
- Once approved, I will implement the files and run the verification steps.
