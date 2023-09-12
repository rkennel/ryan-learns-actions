import React from "react";
import {flattenTeamHeirarchy, Organization} from "./Organization.ts";
import * as style from "../style.ts";
import Box from "@mui/material/Box";
import {Team} from "./Team.ts";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {isEmpty} from "../util/ObjectUtils.ts";

export interface TeamDataGridProps {
    org: Organization;
}

function createColumnDefinitions(teamLevels:number):GridColDef[] {

    const colDefs:GridColDef[] = new Array(teamLevels+1);

    for(let i=0;i<teamLevels;i++){
        colDefs[i]={
            field: "team"+(teamLevels-i),
            headerName: "Team Level "+(teamLevels-i),
            type: "string",
            editable: false,
            flex: 3,
            headerClassName: "teamDataGridHeader",
        } as GridColDef
    }

    colDefs[colDefs.length-1]={
        field: "teamSize",
        headerName: "Team Size",
        type: "number",
        editable: false,
        flex:1,
        headerClassName: "teamDataGridHeader",
    } as GridColDef

    return colDefs;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function populateRowsWithData(teamLevels:number,flattenedTeams: Team[][]):any[] {
    const rows = new Array(flattenedTeams.length);

    function calculateTeamSize(flattenedTeam: Team[]) {

        //Flattened team will include parents, eg. Analytics / Business Intelligence / Analytics.fordpro.com
        // in the example above we want to return team size of Analytics.fordpro.com
        // For Product Group Analytics.  Flattened Team = [Analytics, {},{}]

        let teamSize = 0;
        for(let i=0;i<flattenedTeam.length;i++){
            if(!isEmpty(flattenedTeam[i])){
                teamSize=flattenedTeam[i].members.length;
            }
        }
        return teamSize;
    }

    for (let i = 0; i < flattenedTeams.length; i++) {
        const row = {
            id:i,
            teamSize:calculateTeamSize(flattenedTeams[i]),
        }
        for (let j = 0; j < flattenedTeams[i].length; j++) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            row["team"+(teamLevels-j)]=flattenedTeams[i][j].name;
        }
        rows[i]=row;
    }

    return rows;
}

export function TeamDataGrid(props: TeamDataGridProps): React.JSX.Element {

    const flattenedTeams:Team[][] = flattenTeamHeirarchy(props.org);

    const columns:GridColDef[] = createColumnDefinitions(props.org.levels);
    const rows = populateRowsWithData(props.org.levels, flattenedTeams);

    return (
        <Box sx={{
            backgroundColor: style.COLOR_MAIN_BG,
            border: "1px solid black",
            //padding: "1rem",
            '& .teamDataGridHeader, .MuiDataGrid-columnHeaderTitle, .MuiDataGrid-columnHeaders': {
                fontWeight: "bold",
                backgroundColor: style.COLOR_PRIMARY,
                color: "#ffffff",
            }
        }}>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 25,
                        },
                    },
                }}
                pageSizeOptions={[5,10,25,50]}
                checkboxSelection
                disableRowSelectionOnClick
            />
        </Box>
    );
}

export default TeamDataGrid;