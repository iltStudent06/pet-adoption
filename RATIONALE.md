# Your Mongoose schema design decisions: why you chose those fields, validation rules, and relationships 

## Fields:

User is intentionally minimal (name, email, password, role) so identity/auth concerns stay separate from adoption domain data; role (applicant vs staff) supports authorization decisions without extra join tables.

Pet captures the adoption listing (name, species, breed, age, size, status, description, optional photoUrl) so shelters can represent both searchable traits and workflow state (available, pending, adopted) in one document.

AdoptionApplication models the interaction between a person and a pet (applicant, pet, status, message), which keeps the application lifecycle independent from the pet lifecycle while still linking both.

## Validation rules:

Required fields and length checks enforce completeness and basic data quality at write time (for example, meaningful names/descriptions and valid message length).

Enum constraints are used where the domain has finite states (role, species, size, status) to prevent invalid values and simplify downstream logic.

Custom validators handle business-specific constraints (for example, message content rules), while URL/email pattern checks ensure consistently shaped contact/media fields.

Unique and compound indexes enforce invariants at the database level (for example, one application per applicant + pet pair), which is safer than relying only on application code.

## Relationships:

ObjectId references (Pet.createdBy -> User, AdoptionApplication.applicant -> User, AdoptionApplication.pet -> Pet) keep documents focused while preserving relational links.

Population is used at read time to return useful related data (pet details with creator/applicant info) without denormalizing everything into each document.

This balance (normalized references + selective populate) keeps writes simpler, avoids duplication drift, and still supports rich API responses.

# How you implemented query features (filtering, sorting, pagination) and the trade-offs involved 

I implemented query features on the pets listing endpoint by building the Mongo query dynamically from request query parameters.

Filtering: The handler reads optional params like species, breed, size, status, minAge, and maxAge, then constructs a filter object only with fields the client provided. Exact matches are used for enum-like values, and a case-insensitive regex is used for breed search.

Sorting: The endpoint supports one or more sort fields via a comma-separated sortBy value, plus a single order value (asc/desc). That gets converted into a Mongoose sort object and applied before pagination.

Pagination: It accepts page and limit, normalizes them to safe numeric bounds, computes skip = (page - 1) \* limit, then applies skip + limit. It also returns pagination metadata (total, page, limit, pages) to make client-side navigation straightforward.

Trade-offs involved are:

Flexible querying vs strict safety: Dynamic query construction is flexible and easy for clients, but requires careful validation/whitelisting to avoid invalid or expensive query patterns.

Single global order vs per-field direction: One order parameter keeps API design simple, but limits advanced use cases where users want mixed sort directions across fields.

# Your authentication approach and how you protect routes 

The project uses a token-based authentication flow with role-aware authorization:

Registration and password storage: On register, a User is created with name, email, password, and optional role. Passwords are never stored in plain text—User model middleware hashes them with bcrypt before save.

Login and token issuance: On login, the API loads the user (including hashed password), verifies the provided password with bcrypt, and issues a signed JWT containing userId, email, and role.

Auth middleware (who are you?): Protected endpoints use an auth middleware that expects Authorization: Bearer <token>. It verifies the JWT and attaches the decoded identity to req.user. Missing/invalid/expired tokens return 401.

Role middleware (what can you do?): A requireRole(...) middleware enforces role-based access. For example, staff-only pet management endpoints require staff, while application submission requires applicant.

Ownership checks (is it yours?): Some actions also enforce record ownership in controllers (for example, only the applicant who created an adoption application can withdraw it), adding object-level protection beyond role checks.

Route protection pattern: Routes compose middleware in layers—auth first, then requireRole where needed, then validators—so only authenticated/authorized requests reach business logic.

Authentication is JWT + bcrypt, authorization is role-based + ownership-based, and protection is applied consistently at route and controller levels.

# NoSQL vs. relational: when would you choose MongoDB and when would you choose a relational database? 

I would choose MongoDB when a data model is evolving, document-shaped, or read patterns benefit from flexible schemas and nested objects. MongoDB is a great fit for rapidly changing product requirements and heterogeneous records and useful for storing related data together in documents (fewer joins).

I would choose a relational database when consistency rules and relationships are central to the domain. A relational database is better for strict schemas, normalized data, and complex multi-table joins.
