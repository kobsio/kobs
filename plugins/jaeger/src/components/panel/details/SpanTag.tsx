import React, { useState } from 'react';
import { Tooltip } from '@patternfly/react-core';

import { IKeyValue } from '../../../utils/interfaces';

interface ISpanTagProps {
  tag: IKeyValue;
}

const SpanTag: React.FunctionComponent<ISpanTagProps> = ({ tag }: ISpanTagProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  const copy = (): void => {
    if (navigator.clipboard) {
      setVisible(true);

      navigator.clipboard.writeText(`${tag.key}=${tag.value}`);

      setTimeout(() => {
        setVisible(false);
      }, 1500);
    }
  };

  return (
    <Tooltip content={<div>copied</div>} isVisible={visible} trigger="manual">
      <div className="pf-c-chip pf-u-ml-sm pf-u-mb-sm" style={{ cursor: 'pointer', maxWidth: '100%' }} onClick={copy}>
        <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
          {tag.key}: {tag.value}
        </span>
      </div>
    </Tooltip>
  );
};

export default SpanTag;
