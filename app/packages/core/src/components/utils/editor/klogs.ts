/* eslint-disable sort-keys */
import { languages } from 'monaco-editor';

import CompletionItem = languages.CompletionItem;
import ProviderResult = languages.ProviderResult;
import CompletionList = languages.CompletionList;
import CompletionItemKind = languages.CompletionItemKind;
import LanguageConfiguration = languages.LanguageConfiguration;
import IMonarchLanguage = languages.IMonarchLanguage;

export const conf: LanguageConfiguration = {
  brackets: [['(', ')']],
  autoClosingPairs: [{ open: '(', close: ')' }],
  colorizedBracketPairs: [['(', ')']],
  surroundingPairs: [
    { open: '(', close: ')' },
    { open: "'", close: "'" },
  ],
};

const operators = [
  {
    op: '=',
    label: '!= (equals)',
  },
  {
    op: '!=',
    label: '!= (not equals)',
  },
  {
    op: '<',
    label: '< (smaller)',
  },
  {
    op: '<=',
    label: '<= (smaller or equal)',
  },
  {
    op: '>',
    label: '> (greater)',
  },
  {
    op: '>=',
    label: '>= (greater or equal)',
  },
  {
    op: '=~',
    label: '=~ (ILIKE)',
  },
  {
    op: '!~',
    label: '!~ (not ILIKE)',
  },
  {
    op: '~',
    label: '~ (regex match)',
  },
];

const logicalOperators = [
  {
    op: '_and_',
    label: '_and_ (and statement)',
  },
  {
    op: '_or_',
    label: '_or_ (or statement)',
  },
  {
    op: '_not_',
    label: '_not_ (not statement)',
  },
  {
    op: '_exists_',
    label: '_exists_ (exists statement)',
  },
];

/**
 * language is the language definition for the klogs query language
 */
export const language: IMonarchLanguage = {
  defaultToken: '',
  ignoreCase: true,
  brackets: [{ open: '(', close: ')', token: 'delimiter.parenthesis' }],
  // both lowercase and uppercase logical ops are allowed
  keywords: [...logicalOperators.map((lop) => lop.op), ...logicalOperators.map((lop) => lop.op.toUpperCase())],
  operators: operators.map((op) => op.op),
  symbols: /[=><!~]+/,

  // the following block tokenizes klogs queries. The query is converted into spans with class-names.
  // the default classes can be found here: https://microsoft.github.io/monaco-editor/monarch-static.html
  // the token debug view is useful for verifying the validity of rules. It can be enabled with:
  // `F1` inside the editor and pick `Developer: Inspect Tokens` (make sure to enable the keybind inside Editor.tsx)
  tokenizer: {
    root: [
      { include: '@whitespace' },
      { include: '@numbers' },
      [/'/, 'string', '@string'],
      // double quoted strings are not recognized
      // therefore they're marked with the `invalid` class
      [/"/, 'invalid', '@stringDouble'],
      // some characters which shouldn't be used in the editor
      // they can be marked with the `invalid` class
      [/[[\]+-,;]/, 'invalid'],
      [/[()]/, '@brackets'],
      [
        /@symbols/,
        {
          cases: {
            '@operators': 'operators',
            '@default': '',
          },
        },
      ],
      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            '@keywords': 'type',
            '@default': 'identifier',
          },
        },
      ],
    ],
    whitespace: [[/\s+/, 'white']],
    numbers: [[/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'number']],
    string: [
      [/[^']+/, 'string'],
      [/''/, 'string'],
      [/'/, { token: 'string', next: '@pop' }],
    ],
    stringDouble: [
      [/[^"]+/, 'invalid'],
      [/""/, 'invalid'],
      [/"/, { token: 'invalid', next: '@pop' }],
    ],
  },
};

export const klogsLanguageDefinition = {
  id: 'klogs',
  extensions: ['.klogs'],
  aliases: ['klogs'],
  mimetypes: [],
  loader: () => {
    return {
      languageConfiguration: conf,
      language: language,
      completionItemProvider: {
        provideCompletionItems: () => {
          const operatorSuggestions = [
            ...operators.map((op) => ({
              ...op,
              kind: CompletionItemKind.Operator,
            })),
            ...logicalOperators.map((op) => ({
              ...op,
              kind: CompletionItemKind.Variable,
            })),
          ];

          // To simplify, we made the choice to never create automatically the parenthesis behind keywords
          // It is because in PromQL, some keywords need parenthesis behind, some don't, some can have but it's optional.
          const suggestions = operatorSuggestions.map(({ op, label, kind }) => {
            return {
              label: label,
              kind: kind,
              insertText: op,
              insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
            } as CompletionItem;
          });

          return { suggestions } as ProviderResult<CompletionList>;
        },
      },
    };
  },
};
