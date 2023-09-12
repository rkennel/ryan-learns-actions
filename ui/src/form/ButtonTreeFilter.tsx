import React from "react";
import {Button, Checkbox, ClickAwayListener, Grow, Paper, Popper, useTheme} from "@mui/material";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import Box from "@mui/material/Box";
import {boxAroundButtonSx, buttonSx, COLOR_BUTTON_BORDER_PRIMARY_CTA} from "./ButtonStyles";
import {TreeView} from '@mui/x-tree-view/TreeView';
import {TreeItem} from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {isEmpty} from "../util/ObjectUtils.ts";

export interface TreeFilterOption {
    id: string;
    text: string;
    checked: boolean;
    children: TreeFilterOption[];
}

export interface ButtonTreeFilterProps {
    buttonText: string;
    active?: boolean;
    treeFilterOptions: TreeFilterOption[];
    setTreeFilterOptions: (treeFilterOptions: TreeFilterOption[]) => void;
}


function createTreeItems(treeFilterOptions:TreeFilterOption[], props:ButtonTreeFilterProps): React.JSX.Element[] {
    const treeItems: React.JSX.Element[] = [];

    const treeItemSx = {
        textAlign: "left",
    };

    for (let i = 0; i < treeFilterOptions.length; i++) {
        const treeFilterOption = treeFilterOptions[i];
        treeItems.push(
            <TreeItem
                key={treeFilterOption.id}
                nodeId={treeFilterOption.id}
                label={
                    <>
                        <Checkbox
                            checked={treeFilterOption.checked}
                            sx={{
                                borderRadius: 0,
                                borderColor: COLOR_BUTTON_BORDER_PRIMARY_CTA,
                            }}
                            //tabIndex={-1}
                            //disableRipple
                            onClick={(event) => handleNodeSelect(event, treeFilterOption.id, props)}
                        />
                        {treeFilterOption.text}
                    </>
                }
                sx={treeItemSx}>
                {createTreeItems(treeFilterOption.children,props)}
            </TreeItem>
        )
    }

    return treeItems;
}

function createTreeView(props:ButtonTreeFilterProps) {

    const treeItems: React.JSX.Element[] = createTreeItems(props.treeFilterOptions,props);

    return (
        <TreeView
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandMoreIcon/>}
            defaultExpandIcon={<ChevronRightIcon/>}
            sx={{
                flexGrow: 1,
                overflowY: 'auto',
                overflowX: 'auto',
            }}
        >
            {treeItems}
        </TreeView>
    )
}

function handleNodeSelect(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, nodeId: string, props: ButtonTreeFilterProps):void{

    function findTreeFilterOption(nodeId: string, treeFilterOptions: TreeFilterOption[]):TreeFilterOption {
        for (let i = 0; i < treeFilterOptions.length; i++) {
            if (treeFilterOptions[i].id === nodeId) {
                return treeFilterOptions[i];
            }

            const result = findTreeFilterOption(nodeId, treeFilterOptions[i].children);
            if (!isEmpty(result)) {
                return result;
            }
        }

        return {} as TreeFilterOption;
    }

    function updateChildren(treeFilterOption: TreeFilterOption, checked: boolean) {
        for (let i = 0; i < treeFilterOption.children.length; i++) {
            treeFilterOption.children[i].checked = checked;
            updateChildren(treeFilterOption.children[i], checked);
        }
    }

    event.stopPropagation();

    const treeFilterOptionToUpdate = findTreeFilterOption(nodeId,props.treeFilterOptions);
    treeFilterOptionToUpdate.checked = !treeFilterOptionToUpdate.checked;
    updateChildren(treeFilterOptionToUpdate, treeFilterOptionToUpdate.checked);

    props.setTreeFilterOptions([...props.treeFilterOptions]);
}

function ButtonFilter(props: ButtonTreeFilterProps): React.JSX.Element {

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };


    const handleClickAway = () => {
        setOpen(false);
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
                    height: "auto",
                    width: "auto",
                    overflowY: 'auto',
                    overflowX: 'auto',
                    flexGrow: 1
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
                        <Paper sx={{
                            borderRadius: 0,
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: COLOR_BUTTON_BORDER_PRIMARY_CTA,
                        }}>
                            <ClickAwayListener onClickAway={handleClickAway}>
                                {createTreeView(props)}
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Box>
    )
}

export default ButtonFilter;