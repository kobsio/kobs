import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';
import { useHistory } from 'react-router-dom';

// ILogos is the interface for the datasource logos.
interface ILogos {
  [key: string]: string;
}

// logos is an object, with the datasource types as key and the image path for that datasource as logo.
const logos: ILogos = {
  elasticsearch: '/img/datasources/elasticsearch.png',
  prometheus: '/img/datasources/prometheus.png',
};

interface IItemProps {
  name: string;
  type: string;
  link: string;
}

// Item is a single datasource for the gallery in the datasources page. The datasource is presented inside a Card
// component. The card contains the configured name of the datasource, a link to the corresponding datasource page and
// the brand icon for the datasource.
const Item: React.FunctionComponent<IItemProps> = ({ name, type, link }: IItemProps) => {
  const history = useHistory();

  const handleClick = (): void => {
    history.push(link);
  };

  return (
    <Card className="kobs-home-item" isHoverable={true} onClick={handleClick}>
      <CardTitle>{name}</CardTitle>
      <CardBody>
        <img src={logos[type]} alt={type} />
      </CardBody>
    </Card>
  );
};

export default Item;
