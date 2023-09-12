import {useEffect, useState} from 'react';
import TeamGrid from "./team-management/TeamGrid";
import {createTheme, ThemeProvider} from "@mui/material";
import {getOrganizations, Organization} from "./team-management/Organization";
import BigWigAppBar from "./BigWigAppBar";
import {
    COLOR_PRIMARY, COLOR_SECONDARY,
    SCREEN_SIZE_EXTRA_LARGE,
    SCREEN_SIZE_EXTRA_SMALL,
    SCREEN_SIZE_LARGE,
    SCREEN_SIZE_MEDIUM,
    SCREEN_SIZE_SMALL, useScreenSizeDetector
} from "./style";
import Box from "@mui/material/Box";

const theme = createTheme({
    breakpoints: {
        values: {
            xs: SCREEN_SIZE_EXTRA_SMALL.minWidth,
            sm: SCREEN_SIZE_SMALL.minWidth,
            md: SCREEN_SIZE_MEDIUM.minWidth,
            lg: SCREEN_SIZE_LARGE.minWidth,
            xl: SCREEN_SIZE_EXTRA_LARGE.minWidth,
        },
    },
    palette: {
        primary: {
            main: COLOR_PRIMARY,
        },
        secondary: {
            main: COLOR_SECONDARY,
        },
    },
});

function App() {

    const [organizations, setOrganizations] = useState([] as Organization[]);

    useEffect(() => {
        getOrganizations().then((orgs) => {
            setOrganizations(orgs);
        })
    }, []);

    var contentToDisplay = (<div>Fetching Data</div>)
    if (organizations.length > 0) {
        contentToDisplay = (<TeamGrid orgId={organizations[0].id}/>)
    }

    const screenSize = useScreenSizeDetector();

    let marginTop: string;

    if (screenSize.abbreviation === SCREEN_SIZE_EXTRA_SMALL.abbreviation || screenSize.abbreviation === SCREEN_SIZE_SMALL.abbreviation) {
        marginTop = "3rem";
    } else {
        marginTop = "4.5rem";
    }

    return (
        <ThemeProvider theme={theme}>
            <BigWigAppBar/>
            <Box sx={{
                maxWidth: "1800px",
                margin: "auto",
                marginTop: marginTop,
            }}>
                {contentToDisplay}
            </Box>
        </ThemeProvider>
    );
}

export default App;
