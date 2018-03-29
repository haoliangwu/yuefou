import { GraphQLServer, Options, PubSub } from 'graphql-yoga'
import { ApolloEngineLauncher } from 'apollo-engine';

import { Prisma } from './generated/prisma'
import resolvers from './resolvers'

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
      debug: false, // log all GraphQL queries & mutations
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
  // subscriptions: "/subscription"
}

server.start(options, () => console.log(`Server is running on http://localhost:${process.env.PORT}`))

// Define the Engine configuration.
const launcher = new ApolloEngineLauncher({
  apiKey: process.env.APOLLO_ENGINE_KEY,
  origins: [{
    http: {
      url: `http://localhost:${process.env.PORT}/`,
    },
  }],
  frontends: [{
    port: parseInt(process.env.PROXY_PORT, 10) || 4000,
    endpoints: ['/'],
  }],
});

// Start the Proxy; crash on errors.
launcher.start().catch(err => { throw err; });