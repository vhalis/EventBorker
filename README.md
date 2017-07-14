# EventBorker

An EventBroker API that uses a Redis backend and has a React dashboard.
The React dashboard communicates over websockets with fallback to REST.

## How to Run

This project assumes that `redis-server` is on the command line and that the server runs on `localhost:6379` (the default).

- Clone this project into some directory
- `cd` into that directory
- Run `npm install`
- Run `npm run all` if on *nix and `npm run all:windows` if on Windows
- Browse to `localhost:3000` after it says it's listening

## Creating Events

Events can be created by `POST` at `/api/v1.0.0/events/`.
[Postman](https://www.getpostman.com/) can be used, or your regular old `curl`.
The endpoint expects `JSON` of the form:

```
{
    "type": "A Type",
    "serviceId": "A Service",
    "data": "Some random data"
}
```

## Deleting Events

Events may be deleted from the dashboard or a `DELETE` over REST at `/api/v1.0.0/events/id/:id`.
A deletion done this way will be propagated to all connected clients.
Deletions done manually through the DB will not propagate.

# Design Decisions

## Redis

Redis was chosen as the backend because most of the relevant operations are O(1). It is also highly scalable, and very fast since it is in-memory. Further upgrades to this project could include pagination at the database level, using Redis' `HSCAN` capability to return only a portion of the data at a time.

## API

The API is structured to be easily extensible and each route is isolated in its own folder. Each endpoint has its own socket namespace, so clients can register for exactly what they are interested in.

## React Dashboard

All of the state is managed in a single component to avoid cross-contamination. While components like the Search row and the Sort (header) row could be broken into their own components, they would have to be controlled by the top level component anyway. Code is organized by function to mitigate confusion.

The ordering of the events in the dashboard is not strictly guaranteed, but Javascript objects can generally (except for some small caveats on older versions of IE) be treated as (almost) ordered associative arrays. This helps keep the page contents consistent, but further guarantees could be made at the sacrifice of efficiency if desired.
