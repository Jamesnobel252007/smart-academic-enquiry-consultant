import json
import joblib
import random
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained components
model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# Load college data
with open("college_data.json", "r") as file:
    responses = json.load(file)


def format_response(core_answer):
    starts = [
        "🤖 Sure! Here's what I found:",
        "😊 Got it! Here's the information:",
        "📌 Here's what you need:"
    ]

    ends = [
        "👉 Let me know if you need anything else 😊",
        "✨ Feel free to ask more!",
        "👍 Happy to help!"
    ]

    start = random.choice(starts)
    end = random.choice(ends)

    return f"{start}\n\n{core_answer}\n\n{end}"


def get_answer(user_query):
    query = user_query.strip().lower()

    query_vector = vectorizer.transform([query])
    predicted_intent = model.predict(query_vector)[0]

    answer = "Sorry, I couldn't find the information."

    # canteen
    if predicted_intent == "canteen":
        canteen = responses["canteen"]
        menu = canteen["menu"]

        if "menu" in query:
            answer = (
                "🍽️ Here is the canteen menu:\n"
                f"Breakfast: {', '.join(menu['breakfast'])}\n"
                f"Lunch: {', '.join(menu['lunch'])}\n"
                f"Snacks: {', '.join(menu['snacks'])}"
            )
        elif "where" in query or "location" in query:
            answer = f"📍 The canteen is located {canteen['location']}."
        else:
            answer = (
                f"📍 Location: {canteen['location']}\n"
                "🍽️ Menu is also available if you want it."
            )

    # fees
    elif predicted_intent == "fees":
        departments = {
            "it": "IT department",
            "csbs": "CSBS department",
            "cse": "CSE department",
            "aids": "AIDS department"
        }

        selected_dept = None
        for key in departments:
            if key in query:
                selected_dept = departments[key]
                break

        fees = responses["fees"]
        dept_data = fees["dept"]
        bus_fee = fees["bus_fee"]

        if selected_dept:
            fee_info = dept_data[selected_dept]

            answer = (
                f"💰 Fee structure for {selected_dept}:\n"
                f"HOD: {fee_info.get('HOD', 'Not available')}\n"
                f"Tuition Fee: {fee_info.get('tuition_fee', 'Not available')}\n"
                f"Hostel Fee: {fee_info['hostel_fee']}\n\n"
                "🚌 Bus Fee Structure:\n"
            )

            for place, fee in bus_fee.items():
                answer += f"{place}: Rs. {fee}\n"

        else:
            answer = "💰 Department-wise Fee Structure:\n\n"

            for department, fee_info in dept_data.items():
                answer += (
                    f"{department}:\n"
                    f"HOD: {fee_info.get('HOD', 'Not available')}\n"
                    f"  Tuition Fee: {fee_info['tuition_fee']}\n"
                    f"  Hostel Fee: {fee_info['hostel_fee']}\n\n"
                )

            answer += "🚌 Bus Fee Structure:\n"
            for place, fee in bus_fee.items():
                answer += f"{place}: Rs. {fee}\n"

    # labs
    elif predicted_intent == "labs":
        lab_keywords = {
            "aids lab": "A.I.D.S lab",
            "aids": "A.I.D.S lab",
            "main lab": "Main lab",
            "pg lab 1": "Pg lab 1 ",
            "pg lab 2": "Pg lab 2 ",
            "programming lab 1": "programming lab 1",
            "programming lab 2": "Programing lab 2",
            "cadd lab": "CADD lab",
            "cadd": "CADD lab"
        }

        selected_lab = None
        for key, lab_name in lab_keywords.items():
            if key in query:
                selected_lab = lab_name
                break

        labs = responses["labs"]

        if selected_lab:
            location = labs.get(selected_lab)
            if location:
                answer = f"🧪 {selected_lab.strip()} location:\n{location}"
            else:
                answer = "⚠️ Lab information not found."
        else:
            answer = "🧪 Lab Locations:\n\n"
            for lab_name, location in labs.items():
                answer += f"{lab_name.strip()}:\n{location}\n\n"

    # direct info
    elif predicted_intent == "auditorium":
        answer = responses["auditorium"]

    elif predicted_intent == "boys_hostel":
        answer = responses["boys_hostel"]

    elif predicted_intent == "girls_hostel":
        answer = responses["girls_hostel"]

    elif predicted_intent == "principal_room":
        answer = responses["principal_room"]

    elif predicted_intent == "office":
        answer = responses["office"]
    elif predicted_intent == "payin_office":
        answer = f"You can pay fees at the office. {responses['office']}"
    elif predicted_intent == "important_dates":
        answer = responses["important_dates"]

    elif predicted_intent == "library":
        answer = responses["library"]

    return format_response(answer), predicted_intent


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        if not data or "message" not in data:
            return jsonify({"error": "Message is required"}), 400

        user_message = data["message"]
        reply, intent = get_answer(user_message)

        return jsonify({
            "intent": intent,
            "reply": reply
        })
    except Exception as e:
        print("Backend error:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def home():
    return "College AI Chatbot API is running!"


if __name__ == "__main__":
    app.run(debug=True)