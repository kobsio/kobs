import { MUIEditor } from '@kobsio/core';
import { InputBaseComponentProps } from '@mui/material';
import { forwardRef } from 'react';

/**
 * The `InternalEditor` component is a wrapper around our `MUIEditor` component, which allows us to use the editor
 * within a `TextField` component of MUI.
 */
const InternalEditor = forwardRef<HTMLInputElement, InputBaseComponentProps>(function InternalEditor(props, ref) {
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
      language="klogs"
      loadCompletionItems={loadCompletionItems}
      callSubmit={callSubmit}
    />
  );
});

export default InternalEditor;
