package model

func (this *Person) Compare(that *Person) int {
	if this.ID < that.ID {
		return -1
	} else if this.ID > that.ID {
		return 1
	}

	if this.Userid < that.Userid {
		return -1
	} else if this.Userid > that.Userid {
		return 1
	}

	return 0
}

/*
	Userid    string  `json:"userid"`
	Role      *Role   `json:"role"`
	Firstname *string `json:"firstname,omitempty"`
	Lastname  *string `json:"lastname,omitempty"`
	Email     *string `json:"email,omitempty"`
	Imageurl  *string `json:"imageurl,omitempty"`
*/
