"""End-to-end backend tests for Govt School Exam Platform."""
import os
import time
import uuid
import pytest
import requests

# Use public preview URL for testing what user sees
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL') or os.environ.get('EXPO_BACKEND_URL')
if not BASE_URL:
    # Fallback: read from frontend .env directly
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                BASE_URL = line.split('=', 1)[1].strip().strip('"')
                break
BASE_URL = BASE_URL.rstrip('/')
API = f"{BASE_URL}/api"

# Shared state across tests (run sequentially)
STATE = {}


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ── Health ──
def test_01_health(session):
    r = session.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j.get("ok") is True
    assert "Govt School" in j.get("message", "")


# ── Admin auth ──
def test_02_admin_login_wrong_password(session):
    r = session.post(f"{API}/admin/login", json={"password": "wrong"}, timeout=15)
    assert r.status_code == 401


def test_03_admin_login_success(session):
    r = session.post(f"{API}/admin/login", json={"password": "admin123"}, timeout=15)
    assert r.status_code == 200
    assert r.json().get("ok") is True


# ── Teacher CRUD ──
def test_04_create_teacher(session):
    payload = {"name": "TEST_Teacher", "subject": "Science", "password": "teacher123"}
    r = session.post(f"{API}/admin/teachers", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    t = r.json()
    assert t["name"] == "TEST_Teacher"
    assert t["subject"] == "Science"
    assert t["active"] is True
    assert t["id"].startswith("T")
    STATE["teacher_id"] = t["id"]


def test_05_list_teachers_contains(session):
    r = session.get(f"{API}/admin/teachers", timeout=15)
    assert r.status_code == 200
    ids = [t["id"] for t in r.json()]
    assert STATE["teacher_id"] in ids


def test_06_update_teacher(session):
    tid = STATE["teacher_id"]
    r = session.put(
        f"{API}/admin/teachers/{tid}",
        json={"name": "TEST_Teacher2", "subject": "Math", "password": "teacher123"},
        timeout=15,
    )
    assert r.status_code == 200
    # verify via list
    r2 = session.get(f"{API}/admin/teachers", timeout=15)
    teacher = next(t for t in r2.json() if t["id"] == tid)
    assert teacher["name"] == "TEST_Teacher2"
    assert teacher["subject"] == "Math"
    # restore name/subject for downstream tests
    session.put(
        f"{API}/admin/teachers/{tid}",
        json={"name": "TEST_Teacher", "subject": "Science", "password": "teacher123"},
        timeout=15,
    )


def test_07_toggle_disables_teacher(session):
    tid = STATE["teacher_id"]
    r = session.post(f"{API}/admin/teachers/{tid}/toggle", timeout=15)
    assert r.status_code == 200
    assert r.json()["active"] is False

    # Disabled teacher cannot login
    r2 = session.post(f"{API}/teacher/login", json={"teacher_id": tid, "password": "teacher123"}, timeout=15)
    assert r2.status_code == 403

    # Re-enable
    r3 = session.post(f"{API}/admin/teachers/{tid}/toggle", timeout=15)
    assert r3.status_code == 200
    assert r3.json()["active"] is True


# ── Teacher login ──
def test_08_teacher_login_wrong_password(session):
    tid = STATE["teacher_id"]
    r = session.post(f"{API}/teacher/login", json={"teacher_id": tid, "password": "wrong"}, timeout=15)
    assert r.status_code == 401


def test_09_teacher_login_success(session):
    tid = STATE["teacher_id"]
    r = session.post(f"{API}/teacher/login", json={"teacher_id": tid, "password": "teacher123"}, timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j["id"] == tid
    assert j["name"] == "TEST_Teacher"
    assert j["subject"] == "Science"


# ── LLM generate ──
def test_10_teacher_generate_questions(session):
    tid = STATE["teacher_id"]
    lesson = (
        "The water cycle has three main stages. Evaporation is when the sun heats water "
        "in oceans and lakes, turning it into vapor. Condensation occurs when vapor cools "
        "and forms clouds. Precipitation is when water falls back as rain or snow."
    )
    payload = {
        "teacher_id": tid,
        "lesson_text": lesson,
        "count": 5,
        "test_class": "Class 5",
        "subject": "Science",
    }
    r = session.post(f"{API}/teacher/generate", json=payload, timeout=90)
    assert r.status_code == 200, r.text
    at = r.json()
    qs = at.get("questions", [])
    assert len(qs) >= 3, f"Expected at least 3 questions, got {len(qs)}"
    # Validate structure
    for q in qs:
        assert "q" in q and isinstance(q["q"], str) and q["q"]
        assert "options" in q and isinstance(q["options"], list) and len(q["options"]) >= 2
        assert "answer" in q and isinstance(q["answer"], int)
        assert 0 <= q["answer"] < len(q["options"])
    assert at["test_class"] == "Class 5"
    assert at["subject"] == "Science"
    assert at["test_active"] is False
    STATE["questions"] = qs


# ── Activate ──
def test_11_activate_test(session):
    tid = STATE["teacher_id"]
    code = "abc" + str(uuid.uuid4())[:3]
    r = session.post(f"{API}/teacher/activate", json={"teacher_id": tid, "join_code": code}, timeout=15)
    assert r.status_code == 200
    at = r.json()
    assert at["join_code"] == code.upper()
    assert at["test_active"] is True
    STATE["join_code"] = code.upper()


# ── Student find-test ──
def test_12_student_find_test_class_mismatch(session):
    r = session.post(
        f"{API}/student/find-test",
        json={"join_code": STATE["join_code"], "student_name": "TEST_Anjali", "student_class": "Class 6"},
        timeout=15,
    )
    assert r.status_code == 400
    assert "Class 5" in r.json().get("detail", "")


def test_13_student_find_test_no_answers(session):
    r = session.post(
        f"{API}/student/find-test",
        json={"join_code": STATE["join_code"], "student_name": "TEST_Anjali", "student_class": "Class 5"},
        timeout=15,
    )
    assert r.status_code == 200
    j = r.json()
    assert j["test_active"] is True
    assert j["already_attempted"] is False
    # answers must NOT be exposed before reveal
    for q in j["questions"]:
        assert "answer" not in q, "answer field must not be present in pre-submission response"


# ── Student submit ──
def test_14_student_submit(session):
    tid = STATE["teacher_id"]
    qs = STATE["questions"]
    # Submit all correct except first wrong, to validate scoring math
    answers = {}
    for i, q in enumerate(qs):
        if i == 0:
            answers[str(i)] = (q["answer"] + 1) % len(q["options"])
        else:
            answers[str(i)] = q["answer"]
    payload = {
        "student_name": "TEST_Anjali",
        "student_class": "Class 5",
        "student_subject": "Science",
        "join_code": STATE["join_code"],
        "answers": answers,
        "auto_submit": False,
    }
    r = session.post(f"{API}/student/submit", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    expected_score = len(qs) - 1
    assert j["score"] == expected_score, f"Expected {expected_score}, got {j['score']}"
    assert j["total"] == len(qs)
    # answers exposed in submission response
    assert all("answer" in q for q in j["questions"])


def test_15_already_attempted_via_find(session):
    r = session.post(
        f"{API}/student/find-test",
        json={"join_code": STATE["join_code"], "student_name": "TEST_Anjali", "student_class": "Class 5"},
        timeout=15,
    )
    assert r.status_code == 200
    assert r.json()["already_attempted"] is True


def test_16_double_submit_blocked(session):
    payload = {
        "student_name": "TEST_Anjali",
        "student_class": "Class 5",
        "student_subject": "Science",
        "join_code": STATE["join_code"],
        "answers": {"0": 0},
    }
    r = session.post(f"{API}/student/submit", json=payload, timeout=15)
    assert r.status_code == 400
    assert "already" in r.json().get("detail", "").lower()


# ── Student history ──
def test_17_student_history(session):
    r = session.get(f"{API}/student/history", params={"name": "TEST_Anjali", "student_class": "Class 5"}, timeout=15)
    assert r.status_code == 200
    docs = r.json()
    assert len(docs) >= 1
    assert docs[0]["student_name"] == "TEST_Anjali"


# ── Admin students grouped ──
def test_18_admin_students(session):
    r = session.get(f"{API}/admin/students", timeout=15)
    assert r.status_code == 200
    students = r.json()
    keys = [s["key"] for s in students]
    assert "TEST_Anjali||Class 5" in keys


# ── Reveal ──
def test_19_reveal(session):
    tid = STATE["teacher_id"]
    r = session.post(f"{API}/teacher/{tid}/reveal", timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j["ok"] is True
    assert j["record"]["total_students"] == 1

    # State now: not active, revealed
    r2 = session.get(f"{API}/teacher/{tid}/state", timeout=15)
    at = r2.json()
    assert at["test_active"] is False
    assert at["answers_revealed"] is True


def test_20_teacher_history(session):
    tid = STATE["teacher_id"]
    r = session.get(f"{API}/teacher/{tid}/history", timeout=15)
    assert r.status_code == 200
    docs = r.json()
    assert len(docs) >= 1
    assert "results" in docs[0]


# ── Cleanup: clear-all (LAST) ──
def test_99_clear_all(session):
    r = session.post(f"{API}/admin/clear-all", timeout=15)
    assert r.status_code == 200
    assert r.json()["ok"] is True
    # Verify wiped
    r2 = session.get(f"{API}/admin/teachers", timeout=15)
    assert r2.json() == []
