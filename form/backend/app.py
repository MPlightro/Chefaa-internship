from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Configure your MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="chefaa"
)
cursor = db.cursor()

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')  # In production, hash this!

    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify({'error': 'User already exists! Please log in.'}), 409

    try:
        cursor.execute(
            "INSERT INTO users (full_name, email, password) VALUES (%s, %s, %s)",
            (full_name, email, password)
        )
        db.commit()
        return jsonify({'message': 'User registered successfully!'}), 201
    except mysql.connector.Error as err:
        # Double-check for duplicate email error
        if err.errno == 1062:
            return jsonify({'error': 'User already exists! Please log in.'}), 409
        return jsonify({'error': str(err)}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400
    cursor.execute("SELECT id, full_name FROM users WHERE email = %s AND password = %s", (email, password))
    user = cursor.fetchone()
    if user:
        return jsonify({'message': 'Login successful!', 'email': email, 'full_name': user[1]}), 200
    else:
        return jsonify({'error': 'Invalid email or password.'}), 401

@app.route('/add_todo', methods=['POST'])
def add_todo():
    data = request.json
    email = data.get('email')
    content = data.get('content')
    if not email or not content:
        return jsonify({'error': 'Email and content are required.'}), 400
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    user_id = user[0]
    cursor.execute(
        "INSERT INTO todos (user_id, content) VALUES (%s, %s)",
        (user_id, content)
    )
    db.commit()
    return jsonify({'message': 'Todo added successfully!'}), 201

@app.route('/get_todos', methods=['GET'])
def get_todos():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email is required.'}), 400
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    user_id = user[0]
    cursor.execute("SELECT id, content, completed, created_at FROM todos WHERE user_id = %s", (user_id,))
    todos = cursor.fetchall()
    todo_list = [
        {'id': t[0], 'content': t[1], 'completed': bool(t[2]), 'created_at': t[3].isoformat()} for t in todos
    ]
    return jsonify(todo_list)

@app.route('/update_todo', methods=['POST'])
def update_todo():
    data = request.json
    todo_id = data.get('id')
    content = data.get('content')
    completed = data.get('completed')
    if todo_id is None:
        return jsonify({'error': 'Todo id is required.'}), 400
    # Only update fields that are provided
    fields = []
    values = []
    if content is not None:
        fields.append('content = %s')
        values.append(content)
    if completed is not None:
        fields.append('completed = %s')
        values.append(completed)
    if not fields:
        return jsonify({'error': 'No fields to update.'}), 400
    values.append(todo_id)
    sql = f"UPDATE todos SET {', '.join(fields)} WHERE id = %s"
    cursor.execute(sql, tuple(values))
    db.commit()
    return jsonify({'message': 'Todo updated successfully!'})

@app.route('/delete_todo', methods=['POST'])
def delete_todo():
    data = request.json
    todo_id = data.get('id')
    if todo_id is None:
        return jsonify({'error': 'Todo id is required.'}), 400
    cursor.execute("DELETE FROM todos WHERE id = %s", (todo_id,))
    db.commit()
    return jsonify({'message': 'Todo deleted successfully!'})

# Admin/debug endpoint: show all users
def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dicts"""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@app.route('/show_users', methods=['GET'])
def show_users():
    cursor.execute("SELECT id, full_name, email FROM users")
    users = dictfetchall(cursor)
    return jsonify(users)

@app.route('/show_todos', methods=['GET'])
def show_todos():
    cursor.execute("SELECT id, user_id, content, completed, created_at FROM todos")
    todos = dictfetchall(cursor)
    return jsonify(todos)

if __name__ == '__main__':
    app.run(debug=True)