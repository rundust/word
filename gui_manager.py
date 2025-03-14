import tkinter as tk
from tkinter import messagebox
from tkinter import ttk
import db_operations as db
import warnings
import logging

# 过滤libpng警告
warnings.filterwarnings("ignore", category=UserWarning)
logging.getLogger('PIL').setLevel(logging.ERROR)

def show_all_words():
    """显示所有单词"""
    words = db.select_all_words()
    text.delete(1.0, tk.END)
    for word in words:
        text.insert(tk.END, f"ID: {word[0]}, 阶段: {word[1]}, 年级: {word[2]}, 中文: {word[3]}, 英文: {word[4]}\n")

def add_word():
    """添加单词"""
    stage = stage_combobox.get()
    grade = grade_combobox.get()
    chinese = entry_chinese.get()
    english = entry_english.get()
    if stage and grade and chinese and english:
        db.insert_word(stage, grade, chinese, english)
        show_all_words()
        messagebox.showinfo("成功", "单词添加成功！")
    else:
        messagebox.showerror("错误", "请填写所有字段！")

def delete_word():
    """删除单词"""
    word_id = entry_id.get()
    if word_id.isdigit():
        db.delete_word(int(word_id))
        show_all_words()
        messagebox.showinfo("成功", "单词删除成功！")
    else:
        messagebox.showerror("错误", "请输入有效的 ID！")

def update_word():
    """更新单词"""
    word_id = entry_id.get()
    stage = stage_combobox.get()
    grade = grade_combobox.get()
    chinese = entry_chinese.get()
    english = entry_english.get()
    if word_id.isdigit() and stage and grade and chinese and english:
        db.update_word(int(word_id), stage, grade, chinese, english)
        show_all_words()
        messagebox.showinfo("成功", "单词更新成功！")
    else:
        messagebox.showerror("错误", "请输入有效的 ID 并填写所有字段！")

# 创建主窗口
root = tk.Tk()
root.title("单词数据库管理")

# 创建标签和输入框
tk.Label(root, text="ID:").grid(row=0, column=0)
entry_id = tk.Entry(root)
entry_id.grid(row=0, column=1)

# 阶段下拉框
tk.Label(root, text="阶段:").grid(row=1, column=0)
stages = ["小学", "初中", "高中", "大学"]
stage_combobox = ttk.Combobox(root, values=stages)
stage_combobox.set(stages[0])
stage_combobox.grid(row=1, column=1)

# 年级下拉框
tk.Label(root, text="年级:").grid(row=2, column=0)
grade_combobox = ttk.Combobox(root)
grade_combobox.grid(row=2, column=1)

# 处理阶段选择事件的函数
def on_stage_selected(event):
    selected_stage = stage_combobox.get()
    if selected_stage == "小学":
        # 修改为只显示几年级
        grades = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"]
    elif selected_stage == "初中":
        # 修改为只显示几年级
        grades = ["一年级", "二年级", "三年级"]
    elif selected_stage == "高中":
        # 修改为只显示几年级
        grades = ["一年级", "二年级", "三年级"]
    elif selected_stage == "大学":
        # 修改为只显示几年级
        grades = ["一年级", "二年级", "三年级", "四年级"]
    grade_combobox['values'] = grades
    grade_combobox.set(grades[0])

# 绑定阶段选择事件
stage_combobox.bind("<<ComboboxSelected>>", on_stage_selected)
# 初始化年级下拉框
on_stage_selected(None)

tk.Label(root, text="中文:").grid(row=3, column=0)
entry_chinese = tk.Entry(root)
entry_chinese.grid(row=3, column=1)

tk.Label(root, text="英文:").grid(row=4, column=0)
entry_english = tk.Entry(root)
entry_english.grid(row=4, column=1)

# 创建按钮
tk.Button(root, text="显示所有单词", command=show_all_words).grid(row=5, column=0)
tk.Button(root, text="添加单词", command=add_word).grid(row=5, column=1)
tk.Button(root, text="删除单词", command=delete_word).grid(row=6, column=0)
tk.Button(root, text="更新单词", command=update_word).grid(row=6, column=1)

# 创建文本框显示单词信息
text = tk.Text(root, height=10, width=50)
text.grid(row=7, column=0, columnspan=2)

# 初始化数据库
db.initialize_database()
show_all_words()

# 运行主循环
root.mainloop()