"""
Synthetic Data Generator for the CEMS Recommendation Engine.

Generates realistic fake data that matches the existing Prisma/PostgreSQL schema.
This data is used for:
  1. Developing and testing the ML recommendation models
  2. Running EDA (Exploratory Data Analysis) in Jupyter notebooks
  3. Evaluating model performance before real user data exists

What it creates:
  - 5 departments
  - 3 roles (STUDENT, ORGANIZER, ADMIN)
  - 8 interests
  - 10 tags
  - 6 categories
  - 5 venues
  - 3 event statuses
  - 100 users (with interest assignments)
  - 50 events (with tag assignments)
  - ~500 registrations
  - ~300 feedback entries
  - ~200 attendance records

Usage:
  1. Make sure PostgreSQL is running (docker compose up postgres -d)
  2. Make sure the migration has been applied
  3. Run: python scripts/seed_interactions.py
"""

import uuid
import random
from datetime import datetime, timedelta

import numpy as np
from sqlalchemy import create_engine, text


# ─── Configuration ─────────────────────────────────────────
DATABASE_URL = "postgresql://cems:cems_secret@localhost:5432/cems_db"
SEED = 42
random.seed(SEED)
np.random.seed(SEED)


# ─── Helper ────────────────────────────────────────────────
def uid():
    """Generate a UUID string."""
    return str(uuid.uuid4())


def now():
    return datetime.utcnow()


def random_date_future(days_ahead_min=1, days_ahead_max=90):
    """Random datetime in the near future."""
    delta = timedelta(days=random.randint(days_ahead_min, days_ahead_max))
    base = now() + delta
    return base.replace(hour=random.randint(8, 18), minute=0, second=0)


def random_date_past(days_back_min=1, days_back_max=60):
    """Random datetime in the recent past."""
    delta = timedelta(days=random.randint(days_back_min, days_back_max))
    base = now() - delta
    return base.replace(hour=random.randint(8, 18), minute=0, second=0)


# ─── Reference Data ────────────────────────────────────────
DEPARTMENTS = [
    ("Software Engineering", "College of Engineering"),
    ("Electrical Engineering", "College of Engineering"),
    ("Mechanical Engineering", "College of Engineering"),
    ("Biomedical Engineering", "College of Engineering"),
    ("Architecture", "College of Architecture"),
]

ROLES = ["STUDENT", "ORGANIZER", "ADMIN"]

INTERESTS = [
    ("Artificial Intelligence", "Interest in AI, ML, and data science topics"),
    ("Web Development", "Interest in frontend and backend web technologies"),
    ("Mobile Development", "Interest in Android, iOS, and Flutter development"),
    ("Cybersecurity", "Interest in security, ethical hacking, and privacy"),
    ("Robotics", "Interest in robotics, IoT, and embedded systems"),
    ("Entrepreneurship", "Interest in startups, business, and innovation"),
    ("Sports", "Interest in athletics, football, basketball"),
    ("Arts & Culture", "Interest in music, drama, visual arts"),
]

TAGS = [
    "ai", "web", "mobile", "security", "iot",
    "startup", "hackathon", "workshop", "competition", "networking",
]

CATEGORIES = [
    ("Workshop", "Hands-on learning sessions"),
    ("Seminar", "Lecture and presentation events"),
    ("Competition", "Competitive events with prizes"),
    ("Social", "Social gatherings and networking"),
    ("Sports", "Athletic and sports events"),
    ("Cultural", "Arts, music, and cultural events"),
]

EVENT_STATUSES = ["APPROVED", "PENDING", "REJECTED"]

VENUES = [
    ("Main Auditorium", "Block A", "101", 500, "Large auditorium for major events"),
    ("CS Lab 1", "Block B", "201", 40, "Computer science lab with workstations"),
    ("Conference Room", "Block A", "301", 30, "Meeting and seminar room"),
    ("Sports Field", None, None, 200, "Outdoor sports field"),
    ("Innovation Hub", "Block C", "105", 60, "Startup and innovation space"),
]

