import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const nordTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  colors: {
    'editor.background': '#2E3440',
    'editor.foreground': '#D8DEE9',
    'editor.lineHighlightBackground': '#3B4252',
    'editor.selectionBackground': '#434C5ECC',
    'editorCursor.foreground': '#D8DEE9',
    'editorWhitespace.foreground': '#434C5ECC',
  },
  inherit: true,
  rules: [
    {
      background: '2E3440',
      token: '',
    },
    {
      foreground: '616e88',
      token: 'comment',
    },
    {
      foreground: 'a3be8c',
      token: 'string',
    },
    {
      foreground: 'b48ead',
      token: 'constant.numeric',
    },
    {
      foreground: '81a1c1',
      token: 'constant.language',
    },
    {
      foreground: '81a1c1',
      token: 'keyword',
    },
    {
      foreground: '81a1c1',
      token: 'storage',
    },
    {
      foreground: '81a1c1',
      token: 'storage.type',
    },
    {
      foreground: '8fbcbb',
      token: 'entity.name.class',
    },
    {
      fontStyle: '  bold',
      foreground: '8fbcbb',
      token: 'entity.other.inherited-class',
    },
    {
      foreground: '88c0d0',
      token: 'entity.name.function',
    },
    {
      foreground: '81a1c1',
      token: 'entity.name.tag',
    },
    {
      foreground: '8fbcbb',
      token: 'entity.other.attribute-name',
    },
    {
      foreground: '88c0d0',
      token: 'support.function',
    },
    {
      background: 'f92672',
      foreground: 'f8f8f0',
      token: 'invalid',
    },
    {
      background: 'ae81ff',
      foreground: 'f8f8f0',
      token: 'invalid.deprecated',
    },
    {
      foreground: 'b48ead',
      token: 'constant.color.other.rgb-value',
    },
    {
      foreground: 'ebcb8b',
      token: 'constant.character.escape',
    },
    {
      foreground: '8fbcbb',
      token: 'variable.other.constant',
    },
  ],
};
