from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import hashlib
import os
import httpx

app = FastAPI(title="VTC-SAS Local API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

users = {}
sessions = {}

class LoginInput(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str

class RegisterInput(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str | None = None
    student_id: str | None = None
    class_name: str | None = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class ChatInput(BaseModel):
    question: str
    provider: str = "local"

courses = [
    {"id": "course-1", "code": "IT114115", "name": "Cloud Computing and Security Fundamentals", "scheduleDay": "Monday", "startTime": "09:00", "endTime": "11:00", "instructor": "VTC Lecturer", "room": "B1203"},
]
assignments = []
attendance = []
reminders = []


def password_hash(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization[7:].strip()
    email = sessions.get(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return users[email]


def login_user(email: str, role: str):
    user = users.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = hashlib.sha256(f"{email}:{role}:session".encode()).hexdigest()
    sessions[token] = email
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/")
def root():
    return {"status": "ok", "service": "VTC-SAS Local API"}

@app.post("/api/v1/students/login")
def student_login(data: LoginInput):
    email = str(data.email or "")
    user = users.get(email)
    if not user or user["role"] != "user" or user["password_hash"] != password_hash(data.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return login_user(email, "student")

@app.post("/api/v1/staff/login")
def staff_login(data: LoginInput):
    email = str(data.email or "")
    user = users.get(email)
    if not user or user["role"] != "admin" or user["password_hash"] != password_hash(data.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return login_user(email, "staff")

@app.post("/api/v1/students/register")
def student_register(data: RegisterInput):
    email = str(data.email)
    if email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    users[email] = {"email": email, "username": data.username, "full_name": data.full_name or data.username, "role": "user", "student_id": data.student_id or data.username, "class_name": data.class_name or "IT114115", "password_hash": password_hash(data.password)}
    return {"ok": True, "user": {k: v for k, v in users[email].items() if k != "password_hash"}}

@app.post("/api/v1/staff/register")
def staff_register(data: RegisterInput):
    email = str(data.email)
    if email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    users[email] = {"email": email, "username": data.username, "full_name": data.full_name or data.username, "role": "admin", "password_hash": password_hash(data.password)}
    return {"ok": True, "user": {k: v for k, v in users[email].items() if k != "password_hash"}}

@app.get("/api/v1/students/me")
def student_me(user=Depends(current_user)):
    return {k: v for k, v in user.items() if k != "password_hash"}

@app.get("/api/v1/staff/me")
def staff_me(user=Depends(current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Teacher access required")
    return {k: v for k, v in user.items() if k != "password_hash"}

@app.post("/api/v1/auth/forgot-password")
def forgot_password(data: PasswordResetRequest):
    return {"ok": True}

@app.post("/api/v1/auth/reset-password")
def reset_password(data: PasswordReset):
    for email, user in users.items():
        if sessions.get(data.token) == email:
            user["password_hash"] = password_hash(data.new_password)
            sessions.pop(data.token, None)
            return {"ok": True}
    raise HTTPException(status_code=400, detail="Invalid or expired reset token")

@app.get("/api/v1/courses")
def get_courses():
    return courses

@app.get("/api/v1/assignments")
def get_assignments():
    return assignments

@app.get("/api/v1/attendance")
def get_attendance():
    return attendance

@app.get("/api/v1/reminders")
def get_reminders():
    return reminders

@app.get("/api/v1/users")
def get_users():
    return [{k: v for k, v in item.items() if k != "password_hash"} for item in users.values()]

@app.post("/api/v1/ai/chat")
async def ai_chat(data: ChatInput):
    question = data.question.strip()
    provider = data.provider.lower()

    if provider == "local":
        lowered = question.lower()
        if "assignment" in lowered or "due" in lowered or "deadline" in lowered:
            if not assignments:
                text = "No outstanding assignments right now 🎉"
                return {"answer": text, "provider": "local"}
            lines = "\n".join(f"• {item['title']} ({item['courseCode']}) — due {item.get('due', 'TBC')}" for item in assignments[:3])
            return {"answer": f"Upcoming assignments:\n{lines}", "provider": "local"}
        if "attendance" in lowered or "present" in lowered:
            total = len(attendance)
            present = sum(1 for item in attendance if item.get("status") == "Present")
            rate = round(present * 100 / total) if total else 0
            text = f"This semester's attendance rate is {rate}% (present {present} / {total} sessions)."
            return {"answer": text, "provider": "local"}
        if "course" in lowered or "class" in lowered or "schedule" in lowered:
            lines = "\n".join(f"• {item['name']} ({item['code']}) — {item['scheduleDay']} {item['startTime']}–{item['endTime']}" for item in courses)
            return {"answer": f"This week's courses:\n{lines}", "provider": "local"}
        text = "You can ask me about assignments due, course schedules, or attendance rate."
        return {"answer": text, "provider": "local"}

    provider_config = {
        "gemini": (os.getenv("GEMINI_API_KEY"), "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", os.getenv("GEMINI_MODEL", "gemini-2.5-flash")),
        "deepseek": (os.getenv("DEEPSEEK_API_KEY"), "https://api.deepseek.com/chat/completions", os.getenv("DEEPSEEK_MODEL", "deepseek-chat")),
        "grok": (os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY"), "https://api.x.ai/v1/chat/completions", os.getenv("GROK_MODEL", "grok-3-mini")),
    }

    if provider not in provider_config:
        raise HTTPException(status_code=400, detail="Unknown AI provider")

    api_key, endpoint, model = provider_config[provider]
    if not api_key:
        raise HTTPException(status_code=503, detail=f"{provider.title()} API key is not configured")

    context_lines = [
        "You are the VTC-SAS study assistant.",
        "Answer concisely using the student's supplied academic context.",
        "[Courses]",
        *[f"- {item['name']} ({item['code']}), {item.get('scheduleDay', '')} {item.get('startTime', '')}-{item.get('endTime', '')}" for item in courses],
        "[Assignments]",
        *[f"- {item.get('title', '')} ({item.get('courseCode', '')}), due {item.get('due', '')}, status {item.get('status', '')}" for item in assignments],
        "[Attendance]",
        f"- {len(attendance)} sessions",
    ]

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "\n".join(context_lines)},
            {"role": "user", "content": question},
        ],
        "temperature": 0.3,
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(endpoint, headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}, json=payload)
            response.raise_for_status()
            result = response.json()
        text = result["choices"][0]["message"]["content"]
        return {"answer": text, "provider": provider}
    except httpx.HTTPStatusError as error:
        detail = error.response.text[:500]
        raise HTTPException(status_code=502, detail=f"{provider.title()} request failed: {detail}")
    except Exception:
        raise HTTPException(status_code=502, detail=f"Could not reach {provider.title()}")
