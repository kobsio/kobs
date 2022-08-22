import { IOptions } from './interfaces';
import { getTimeParams } from '@kobsio/shared';

export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const jql = params.get('jql');
  const page = params.get('page');
  const perPage = params.get('perPage');

  return {
    jql: jql || '',
    page: page ? parseInt(page) : 1,
    perPage: perPage ? parseInt(perPage) : 50,
    times: getTimeParams(params, isInitial),
  };
};

export const getStatusColor = (name?: string): 'blue' | 'green' | 'grey' => {
  if (name === 'Done') {
    return 'green';
  }

  if (name === 'In Progress') {
    return 'blue';
  }

  return 'grey';
};

// The jiraToMarkdown and markdownToJira functions are used to convert the provided description for an issue into
// markdown, so that we can render it using react markdown. For that we are using a modified version of the functions
// provided by https://github.com/kylefarris/J2M
export const jiraToMarkdown = (str: string): string => {
  return str
    .replace(/^[ \t]*(\*+)\s+/gm, (match, stars) => {
      return Array(stars.length).join('  ') + '* ';
    })
    .replace(/^[ \t]*(#+)\s+/gm, (match, nums) => {
      return Array(nums.length).join('  ') + '1. ';
    })
    .replace(/^h([0-6])\.(.*)$/gm, (match, level, content) => {
      return Array(parseInt(level) + 1).join('#') + content;
    })
    .replace(/\*(\S.*)\*/g, '**$1**')
    .replace(/_(\S.*)_/g, '*$1*')
    .replace(/\{\{([^}]+)\}\}/g, '`$1`')
    .replace(/\+([^+]*)\+/g, '<ins>$1</ins>')
    .replace(/\^([^^]*)\^/g, '<sup>$1</sup>')
    .replace(/~([^~]*)~/g, '<sub>$1</sub>')
    .replace(/(\s+)-(\S+.*?\S)-(\s+)/g, '$1~~$2~~$3')
    .replace(
      /\{code(:([a-z]+))?([:|]?(title|borderStyle|borderColor|borderWidth|bgColor|titleBGColor)=.+?)*\}([^]*?)\n?\{code\}/gm,
      '```$2$5\n```',
    )
    .replace(/{noformat}/g, '```')
    .replace(/\[([^|]+?)\]/g, '<$1>')
    .replace(/!(.+)!/g, '![]($1)')
    .replace(/\[(.+?)\|(.+?)\]/g, '[$1]($2)')
    .replace(/^bq\.\s+/gm, '> ')
    .replace(/\{color:[^}]+\}([^]*)\{color\}/gm, '$1')
    .replace(/\{panel:title=([^}]*)\}\n?([^]*?)\n?\{panel\}/gm, '\n| $1 |\n| --- |\n| $2 |')
    .replace(/^[ \t]*((?:\|\|.*?)+\|\|)[ \t]*$/gm, (match, headers) => {
      const singleBarred = headers.replace(/\|\|/g, '|');
      return '\n' + singleBarred + '\n' + singleBarred.replace(/\|[^|]+/g, '| --- ');
    })
    .replace(/^[ \t]*\|/gm, '|');
};

export const markdownToJira = (str: string): string => {
  const map: Record<string, string> = {
    del: '-',
    ins: '+',
    sub: '~',
    sup: '^',
  };

  return str
    .replace(
      /^\n((?:\|.*?)+\|)[ \t]*\n((?:\|\s*?-{3,}\s*?)+\|)[ \t]*\n((?:(?:\|.*?)+\|[ \t]*\n)*)$/gm,
      (match, headerLine, separatorLine, rowstr) => {
        const headers = headerLine.match(/[^|]+(?=\|)/g);
        const separators = separatorLine.match(/[^|]+(?=\|)/g);
        if (headers.length !== separators.length) {
          return match;
        }
        const rows = rowstr.split('\n');
        if (rows.length === 1 + 1 && headers.length === 1) {
          return (
            '{panel:title=' + headers[0].trim() + '}\n' + rowstr.replace(/^\|(.*)[ \t]*\|/, '$1').trim() + '\n{panel}\n'
          );
        } else {
          return '||' + headers.join('||') + '||\n' + rowstr;
        }
      },
    )
    .replace(/([*_]+)(\S.*?)\1/g, (match, wrapper, content) => {
      switch (wrapper.length) {
        case 1:
          return '_' + content + '_';
        case 2:
          return '*' + content + '*';
        case 3:
          return '_*' + content + '*_';
        default:
          return wrapper + content * wrapper;
      }
    })
    .replace(/^([#]+)(.*?)$/gm, (match, level, content) => {
      return 'h' + level.length + '.' + content;
    })
    .replace(/^(.*?)\n([=-]+)$/gm, (match, content, level) => {
      return 'h' + (level[0] === '=' ? 1 : 2) + '. ' + content;
    })
    .replace(/^([ \t]*)\d+\.\s+/gm, (match, spaces) => {
      return Array(Math.floor(spaces.length / 2 + 1)).join('#') + '# ';
    })
    .replace(/^([ \t]*)\*\s+/gm, (match, spaces) => {
      return Array(Math.floor(spaces.length / 2 + 1)).join('*') + '* ';
    })
    .replace(new RegExp('<(' + Object.keys(map).join('|') + ')>(.*?)</\\1>', 'g'), (match, from, content) => {
      const to = map[from];
      return to + content + to;
    })
    .replace(/(\s+)~~(.*?)~~(\s+)/g, '$1-$2-$3')
    .replace(/```(.+\n)?((?:.|\n)*?)```/g, (match, synt, content) => {
      let code = '{code}';
      if (synt) {
        code = '{code:' + synt.replace(/\n/g, '') + '}\n';
      }
      return code + content + '{code}';
    })
    .replace(/`([^`]+)`/g, '{{$1}}')
    .replace(/!\[[^\]]*\]\(([^)]+)\)/g, '!$1!')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]')
    .replace(/<([^>]+)>/g, '[$1]')
    .replace(/^>/gm, 'bq.');
};
