import { EmptyState, EmptyStateIcon, Spinner, Title } from '@patternfly/react-core';
import React from 'react';

interface IEmptyStateSpinnerProps {
  title?: string;
}

// EmptyStateSpinner is a component, which can be used to show an empty state with a spinner. The propose of this
// component is to show that the data isn't ready yet and must be fetched from the gRPC API. The component takes an
// optional title, which will be shown below the spinner.
const EmptyStateSpinner: React.FunctionComponent<IEmptyStateSpinnerProps> = ({ title }: IEmptyStateSpinnerProps) => {
  return (
    <EmptyState>
      <EmptyStateIcon variant="container" component={Spinner} />
      {title ? (
        <Title size="md" headingLevel="h6">
          {title}
        </Title>
      ) : null}
    </EmptyState>
  );
};

export default EmptyStateSpinner;
