// The different TYPES of data on the Graph that a user can query
// The combination of all the different TYPES and the relationships to each other
// and the kinds of queries that can be made combine to makeup a SCHEMA
// the SCHEMA is something that describes the shape of the Graph and the data available on it
// the data that is available on the Graph will be fairly similar to what is stored in the Database
// (they don't have to fully match) it is a layer between your Database and the Client Side queries
// but generally speaking the SCHEMA will look fairly similar to the Database

// we will use template string (to get syntax highlighting on them)
// https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql-syntax

// The types we can use are:
// Int
// Float
// String
// Boolean
// ID

// you can make your own types to build on top

// the ID type is used as a Key for data objects - they are serialised as strings
// but they are their own unique type in GraphQL

// the way to define an array of something is to wrap it in []

// make fields required with a ! (non-nullable)
// if not the field can be null

// for objects of types you also need to add the ! to the object

// the final type we make is mandatory to every Schema, called Query
// it defines the entry points to the Graph and specify the return types of those entry points

// if we have a single type in Query then we are saying we only want the user to enter the graph at the reviews point and then they are free to navigate around the Graph to get related data, but they wouldn't be able to jump into a Game or an Author

// the Query type is the way of gatekeeping entry onto the Graph
// and deciding where a User can jump into it initially

// in this case we will initally add all 3 entry points of where Queries can start from

export const typeDefs = `#graphql
  type Game {
    id: ID!
    title: String!
    platform: [String!]!
    # [2] relationship:
    reviews: [Review!] # we don't need to make this required (use ! on the end) because the game might not have a review
  } 
  type Author {
    id: ID!
    name: String!
    verified: Boolean!
    # [2] relationship:
    reviews: [Review!] # we don't need to make this required (use ! on the end) because the author might not have made any reviews
  }
  type Review {
    id: ID!
    rating: Int!
    content: String!
    # [1] here we define the relationship
    # the database review objects have game_id and author_id
    game: Game!
    author: Author!
  }
  type Query {
    games: [Game] # note they are singular types
    authors: [Author]
    reviews: [Review]
    # to query individual game, author or review we need to use Query Variables
    # it takes a parameter of (variable: Type) and it MUST be provided (required !)
    game(id: ID!): Game
    author(id: ID!): Author
    review(id: ID!): Review
  }
  type Mutation {
    # [1] we define a mutation, proving parameters and type (if neccessary) AND Return Type
    deleteGame(id: ID!): [Game]
    # [3] we can now use the custom input type "AddGameInput" to ensure the resolver argument passed matches that type
    addGame(game: AddGameInput!): Game
  }
  # [2] we create a new "input" type in our Schema which allows us to group a collection of fields
  # and that can be used as a single argument elsewhere eg. in a resolver function
  input AddGameInput {
    title: String!,
    platform: [String!]!
  }
`;
