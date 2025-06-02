
export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    displayName: string;
    profileImage: string;
    description: string;
    roleId: number;
}

export interface UpdateUserAttribute {
    id: string;
    name?: string;
    displayName?: string;
    description?: string;
}