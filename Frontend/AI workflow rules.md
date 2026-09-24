# AI Workflow Rules — Flight Search MVP

## Approach

Build this project incrementally using a spec-driven workflow.
Context files define what to build, how to build it, and the
current state of progress:

- `Plan.md` — full system design (architecture, data flow,
  folder structure, API contracts, non-goals)
- `progress-tracker.md` — current implementation state and
  open questions

Always implement against these specs — do not infer or invent
behavior from scratch. If you needs to make a product decision
not covered in `Plan.md`, it must stop and log it as an open 
question in `progress-tracker.md` instead of guessing.

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large speculative
  changes
- Do not combine unrelated system boundaries in a single
  implementation step

## When to Split Work

Split an implementation step if it combines:

- UI changes (search form, results list) and API/data-fetching
  logic in the same step
- The search API route and any future feature not in current
  scope (booking, auth, persistence)
- Behavior not clearly defined in `Plan.md` — stop and log it
  in `progress-tracker.md` instead of guessing

If a change cannot be verified end to end quickly, the scope is
too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in `Plan.md` or
  the product plan document
- Explicitly out of scope for MVP — never implement these
  unless the specs are updated first:
  - Round-trip search (one-way only)
  - User accounts / authentication
  - Database / persistence
  - Real booking or payment flow
  - Analytics
  - Multi-language support (English only)
- If a requirement is ambiguous, resolve it in `Plan.md` before
  implementing
- If a requirement is missing, add it as an open question in
  `progress-tracker.md` before continuing

## Protected Files

None defined yet — project scaffolding has not been created.
This section must be revisited once the initial Next.js
structure exists (e.g. generated UI primitives, config files).

## Keeping Docs in Sync

Update the relevant context file whenever implementation
changes:

- System architecture or boundaries → `Plan.md`
- Storage model decisions → `Plan.md` (currently: none, no DB)
- Code conventions or standards → `Plan.md`
- Feature scope → `Plan.md` + product plan document

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `Plan.md` was violated
3. `progress-tracker.md` reflects the completed work
4. `npm run build` passes
