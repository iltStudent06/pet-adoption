# Pet Adoption API

Express + MongoDB API for animal shelters to list pets for adoption and for users to submit adoption applications.

## Tech

- Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- express-validator request validation

## Setup

1. Install dependencies:
   - `npm install`
2. Create `.env` from `.env.example` and set values:
   - `PORT=5000`
   - `MONGODB_URI=mongodb://127.0.0.1:27017/pet-adoption`
   - `JWT_SECRET=your-strong-secret`
   - `JWT_EXPIRES_IN=1d`
3. Run API:
   - `npm run dev`

## Available Scripts

- `npm run dev` — start API in development mode (nodemon)
- `npm start` — start API with Node
- `npm run seed` — reset and seed sample users, pets, and applications
- `npm run seed:applications-only` — reset only sample applications and sync related pet statuses
- `npm run lint` — run ESLint checks
- `npm run lint:fix` — run ESLint with auto-fixes

## Seed Sample Data

- Run `npm run seed` to create sample users, pets, and adoption applications.
- The script replaces previously seeded sample records so reruns stay clean and deterministic.
- Run `npm run seed:applications-only` to reset only sample adoption applications (faster iteration).
- `seed:applications-only` expects baseline sample users/pets from `npm run seed`.
- Current seed output creates:
  - `npm run seed`: 3 users, 15 pets, 3 applications
  - `npm run seed:applications-only`: 10 applications for core sample pets
- Sample credentials:
  - `staff@example.com / Password123`
  - `applicant1@example.com / Password123`
  - `applicant2@example.com / Password123`

## Troubleshooting

- If startup fails with `JWT_SECRET is not defined in environment variables`, ensure `.env` exists and includes `JWT_SECRET`.
- If `seed:applications-only` fails with missing sample users/pets, run `npm run seed` first.

## Quick API Check (curl)

Use this sequence to verify auth + protected CRUD quickly.

1. Register a staff user:

```bash
curl -s -X POST http://localhost:5000/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{
      "name": "CLI Staff",
      "email": "cli-staff@example.com",
      "password": "Password123",
      "role": "staff"
   }'
```

2. Login and copy the `data.token` value:

```bash
curl -s -X POST http://localhost:5000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{
      "email": "cli-staff@example.com",
      "password": "Password123"
   }'
```

3. Create a pet with your token:

```bash
TOKEN="paste-token-here"

curl -s -X POST http://localhost:5000/api/pets \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer $TOKEN" \
   -d '{
      "name": "CLI Buddy",
      "species": "dog",
      "breed": "Mixed",
      "age": 2,
      "size": "medium",
      "status": "available",
      "description": "Friendly and energetic dog that enjoys playtime and daily walks."
   }'
```

4. List pets with query features:

```bash
curl -s "http://localhost:5000/api/pets?species=dog&status=available&sortBy=age,createdAt&order=asc&page=1&limit=5"
```

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT required)

### Pets (full CRUD)

- `GET /api/pets` (filtering + sorting + pagination)
- `GET /api/pets/:id` (single pet, populated `createdBy`)
- `POST /api/pets` (JWT required, `staff` only)
- `PUT /api/pets/:id` (JWT required, `staff` only)
- `DELETE /api/pets/:id` (JWT required, `staff` only)

### Applications

- `GET /api/applications` (JWT required; own applications, or all if `staff`)
- `POST /api/applications` (JWT required, `applicant` only)
- `PUT /api/applications/:id` (JWT required, `staff` only; approve/reject)
- `DELETE /api/applications/:id` (JWT required, own application only)

## Query Features (`GET /api/pets`)

Supported query params:

- Filtering: `species`, `breed`, `size`, `status`, `minAge`, `maxAge`
- Sorting: `sortBy` (single or comma-separated fields), `order` (`asc` or `desc`)
- Pagination: `page`, `limit`

Example:

- `/api/pets?species=dog&status=available&sortBy=age,createdAt&order=asc&page=1&limit=5`

## Error Handling

Centralized middleware returns consistent JSON error responses for:

- `400` validation errors (including Mongoose validation formatting)
- `401` unauthorized access
- `404` not found
- `500` server errors
