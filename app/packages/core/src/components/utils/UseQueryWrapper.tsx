import { Alert, AlertTitle, Box, Button, CircularProgress } from '@mui/material';
import { QueryObserverResult } from '@tanstack/react-query';
import { ReactNode, FunctionComponent } from 'react';

import { APIError } from '../../context/APIContext';

/**
 * `IUseQueryWrapperProps` is the interface for the `UseQueryWrapper` component. It defines all the values returned by a
 * `useQuery` as well as some properties to show a message when no data was retrieved.
 */
interface IUseQueryWrapperProps {
  children: ReactNode;
  error?: APIError | null;
  errorTitle: string;
  isError: boolean;
  isLoading: boolean;
  isNoData: boolean;
  noDataActions?: ReactNode;
  noDataMessage?: string;
  noDataTitle?: string;
  refetch?: () => Promise<QueryObserverResult<unknown, APIError>>;
}

/**
 * The `UseQueryWrapper` component can be used to render the result of a `useQuery`. The component will render a loading
 * spinner when the `isLoading` property is `true`. When the `isError` property is `true` it will render an alert with
 * the provided `errorTile` and `error`. When the `isNoData` property is `true` it will also render an alert but with
 * the info serverity. When none of these conditions is true it will render the provided `children`.
 */
export const UseQueryWrapper: FunctionComponent<IUseQueryWrapperProps> = ({
  children,
  errorTitle,
  error,
  isNoData,
  isError,
  isLoading,
  noDataActions,
  noDataMessage,
  noDataTitle,
  refetch,
}) => {
  if (isLoading) {
    return (
      <Box minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
          <CircularProgress role="loading-indicator" />
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          refetch && (
            <Button color="inherit" size="small" onClick={() => refetch()}>
              RETRY
            </Button>
          )
        }
      >
        <AlertTitle>{errorTitle}</AlertTitle>
        {error?.message ?? ''}
      </Alert>
    );
  }

  if (isNoData) {
    return (
      <Alert severity="info" action={noDataActions}>
        <AlertTitle>{noDataTitle}</AlertTitle>
        {noDataMessage}
      </Alert>
    );
  }

  return <>{children}</>;
};
