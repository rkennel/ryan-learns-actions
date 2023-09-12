package graph

import (
	"github.com/ford-sandbox/bigwig/api/graph/model"
	"github.com/ford-sandbox/bigwig/api/team_management"
	"github.com/vektah/gqlparser/v2/ast"
)

func retrieveOrganizations(dataRetrievalFlags *DataRetrievalFlags, r *queryResolver) ([]*model.Organization, error) {
	orgs, err := r.GetOrganizations()

	if err != nil {
		return nil, err
	}

	orgTeamMap, err := retrieveTeamsForAllOrganizations(dataRetrievalFlags, r, orgs)
	if err != nil {
		return nil, err
	}

	result := make([]*model.Organization, len(orgs))
	for i, org := range orgs {
		teams := orgTeamMap[org.ID.String()]
		result[i] = convertOrganizationEntityToGraphModel(org, teams)
	}

	return result, nil
}

func retrieveOrganizationByID(r *queryResolver, dataRetrievalFlags *DataRetrievalFlags, id string) (*model.Organization, error) {
	org, err := r.GetOrganizationByID(id)

	if err != nil {
		return nil, err
	}

	orgTeamMap, err := retrieveTeamsForAllOrganizations(dataRetrievalFlags, r, []*team_management.Organization{org})
	if err != nil {
		return nil, err
	}

	teams := orgTeamMap[org.ID.String()]

	return convertOrganizationEntityToGraphModel(org, teams), nil
}

func retrieveTeamsForAllOrganizations(dataRetrievalFlags *DataRetrievalFlags, r *queryResolver, orgs []*team_management.Organization) (map[string][]*team_management.Team, error) {
	orgTeamMap := make(map[string][]*team_management.Team)
	if dataRetrievalFlags.Teams {
		for _, org := range orgs {
			teams, err := r.GetTeamsByOrganizationId(org.ID.String(), dataRetrievalFlags.People)

			if err != nil {
				return nil, err
			}

			orgTeamMap[org.ID.String()] = teams
		}
	}

	return orgTeamMap, nil
}

func getChildField(parentField *ast.Field, childFieldName string) *ast.Field {
	for _, child := range parentField.SelectionSet {
		childField, _ := child.(*ast.Field)
		if childField.Name == childFieldName {
			return childField
		}
	}

	return nil
}

func convertOrganizationEntityToGraphModel(org *team_management.Organization, teams []*team_management.Team) *model.Organization {
	return &model.Organization{
		ID:     org.ID.String(),
		Name:   org.Name,
		Levels: org.Levels,
		Teams:  convertTeamEntitiesToGraphModels(teams),
	}
}

func convertTeamEntitiesToGraphModels(teams []*team_management.Team) []*model.Team {
	result := make([]*model.Team, len(teams))
	for i, team := range teams {
		result[i] = convertTeamEntityToGraphModel(team)
	}

	addParentToTeams(result, teams)
	addChildrenToTeams(result)

	result = filterTeamsWithoutParents(result)

	return result
}

func convertTeamEntityToGraphModel(team *team_management.Team) *model.Team {
	return &model.Team{
		ID:      team.ID.String(),
		Name:    team.Name,
		Members: convertPeopleEntityToGraphModels(team.People),
	}
}

func convertPeopleEntityToGraphModels(people []*team_management.PersonTeamRole) []*model.Person {
	result := make([]*model.Person, len(people))
	for i, person := range people {
		role := person.Role
		if role == nil {
			role = person.Person.Role
		}

		result[i] = &model.Person{
			ID:     person.PersonID.String(),
			Userid: person.Person.Userid,
			Role: &model.Role{
				ID:   role.ID.String(),
				Code: role.Code,
				Name: role.Name,
			},
			Firstname: person.Person.FirstName,
			Lastname:  person.Person.LastName,
			Email:     person.Person.Email,
			ImageURL:  person.Person.Imageurl,
		}
	}

	return result
}

func addParentToTeams(graphQlTeams []*model.Team, dbTeams []*team_management.Team) {
	for _, dbTeam := range dbTeams {
		var graphQlTeam *model.Team = nil
		if dbTeam.ParentID != nil {
			graphQlTeam = findGraphQlTeamByID(graphQlTeams, dbTeam.ID.String())
			graphQlTeam.Parent = findGraphQlTeamByID(graphQlTeams, dbTeam.ParentID.String())
		}
	}
}

func findGraphQlTeamByID(teams []*model.Team, id string) *model.Team {
	for _, team := range teams {
		if team.ID == id {
			return team
		}
	}
	return nil
}

func addChildrenToTeams(teams []*model.Team) {
	for _, team := range teams {
		team.Children = findChildren(teams, team.ID)
	}
}

func findChildren(teams []*model.Team, parentId string) []*model.Team {
	result := make([]*model.Team, 0)
	for _, team := range teams {
		if team.Parent != nil && team.Parent.ID == parentId {
			result = append(result, team)
		}
	}
	return result
}

func filterTeamsWithoutParents(teams []*model.Team) []*model.Team {
	result := make([]*model.Team, 0)
	for _, team := range teams {
		if team.Parent == nil {
			result = append(result, team)
		}
	}
	return result
}
