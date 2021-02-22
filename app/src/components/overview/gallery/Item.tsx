import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';
import { useHistory } from 'react-router-dom';

interface IItemProps {
  body: string;
  link: string;
  title: string;
}

// Item is used to render an item in the overview page. It requires a title, body and a link. When the card is clicked,
// the user is redirected to the provided link.
const Item: React.FunctionComponent<IItemProps> = ({ body, link, title }: IItemProps) => {
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
