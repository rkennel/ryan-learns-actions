import {Role} from "./Role";

export interface Person {
    id: string;
    userid: string;
    role: Role;
    firstname: string
    lastname: string;
    email: string;
    imageUrl: string;
}

export default Person;
