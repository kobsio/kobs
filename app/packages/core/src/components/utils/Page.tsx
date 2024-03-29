import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import { FunctionComponent, ReactNode } from 'react';
import { Helmet } from 'react-helmet';

interface IPageProps {
  actions?: ReactNode;
  children?: ReactNode;
  description?: string | ReactNode;
  hasTabs?: boolean;
  subtitle?: string;
  title: string;
  toolbar?: ReactNode;
}

/**
 * The `Page` is used to enforce a unique layout for each page in the app. The header of a page must contain a `title`.
 * The `description`, `actions` and `toolbar` for the page header is optional and not required. When the `hasTabs`
 * property is set to true we do not render the diver between the page header and content (`children`), instead the we
 * have to take care that the tabs are rendered within the content and that they contain a divider.
 */
export const Page: FunctionComponent<IPageProps> = ({
  actions,
  children,
  description,
  hasTabs,
  subtitle,
  title,
  toolbar,
}) => {
  return (
    <Stack minHeight="100%" minWidth="100%">
      <Grid justifyContent="space-between" container={true} spacing={6}>
        <Grid item={true} xs={12} sm={actions ? 8 : 12}>
          <Typography variant="h3" gutterBottom={true}>
            <Helmet titleTemplate="kobs - %s" defaultTitle="kobs">
              <title>{subtitle ? `${title} - ${subtitle}` : title}</title>
            </Helmet>

            {title}
            {subtitle && (
              <Typography pl={2} color="text.secondary" variant="caption">
                {subtitle}
              </Typography>
            )}
          </Typography>
          {description && <Typography variant="subtitle1">{description}</Typography>}
        </Grid>

        {actions && (
          <Grid item={true} xs={12} sm={4} sx={{ textAlign: 'right' }}>
            {actions}
          </Grid>
        )}

        {toolbar && (
          <Grid item={true} xs={12}>
            {toolbar}
          </Grid>
        )}
      </Grid>

      {!hasTabs ? (
        <Box minWidth="100%" py={6}>
          <Divider role="divider" />
        </Box>
      ) : (
        <Box minWidth="100%" py={3}></Box>
      )}

      <>{children}</>
    </Stack>
  );
};
