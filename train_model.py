import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

texts = [
    "where is canteen",
    "canteen location",
    "how to reach canteen",
    "what is canteen menu",
    "canteen menu",

    "where is the auditorium",
    "which side auditorium",
    "auditorium",
    "find the auditorium",

    "where is the library",
    "where i can get the books",
    "library location",
    "library books",
    "how to reach library",
    "show library location",

    "where is the boys hostel",
    "where is the girls hostel",

    "what is IT fees structure",
    "what is CSBS fees structure",
    "tell me fee structure",
    "tell me fee structure for all departments",

    "where is AIDS lab",
    "Main lab location",
    "where is programming Lab 1",
    "how to reach the pg lab",
    "the cadd lab",
    "the main lab",
    "the programming lab 2",
    "CADD lab location",

    "principal room location",
    "where is the principal room",

    "where is office",
    "where pay fees",
    "where do i pay fees",

    "important dates",
    "exam dates"
]

labels = [
    "canteen",
    "canteen",
    "canteen",
    "canteen",
    "canteen",

    "auditorium",
    "auditorium",
    "auditorium",
    "auditorium",

    "library",
    "library",
    "library",
    "library",
    "library",
    "library",

    "boys_hostel",
    "girls_hostel",

    "fees",
    "fees",
    "fees",
    "fees",

    "labs",
    "labs",
    "labs",
    "labs",
    "labs",
    "labs",
    "labs",
    "labs",

    "principal_room",
    "principal_room",

    "office",
    "payin_office",
    "payin_office",

    "important_dates",
    "important_dates"
]

print("Texts count:", len(texts))
print("Labels count:", len(labels))

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

model = LogisticRegression(max_iter=1000)
model.fit(X, labels)

joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("Model and vectorizer saved successfully!")