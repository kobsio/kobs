import { languages } from 'monaco-editor';

import CompletionItem = languages.CompletionItem;
import ProviderResult = languages.ProviderResult;
import CompletionList = languages.CompletionList;
import CompletionItemKind = languages.CompletionItemKind;
import LanguageConfiguration = languages.LanguageConfiguration;
import IMonarchLanguage = languages.IMonarchLanguage;

export const conf: LanguageConfiguration = {
  autoClosingPairs: [],
  brackets: [],
  colorizedBracketPairs: [],
  surroundingPairs: [],
};

const operators = [
  {
    label: ':= (equals)',
    op: ':=',
  },
  {
    label: '!= (not equals)',
    op: '!=',
  },
  {
    label: ':> (greater-than, integers only)',
    op: ':>',
  },
  {
    label: ':>= (equals or greater-than, integers only)',
    op: ':>=',
  },
  {
    label: ':< (less-than, integers only)',
    op: ':<',
  },
  {
    label: ':<= (equals or less-than, integers only)',
    op: ':<=',
  },
  {
    label: ':~ (search on the field with the terms provided)',
    op: ':~',
  },
];

const logicalOperators = [
  { label: 'agent', op: 'agent' },
  { label: 'agentcode', op: 'agentcode' },
  { label: 'bytesout', op: 'bytesout' },
  { label: 'country', op: 'country' },
  { label: 'from', op: 'from' },
  { label: 'httpcode', op: 'httpcode' },
  { label: 'ip', op: 'ip' },
  { label: 'method', op: 'method' },
  { label: 'path', op: 'path' },
  { label: 'payload', op: 'payload' },
  { label: 'protocol', op: 'protocol' },
  { label: 'ratelimited', op: 'ratelimited' },
  { label: 'responsemillis', op: 'responsemillis' },
  { label: 'remotehost', op: 'remotehost' },
  { label: 'server', op: 'server' },
  { label: 'tag', op: 'tag' },
  { label: 'target', op: 'target' },
  { label: 'sort', op: 'sort' },
  { label: 'until', op: 'until' },
  { label: 'useragent', op: 'useragent' },
];

/**
 * language is the language definition for the signalsciences query language
 */
export const language: IMonarchLanguage = {
  brackets: [],
  defaultToken: '',
  ignoreCase: true,
  keywords: [...logicalOperators.map((lop) => lop.op), ...logicalOperators.map((lop) => lop.op.toUpperCase())],
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
        /[a-zA-Z:]\w*/,
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

export const signalsciencesLanguageDefinition = {
  aliases: ['signalsciences'],
  extensions: ['.signalsciences'],
  id: 'signalsciences',
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
