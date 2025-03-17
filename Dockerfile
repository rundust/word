# 使用官方Python运行时作为父镜像
FROM python:3.9-slim
 
# 设置工作目录在容器内
WORKDIR /app
 
# 将当前目录内容复制到位于/app中的容器内
COPY . /app
 
# 安装requirements.txt中指定的任何依赖项
RUN pip install --no-cache-dir -r requirements.txt
 
# 使端口80对外可用（如果你的应用运行在80端口）
EXPOSE 80
 
# 定义环境变量，默认Python应用的运行命令
ENV NAME World
CMD ["python", "app.py"]