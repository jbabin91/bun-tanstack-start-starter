#!/usr/bin/env bun
/**
 * Validate internal links in markdown documentation.
 *
 * Scans all .md files in docs/ and checks that relative links point to existing files.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Root directory for docs
const DOCS_ROOT = path.resolve(import.meta.dir, '../docs');

type LinkInfo = {
  link: string;
  lineNum: number;
};

/**
 * Find all markdown files under root directory.
 */
function findMarkdownFiles(root: string): string[] {
  const results: string[] = [];

  function walk(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  }

  walk(root);
  return results.toSorted();
}

/**
 * Extract relative markdown links from content.
 * Returns list of {link, lineNum} objects.
 */
function extractLinks(content: string, _filePath: string): LinkInfo[] {
  const links: LinkInfo[] = [];

  // Match markdown links: [text](link)
  // Also match bare links in angle brackets: <link>
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)|<([^>]+\.md)>/g;

  const lines = content.split('\n');

  for (const [lineNum, line] of lines.entries()) {
    let match: RegExpExecArray | null;

    // Reset lastIndex for each line
    linkPattern.lastIndex = 0;

    while ((match = linkPattern.exec(line)) !== null) {
      const link = match[2] || match[3];

      if (link) {
        // Skip external links, anchors only, and special URIs
        if (
          link.startsWith('http://') ||
          link.startsWith('https://') ||
          link.startsWith('mailto:') ||
          link.startsWith('#')
        ) {
          continue;
        }

        // Extract just the file part (before any #anchor)
        const linkWithoutAnchor = link.split('#')[0];

        if (linkWithoutAnchor) {
          // Skip if only an anchor was present
          links.push({ link: linkWithoutAnchor, lineNum: lineNum + 1 });
        }
      }
    }
  }

  return links;
}

/**
 * Resolve a relative link from a markdown file.
 */
function resolveLink(fromFile: string, link: string): string {
  // Get directory containing the source file
  const baseDir = path.dirname(fromFile);

  // Resolve the link relative to that directory
  return path.resolve(baseDir, link);
}

/**
 * Validate all internal links in markdown files.
 * Returns {errors, totalLinks}.
 */
function validateLinks(root: string): { errors: string[]; total: number } {
  const errors: string[] = [];
  let totalLinks = 0;

  const mdFiles = findMarkdownFiles(root);

  for (const mdFile of mdFiles) {
    const content = readFileSync(mdFile, 'utf8');
    const links = extractLinks(content, mdFile);

    for (const { link, lineNum } of links) {
      totalLinks++;
      const target = resolveLink(mdFile, link);

      if (!existsSync(target)) {
        const relSource = path.relative(root, mdFile);
        const relTarget = path.relative(path.dirname(root), target);
        errors.push(
          `${relSource}:${lineNum}: broken link '${link}' (resolved to ${relTarget})`,
        );
      }
    }
  }

  return { errors, total: totalLinks };
}

/**
 * Run link validation and report results.
 */
function main() {
  if (!existsSync(DOCS_ROOT)) {
    console.error(`Error: docs directory not found at ${DOCS_ROOT}`);
    process.exit(1);
  }

  console.log(`Validating internal links in ${DOCS_ROOT}...`);

  console.log();
  const { errors, total } = validateLinks(DOCS_ROOT);

  if (errors.length > 0) {
    console.log(
      `Found ${errors.length} broken link(s) out of ${total} total:\n`,
    );
    for (const error of errors) {
      console.log(`  ❌ ${error}`);
    }
    console.log();
    process.exit(1);
  } else {
    console.log(`✅ All ${total} internal links are valid!`);
    process.exit(0);
  }
}

main();
