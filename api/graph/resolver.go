package graph

//go:generate go run github.com/99designs/gqlgen generate

import (
	"context"
	"github.com/99designs/gqlgen/graphql"
	"github.com/rkennel/ryan-learns-actions/api/team_management"
	"gorm.io/gorm"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB                       *gorm.DB
	GetOrganizations         func() ([]*team_management.Organization, error)
	GetOrganizationByID      func(id string) (*team_management.Organization, error)
	GetTeamsByOrganizationId func(orgId string, retrievePeople bool) ([]*team_management.Team, error)
	GetDataRetrievalFlags    func(ctx context.Context) *DataRetrievalFlags
}

type DataRetrievalFlags struct {
	Teams  bool
	People bool
}

func GetDataRetrievalFlags(ctx context.Context) *DataRetrievalFlags {

	dataRetrievalFlags := &DataRetrievalFlags{
		Teams:  false,
		People: false,
	}

	//TODO: eventually the field passed in maybe a different type of object like (teams)
	orgsField := graphql.GetFieldContext(ctx).Field.Field
	teamsField := getChildField(orgsField, "teams")

	if teamsField == nil {
		return dataRetrievalFlags
	}

	dataRetrievalFlags.Teams = true

	peopleField := getChildField(teamsField, "members")
	if peopleField != nil {
		dataRetrievalFlags.People = true
	}

	return dataRetrievalFlags
}
