# Permanent Factual Integrity Rule

You are operating on Babul Kumar's personal portfolio codebase. All factual personal, academic, professional, and credential data within this project is strictly protected.

## 1. Protected Information

Treat all existing factual personal and professional content as immutable and protected, including:

- **Personal Identity**: Full name ("Babul Kumar"), contact info, social handles, email addresses, and verified identity claims.
- **Academic Foundation**: University name (e.g., "Lovely Professional University"), degrees (e.g., "B.Tech in Computer Science and Engineering"), specializations, grades/CGPA, coursework, admission dates, completion dates, and graduation dates.
- **Experience & Timelines**: Employment, internships, apprenticeships, training programs, roles, organizations, locations, and date ranges.
- **Projects & Technical Work**: Project names, summaries, architectures, technical stacks, live URLs, repository links, metrics, and quantitative achievements.
- **Certifications & Credentials**: Certificate titles, issuing bodies, credential IDs, issue dates, expiration dates, and verification links.
- **Honors, Awards & Activities**: Hackathon placements, competitive programming rankings, honors, leadership positions, and co-curricular records.
- **Résumé & Bio Text**: Structured CV sections, PDF source documents, biographical statements, and public professional dossiers.

This list is illustrative and non-exhaustive. Any real-world personal or professional fact present in this repository is protected.

## 2. Strict No-Invention Policy

- **Never invent or extrapolate**: Never manufacture, estimate, infer, normalize, silently "correct", or rewrite protected factual data.
- **Never adjust dates for aesthetics**: Never alter a graduation year, study timeline, employment period, or certificate date merely to make dates appear continuous, recent, or aligned.
- **No plausible placeholders**: Do not substitute assumed or plausible data when a field or value appears missing.
- **No external inferences**: Do not treat current system timestamps, git commit dates, file modification dates, or external assumptions as justification for altering historical resume facts.

## 3. Strict Separation of Design and Content

- Requests concerning styling, layout, typography, animation, transitions, color palettes, spacing, accessibility, responsiveness, code refactoring, performance optimization, or architecture **DO NOT** authorize changes to protected factual content.
- When reorganizing components, extracting data models, or updating templates, copy and preserve original factual values, metrics, and wording exactly.
- Never edit dates or facts as a side-effect of UI/UX improvements.

## 4. Explicit Authorization Required

- Modify protected factual information **ONLY** when the user explicitly instructs that specific factual change.
- Authorization to edit one fact (e.g., updating a single project link or date) strictly applies to that item alone; do not alter any other facts.
- If an existing fact appears contradictory or erroneous, **flag it clearly and ask the user for confirmation** rather than silently changing it.

## 5. Mandatory Verification Workflow

Before completing any task touching profile, about, resume, project, training, or certificate files:
1. **Identify Sources of Truth**: Determine the baseline facts in `lib/data/` or component props.
2. **Record Baseline Values**: Note all key dates, degrees, institutions, and metrics prior to edits.
3. **Diff & Verify**: Run diff checks between modified code and original baseline to ensure zero unintended drift in facts, dates, links, or qualifications.
4. **Transparent Reporting**: Explicitly state the factual comparison results in the final report. Never claim factual verification passed without performing the actual comparison.

## 6. Priority & Rule Integration

- This rule operates concurrently with `.agents/rules/ponytail.md` and all project instructions.
- If an aesthetic or refactoring suggestion conflicts with factual fidelity, **factual fidelity strictly takes precedence**.
- This rule applies to all current and future portfolio tasks across the entire codebase.
