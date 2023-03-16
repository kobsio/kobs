import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { FunctionComponent, ReactNode } from 'react';

interface IDescriptionListProps {
  children: ReactNode;
}

/**
 * The `DescriptionList` can be used to render description list. This component should be used together with the other
 * description list components as follows:
 * ```
 * <DescriptionList>
 *   <DescriptionListGroup>
 *     <DescriptionListTerm>Term 1</DescriptionListTerm>
 *     <DescriptionListDescription>Description 1</DescriptionListDescription>
 *   </DescriptionListGroup>
 *   <DescriptionListGroup>
 *     <DescriptionListTerm>Term 2</DescriptionListTerm>
 *     <DescriptionListDescription>Description 2</DescriptionListDescription>
 *   </DescriptionListGroup>
 * </DescriptionList>
 * ```
 */
export const DescriptionList: FunctionComponent<IDescriptionListProps> = ({ children }) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );
};

interface IDescriptionListGroupProps {
  children: ReactNode;
}

/**
 * The `DescriptionListGroup` is used to render a single term and desription in a `DescriptionList`.
 */
export const DescriptionListGroup: FunctionComponent<IDescriptionListGroupProps> = ({ children }) => {
  return <TableRow sx={{ 'td, th': { border: 0 } }}>{children}</TableRow>;
};

interface IDescriptionListItemProps {
  children: ReactNode;
}

/**
 * The `DescriptionListItem` is used to render a item instead of a term and description in a `DescriptionListGroup`.
 *
 * This is possible because we are using a table to implement the description list, so that we can render one cell with
 * a col span of 2 instead of two cells (one for the term and one for the description).
 */
export const DescriptionListItem: FunctionComponent<IDescriptionListItemProps> = ({ children }) => {
  return <TableCell colSpan={2}>{children}</TableCell>;
};

interface IDescriptionListTermProps {
  children: ReactNode;
}

/**
 * The `DescriptionListTerm` is used to render a term in a `DescriptionListGroup`.
 */
export const DescriptionListTerm: FunctionComponent<IDescriptionListTermProps> = ({ children }) => {
  return (
    <TableCell sx={{ verticalAlign: 'top' }}>
      <Typography component="div" variant="body1" noWrap={true}>
        <b>{children}</b>
      </Typography>
    </TableCell>
  );
};

interface IDescriptionListDescriptionProps {
  children: ReactNode;
  direction?: 'row' | 'column';
}

/**
 * The `DescriptionListDescription` is used to render a description in a `DescriptionListGroup`.
 *
 * All provided `children` will be wrapped in a flex box layout, with the provided `direction`.
 */
export const DescriptionListDescription: FunctionComponent<IDescriptionListDescriptionProps> = ({
  direction = 'row',
  children,
}) => {
  return (
    <TableCell sx={{ verticalAlign: 'top' }}>
      <Typography component="div" variant="body2">
        <Box sx={{ display: 'flex', flexDirection: direction, flexWrap: 'wrap', gap: 2 }}>{children}</Box>
      </Typography>
    </TableCell>
  );
};
