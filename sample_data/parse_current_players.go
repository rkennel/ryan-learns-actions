package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
)

type PlayersResponse struct {
	Resource   string `json:"resource"`
	Parameters struct {
		LeagueID       string      `json:"LeagueID"`
		Season         string      `json:"Season"`
		Historical     int         `json:"Historical"`
		TeamID         int         `json:"ID"`
		Country        interface{} `json:"Country"`
		College        interface{} `json:"College"`
		DraftYear      interface{} `json:"DraftYear"`
		DraftPick      interface{} `json:"DraftPick"`
		PlayerPosition interface{} `json:"PlayerPosition"`
		Height         interface{} `json:"Height"`
		Weight         interface{} `json:"Weight"`
		Active         interface{} `json:"Active"`
		AllStar        interface{} `json:"AllStar"`
	} `json:"parameters"`
	ResultSets []struct {
		Name    string          `json:"name"`
		Headers []string        `json:"headers"`
		RowSet  [][]interface{} `json:"rowSet"`
	} `json:"resultSets"`
}

type Player struct {
	ID        int
	LastName  string
	FirstName string
	Slug      string
	TeamID    int
	TeamSlug  string
	IsDefunct bool
	TeamCity  string
	TeamName  string
	TeamAbbr  string
	Number    string
	Position  string
	Height    string
	Weight    string
	College   string
	Country   string
	DraftYear int
	DraftRnd  int
	DraftNum  int
	Active    bool
	PTS       float32
	REB       float32
	AST       float32
	StatsTime string
	FromYear  string
	ToYear    string
}

type Team struct {
	ID        int
	Slug      string
	IsDefunct bool
	City      string
	Name      string
	Abbr      string
}

func main() {
	// Read the JSON file into a byte slice
	jsonData, err := os.ReadFile("nba_players_full.json")
	if err != nil {
		log.Fatal(err)
	}

	// Define a variable to hold the decoded JSON data
	var response PlayersResponse

	// Decode the JSON data into the person variable
	err = json.Unmarshal(jsonData, &response)
	if err != nil {
		log.Fatal(err)
	}

	players := make([]Player, 0)
	for _, playerResult := range response.ResultSets[0].RowSet {

		if playerIsActive(playerResult) {
			players = append(players, convertResultToPlayer(playerResult))
		}
	}

	err = writePlayersToCsv(players)

	if err != nil {
		panic(err)
	}

	writeTeamsToCsv(players)

	if err != nil {
		panic(err)
	}

}

func writePlayersToCsv(players []Player) error {

	// Create a new CSV file
	file, err := os.Create("players.csv")
	if err != nil {
		return err
	}
	defer file.Close()

	// Create a new CSV writer
	writer := csv.NewWriter(file)

	// Write the header row
	err = writer.Write([]string{"ID", "LastName", "FirstName", "UserID", "ID", "Role", "email", "imageUrl"})
	if err != nil {
		return err
	}

	// Write the data rows
	for _, player := range players {
		err = writer.Write([]string{strconv.Itoa(player.ID), player.LastName, player.FirstName, player.Slug, strconv.Itoa(player.TeamID), player.Position, fmt.Sprintf("%v@nba.com", player.Slug), fmt.Sprintf("https://cdn.nba.com/headshots/nba/latest/260x190/%v.png", strconv.Itoa(player.ID))})
		if err != nil {
			return err
		}
	}

	// Flush the writer to write any buffered data to the file
	writer.Flush()

	return nil
}

func writeTeamsToCsv(players []Player) error {
	teams := extractUniqueTeams(players)

	// Create a new CSV file
	file, err := os.Create("teams.csv")
	if err != nil {
		return err
	}

	defer file.Close()

	// Create a new CSV writer
	writer := csv.NewWriter(file)

	// Write the header row
	err = writer.Write([]string{"ID", "SLUG", "CITY", "NAME", "ABBR"})
	if err != nil {
		return err
	}

	// Write the data rows
	for _, team := range teams {
		err = writer.Write([]string{
			strconv.Itoa(team.ID),
			team.Slug,
			team.City,
			team.Name,
			team.Abbr,
		})
		if err != nil {
			return err
		}
	}

	// Flush the writer to write any buffered data to the file
	writer.Flush()

	return nil
}

func extractUniqueTeams(players []Player) []Team {
	teamMap := make(map[int]Team)

	for _, player := range players {
		team := teamMap[player.TeamID]
		if team.ID == 0 {
			team.ID = player.TeamID
			team.Slug = player.TeamSlug
			team.City = player.TeamCity
			team.Name = player.TeamName
			team.Abbr = player.TeamAbbr
			team.IsDefunct = player.IsDefunct
			teamMap[player.TeamID] = team
		}
	}

	teams := make([]Team, 0)
	for _, team := range teamMap {
		teams = append(teams, team)
	}

	return teams
}

func playerIsActive(playerResult []interface{}) bool {
	return playerResult[19] != nil
}

func convertResultToPlayer(playerResult []interface{}) Player {
	return Player{
		ID:        convertToInt(playerResult[0]),
		LastName:  nullProtectString(playerResult[1]),
		FirstName: nullProtectString(playerResult[2]),
		Slug:      nullProtectString(playerResult[3]),
		TeamID:    convertToInt(playerResult[4]),
		TeamSlug:  nullProtectString(playerResult[5]),
		IsDefunct: convertToInt(playerResult[6]) == 1,
		TeamCity:  nullProtectString(playerResult[7]),
		TeamName:  nullProtectString(playerResult[8]),
		TeamAbbr:  nullProtectString(playerResult[9]),
		Number:    nullProtectString(playerResult[10]),
		Position:  nullProtectString(playerResult[11]),
		Height:    nullProtectString(playerResult[12]),
		Weight:    nullProtectString(playerResult[13]),
		College:   nullProtectString(playerResult[14]),
		Country:   nullProtectString(playerResult[15]),
		DraftYear: convertToInt(playerResult[16]),
		DraftRnd:  convertToInt(playerResult[17]),
		DraftNum:  convertToInt(playerResult[18]),
		Active:    convertToInt(playerResult[19]) == 1,
		PTS:       convertToFloat32(playerResult[20]),
		REB:       convertToFloat32(playerResult[21]),
		AST:       convertToFloat32(playerResult[22]),
		StatsTime: nullProtectString(playerResult[23]),
		FromYear:  nullProtectString(playerResult[24]),
		ToYear:    nullProtectString(playerResult[25]),
	}
}

func convertToInt(val interface{}) int {
	floatVal, ok := val.(float64)
	if !ok {
		return -1
	}

	return int(floatVal)
}

func convertToFloat32(val interface{}) float32 {
	f, ok := val.(float32)
	if ok {
		return f
	}

	return 0
}

func nullProtectString(val interface{}) string {
	if val == nil {
		return ""
	}

	return val.(string)
}

/*
ID        int
	LastName  string
	FirstName string
	Slug      string
	ID    int
	Slug  string
	IsDefunct bool
	City  string
	Name  string
	Abbr  string
	Number    string
	Position  string
	Height    string
	Weight    string
	College   string
	Country   string
	DraftYear int
	DraftRnd  int
	DraftNum  int
	Status    int
	PTS       float32
	REB       float32
	AST       float32
	StatsTime string
	FromYear  string
	ToYear    string
*/
