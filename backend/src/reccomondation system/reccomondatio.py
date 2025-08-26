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
    {
        "id": "u125",
        "name": "Bob",
        "skills": ["java", "spring boot"],
        "projects": ["ecommerce app"],
        "certifications": ["Oracle"]
    },
    {
        "id": "u126",
        "name": "Charlie",
        "skills": ["python", "ai"],
        "projects": ["chatbot"],
        "certifications": ["AWS"]
    }
]


def profile_to_text(user):
    return " ".join(user["skills"] + user["projects"] + user["certifications"])

user_ids = [u["id"] for u in users]
profiles = [profile_to_text(u) for u in users]


vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(profiles)


similarity_matrix = cosine_similarity(tfidf_matrix)


def recommend(user_id, top_n=3):
    if user_id not in user_ids:
        return "User not found"
    idx = user_ids.index(user_id)
    sim_scores = list(enumerate(similarity_matrix[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:top_n+1]  # skip self

    recommendations = [(users[i]["name"], round(score, 2)) for i, score in sim_scores]
    return recommendations


print("Recommendations for Mohith:")
print(recommend("u123"))
