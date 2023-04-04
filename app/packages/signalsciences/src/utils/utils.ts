import { autocompletion, completeFromList } from '@codemirror/autocomplete';

export const description =
  'The leading hybrid and multi-cloud platform that provides next-gen WAF, API Security, RASP, Advanced Rate Limiting, Bot Protection, and DDoS purpose built to eliminate the challenges of legacy WAF.';

export const getFlag = (countryCode?: string): string => {
  if (!countryCode) return '';

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const codemirrorExtension = () => {
  return autocompletion({
    override: [
      completeFromList([
        { label: 'agent', type: 'keyword' },
        { label: 'agentcode', type: 'keyword' },
        { label: 'bytesout', type: 'keyword' },
        { label: 'country', type: 'keyword' },
        { label: 'from', type: 'keyword' },
        { label: 'httpcode', type: 'keyword' },
        { label: 'ip', type: 'keyword' },
        { label: 'method', type: 'keyword' },
        { label: 'path', type: 'keyword' },
        { label: 'payload', type: 'keyword' },
        { label: 'protocol', type: 'keyword' },
        { label: 'ratelimited', type: 'keyword' },
        { label: 'responsemillis', type: 'keyword' },
        { label: 'remotehost', type: 'keyword' },
        { label: 'server', type: 'keyword' },
        { label: 'tag', type: 'keyword' },
        { label: 'target', type: 'keyword' },
        { label: 'sort', type: 'keyword' },
        { label: 'until', type: 'keyword' },
        { label: 'useragent', type: 'keyword' },

        { info: 'equals', label: ':=', type: 'keyword' },
        { info: '(not equals)', label: '!=', type: 'keyword' },
        { info: '(greater-than, integers only)', label: ':>', type: 'keyword' },
        { info: '(equals or greater-than, integers only)', label: ':>=', type: 'keyword' },
        { info: '(less-than, integers only)', label: ':<', type: 'keyword' },
        { info: '(equals or less-than, integers only)', label: ':<=', type: 'keyword' },
        { info: '(search on the field with the terms provided)', label: ':~', type: 'keyword' },
      ]),
    ],
  });
};
