import pandas as pd
from typing import Dict
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

class DuplicateDetector:
    def __init__(self, max_features: int = 10000):
        self.max_features = max_features
        self.df = None
        self.vectorizer = None
        self.tfidf_matrix = None
        self.area_index = {}

    def fit_from_csv(self, csv_path: str):
        """
        Load complaints from CSV.
        Expected columns: location, description, issue_type, urgency
        """
        self.df = pd.read_csv(csv_path)

        # preprocess descriptions
        self.df["clean_desc"] = self.df["description"].apply(preprocess)

        # build area index
        self.area_index = {}
        for i, row in self.df.iterrows():
            area = row["location"]
            self.area_index.setdefault(area, []).append(i)

        # TF-IDF
        self.vectorizer = TfidfVectorizer(max_features=self.max_features, ngram_range=(1,2))
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df["clean_desc"].tolist())

    def predict(self, new_complaint: Dict, similarity_threshold: float = 0.8) -> Dict:
        """
        new_complaint: dict with keys: location, description
        """
        desc = preprocess(new_complaint["description"])
        area = new_complaint["location"]

        # restrict to same area
        candidates_idx = self.area_index.get(area, [])
        if not candidates_idx:
            return {'is_duplicate': False, 'best_match': None, 'best_score': 0.0}

        # vectorize new text
        q_vec = self.vectorizer.transform([desc])
        cand_vecs = self.tfidf_matrix[candidates_idx]
        sims = cosine_similarity(q_vec, cand_vecs)[0]

        # best match
        best_idx_local = int(np.argmax(sims))
        best_score = float(sims[best_idx_local])
        global_best_idx = candidates_idx[best_idx_local]
        best_match = self.df.iloc[global_best_idx].to_dict()

        is_duplicate = best_score >= similarity_threshold

        return {
            'is_duplicate': is_duplicate,
            'best_match': best_match if is_duplicate else None,
            'best_score': best_score
        }


# --- Example usage ---
if __name__ == "__main__":
    detector = DuplicateDetector()
    detector.fit_from_csv("odisha_civic_issues.csv")  # load your CSV file

    new = {"location": "Bargarh", "description": "Pothole on state highway near Badgaon"}
    res = detector.predict(new, similarity_threshold=0.75)
    print(res)
    # Expected: is_duplicate True, best_match row with "Streetlight flickering near block A"