# Event templates grouped by category index
# (title_template, description_template, category_index)
EVENT_TEMPLATES = [
    # Workshops (category 0)
    ("Introduction to Machine Learning", "A hands-on workshop covering the fundamentals of machine learning, including supervised and unsupervised learning, using Python and scikit-learn.", 0),
    ("Flutter Mobile App Development", "Build your first cross-platform mobile app with Flutter and Dart. Bring your laptop!", 0),
    ("Ethical Hacking Workshop", "Learn penetration testing basics, vulnerability scanning, and responsible disclosure practices.", 0),
    ("Web Development with React", "Hands-on session building modern web applications with React, hooks, and state management.", 0),
    ("IoT and Arduino Workshop", "Build sensor-based projects with Arduino and connect them to the cloud.", 0),
    ("Git and GitHub Masterclass", "Version control essentials for collaborative software development.", 0),
    ("Docker and Containerization", "Learn containerization, Docker Compose, and deploying microservices.", 0),
    ("Data Visualization with Python", "Create beautiful charts and dashboards using matplotlib, seaborn, and plotly.", 0),

    # Seminars (category 1)
    ("The Future of AI in Ethiopia", "Distinguished speakers discuss AI adoption, challenges, and opportunities in the Ethiopian tech ecosystem.", 1),
    ("Cybersecurity Trends 2026", "Expert panel on emerging cybersecurity threats and defense strategies.", 1),
    ("Career Paths in Software Engineering", "Industry professionals share career advice and growth strategies for CS students.", 1),
    ("Blockchain and Decentralized Systems", "An introductory seminar on blockchain technology, smart contracts, and Web3.", 1),
    ("Cloud Computing Fundamentals", "Overview of AWS, Azure, and GCP services for modern application deployment.", 1),
    ("Open Source Contribution Guide", "How to find, contribute to, and benefit from open source projects.", 1),

    # Competitions (category 2)
    ("AASTU Hackathon 2026", "48-hour hackathon: build innovative solutions to real-world campus problems. Prizes worth 50,000 ETB!", 2),
    ("Competitive Programming Contest", "Algorithmic problem solving competition. Test your data structures and algorithms skills.", 2),
    ("Startup Pitch Competition", "Present your startup idea to a panel of investors and mentors. Win seed funding!", 2),
    ("Capture The Flag (CTF)", "Cybersecurity competition: solve challenges in cryptography, forensics, and web exploitation.", 2),
    ("Robotics Design Challenge", "Design and program robots to complete obstacle courses and tasks.", 2),

    # Social (category 3)
    ("Tech Networking Night", "Casual networking event for tech enthusiasts. Meet fellow developers and industry professionals.", 3),
    ("International Students Meetup", "Welcome event for international students. Share cultures, food, and experiences.", 3),
    ("Alumni Homecoming Mixer", "Connect with AASTU alumni working in tech companies worldwide.", 3),
    ("Freshman Welcome Party", "Welcome event for new students with campus tours and activities.", 3),

    # Sports (category 4)
    ("Inter-Department Football Tournament", "Annual football tournament between engineering departments. Form your team!", 4),
    ("Basketball Championship", "Campus-wide basketball tournament with trophy and medals.", 4),
    ("Morning Run Club Kickoff", "Join the weekly morning run club. All fitness levels welcome.", 4),
    ("Table Tennis Tournament", "Singles and doubles table tennis competition in the recreation center.", 4),

    # Cultural (category 5)
    ("Annual Cultural Festival", "Celebrate Ethiopian cultural diversity through music, dance, and traditional food.", 5),
    ("Poetry and Open Mic Night", "Share your poetry, music, or stand-up comedy at our monthly open mic.", 5),
    ("Film Screening: Tech Documentaries", "Watch and discuss documentaries about technology and innovation.", 5),
    ("Art Exhibition: Student Showcase", "Exhibition of student artwork including painting, photography, and digital art.", 5),
]

# User name pools
FIRST_NAMES = [
    "Abel", "Abenezer", "Amanuel", "Bereket", "Bisrat", "Daniel", "Dawit",
    "Elias", "Eyob", "Fikru", "Girma", "Hana", "Hermela", "Kalkidan",
    "Kidist", "Liya", "Mahlet", "Meron", "Mikias", "Nahom", "Natan",
    "Rediet", "Ruth", "Samuel", "Sara", "Selam", "Solomon", "Tigist",
    "Yared", "Yonas", "Zewdu", "Fasil", "Bethel", "Naod", "Tsion",
    "Kirubel", "Henok", "Lidya", "Meseret", "Robel",
]

LAST_NAMES = [
    "Abebe", "Tadesse", "Bekele", "Tesfaye", "Hailu", "Getachew", "Kebede",
    "Worku", "Dereje", "Mengistu", "Girma", "Assefa", "Mulatu", "Gebre",
    "Tekle", "Eshetu", "Mekonnen", "Alemayehu", "Berhanu", "Negash",
]


