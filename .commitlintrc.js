import { defineConfig } from 'cz-git';

export default defineConfig({
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New features
        'fix', // Bug fixes
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc.)
        'refactor', // Code changes that neither fix bugs nor add features
        'perf', // Performance improvements
        'test', // Adding or correcting tests
        'chore', // Dependencies, tooling, etc.
        'ci', // CI configuration changes
        'revert', // Revert a previous commit
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-full-stop': [2, 'never', '.'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 200],
    'body-max-length': [2, 'always', Infinity],
    'body-max-line-length': [0, 'always'],
  },
  prompt: {
    alias: {
      fd: 'docs: fix typos',
      qd: 'docs(query): update query documentation',
      rd: 'docs(router): update router documentation',
      sd: 'docs(start): update start documentation',
      b: 'chore(deps): bump dependencies',
    },
    scopes: [
      // TanStack integrations
      'query',
      'router',
      'start',
      'form',
      'table',

      // Project areas
      'routes',
      'components',
      'hooks',
      'lib',
      'providers',
      'styles',

      // Infrastructure
      'config',
      'build',
      'deps',
      'dx',

      // Documentation
      'docs',
      'architecture',
    ],
    useEmojis: true,
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    skipQuestions: [],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: Infinity,
    maxSubjectLength: Infinity,
    minSubjectLength: 0,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
});
