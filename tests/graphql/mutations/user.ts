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

export const CreateContactMutation = `
mutation CreateContactMutation($email: String!, $streetAddress: String!, $postalTown: String!, $postcode: String!, $country: String!) {
  createContact(input: {
    email: $email,
    addresses: [
    {
        streetAddress: $streetAddress
        postalTown: $postalTown,
        postcode: $postcode,
        country: $country
      }
    ]
  })
}
`;
