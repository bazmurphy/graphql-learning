## GraphQL learning (hand written notes)

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
         ...
      ]
   }
}
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

12. Related Data - in the database every `review` has an associated `author_id` and `game_id`

`{ id: "1", rating: 9, content: "lorem ipsum", author_id: "1", game_id: "2" },`

We need to define the relationships in the Schema between the data, so Apollo knows to make the Graph in that way.

In the `schema.js` we define the relations:

```
export const typeDefs = `#graphql
  type Game {
    ...
    # [2] relationship:
    reviews: [Review!] # we don't need to make this required (use ! on the end) because the game might not have a review
  }
  type Author {
    ...
    # [2] relationship:
    reviews: [Review!] # we don't need to make this required (use ! on the end) because the author might not have made any reviews
  }
    type Review {
    ...
    # [1] here we define the relationship
    # the database review objects have game_id and author_id
    game: Game!
    author: Author!
  }
`
```

In the `resolvers.js` we create new a resolver object `Game`  
(We do not just create a new resolver function in `Query` (the root entry point for the graph))  
Because our entry point for the query is a single game  
Apollo will run the initial resolver function `game()` inside the `Query` resolver object to get that single game  
And then to resolve the reviews for that Game it will look to the `Game` resolver object  
And then will look for the `reviews()` resolver inside of that  
To get all the reviews based on the PARENT Query for the single `Game`  
We can access the `id` of the `game` via the `parent` argument  
The `parent` argument is a reference to the value returned by the previous (or parent) resolver  
In this case the `game()` resolver function inside the `Query` object  
That parent argument will therefore be a `game` object, which will have an `id`, which we can use
So we filter for all the reviews that match the game id

We do the same for `Author`

```
export const resolvers = {
   Query: {
    ...
  }
  Game: {
    reviews(parent, args, contextValue, info) {
      return database.reviews.filter((review) => review.game_id === parent.id);
    },
  },
  Author: {
    reviews(parent, args, contextValue, info) {
      return database.reviews.filter(
        (review) => review.author_id === parent.id
      );
    },
  },
};
```

We can then run Queries where we ask for the `reviews` as well:

Query Game with Reviews:

```
query GameQuery($id: ID!) {
   game(id: $id) {
     title,
     reviews {
       rating,
       content
     }
   }
}
```

Response:

```
{
  "data": {
    "game": {
      "title": "Zelda, Tears of the Kingdom",
      "reviews": [
        {
          "rating": 10,
          "content": "lorem ipsum"
        },
        {
          "rating": 10,
          "content": "lorem ipsum"
        }
      ]
    }
  }
}
```

Query Author with Reviews:

```
query AuthorQuery($id: ID!) {
   author(id: $id) {
     name,
     verified
     reviews {
       rating,
       content
     }
   }
}
```

Response:

```
{
  "data": {
    "author": {
      "name": "mario",
      "verified": true,
      "reviews": [
        {
          "rating": 9,
          "content": "lorem ipsum"
        },
        {
          "rating": 7,
          "content": "lorem ipsum"
        }
      ]
    }
  }
}
```

For `Reviews` we create a new resolver object.
With two resolver functions
one for `game` to provide the game the review is related to
another for `author` to provide the author of the review
We again use the `parent` argument object and this time use the `game_id` and `author_id` that exist on it.

```
export const resolvers = {
  Query: {
    ...
  },
  Game: {
    ...
  },
  Author: {
    ...
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
```

Query Reviews with Game and Author:

```
query ReviewQuery($id: ID!) {
  review(id: $id) {
    rating,
    content
    game {
      title,
      platform
    }
    author {
      name
    }
  }
}
```

Response:

```
{
  "data": {
    "review": {
      "rating": 9,
      "content": "lorem ipsum",
      "game": {
        "title": "Final Fantasy 7 Remake",
        "platform": [
          "PS5",
          "Xbox"
        ]
      },
      "author": {
        "name": "mario",
        "verified": true
      }
    }
  }
}
```

We can also now take advantage of the `RESOLVER CHAIN`  
So we can get ALL the reviews on that game  
Note the nested `reviews {}` inside of `game {}`

The entry point is for a single `review` using a specific id (the resolver is in the `Query` Object)  
Then we get a single `game` using the `game_id` from the parent `review` (the resolver is in the `Review` Object)  
Then we get all the `reviews` using the `game_id` from the parent `review` (the resolver is in the `Game` Object)

So the Resolver Chain is:  
`Query` `reviews(id)` --> `Review` `game(parent.game_id)` --> `Game` `reviews(parent.game_id)`

