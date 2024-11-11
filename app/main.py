from flask import Flask, request, jsonify, render_template, url_for
from groq import Groq
from dotenv import load_dotenv   
import os   

load_dotenv()   

app = Flask(__name__)

client = Groq(
    api_key = os.getenv("GROQ_API_KEY"),
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def get_response():
    user_message = request.json.get('message')
    chat_history = request.json.get('history', [])
    
    try:
        # Convert chat history to Groq format
        formatted_messages = [
            {"role": "user" if i % 2 == 0 else "assistant", "content": msg}
            for i, msg in enumerate(chat_history)
        ]
        
        formatted_messages.append({
            "role": "user",
            "content": user_message
        })
        
        chat_completion = client.chat.completions.create(
            messages=formatted_messages,
            model="llama3-8b-8192",
        )
        
        assistant_response = chat_completion.choices[0].message.content
        
        # You can add logic here to determine which image to show based on the response
        image_path = determine_image_path(assistant_response)  # You'll need to implement this
        
        return jsonify({
            "response": assistant_response,
            "image_path": image_path
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def determine_image_path(response):
    # Implement your logic to choose an image based on the response
    # For example, you could have different images for different types of responses
    # return url_for('static', filename='default-image.jpg')
    return url_for('static', filename='images/article_placeholder.png')

if __name__ == '__main__':
    app.run(debug=True)