package db

import (
	"errors"
	"fmt"
	"github.com/ford-sandbox/bigwig/api/environment"
	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"time"
)

func GetDbConnection() (*gorm.DB, error) {
	properties := environment.GetEnvironmentProperties()

	if properties.DbType == environment.DB_TYPE_SQLITE {
		return gorm.Open(sqlite.Open(properties.DbConnectionString), &gorm.Config{})
	} else {
		return nil, errors.New(fmt.Sprintf("Unsupported DB Type: [%v]", properties.DbType))
	}
}

func maxDate() time.Time {
	return time.Date(9999, time.December, 31, 23, 59, 59, 0, time.UTC)
}

type Entity interface {
	GetID() *uuid.UUID
}

type CommonFields struct {
	ID            *uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4"`
	CreatedBy     string     `gorm:"not null;`
	CreatedAt     time.Time
	UpdatedBy     string `gorm:"not null;`
	UpdatedAt     time.Time
	effectiveFrom time.Time
	effectiveTo   time.Time `gorm:"default:maxDate"`
}

func (c CommonFields) GetID() *uuid.UUID {
	return c.ID
}