```
query ReviewQuery($id: ID!) {
  review(id: $id) {
    rating,
    content
    game {
      title,
      platform,
      reviews {
        rating
      }
    }
  }
}
```

```
{
  "data": {
    "review": {
      "rating": 10,
      "content": "lorem ipsum",
      "game": {
        "title": "Zelda, Tears of the Kingdom",
        "platform": [
          "Switch"
        ],
        "reviews": [
          {
            "rating": 10
          },
          {
            "rating": 10
          }
        ]
      }
    }
  }
}
```

13. Mutations

A mutation is a generic term in GraphQL for any kind of change (Add/Delete/Edit) that we want to make to the date.

We make a new Type in the `schema.js` called `Mutation`

```
export const typeDefs = `#graphql
  type Game {
    ...
  }
  type Author {
    ...
  }
  type Review {
    ...
  }
  type Query {
    ...
  }
  type Mutation {
    # we define a mutation, proving parameters and type (if neccessary) AND Return Type
    deleteGame(id: ID!): [Game]
  }
`
```

We create a Resolver Object `Mutation` in `resolvers.js`
And create a function to handle `deleteGame()`

```
export const resolvers = {
  Query: {
    ...
  },
  Game: {
    ...
  },
  Author: {
    ...
  },
  Review: {
    ...
  },
  Mutation: {
    deleteGame(parent, args, contextValue, info) {
      database.games = database.games.filter((game) => game.id !== args.id);
      return database.games;
    },
  },
};
```

When making the mutation we use the word `mutation` instead of `query`

Mutation:

```
mutation DeleteGame($id: ID!) {
  deleteGame(id: $id) {
    id,
    title,
    platform
  }
}
```

Response: (we get back the games list with that specific game removed)

```
{
  "data": {
    "deleteGame": [
      {
        "id": "1",
        "title": "Zelda, Tears of the Kingdom",
        "platform": [
          "Switch"
        ]
      },
      {
        "id": "3",
        "title": "Elden Ring",
        "platform": [
          "PS5",
          "Xbox",
          "PC"
        ]
      },
      {
        "id": "4",
        "title": "Mario Kart",
        "platform": [
          "Switch"
        ]
      },
      {
        "id": "5",
        "title": "Pokemon Scarlet",
        "platform": [
          "PS5",
          "Xbox",
          "PC"
        ]
      }
    ]
  }
}
```

In `schema.js` inside `Mutation` we can define another mutation function `addGame()`
But in this case we need to define the parameter and its type.
For this we can create a custom `input` type called `AddGameInput` where we describe the shape of the object (a collection of fields)

```
export const typeDefs = `#graphql
  type Game {
    ...
  }
  type Author {
    ...
  }
  type Review {
    ...
  }
  type Query {
    ...
  }
  type Mutation {
    ....
    # [2] we can now use the custom input type "AddGameInput" to ensure the resolver argument passed matches that type
    addGame(game: AddGameInput!): Game
  }
  # [1] we create a new "input" type in our Schema which allows us to group a collection of fields
  # and that can be used as a single argument elsewhere eg. in a resolver function
  input AddGameInput {
    title: String!,
    platform: [String!]!
  }
`
```

In `resolvers.js` inside the `Mutation` resolver object we create an `addGame()` resolver function
We create a new game object, spread in the `args` using the `.game` as that is the name of the parameter we defined in the `typeDefs` `Mutation` `addGame(game: AddGameInput!)`
In this case the `args` contain `title` & `platform` key/values
Then add a randomly generated `id`
And return the newly added Game as the response.

```
export const resolvers = {
  Query: {
    ...
  },
  Game: {
    ...
  },
  Author: {
    ...
  },
  Review: {
    ...
  },
  Mutation: {
    ...
    addGame(parent, args, contextValue, info) {
      const newGame = {
        // spread out the args (title & platform)
        // it is .game because that is the name of the parameter we specificied on the typeDefs Mutation addGame(game: AddGameInput!)
        ...args.game,
        // add a random id
        id: Math.floor(Math.random() * 10000).toString(),
      };
      database.games.push(newGame);
      return newGame;
    },
  },
};
```

Mutation:

```
mutation AddGame($game: AddGameInput!) {
  addGame(game: $game) {
    title,
    platform
  }
}
```

Variables:

```
{
  "game": {
    "title": "CS:GO",
    "platform": ["PC"]
  }
}
```

Response:

```
{
  "data": {
    "addGame": {
      "title": "CS:GO",
      "platform": [
        "PC"
      ]
    }
  }
}
```
