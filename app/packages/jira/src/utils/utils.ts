export const description = 'The #1 software development tool used by agile teams.';

export const example = `plugin:
  name: jira
  type: jira
  options:
    jql: sprint in openSprints() and assignee = currentUser()`;

export const getStatusColor = (name?: string): 'info' | 'success' | 'default' => {
  if (name === 'Done') {
    return 'success';
  }

  if (name === 'In Progress') {
    return 'info';
  }

  return 'default';
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
