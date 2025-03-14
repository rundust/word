import sqlite3

# 创建数据库连接
conn = sqlite3.connect('words.db')
cursor = conn.cursor()

try:
    # 执行更新操作
    cursor.execute("UPDATE words SET stage = '小学' WHERE stage = '一年级'")
    # 提交事务
    conn.commit()
    print("更新成功！")
except sqlite3.Error as e:
    print(f"更新过程中出现错误: {e}")
finally:
    # 关闭数据库连接
    conn.close()
