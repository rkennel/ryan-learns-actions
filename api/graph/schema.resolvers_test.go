package graph

import (
	"context"
	"errors"
	"fmt"
	"github.com/ford-sandbox/bigwig/api/db"
	"github.com/ford-sandbox/bigwig/api/graph/model"
	"github.com/ford-sandbox/bigwig/api/team_management"
	"github.com/ford-sandbox/bigwig/api/test/assert"
	"github.com/google/uuid"
	"strings"
	"testing"
)

func TestQueryOrganizationsSuccessfully(t *testing.T) {
	// Arrange
	orgs := createTestOrganizations([]string{"Accounting", "Finance", "HR", "Marketing"})

	testingFor := "Query Organizations Happy Path"
	resolver := createDefaultResolver(t, testingFor, &DataRetrievalFlags{})
	resolver.GetOrganizations = createGetOrganizationsResolverFunction(orgs, nil)

	expected := createExpectedOrgs(orgs, nil)

	// Act
	organizations, err := resolver.Query().Organizations(nil)

	// Assert
	assert.NoError(t, err, testingFor)
	orgSlicesEqual(t, expected, organizations, testingFor)
}

func TestQueryOrganizationsThrowsError(t *testing.T) {
	// Arrange
	orgs := createTestOrganizations([]string{"Accounting", "Finance", "HR", "Marketing"})

	testingFor := "Query Organizations Throws Error"
	resolver := createDefaultResolver(t, testingFor, &DataRetrievalFlags{})
	resolver.GetOrganizations = createGetOrganizationsResolverFunction(orgs, errors.New("Simulated Error for Testing"))

	var expected []*model.Organization = nil

	// Act
	organizations, err := resolver.Query().Organizations(nil)

	// Assert
	assert.Error(t, err, testingFor)
	orgSlicesEqual(t, expected, organizations, testingFor)
}

func TestQueryOrganizationsWithTeams(t *testing.T) {
	// Arrange
	orgs := createTestOrganizations([]string{"Big Ten East"})
	teams := createTestTeams([]string{"Michigan", "Michigan State", "Ohio State", "Penn State", "Indiana", "Maryland", "Rutgers"})
	dataRetrievalFlags := &DataRetrievalFlags{Teams: true}

	testingFor := "Query Organizations With Teams"
	resolver := createDefaultResolver(t, testingFor, dataRetrievalFlags)
	resolver.GetOrganizations = createGetOrganizationsResolverFunction(orgs, nil)
	resolver.GetTeamsByOrganizationId = createGetTeamsResolverFunction(teams, nil)

	expected := createExpectedOrgs(orgs, teams)

	// Act
	organizations, err := resolver.Query().Organizations(nil)

	// Assert
	assert.NoError(t, err, testingFor)
	orgSlicesEqual(t, expected, organizations, testingFor)
}

func TestQueryOrganizationsWithMultipleLevelsOfTeams(t *testing.T) {
	// Arrange
	orgs := createTestOrganizations([]string{"Big Ten"})
	divisions := createTestTeams([]string{"East", "West"})
	eastTeams := createTestTeams([]string{"Michigan", "Michigan State", "Ohio State", "Penn State", "Indiana", "Maryland", "Rutgers"})
	westTeams := createTestTeams([]string{"Illinois", "Iowa", "Minnesota", "Nebraska", "Northwestern", "Purdue", "Wisconsin"})

	divisions[0].Children = eastTeams
	divisions[1].Children = westTeams

	for _, team := range eastTeams {
		team.ParentID = divisions[0].ID
	}

	for _, team := range westTeams {
		team.ParentID = divisions[1].ID
	}

	teamsCombined := append(divisions, append(eastTeams, westTeams...)...)

	dataRetrievalFlags := &DataRetrievalFlags{Teams: true}

	testingFor := "Query Organizations With Teams"
	resolver := createDefaultResolver(t, testingFor, dataRetrievalFlags)
	resolver.GetOrganizations = createGetOrganizationsResolverFunction(orgs, nil)
	resolver.GetTeamsByOrganizationId = createGetTeamsResolverFunction(teamsCombined, nil)

	expected := createExpectedOrgs(orgs, divisions)

	// Act
	organizations, err := resolver.Query().Organizations(nil)

	// Assert
	assert.NoError(t, err, testingFor)
	orgSlicesEqual(t, expected, organizations, testingFor)
}

