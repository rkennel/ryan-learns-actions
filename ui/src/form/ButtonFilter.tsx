import React from "react";
import {
    Button,
    Checkbox,
    ClickAwayListener,
    FormControlLabel,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper, useTheme
} from "@mui/material";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import Box from "@mui/material/Box";
import {boxAroundButtonSx, buttonSx, COLOR_BUTTON_BORDER_PRIMARY_CTA} from "./ButtonStyles";

export interface FilterOption {
    optionText: string;
    optionValue: string;
    checked: boolean;
}

export interface ButtonFilterProps {
    buttonText: string;
    active?: boolean;
    filterOptions: FilterOption[];
    setFilterOptions: (filterOptions: FilterOption[]) => void;
}

function ButtonFilter(props: ButtonFilterProps): React.JSX.Element {

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClickAway = () => {
        setOpen(false);
    }

    const handleClose = (event: Event | React.SyntheticEvent) => {
        if (event.target instanceof HTMLInputElement) {
            const input = event.target as HTMLInputElement;

            for(let i = 0; i < props.filterOptions.length; i++){
                if(props.filterOptions[i].optionText === input.name){
                    props.filterOptions[i].checked = input.checked;
                }
            }

            props.setFilterOptions([...props.filterOptions]);
        }
    };


    function handleListKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    }

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current!.focus();
        }

        prevOpen.current = open;
    }, [open]);

    const buttonVariant = props.active ? "contained" : "outlined";
    const icon = props.active ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>;

    const theme = useTheme();

    return (
        <Box sx={boxAroundButtonSx}>
            <Button
                ref={anchorRef}
                id="composition-button"
                aria-controls={open ? 'composition-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                variant={buttonVariant}
                endIcon={icon}
                sx={buttonSx}>
                {props.buttonText}
            </Button>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement="bottom-start"
                transition
                disablePortal
                sx={{
                    zIndex: theme.zIndex.drawer + 1, // set a higher z-index than the default
                }}
            >
                {({TransitionProps, placement}) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom-start' ? 'left top' : 'left bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClickAway}>
                                <MenuList
                                    dense
                                    autoFocusItem={open}
                                    id="composition-menu"
                                    aria-labelledby="composition-button"
                                    onKeyDown={handleListKeyDown}
                                    sx={{
                                        borderRadius: 0,
                                        borderWidth: "1px",
                                        borderStyle: "solid",
                                        borderColor: COLOR_BUTTON_BORDER_PRIMARY_CTA,
                                    }}
                                >
                                    {
                                        props.filterOptions.map(filterOption => {
                                            const checkbox = <Checkbox checked={filterOption.checked}/>;
                                            return (
                                                <MenuItem onClick={handleClose} key={"menuitem-"+filterOption.optionText}>
                                                    <FormControlLabel control={checkbox}
                                                                      name={filterOption.optionText}
                                                                      label={filterOption.optionText}
                                                    />
                                                </MenuItem>
                                            )
                                        })
                                    }

                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    )
}

export default ButtonFilter;