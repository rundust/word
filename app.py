from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

# 模拟排行榜
RANKING = []

@app.route('/get_words', methods=['GET'])
def get_words():
    stage = request.args.get('stage')
    grade = request.args.get('grade')
    conn = sqlite3.connect('words.db')
    cursor = conn.cursor()
    cursor.execute('SELECT chinese, english FROM words WHERE stage =? AND grade =?', (stage, grade))
    words = cursor.fetchall()
    word_list = [{'chinese': word[0], 'english': word[1]} for word in words]
    conn.close()
    return jsonify(word_list)

@app.route('/submit_score', methods=['POST'])
def submit_score():
    data = request.get_json()
    score = data.get('score')
    name = data.get('name')
    RANKING.append({'name': name, 'score': score})
    RANKING.sort(key=lambda x: x['score'], reverse=True)
    RANKING = RANKING[:10]
    return jsonify({'message': '分数提交成功'})

@app.route('/get_ranking', methods=['GET'])
def get_ranking():
    return jsonify(RANKING)

if __name__ == '__main__':
    app.run(debug=True)
