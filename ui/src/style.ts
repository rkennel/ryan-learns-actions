/********************
* COLORS
********************/
import {Breakpoint, useMediaQuery, useTheme} from "@mui/material";

export const COLOR_BLANK_SPACE="#6A645C";
export const COLOR_MAIN_BG="#FFFFFF";
export const COLOR_MAIN_TEXT="#000000";

export const COLOR_APP_BAR_BG="#000000";
export const COLOR_APP_BAR_TEXT="#FFFFFF";

export const COLOR_PRIMARY="#0375B4"; //EABE27
export const COLOR_SECONDARY="#EABE27";//0375B4
export const COLOR_TERTIARY="#007849";//007849
export const COLOR_QUATERNARY="#262228";//262228
export const COLOR_QUINARY="#d1e8e2"; //d1e8e2

export const COLOR_ARRAY:string[] = [COLOR_PRIMARY,COLOR_SECONDARY,COLOR_TERTIARY,COLOR_QUATERNARY,COLOR_QUINARY];


/********************
 * DIMENSIONS
 ********************/
export const WIDTH_MAX=1800

/********************
 * SCREEN SIZE
 ********************/
export interface ScreenSize {
    abbreviation:string,
    minWidth:number,
}

export const SCREEN_SIZE_EXTRA_SMALL:ScreenSize = {
    abbreviation:'xs',
    minWidth:0,
}
export const SCREEN_SIZE_SMALL:ScreenSize = {
    abbreviation:'s',
    minWidth:400,
}
export const SCREEN_SIZE_MEDIUM:ScreenSize = {
    abbreviation:'md',
    minWidth:800,
}
export const SCREEN_SIZE_LARGE:ScreenSize = {
    abbreviation:'lg',
    minWidth:1200,
}
export const SCREEN_SIZE_EXTRA_LARGE:ScreenSize = {
    abbreviation:'xl',
    minWidth:1600,
}

export function useScreenSizeDetector(): ScreenSize {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only(SCREEN_SIZE_EXTRA_SMALL.abbreviation as Breakpoint));
    const isSm = useMediaQuery(theme.breakpoints.only(SCREEN_SIZE_SMALL.abbreviation as Breakpoint));
    const isMd = useMediaQuery(theme.breakpoints.only(SCREEN_SIZE_MEDIUM.abbreviation as Breakpoint));
    const isLg = useMediaQuery(theme.breakpoints.only(SCREEN_SIZE_LARGE.abbreviation as Breakpoint));
    const isXl = useMediaQuery(theme.breakpoints.only(SCREEN_SIZE_EXTRA_LARGE.abbreviation as Breakpoint));

    if (isXs) {
        return SCREEN_SIZE_EXTRA_SMALL;
    } else if (isSm) {
        return SCREEN_SIZE_SMALL;
    } else if (isMd) {
        return SCREEN_SIZE_MEDIUM;
    } else if (isLg) {
        return SCREEN_SIZE_LARGE;
    } else if (isXl) {
        return SCREEN_SIZE_EXTRA_LARGE;
    } else {
        return SCREEN_SIZE_EXTRA_LARGE;
    }
}