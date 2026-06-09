# ARTOON World-Class Roadmap

Date: 2026-06-07

## Purpose
This folder defines the future development plan for taking ARTOON from a complete local ecosystem to a world-class, production-grade platform.

The previous platform roadmap focused on repair, unification, and getting every package into a coherent `1.0.0` release posture. This roadmap focuses on the next maturity level: correctness, developer trust, product polish, ecosystem reach, performance, security, governance, and adoption.

## Documents
- [STRATEGIC-VISION.md](./STRATEGIC-VISION.md): north star, positioning, and success metrics.
- [ROADMAP.md](./ROADMAP.md): phased execution plan with priorities and deliverables.
- [QUALITY-ENGINEERING.md](./QUALITY-ENGINEERING.md): testing, CI, release gates, observability, and compatibility strategy.
- [PRODUCT-AND-ECOSYSTEM.md](./PRODUCT-AND-ECOSYSTEM.md): editor, CLI, VS Code, documentation, examples, integrations, and community plan.
- [ACCEPTANCE-CRITERIA.md](./ACCEPTANCE-CRITERIA.md): concrete definition of “world-class” for ARTOON.
- [INVESTOR-BRIEF.md](./INVESTOR-BRIEF.md): professional investor-style explanation and opinion on ARTOON.

## Executive Summary
ARTOON is now structurally complete: parser, AST, serializer, renderer, validator, CLI, state kernel, React editor, and VS Code extension exist and are aligned around `@artoon/state`.

The next stage should not be “more features everywhere.” It should be a disciplined push toward:
- Rock-solid format guarantees.
- Excellent authoring experience.
- Great documentation and examples.
- Automated release confidence.
- Backward-compatible evolution.
- External adoption readiness.

## Recommended Timeline
| Horizon | Target | Outcome |
|---|---|---|
| 0-2 weeks | Release hardening | Stable, reproducible, CI-backed release candidate |
| 2-6 weeks | Developer experience | First-class docs, examples, extension polish, package publishing readiness |
| 6-12 weeks | World-class editor and ecosystem | Polished editor, compatibility suite, performance budgets, public launch assets |
| 3-6 months | Adoption and platform growth | Plugins, integrations, formal spec governance, benchmarks, community loop |

## Top Priorities
1. Establish automated quality gates across the monorepo.
2. Freeze and version the ARTOON 1.0 specification.
3. Build a conformance test suite shared by parser, serializer, state, validator, renderer, CLI, and editor.
4. Finish the editor acceptance pass and reduce remaining `BlockRenderer` complexity.
5. Prepare package publishing, documentation, examples, and launch materials.
