import Person from "./Person";
import './PersonCard.css';
import {Avatar} from "@mui/material";
import Grid from "@mui/material/Grid";

const widthXs: number = 12;
const widthSm: number = 6;
const widthMd: number = 4;
const widthLg: number = 3;
const widthXl: number = 2;

export interface TeamMemberProps {
    person: Person
}

function PersonCard(props: TeamMemberProps): React.JSX.Element {
    return (
        <Grid item className="teamMemberContainer" xs={widthXs} sm={widthSm} md={widthMd} lg={widthLg} xl={widthXl}>
            <div className="teamMemberPic">
                <Avatar src={props.person.imageUrl}
                        alt={"Profile Picture of " + props.person.firstname + " " + props.person.lastname}
                        variant="square"
                        className="teamMemberAvatar"
                        title="Team Member Avatar">{props.person.firstname.substring(0, 1).toUpperCase() + props.person.lastname.substring(0, 1).toUpperCase()}</Avatar>
            </div>
            <div className="teamMemberText">
                <div title="Team Member Name" className="teamMemberName">
                    {props.person.firstname + " " + props.person.lastname}
                </div>
                <div title="Team Member Role" className="teamMemberRole">
                    {props.person.role.name}
                </div>
            </div>
        </Grid>
    )
        ;
}

export default PersonCard;