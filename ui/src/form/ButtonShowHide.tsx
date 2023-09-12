import React, {useState} from "react";
import {Button} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from "@mui/material/Box";
import {boxAroundButtonSx, buttonSx} from "./ButtonStyles";

export interface ButtonShowHideProps {
    buttonText: string;
    switchFn: () => void;
    visible?: boolean;
    displayStyle?: string;
}

function ButtonShowHide(props: ButtonShowHideProps): React.JSX.Element {
    const [visible, setVisible] = useState<boolean>((typeof props.visible === "undefined") ? true : props.visible);

    const buttonVariant = visible ? "contained" : "outlined";
    const icon = visible ? <VisibilityIcon/> : <VisibilityOffIcon/>;

    function buttonPressed() {
        setVisible(!visible);
        props.switchFn();
    }

    return (
        <Box sx={boxAroundButtonSx} onClick={buttonPressed}>
            <Button variant={buttonVariant} endIcon={icon} sx={buttonSx}>{props.buttonText}</Button>
        </Box>
    )
}

export default ButtonShowHide;