func TestQueryOrganizationsWithTeamsAndPeople(t *testing.T) {
	// Arrange
	orgs := createTestOrganizations([]string{"Big Ten East"})
	teams := createTestTeams([]string{"Michigan", "Michigan State", "Ohio State", "Penn State", "Indiana", "Maryland", "Rutgers"})
	roles := createTestRoles([]string{"Quarterback", "Running Back"})
	people := []*team_management.PersonTeamRole{
		createTestPerson(orgs[0], teams[0], "Tom", "Brady", roles[0]),
		createTestPerson(orgs[0], teams[0], "Anthony", "Thomas", roles[1]),
	}
	teams[0].People = people

	dataRetrievalFlags := &DataRetrievalFlags{Teams: true, People: true}

	testingFor := "Query Organizations With Teams and People"
	resolver := createDefaultResolver(t, testingFor, dataRetrievalFlags)
	resolver.GetOrganizations = createGetOrganizationsResolverFunction(orgs, nil)
	resolver.GetTeamsByOrganizationId = createGetTeamsResolverFunction(teams, nil)

	expected := createExpectedOrgs(orgs, teams)

	// Act
	organizations, err := resolver.Query().Organizations(nil)

	// Assert
	assert.NoError(t, err, testingFor)
	orgSlicesEqual(t, expected, organizations, testingFor)
}

func TestQueryOrganizationByIDWithTeamsAndPeople(t *testing.T) {
	// Arrange
	org := createTestOrganizations([]string{"Big Ten East"})[0]
	teams := createTestTeams([]string{"Michigan", "Michigan State", "Ohio State", "Penn State", "Indiana", "Maryland", "Rutgers"})
	roles := createTestRoles([]string{"Quarterback", "Running Back"})
	people := []*team_management.PersonTeamRole{
		createTestPerson(org, teams[0], "Tom", "Brady", roles[0]),
		createTestPerson(org, teams[0], "Anthony", "Thomas", roles[1]),
	}
	teams[0].People = people

	dataRetrievalFlags := &DataRetrievalFlags{Teams: true, People: true}

	testingFor := "Query Organization With Teams and People"
	resolver := createDefaultResolver(t, testingFor, dataRetrievalFlags)
	resolver.GetOrganizationByID = func(id string) (*team_management.Organization, error) {
		return org, nil
	}
	resolver.GetTeamsByOrganizationId = createGetTeamsResolverFunction(teams, nil)

	expected := createExpectedOrgs([]*team_management.Organization{org}, teams)[0]

	// Act
	organizations, err := resolver.Query().Organization(nil, org.ID.String())

	// Assert
	assert.NoError(t, err, testingFor)
	orgsEqual(t, expected, organizations, testingFor)
}

func createExpectedOrgs(orgs []*team_management.Organization, teams []*team_management.Team) []*model.Organization {

	if teams == nil {
		teams = make([]*team_management.Team, 0)
	}

	expected := make([]*model.Organization, len(orgs))
	for index, org := range orgs {
		expected[index] = &model.Organization{
			ID:     org.ID.String(),
			Name:   org.Name,
			Teams:  createExpectedTeams(teams),
			Levels: 1,
		}
	}

	expectedTeams := createExpectedTeams(teams)

	expected[0].Teams = expectedTeams

	return expected
}

func createExpectedTeams(teams []*team_management.Team) []*model.Team {
	expectedTeams := make([]*model.Team, len(teams))
	for index, team := range teams {
		expectedPeople := make([]*model.Person, len(team.People))
		for peopleIndex, person := range team.People {
			expectedPeople[peopleIndex] = &model.Person{
				ID:     person.PersonID.String(),
				Userid: person.Person.Userid,
				Role: &model.Role{
					ID:   person.Role.ID.String(),
					Code: person.Role.Code,
					Name: person.Role.Name,
				},
				Firstname: person.Person.FirstName,
				Lastname:  person.Person.LastName,
				Email:     person.Person.Email,
				ImageURL:  person.Person.Imageurl,
			}
		}
		expectedTeams[index] = &model.Team{
			ID:       team.ID.String(),
			Name:     team.Name,
			Members:  expectedPeople,
			Children: createExpectedTeams(team.Children),
		}
	}

	return expectedTeams
}

