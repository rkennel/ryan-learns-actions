package main

import (
	"github.com/99designs/gqlgen/client"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/ford-sandbox/bigwig/api/graph"
	"github.com/ford-sandbox/bigwig/api/graph/model"
	"github.com/ford-sandbox/bigwig/api/server"
	"github.com/ford-sandbox/bigwig/api/test/assert"
	"log"
	"testing"
	"time"
)

var resolver *graph.Resolver = nil

func TestMain(m *testing.M) {
	t1 := time.Now()
	r, err := server.InitializeDBAndCreateResolver()
	t2 := time.Now()

	if err != nil {
		log.Printf("Failed to initialize DB and create resolver: %v\n", err)
		resolver = nil
	} else {
		resolver = r
	}

	println("Time to initialize DB and create resolver: ", t2.Sub(t1).Milliseconds())

	// run tests
	m.Run()
}

func TestGetOrganizations(t *testing.T) {
	//arrange
	testingFor := "End to End Get Organizations"

	c := client.New(handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: resolver})))
	response := &GraphQLResponse{}

	//act
	c.Post("{\n  organizations{\n    id,\n    name\n  }\n}", response)

	//assert
	orgs := response.Organizations
	assert.Size(t, 1, orgs, testingFor)
	assert.Equals(t, "Pro Tech", orgs[0].Name, testingFor)
}

func TestGetOrganizationWithTeams(t *testing.T) {
	//arrange
	testingFor := "End to End Get Organizations With Teams"

	c := client.New(handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: resolver})))
	response := &GraphQLResponse{}

	//act
	c.Post(`{
  organizations{
    id,
    name,
    levels,
    teams{
      id,
      name,
      children{
        id,
        name,
        children{
          id,
          name
        }
      }
    }
  }
}`, response)

	//assert
	orgs := response.Organizations
	assert.Size(t, 1, orgs, testingFor)
	assert.Equals(t, "Pro Tech", orgs[0].Name, testingFor)

	teams := orgs[0].Teams
	assert.Size(t, 8, teams, testingFor)

	analyticsPg := teams[0]
	analyticsPlTeams := analyticsPg.Children
	assert.Size(t, 3, analyticsPlTeams, testingFor)
	assert.Size(t, 6, analyticsPlTeams[0].Children, testingFor)
	assert.Size(t, 7, analyticsPlTeams[1].Children, testingFor)
	assert.Size(t, 3, analyticsPlTeams[2].Children, testingFor)
}

func TestGetOrganizationsWithTeamsAndPeople(t *testing.T) {

	//arrange
	c := client.New(handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: resolver})))
	response := &GraphQLResponse{}

	c.Post(`{
  organizations {
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
}`, response)

	//assert
	testingFor := "End to End Get Organizations With Teams And People - Organization"
	orgs := response.Organizations
	assert.Size(t, 1, orgs, testingFor)
	assert.Equals(t, "Pro Tech", orgs[0].Name, testingFor)

	testingFor = "End to End Get Organizations With Teams And People - Teams"
	teams := orgs[0].Teams
	assert.Size(t, 8, teams, testingFor)

	analyticsPg := teams[0]
	analyticsPlTeams := analyticsPg.Children
	assert.Size(t, 3, analyticsPlTeams, testingFor)
	assert.Size(t, 6, analyticsPlTeams[0].Children, testingFor)
	assert.Size(t, 7, analyticsPlTeams[1].Children, testingFor)
	assert.Size(t, 3, analyticsPlTeams[2].Children, testingFor)

	testingFor = "End to End Get Organizations With Teams And People - People"
	assert.Size(t, 2, analyticsPg.Members, testingFor)
	assert.Size(t, 5, analyticsPlTeams[0].Members, testingFor)
	assert.Size(t, 5, analyticsPlTeams[1].Members, testingFor)
	assert.Size(t, 3, analyticsPlTeams[2].Members, testingFor)
	assert.Size(t, 12, analyticsPlTeams[2].Children[0].Members, testingFor)
	assert.Size(t, 2, analyticsPlTeams[2].Children[1].Members, testingFor)
	assert.Size(t, 6, analyticsPlTeams[2].Children[2].Members, testingFor)

}

type GraphQLResponse struct {
	Organizations []*model.Organization `json:"organizations"`
}
