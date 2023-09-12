import {AppBar, IconButton, Toolbar} from "@mui/material";
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import "./index.css"
import * as style from "./style";
import {SCREEN_SIZE_EXTRA_SMALL, SCREEN_SIZE_SMALL, useScreenSizeDetector} from "./style";

export default function BigWigAppBar() {

    const screenSize = useScreenSizeDetector();

    let boxPadding: string, iconFontSize: string, titleFontSize: string, logoSize: string;

    if (screenSize.abbreviation === SCREEN_SIZE_EXTRA_SMALL.abbreviation || screenSize.abbreviation === SCREEN_SIZE_SMALL.abbreviation) {
        boxPadding = "0.5rem";
        iconFontSize = "2rem";
        titleFontSize = "2rem";
        logoSize = "3rem";
    } else {
        boxPadding = "1rem";
        iconFontSize = "2rem";
        titleFontSize = "3rem";
        logoSize = "4rem";
    }


    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="fixed" sx={{
                backgroundColor: style.COLOR_APP_BAR_BG
            }}>
                <Toolbar disableGutters={true} sx={{
                    backgroundColor: style.COLOR_APP_BAR_BG,
                    width: '100%',
                    maxWidth: style.WIDTH_MAX,
                    margin: '0 auto', // Center the Toolbar horizontally
                    justifyContent: 'center', // Center the Toolbar vertically
                }}>
                    <Box sx={{
                        pl: boxPadding,
                        pr: boxPadding,
                    }}>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                        >
                            <MenuIcon sx={{fontSize: iconFontSize}}/>
                        </IconButton>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        pt: "0.25rem",
                        pb: "0.25rem",
                        pl: "2rem",
                    }}>
                        <img src={"/bigwig.svg"} alt="BigWig Logo" style={{
                            width: logoSize,
                            height: logoSize,
                            backgroundColor: "#ffffff",
                        }}/>
                    </Box>
                    <Box sx={{
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        pl: boxPadding,
                        pr: boxPadding,
                        fontFamily: 'Catamaran, sans-serif',
                        fontWeight: 900,
                        fontSize: titleFontSize,
                    }}>BigWig</Box>
                    <Box sx={{
                        padding: boxPadding,
                    }}>
                        <IconButton
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            color="inherit"
                            sx={{
                                padding: 0,
                            }}
                        >
                            <SettingsIcon sx={{fontSize: iconFontSize}}/>
                        </IconButton>
                    </Box>
                    <Box sx={{
                        pr: boxPadding,
                    }}>
                        <IconButton
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            color="inherit"
                            sx={{
                                padding: 0,
                            }}
                        >
                            <AccountCircleIcon sx={{fontSize: iconFontSize}}/>
                        </IconButton>
                    </Box>

                </Toolbar>
            </AppBar>
        </Box>
    );
}