import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

import LinkWrapper from 'components/LinkWrapper';

// IHomeItemProps is the interface for an item on the home page. Each item contains a title, body, link and icon.
interface IHomeItemProps {
  body: string;
  link: string;
  title: string;
  icon: string;
}

// HomeItem is used to render an item in the home page. It requires a title, body, link and icon. When the card is
// clicked, the user is redirected to the provided link.
const HomeItem: React.FunctionComponent<IHomeItemProps> = ({ body, link, title, icon }: IHomeItemProps) => {
  return (
    <LinkWrapper link={link}>
      <Card style={{ cursor: 'pointer' }} isHoverable={true}>
        <CardHeader>
          <img src={icon} alt={title} width="27px" style={{ marginRight: '5px' }} />
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardBody>{body}</CardBody>
      </Card>
    </LinkWrapper>
  );
};

export default HomeItem;
