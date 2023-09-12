import {Role} from "../../src/team-management/Role";
import Person from "../../src/team-management/Person";
import {Team} from "../../src/team-management/Team";

export function createRoleForTesting(code: string, name: string): Role {
    return {
        code: code,
        name: name
    }
}

export function createPersonForTesting(id: string, userid: string, role: Role, firstname: string, lastname: string, email: string, imageUrl: string): Person {
    return {
        id: id,
        userid: userid,
        role: role,
        firstname: firstname,
        lastname: lastname,
        email: email,
        imageUrl: imageUrl
    }
}

export function createProductTeamForTesting(id: string, name: string, description: string, children: Team[], members: Person[]): Team {
    return {
        id: id,
        name: name,
        description: description,
        children: children,
        members: members
    }
}