# REST API Plan

## 1. Resources

- **Users**
  - Based on the `users` table.
  - Fields: `id`, `nick`, `email`, `roles`.
  - Represents both Race Directors and Pilots. Filtering by role will be used for endpoint logic.

- **Messages**
  - Based on the `messages` table.
  - Fields: `id`, `content`, `sender_id`, `sent_at`.
  - Represents messages sent by Race Directors.

- **MessageRecipients**
  - Based on the `message_recipients` table.
  - Fields: `message_id`, `recipient_id`.
  - Implements a many-to-many relationship between messages and users (pilots).

- **Authentication**
  - Endpoints for login, logout and (if needed) registration utilizing Supabase authentication.

## 2. Endpoints

### Users Endpoints

1. **List Users / Pilots**
   - **Method:** GET
   - **URL:** `/users`
   - **Description:** Retrieve a list of users. For Race Directors, this can be filtered to show only pilots (e.g., by role).
   - **Query Parameters:** 
     - `role` (optional): e.g., `pilot` to list pilot accounts.
     - Pagination parameters: `page`, `limit`
   - **Response:**
     ```json
     {
       "users": [
         { "id": "<uuid>", "nick": "JohnDoe", "email": "john@example.com", "roles": "pilot" }
         // ...
       ],
       "page": 1,
       "limit": 10,
       "total": 50
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized, 500 Internal Server Error

2. **Get User Details**
   - **Method:** GET
   - **URL:** `/users/{id}`
   - **Description:** Retrieve details for a specific user.
   - **Response:**
     ```json
     { "id": "<uuid>", "nick": "JohnDoe", "email": "john@example.com", "roles": "pilot" }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 401 Unauthorized

