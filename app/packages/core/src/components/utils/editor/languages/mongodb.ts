import { languages } from 'monaco-editor';

import CompletionItem = languages.CompletionItem;
import ProviderResult = languages.ProviderResult;
import CompletionList = languages.CompletionList;
import CompletionItemKind = languages.CompletionItemKind;
import LanguageConfiguration = languages.LanguageConfiguration;
import IMonarchLanguage = languages.IMonarchLanguage;

export const conf: LanguageConfiguration = {
  autoClosingPairs: [
    { close: ')', open: '(' },
    { close: '}', open: '{' },
    { close: ']', open: '[' },
  ],
  brackets: [
    ['(', ')'],
    ['{', '}'],
    ['[', ']'],
  ],
  colorizedBracketPairs: [
    ['(', ')'],
    ['{', '}'],
    ['[', ']'],
  ],
  surroundingPairs: [
    { close: ')', open: '(' },
    { close: '}', open: '{' },
    { close: ']', open: '[' },
    { close: "'", open: "'" },
    { close: '"', open: '"' },
  ],
};

const operators = [
  {
    label: '$eq',
    op: '$eq',
  },
  {
    label: '$gt',
    op: '$gt',
  },
  {
    label: '$gte',
    op: '$gte',
  },
  {
    label: '$in',
    op: '$in',
  },
  {
    label: '$lt',
    op: '$lt',
  },
  {
    label: '$lte',
    op: '$lte',
  },
  {
    label: '$ne',
    op: '$ne',
  },
  {
    label: '$nin',
    op: '$nin',
  },
  {
    label: '$and',
    op: '$and',
  },
  {
    label: '$not',
    op: '$not',
  },
  {
    label: '$nor',
    op: '$nor',
  },
  {
    label: '$or',
    op: '$or',
  },
  {
    label: '$exists',
    op: '$exists',
  },
  {
    label: '$type',
    op: '$type',
  },
  {
    label: '$expr',
    op: '$expr',
  },
  {
    label: '$jsonSchema',
    op: '$jsonSchema',
  },
  {
    label: '$mod',
    op: '$mod',
  },
  {
    label: '$regex',
    op: '$regex',
  },
  {
    label: '$text',
    op: '$text',
  },
  {
    label: '$where',
    op: '$where',
  },
  {
    label: '$geoIntersects',
    op: '$geoIntersects',
  },
  {
    label: '$geoWithin',
    op: '$geoWithin',
  },
  {
    label: '$near',
    op: '$near',
  },
  {
    label: '$nearSphere',
    op: '$nearSphere',
  },
  {
    label: '$all',
    op: '$all',
  },
  {
    label: '$elemMatch',
    op: '$elemMatch',
  },
  {
    label: '$size',
    op: '$size',
  },
  {
    label: '$bitsAllClear',
    op: '$bitsAllClear',
  },
  {
    label: '$bitsAllSet',
    op: '$bitsAllSet',
  },
  {
    label: '$bitsAnyClear',
    op: '$bitsAnyClear',
  },
  {
    label: '$bitsAnySet',
    op: '$bitsAnySet',
  },
];

const logicalOperators = [
  {
    label: 'Binary',
    op: 'Binary',
  },
  {
    label: 'Code',
    op: 'Code',
  },
  {
    label: 'DBRef',
    op: 'DBRef',
  },
  {
    label: 'Decimal128',
    op: 'Decimal128',
  },
  {
    label: 'Double',
    op: 'Double',
  },
  {
    label: 'Int32',
    op: 'Int32',
  },
  {
    label: 'Long',
    op: 'Long',
  },
  {
    label: 'UUID',
    op: 'UUID',
  },
  {
    label: 'Map',
    op: 'Map',
  },
  {
    label: 'MaxKey',
    op: 'MaxKey',
  },
  {
    label: 'MinKey',
    op: 'MinKey',
  },
  {
    label: 'ObjectId',
    op: 'ObjectId',
  },
  {
    label: 'BSONRegExp',
    op: 'BSONRegExp',
  },
  {
    label: 'BSONSymbol',
    op: 'BSONSymbol',
  },
  {
    label: 'Timestamp',
    op: 'Timestamp',
  },
];

/**
 * language is the language definition for the mongodb query language
 */
export const language: IMonarchLanguage = {
  brackets: [
    { close: ')', open: '(', token: 'delimiter.parenthesis' },
    { close: '}', open: '{', token: 'delimiter.parenthesis' },
    { close: ']', open: '[', token: 'delimiter.parenthesis' },
  ],
  defaultToken: '',
  ignoreCase: true,
  keywords: logicalOperators.map((lop) => lop.op),
  operators: operators.map((op) => op.op),
  symbols: /[=><!~]+/,

  // The following block tokenizes signalsciences queries. The monaco editor converts these tokens into spans with
  // class-names for styling.
  //
  // The default classes can be found here: https://microsoft.github.io/monaco-editor/monarch-static.html
  tokenizer: {
    root: [
      { include: '@whitespace' },
      { include: '@numbers' },
      [/'/, 'string', '@string'],
      [/"/, 'string', '@stringDouble'],
      [/[{}()[\]]/, '@brackets'],
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
        /[a-zA-Z$]\w*/,
        {
          cases: {
            '@default': 'identifier',
            '@keywords': 'type',
          },
        },
      ],
    ],
    // "root" must be the first element in the object. If it's not, the syntax highlighting breaks.
    // eslint-disable-next-line sort-keys
    numbers: [[/((\d+(\.\d*)?)|(\.\d+))([eE][-+]?\d+)?/, 'number']],
    string: [
      [/[^']+/, 'string'],
      [/''/, 'string'],
      [/'/, { next: '@pop', token: 'string' }],
    ],
    stringDouble: [
      [/[^"]+/, 'string'],
      [/""/, 'string'],
      [/"/, { next: '@pop', token: 'string' }],
    ],
    whitespace: [[/\s+/, 'white']],
  },
};

export const mongodbLanguageDefinition = {
  aliases: ['mongodb'],
  extensions: ['.mongodb'],
  id: 'mongodb',
  loader: () => {
    return {
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

          const suggestions = operatorSuggestions.map(({ op, label, kind }) => {
            return {
              insertText: kind === CompletionItemKind.Operator ? `\\${op}` : op,
              insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
              kind: kind,
              label: label,
            } as CompletionItem;
          });

          return { suggestions } as ProviderResult<CompletionList>;
        },
        triggerCharacters: ['$'],
      },
      language: language,
      languageConfiguration: conf,
    };
  },
  mimetypes: [],
};
