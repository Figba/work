# 统一使用 Node 22（>=18），并自带 npm，满足前端构建要求
FROM node:22-bullseye

WORKDIR /workspace

# 常用系统工具（轻量安装）
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*
