import { ApolloEngineLauncher } from 'apollo-engine';

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
  stores: [{
    // Every store must have a unique name. The empty string is a valid name; there is a default in-memory 50MB cache with the empty string for its name which is used for any caching feature if you don’t specify a store name. 
    name: 'yuefou-privite-cache',

    // Resize the default in-memory cache size to 100 MB; defaults to 50MB.
    inMemory: {
      cacheSize: 104857600,
    },
  }],
  sessionAuth: {
    header: 'Authorization',
  },
  queryCache: {
    // If you configure sessionAuth but leave queryCache.privateFullQueryStore blank, it will use the default 50MB in-memory cache.
    privateFullQueryStore: 'yuefou-privite-cache',

    // Turn off the public full query cache. The cache is only used for
    // responses with the 'cache-control' GraphQL extension.
    // publicFullQueryStore: 'disabled',
  },

  logging: {
    // Only show warnings and errors, not info messages.
    level: 'WARN',
  },
});

// Start the Proxy; crash on errors.
launcher.start()
  .then(() => {
    console.log(`Apollo Engine Proxy Server is running on http://localhost:${process.env.PROXY_PORT}`)
  })
  .catch(err => { throw err; });