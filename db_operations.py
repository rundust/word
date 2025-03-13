import sqlite3

def create_connection():
    """创建数据库连接"""
    conn = None
    try:
        conn = sqlite3.connect('words.db')
    except sqlite3.Error as e:
        print(e)
    return conn

def create_table():
    """创建 words 表"""
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS words (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            stage TEXT NOT NULL,
                            grade TEXT NOT NULL,
                            chinese TEXT NOT NULL,
                            english TEXT NOT NULL
                        )''')
        except sqlite3.Error as e:
            print(e)
        finally:
            conn.close()

def insert_word(stage, grade, chinese, english):
    """插入单词到数据库"""
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("INSERT INTO words (stage, grade, chinese, english) VALUES (?,?,?,?)",
                      (stage, grade, chinese, english))
            conn.commit()
        except sqlite3.Error as e:
            print(e)
        finally:
            conn.close()

def delete_word(id):
    """根据 ID 删除单词"""
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("DELETE FROM words WHERE id=?", (id,))
            conn.commit()
        except sqlite3.Error as e:
            print(e)
        finally:
            conn.close()

def update_word(id, stage, grade, chinese, english):
    """根据 ID 更新单词信息"""
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("UPDATE words SET stage=?, grade=?, chinese=?, english=? WHERE id=?",
                      (stage, grade, chinese, english, id))
            conn.commit()
        except sqlite3.Error as e:
            print(e)
        finally:
            conn.close()

def select_all_words():
    """查询所有单词"""
    conn = create_connection()
    words = []
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute("SELECT * FROM words")
            words = c.fetchall()
        except sqlite3.Error as e:
            print(e)
        finally:
            conn.close()
    return words

def initialize_database():
    """初始化数据库，插入小学一年级单词"""
    create_table()
    primary_1_words = [
        ('小学', '一年级', '苹果', 'apple'),
        ('小学', '一年级', '香蕉', 'banana'),
        ('小学', '一年级', '猫', 'cat'),
        ('小学', '一年级', '狗', 'dog')
    ]
    for word in primary_1_words:
        insert_word(*word)