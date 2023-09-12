package environment

import (
	"log"
	"os"
	"strings"
)

var globalEnvironmentProperties *BigWigEnvironmentProperties = nil

const PORT_DEFAULT = "8080"
const ENV_TYPE_LOCAL = "LOCAL"
const DB_TYPE_SQLITE = "sqlite"

type BigWigEnvironmentProperties struct {
	Environment        string
	DbType             string
	DbConnectionString string
	Port               string
}

func GetEnvironmentProperties() *BigWigEnvironmentProperties {

	if globalEnvironmentProperties == nil {
		globalEnvironmentProperties = loadEnvironmentProperties()
	}

	return globalEnvironmentProperties
}

func loadEnvironmentProperties() *BigWigEnvironmentProperties {
	environment := os.Getenv("BIGWIG_ENVIRONMENT")
	if environment == "" {
		log.Println("BIGWIG_ENVIRONMENT not set, defaulting to LOCAL")
		environment = ENV_TYPE_LOCAL
	}

	connectionType := os.Getenv("BIGWIG_DB_TYPE")
	connectionString := os.Getenv("BIGWIG_DB_CONNECTION_STRING")

	if strings.ToUpper(environment) == ENV_TYPE_LOCAL && (connectionType == "" || connectionString == "") {
		log.Println("DB Not Properly specified.  Since we are in LOCAL, Using IN-MEMORY SQLITE DB")
		connectionType = DB_TYPE_SQLITE
		connectionString = "file::memory:?cache=shared"
	}

	port := os.Getenv("BIGWIG_PORT")
	if port == "" {
		log.Printf("BIGWIG_PORT not set, defaulting to %v\n", PORT_DEFAULT)
		port = PORT_DEFAULT
	}

	return &BigWigEnvironmentProperties{
		Environment:        environment,
		Port:               port,
		DbType:             connectionType,
		DbConnectionString: connectionString,
	}
}
