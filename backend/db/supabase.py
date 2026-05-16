# Phase 4 — Supabase integration
import os


def get_supabase_client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    # Will be initialized in Phase 4
    return None
