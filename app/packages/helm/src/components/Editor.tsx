import { Editor as CoreEditor } from '@kobsio/core';
import { FunctionComponent } from 'react';

const Editor: FunctionComponent<{ value: string }> = ({ value }) => {
  return <CoreEditor language="yaml" readOnly={true} value={value} />;
};

export default Editor;
