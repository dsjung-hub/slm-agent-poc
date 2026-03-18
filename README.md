# 민원 입력 서비스 + DB/로그

## 포함 파일
- complaint_input_service.py : FastAPI 기반 입력 서비스 1개
- complaint_input_db_log.sql : DB/로그 스키마 1개

## 실행 예시
```bash
pip install fastapi uvicorn pydantic
uvicorn complaint_input_service:app --reload
```

## 주요 API
- GET /health
- POST /complaints
- GET /complaints
