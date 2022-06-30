import { FlexItem } from '@patternfly/react-core';
import React from 'react';

interface IToolbarItemProps {
  alignRight?: boolean;
  width?: string;
  isLabel?: boolean;
  grow?: boolean;
  children: React.ReactNode | React.ReactNode[];
}

export const ToolbarItem: React.FunctionComponent<IToolbarItemProps> = ({
  alignRight,
  width,
  isLabel,
  grow,
  children,
}: IToolbarItemProps) => {
  return (
    <FlexItem
      className="pf-u-pt-md pf-u-min-width"
      // eslint-disable-next-line @typescript-eslint/naming-convention
      style={{ '--pf-u-max-width--MaxWidth-on-lg': width, '--pf-u-min-width--MinWidth': width } as React.CSSProperties}
      align={alignRight ? { lg: 'alignRight' } : { lg: 'alignLeft' }}
      alignSelf={{ lg: 'alignSelfCenter' }}
      grow={{ default: grow ? 'grow' : undefined }}
    >
      {isLabel ? <div className="pf-u-font-weight-bold">{children}</div> : children}
    </FlexItem>
  );
};
