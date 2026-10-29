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
- Patch slots are defined only in src/config/patchSlots.ts — the 3D model, checklist and PDF all read from it.
- All design state lives in useDesignState (context provider); components never keep their own copy.
- All network calls live in src/api/ (currently stubs) so a backend can be swapped in without touching UI.
- The 3D scene is lazy-loaded and the index route is ssr:false because three.js needs the browser.
