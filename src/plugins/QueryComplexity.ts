import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { GraphQLSchema } from 'graphql';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';

export const queryComplexityPlugin = (
  schema: GraphQLSchema,
): ApolloServerPlugin => ({
  requestDidStart: () => ({
    didResolveOperation({ request, document }) {
      const complexity = getComplexity({
        schema,
        operationName: request.operationName,
        query: document,
        variables: request.variables,
        estimators: [
          fieldExtensionsEstimator(),
          simpleEstimator({ defaultComplexity: 1 }),
        ],
      });
      if (complexity > 10) {
        throw new Error('Query exceeded set complexity');
      }
    },
  }),
});
