import Person from "./Person";
import {TreeFilterOption} from "../form/ButtonTreeFilter.tsx";
import {isEmpty} from "../util/ObjectUtils.ts";

export interface Team {
    id: string;
    name: string;
    description: string;
    children?: Team[]
    members: Person[]
}

export function convertTeamsToTreeFilterOptions(teams: Team[]|undefined): TreeFilterOption[] {

    if (!teams) {
        return [];
    }

    const treeFilterOptions: TreeFilterOption[] = [];
    for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        treeFilterOptions.push({
            id: team.id,
            text: team.name,
            checked: true,
            children: convertTeamsToTreeFilterOptions(team.children)
        });
    }

    return treeFilterOptions;
}

export function teamShouldBeDisplayed(team: Team, teamTreeFilterOptions: TreeFilterOption[]): boolean {
    function findTeamTreeFilterOption(team: Team, teamTreeFilterOptions: TreeFilterOption[]): TreeFilterOption {
        for (let i = 0; i < teamTreeFilterOptions.length; i++) {
            const teamTreeFilterOption = teamTreeFilterOptions[i];
            if (teamTreeFilterOption.id === team.id) {
                return teamTreeFilterOption;
            }
            const foundTeam = findTeamTreeFilterOption(team, teamTreeFilterOption.children);
            if (!isEmpty(foundTeam)) {
                return foundTeam;
            }
        }
        return {} as TreeFilterOption;
    }

    const teamTreeFilterOption = findTeamTreeFilterOption(team, teamTreeFilterOptions);
    return teamTreeFilterOption.checked;
}