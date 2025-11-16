# Documentation Instructions

- Scope: `docs/` and nested directories.
- Use plain Markdown (MDX not enabled) with a single `#` top-level heading per file.
- Frontmatter is optional; if used, keep keys lowercase and hyphenated.
- Keep sentences concise; prefer short paragraphs and bulleted lists for steps.
- Link internal files with relative paths (e.g., `../src/...`).
- When referencing commands, wrap them in backticks or fenced code blocks.
- Document rationale when introducing new sections so future readers know "why".
- Avoid TODO placeholders—either provide content or explicitly mark "TBD" with context.
- Update tables of contents manually; no auto-generated anchors.
- Run `bun --bun prettier -uwl docs` if formatting drifts.
