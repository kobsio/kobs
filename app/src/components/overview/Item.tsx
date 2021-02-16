import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';
import { useHistory } from 'react-router-dom';

interface ItemProps {
  body: string;
  link: string;
  title: string;
}

const Item: React.FunctionComponent<ItemProps> = ({ body, link, title }: ItemProps) => {
  const history = useHistory();

  const handleClick = (): void => {
    history.push(link);
  };

  return (
    <Card className="kobs-home-item" isHoverable={true} onClick={handleClick}>
      <CardTitle>{title}</CardTitle>
      <CardBody>{body}</CardBody>
    </Card>
  );
};

export default Item;
