import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';

interface IPageListProps {
  title: string;
  children: React.ReactNode;
}

const PageList: React.FunctionComponent<IPageListProps> = ({ title, children }: IPageListProps) => {
  return (
    <Card isCompact={true}>
      <CardTitle>{title}</CardTitle>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

export default PageList;
