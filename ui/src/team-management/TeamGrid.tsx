import Grid from "@mui/material/Grid";
import TeamCard from "./TeamCard";
import React, {useEffect, useState} from "react";
import {calculateUniqueRolesFromOrganizationData, getOrganizationById, Organization} from "./Organization";
import {isEmpty} from "../util/ObjectUtils";
import {useScreenSizeDetector} from "../style";
import RosterSummaryCard from "./RosterSummaryCard";
import Box from "@mui/material/Box";
import ButtonFilter, {FilterOption} from "../form/ButtonFilter";
import ButtonExport from "../form/ButtonExport";
import ButtonTreeFilter, {TreeFilterOption} from "../form/ButtonTreeFilter.tsx";
import {convertTeamsToTreeFilterOptions, teamShouldBeDisplayed} from "./Team.ts";


export interface TeamGridProps {
    orgId: string;
}

let numberOfTimesDisplayed = 0;

export function TeamGrid(props: TeamGridProps): React.JSX.Element {

    numberOfTimesDisplayed++;
    console.log("TeamGrid Displayed " + numberOfTimesDisplayed + " times");

    const [organization, setOrganization] = useState({} as Organization);
    const [roleOptions, setRoleOptions] = useState([{
        optionText: "", optionValue: "", checked: false
    }] as FilterOption[]);
    const [treeFilterOptions, setTreeFilterOptions] = useState([] as TreeFilterOption[]);

    useEffect(() => {
        getOrganizationById(props.orgId).then((org) => {
            setOrganization(org);

            setRoleOptions(calculateUniqueRolesFromOrganizationData(org).map(role => {
                return {
                    optionText: role.name,
                    optionValue: role.code,
                    checked: true
                } as FilterOption
            }));

            setTreeFilterOptions(convertTeamsToTreeFilterOptions(org.teams));

        })
    }, [props.orgId]);

    let teamsToDisplay = [(<div key={"fetching data"}>Fetching Data</div>)];

    function displayTeamsWithPlayers() {
        return organization.teams.map((topLevelTeam) => {
            if (teamShouldBeDisplayed(topLevelTeam, treeFilterOptions)) {
                return (
                    <Box
                        key={"teambox-" + topLevelTeam.id}
                        title={"Team Container - " + topLevelTeam.name} sx={{
                        borderBottom: "1px solid black",
                        marginBottom: "5rem",
                    }}>
                        <TeamCard
                            key={"teamcard-" + topLevelTeam.id}
                            team={topLevelTeam}
                            heirarchy={[]}
                            roleFilters={roleOptions}
                            teamFilters={treeFilterOptions}
                        />
                    </Box>
                )
            } else {
                return (<div key={"teambox-" + topLevelTeam.id}></div>)
            }
        });
    }

    if (!isEmpty(organization)) {
        teamsToDisplay = displayTeamsWithPlayers();
    }

    const screenSize = useScreenSizeDetector();
    let displayOtherTwoSummaryGridItems = "block";
    if (screenSize.abbreviation === "xs" || screenSize.abbreviation === "sm") {
        displayOtherTwoSummaryGridItems = "none";
    }

    return (
        <Box sx={{
            paddingTop: "1rem",
            paddingBottom: "1rem",
        }}>
            <Grid container spacing={"2rem"} sx={{
                paddingBottom: "1rem",
            }}>
                <Grid item xs={6} md={3}><RosterSummaryCard dataLabel={"Number of Teams"} value={1}/></Grid>
                <Grid item xs={6} md={3}><RosterSummaryCard dataLabel={"Number of People"} value={2}/></Grid>
                <Grid item xs={6} md={3} sx={{display: displayOtherTwoSummaryGridItems}}><RosterSummaryCard
                    dataLabel={"Average Team Size"} value={3}/></Grid>
                <Grid item xs={6} md={3} sx={{display: displayOtherTwoSummaryGridItems}}><RosterSummaryCard
                    dataLabel={"People without a Team"} value={4}/></Grid>
            </Grid>
            <Box sx={{
                paddingBottom: "1rem",
                display: "flex",
                flexDirection: "row-reverse",
                justifyContent: "right",
                width: "100%",
            }}>
                <ButtonExport/>
                <ButtonFilter buttonText={"Roles"} active={true} filterOptions={roleOptions}
                              setFilterOptions={setRoleOptions}/>
                <ButtonTreeFilter buttonText={"Teams"} active={true} treeFilterOptions={treeFilterOptions}
                                  setTreeFilterOptions={setTreeFilterOptions}/>
            </Box>
            {teamsToDisplay}
        </Box>
    );
}

export default TeamGrid;