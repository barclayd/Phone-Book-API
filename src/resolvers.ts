import path from 'path';
import fs from 'fs';
import { NonEmptyArray } from 'type-graphql';

const pathToResolvers = path.join(__dirname, './resolvers');
const resolversArray = fs
  .readdirSync(pathToResolvers)
  .reduce((acc: Function[], resolver) => {
    if (resolver.split('.').slice(-1)[0] !== 'map') {
      const newResolver = require(`./resolvers/${resolver}`);
      acc.push(newResolver.default);
    }
    return acc;
  }, []) as NonEmptyArray<Function>;

export default resolversArray;
