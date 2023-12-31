// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type Organization struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	Teams       []*Team `json:"teams"`
	Levels      int     `json:"levels"`
}

type Person struct {
	ID        string  `json:"id"`
	Userid    string  `json:"userid"`
	Role      *Role   `json:"role"`
	Firstname *string `json:"firstname,omitempty"`
	Lastname  *string `json:"lastname,omitempty"`
	Email     *string `json:"email,omitempty"`
	ImageURL  *string `json:"imageUrl,omitempty"`
}

type Role struct {
	ID   string `json:"id"`
	Code string `json:"code"`
	Name string `json:"name"`
}

type Team struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	Members     []*Person `json:"members"`
	Parent      *Team     `json:"parent,omitempty"`
	Children    []*Team   `json:"children,omitempty"`
}
