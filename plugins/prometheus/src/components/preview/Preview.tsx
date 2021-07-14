import { Alert, AlertVariant } from '@patternfly/react-core';
import React, { memo } from 'react';

import { IPanelOptions } from '../../utils/interfaces';
import { IPluginPreviewProps } from '@kobsio/plugin-core';
import Sparkline from './Sparkline';

interface IPanelProps extends IPluginPreviewProps {
  options?: IPanelOptions;
}

export const Preview: React.FunctionComponent<IPanelProps> = ({ name, title, times, options }: IPanelProps) => {
  if (!options) {
    return <Alert variant={AlertVariant.danger} isInline={true} title="Invalid preview configuration." />;
  }

  return <Sparkline name={name} times={times} title={title} options={options} />;
};

export default memo(Preview, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
