import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { darken, lighten, Theme } from '@mui/material';

/**
 * `createTheme` creates a new theme for our `CodeMirrorEditor` component based on the provided MUI theme.
 */
export const createTheme = (theme: Theme, minimal: boolean) => {
  return EditorView.theme(
    {
      '&.cm-editor': {
        '&.cm-focused': {
          outline: 'none',
          outline_fallback: 'none',
        },

        backgroundColor: minimal ? theme.palette.background.default : theme.palette.background.paper,
        height: '100%',
        width: '100%',
      },

      '.cm-activeLineGutter': {
        backgroundColor: darken(theme.palette.background.paper, 0.13),
      },

      '.cm-completionDetail': {
        color: '#999',
        float: 'right',
      },

      '.cm-completionIcon': {
        '&:after': { content: "'\\ea88'" },
        boxSizing: 'content-box',
        fontFamily: 'codicon',
        fontSize: '16px',
        lineHeight: '1',
        marginRight: '10px',
        opacity: '1',
        paddingRight: '0',
        verticalAlign: 'top',
      },

      '.cm-completionIcon-class': {
        '&:after': { content: "'○'" },
      },

      '.cm-completionIcon-constant': {
        '&:after': { content: "'\\eb5f'" },
      },

      '.cm-completionIcon-enum': {
        '&:after': { content: "'∪'" },
      },

      '.cm-completionIcon-function, .cm-completionIcon-method': {
        '&:after': { content: "'\\ea8c'" },
      },

      '.cm-completionIcon-interface': {
        '&:after': { content: "'◌'" },
      },

      '.cm-completionIcon-keyword': {
        '&:after': { content: "'\\eb62'" },
      },

      '.cm-completionIcon-namespace': {
        '&:after': { content: "'▢'" },
      },

      '.cm-completionIcon-property': {
        '&:after': { content: "'□'" },
      },

      '.cm-completionIcon-text': {
        '&:after': { content: "'\\ea95'" },
      },

      '.cm-completionIcon-type': {
        '&:after': { content: "'𝑡'" },
      },

      '.cm-completionIcon-variable': {
        '&:after': { content: "'𝑥'" },
      },

      '.cm-completionInfo.cm-completionInfo-left': {
        '&:before': {
          borderColor: 'transparent',
          borderStyle: 'solid',
          borderWidth: '10px',
          content: "' '",
          height: '0',
          position: 'absolute',
          right: '-20px',
          width: '0',
        },
        marginRight: '12px',
      },

      '.cm-completionInfo.cm-completionInfo-right': {
        '&:before': {
          borderColor: 'transparent',
          borderStyle: 'solid',
          borderWidth: '10px',
          content: "' '",
          height: '0',
          left: '-20px',
          position: 'absolute',
          width: '0',
        },
        marginLeft: '12px',
      },

      '.cm-completionMatchedText': {
        fontWeight: 'bold',
        textDecoration: 'none',
      },

      '.cm-content': {
        fontSize: 13,
        lineHeight: '18.687px',
        padding: '8.5px',
      },

      '.cm-diagnostic': {
        '&.cm-diagnostic-error': {
          borderLeft: `3px solid ${theme.palette.error.main}`,
        },
      },

      '.cm-gutters': {
        backgroundColor: '#233044',
      },

      '.cm-matchingBracket': {
        fontWeight: 'bold',
        outline: '1px dashed transparent',
      },
      '.cm-nonmatchingBracket': {
        borderColor: theme.palette.error.main,
      },

      '.cm-placeholder': {
        fontFamily: 'monospace',
      },

      '.cm-scroller': {
        fontFamily: 'monospace',
        overflow: 'auto',
      },

      '.cm-selectionMatch': {
        backgroundColor: '#e6f3ff',
      },

      '.cm-tooltip': {
        backgroundColor: lighten(theme.palette.background.paper, 0.025),
      },

      '.cm-tooltip.cm-completionInfo': {
        border: 'none',
        fontFamily: 'monospace',
        marginTop: '-11px',
        maxWidth: 'min-content',
        minWidth: '250px',
        padding: '10px',
      },

      '.cm-tooltip.cm-tooltip-autocomplete': {
        '& > ul': {
          fontFamily: 'monospace',
          maxHeight: '200px',
          maxWidth: '75vw',
        },
        '& > ul > li': {
          color: theme.palette.text.primary,
          padding: '2px 1em 2px 3px',
        },
        '& > ul > li[aria-selected]': {
          backgroundColor: theme.palette.primary.main,
        },
        minWidth: '30%',
      },
    },
    { dark: true },
  );
};

/**
 * `createHighlighter` creates a new syntax highlighting theme for our `CodeMirrorEditor` component based on the
 * provided MUI theme.
 */
export const createHighlighter = (theme: Theme) => {
  return HighlightStyle.define([
    { color: '#cf6edf', tag: tags.keyword },
    { color: '#56c8d8', tag: [tags.name, tags.deleted, tags.character, tags.macroName] },
    { color: '#facf4e', tag: [tags.propertyName] },
    { color: '#bdbdbd', tag: [tags.variableName] },
    { color: '#56c8d8', tag: [tags.function(tags.variableName)] },
    { color: '#cf6edf', tag: [tags.labelName] },
    { color: '#facf4e', tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)] },
    { color: '#fa5788', tag: [tags.definition(tags.name), tags.separator] },
    { color: '#cf6edf', tag: [tags.brace] },
    { color: '#ff5f52', tag: [tags.annotation] },
    { color: '#ffad42', tag: [tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace] },
    { color: '#ffad42', tag: [tags.typeName, tags.className] },
    { color: '#7186f0', tag: [tags.operator, tags.operatorKeyword] },
    { color: '#99d066', tag: [tags.tagName] },
    { color: '#ff5f52', tag: [tags.squareBracket] },
    { color: '#606f7a', tag: [tags.angleBracket] },
    { color: '#bdbdbd', tag: [tags.attributeName] },
    { color: '#ff5f52', tag: [tags.regexp] },
    { color: '#6abf69', tag: [tags.quote] },
    { color: '#99d066', tag: [tags.string] },
    { color: '#56c8d8', tag: tags.link, textDecoration: 'underline', textUnderlinePosition: 'under' },
    { color: '#facf4e', tag: [tags.url, tags.escape, tags.special(tags.string)] },
    { color: '#707d8b', tag: [tags.meta] },
    { color: '#707d8b', fontStyle: 'italic', tag: [tags.comment] },
    { color: '#bdbdbd', tag: tags.monospace },
    { color: '#ff5f52', fontWeight: 'bold', tag: tags.strong },
    { color: '#99d066', fontStyle: 'italic', tag: tags.emphasis },
    { tag: tags.strikethrough, textDecoration: 'line-through' },
    { color: '#facf4e', fontWeight: 'bold', tag: tags.heading },
    { color: '#facf4e', fontWeight: 'bold', tag: tags.heading1 },
    { color: '#facf4e', fontWeight: 'bold', tag: [tags.heading2, tags.heading3, tags.heading4] },
    { color: '#facf4e', tag: [tags.heading5, tags.heading6] },
    { color: '#56c8d8', tag: [tags.atom, tags.bool, tags.special(tags.variableName)] },
    { color: '#ff5f52', tag: [tags.processingInstruction, tags.inserted] },
    { color: '#56c8d8', tag: [tags.contentSeparator] },
    { borderBottom: `1px dotted #ff5f52`, color: '#606f7a', tag: tags.invalid },
  ]);
};
