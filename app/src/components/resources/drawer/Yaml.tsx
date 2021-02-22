import React, { useEffect, useRef } from 'react';
import { highlightBlock, registerLanguage } from 'highlight.js';
import yaml from 'highlight.js/lib/languages/yaml';

import 'highlight.js/styles/nord.css';

registerLanguage('yaml', yaml);

interface IYamlProps {
  yaml: string;
}

// Yaml is the component to display the yaml manifest for a resource. For code highlighting we are using
// https://highlightjs.org, so that we have to register the yaml language first and we also have to import a theme. At
// the moment we are using Nord theme (https://www.nordtheme.com) provided by highlight.js, because it's my favorite
// editor theme. Maybe we can provide an option in the future, so that a user can select his own theme.
const Yaml: React.FunctionComponent<IYamlProps> = ({ yaml }: IYamlProps) => {
  const code = useRef<HTMLElement>(null);

  useEffect(() => {
    if (code.current) {
      highlightBlock(code.current);
    }
  });

  return (
    <pre className="pf-u-pb-md">
      <code ref={code}>{yaml}</code>
    </pre>
  );
};

export default Yaml;
