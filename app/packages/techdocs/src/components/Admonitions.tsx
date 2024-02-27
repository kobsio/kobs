import { Alert, AlertColor, AlertTitle, Collapse } from '@mui/material';
import { FunctionComponent, ReactNode, useState } from 'react';

export const Admonitions: FunctionComponent<{
  children: ReactNode;
  collapse: boolean;
  severity: AlertColor;
  title: string;
}> = ({ title, severity, collapse, children }) => {
  const [open, setOpen] = useState<boolean>(collapse ? false : true);

  return (
    <Alert sx={{ '.MuiAlert-message': { width: '100%' } }} severity={severity}>
      <AlertTitle
        sx={{ cursor: collapse ? 'pointer' : 'inherit' }}
        onClick={collapse ? () => setOpen(!open) : undefined}
      >
        {title === 'success'
          ? 'Success'
          : title === 'info'
            ? 'Info'
            : title === 'warning'
              ? 'Warning'
              : title === 'error'
                ? 'Error'
                : title}
      </AlertTitle>
      <Collapse in={open} timeout="auto" unmountOnExit={true}>
        {children}
      </Collapse>
    </Alert>
  );
};
