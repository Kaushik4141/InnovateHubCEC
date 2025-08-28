from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd


users = [
    {
        "id": "u123",
        "name": "Mohith",
        "skills": ["python", "machine learning", "ai"],
        "projects": ["chatbot", "recommendation system"],
        "certifications": ["AWS", "TensorFlow"]
    },
    {
        "id": "u124",
        "name": "Alice",
        "skills": ["python", "data science"],
        "projects": ["portfolio website"],
        "certifications": ["Azure"]
    },
]


jobs = [
    {
        "id": "j101",
        "title": "AI Engineer",
        "requirements": ["python", "machine learning", "deep learning", "TensorFlow"]
    },
    {
        "id": "j102",
        "title": "Data Analyst",
        "requirements": ["python", "sql", "data visualization"]
    },
    {
        "id": "j103",
        "title": "Backend Developer",
        "requirements": ["java", "spring boot", "mysql"]
    }
]


def profile_to_text(user):
    return " ".join(user["skills"] + user["projects"] + user["certifications"])


def job_to_text(job):
    return " ".join(job["requirements"])


def recommend_jobs(user_id, top_n=3):
   
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return "User not found"
    
    user_text = profile_to_text(user)
    job_texts = [job_to_text(j) for j in jobs]

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([user_text] + job_texts)

    similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    ranked_jobs = sorted(
        list(zip(jobs, similarity_scores)),
        key=lambda x: x[1],
        reverse=True
    )[:top_n]

    return [(job["title"], round(score, 2)) for job, score in ranked_jobs]


print("Job Recommendations for Mohith:")
print(recommend_jobs("u123"))
