# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity
# import pandas as pd


# users = [
#     {
#         "id": "u123",
#         "name": "Mohith",
#         "skills": ["python", "machine learning", "ai"],
#         "projects": ["chatbot", "recommendation system"],
#         "certifications": ["AWS", "TensorFlow"]
#     },
#     {
#         "id": "u124",
#         "name": "Alice",
#         "skills": ["python", "data science"],
#         "projects": ["portfolio website"],
#         "certifications": ["Azure"]
#     },
# ]


# jobs = [
#     {
#         "id": "j101",
#         "title": "AI Engineer",
#         "requirements": ["python", "machine learning", "deep learning", "TensorFlow"]
#     },
#     {
#         "id": "j102",
#         "title": "Data Analyst",
#         "requirements": ["python", "sql", "data visualization"]
#     },
#     {
#         "id": "j103",
#         "title": "Backend Developer",
#         "requirements": ["java", "spring boot", "mysql"]
#     }
# ]


# def profile_to_text(user):
#     return " ".join(user["skills"] + user["projects"] + user["certifications"])


# def job_to_text(job):
#     return " ".join(job["requirements"])


# def recommend_jobs(user_id, top_n=3):
   
#     user = next((u for u in users if u["id"] == user_id), None)
#     if not user:
#         return "User not found"
    
#     user_text = profile_to_text(user)
#     job_texts = [job_to_text(j) for j in jobs]

#     vectorizer = TfidfVectorizer()
#     tfidf_matrix = vectorizer.fit_transform([user_text] + job_texts)

#     similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

#     ranked_jobs = sorted(
#         list(zip(jobs, similarity_scores)),
#         key=lambda x: x[1],
#         reverse=True
#     )[:top_n]

#     return [(job["title"], round(score, 2)) for job, score in ranked_jobs]


# print("Job Recommendations for Mohith:")
# print(recommend_jobs("u123"))

import json
import re
from PyPDF2 import PdfReader

# ---------------- PDF Resume Reader ----------------
def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"❌ Error reading resume: {e}")
        return ""

# ---------------- ATS Score Calculator ----------------
def calculate_ats_score(resume_text, job):
    resume_text_lower = resume_text.lower()

    total_keywords = 0
    matched_keywords = 0

    # High weight: Required skills
    for skill in job.get("skills", []):
        total_keywords += 2
        if skill.lower() in resume_text_lower:
            matched_keywords += 2

    # Medium weight: Good-to-have
    for skill in job.get("good_to_have", []):
        total_keywords += 1
        if skill.lower() in resume_text_lower:
            matched_keywords += 1

    # Medium weight: Topics
    for topic in job.get("topics", []):
        total_keywords += 1
        if topic.lower() in resume_text_lower:
            matched_keywords += 1

    # Low weight: Buzzwords
    for buzz in job.get("buzzwords", []):
        total_keywords += 0.5
        if buzz.lower() in resume_text_lower:
            matched_keywords += 0.5

    if total_keywords == 0:
        return 0

    return round((matched_keywords / total_keywords) * 100, 2)

# ---------------- Main ----------------
def run_ats(resume_path, jobs_file="jobs_output.json"):
    # Load resume text
    resume_text = extract_text_from_pdf(resume_path)
    if not resume_text:
        return

    # Load job data
    try:
        with open(jobs_file, "r", encoding="utf-8") as f:
            jobs = json.load(f)
    except Exception as e:
        print(f"❌ Error reading jobs file: {e}")
        return

    # Calculate ATS scores
    results = []
    for job in jobs:
        score = calculate_ats_score(resume_text, job)
        results.append({
            "title": job["title"],
            "company": job["company"],
            "score": score,
            "apply_link": job["apply_link"]
        })

    # Print results
    print("\n📊 ATS Score Results:\n")
    for r in results:
        print(f"{r['title']} @ {r['company']} -> {r['score']}% match")

    # Save results
    with open("ats_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)

    print("\n✅ Saved results to ats_results.json")

# ---------------- Run Example ----------------
if __name__ == "__main__":
    run_ats("resume.pdf")  # change to your resume filename

