# import os
# from supabase import create_client, Client
# from dotenv import load_dotenv

# # Load environment variables from .env file
# load_dotenv()

# SUPABASE_URL: str = os.getenv("SUPABASE_URL")
# SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")

# if not SUPABASE_URL or not SUPABASE_KEY:
#     raise ValueError("Missing Supabase environment variables")

# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

