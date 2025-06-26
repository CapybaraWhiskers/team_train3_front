import os
import sqlite3
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from functools import wraps
from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory,
    session,
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load configuration from .env
load_dotenv()
DB_PATH = os.environ.get("DB_PATH", "/db/app.db")
SECRET_KEY = os.environ.get("SECRET_KEY", "demo-secret-key")

app = Flask(__name__, static_folder="../frontend", static_url_path="")
app.secret_key = SECRET_KEY

MESSAGES = {
    "ja": {
        "unauthorized": "認証されていません",
        "missing_fields": "未入力の項目があります",
        "email_exists": "メールアドレスは既に存在します",
        "invalid_credentials": "メールアドレスまたはパスワードが間違っています",
        "registered": "登録完了",
        "logged_in": "ログインしました",
        "logged_out": "ログアウトしました",
        "success": "成功",
        "clock_in": "出勤しました",
        "clock_out": "退勤しました",
    },
    "en": {
        "unauthorized": "unauthorized",
        "missing_fields": "missing fields",
        "email_exists": "email exists",
        "invalid_credentials": "invalid credentials",
        "registered": "registered",
        "logged_in": "logged in",
        "logged_out": "logged out",
        "success": "success",
        "clock_in": "clocked in",
        "clock_out": "clocked out",
    },
}


def get_lang():
    return request.accept_languages.best_match(["ja", "en"]) or "ja"


def t(key: str) -> str:
    lang = get_lang()
    return MESSAGES.get(lang, MESSAGES["ja"]).get(key, key)

