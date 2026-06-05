# Classroom Attendance App

A web application for tracking class attendance. Django REST API backend with a React + Vite frontend.

---

## Prerequisites

- **Python 3.12+** — [python.org](https://www.python.org/)
- **Node.js 26+** — [nodejs.org](https://nodejs.org/)
- **PostgreSQL** — [postgresql.org](https://www.postgresql.org/)
- **pipenv** — `pip install pipenv` or `brew install pipenv`

---

## Backend Setup

```bash
cd backend

# Install dependencies
pipenv install

# Copy env template and fill in your values
cp .env.example .env

# Apply migrations
pipenv run python manage.py migrate

# Create a superuser (optional)
pipenv run python manage.py createsuperuser
```

> **Note — pipenv inside a virtual environment:** If you already have a Python virtual environment active (e.g. via pyenv), pipenv will use it instead of creating its own. Prefix all `pipenv run` commands with `PIPENV_IGNORE_VIRTUALENVS=1` to force pipenv to use the project's dedicated virtualenv:
>
> ```bash
> PIPENV_IGNORE_VIRTUALENVS=1 pipenv run python manage.py migrate
> ```
>
> To avoid typing this every time, add the following to your shell profile (`.zshrc`, `.bashrc`, etc.):
>
> ```bash
> export PIPENV_IGNORE_VIRTUALENVS=1
> ```

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

---

## Running the Servers

**Backend** (from `backend/`):

```bash
pipenv run python manage.py runserver
```

API available at `http://localhost:8000/api/`

**Frontend** (from `frontend/`):

```bash
npm run dev
```

App available at `http://localhost:5173/`

---

## Security

> **Never commit `.env` to version control.** It is listed in `.gitignore` — keep it that way.

Before any deployment:

- Generate a new `SECRET_KEY` — use `python -c "import secrets; print(secrets.token_urlsafe(50))"` and replace the placeholder value.
- Rotate `DSPY_API_KEY` — generate a fresh key from your AI provider and revoke the old one.
- Set `DEBUG=False` in production.
- Restrict `ALLOWED_HOSTS` to your actual domain.

If a secret is ever accidentally committed, treat it as compromised: revoke it immediately and generate a new one before continuing.