func createDefaultResolver(t *testing.T, testingFor string, flags *DataRetrievalFlags) *Resolver {
	return &Resolver{
		DB: nil,
		GetOrganizations: func() ([]*team_management.Organization, error) {
			errorMessage := "GetOrganizations was called when it should not have been."
			t.Fatalf("%s Failed, %s", testingFor, errorMessage)
			return nil, errors.New(errorMessage)
		},
		GetOrganizationByID: func(id string) (*team_management.Organization, error) {
			errorMessage := "GetOrganizationByID was called when it should not have been."
			t.Fatalf("%s Failed, %s", testingFor, errorMessage)
			return nil, errors.New(errorMessage)
		},
		GetTeamsByOrganizationId: func(orgId string, retrievePeople bool) ([]*team_management.Team, error) {
			errorMessage := "GetTeams was called when it should not have been."
			t.Fatalf("%s Failed, %s", testingFor, errorMessage)
			return nil, errors.New(errorMessage)
		},
		GetDataRetrievalFlags: func(ctx context.Context) *DataRetrievalFlags {
			return flags
		},
	}
}

func createTestOrganizations(orgNames []string) []*team_management.Organization {
	orgs := make([]*team_management.Organization, len(orgNames))
	for index, orgName := range orgNames {
		id, _ := uuid.NewUUID()
		fields := db.CommonFields{
			ID: &id,
		}
		orgs[index] = &team_management.Organization{
			CommonFields: fields,
			Name:         orgName,
			Levels:       1,
		}
	}

	return orgs
}

func createTestTeams(teams []string) []*team_management.Team {
	teamsToReturn := make([]*team_management.Team, len(teams))
	for index, team := range teams {
		id, _ := uuid.NewUUID()
		fields := db.CommonFields{
			ID: &id,
		}
		teamsToReturn[index] = &team_management.Team{
			CommonFields: fields,
			Name:         team,
			People:       make([]*team_management.PersonTeamRole, 0),
			Children:     make([]*team_management.Team, 0),
		}
	}

	return teamsToReturn
}

func createTestPerson(organization *team_management.Organization, team *team_management.Team, firstName string, lastName string, role *team_management.Role) *team_management.PersonTeamRole {
	personId := uuid.New()
	userId := fmt.Sprintf("%s-%s", firstName, lastName)
	email := fmt.Sprintf("%s@fakecompany.io", userId)
	imageUrl := fmt.Sprintf("https://fakecompany.io/img/%s.png", userId)
	person := &team_management.Person{
		CommonFields: db.CommonFields{
			ID: &personId,
		},
		OrganizationID: organization.ID,
		Organization:   organization,
		FirstName:      &firstName,
		LastName:       &lastName,
		Role:           role,
		Userid:         userId,
		Email:          &email,
		Imageurl:       &imageUrl,
	}

	personTeamRoleID := uuid.New()
	return &team_management.PersonTeamRole{
		CommonFields: db.CommonFields{
			ID: &personTeamRoleID,
		},
		OrganizationID: organization.ID,
		Organization:   organization,
		PersonID:       person.ID,
		Person:         person,
		TeamID:         team.ID,
		Team:           team,
		RoleID:         role.ID,
		Role:           role,
	}
}

func createTestRoles(roles []string) []*team_management.Role {
	result := make([]*team_management.Role, len(roles))
	for index, name := range roles {
		id := uuid.New()
		result[index] = &team_management.Role{
			CommonFields: db.CommonFields{
				ID: &id,
			},
			Name: name,
			Code: strings.ToUpper(name[0:1]),
		}
	}
	return result
}

func createGetOrganizationsResolverFunction(orgs []*team_management.Organization, err error) func() ([]*team_management.Organization, error) {
	return func() ([]*team_management.Organization, error) {
		return orgs, err
	}
}

func createGetTeamsResolverFunction(teams []*team_management.Team, err error) func(string, bool) ([]*team_management.Team, error) {
	return func(orgId string, retrievePeople bool) ([]*team_management.Team, error) {
		return teams, err
	}
}

func orgsEqual(t *testing.T, expected *model.Organization, actual *model.Organization, testingFor string) {
	expectedAsASlice := []*model.Organization{expected}
	actualAsASlice := []*model.Organization{actual}
	orgSlicesEqual(t, expectedAsASlice, actualAsASlice, testingFor)
}

