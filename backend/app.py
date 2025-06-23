import os
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

# Load configuration from .env
load_dotenv()
DB_PATH = os.environ.get("DB_PATH", "/db/app.db")

app = Flask(__name__, static_folder="../frontend", static_url_path="")

# Ensure DB directory exists and initialize tables
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, action TEXT, timestamp TEXT)"
        )
        conn.execute(
            "CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, content TEXT, timestamp TEXT)"
        )

init_db()

USER = "test-user"

@app.route("/")
def index():
    # Serve the frontend index.html
    return send_from_directory(app.static_folder, "index.html")

@app.route("/attendance/clock-in", methods=["POST"])
def clock_in():
    ts = datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO attendance (user, action, timestamp) VALUES (?, 'in', ?)",
            (USER, ts),
        )
    return jsonify({"status": "success", "action": "clock-in", "timestamp": ts})

@app.route("/attendance/clock-out", methods=["POST"])
def clock_out():
    ts = datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO attendance (user, action, timestamp) VALUES (?, 'out', ?)",
            (USER, ts),
        )
    return jsonify({"status": "success", "action": "clock-out", "timestamp": ts})

@app.route("/report/", methods=["POST"])
def add_report():
    data = request.get_json() or {}
    content = data.get("content", "")
    ts = datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO reports (user, content, timestamp) VALUES (?, ?, ?)",
            (USER, content, ts),
        )
    return jsonify({"status": "success", "timestamp": ts})

@app.route("/reports", methods=["GET"])
def list_reports():
    with get_db() as conn:
        cur = conn.execute(
            "SELECT id, user, content, timestamp FROM reports ORDER BY id DESC"
        )
        rows = [dict(row) for row in cur.fetchall()]
    return jsonify(rows)

if __name__ == "__main__":
    port = int(os.environ.get("API_PORT", 5000))
    app.run(host="0.0.0.0", port=port)
