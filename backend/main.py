# import os
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# from supabase_client import supabase
# from supabase import create_client, Client
# from typing import List
# from uuid import uuid4
# from models import Article, ArticleCreate

# # Load environment variables
# load_dotenv()

# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# app = FastAPI()

# origins = [
#     "http://localhost:5173",  # frontend
# ]

# # Allow frontend requests
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --------- API Routes ---------

# @app.get("/articles", response_model=List[Article])
# def get_articles():
#     try:
#         response = supabase.table("articles").select("*").order("created_at", desc=True).execute()
#         return response.data
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @app.post("/articles", response_model=Article)
# def create_article(article: ArticleCreate):
#     new_article = {
#         "id": str(uuid4()),
#         "title": article.title,
#         "description": article.description,
#         "image_url": article.image_url,
#         "author": article.author,
#     }

#     try:
#         response = supabase.table("articles").insert(new_article).execute()
#         if response.status_code != 201:
#             raise HTTPException(status_code=400, detail="Failed to create article")
#         return response.data[0]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
