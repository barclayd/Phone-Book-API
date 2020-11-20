import 'dotenv/config';
import 'reflect-metadata';
import moduleAlias from 'module-alias';
if (process.env.NODE_ENV === 'production') {
  moduleAlias();
}
import { createConnection, getConnectionOptions } from 'typeorm';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createSchema } from './schema';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { RouteService } from '@/routes/RouteService';

(async () => {
  const app = express();
  new RouteService(app).register();

  const options = await getConnectionOptions(
    process.env.NODE_ENV || 'development',
  );

  await createConnection({ ...options, name: 'default' });

  const schema = await createSchema();
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
    plugins: [
      {
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
            if (complexity > 50) {
              throw new Error('Query exceeded set complexity');
            }
          },
        }),
      },
    ],
  });

  apolloServer.applyMiddleware({ app, cors: false });
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}/graphql 🚀`);
  });
})();
