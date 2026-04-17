import re
import pandas as pd
import numpy as np


# ─── Text Cleaning ─────────────────────────────────────────

def clean_text(text: str) -> str:
 
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"<[^>]+>", " ", text)          
    text = re.sub(r"[^a-z0-9\s]", " ", text)      
    text = re.sub(r"\s+", " ", text)               
    return text.strip()


# ─── Events Cleaning ──────────────────────────────────────

def clean_events(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the events DataFrame.

    What it fixes:
      - Drops duplicate events (by id)
      - Fills missing descriptions with empty string
      - Cleans title and description text
      - Removes events where start_time > end_time (invalid dates)
      - Adds a 'duration_hours' computed column

    Args:
        df: Raw events DataFrame from PostgreSQL

    Returns:
        Cleaned events DataFrame
    """
    before = len(df)

    # 1. Drop duplicates
    df = df.drop_duplicates(subset=["id"])

    # 2. Fill missing descriptions
    df["description"] = df["description"].fillna("")

    # 3. Clean text fields
    df["title_clean"] = df["title"].apply(clean_text)
    df["description_clean"] = df["description"].apply(clean_text)

    # 4. Remove invalid dates (start > end)
    df = df[df["start_time"] < df["end_time"]].copy()

    # 5. Add computed columns
    df["duration_hours"] = (
        (df["end_time"] - df["start_time"]).dt.total_seconds() / 3600
    ).round(1)

    after = len(df)
    print(f"  Events: {before} → {after} ({before - after} removed)")
    return df


# ─── Registrations Cleaning ───────────────────────────────

def clean_registrations(
    df: pd.DataFrame,
    valid_user_ids: set,
    valid_event_ids: set,
) -> pd.DataFrame:

    before = len(df)

    # 1. Drop nulls in FK columns
    df = df.dropna(subset=["user_id", "event_id"])

    # 2. Remove orphaned records
    df = df[df["user_id"].isin(valid_user_ids)]
    df = df[df["event_id"].isin(valid_event_ids)]

    # 3. Drop duplicate (user, event) pairs — keep first
    df = df.drop_duplicates(subset=["user_id", "event_id"], keep="first")

    # 4. Standardize status
    df["status"] = df["status"].str.upper().str.strip()

    after = len(df)
    print(f"  Registrations: {before} → {after} ({before - after} removed)")
    return df


# ─── Feedback Cleaning ────────────────────────────────────

def clean_feedback(
    df: pd.DataFrame,
    valid_user_ids: set,
    valid_event_ids: set,
) -> pd.DataFrame:
 
    before = len(df)

    # 1. Drop nulls
    df = df.dropna(subset=["user_id", "event_id", "rating"])

    # 2. Remove orphans
    df = df[df["user_id"].isin(valid_user_ids)]
    df = df[df["event_id"].isin(valid_event_ids)]

    # 3. Clamp ratings to valid range
    df["rating"] = df["rating"].clip(1, 5)

    # 4. Drop duplicate feedback — keep latest
    df = df.sort_values("created_at", ascending=False)
    df = df.drop_duplicates(subset=["user_id", "event_id"], keep="first")

    # 5. Fill missing comments
    df["comment"] = df["comment"].fillna("")

    after = len(df)
    print(f"  Feedback: {before} → {after} ({before - after} removed)")
    return df


# ─── Attendance Cleaning ──────────────────────────────────

def clean_attendance(
    df: pd.DataFrame,
    valid_user_ids: set,
    valid_event_ids: set,
) -> pd.DataFrame:
 
    before = len(df)

    df = df.dropna(subset=["user_id", "event_id"])
    df = df[df["user_id"].isin(valid_user_ids)]
    df = df[df["event_id"].isin(valid_event_ids)]
    df = df.drop_duplicates(subset=["user_id", "event_id"], keep="first")

    after = len(df)
    print(f"  Attendance: {before} → {after} ({before - after} removed)")
    return df


# ─── User Interests Cleaning ─────────────────────────────

def clean_user_interests(
    df: pd.DataFrame,
    valid_user_ids: set,
    valid_interest_ids: set,
) -> pd.DataFrame:
    """
    Clean the user_interests DataFrame.

    What it fixes:
      - Removes orphaned records
      - Drops duplicate (user_id, interest_id) pairs
    """
    before = len(df)

    df = df[df["user_id"].isin(valid_user_ids)]
    df = df[df["interest_id"].isin(valid_interest_ids)]
    df = df.drop_duplicates(subset=["user_id", "interest_id"])

    after = len(df)
    print(f"  User Interests: {before} → {after} ({before - after} removed)")
    return df


# ─── Master Pipeline ─────────────────────────────────────

def run_full_cleaning_pipeline(data: dict) -> dict:
    """
    Run the complete cleaning pipeline on all DataFrames.

    Args:
        data: Dict with keys 'users', 'events', 'registrations',
              'attendance', 'feedback', 'user_interests', 'interests'

    Returns:
        Dict with the same keys but cleaned DataFrames
    """
    print(" Running full cleaning pipeline...")

    valid_user_ids = set(data["users"]["id"])
    valid_event_ids = set(data["events"]["id"])
    valid_interest_ids = set(data["interests"]["id"])

    cleaned = {
        "users": data["users"],
        "interests": data["interests"],
        "categories": data["categories"],
        "event_categories": data["event_categories"], # Pass through
        "events": clean_events(data["events"]),
        "registrations": clean_registrations(
            data["registrations"], valid_user_ids, valid_event_ids
        ),
        "feedback": clean_feedback(
            data["feedback"], valid_user_ids, valid_event_ids
        ),
        "attendance": clean_attendance(
            data["attendance"], valid_user_ids, valid_event_ids
        ),
        "user_interests": clean_user_interests(
            data["user_interests"], valid_user_ids, valid_interest_ids
        ),
    }

    # Update valid IDs after event cleaning (some events may have been removed)
    cleaned_event_ids = set(cleaned["events"]["id"])
    if cleaned_event_ids != valid_event_ids:
        removed = valid_event_ids - cleaned_event_ids
        print(f"    {len(removed)} events were removed — re-filtering related tables")
        cleaned["registrations"] = cleaned["registrations"][
            cleaned["registrations"]["event_id"].isin(cleaned_event_ids)
        ]
        cleaned["feedback"] = cleaned["feedback"][
            cleaned["feedback"]["event_id"].isin(cleaned_event_ids)
        ]
        cleaned["attendance"] = cleaned["attendance"][
            cleaned["attendance"]["event_id"].isin(cleaned_event_ids)
        ]
        cleaned["event_categories"] = cleaned["event_categories"][
            cleaned["event_categories"]["event_id"].isin(cleaned_event_ids)
        ]

    print(" Cleaning pipeline complete!")
    return cleaned
