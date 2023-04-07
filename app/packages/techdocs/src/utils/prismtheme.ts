import { Theme } from '@mui/material';
import { CSSProperties } from 'react';

export const prismTheme = (theme: Theme): { [key: string]: CSSProperties } => {
  return {
    'code[class*="language-"]': {
      MozHyphens: 'none',
      MozTabSize: '4',
      OTabSize: '4',
      WebkitHyphens: 'none',
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
      fontFamily: 'monospace',
      fontSize: 13,
      hyphens: 'none',
      lineHeight: '1.5em',
      msHyphens: 'none',
      tabSize: '4',
      textAlign: 'left',
      whiteSpace: 'pre',
      wordBreak: 'normal',
      wordSpacing: 'normal',
      wordWrap: 'normal',
    },

    'pre[class*="language-"]': {
      MozHyphens: 'none',
      MozTabSize: '4',
      OTabSize: '4',
      WebkitHyphens: 'none',
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
      fontFamily: 'monospace',
      fontSize: 13,
      hyphens: 'none',
      lineHeight: '1.5em',
      margin: '0.5em 0',
      msHyphens: 'none',
      overflow: 'auto',
      padding: '1.25em 1em',
      position: 'relative',
      tabSize: '4',
      textAlign: 'left',
      whiteSpace: 'pre',
      wordBreak: 'normal',
      wordSpacing: 'normal',
      wordWrap: 'normal',
    },

    // eslint-disable-next-line sort-keys
    'code[class*="language-"]::-moz-selection': {
      background: '#363636',
    },

    'pre[class*="language-"]::-moz-selection': {
      background: '#363636',
    },

    // eslint-disable-next-line sort-keys
    'code[class*="language-"] ::-moz-selection': {
      background: '#363636',
    },

    'pre[class*="language-"] ::-moz-selection': {
      background: '#363636',
    },

    // eslint-disable-next-line sort-keys
    'code[class*="language-"]::selection': {
      background: '#363636',
    },

    'pre[class*="language-"]::selection': {
      background: '#363636',
    },

    // eslint-disable-next-line sort-keys
    'code[class*="language-"] ::selection': {
      background: '#363636',
    },

    'pre[class*="language-"] ::selection': {
      background: '#363636',
    },

    // eslint-disable-next-line sort-keys
    ':not(pre) > code[class*="language-"]': {
      borderRadius: '0.2em',
      padding: '0.1em',
      whiteSpace: 'normal',
    },

    // eslint-disable-next-line sort-keys
    '.language-css > code': {
      color: '#fd9170',
    },

    '.language-sass > code': {
      color: '#fd9170',
    },

    '.language-scss > code': {
      color: '#fd9170',
    },

    '[class*="language-"] .namespace': {
      opacity: '0.7',
    },

    atrule: {
      color: '#c792ea',
    },

    'attr-name': {
      color: '#ffcb6b',
    },

    'attr-value': {
      color: '#a5e844',
    },

    attribute: {
      color: '#a5e844',
    },

    boolean: {
      color: '#c792ea',
    },

    builtin: {
      color: '#ffcb6b',
    },

    cdata: {
      color: '#80cbc4',
    },

    char: {
      color: '#80cbc4',
    },

    class: {
      color: '#ffcb6b',
    },

    'class-name': {
      color: '#f2ff00',
    },

    comment: {
      color: '#616161',
    },

    constant: {
      color: '#c792ea',
    },

    deleted: {
      color: '#ff6666',
    },

    doctype: {
      color: '#616161',
    },

    entity: {
      color: '#ff6666',
    },

    function: {
      color: '#c792ea',
    },

    hexcode: {
      color: '#f2ff00',
    },

    id: {
      color: '#c792ea',
      fontWeight: 'bold',
    },

    important: {
      color: '#c792ea',
      fontWeight: 'bold',
    },

    inserted: {
      color: '#80cbc4',
    },

    keyword: {
      color: '#c792ea',
    },

    number: {
      color: '#fd9170',
    },

    operator: {
      color: '#89ddff',
    },

    prolog: {
      color: '#616161',
    },

    property: {
      color: '#80cbc4',
    },

    'pseudo-class': {
      color: '#a5e844',
    },

    'pseudo-element': {
      color: '#a5e844',
    },

    punctuation: {
      color: '#89ddff',
    },

    regex: {
      color: '#f2ff00',
    },

    selector: {
      color: '#ff6666',
    },

    string: {
      color: '#a5e844',
    },

    symbol: {
      color: '#c792ea',
    },

    tag: {
      color: '#ff6666',
    },

    unit: {
      color: '#fd9170',
    },

    url: {
      color: '#ff6666',
    },

    variable: {
      color: '#ff6666',
    },
  };
};
