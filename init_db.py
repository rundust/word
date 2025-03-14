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
    """创建 words 表，设置 english 字段为唯一"""
    conn = create_connection()
    if conn is not None:
        try:
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS words (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            stage TEXT NOT NULL,
                            grade TEXT NOT NULL,
                            chinese TEXT NOT NULL,
                            english TEXT NOT NULL UNIQUE
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
        except sqlite3.IntegrityError:
            print(f"单词 '{english}' 已存在于数据库中，插入失败。")
        except sqlite3.Error as e:
            print(e)
        finally:
            conn.close()


def insert_words_from_file():
    """从文件中读取单词并插入到数据库"""
    create_table()
    try:
        with open('words.txt', 'r', encoding='utf-8') as file:
            for line in file:
                line = line.strip()
                if line:
                    parts = line.split('（')
                    if len(parts) == 2:
                        english = parts[0]
                        chinese = parts[1].rstrip('）')
                        insert_word('小学', '六年级', chinese, english)
    except FileNotFoundError:
        print("未找到 words.txt 文件，请确保文件存在。")


if __name__ == "__main__":
    insert_words_from_file()
