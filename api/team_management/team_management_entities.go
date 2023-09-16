package team_management

import (
	"github.com/google/uuid"
	"github.com/rkennel/ryan-learns-actions/api/db"
)

type Organization struct {
	db.CommonFields
	Name        string `gorm:"not null;unique;index"`
	Description *string
	Levels      int
}

type Role struct {
	db.CommonFields
	OrganizationID *uuid.UUID `gorm:"not null;index;index:idx_organization_role;index:idx_organization_role_name"`
	Organization   *Organization
	Code           string `gorm:"not null;index;index:idx_organization_role"`
	Name           string `gorm:"not null;index:idx_organization_role_name"`
}

type Team struct {
	db.CommonFields
	OrganizationID *uuid.UUID `gorm:"not null;index;index:idx_organization_team"`
	Organization   *Organization
	Name           string `gorm:"not null;index:idx_organization_team"`
	Description    *string
	ParentID       *uuid.UUID
	Children       []*Team `gorm:"foreignkey:ParentID;references:ID"`
	People         []*PersonTeamRole
}

type Person struct {
	db.CommonFields
	OrganizationID *uuid.UUID `gorm:"not null;index;index:idx_organization_person"`
	Organization   *Organization
	Userid         string     `gorm:"not null;unique;index;index:idx_organization_person"`
	RoleId         *uuid.UUID `gorm:"not null"`
	Role           *Role
	FirstName      *string
	LastName       *string
	Email          *string
	Imageurl       *string
	Teams          []*PersonTeamRole
}

/*
Note: A person can play a different role on a specific team than their primary role
*/
type PersonTeamRole struct {
	db.CommonFields
	OrganizationID *uuid.UUID `gorm:"not null;index;index:idx_organization_person_team_role"`
	Organization   *Organization
	PersonID       *uuid.UUID `gorm:"not null;index;index:idx_person_person_team_role"`
	Person         *Person
	TeamID         *uuid.UUID `gorm:"not null;index;index:idx_team_person_team_role"`
	Team           *Team
	RoleID         *uuid.UUID
	Role           *Role
}
