import * as R from 'ramda';

import { GraphQLServer, Options, PubSub } from 'graphql-yoga'

import { Prisma } from './generated/prisma'
import resolvers from './resolvers'

// import persistQueryMap from '../webapp/persist_query.json';

import 'apollo-cache-control';

const pubsub = new PubSub()
// base server
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    pubsub,
    db: new Prisma({
      endpoint: process.env.PRISMA_ENDPOINT, // the endpoint of the Prisma DB service (value is set in .env)
      secret: process.env.PRISMA_SECRET, // taken from database/prisma.yml (value is set in .env)
      debug: true, // log all GraphQL queries & mutations
    }),
  }),
})

// https://github.com/graphcool/graphql-yoga/issues/5
// const engine = new ApolloEngine({
//   engineConfig: { apiKey: process.env.APOLLO_ENGINE_KEY },
//   endpoint: '/',
//   graphqlPort: parseInt(process.env.PORT, 10) || 4000,
// })

// engine.listen({
//   port: 3000,
// });

const options: Options = {
  tracing: true,
  cacheControl: true,
  port: parseInt(process.env.PORT, 10) || 3000,
  uploads: {
    maxFileSize: 2097152,
    maxFiles: 1
  },
}

server.start(options, () => console.log(`GraphQL Server is running on http://localhost:${process.env.PORT}`))

