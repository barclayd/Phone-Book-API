export interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserDetailsData {
  firstName: string | undefined;
  lastName: string | undefined;
}
