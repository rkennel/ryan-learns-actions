import {Organization} from "../../src/team-management/Organization";
import {createPersonForTesting, createProductTeamForTesting, createRoleForTesting} from "../util/EntityCreationUtils";
import {getAllByRole, render, RenderResult} from "@testing-library/react";
import {TeamDataGrid, TeamDataGridProps} from "../../src/team-management/TeamDataGrid";

function renderComponent(props: TeamDataGridProps): RenderResult {
    return render(<TeamDataGrid org={props.org}/>);
}

describe("Organization with only one level of teams, two teams", () => {

    let organization: Organization;

    beforeEach(() => {
        organization = {
            id: "1",
            name: "Org",
            description: "",
            levels: 1,
            teams: [
                createProductTeamForTesting("1", "Team 1", "", [], []),
                createProductTeamForTesting("2", "Team 2", "", [], [])
            ],
        } as Organization;

        const engineer = createRoleForTesting("E", "Engineer");
        const manager = createRoleForTesting("M", "Manager");

        organization.teams[0].members = [createPersonForTesting("P1", "hford", engineer, "Henry", "Ford", "hford@ford.com", "https://www.google.com")];
        organization.teams[1].members = [
            createPersonForTesting("P2", "wford", manager, "Bill", "Ford", "wford@ford.com", "https://www.google.com"),
            createPersonForTesting("P2", "jfarley", manager, "Jim", "Farley", "jfarley@ford.com", "https://www.google.com")
        ];

    });

    it("Produces a data grid with two columns", () => {
        const teamDataGridResult = renderComponent({org: organization})
        const headerCells = teamDataGridResult.getAllByRole("columnheader");
        expect(headerCells).toHaveLength(3);
    });

    it("First row contains correct data", () => {
        const teamDataGridResult = renderComponent({org: organization})

        const rowCells = getRowCellsFromDataGrid(teamDataGridResult,1);
        const rowData = {
            team1: rowCells[1].textContent,
            teamSize: rowCells[2].textContent,
        }

        const expectedData = {
            team1: "Team 1",
            teamSize: "1",
        }

        expect(rowData).toEqual(expectedData)
    });

    it("Second row contains correct data", () => {
        const teamDataGridResult = renderComponent({org: organization})

        const rowCells = getRowCellsFromDataGrid(teamDataGridResult,2);
        const rowData = {
            team1: rowCells[1].textContent,
            teamSize: rowCells[2].textContent,
        }

        const expectedData = {
            team1: "Team 2",
            teamSize: "2",
        }

        expect(rowData).toEqual(expectedData)
    });
});

function getRowCellsFromDataGrid(renderResultWithDataGrid:RenderResult,rowNumber:number):HTMLElement[]{
    return Array.from(renderResultWithDataGrid.getAllByRole('row')[rowNumber].children) as HTMLElement[]
}