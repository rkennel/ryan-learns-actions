package main

import (
	"context"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi"
	"github.com/rkennel/ryan-learns-actions/api/db"
	"github.com/rkennel/ryan-learns-actions/api/environment"
	"github.com/rkennel/ryan-learns-actions/api/graph"
	"github.com/rkennel/ryan-learns-actions/api/local"
	"github.com/rkennel/ryan-learns-actions/api/team_management"
	"github.com/rs/cors"
	"gorm.io/gorm"
	"log"
	"net/http"
)

func PrepareDatabase(gormDB *gorm.DB) error {
	err := Automigrate(gormDB)

	if err != nil {
		return err
	}

	if environment.GetEnvironmentProperties().Environment == environment.ENV_TYPE_LOCAL {
		err = local.LoadDataForTesting()
	}

	return err
}

func Automigrate(gormDB *gorm.DB) error {

	// Migrate the schema
	//TODO: Dynamically determine the structs to migrate
	return gormDB.AutoMigrate(
		&team_management.Organization{},
		&team_management.Role{},
		&team_management.Team{},
		&team_management.Person{},
		&team_management.PersonTeamRole{},
	)
}

func InitializeDBAndCreateResolver() (*graph.Resolver, error) {

	// Connect to the database
	gormDB, err := db.GetDbConnection()
	if err != nil {
		return nil, err
	}

	err = PrepareDatabase(gormDB)
	if err != nil {
		return nil, err
	}

	return &graph.Resolver{
		DB: gormDB,
		GetOrganizations: func() ([]*team_management.Organization, error) {
			return team_management.GetOrganizations(gormDB)
		},
		GetOrganizationByID: func(id string) (*team_management.Organization, error) {
			return team_management.GetOrganizationByID(gormDB, id)
		},
		GetTeamsByOrganizationId: func(orgId string, retrievePeople bool) ([]*team_management.Team, error) {
			return team_management.GetTeamsByOrganizationId(gormDB, orgId, retrievePeople)
		},
		GetDataRetrievalFlags: func(ctx context.Context) *graph.DataRetrievalFlags {
			return graph.GetDataRetrievalFlags(ctx)
		},
	}, nil
}

func StartServer(resolver *graph.Resolver) error {
	port := environment.GetEnvironmentProperties().Port

	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))

	var handler http.Handler
	handleFunc := http.Handle

	if environment.GetEnvironmentProperties().Environment == environment.ENV_TYPE_LOCAL {
		handler, handleFunc = handleLocalRequests(srv)
		handleFunc("/", playground.Handler("GraphQL playground", "/query"))
	}

	handleFunc("/query", srv)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground\n", port)
	return http.ListenAndServe(":"+port, handler)
}

func handleLocalRequests(srv *handler.Server) (http.Handler, func(pattern string, handler http.Handler)) {
	router := chi.NewRouter()

	router.Use(cors.Default().Handler)

	return router, router.Handle
}
