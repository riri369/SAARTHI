import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import FeatureUnion
from sklearn.metrics import classification_report

# Load dataset
df = pd.read_csv("odisha_civic_issues.csv")  # columns: location, description, tag, urgency

# Encode categorical features
loc_encoder = LabelEncoder()
tag_encoder = LabelEncoder()
urgency_encoder = LabelEncoder()

df['location_enc'] = loc_encoder.fit_transform(df['location'])
df['tag_enc'] = tag_encoder.fit_transform(df['issue_type'])
df['urgency_enc'] = urgency_encoder.fit_transform(df['urgency'])

# TF-IDF for description
tfidf = TfidfVectorizer(max_features=500)
X_text = tfidf.fit_transform(df['description'])

# Combine features
import scipy.sparse
X_other = df[['location_enc', 'tag_enc']].values
X = scipy.sparse.hstack((X_text, X_other))

y = df['urgency_enc']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)


# Function to predict new complaint
def predict_urgency(description, location, tag):
    desc_vec = tfidf.transform([description])
    loc_enc = loc_encoder.transform([location])
    tag_enc = tag_encoder.transform([tag])
    
    X_new = scipy.sparse.hstack((desc_vec, [[loc_enc[0], tag_enc[0]]]))
    pred = model.predict(X_new)
    return urgency_encoder.inverse_transform(pred)[0]

# Example
print(predict_urgency("Pothole near bus stand causing damage to bikes", "Jharsuguda", "pothole"))
