# Bryntum Software Development Lifecycle

## Purpose and scope

This document describes the process Bryntum follows during software development, to ensure quality, security
and consistency.

It applies to the development of all our products — Grid, Scheduler, Scheduler Pro, Gantt, Calendar, TaskBoard
and Charts.

## Release types

We define three kinds of releases:

* **Patch** — Bug fixes only, no API changes. Released every third week.
* **Minor** — New features and examples, but no breaking API changes. Released every 9–12 weeks.
* **Major** — May include breaking changes. We aim for two major releases per year.

## Development process

All work items, bugs, and feature requests are tracked as issues on GitHub. Issues include a description,
reproduction steps (for bugs), and acceptance criteria.

Development follows these stages:

1. **Acceptance** — The developer verifies that the issue is well defined and, for bugs, reproducible.
2. **Implementation** — Work is done on a feature branch. Documentation, test coverage, and changelog entries
   are required.
3. **Automated checks** — Creating or updating a pull request automatically triggers builds, tests, and
   SonarQube security scans.
4. **Code review** — Each pull request is first reviewed using AI and then requires approval from two humans: a Product
   Owner review followed by a Gatekeeper (senior developer) review.
5. **Merge** — Only allowed after both approvals and all automated checks pass.

## Version control

All product code is hosted in a private GitHub repository with restricted access. Developers work on feature
branches — direct pushes to main branches are not allowed.

## Testing

All bug fixes must include a test that fails without the fix in place. New features must also be covered with
tests to a reasonable extent. Tests run automatically on every pull request and must pass before merging.

For minor and major releases, manual testing is performed in addition to automated tests.

## Documentation

All public APIs must be documented, including descriptions, types, parameters, and usage snippets. Resolved
issues are noted in the product changelog. New features are described in the What's New guide. Deprecations
and breaking changes are included in the Upgrade guide and, where applicable, trigger programmatic warnings.

## Security

Bryntum products are front-end JavaScript components with very few external dependencies, which limits the
attack surface. We take the following measures:

* Code is scanned for security issues using static analysis with SonarQube and dependency monitoring using Dependabot.
* Examples are automatically tested to prevent XSS vulnerabilities.
* Dependencies, when used, are monitored for known vulnerabilities.

### Vulnerability response

Critical vulnerabilities and CVEs are treated with the highest priority. Bryntum bypasses the normal release
cycle to ship a fix as soon as one is available. Non-critical issues are included in the next patch or minor
release.

## CI/CD

Builds and tests run automatically on every pull request. Results are reported back to GitHub and must pass
before code can be merged. Releases are also triggered through our CI/CD pipeline.

## Post-release

After each release, our support team monitors incoming customer issues. Issues are triaged, prioritized, and
fed back into the development cycle.


<p class="last-modified">Last modified on 2026-07-22 10:38:53</p>