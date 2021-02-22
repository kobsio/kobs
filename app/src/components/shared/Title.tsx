import React from 'react';

type TTitleSize = 'lg' | 'xl';

interface ITitleProps {
  title: string;
  subtitle: string;
  size: TTitleSize;
}

// Title is our custom title component, in addition to the Patternfly Title component it also supports a subtitle. This
// is mostly used to display the namespace and cluster besides the name of a resource in the title.
const Title: React.FunctionComponent<ITitleProps> = ({ title, subtitle, size }: ITitleProps) => {
  return (
    <span>
      <span className={`pf-c-title pf-m-${size}`}>{title}</span>
      <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-200">{subtitle}</span>
    </span>
  );
};

export default Title;
