# Write-up

## 1. What did you build for Part B, and why that?

I built a visit tracking feature, which allows Brennen to log his visit. He put in a restaurant, date, and amount spent and see his total spend and spending per day. While looking at the db, I saw the visits table already exists in the schema. Since this app is about Feeding Brennen, I believe being able to track his spending on a day by day basis is a crucial part of the app to see how much he has spend on dining.

## 2. What did you decide, and what did you rule out?

- `/api/visits/summary` uses
  `SUM`/`GROUP BY` rather than shipping every visit to the client and
  summing there
- `amountSpent` is required, even if it's 0. I originally let it be
  skipped, but that meant the total could be wrong if someone forgot
  to fill it in. Requiring a real number (even zero) keeps the total accurate.
- Didn't add a separate query to check "does this restaurant exist?" before
  logging a visit for it. The database already refuses a visit for a fake
  restaurant on its own (a foreign key constraint), so I just catch that
  error and turn it into a `400`. Fewer database round trips.
- Ruled out an edit endpoint (`PUT /api/visits/:id`). Can only delete and relog if there's a mistake. Edit is not needed at this point given the scope.
- Ruled out filtering/pagination on `GET /api/visits` (by restaurant, by
  date range). Not a lot of visits/data but would matter at scale or if Brennen goes out a lot.

## 3. Where did you cut corners?

- There's no loading state for `/visits`, and it's in the same bar as the
  restaurants page
- No test suite - can be implemented later to ensure functionality works as intended

---

## Part B: routes

| Method and path         | What it does                                | Success               | Errors                                                            |
| ------------------------ | -------------------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| `GET /api/visits`        | List all visits, most recent date first      | `200` + JSON array     | -                                                                  |
| `POST /api/visits`       | Log a new visit                              | `201` + created visit  | `400` on invalid body (missing/invalid `restaurantId`, `date`, `amountSpent`, `notes`); `400` if `restaurantId` doesn't reference an existing restaurant |
| `DELETE /api/visits/:id` | Delete a visit                               | `204`, no body         | `404` if missing or `:id` isn't a positive integer                |
| `GET /api/visits/summary`| Spend total + breakdown by date   | `200` + summary object | -                                                                  |

**`POST /api/visits`**

```jsonc
// request
{
  "restaurantId": 1,
  "date": "2026-01-12",
  "amountSpent": 42.50,
  "notes": "Burger night with the crew."
}

// 201 response
{
  "id": 1,
  "restaurantId": 1,
  "date": "2026-01-12",
  "amountSpent": 42.5,
  "notes": "Burger night with the crew.",
  "createdAt": "2026-09-09T07:23:26.813Z"
}
```

**`GET /api/visits/summary`**

```jsonc
// 200 response
{
  "totalSpent": 202.25,
  "byDate": [
    { "date": "2026-09-01", "total": 40 },
    { "date": "2026-03-21", "total": 31.75 },
    { "date": "2026-02-03", "total": 88 },
    { "date": "2026-01-12", "total": 42.5 }
  ]
}
```

## Schema changes

None

## How I verified this

**Part A** - the contract table in CHALLENGE.md, every row including the error cases:

```bash
curl -i http://localhost:3000/api/restaurants                      # 200 + array
curl -i http://localhost:3000/api/restaurants/1                    # 200 + one restaurant
curl -i http://localhost:3000/api/restaurants/99999                # 404
curl -i http://localhost:3000/api/restaurants/abc                  # 404, not 500
curl -i http://localhost:3000/api/restaurants/-1                   # 404
curl -i http://localhost:3000/api/restaurants/1.5                  # 404

curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Valid Spot","cuisine":"Test","address":"2 Test St","rating":4.5}'  # 201

curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' -d '{"cuisine":"Test"}'      # 400, missing name

curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' -d '{"name":"Out Of Range","rating":6}'  # 400

curl -i -X POST http://localhost:3000/api/restaurants -d '{not json'  # 400, malformed JSON

curl -i -X PUT http://localhost:3000/api/restaurants/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Renamed","cuisine":"X","address":"Y","rating":2}'   # 200

curl -i -X PUT http://localhost:3000/api/restaurants/99999 \
  -H 'Content-Type: application/json' -d '{"name":"Nope"}'        # 404

curl -i -X DELETE http://localhost:3000/api/restaurants/99999      # 404
```

**Part B** - the equivalent cases for visits:

```bash
curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-09-01","amountSpent":25.50,"notes":"lunch"}'  # 201

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' -d '{"date":"2026-09-01","amountSpent":10}'  # 400, missing restaurantId

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":99999,"date":"2026-09-01","amountSpent":10}'  # 400, FK violation

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"not-a-date","amountSpent":10}'      # 400, invalid date

curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-09-01","amountSpent":-5}'      # 400, negative amount

curl -i http://localhost:3000/api/visits                            # 200 + array
curl -i http://localhost:3000/api/visits/summary                    # 200 + totals
curl -i -X DELETE http://localhost:3000/api/visits/4                # 204
curl -i -X DELETE http://localhost:3000/api/visits/99999            # 404
```

## Known issues

- No way to edit a logged visit (can only delete)
- No filtering (by restaurant, by date range) on `GET /api/visits` - with
  more than a handful of visits this list gets long fast

## What I'd do next
- Include an Add Restaurant button/form, because right now, you can only add one via curl or Postman. 
- Or use Yelp's or Google's API to get list of restaurants/perform search 
