// RESOLVER functions are there to handle any query requests and return data to the client
// we make resolver functions for each different type that we defined
// to begin with make a resolver function for the "Query" type

import database from "./database.js";

export const resolvers = {
  // we use a property name that MATCHES the TypeDef
  Query: {
    // we define resolver functions for each of the properties on our root Query Type
    games() {
      return database.games;
    },
    authors() {
      return database.authors;
    },
    reviews() {
      return database.reviews;
    },
    // to query individual game, author or review we need to use Query Variables
    // we automatically get 4 variables available to use in these functions that we can use
    // [1] parent - the return value of the resolver for this field's parent (i.e., the previous resolver in the resolver chain).
    // [2] args - an object that contains all GraphQL arguments provided for this field.
    // [3] context - context for supplying context values across all of our resolvers (such as authentication information)
    // [4] info - contains information about the operation's execution state, including the field name, the path to the field from the root, and more.
    game(parent, args, contextValue, info) {
      return database.games.find((game) => game.id === args.id);
    },
    author(parent, args, contextValue, info) {
      return database.authors.find((author) => author.id === args.id);
    },
    review(parent, args, contextValue, info) {
      return database.reviews.find((review) => review.id === args.id);
    },
  },
};

// Apollo Server will automatically remove the fields that aren't specified
