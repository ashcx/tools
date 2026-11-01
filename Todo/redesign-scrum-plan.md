# Scrum policy

This project follows the installed `scrum-mode` skill for sprint planning, execution,
acceptance, evidence, progression, and PR delivery. Pstack `poteto-mode` owns engineering
practices inside each task. This file records the project-specific application of that policy.

## Model and reviewers

- Every role runs on `opencode/deepseek-v4.1-flash-free`.
- Implementation stays in the main scrum session.
- The mandatory interrogate gate uses exactly two independent `ds-juror` subagents at
  `opencode/deepseek-v4.1-flash-free#max`, started in parallel with `background: true` and
  collected before deciding anything.
- `ds-juror` is read-only. It cannot edit files, commit, push, or start subagents.
- Both reviewers share one model. The record claims reviewer independence, never model or
  provider diversity.
- One reviewer gets a correctness/contracts/data-safety emphasis; the other gets a
  user-journey/coverage/maintainability emphasis. Both receive the same intent and full
  acceptance scope.

## Sprint cadence

- One-week timebox per sprint.
- Planning: up to 60 minutes.
- Daily written sync: up to 15 minutes per working day. Record written notes; do not claim
  meetings occurred.
- Review and retrospective: up to 45 minutes each.
- One observable outcome and one PR per sprint.
- Stories have an ID, priority, relative points, main-instance owner, Given/When/Then
  acceptance, sequential tasks, and named evidence.
- Initial commitment: 6 story points with 3 stretch points, re-estimated to at most 7 committed
  points. Stretch remains required for full completion.
- Reserve 20–30% of capacity for review and rework. Points are relative, not hours.

## Definition of Ready

A sprint may start when:

- Predecessor technical, design, evidence, and PR exits are verified directly, with references.
- Required contracts, fixtures, and inputs are available.
- Predecessor interrogate verdicts and any carry-forwards are rechecked for independence.
- No routine human acceptance gate remains. The current turn's planning-only boundary is a
  factual authorization gate, not a routine approval.

## Definition of Done

A sprint is complete only when:

- Every required story and task is complete with acceptance evidence.
- Relevant deterministic and integration checks are recorded with exact results.
- Preserved contracts and user-data compatibility are verified.
- The actual desktop and mobile page is inspected; captures and findings are retained.
- Separate self-review is complete and blocking findings are resolved and rechecked.
- The evidence index and execution log are current.
- The single sprint PR is open and links the sprint, orchestration plan, evidence, and
  interrogate verdict. The PR URL is recorded in the sprint, roadmap, and execution log.
- The interrogate gate is complete over the integrated sprint and full Ready/Done matrix, with
  reviewer identities, model, revisions, findings, reproductions, fixes, reruns, and verdict
  recorded.
- Required real-world evidence exists. Unavailable evidence is explicitly NOT VERIFIED.
- Deployment is observed only when the authorized scope includes it. Green local tests do not
  imply permission to merge or deploy.

## Evidence

- Evidence folder: `docs/sprint-evidence/sprint-N/`.
- Coverage matrix: every Ready/Done condition and story acceptance maps to a command,
  observation, or artifact. Use VERIFIED, NOT VERIFIED, and INCONCLUSIVE honestly.
- Record exact commands and output. A summary such as "tests pass" without the observed output
  is not evidence.
- Keep deterministic normal suites free of live network calls. Use stubbed external origins
  for redirect tests; keep live checks in a separate recorded step.
- Protect private user data. Do not commit user media, credentials, or generated test files.
- Decision trail: append-only `docs/sprint-evidence/decisions.tsv` with decision, reason,
  evidence pointer, and result. Correct an earlier row by adding a new row, not by rewriting
  history.

## Interrogate gate

The gate applies to the integrated sprint increment, not only the last commit. Scope includes:

- The base-to-head diff and any uncommitted snapshot under review.
- The sprint Goal, Entry criteria, tasks, and Exit criteria.
- The coverage matrix, contract freezes, captures, exact check results, decision trail, and any
  unfinished-work claim.

Reviewers report findings, commands, actual versus expected output, and dropped hypotheses.
They do not apply fixes. The main session reruns each alleged reproduction, drops unsupported
claims with reasons, merges shared root causes, fixes verified in-scope issues, and reruns
affected checks. A clean verdict is not reused after behavior changes; fresh review covers
changed behavior and affected acceptance rows.

An unavailable review leaves the gate NOT VERIFIED. Self-review cannot replace it.

## Last-resort unfinished work

First exhaust reasonable fixes. Record root-cause investigations, each attempted approach, exact
failures, and why alternatives cannot resolve the issue. Time pressure alone does not qualify.

A functional increment may be pushed and later independent sprints may proceed only when:

- Relevant checks and actual product journeys prove the remaining code functional, with an
  honest unavailable or recovery state for the gap.
- The gap does not compromise correctness, user-data safety, shared contracts, or demonstrated
  core behavior.
- Inspection of later sprint files and contract consumers proves later work is independent and
  will not make the gap unsafe or invalidate evidence.
- `Todo/sprint-N-unfinished.md` records missing tasks, impact, exhausted attempts, evidence,
  independence, recovery action, and reopening conditions.
- Interrogate verifies the carry-forward assessment and all non-excepted gates pass.
- The sprint remains In progress, unfinished boxes stay unchecked, and the PR links the record.

## Autonomy

- Do not ask for routine sprint acceptance, design approval, PR review permission, or
  permission to start the next eligible sprint.
- Decide within the stated outcome. Test empirical questions instead of asking the user to
  guess behavior.
- Ask only when intent is materially doubtful, instructions conflict irreconcilably, or
  essential information cannot be observed.
- Continue independent authorized work while awaiting clarification.
- Merge and deploy are separate lifecycle actions. Perform them only when the current
  authorization includes them.
- A reusable skill cannot grant authority over unrelated communications, destructive actions,
  installation, or production releases.

## Planning-only boundary

A planning request produces plans. It does not authorize implementation, repository creation,
or deployment. Sprint 1 records this boundary in its Entry criteria. Execution starts only
after a separate go-ahead.

## Recovery timebox

At timebox expiry, record unfinished work and open a recovery timebox. Do not silently relax
acceptance, tests, or contracts. Keep recovery tasks in the owning sprint; do not create a
parallel backlog.

## Project-specific notes

- Sibling repositories are read-only unless the user separately authorizes a change there.
- The Audio Toolkit header already targets `/tools/`, the canonical hub. No audio code, test,
  or deployment change is planned. Optional alignment of its older plan wording stays in that
  repository.
- The hub has no runtime dependencies. Verification tooling is development-only and must not
  leak into the deployed artifact.
- The canonical hub URL is a contract. Changing it requires updating the 404 base and the live
  verification records, and checking whether sibling links still match.
