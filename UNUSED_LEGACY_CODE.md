# Unused Legacy Code Audit

Date: 2026-04-29

This is a best-effort static audit of legacy/compatibility code that appears unused in the current workspace state.

## High-confidence unused symbols

- `useWaypoints.addRelativeWaypoint`
  - Definition: `src/stores/useWaypoints.ts` (interface + implementation)
  - Evidence: only 2 matches in the whole workspace, both in `src/stores/useWaypoints.ts` (declaration and implementation), no call sites.

- `usePathStore.endSegmentConnection`
  - Definition: `src/stores/usePaths.ts` (interface + implementation)
  - Evidence: only 2 matches in the whole workspace, both in `src/stores/usePaths.ts`, no call sites.

- `useRepoStore.addRepository`
  - Definition: `src/stores/useRepos.ts` (interface + implementation)
  - Evidence: only 2 functional matches in `src/stores/useRepos.ts` (declaration/implementation), no external call sites.

- `useRepoStore.removeRepository`
  - Definition: `src/stores/useRepos.ts` (interface + implementation)
  - Evidence: only 2 functional matches in `src/stores/useRepos.ts` (declaration/implementation), no external call sites.

## Legacy compatibility code (used, but legacy by design)

These are not unused, but they are legacy compatibility paths you may want to remove when backwards compatibility is no longer needed.

- Deprecated `segments` fallback in WMAP parsing
  - File: `src/utils/persistence.ts`
  - Evidence: explicit deprecation comments and warning:
    - `segments?: PathSegment[]` marked as legacy
    - `console.warn("The 'segments' property is deprecated. Use 'paths' instead.")`
  - Purpose: supports older `.wmap` files with `segments` instead of `paths`.

- Interaction-mode bridge compatibility layer
  - File: `src/InteractionModeBridge.tsx`
  - Evidence: bridges unified mode into legacy store flags (`setAddMode`, `setAddModeReferencePathId`, `setAddModeReferenceShapeId`).
  - Purpose: keep old per-store mode fields in sync while migration is ongoing.

## Notes

- This audit is static (reference-based), not runtime-behavior analysis.
- Before deleting items, run a full manual smoke test (map interactions, panel navigation, import/export) and then `npm run build`.
