import { useTheme, useMediaQuery, Breakpoint } from '@mui/material';

/**
 * `useIsWidthUp` is a helper function to check if the current screen width is larger the then the one defined in the
 * provided `breakpoint`.
 */
const useIsWidthUp = (breakpoint: Breakpoint): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
};

export default useIsWidthUp;
