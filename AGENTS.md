<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Numbered patch definitions, positions, limits and text styling live only in src/config/patches.ts; patchSlots.ts is a compatibility re-export so all consumers share one source.
- All design state lives in useDesignState (context provider); components never keep their own copy.
- All network calls live in src/api/ (currently stubs) so a backend can be swapped in without touching UI.
- The 3D scene is lazy-loaded and the index route is ssr:false because three.js needs the browser.
- Patch source values and derived image previews live in useDesignState; renderPatch creates bilingual canvas images used by the jacket, grid and PDF to avoid inconsistent rendering.
- PDF generation captures the existing Three.js scene for jacket views and rasterizes bilingual order details; uploaded patches retain their original resolution on individual pages.
- Payment checks and order numbers are session-only mocks in src/api/orders.ts; production must replace them with verified payment access and atomic numbering.
