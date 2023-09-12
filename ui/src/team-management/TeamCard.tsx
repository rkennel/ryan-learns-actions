import {Team, teamShouldBeDisplayed} from "./Team";
import PersonCard from "./PersonCard";
import React from "react";
import Grid from "@mui/material/Grid";
import ComputerIcon from '@mui/icons-material/Computer';
import {COLOR_ARRAY, COLOR_MAIN_BG} from "../style";
import {FilterOption} from "../form/ButtonFilter.tsx";
import {TreeFilterOption} from "../form/ButtonTreeFilter.tsx";

export interface TeamProps {
    team: Team;
    heirarchy: string[];
    roleFilters: FilterOption[];
    teamFilters: TreeFilterOption[];
}

function TeamCard(props: TeamProps): React.JSX.Element {
    return (
        <div>
            <div style={{
                borderLeft: "1px solid #000000",
                borderRight: "1px solid #000000",
                borderTop: "1px solid #000000",
            }}>
                <div style={{
                    padding: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: COLOR_ARRAY[colorNumber(props.heirarchy)],
                }}><ComputerIcon sx={{
                    paddingRight: "1.0rem",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#ffffff",
                }}/>
                    <div title={"Team Name"}
                         style={{
                             fontSize: "1.25rem",
                             fontWeight: "bold",
                             textAlign: "left",
                             color: "#ffffff",
                             alignItems: "center",
                         }}>{constructTeamHeirarchy(props.heirarchy, props.team.name)}</div>
                </div>
                <div title="Team Members" style={{
                    backgroundColor: COLOR_MAIN_BG,
                    borderTop: "1px solid black"
                }}>
                    <Grid container
                          key={"teamMembers-" + props.team.id}>{getTeamMembersToDisplay(props)}</Grid>
                </div>
            </div>
            {getChildTeamsToDisplay(props)}
        </div>
    );
}

function constructTeamHeirarchy(heirarch: string[], teamName: string): string {
    if (heirarch.length === 0) {
        return teamName;
    }

    let result = "";
    for (let i = 0; i < heirarch.length; i++) {
        if (i > 0) {
            result += " / ";
        }
        result += heirarch[i];
    }

    return result + " / " + teamName
}

function colorNumber(heirarchy: string[]): number {
    return heirarchy.length < 5 ? heirarchy.length : 5;
}

function getTeamMembersToDisplay(props: TeamProps): React.JSX.Element[] {
    const teamMembersToDisplay: React.JSX.Element[] = [];
    for (let i = 0; i < props.team.members.length; i++) {
        const teamMember = props.team.members[i];
        if (displayRole(props.team.members[i].role.name, props.roleFilters)) {
            teamMembersToDisplay.push(<PersonCard key={"person-" + teamMember.userid} person={teamMember}/>);
        }
    }

    if (teamMembersToDisplay.length === 0) {
        teamMembersToDisplay.push(
            <div key={"person-none-" + props.team.id} style={{
                width: "100%",
                height: "5.0rem",
                textAlign: "left",
                paddingLeft: "1.0rem",
                paddingTop: "1.0rem",
            }}>No Team Members to Display</div>
        );
    }

    return teamMembersToDisplay;
}

function displayRole(role: string, roleFilters: FilterOption[]): boolean {
    for (let i = 0; i < roleFilters.length; i++) {
        if (roleFilters[i].optionText === role) {
            return roleFilters[i].checked;
        }
    }

    return false;
}

function getChildTeamsToDisplay(props: TeamProps): React.JSX.Element[] {

    const heirarchy = props.heirarchy.slice();
    heirarchy.push(props.team.name);

    const children = props.team.children ? props.team.children : [];

    return children.map((child) => {
        if(teamShouldBeDisplayed(child, props.teamFilters)){
            return <TeamCard key={"teamcard-" + child.id} team={child} heirarchy={heirarchy}
                             roleFilters={props.roleFilters} teamFilters={props.teamFilters}/>
        } else {
            return <div key={"teamcard-" + child.id}></div>
        }
    });
}

export default TeamCard;