
https://the-one-api.dev/sign-up

Authorization: Bearer your-api-key-123

Only the /book endpoint is available without authentication


# TODO

```
/movie
/movie/{id}
/movie/{id}/quote
/quote
/quote/{id}
```

# pagination

limit
/character?limit=100
page
/character?page=2 (limit default is 10)
offset
/character?offset=3 (limit default is 10)

# Sorting

/character?sort=name:asc
/quote?sort=character:desc

# Filtering

Option
Example
match, negate match
/character?name=Gandalf
/character?name!=Frodo
include, exclude
/character?race=Hobbit,Human
/character?race!=Orc,Goblin
exists, doesn't exists
/character?name
/character?!name
regex
/character?name=/foot/i
/character?name!=/foot/i
less than, greater than or equal to
/movie?budgetInMillions<100

/movie?academyAwardWins>0

/movie?runtimeInMinutes>=160

# How to Use

This is all made up!

```typescript
import {lotr} from 'lotr';

const username = process.env.username;
const password = process.env.password;

const client = await lotr.auth(username, password);
client.getMovies();
client.getMovies(movieId: string);
client.getQuote(movieId: string);

client.getQuote();
client.getQuote(quoteId: string);
```

[ ] demonstration file
[ ] design.md (talk about SDK design)
