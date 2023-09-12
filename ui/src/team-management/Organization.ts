import {Team} from "./Team";
import {gql, request} from "graphql-request";
import {Role} from "./Role";
import {isEmpty} from "../util/ObjectUtils";

export interface Organization {
    id: string
    name: string
    description: string
    teams: Team[]
    levels: number
}

export interface GetOrganizationsGraphData {
    organizations: Organization[]
}

export interface GraphQLQueryResponse<T> {
    data: T
}

export interface GetOrganizationByIdGraphData {
    organization: Organization
}

export async function getOrganizations(): Promise<Organization[]> {
    const query = gql`
        {
          organizations {
            id
            name
            levels
          }
        }
      `;

    return request("http://localhost:8080/query", query).then((data) => {
        const organizations = (data as GetOrganizationsGraphData).organizations
        organizations.forEach((organization) => {
            organization.teams = [];
        });
        return organizations;
    });
}

export async function getOrganizationById(id: string): Promise<Organization> {
    const query = gql`
{
  organization(id:"${id}") {
    id
    name
    levels
    teams {
      id
      name
      children {
        id
        name
        children {
          id
          name
          members {
            id
            userid
            role {
              name
            }
            firstname
            lastname
            email
            imageUrl
          }
        }
        members {
          id
          userid
          role {
            name
          }
          firstname
          lastname
          email
          imageUrl
        }
      }
      members {
        id
        userid
        role {
          name
        }
        firstname
        lastname
        email
        imageUrl
      }
    }
  }
}`;

    const variables = {
        id: id,
    }

    return request("http://localhost:8080/query", query, variables).then((data) => {
        return (data as GetOrganizationByIdGraphData).organization
    });
}

export function calculateUniqueRolesFromOrganizationData(org: Organization): Role[] {
    const uniqueRoles: Role[] = [];

    function isUniqueRole(role: Role): boolean {
        for (let i = 0; i < uniqueRoles.length; i++) {
            if (role.name === uniqueRoles[i].name) {
                return false;
            }
        }
        return true;
    }

    function calculateUniqueRolesFromTeamData(team: Team) {

        for (let i = 0; i < team.members.length; i++) {
            if (isUniqueRole(team.members[i].role)) {
                uniqueRoles.push(team.members[i].role);
            }
        }

        const children: Team[] = team.children ? team.children : [];
        for (let i = 0; i < children.length; i++) {
            calculateUniqueRolesFromTeamData(children[i]);
        }
    }

    for (let i = 0; i < org.teams.length; i++) {
        calculateUniqueRolesFromTeamData(org.teams[i]);
    }

    uniqueRoles.sort((role1: Role, role2: Role) => {
        if (role1.name < role2.name) {
            return -1;
        }
        if (role1.name > role2.name) {
            return 1;
        }
        return 0;
    });

    return uniqueRoles;
}

export function flattenTeamHeirarchy(org: Organization): Team[][] {

    function addTeamsToFlattenedTeams(teams: Team[], ancestorTeams: Team[], workingListOfTeams: Team[][], levelsOfTeamInOrganization: number) {
        for (let i = 0; i < teams.length; i++) {
            const teamHeirarchy: Team[] = new Array(levelsOfTeamInOrganization).fill({});
            const currentLevel = ancestorTeams.length;
            teamHeirarchy[currentLevel] = teams[i];

            if (currentLevel > 0) {
                for (let j = 0; j < currentLevel; j++) {
                    teamHeirarchy[j] = ancestorTeams[j];
                }
            }

            workingListOfTeams.push(teamHeirarchy);
            if (teams[i].children) {
                ancestorTeams.push(teams[i]);
                addTeamsToFlattenedTeams(teams[i].children as Team[], ancestorTeams, workingListOfTeams, levelsOfTeamInOrganization);
                ancestorTeams.pop();
            }
        }
    }

    function sortTeamsByTeamNameAscending(team1: Team, team2: Team): number {
        if ((!team1) || isEmpty(team1)) {
            return -1;
        } else if ((!team2) || isEmpty(team2)) {
            return 1;
        } else if (team1.name < team2.name) {
            return -1;
        } else if (team1.name > team2.name) {
            return 1;
        }
        return 0;
    }

    const flattenedTeams: Team[][] = [];
    const higherLevelTeams: Team[] = [];
    const levels = org.levels;

    addTeamsToFlattenedTeams(org.teams, higherLevelTeams, flattenedTeams, levels);

    return flattenedTeams.sort((team1: Team[], team2: Team[]) => {
        for(let i=0; team1.length; i++) {
            let compare = sortTeamsByTeamNameAscending(team1[i], team2[i]);
            if(compare !== 0) {
                return compare;
            }
        }
        return 0;
    });
}

