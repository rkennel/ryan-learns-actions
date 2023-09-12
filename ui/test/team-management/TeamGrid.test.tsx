import {act, fireEvent, render, RenderResult, screen, waitFor} from "@testing-library/react";
import {TeamGrid, TeamGridProps} from "../../src/team-management/TeamGrid";
import {GetOrganizationByIdGraphData, GraphQLQueryResponse} from "../../src/team-management/Organization";
import protechRepresentativeOrgData from "../../sample_data/getOrganizationByIDWithTeamsAndPeople.json";
import {GraphQLClient} from "graphql-request";
import {getByTitleToBeIntheDocument} from "../util/AssertionUtils";
import {getTreeItem} from "../form/ButtonTreeFilter.test";

function renderComponent(teamGridProps: TeamGridProps): RenderResult {
    return render(<TeamGrid orgId={teamGridProps.orgId}/>);
}


describe('Basic Rendering of Team Grid Team', () => {

    const teamGridProps = {
        orgId: "1c3fb97a-e838-4580-9bac-4a6ce84ce550",
    }

    beforeEach(async () => {
        //arrange
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const organizationData:GetOrganizationByIdGraphData = (protechRepresentativeOrgData as GraphQLQueryResponse<GetOrganizationByIdGraphData>).data;
        const mockRequest = vi.fn().mockResolvedValue(organizationData);
        GraphQLClient.prototype.request = mockRequest;
    });

    it("Renders 8 team cards at the top level", async () => {
        renderComponent(teamGridProps);
        getByTitleToBeIntheDocument("Team Container - Analytics");
        getByTitleToBeIntheDocument("Team Container - Customer Relationship Management");
        getByTitleToBeIntheDocument("Team Container - Data Services");
        getByTitleToBeIntheDocument("Team Container - Fleet & Service");
        getByTitleToBeIntheDocument("Team Container - Marketplace");
        getByTitleToBeIntheDocument("Team Container - Platform Engineering");
        getByTitleToBeIntheDocument("Team Container - Sales Solutions");
        getByTitleToBeIntheDocument("Team Container - Storefront");
    });
});

function teamVisible(teamName: string, renderResult:RenderResult ):boolean {
    const elements = renderResult.getAllByTitle("Team Name");
    for(let i=0;i<elements.length; i++){
        if(elements[i].textContent === teamName){
            return true;
        }
    }
    return false;
}

describe('Interacting with the buttons', () => {

    const teamGridProps = {
        orgId: "1c3fb97a-e838-4580-9bac-4a6ce84ce550",
    }

    beforeEach(async () => {
        //arrange
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const organizationData:GetOrganizationByIdGraphData = (protechRepresentativeOrgData as GraphQLQueryResponse<GetOrganizationByIdGraphData>).data;
        const mockRequest = vi.fn().mockResolvedValue(organizationData);
        GraphQLClient.prototype.request = mockRequest;
    });

    it("If I deselect the fleet & service checkbox, the team no longer displays", async () => {
        const renderResult = renderComponent(teamGridProps);

        act(() => {
            const peopleButton = renderResult.getByRole('button', {name: "Teams"});
            fireEvent.click(peopleButton);
        });



        await waitFor(() => {
            expect(teamVisible("Fleet & Service", renderResult)).toBe(true);
            const tree = renderResult.getByRole('tree');
            expect(tree).toBeDefined();
        });

        act(()=>{
            getTreeItem("Fleet & Service", renderResult).querySelector("input").click();
        });

        await waitFor(() => {
            expect(teamVisible("Fleet & Service", renderResult)).toEqual(false);
        });

    },5000);  //WHEN I SET THE TIMEOUT TO 100ms IT FAILS, BUT 1000ms IT PASSES, MUST TAKE LONGER THAN I THOUGHT TO RENDER
});



