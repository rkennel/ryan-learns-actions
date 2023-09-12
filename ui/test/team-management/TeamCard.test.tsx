import React from 'react';
import {render, RenderResult, screen} from '@testing-library/react';
import TeamCard, {TeamProps} from "../../src/team-management/TeamCard";
import singleTeamData from "../../sample_data/SimpleTeam.json";
import threeTeamData from "../../sample_data/ThreeLevelsOfTeams.json";
import {convertTeamsToTreeFilterOptions, Team} from "../../src/team-management/Team";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const productTeam: Team = singleTeamData


function renderComponent(teamProps: TeamProps): RenderResult {
    return render(<TeamCard team={teamProps.team} heirarchy={teamProps.heirarchy} roleFilters={teamProps.roleFilters} teamFilters={teamProps.teamFilters}/>);
}

describe('Basic Rendering of Team', () => {

    const teamProps = {
        team: productTeam,
        heirarchy: [],
        roleFilters: [
            {optionText:"Data Scientist",optionValue:"Data Scientist",checked:true},
            {optionText:"Go To Market Lead",optionValue:"Go To Market Lead",checked:true},
        ],
        teamFilters: [
            {id:productTeam.id, text:productTeam.name, checked:true, children:[],},
        ]
    }

    it("Properly displays the team-management name", () => {
        renderComponent(teamProps);
        expect(screen.getByTitle("Team Name").textContent).toBe(productTeam.name);
    });

    it("Displays each member of the team-management", () => {
        renderComponent(teamProps);
        expect(screen.getAllByTitle("Team Member Name").length).toBe(teamProps.team.members.length);
    });

    it("Filters out people that have roles that are not selected", () => {
        teamProps.roleFilters = [
            {optionText:"Data Scientist",optionValue:"Data Scientist",checked:false},
            {optionText:"Go To Market Lead",optionValue:"Go To Market Lead",checked:true},
        ];

        renderComponent(teamProps);
        expect(screen.getAllByTitle("Team Member Name").length).toBe(1);
    });

    it("If No people can be displayed, displays text message", () => {
        teamProps.roleFilters = [
            {optionText:"Data Scientist",optionValue:"Data Scientist",checked:false},
            {optionText:"Go To Market Lead",optionValue:"Go To Market Lead",checked:false},
        ];

        renderComponent(teamProps);
        expect(screen.getByText("No Team Members to Display")).not.toBeNull();
    });
});

describe('Multiple Levels Team Data', () => {
    it("Displays the full team-management heirarchy", () => {

        const productGroup: Team = threeTeamData

        const productLine: Team = productGroup.children[0];

        const productTeam: Team = productLine.children[0];

        const teamProps = {
            team: productGroup,
            heirarchy: [],
            roleFilters: [],
            teamFilters: convertTeamsToTreeFilterOptions([productGroup])
        }

        renderComponent(teamProps);

        expect(screen.getByText("Analytics / Business Intelligence / Analytics.fordpro.com")).not.toBeNull();
    });
    it("Displays All Teams", () => {

        const team = threeTeamData as Team;

        const teamProps = {
            team: team,
            heirarchy: [],
            roleFilters: [],
            teamFilters: convertTeamsToTreeFilterOptions([team])
        } as TeamProps

        renderComponent(teamProps);

        expect(screen.getAllByTitle("Team Name")).toHaveLength(20);
    });
    it("Filters teams not meant to be displayed", () => {

        const team = threeTeamData as Team;

        const teamProps = {
            team: team,
            heirarchy: [],
            roleFilters: [],
            teamFilters: convertTeamsToTreeFilterOptions([team])
        } as TeamProps

        teamProps.teamFilters[0].children[0].children[0].checked = false;

        renderComponent(teamProps);

        expect(screen.getAllByTitle("Team Name")).toHaveLength(19);
    });
});