func orgSlicesEqual(t *testing.T, expected []*model.Organization, actual []*model.Organization, testingFor string) {

	if (expected == nil && actual != nil) || (expected != nil && actual == nil) {
		t.Fatalf("%s failed because one of the two indexes was nil\n\texpected: %#v\n\tactual %#v", testingFor, expected, actual)
	}

	if len(expected) != len(actual) {
		t.Fatalf("%s failed because the lengths of the two org slices were not equal\n\texpected: %#v\n\tactual %#v", testingFor, expected, actual)
	}

	for index, expectedOrg := range expected {
		actualOrg := actual[index]
		if !orgsEquivalent(expectedOrg, actualOrg) {
			t.Fatalf("%s failed at index: %v\n\texpected: %#v\n\tactual %#v", testingFor, index, expectedOrg, actualOrg)
		}

		teamsEqual, _ := teamsSlicesEqual(t, expectedOrg.Teams, actualOrg.Teams, testingFor)
		if !teamsEqual {
			t.Fatalf("%s failed at index: %v because teams were not matching \n\texpected: %#v\n\tactual %#v", testingFor, index, expectedOrg.Teams, actualOrg.Teams)
		}

	}
}

func orgsEquivalent(expectedOrg *model.Organization, actualOrg *model.Organization) bool {
	return (expectedOrg.ID == actualOrg.ID) && (expectedOrg.Name == actualOrg.Name) && (expectedOrg.Levels == actualOrg.Levels)
}

func teamsSlicesEqual(t *testing.T, expected []*model.Team, actual []*model.Team, testingFor string) (bool, error) {

	if (expected == nil && actual != nil) || (expected != nil && actual == nil) {
		return false, errors.New(fmt.Sprintf("%s failed because one of the two indexes was nil\n\texpected: %#v\n\tactual %#v", testingFor, expected, actual))
	}

	if len(expected) != len(actual) {
		return false, errors.New(fmt.Sprintf("%s failed because the lengths of the two org slices were not equal\n\texpected: %#v\n\tactual %#v", testingFor, expected, actual))
	}

	for index, expectedTeam := range expected {
		actualTeam := actual[index]
		if !teamsEquivalent(expectedTeam, actualTeam) {
			return false, errors.New(fmt.Sprintf("%s failed at index: %v\n\texpected: %#v\n\tactual %#v", testingFor, index, expectedTeam, actualTeam))
		}

		peopleEqual, _ := peopleSlicesEqual(t, expectedTeam.Members, actualTeam.Members, testingFor)
		if !peopleEqual {
			return false, errors.New(fmt.Sprintf("%s failed at index: %v because people were not matching \n\texpected: %#v\n\tactual %#v", testingFor, index, expectedTeam.Members, actualTeam.Members))
		}

		childTeamsEqual, err := teamsSlicesEqual(t, expectedTeam.Children, actualTeam.Children, testingFor)
		if !childTeamsEqual {
			return false, err
		}
	}

	return true, nil
}

func teamsEquivalent(expectedTeam *model.Team, actualTeam *model.Team) bool {
	return (expectedTeam.ID == actualTeam.ID) && (expectedTeam.Name == actualTeam.Name)
}

func peopleSlicesEqual(t *testing.T, expectedPersons []*model.Person, actualPersons []*model.Person, testingFor string) (bool, error) {

	if (expectedPersons == nil && actualPersons != nil) || (expectedPersons != nil && actualPersons == nil) {
		return false, errors.New(fmt.Sprintf("%s failed because one of the two indexes was nil\n\texpected: %#v\n\tactual %#v", testingFor, expectedPersons, actualPersons))
	}

	if len(expectedPersons) != len(actualPersons) {
		return false, errors.New(fmt.Sprintf("%s failed because the lengths of the two org slices were not equal\n\texpected: %#v\n\tactual %#v", testingFor, expectedPersons, actualPersons))
	}

	for index, expectedPerson := range expectedPersons {
		actualPerson := actualPersons[index]
		if !peopleEquivalent(expectedPerson, actualPerson) {
			return false, errors.New(fmt.Sprintf("%s failed at index: %v\n\texpected: %#v\n\tactual %#v", testingFor, index, expectedPerson, actualPerson))
		}
	}

	return true, nil
}

func peopleEquivalent(a *model.Person, b *model.Person) bool {
	return a.ID == b.ID &&
		a.Userid == b.Userid &&
		a.Firstname == b.Firstname &&
		a.Lastname == b.Lastname &&
		a.Email == b.Email &&
		a.ImageURL == b.ImageURL &&
		a.Role.ID == b.Role.ID &&
		a.Role.Name == b.Role.Name &&
		a.Role.Code == b.Role.Code
}
