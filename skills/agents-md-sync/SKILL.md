---
name: agents-md-sync
description: Maintain repositories that treat `AGENTS.md` as a living north-star document. Use when product behavior, implementation policy, operational rules, or scope boundaries change and Codex must update `AGENTS.md` plus any paired requirements/specification document in the same turn.
---

# Agents Md Sync

## Goal

Treat `AGENTS.md` as the operational source of truth for the repository. Keep it aligned with the current product, architecture, and workflow rules, and update the paired requirements/spec document whenever a change would otherwise create drift.

## Workflow

1. Read `AGENTS.md` before making implementation decisions.
2. Identify the companion requirements/spec document named by the repo rules. Common locations are `docs/requirements_definition.md`, `docs/requirements.md`, or a similarly named product spec.
3. Infer the delta from the actual task: new behavior, removed behavior, changed defaults, altered integrations, new constraints, or changed operating policy.
4. Update code and docs in the same turn. Do not leave `AGENTS.md` or the companion spec stale after implementing the change.
5. Preserve the role split:
   - `AGENTS.md`: north star, operating rules, scope boundaries, current-state summary.
   - Requirements/spec doc: rationale, acceptance criteria, behavior details, flows, or structured requirements.
6. If the repo explicitly says both documents must stay in sync, treat a one-sided update as incomplete work.

## What To Update

- Add or revise current-state bullets when user-visible behavior or integrations change.
- Update product principles or scope boundaries when the task changes what the product should or should not do.
- Record operational rules when the team adopts a new implementation constraint or maintenance rule.
- Mirror the same change in the companion requirements/spec doc at the appropriate level of detail.

## Decision Rules

- Prefer editing existing bullets over appending near-duplicates.
- Keep wording concrete and implementation-aware; avoid aspirational text that is not true yet.
- Do not document speculative future work as current behavior.
- If the code change is partial or behind a flag, state that explicitly.
- When the repo defines canonical files for schema or API truth, reference those exact paths.

## Completion Check

Before finishing, verify:

- `AGENTS.md` reflects the repository's new reality.
- The paired requirements/spec document reflects the same change.
- The two documents do not contradict each other.
- Any summary you give the user calls out the doc updates when they were part of the task.
