# Quick Notes API Documentation
## Folder Structure

```
Config/
 └── database.js       # MongoDB configuration
Middleware/
 ├── auth.js           # Authentication middleware
 └── upload.js         # File upload middleware
Models/
 ├── note.js           # Mongoose schema for notes
 └── user.js           # Mongoose schema for users
Routes/
 ├── auth.js           # Authentication-related routes
 └── note.js           # Note-related routes
Uploads/               # Uploaded files (auto-generated)
Utils/
 ├── email.js          # Email utility for notifications
 ├── password.js       # Password hashing and validation utilities
 └── token.js          # Token generation and validation utilities
.env                   # Environment variables
index.js               # Entry point of the application
package.json           # Project dependencies and scripts
package-lock.json      # Dependency lock file
readme.md              # Project documentation
```

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <repository_folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your own values.

4. Start the application:
   ```bash
   npm start
   ```

---

## Environment Variables
Define the following variables in the `.env` file:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/notes
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

---

## API Endpoints

### Authentication
- **POST /auth/register**
  - Register a new user.
- **POST /auth/login**
  - Log in a user.

### Notes
- **GET /notes**
  - Fetch all notes for the authenticated user.
- **POST /notes**
  - Create a new note with optional attachments.
- **GET /notes/:id**
  - Fetch a specific note by ID.
- **PATCH /notes/:id**
  - Update a note.
- **DELETE /notes/:id**
  - Delete a note.

### Search
- **GET /notes/search/:query**
  - Search notes by title or content.

### Attachments
- **POST /notes/:id/attachment**
  - Add an attachment to a specific note.


## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Token (JWT)
- **File Uploads:** Multer
- **Email Notifications:** Nodemailer

---

## Example Usage with Postman

### 1. Create a Note with Attachments
- **Endpoint:** `POST /notes`
- **Headers:**
  - `Authorization: Bearer <token>`
- **Body (Form-Data):**
  - `title` (Text)
  - `content` (Text)
  - `files` (File)

### 2. Search Notes
- **Endpoint:** `GET /notes/search/:query`
- **Headers:**
  - `Authorization: Bearer <token>`
  ```

