import sqlite3

# 连接到数据库
conn = sqlite3.connect('words.db')
cursor = conn.cursor()

# 获取表结构信息
cursor.execute("PRAGMA table_info(words)")
table_info = cursor.fetchall()

# 打印表结构信息
for column in table_info:
    print(f"列名: {column[1]}, 数据类型: {column[2]}, 是否为必填项: {bool(column[3])}")

# 关闭连接
conn.close()
