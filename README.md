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

### 1. Create the PostgreSQL database

Make sure PostgreSQL is running:
```brew services list```

# you should see this output
Name          Status  User         File
postgresql@15 started yourusername ~/Library/LaunchAgents/homebrew.mxcl.postgresql@15.plist

If it isn't, start it with:

```bash
# macOS (Homebrew)
brew services start postgresql@<version>

# Linux
sudo systemctl start postgresql
```

Then:

```bash
createuser -dP your_db_user
createdb -U your_db_user classroom_db
```

`-d` grants the user permission to create databases (needed for the test suite), and `-P` will prompt you to set a password.

To check if the database was created, run:
```psql -l```

You should see a list of all of your postgres databases with their users and other details. 

Here is a reference sheet for postgres commands: https://quickref.me/postgres

### 2. Install dependencies and configure environment

```bash
cd backend

# Install dependencies
pipenv install

# Copy env template and fill in your values
cp .env.example .env
```

Set `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env` to match what you created above.

### 3. Run migrations

```bash
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

## LLM Configuration

DSPy is used for AI features such as fuzzy name matching, note summarization, and attendance trend analysis. You can configure it to use a cloud provider or a local model by setting the following variables in `.env`.

### Cloud (default)

```bash
DSPY_MODEL=anthropic/claude-haiku-4-5-20251001
DSPY_API_KEY=your_api_key
```

Any DSPy-compatible model string works (e.g. `openai/gpt-4o-mini`, `anthropic/claude-haiku-4-5-20251001`).

### Local — Ollama

See the [Ollama docs](https://ollama.com) for installation and setup. Once running, set:

```bash
DSPY_MODEL=openai/llama3.2
DSPY_API_BASE=http://localhost:11434/v1
```

### Local — MLX (Apple Silicon)

See the [mlx-lm docs](https://github.com/ml-explore/mlx-lm) for installation and setup. Start an MLX server with `mlx_lm.server --model <model>`, then set:

```bash
DSPY_MODEL=openai/<your-mlx-model-name>
DSPY_MLX_BASE_URL=http://localhost:8080/v1
```

If multiple options are configured, priority order is: **MLX → Ollama → Cloud**.

> **Note:** Local models keep student data (names and instructor notes) entirely on-premise. Cloud models send this data to an external API.

---

## Security

> **Never commit `.env` to version control.** It is listed in `.gitignore` — keep it that way.

Before any deployment:

- Generate a new `SECRET_KEY` — use `python -c "import secrets; print(secrets.token_urlsafe(50))"` and replace the placeholder value.
- Rotate `DSPY_API_KEY` — generate a fresh key from your AI provider and revoke the old one.
- Set `DEBUG=False` in production.
- Restrict `ALLOWED_HOSTS` to your actual domain.

If a secret is ever accidentally committed, treat it as compromised: revoke it immediately and generate a new one before continuing.
