-- 민원 입력용 DB/로그 스키마 및 예시 SQL

CREATE TABLE complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    requester TEXT NOT NULL,
    system_name TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('상','중','하')),
    detail TEXT,
    status TEXT NOT NULL DEFAULT '접수',
    created_at TEXT NOT NULL
);

CREATE TABLE complaint_input_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER,
    action_type TEXT NOT NULL,   -- INSERT, UPDATE, STATUS_CHANGE
    actor TEXT NOT NULL,
    action_at TEXT NOT NULL,
    action_detail TEXT,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id)
);

-- 민원 입력 예시
INSERT INTO complaints (title, requester, system_name, priority, detail, status, created_at)
VALUES ('처리상태 검색조건 추가', '홍길동', '민원조회 시스템', '중',
        '민원조회 화면에 처리상태 검색조건과 결과 컬럼을 추가해주세요.', '접수', '2026-03-18T13:00:00');

-- 로그 저장 예시
INSERT INTO complaint_input_log (complaint_id, action_type, actor, action_at, action_detail)
VALUES (1, 'INSERT', '홍길동', '2026-03-18T13:00:00', '민원 등록: 처리상태 검색조건 추가');

-- 최근 민원 목록 조회
SELECT id, title, requester, system_name, priority, status, created_at
FROM complaints
ORDER BY id DESC;

-- 입력 로그 조회
SELECT log_id, complaint_id, action_type, actor, action_at, action_detail
FROM complaint_input_log
ORDER BY log_id DESC;
