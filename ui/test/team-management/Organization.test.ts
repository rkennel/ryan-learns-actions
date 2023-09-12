import * as org from "../../src/team-management/Organization";
import getOrganizationsData from "../../sample_data/getOrganizations.json";
import organizationWithThreeLevels from "../../sample_data/GetOrganizationByID.json";
import bigOrgData from "../../sample_data/getOrganizationByIDWithTeamsAndPeople.json"
import {
    calculateUniqueRolesFromOrganizationData, flattenTeamHeirarchy,
    GetOrganizationByIdGraphData,
    GetOrganizationsGraphData,
    GraphQLQueryResponse,
    Organization
} from "../../src/team-management/Organization";
import {createProductTeamForTesting} from "../util/EntityCreationUtils";
import {Team} from "../../src/team-management/Team";
import {GraphQLClient} from 'graphql-request'

describe("Retrieving Organizations", () => {

    let organizations: org.Organization[];

    beforeAll(async () => {
        //arrange
        const mockRequest = vi.fn().mockResolvedValue((getOrganizationsData as GraphQLQueryResponse<GetOrganizationsGraphData>).data);
        GraphQLClient.prototype.request = mockRequest;

        //act
        await org.getOrganizations().then((data) => {
            organizations = data;
        });
    });

    //assert
    it("Retrieves all organizations", () => {
        expect(organizations).toHaveLength(2);
    });
    it("Retrieved organizations have id", () => {
        expect(organizations[0].id).toBe("76314534-9b68-4d7b-82e8-54b882d290e4");
        expect(organizations[1].id).toBe("58cbe83e-8b14-4c22-bb8a-ef0634249185");
    });
    it("Retrieved organizations have name", () => {
        expect(organizations[0].name).toBe("Pro Tech");
        expect(organizations[1].name).toBe("FCSD Tech");
    });
    it("Retrieved organizations have levels", () => {
        expect(organizations[0].levels).toBe(3);
        expect(organizations[1].levels).toBe(3);
    });
    it("Does not retrieve organization description", () => {
        expect(organizations[0].description).toBeUndefined();
        expect(organizations[1].description).toBeUndefined();
    });
    it("Teams within the organization are an empty array", () => {
        expect(organizations[0].teams).toHaveLength(0);
        expect(organizations[1].teams).toHaveLength(0)
    });
});

describe("Retrieving Organizations Error Handling", () => {


    it("Returns error message to calling function", async () => {
        //arrange
        const mockRequest = vi.fn().mockRejectedValue(new Error("Error retrieving organizations"));
        GraphQLClient.prototype.request = mockRequest;

        //act
        let err: Error = new Error();
        await org.getOrganizations().then(() => {
            throw new Error("Should not have retrieved organizations");
        }).catch((error) => {
            err = error;
        });

        //assert
        expect(err.message).toBe("Error retrieving organizations");
    });

});

describe("Retrieving Organization Details", () => {

    let organization: org.Organization;

    beforeAll(async () => {
        //arrange
        const organizationData: GetOrganizationByIdGraphData = (organizationWithThreeLevels as unknown as GraphQLQueryResponse<GetOrganizationByIdGraphData>).data;
        const mockRequest = vi.fn().mockResolvedValue(organizationData);
        GraphQLClient.prototype.request = mockRequest;

        //act
        await org.getOrganizationById("f5b3f299-49f2-426f-ae67-96b1fa54230c").then((data) => {
            organization = data;
        });
    });

    //assert
    it("ID Populated", () => {
        expect(organization.id).toBe("76314534-9b68-4d7b-82e8-54b882d290e4");
    });
    it("Name Populated", () => {
        expect(organization.name).toBe("Pro Tech");
    });
    it("Levels to be populated", () => {
        expect(organization.levels).toBe(3);
    });
    it("Does not retrieve organization description", () => {
        expect(organization.description).toBeUndefined();
    });
    it("1 Direct Child Team", () => {
        expect(organization.teams).toHaveLength(1);
    });
});

describe("Retrieving Organization Error Handling", () => {


    it("Returns error message to calling function", async () => {
        //arrange
        const mockRequest = vi.fn().mockRejectedValue(new Error("Error retrieving organization"));
        GraphQLClient.prototype.request = mockRequest;

        //act
        let err: Error = new Error();
        await org.getOrganizationById("ABCD").then(() => {
            throw new Error("Should not have retrieved organizations");
        }).catch((error) => {
            err = error;
        });

        //assert
        expect(err.message).toBe("Error retrieving organization");
    });

});

