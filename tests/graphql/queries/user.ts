export const contactsQuery = `
query ContactsQuery($sortOrder: ContactSortOrder, $take: Int, $skip: Int) {
  contacts(sortOrder: $sortOrder, take: $take, skip: $skip) {
    count
    contacts {
      id
      firstName
      lastName
      address {
        streetAddress
      }
    }
  }
}
`;
