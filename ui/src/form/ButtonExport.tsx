import React from "react";
import {Button} from "@mui/material";
import IosShareIcon from '@mui/icons-material/IosShare';
import Box from "@mui/material/Box";
import {boxAroundButtonSx, buttonSx} from "./ButtonStyles";

export interface ButtonExportProps {
    buttonText?: string;
    primaryAction?: boolean;
}

function ButtonExport(props: ButtonExportProps): React.JSX.Element {

    const buttonVariant = props.primaryAction ? "contained" : "outlined";

    return (
        <Box  sx={boxAroundButtonSx}>
            <Button variant={buttonVariant} endIcon={<IosShareIcon/>} sx={buttonSx}>{props.buttonText?props.buttonText:"Export"}</Button>
        </Box>
    )
}

export default ButtonExport;