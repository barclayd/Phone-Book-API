export const meQuery = `
query Me {
  me {
    firstName
    lastName
    email
    createdAt
    foodStores {
      id
      customName
      type {
        type
      }
      collection {
        id
        expiryDate
        removed
        opened
        consumed
        dateOpened
        dateRemoved
        dateChangedStore
        dateAddedToCollection
        lastUpdated
        food {
          id
          name
          brand {
            id
            name
          }
          measure {
            name
            abbreviation
          }
          storageInstruction
          weight
          hyperCategory {
            id
            name
            image
            icon
            defaultStore {
              type
            }
            expirationDate {
              id
              expirationType
              packageDate
              pantry
              fridge
              freezer
            }
          }
        }
      }
    }
  }
}
`;

export const userProfileStatsQuery = `
query UserProfileStats {
  userProfileStats {
    foodsAdded
    percentageConsumed
    recentlyAdded
  }
}
`;