3. **Create a User (Pilot Account)**
   - **Method:** POST
   - **URL:** `/users`
   - **Description:** Create a new user account. Intended for Race Directors to add pilots.
   - **Request Body:**
     ```json
     {
       "nick": "JaneDoe",
       "email": "jane@example.com",
       "roles": "pilot"
     }
     ```
   - **Response:**
     ```json
     { "id": "<uuid>", "nick": "JaneDoe", "email": "jane@example.com", "roles": "pilot" }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

4. **Update a User**
   - **Method:** PUT
   - **URL:** `/users/{id}`
   - **Description:** Update user details.
   - **Request Body (example):**
     ```json
     { "nick": "JaneUpdated", "email": "jane_new@example.com" }
     ```
   - **Response:** Updated user object.
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 404 Not Found, 401 Unauthorized

5. **Delete a User (Pilot Account)**
   - **Method:** DELETE
   - **URL:** `/users/{id}`
   - **Description:** Delete a user account. Race Directors can remove pilot accounts.
   - **Success Codes:** 204 No Content
   - **Error Codes:** 404 Not Found, 401 Unauthorized

### Messages Endpoints

1. **Create a Message**
   - **Method:** POST
   - **URL:** `/messages`
   - **Description:** Allows a Race Director to send a message to one or many pilots. Internally, a new message is created and corresponding entries in `message_recipients` are generated.
   - **Request Body:**
     ```json
     {
       "content": "Urgent update: Please check your equipment.",
       "recipient_ids": ["<pilot-uuid-1>", "<pilot-uuid-2>"],
       "sender_id": "<race-director-uuid>"
     }
     ```
   - **Response:**
     ```json
     {
       "id": "<message-uuid>",
       "content": "Urgent update: Please check your equipment.",
       "sender_id": "<race-director-uuid>",
       "sent_at": "2023-10-05T12:34:56Z",
       "recipients": ["<pilot-uuid-1>", "<pilot-uuid-2>"]
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

2. **List Messages for a Pilot**
   - **Method:** GET
   - **URL:** `/messages`
   - **Description:** Retrieve messages addressed to the authenticated pilot. The endpoint will filter messages based on the pilot's `id` from the token and limit the result to the 5 most recent notifications by default.
   - **Query Parameters:**
     - `limit`: (optional, default 5)
     - `page`: (optional for pagination)
     - `sort`: (e.g., `sent_at:desc`)
   - **Response:**
     ```json
     {
       "messages": [
         {
           "id": "<message-uuid>",
           "content": "Urgent update...",
           "sender_id": "<race-director-uuid>",
           "sent_at": "2023-10-05T12:34:56Z"
         }
         // ... up to 5 messages
       ],
       "page": 1,
       "limit": 5,
       "total": 20
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized, 500 Internal Server Error

3. **Get Message Details**
   - **Method:** GET
   - **URL:** `/messages/{id}`
   - **Description:** Retrieve detailed information about a specific message, including its recipients if necessary.
   - **Response:**
     ```json
     {
       "id": "<message-uuid>",
       "content": "Urgent update...",
       "sender_id": "<race-director-uuid>",
       "sent_at": "2023-10-05T12:34:56Z",
       "recipients": ["<pilot-uuid-1>", "<pilot-uuid-2>"]
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 401 Unauthorized

### Authentication Endpoints

1. **User Login**
   - **Method:** POST
   - **URL:** `/auth/login`
   - **Description:** Authenticate a user (Race Director or Pilot) and return a token.
   - **Request Body:**
     ```json
     { "email": "user@example.com", "password": "securepassword" }
     ```
   - **Response:**
     ```json
     { "token": "<JWT-token>", "user": { "id": "<uuid>", "nick": "UserNick", "roles": "pilot" } }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized, 400 Bad Request

2. **User Logout**
   - **Method:** POST
   - **URL:** `/auth/logout`
   - **Description:** Invalidate the user's session/token.
   - **Success Codes:** 204 No Content
   - **Error Codes:** 401 Unauthorized

## 3. Authentication and Authorization

- **Mechanism:** Utilize token-based authentication (JWT) integrated with Supabase. Tokens will carry user role information (e.g., Race Director vs Pilot) for RBAC.
- **Authorization:** 
  - Endpoints for sending messages and managing users require the authenticated user to have the Race Director role.
  - Endpoints for viewing messages require the user to be a Pilot.
- **Security Measures:** 
  - Enforce HTTPS for all communications.
  - Implement rate limiting, especially on endpoints that are polled frequently (e.g., GET /messages for pilots).
  - Input validation using schemas (e.g., via Zod) and proper error handling.

## 4. Validation and Business Logic

- **Validation Rules:**
  - All required fields (e.g., `content`, `sender_id` in messages; `nick`, `roles` in users) must be provided and non-null.
  - Message bodies should not be empty, and recipient lists must contain valid user IDs.
  - Data types must conform to the database schema (e.g., UUID for `id` fields).

- **Business Logic Mapping:**
  - **Message Sending:**
    - When a Race Director sends a message, create a new record in the `messages` table with a timestamp. Simultaneously, create one or more records in the `message_recipients` table linking the message with the selected pilot IDs.
  - **Listing Notifications (Pilot):**
    - Endpoint provides the most recent 5 messages targeting the pilot. Supports pagination and sorting by `sent_at` descending.
  - **User Management:**
    - Race Directors can add or remove pilot accounts using the provided endpoints. Validations ensure that emails and roles are correctly assigned.

- **Additional Considerations:**
  - **Error Handling:** Return clear error messages for validation failures, unauthorized access, and unexpected system errors.
  - **Performance:** Indexes on key fields (`sent_at`, `sender_id`, `recipient_id`) are leveraged in database queries to ensure efficient retrieval and sorting.
  - **Transactional Integrity:** Message creation (inserting into `messages` and `message_recipients`) should be handled within a transaction to maintain data consistency.

---

This API plan is aligned with the provided database schema, product requirements, and the selected tech stack. All endpoints are designed for clarity, security, and efficient data handling consistent with the project's needs. 