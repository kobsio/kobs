import React, { useEffect, useRef } from 'react';
import { highlightBlock, registerLanguage } from 'highlight.js';
import yaml from 'highlight.js/lib/languages/yaml';

import 'highlight.js/styles/nord.css';

registerLanguage('yaml', yaml);

interface ICodeProps {
  yaml: string;
}

const Yaml: React.FunctionComponent<ICodeProps> = ({ yaml }: ICodeProps) => {
  const code = useRef<HTMLElement>(null);

  useEffect(() => {
    if (code.current) {
      highlightBlock(code.current);
    }
  });

  return (
    <pre className="pf-u-pt-md pf-u-pb-md kobs-code">
      <code ref={code}>{yaml}</code>
    </pre>
  );
};

export default Yaml;
