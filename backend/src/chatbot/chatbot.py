from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from spellchecker import SpellChecker
import re
import numpy as np


questions = [
    # 🔹 Project Showcase
    "How can I upload a project?",
    "Can I add images or videos to my project?",
    "How do I share my GitHub link?",
    "Where will my projects be shown?",
    "Can others see and comment on my projects?",

    # 🔹 Peer Networking
    "How do I follow other students?",
    "Will I get updates when someone posts a new project?",
    "Can I unfollow someone later?",
    "How do I build my network?",

    # 🔹 Real-time Chat
    "How do I join a public chat room?",
    "What chat rooms are available?",
    "Can I message someone privately?",
    "Is chat available on mobile?",

    # 🔹 Coding Leaderboards
    "What is the leaderboard for?",
    "How is ranking calculated?",
    "Does it track GitHub activity?",
    "Can I connect my LeetCode account?",
    "How often is the leaderboard updated?",

    # 🔹 LinkedIn Integration
    "How do I link my LinkedIn account?",
    "Will my LinkedIn posts show automatically?",
    "Can I remove my LinkedIn integration?",

    # 🔹 User Profiles
    "How do I update my profile?",
    "What details can I add to my profile?",
    "Can I link my GitHub and LeetCode profiles?",
    "Can I add certifications and skills to my profile?",
    "Who can view my profile?",

    # 🔹 General / Other
    "What is this website about?",
    "Who is this website for?",
    "Is there a free plan?",
    "How do I contact support?",
    "I forgot my password, what do I do?",
    "Website not loading, what should I do?",
    "Site looks different on mobile, is that normal?"
]

documents = [
    # 🔹 Project Showcase
    "Go to your profile and click ‘Add Project’ to upload project details.",
    "Yes, you can attach images, videos, and documents to showcase your project better.",
    "When adding a project, you can paste your GitHub or live demo link.",
    "Your projects will appear on your profile and in the project showcase section.",
    "Yes, other students can view and interact with your projects.",

    # 🔹 Peer Networking
    "Click the ‘Follow’ button on a student’s profile to follow them.",
    "Yes, you’ll be notified when someone you follow uploads a new project or update.",
    "Yes, you can unfollow anytime from their profile.",
    "Engage with projects, follow peers, and join chats to build your network.",

    # 🔹 Real-time Chat
    "Go to the chat section and select the room you want to join.",
    "Common chat rooms include General, Projects, and Help.",
    "Yes, you can send private one-on-one messages.",
    "Yes, the chat feature is available on both desktop and mobile.",

    # 🔹 Coding Leaderboards
    "The leaderboard shows top performers based on coding activity.",
    "Ranking is calculated from GitHub commits and LeetCode problems solved.",
    "Yes, your GitHub contributions are tracked.",
    "Yes, you can connect your LeetCode account from your profile settings.",
    "The leaderboard is updated daily to reflect your progress.",

    # 🔹 LinkedIn Integration
    "You can link your LinkedIn account from your profile settings.",
    "Yes, your latest LinkedIn posts will automatically appear on your feed.",
    "Yes, you can remove LinkedIn integration anytime from settings.",

    # 🔹 User Profiles
    "Go to your profile page and click ‘Edit’ to update your details.",
    "You can add skills, certifications, projects, achievements, and links to external profiles.",
    "Yes, you can link GitHub, LinkedIn, and LeetCode accounts from your profile.",
    "Yes, certifications and skills can be added under the profile section.",
    "Your profile is visible to other students and mentors on the platform.",

    # 🔹 General / Other
    "This platform helps students showcase projects, connect with peers, and grow professionally.",
    "It is mainly designed for students who want to build their career profile and network.",
    "Yes, we offer a free plan with limited features.",
    "You can reach us at support@example.com or through the Help page.",
    "Click ‘Forgot Password’ on the login page and follow the steps.",
    "Please clear cache or try another browser. If the problem continues, contact support.",
    "The site is mobile-friendly, but some features are best used on desktop."
]

general_replies = {
    "hello": "Hi there! 👋 How can I help you today?",
    "hi": "Hello! 😊 What do you want to know about the website?",
    "hey": "Hey! Need help with something?",
    "thanks": "You're welcome! 🙌",
    "thank you": "Glad I could help! 👍",
    "bye": "Goodbye! 👋 Have a great day!",
    "goodbye": "See you later! 👋",
    "how are you":"i am fine hope ur doing well",
      # Small-talk extras
    "how are you": "I'm just a bot 🤖, but I'm doing great! How about you?",
    "how r u": "I'm doing fine 🤖 thanks for asking!",
    "who are you": "I'm your website assistant bot! I can answer questions about using this platform.",
    "what can you do": "I can help you with doubts about the website features, profiles, projects, and more.",
}
# ----------------------------

# -------------------------------
# 2. Load Models
# -------------------------------
# Embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Spell checker
spell = SpellChecker()

# -------------------------------
# 3. Precompute FAQ Embeddings
# -------------------------------
question_embeddings = model.encode(questions, convert_to_numpy=True)
dimension = question_embeddings.shape[1]

index = faiss.IndexFlatL2(dimension)
index.add(question_embeddings)

# -------------------------------
# 4. Preprocess Function (spell + clean)
# -------------------------------
# def preprocess(text):
#     # Lowercase
#     text = text.lower()
#     # Remove extra spaces & symbols
#     text = re.sub(r'[^a-z0-9\s]', '', text)
#     text = re.sub(r'\s+', ' ', text).strip()

#     # Correct spelling word by word
#     corrected_words = [spell.correction(word) if word not in spell else word for word in text.split()]
#     return " ".join(corrected_words)
def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    corrected_words = []
    for word in text.split():
        correction = spell.correction(word)
        if correction is None:  # if spellchecker fails
            corrected_words.append(word)  # keep original
        else:
            corrected_words.append(correction)
    return " ".join(corrected_words)


# -------------------------------
# 5. Chatbot Function
# -------------------------------
# def chatbot(query):
#     # STEP 1: Preprocess (fix typos, clean spaces)
#     cleaned_query = preprocess(query)


#     if cleaned_query in general_replies:
#         return general_replies[cleaned_query]


#     # STEP 2: Convert into embedding
#     query_embedding = model.encode([cleaned_query], convert_to_numpy=True)

#     # STEP 3: Search in FAISS
#     D, I = index.search(query_embedding, k=1)
#     answer = documents[I[0][0]]

    

#     return answer

# -------------------------------
# 6. Run Chatbot
# -------------------------------
def chatbot(query):
    # STEP 1: Preprocess
    cleaned_query = preprocess(query)

    # STEP 2: Check general replies first
    for key in general_replies:
        if cleaned_query.startswith(key) or cleaned_query == key:
            return general_replies[key]

    # STEP 3: Embedding similarity search
    query_embedding = model.encode([cleaned_query], convert_to_numpy=True)
    D, I = index.search(query_embedding, k=1)  # nearest match
    best_sim = 1 / (1 + D[0][0])  # similarity approx
    # STEP 4: Confidence check
    if best_sim < 0.4:
        return "Sorry, I didn’t get that 🤔. Can you rephrase your question?"

    return documents[I[0][0]]

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit", "bye"]:
        print("Bot: Goodbye! 👋")
        break
    response = chatbot(user_input)
    print("Bot:", response)
