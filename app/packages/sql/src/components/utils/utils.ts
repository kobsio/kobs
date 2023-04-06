import { SQLDialect } from '@codemirror/lang-sql';

import { ClickhouseKeywords, ClickhouseTypes } from './clickhouse';

/**
 * Clickhouse Dialect for autocompletion and highlighting
 */
export const Clickhouse = SQLDialect.define({
  charSetCasts: true,
  doubleDollarQuotedStrings: true,
  keywords: ClickhouseKeywords.join(' '),
  operatorChars: '+-*/<>=~!@#%^&|`?',
  specialVar: '',
  types: ClickhouseTypes.filter((keyword) => !keyword.includes(' ')).join(' '),
});
