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
  // here we make new a resolver (not in Query (the root entry point for the graph))
  // because our entry point for the query is a single game
  // Apollo will run the initial resolver function game() inside the Query object to get that single game
  // then to resolve the reviews for that Game it will look to the Game object
  // and then will look for the reviews resolver inside of that to get the reviews
  Game: {
    // and make a new resolver function
    // to get all the reviews based on the PARENT Query for the single Game
    // we can access the id of the game via the parent argument
    // the parent argument is a reference to the value returned by the previous (or parent) resolver
    // in this case the game() resolver function inside the Query object
    // that parent argument will therefore be a game object, which will have an id, which we can use
    reviews(parent, args, contextValue, info) {
      return database.reviews.filter((review) => review.game_id === parent.id);
    },
  },
  Author: {
    // get all the reviews from the specific author
    // the return value from author() from the Query object above is the parent argument so we can access the id
    reviews(parent, args, contextValue, info) {
      return database.reviews.filter(
        (review) => review.author_id === parent.id
      );
    },
  },
  Review: {
    game(parent, args, contextValue, info) {
      // a single review is associated to a single game (1 to 1 relationship)
      return database.games.find((game) => game.id === parent.game_id);
    },
    author(parent, args, contextValue, info) {
      // a single review is associated to a single author (1 to 1 relationship)
      return database.authors.find((author) => author.id === parent.author_id);
    },
  },
};

// Apollo Server will automatically remove the fields that aren't specified
