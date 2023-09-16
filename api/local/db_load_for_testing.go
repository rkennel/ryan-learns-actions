package local

import (
	"encoding/csv"
	"github.com/google/uuid"
	database "github.com/rkennel/ryan-learns-actions/api/db"
	"github.com/rkennel/ryan-learns-actions/api/team_management"
	"gorm.io/gorm"
	"log"
	"os"
	"strconv"
)

const USERID = "testload"

func LoadDataForTesting() error {

	// Connect to the database
	db, err := database.GetDbConnection()
	if err != nil {
		return err
	}

	orgs, err := loadOrgs(db)
	if err != nil {
		return err
	}

	organization := orgs[0]
	roles, err := loadRoles(organization, db)
	if err != nil {
		return err
	}

	teams, err := loadTeams(organization, db)
	if err != nil {
		return err
	}

	people, err := loadPeople(organization, roles, db)
	if err != nil {
		return err
	}

	peopleTeamRoles, err := loadPeopleTeamRoles(organization, people, teams, roles, db)
	if err != nil {
		return err
	}

	log.Println("Database loaded db for testing")
	log.Printf("\tOrgs Loaded: %d", len(orgs))
	log.Printf("\tRoles Loaded: %d", len(roles))
	log.Printf("\tTeams Loaded: %d", len(teams))
	log.Printf("\tPeople Loaded: %d", len(people))
	log.Printf("\tPeople Team Roles Loaded: %d", len(peopleTeamRoles))

	return nil
}

func loadOrgs(db *gorm.DB) ([]*team_management.Organization, error) {

	convert := func(record []string) *team_management.Organization {
		levels, _ := strconv.Atoi(record[1])

		return &team_management.Organization{
			CommonFields: commonFieldsForDataLoad(),
			Name:         record[0],
			Levels:       levels,
		}
	}

	return parseCsvFileAndLoadTable("../sample_data/load/organization.csv", db, convert)
}

func loadRoles(org *team_management.Organization, db *gorm.DB) ([]*team_management.Role, error) {

	convert := func(record []string) *team_management.Role {
		return &team_management.Role{
			CommonFields:   commonFieldsForDataLoad(),
			OrganizationID: org.ID,
			Organization:   org,
			Code:           record[0],
			Name:           record[1],
		}
	}

	return parseCsvFileAndLoadTable("../sample_data/load/role.csv", db, convert)
}

func loadTeams(org *team_management.Organization, db *gorm.DB) ([]*team_management.Team, error) {

	teams := make([]*team_management.Team, 0)

	records, err := parseCsvFile("../sample_data/load/team.csv")
	if err != nil {
		return teams, err
	}

	for index, record := range records {
		if index > 0 {
			teams = append(teams, &team_management.Team{
				CommonFields:   commonFieldsForDataLoad(),
				OrganizationID: org.ID,
				Organization:   org,
				Name:           record[0],
			})
		}
	}

	addParentsTeams(records, teams)
	addChildrenToTeams(teams)

	return loadTable(db, teams)
}

func addParentsTeams(records [][]string, teams []*team_management.Team) {
	for _, record := range records {
		team := findTeam(record[0], teams)
		parent := findTeam(record[1], teams)

		if parent != nil {
			team.ParentID = parent.ID
		}
	}
}

func findTeam(teamName string, teams []*team_management.Team) *team_management.Team {
	if teamName == "" {
		return nil
	}

	for _, team := range teams {
		if team.Name == teamName {
			return team
		}
	}

	return nil
}

func addChildrenToTeams(teams []*team_management.Team) {
	for _, team := range teams {
		children := findChildren(team, teams)
		if len(children) > 0 {
			team.Children = children
		}
	}
}

func findChildren(team *team_management.Team, teams []*team_management.Team) []*team_management.Team {
	children := make([]*team_management.Team, 0)
	for _, t := range teams {
		if t.ParentID != nil && t.ParentID == team.ID {
			children = append(children, t)
		}
	}
	return children
}

func loadPeople(org *team_management.Organization, roles []*team_management.Role, db *gorm.DB) ([]*team_management.Person, error) {
	people := make([]*team_management.Person, 0)

	records, err := parseCsvFile("../sample_data/load/person.csv")
	if err != nil {
		return people, err
	}

	for index, record := range records {
		if index > 0 {
			person := &team_management.Person{
				CommonFields:   commonFieldsForDataLoad(),
				OrganizationID: org.ID,
				Organization:   org,
				Userid:         record[0],
				Role:           findRole(record[1], roles),
				FirstName:      &record[2],
				LastName:       &record[3],
				Email:          &record[4],
			}

			if record[5] != "" {
				person.Imageurl = &record[5]
			}

			people = append(people, person)
		}
	}

	return loadTable(db, people)
}

func findRole(roleName string, roles []*team_management.Role) *team_management.Role {
	for _, role := range roles {
		if role.Name == roleName {
			return role
		}
	}

	return nil
}

func loadPeopleTeamRoles(org *team_management.Organization, people []*team_management.Person, teams []*team_management.Team, roles []*team_management.Role, db *gorm.DB) ([]*team_management.PersonTeamRole, error) {

	personTeamRoles := make([]*team_management.PersonTeamRole, 0)

	records, err := parseCsvFile("../sample_data/load/person_team_role.csv")
	if err != nil {
		return personTeamRoles, err
	}

	for index, record := range records {
		if index > 0 {
			person := findPerson(record[0], people)
			team := findTeam(record[1], teams)
			personTeamRole := &team_management.PersonTeamRole{
				CommonFields:   commonFieldsForDataLoad(),
				OrganizationID: org.ID,
				Organization:   org,
				PersonID:       person.ID,
				Person:         person,
				TeamID:         team.ID,
				Team:           team,
			}

			if record[2] != "" {
				role := findRole(record[2], roles)
				personTeamRole.RoleID = role.ID
				personTeamRole.Role = role
			}

			personTeamRoles = append(personTeamRoles, personTeamRole)
		}
	}

	return loadTable(db, personTeamRoles)
}

func findPerson(cdsId string, people []*team_management.Person) *team_management.Person {
	for _, person := range people {
		if person.Userid == cdsId {
			return person
		}
	}

	return nil
}

func parseCsvFileAndLoadTable[T database.Entity](filename string, db *gorm.DB, convertRecordToEntity func([]string) *T) ([]*T, error) {

	records, err := parseCsvFile(filename)
	if err != nil {
		return make([]*T, 0), err
	}

	entities := make([]*T, 0)
	for index, record := range records {
		if index > 0 {
			entities = append(entities, convertRecordToEntity(record))
		}
	}

	return loadTable(db, entities)
}

func parseCsvFile(filename string) ([][]string, error) {

	file, err := os.Open(filename)
	if err != nil {
		return make([][]string, 0), err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return make([][]string, 0), err
	}

	return records, nil
}

func loadTable[T database.Entity](db *gorm.DB, entities []*T) ([]*T, error) {
	result := db.Create(entities)

	if result.Error != nil {
		return make([]*T, 0), result.Error
	}

	return entities, nil
}

func commonFieldsForDataLoad() database.CommonFields {
	uuid := uuid.New()
	return database.CommonFields{
		ID:        &uuid,
		CreatedBy: USERID,
		UpdatedBy: USERID,
	}
}
