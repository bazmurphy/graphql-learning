import "dotenv/config";
// import the Apollo Server framework
import { ApolloServer } from "@apollo/server";
// import the Standalone Server for Apollo Server
import { startStandaloneServer } from "@apollo/server/standalone";

// bring in the Type Definitions and Resolvers we defined
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";

// create a new instance of an Apollo Server
// it takes in an object as an argument
// and that object expects 2 properties
// [1] Type Definitions (not(!) the same as TypeScript)
// these are descriptions of our data types and the relationship they have with other data types
// [2] Resolvers
// these are a bunch of resolve functions that determine how we respond to queries for different data on the graph
const server = new ApolloServer({
  // [1] Type Definitions
  typeDefs,
  // [2] Resolvers
  resolvers,
});

// start the standalone server with the instance from above
// and destructure the url from it
const { url } = await startStandaloneServer(server, {
  // setup the specific port to listen on
  listen: { port: process.env.PORT },
});

console.log(`Server running at: ${url}`);
