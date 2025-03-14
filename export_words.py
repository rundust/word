import sqlite3
import json

def export_words_to_json():
    try:
        # 连接到SQLite数据库
        conn = sqlite3.connect('words.db')
        cursor = conn.cursor()
        
        # 查询所有单词数据
        cursor.execute('SELECT * FROM words')
        rows = cursor.fetchall()
        
        # 获取列名
        column_names = [description[0] for description in cursor.description]
        
        # 将数据写入JSON Lines文件（每行一个JSON对象）
        with open('words.json', 'w', encoding='utf-8') as f:
            for row in rows:
                word_dict = dict(zip(column_names, row))
                # 写入一行JSON，不使用缩进
                f.write(json.dumps(word_dict, ensure_ascii=False) + '\n')
        
        print(f"成功导出 {len(rows)} 条数据到 words.json")
        
    except sqlite3.Error as e:
        print(f"数据库错误: {e}")
    except Exception as e:
        print(f"发生错误: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    export_words_to_json() 