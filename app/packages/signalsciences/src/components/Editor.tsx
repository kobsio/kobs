import { MUIEditor } from '@kobsio/core';
import { InputBaseComponentProps } from '@mui/material';
import { forwardRef } from 'react';

const Editor = forwardRef<HTMLInputElement, InputBaseComponentProps>(function Editor(props, ref) {
  const { callSubmit, value, onChange } = props;

  const handleOnChange = (value: string | undefined) => {
    if (onChange) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onChange({ target: { value: value ?? '' } });
    }
  };

  return <MUIEditor value={value} onChange={handleOnChange} language="signalsciences" callSubmit={callSubmit} />;
});

export default Editor;
