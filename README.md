## GraphQL learning

1. initialise the project and allow the project to use ES Modules (and we can use top level `await`)

`npm init -y && npm pkg set type="module"`

2. install graphql and apollo server which is a graphql library which makes it easy to spin up a graphql server, make schemas, types, respond to queries using resolver functions etc.

`npm install graphql @apollo/server`

3. create `index.js`

4. in `index.js` import the Apollo Server framework

` import { ApolloServer } from "@apollo/server";`

and import the Standalone Server for Apollo Server

`import { startStandaloneServer } from "@apollo/server/standalone";`

5. Define the Server

create a new instance of an Apollo Server
it takes in an object as an argument
and that object expects 2 properties

[1] **Type Definitions** (not(!) the same as TypeScript)
these are descriptions of our data types and the relationship they have with other data types

[2] **Resolvers**
these are a bunch of resolve functions that determine how we respond to queries for different data on the graph

```
const server = new ApolloServer({
// [1] Type Definitions
typeDefs,
// [2] Resolvers
resolvers,
});
```

6. start the standalone server with the instance from above, // and destructure the url from it

```
const { url } = await startStandaloneServer(server, {
   // setup the specific port to listen on
   listen: { port: 4000 },
});

console.log(`Server running at: ${url}`);
```

7. Define the **Type Definitions**

8. Define the **Resolvers**

9. Run the Server

`npm i nodemon -D`

`"dev": "nodemon index.js"`

`npm run dev`

10. visit http://localhost:4000/ and run some queries:

Query Example:

```
query GamesQuery {
   games {
      title,
      platform
   }
}

```

Response:

```
{
   "data": {
      "games": [
         {
            "title": "Zelda, Tears of the Kingdom",
            "platform": [
               "Switch"
            ]
         },
```

11. To query a single game, author or review we need to use Query Variables

We automatically get 4 variables available to use in these functions that we can use

- [1] **parent** - the return value of the resolver for this field's parent (i.e., the previous resolver in the resolver chain).
- [2] **args** - an object that contains all GraphQL arguments provided for this field.
- [3] **contextValue** - context for supplying context values across all of our resolvers (such as authentication information)
- [4] **info** - contains information about the operation's execution state, including the field name, the path to the field from the root, and more.

`schema.js`

```
type Query {
   ...
   # to query individual game, author or review we need to use Query Variables
   # it takes a parameter of type: Type and it MUST be provided (required !)
   game(id: ID!): Game
   author(id: ID!): Author
   review(id: ID!): Review
}
```

`resolvers.js`

```
export const resolvers = {
   Query: {
      ...
      game(parent, args, contextValue, info) {
         return database.games.find((game) => game.id === args.id);
      },
      author(parent, args, contextValue, info) {
         return database.authors.find((author) => author.id === args.id);
      },
      review(parent, args, contextValue, info) {
         return database.reviews.find((review) => review.id === args.id);
      },
   }
}
```

Query Individual Example:

When making the query we use a ($variable: type)
and then on the Type we pass that in (id: $variable)

```
query GameQuery($id: ID!) {
   game(id: $id) {
     title,
     platform
   }
}
```

In Apollo Sandbox (to mock a client request with a body) we provide in **Variables** as JSON Object such as:

```
{
   "id": "2"
}
```

Response:

```
{
  "data": {
    "game": {
      "title": "Final Fantasy 7 Remake",
      "platform": [
        "PS5",
        "Xbox"
      ]
    }
  }
}
```
