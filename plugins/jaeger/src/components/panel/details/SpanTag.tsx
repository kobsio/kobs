import React from 'react';

import { IKeyValue } from '../../../utils/interfaces';

interface ISpanTagProps {
  tag: IKeyValue;
}

const SpanTag: React.FunctionComponent<ISpanTagProps> = ({ tag }: ISpanTagProps) => {
  return (
    <div className="pf-c-chip pf-u-ml-sm pf-u-mb-sm" style={{ maxWidth: '100%' }}>
      <span className="pf-c-chip__text" style={{ maxWidth: '100%' }}>
        {tag.key}: {tag.value}
      </span>
    </div>
  );
};

export default SpanTag;