# Ensure DB directory exists and initialize tables
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                password TEXT,
                name TEXT,
                role TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action TEXT,
                timestamp TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                content TEXT,
                timestamp TEXT
            )
            """
        )


init_db()


def column_exists(conn, table, column):
    cur = conn.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cur.fetchall())


def migrate_db():
    try:
        with get_db() as conn:
            conn.execute("BEGIN")
            if not column_exists(conn, "attendance", "user_id"):
                conn.execute(
                    "ALTER TABLE attendance ADD COLUMN user_id INTEGER DEFAULT 0"
                )

            if not column_exists(conn, "reports", "user_id"):
                conn.execute("ALTER TABLE reports ADD COLUMN user_id INTEGER DEFAULT 0")

            if not column_exists(conn, "users", "name"):
                conn.execute("ALTER TABLE users ADD COLUMN name TEXT DEFAULT ''")

            if not column_exists(conn, "users", "role"):
                conn.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT ''")
            conn.execute("COMMIT")
    except Exception as e:
        print(f"[migrate_db error] {e}")
        try:
            conn.execute("ROLLBACK")
        except Exception:
            pass


migrate_db()


def require_login(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": t("unauthorized")}), 401
        return f(*args, **kwargs)

    return wrapper


@app.route("/")
def index():
    # Serve the login page
    return send_from_directory(app.static_folder, "login.html")


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    role = data.get("role")
    if not all([email, password, name, role]):
        return jsonify({"error": t("missing_fields")}), 400
    hashed = generate_password_hash(password)
    with get_db() as conn:
        try:
            conn.execute(
                "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
                (email, hashed, name, role),
            )
        except sqlite3.IntegrityError:
            return jsonify({"error": t("email_exists")}), 400
    return jsonify({"status": "registered", "message": t("registered")})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    with get_db() as conn:
        cur = conn.execute(
            "SELECT id, password, name, role FROM users WHERE email=?",
            (email,),
        )
        row = cur.fetchone()
    if row and check_password_hash(row["password"], password):
        session["user_id"] = row["id"]
        session["name"] = row["name"]
        session["role"] = row["role"]
        session["email"] = email
        return jsonify(
            {
                "status": "logged_in",
                "name": row["name"],
                "role": row["role"],
                "message": t("logged_in"),
            }
        )
    return jsonify({"error": t("invalid_credentials")}), 401


@app.route("/me", methods=["GET"])
@require_login
def me():
    return jsonify(
        {
            "id": session.get("user_id"),
            "name": session.get("name"),
            "role": session.get("role"),
        }
    )


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"status": "logged_out", "message": t("logged_out")})


@app.route("/attendance/clock-in", methods=["POST"])
@require_login
def clock_in():
    ts = datetime.now(ZoneInfo("Asia/Tokyo")).isoformat()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO attendance (user_id, action, timestamp) VALUES (?, 'in', ?)",
            (session["user_id"], ts),
        )
    return jsonify({
        "status": "success",
        "action": "clock-in",
        "timestamp": ts,
        "message": t("clock_in"),
    })


@app.route("/attendance/clock-out", methods=["POST"])
@require_login
def clock_out():
    ts = datetime.now(ZoneInfo("Asia/Tokyo")).isoformat()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO attendance (user_id, action, timestamp) VALUES (?, 'out', ?)",
            (session["user_id"], ts),
        )
    return jsonify({
        "status": "success",
        "action": "clock-out",
        "timestamp": ts,
        "message": t("clock_out"),
    })


@app.route("/attendance/today", methods=["GET"])
@require_login
def attendance_today():
    tz = ZoneInfo("Asia/Tokyo")
    now = datetime.now(tz)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    with get_db() as conn:
        cur = conn.execute(
            "SELECT action, timestamp FROM attendance WHERE user_id=? AND timestamp >= ? ORDER BY timestamp",
            (session["user_id"], start),
        )
        rows = [dict(row) for row in cur.fetchall()]

    last_in = None
    last_out = None
    current_in = None
    for r in rows:
        if r["action"] == "in":
            current_in = r["timestamp"]
        elif r["action"] == "out" and current_in:
            last_in = current_in
            last_out = r["timestamp"]
            current_in = None
    if current_in and not last_out:
        last_in = current_in

    return jsonify({"clock_in": last_in, "clock_out": last_out})


@app.route("/report/", methods=["POST"])
@require_login
def add_report():
    data = request.get_json() or {}
    content = data.get("content", "")
    ts = datetime.now(ZoneInfo("Asia/Tokyo")).isoformat()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO reports (user_id, content, timestamp) VALUES (?, ?, ?)",
            (session["user_id"], content, ts),
        )
    return jsonify({"status": "success", "timestamp": ts, "message": t("success")})


@app.route("/reports", methods=["GET"])
@require_login
def list_reports():
    with get_db() as conn:
        cur = conn.execute(
            "SELECT r.id, r.user_id, u.name, r.content, r.timestamp "
            "FROM reports r JOIN users u ON r.user_id = u.id "
            "ORDER BY r.id DESC"
        )
        rows = [dict(row) for row in cur.fetchall()]
    return jsonify(rows)


def _calculate_monthly_hours(records):
    records.sort(key=lambda r: r["timestamp"])
    day_logs = {}
    for r in records:
        ts = datetime.fromisoformat(r["timestamp"])
        day = ts.date()
        if day not in day_logs:
            day_logs[day] = {"in": None, "out": None}
        day_logs[day][r["action"]] = ts

    total = timedelta()
    for day, v in day_logs.items():
        if v["in"] and v["out"]:
            total += v["out"] - v["in"]
    hours = total.total_seconds() / 3600
    return hours


@app.route("/dashboard", methods=["GET"])
@require_login
def dashboard():
    tz = ZoneInfo("Asia/Tokyo")
    now = datetime.now(tz)
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    with get_db() as conn:
        if session.get("role") == "admin":
            cur = conn.execute(
                "SELECT a.user_id, u.name, a.action, a.timestamp FROM attendance a JOIN users u ON a.user_id = u.id WHERE a.timestamp >= ? ORDER BY a.user_id, a.timestamp",
                (start,),
            )
        else:
            cur = conn.execute(
                "SELECT a.user_id, u.name, a.action, a.timestamp FROM attendance a JOIN users u ON a.user_id = u.id WHERE a.user_id=? AND a.timestamp >= ? ORDER BY a.timestamp",
                (session["user_id"], start),
            )
        rows = [dict(row) for row in cur.fetchall()]

    records = []
    totals = {}
    day_map = {}
    for r in rows:
        ts = datetime.fromisoformat(r["timestamp"])
        key = (r["user_id"], ts.date())
        entry = day_map.setdefault(key, {"name": r["name"], "in": None, "out": None})
        entry[r["action"]] = ts

    for (uid, day), entry in day_map.items():
        if entry["in"] and entry["out"]:
            hours = (entry["out"] - entry["in"]).total_seconds() / 3600
            totals[entry["name"]] = totals.get(entry["name"], 0) + hours
            records.append(
                {
                    "name": entry["name"],
                    "clock_in": entry["in"].isoformat(),
                    "clock_out": entry["out"].isoformat(),
                    "hours": hours,
                }
            )

    records.sort(key=lambda r: r["clock_in"])
    return jsonify({"records": records, "totals": totals})


if __name__ == "__main__":
    port = int(os.environ.get("API_PORT", 5000))
    app.run(host="0.0.0.0", port=port)
