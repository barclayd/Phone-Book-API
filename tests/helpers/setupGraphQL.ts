import { graphql, GraphQLSchema } from 'graphql';
import { createSchema } from '@/schema';

type Maybe<T> = null | undefined | T;

interface Options {
  source: string;
  variableValues?: Maybe<{ [key: string]: any }>;
  accessToken?: string;
}

let schema: GraphQLSchema;

export const setupGraphQL = async ({
  source,
  variableValues,
  accessToken,
}: Options) => {
  if (!schema) {
    schema = await createSchema();
  }
  return graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      req: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        res: {},
      },
    },
  });
};
