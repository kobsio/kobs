import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';
import { useHistory } from 'react-router-dom';

// IHomeItemProps is the interface for an item on the home page. Each item contains a title, body and a link.
interface IHomeItemProps {
  body: string;
  link: string;
  title: string;
}

// HomeItem is used to render an item in the home page. It requires a title, body and a link. When the card is  clicked,
// the user is redirected to the provided link.
const HomeItem: React.FunctionComponent<IHomeItemProps> = ({ body, link, title }: IHomeItemProps) => {
  const history = useHistory();

  const handleClick = (): void => {
    history.push(link);
  };

  return (
    <Card style={{ cursor: 'pointer' }} isHoverable={true} onClick={handleClick}>
      <CardTitle>{title}</CardTitle>
      <CardBody>{body}</CardBody>
    </Card>
  );
};

export default HomeItem;
