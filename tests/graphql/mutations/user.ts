export const registerMutation = `
  mutation Register(
  $email: String!
  $password: String!
  $firstName: String!
  $lastName: String!
) {
  register(
    input: {
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    }
  ) {
    accessToken
    user {
      id
      firstName
      lastName
      email
    }
  }
}
`;

export const updateUserDetailsMutation = `
mutation UpdateUserDetails($firstName:String, $lastName:String) {
  updateUserDetails(firstName: $firstName, lastName: $lastName)
}
`;

export const LoginMutation = `
mutation LoginMutation($email:String!, $password:String!) {
  login(email: $email, password: $password) {
    user {
      email
      firstName
      lastName
      id
    }
    accessToken
  }
}
`;
