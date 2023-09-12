import {render, RenderResult, screen} from '@testing-library/react';
import PersonCard, {TeamMemberProps} from "../../src/team-management/PersonCard";
import samplePerson from "../../sample_data/Person.json"

function renderComponent(teamMemberProps: TeamMemberProps): RenderResult {
    return render(<PersonCard person={teamMemberProps.person}/>);
}

describe('Basic Rendering of Team Member', () => {

    const teamMemberProps = {person: samplePerson}

    it("Properly displays their name", () => {
        renderComponent(teamMemberProps);
        expect(screen.getByTitle("Team Member Name").textContent).toBe("Jonathan Young");
    });

    it("Properly displays their role", () => {
        renderComponent(teamMemberProps);
        expect(screen.getByTitle("Team Member Role").textContent).toBe(samplePerson.role.name);
    });

    it("Properly displays their Image", () => {
        renderComponent(teamMemberProps);
        const imgElement = screen.getByAltText("Profile Picture of " + samplePerson.firstname + " " + samplePerson.lastname) as HTMLImageElement;
        expect(imgElement.src).toBe(samplePerson.imageUrl);
    });
});

describe('Alternate Flows', () => {

    it("Displays Their Initials in the Avatar if Image Cannot be Loaded", () => {
        const personWithoutPic = Object.assign({}, samplePerson);
        personWithoutPic.imageUrl = "";
        const teamMemberProps = {person: personWithoutPic};
        renderComponent(teamMemberProps);
        expect(screen.getByTitle("Team Member Avatar").textContent).toBe("JY");
    });

});

