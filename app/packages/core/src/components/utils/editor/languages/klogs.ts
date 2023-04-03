import { languages } from 'monaco-editor';

import CompletionItem = languages.CompletionItem;
import ProviderResult = languages.ProviderResult;
import CompletionList = languages.CompletionList;
import CompletionItemKind = languages.CompletionItemKind;
import LanguageConfiguration = languages.LanguageConfiguration;
import IMonarchLanguage = languages.IMonarchLanguage;

export const conf: LanguageConfiguration = {
  autoClosingPairs: [{ close: ')', open: '(' }],
  brackets: [['(', ')']],
  colorizedBracketPairs: [['(', ')']],
  surroundingPairs: [
    { close: ')', open: '(' },
    { close: "'", open: "'" },
  ],
};

const operators = [
  {
    label: '!= (equals)',
    op: '=',
  },
  {
    label: '!= (not equals)',
    op: '!=',
  },
  {
    label: '< (smaller)',
    op: '<',
  },
  {
    label: '<= (smaller or equal)',
    op: '<=',
  },
  {
    label: '> (greater)',
    op: '>',
  },
  {
    label: '>= (greater or equal)',
    op: '>=',
  },
  {
    label: '=~ (ILIKE)',
    op: '=~',
  },
  {
    label: '!~ (not ILIKE)',
    op: '!~',
  },
  {
    label: '~ (regex match)',
    op: '~',
  },
];

const logicalOperators = [
  {
    label: '_and_ (and statement)',
    op: '_and_',
  },
  {
    label: '_or_ (or statement)',
    op: '_or_',
  },
  {
    label: '_not_ (not statement)',
    op: '_not_',
  },
  {
    label: '_exists_ (exists statement)',
    op: '_exists_',
  },
];

/**
 * language is the language definition for the klogs query language
 */
export const language: IMonarchLanguage = {
  brackets: [{ close: ')', open: '(', token: 'delimiter.parenthesis' }],
  defaultToken: '',
  ignoreCase: true,
  // both lowercase and uppercase logical ops are allowed
  keywords: [...logicalOperators.map((lop) => lop.op), ...logicalOperators.map((lop) => lop.op.toUpperCase())],
  operators: operators.map((op) => op.op),
  symbols: /[=><!~]+/,

  // the following block tokenizes klogs queries. The monaco editor converts these tokens into spans with class-names for styling.
  // The default classes can be found here: https://microsoft.github.io/monaco-editor/monarch-static.html
  // the token debug view is useful for verifying the validity of rules. It can be enabled with:
  // press `F1` inside the editor and pick `Developer: Inspect Tokens` (make sure to enable the keybind inside Editor.tsx)
  tokenizer: {
    root: [
      { include: '@whitespace' },
      { include: '@numbers' },
      [/'/, 'string', '@string'],
      // double quoted strings are not recognized in our parser
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
            '@default': '',
            '@operators': 'operators',
          },
        },
      ],
      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            '@default': 'identifier',
            '@keywords': 'type',
          },
        },
      ],
    ],
    // root must be the first element in the object. If it's not, the syntax highlighting breaks.
    // eslint-disable-next-line sort-keys
    numbers: [[/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'number']],
    string: [
      [/[^']+/, 'string'],
      [/''/, 'string'],
      [/'/, { next: '@pop', token: 'string' }],
    ],
    stringDouble: [
      [/[^"]+/, 'invalid'],
      [/""/, 'invalid'],
      [/"/, { next: '@pop', token: 'invalid' }],
    ],
    whitespace: [[/\s+/, 'white']],
  },
};

export const klogsLanguageDefinition = {
  aliases: ['klogs'],
  extensions: ['.klogs'],
  id: 'klogs',
  loader: () => {
    return {
      completionItemProvider: {
        provideCompletionItems: () => {
          // completions should incldue both logical operators and comparison operators
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

          const suggestions = operatorSuggestions.map(({ op, label, kind }) => {
            return {
              insertText: op,
              insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
              kind: kind,
              label: label,
            } as CompletionItem;
          });

          return { suggestions } as ProviderResult<CompletionList>;
        },
      },
      language: language,
      languageConfiguration: conf,
    };
  },
  mimetypes: [],
};