describe("Calculate Unique Roles from Organization Data", () => {
    //IT IS A LOT OF WORK TO SET THIS UP CORRECTLY, ITERATIVELY SO WE WILL JUST DO A STRESS TEST
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const bigOrg: Organization = bigOrgData.data.organization as Organization;
    const uniqueRoles = calculateUniqueRolesFromOrganizationData(bigOrg);

    it("Based on the data set there should be 8 roles", () => {
        expect(uniqueRoles).toHaveLength(8);
    })
    it("Should be sorted in alphabetical order", () => {
        expect(uniqueRoles.map(role => role.name)).toEqual([
            "Anchor",
            "Data Engineer",
            "Data Scientist",
            "Enablement Manager",
            "Go To Market Lead",
            "Product Designer",
            "Product Manager",
            "Software Engineer",
        ])
    })
})

describe("Flatten Team Heirarchy", () => {

    describe("Org with two teams", () => {

        let organization: Organization;
        let flattenedTeams: Team[][];

        beforeEach(() => {
            organization = {
                id: "1",
                name: "Org",
                description: "",
                levels: 1,
                teams: [
                    createProductTeamForTesting("1", "Team 1", "",  [], []),
                    createProductTeamForTesting("2", "Team 2", "",  [], [])
                ],
            } as Organization;

            flattenedTeams = flattenTeamHeirarchy(organization);
        });


        it("should have two teams", () => {
            expect(flattenedTeams.length).toBe(2);
        });

        it("should have one level", () => {
            for (let i = 0; i < flattenedTeams.length; i++) {
                expect(flattenedTeams[i].length).toBe(1);
            }
        });
    });

    describe("Org with six teams, two levels", () => {

        let organization: Organization;
        let flattenedTeams: Team[][];

        beforeAll(() => {
            organization = {
                id: "1",
                name: "Org",
                description: "",
                levels: 2,
                teams: [
                    createProductTeamForTesting("1", "Team 1", "",  [], []),
                    createProductTeamForTesting("2", "A Team 2 - This should be sorted before Team 1", "",  [], []),
                ],
            } as Organization;

            organization.teams[0].children = [
                createProductTeamForTesting("11", "Team 11", "",  [], []),
                createProductTeamForTesting("12", "Team 12", "",  [], []),
            ];
            organization.teams[1].children = [
                createProductTeamForTesting("21", "Team 21", "",  [], []),
                createProductTeamForTesting("22", "Team 022 - This should come before Team 21", "",  [], [])

            ];

            flattenedTeams = flattenTeamHeirarchy(organization);
        });



        it("should have six teams", () => {
            expect(flattenedTeams.length).toBe(6);
        });

        it("should have two levels", () => {
            for (let i = 0; i < flattenedTeams.length; i++) {
                expect(flattenedTeams[i].length).toBe(2);
            }
        });

        it("should populate parent teams for the child teams", () => {
            for (let i = 0; i < flattenedTeams.length; i++) {
                expect(flattenedTeams[i][0]).not.toEqual({});
            }
        });

        it("should sort in alphabetical order by team names starting with parent heirarchy", () => {
            expect(flattenedTeams[0][0].name).toBe("A Team 2 - This should be sorted before Team 1");
            expect(flattenedTeams[0][1].name).toBeUndefined()

            expect(flattenedTeams[1][0].name).toBe("A Team 2 - This should be sorted before Team 1");
            expect(flattenedTeams[1][1].name).toBe("Team 022 - This should come before Team 21");
        });

    });

    describe("Big Org Data - 3 levels", () => {

        let flattenedTeams: Team[][];

        beforeEach(() => {
            flattenedTeams = flattenTeamHeirarchy(bigOrgData.data.organization as unknown as Organization);
        })

        it("should have 136 teams", () => {
            expect(flattenedTeams.length).toBe(136);
        });

        it("should have 3 levels", () => {
            for (let i = 0; i < flattenedTeams.length; i++) {
                expect(flattenedTeams[i].length).toBe(3);
            }
        });

    });

});

