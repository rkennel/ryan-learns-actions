import React from "react";
import Box from "@mui/material/Box";

export interface RosterSummaryCardProps {
    dataLabel: string;
    value: number;
}

function RosterSummaryCard(props: RosterSummaryCardProps): React.JSX.Element {
    return (
        <Box sx={{
            border: "1px solid black",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem 1rem 1rem 1rem",
        }}>
            <Box sx={{
                fontSize: "1rem",
            }}>{props.dataLabel}</Box>
            <Box sx={{
                fontSize: "2.5rem",
            }}>{props.value}</Box>
        </Box>
    )
}

export default RosterSummaryCard;