import { MUIEditor } from '@kobsio/core';
import { InputBaseComponentProps } from '@mui/material';
import { forwardRef } from 'react';

/**
 * The `Editor` component is a wrapper around our `MUIEditor` component, which allows us to use the editor within a
 * `TextField` component of MUI.
 */
const Editor = forwardRef<HTMLInputElement, InputBaseComponentProps>(function Editor(props, ref) {
  const { loadCompletionItems, callSubmit, value, onChange } = props;

  const handleOnChange = (value: string | undefined) => {
    if (onChange) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onChange({ target: { value: value ?? '' } });
    }
  };

  return (
    <MUIEditor
      value={value}
      onChange={handleOnChange}
      language="mongodb"
      loadCompletionItems={loadCompletionItems}
      callSubmit={callSubmit}
    />
  );
});

export default Editor;
