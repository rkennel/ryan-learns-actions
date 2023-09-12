package team_management

import (
	"gorm.io/gorm"
)

func GetOrganizations(gormDb *gorm.DB) ([]*Organization, error) {

	var orgs []*Organization

	result := gormDb.Order("name").Find(&orgs)
	if result.Error != nil {
		return nil, result.Error
	}

	return orgs, nil
}

func GetOrganizationByID(gormDb *gorm.DB, id string) (*Organization, error) {

	var org *Organization

	result := gormDb.First(&org, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}

	return org, nil
}

func GetTeamsByOrganizationId(gormDb *gorm.DB, orgId string, retrievePeople bool) ([]*Team, error) {
	var teams []*Team

	if retrievePeople {
		gormDb = gormDb.Preload("People").Preload("People.Role").Preload("People.Person").Preload("People.Person.Role")
	}

	result := gormDb.Where("organization_id = ?", orgId).Find(&teams)
	if result.Error != nil {
		return nil, result.Error
	}

	return teams, nil
}
