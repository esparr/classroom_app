# API Reference

Base URL: `http://localhost:8000/api/`

All endpoints except `POST /auth/login/` and `POST /auth/refresh/` require a JWT access token:

```
Authorization: Bearer <access_token>
```

### Roles

- **instructor** — manage sessions, attendance, and student notes
- **admin** — all instructor permissions plus deactivate students and view the dashboard

---

## User Management

Users cannot be created through the API. New users must be created through the Django admin panel at `http://localhost:8000/admin/`.

### Creating a user

1. Log into the admin panel with a superuser account
2. Go to **Authentication and Authorization → Users → Add User**
3. Set a username and password, then save

### Assigning a role

Every user needs a `UserProfile` to log in via the API — without one, `role` will be `null` and the user will be denied access to protected endpoints.

1. Go to **Classroom → User Profiles → Add User Profile**
2. Select the user and assign a role: `instructor` or `admin`
3. Save

---

## Auth

### `POST /auth/login/`

Returns access and refresh tokens.

**Request**
```json
{
  "username": "instructor1",
  "password": "secret"
}
```

**Response**
```json
{
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>",
  "role": "instructor"
}
```

---

### `POST /auth/refresh/`

Returns a new access token from a valid refresh token.

**Request**
```json
{
  "refresh": "<jwt_refresh_token>"
}
```

**Response**
```json
{
  "access": "<jwt_access_token>"
}
```

---

### `GET /auth/me/`

Returns the current authenticated user.

**Response**
```json
{
  "id": 1,
  "username": "instructor1",
  "role": "instructor"
}
```

---

## Sessions

> Requires `instructor` or `admin` role.

### `GET /sessions/`

Returns all sessions ordered by most recent first.

**Response**
```json
[
  {
    "id": 1,
    "created_by": 1,
    "started_at": "2026-06-01T10:00:00Z",
    "ended_at": "2026-06-01T11:00:00Z",
    "description": "Week 1",
    "attendance_count": 18
  }
]
```

---

### `POST /sessions/create/`

Creates a new session.

**Request**
```json
{
  "description": "Week 2"
}
```

**Response** — `201 Created`
```json
{
  "id": 2,
  "created_by": 1,
  "started_at": "2026-06-06T09:00:00Z",
  "ended_at": null,
  "description": "Week 2",
  "attendance_count": 0
}
```

---

### `PATCH /sessions/<session_id>/close/`

Closes an open session. Only the instructor who created it (or an admin) can close it.

**Response**
```json
{
  "id": 2,
  "created_by": 1,
  "started_at": "2026-06-06T09:00:00Z",
  "ended_at": "2026-06-06T10:00:00Z",
  "description": "Week 2",
  "attendance_count": 20
}
```

---

## Attendance

> Requires `instructor` or `admin` role.

### `GET /sessions/<session_id>/attendance/`

Returns all attendance records for a session.

**Response**
```json
[
  {
    "id": 1,
    "student_name": "Jane Smith",
    "status": "present",
    "recorded_by_username": "instructor1"
  }
]
```

---

### `POST /sessions/<session_id>/attendance/bulk/`

Submits a list of student names for a session. Names are fuzzy-matched against the active roster — close matches are recorded as present, unrecognized names are created as new students.

**Request**
```json
{
  "names": ["Jane Smith", "Jon Doe", "Maria Garcia"]
}
```

**Response** — `201 Created`
```json
{
  "matched": ["Jane Smith", "Maria Garcia"],
  "created": ["Jon Doe"],
  "attendance": [
    {
      "id": 1,
      "student_name": "Jane Smith",
      "status": "present",
      "recorded_by_username": "instructor1"
    }
  ]
}
```

---

## Students

> Requires `instructor` or `admin` role unless noted.

### `GET /students/`

Returns all active students. Optionally filter by name.

**Query params**

| Param | Description |
|---|---|
| `search` | Case-insensitive name filter |

**Response**
```json
[
  {
    "id": 1,
    "name": "Jane Smith",
    "is_active": true,
    "created_at": "2026-05-01T08:00:00Z",
    "created_by": 1,
    "total_sessions_attended": 8
  }
]
```

---

### `GET /students/<student_id>/`

Returns student detail with an attendance summary.

**Response**
```json
{
  "id": 1,
  "name": "Jane Smith",
  "is_active": true,
  "created_at": "2026-05-01T08:00:00Z",
  "created_by": 1,
  "total_sessions_attended": 8,
  "attendance_summary": {
    "total_sessions": 10,
    "sessions_present": 8,
    "attendance_percentage": 80.0
  }
}
```

---

### `GET /students/<student_id>/note/`

Returns the current instructor's private note for a student. Notes are per-instructor — each instructor only sees their own.

**Response**
```json
{
  "content": "Struggles with early sessions, excels when present.",
  "updated_at": "2026-06-01T12:00:00Z"
}
```

Returns `{ "content": "", "updated_at": null }` if no note exists yet.

---

### `PATCH /students/<student_id>/note/update/`

Creates or updates the current instructor's note for a student.

**Request**
```json
{
  "content": "Updated note content."
}
```

**Response**
```json
{
  "content": "Updated note content.",
  "updated_at": "2026-06-06T09:30:00Z"
}
```

---

### `GET /students/<student_id>/attendance/`

Returns the student's full attendance history ordered by session date.

**Response**
```json
[
  {
    "session_id": 1,
    "started_at": "2026-05-01T10:00:00Z",
    "status": "present"
  },
  {
    "session_id": 2,
    "started_at": "2026-05-08T10:00:00Z",
    "status": "absent"
  }
]
```

---

### `PATCH /students/<student_id>/deactivate/`

Deactivates a student, removing them from the active roster.

> Requires `admin` role.

**Response**
```json
{
  "id": 1,
  "name": "Jane Smith",
  "is_active": false,
  "created_at": "2026-05-01T08:00:00Z",
  "created_by": 1,
  "total_sessions_attended": 8
}
```

---

### `POST /students/<student_id>/summarize-note/`

Uses AI to summarize the current instructor's note for a student. Requires a non-empty note to exist.

**Response**
```json
{
  "summary": "Student shows strong engagement when present but has irregular attendance in early sessions.",
  "key_points": ["strong engagement", "irregular early attendance"]
}
```

---

### `GET /students/<student_id>/attendance-trend/`

Uses AI to analyze a student's attendance history and return a trend summary and concern level.

**Response**
```json
{
  "trend_summary": "Attendance has been declining over the past 4 sessions with 2 consecutive absences.",
  "concern_flag": "medium"
}
```

`concern_flag` is one of: `none`, `low`, `medium`, `high`.

---

## Admin

> Requires `admin` role.

### `GET /admin/dashboard/`

Returns aggregate stats for the admin dashboard.

**Response**
```json
{
  "total_sessions": 12,
  "total_students": 24,
  "top_attendees": [
    {
      "student__id": 1,
      "student__name": "Jane Smith",
      "sessions_attended": 11
    }
  ],
  "low_attendance_students": [
    {
      "id": 5,
      "name": "Bob Jones",
      "attendance_percentage": 41.7
    }
  ],
  "sessions_per_instructor": [
    {
      "created_by__id": 1,
      "created_by__username": "instructor1",
      "session_count": 8
    }
  ]
}
```

`low_attendance_students` includes only active students with at least one recorded session and attendance below 50%.
