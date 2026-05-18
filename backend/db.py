import os

from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client | None = None


def get_supabase() -> Client:

    global _client

    if _client is None:

        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")

        print("SUPABASE URL:", url)
        print("SUPABASE KEY EXISTS:", bool(key))

        if not url:
            raise Exception("Missing SUPABASE_URL")

        if not key:
            raise Exception("Missing SUPABASE_SERVICE_KEY")

        _client = create_client(url, key)

    return _client