# ─── Interest-Category Affinity Map ────────────────────────
# Maps interest index → list of (category_index, affinity_weight)
# This biases registrations so users register for events matching their interests
INTEREST_CATEGORY_AFFINITY = {
    0: [(0, 0.8), (1, 0.6), (2, 0.7)],        # AI → workshops, seminars, competitions
    1: [(0, 0.8), (1, 0.5), (2, 0.6)],        # Web Dev → workshops, seminars, competitions
    2: [(0, 0.7), (1, 0.4), (2, 0.6)],        # Mobile → workshops, seminars, competitions
    3: [(0, 0.7), (1, 0.6), (2, 0.8)],        # Cybersecurity → workshops, seminars, competitions
    4: [(0, 0.7), (1, 0.5), (2, 0.6)],        # Robotics → workshops, seminars, competitions
    5: [(1, 0.6), (2, 0.8), (3, 0.7)],        # Entrepreneurship → seminars, competitions, social
    6: [(4, 0.9), (3, 0.4)],                   # Sports → sports, social
    7: [(5, 0.9), (3, 0.5)],                   # Arts → cultural, social
}


def generate_data(engine):
    """Generate and insert all synthetic data."""
    print(" Starting data generation...")

    with engine.begin() as conn:
        # ─── 1. Departments ────────────────────────────────
        dept_ids = []
        for name, faculty in DEPARTMENTS:
            did = uid()
            dept_ids.append(did)
            conn.execute(text(
                "INSERT INTO departments (id, name, faculty) VALUES (:id, :name, :faculty)"
            ), {"id": did, "name": name, "faculty": faculty})
        print(f"   {len(dept_ids)} departments created")

        # ─── 2. Roles ─────────────────────────────────────
        role_ids = {}
        for role_name in ROLES:
            rid = uid()
            role_ids[role_name] = rid
            conn.execute(text(
                "INSERT INTO roles (id, role_name, description) VALUES (:id, :rn, :desc)"
            ), {"id": rid, "rn": role_name, "desc": f"{role_name} role"})
        print(f"   {len(role_ids)} roles created")

        # ─── 3. Interests ─────────────────────────────────
        interest_ids = []
        for name, desc in INTERESTS:
            iid = uid()
            interest_ids.append(iid)
            conn.execute(text(
                "INSERT INTO interests (id, name, description) VALUES (:id, :name, :desc)"
            ), {"id": iid, "name": name, "desc": desc})
        print(f"   {len(interest_ids)} interests created")

        # ─── 4. Tags ──────────────────────────────────────
        tag_ids = []
        for tag_name in TAGS:
            tid = uid()
            tag_ids.append(tid)
            conn.execute(text(
                "INSERT INTO tags (id, name) VALUES (:id, :name)"
            ), {"id": tid, "name": tag_name})
        print(f"   {len(tag_ids)} tags created")

        # ─── 5. Categories ────────────────────────────────
        category_ids = []
        for name, desc in CATEGORIES:
            cid = uid()
            category_ids.append(cid)
            conn.execute(text(
                "INSERT INTO categories (id, name, description) VALUES (:id, :name, :desc)"
            ), {"id": cid, "name": name, "desc": desc})
        print(f"   {len(category_ids)} categories created")

        # ─── 6. Event Statuses ─────────────────────────────
        status_ids = {}
        for status_name in EVENT_STATUSES:
            sid = uid()
            status_ids[status_name] = sid
            conn.execute(text(
                "INSERT INTO event_status (id, status_name, description) VALUES (:id, :sn, :desc)"
            ), {"id": sid, "sn": status_name, "desc": f"{status_name} status"})
        print(f"   {len(status_ids)} event statuses created")

        # ─── 7. Venues ────────────────────────────────────
        venue_ids = []
        for name, building, room, capacity, desc in VENUES:
            vid = uid()
            venue_ids.append(vid)
            conn.execute(text(
                "INSERT INTO venues (id, name, building, room_number, capacity, description) "
                "VALUES (:id, :name, :bld, :room, :cap, :desc)"
            ), {"id": vid, "name": name, "bld": building, "room": room, "cap": capacity, "desc": desc})
        print(f"   {len(venue_ids)} venues created")

        # ─── 8. Users (100) ───────────────────────────────
        user_ids = []
        user_interest_map = {}  # user_id → list of interest indices

        for i in range(100):
            user_id = uid()
            user_ids.append(user_id)
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)

            # 85% students, 10% organizers, 5% admins
            r = random.random()
            if r < 0.85:
                role = "STUDENT"
            elif r < 0.95:
                role = "ORGANIZER"
            else:
                role = "ADMIN"

            conn.execute(text(
                "INSERT INTO users (id, full_name, email, password_hash, role_id, "
                "department_id, created_at, updated_at) "
                "VALUES (:id, :fn, :email, :pwh, :rid, :did, :ca, :ua)"
            ), {
                "id": user_id,
                "fn": f"{first} {last}",
                "email": f"{first.lower()}.{last.lower()}{i}@aastu.edu.et",
                "pwh": "$argon2id$v=19$m=65536,t=3,p=4$fakehash",  # placeholder
                "rid": role_ids[role],
                "did": random.choice(dept_ids),
                "ca": now() - timedelta(days=random.randint(30, 365)),
                "ua": now(),
            })

            # Assign 2-4 interests per user
            n_interests = random.randint(2, 4)
            chosen_interests = random.sample(range(len(INTERESTS)), n_interests)
            user_interest_map[user_id] = chosen_interests

            for int_idx in chosen_interests:
                conn.execute(text(
                    "INSERT INTO user_interests (id, user_id, interest_id) "
                    "VALUES (:id, :uid, :iid)"
                ), {"id": uid(), "uid": user_id, "iid": interest_ids[int_idx]})

        print(f"   {len(user_ids)} users created with interest assignments")

        # ─── 9. Events (50) ───────────────────────────────
        # Mix of past events (for training data) and future events (for recommendations)
        event_ids = []
        event_category_map = {}  # event_id → category_index

        selected_templates = random.sample(EVENT_TEMPLATES, min(50, len(EVENT_TEMPLATES)))
        # If fewer than 50 templates, repeat some with suffix
        while len(selected_templates) < 50:
            t = random.choice(EVENT_TEMPLATES)
            selected_templates.append((
                f"{t[0]} (Edition {len(selected_templates) - len(EVENT_TEMPLATES) + 2})",
                t[1],
                t[2],
            ))

        for i, (title, description, cat_idx) in enumerate(selected_templates):
            event_id = uid()
            event_ids.append(event_id)
            event_category_map[event_id] = cat_idx

            # 70% past events (for training), 30% future (for recommendations)
            if i < 35:
                start = random_date_past(5, 60)
            else:
                start = random_date_future(5, 90)

            end = start + timedelta(hours=random.choice([2, 3, 4, 6, 8]))
            venue = random.choice(venue_ids)
            capacity = random.choice([30, 50, 80, 100, 150, 200])

            conn.execute(text(
                "INSERT INTO events (id, title, description, category_id, status_id, "
                "venue_id, start_time, end_time, capacity, created_at, updated_at) "
                "VALUES (:id, :t, :d, :cid, :sid, :vid, :st, :et, :cap, :ca, :ua)"
            ), {
                "id": event_id, "t": title, "d": description,
                "cid": category_ids[cat_idx],
                "sid": status_ids["APPROVED"],  # all seeded events are approved
                "vid": venue, "st": start, "et": end, "cap": capacity,
                "ca": start - timedelta(days=random.randint(7, 30)),
                "ua": start - timedelta(days=random.randint(1, 7)),
            })

            # Assign 2-4 tags per event
            n_tags = random.randint(2, 4)
            chosen_tags = random.sample(range(len(TAGS)), n_tags)
            for tag_idx in chosen_tags:
                conn.execute(text(
                    "INSERT INTO event_tags (id, event_id, tag_id) "
                    "VALUES (:id, :eid, :tid)"
                ), {"id": uid(), "eid": event_id, "tid": tag_ids[tag_idx]})

        print(f"   {len(event_ids)} events created with tag assignments")

        # ─── 10. Registrations (~500) ─────────────────────
        registration_count = 0
        reg_pairs = set()  # (user_id, event_id) to avoid duplicates

        for user_id in user_ids:
            user_interests = user_interest_map[user_id]

            for event_id in event_ids:
                cat_idx = event_category_map[event_id]

                # Compute registration probability based on interest-category affinity
                prob = 0.05  # base probability (random discovery)
                for int_idx in user_interests:
                    affinities = INTEREST_CATEGORY_AFFINITY.get(int_idx, [])
                    for aff_cat, aff_weight in affinities:
                        if aff_cat == cat_idx:
                            prob = max(prob, aff_weight * 0.3)

                if random.random() < prob:
                    pair = (user_id, event_id)
                    if pair in reg_pairs:
                        continue
                    reg_pairs.add(pair)

                    conn.execute(text(
                        "INSERT INTO registrations (id, user_id, event_id, "
                        "registration_date, status) "
                        "VALUES (:id, :uid, :eid, :rd, :s)"
                    ), {
                        "id": uid(), "uid": user_id, "eid": event_id,
                        "rd": now() - timedelta(days=random.randint(1, 30)),
                        "s": random.choice(["CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING"]),
                    })
                    registration_count += 1

        print(f"   {registration_count} registrations created")

        # ─── 11. Attendance (~60% of registrations) ───────
        attendance_count = 0
        for user_id, event_id in reg_pairs:
            if random.random() < 0.6:
                conn.execute(text(
                    "INSERT INTO attendance (id, user_id, event_id, check_in_time, qr_token) "
                    "VALUES (:id, :uid, :eid, :ci, :qr)"
                ), {
                    "id": uid(), "uid": user_id, "eid": event_id,
                    "ci": now() - timedelta(days=random.randint(1, 30)),
                    "qr": f"qr_{uid()[:8]}",
                })
                attendance_count += 1

        print(f"   {attendance_count} attendance records created")

        # ─── 12. Feedback (~50% of attendees) ─────────────
        feedback_count = 0
        attended_pairs = [(u, e) for u, e in reg_pairs if random.random() < 0.5]

        for user_id, event_id in attended_pairs:
            # Users with matching interests tend to rate higher
            cat_idx = event_category_map[event_id]
            user_interests = user_interest_map[user_id]

            has_affinity = any(
                cat_idx in [a[0] for a in INTEREST_CATEGORY_AFFINITY.get(int_idx, [])]
                for int_idx in user_interests
            )

            if has_affinity:
                rating = random.choices([3, 4, 5], weights=[0.2, 0.4, 0.4])[0]
            else:
                rating = random.choices([1, 2, 3, 4], weights=[0.1, 0.2, 0.4, 0.3])[0]

            comments = [
                "Great event! Learned a lot.",
                "Well organized and informative.",
                "Could have been better.",
                "Amazing speakers and content!",
                "Not what I expected.",
                "Would definitely attend again!",
                "Good networking opportunity.",
                "The venue was too small for the crowd.",
                "Excellent hands-on experience.",
                None,  # some feedback has no comment
            ]

            conn.execute(text(
                "INSERT INTO feedback (id, user_id, event_id, rating, comment, created_at) "
                "VALUES (:id, :uid, :eid, :r, :c, :ca)"
            ), {
                "id": uid(), "uid": user_id, "eid": event_id,
                "r": rating, "c": random.choice(comments),
                "ca": now() - timedelta(days=random.randint(1, 20)),
            })
            feedback_count += 1

        print(f"   {feedback_count} feedback entries created")

    print(f"\n Data generation complete!")
    print(f"   Summary: {len(user_ids)} users, {len(event_ids)} events, "
          f"{registration_count} registrations, {attendance_count} attendance, "
          f"{feedback_count} feedback")


def check_existing_data(engine):
    """Check if data already exists to avoid duplicate seeding."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        return result > 0


if __name__ == "__main__":
    print(" Connecting to PostgreSQL...")
    engine = create_engine(DATABASE_URL)

    # Test connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(" Connected successfully!")
    except Exception as e:
        print(f" Connection failed: {e}")
        print("   Make sure PostgreSQL is running: docker compose up postgres -d")
        exit(1)

    # Check for existing data
    if check_existing_data(engine):
        response = input("  Data already exists. Clear and re-seed? (y/N): ")
        if response.lower() != "y":
            print("Aborted.")
            exit(0)
        # Clear existing data (order matters due to foreign keys)
        print("  Clearing existing data...")
        with engine.begin() as conn:
            for table in [
                "feedback", "attendance", "registrations", "event_waitlist",
                "event_organizers", "event_sessions", "event_tags", "event_media",
                "announcements", "audit_logs", "notifications",
                "user_interests", "events", "users",
                "venues", "event_status", "categories", "interests", "tags",
                "role_permissions", "permissions", "roles", "departments",
            ]:
                conn.execute(text(f"DELETE FROM {table}"))
        print(" Cleared!")

    generate_data(engine)
