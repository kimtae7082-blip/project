const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();

const PORT = 3000;

// ========================================
// FastAPI 주소
// ========================================

const FASTAPI_URL = "http://127.0.0.1:8000";


// ========================================
// JSON 사용
// ========================================

app.use(express.json());


// ========================================
// 정적 파일
// ========================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ========================================
// MySQL 연결
// ========================================

const db = mysql.createPool({

    host: "localhost",

    user: "root",

    password: "1234",

    // ★ SQL 파일 이름이 아니라 DB 이름
    database: "gmarketDB",

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});


// ========================================
// MySQL 연결 테스트
// ========================================

async function testDatabase() {

    try {

        const connection =
            await db.getConnection();

        console.log(
            "MySQL 연결 성공: gmarketDB"
        );

        connection.release();

    } catch (error) {

        console.error(
            "MySQL 연결 실패:",
            error.message
        );

    }

}


// ========================================
// 홈페이지
// ========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "날씨.html"
        )
    );

});


// ========================================
// FastAPI 연결 상태 확인
// ========================================

app.get(
    "/api/health",
    async (req, res) => {

        try {

            const response =
                await fetch(
                    `${FASTAPI_URL}/health`
                );

            const data =
                await response.json();

            res.json({

                node: "ok",

                fastapi: data

            });

        } catch (error) {

            console.error(
                "[FastAPI 연결 오류]",
                error.message
            );

            res.status(502).json({

                node: "ok",

                fastapi: "연결 실패",

                error:
                    error.message

            });

        }

    }
);


// ========================================
// 단일 도시 날씨
// Node.js → FastAPI
// ========================================

app.get(
    "/api/weather/:cityKey",
    async (req, res) => {

        const cityKey =
            req.params.cityKey;

        console.log(
            `[Node.js] ${cityKey} 날씨 요청`
        );

        try {

            const response =
                await fetch(
                    `${FASTAPI_URL}/weather/${cityKey}`
                );

            const data =
                await response.json();

            if (!response.ok) {

                return res
                    .status(response.status)
                    .json(data);

            }

            console.log(
                `[Node.js] ${data.city} 날씨 수신 완료`
            );

            res.json(data);

        } catch (error) {

            console.error(
                "[Node.js → FastAPI 오류]",
                error.message
            );

            res.status(502).json({

                error:
                    "FastAPI 서버에 연결할 수 없습니다.",

                detail:
                    "FastAPI가 http://127.0.0.1:8000 에서 실행 중인지 확인하세요."

            });

        }

    }
);


// ========================================
// 6개 도시 날씨
// Node.js → FastAPI
// ========================================

app.get(
    "/api/weather",
    async (req, res) => {

        console.log(
            "[Node.js] 6개 도시 날씨 요청 시작"
        );

        try {

            const response =
                await fetch(
                    `${FASTAPI_URL}/weather`
                );

            const data =
                await response.json();

            if (!response.ok) {

                return res
                    .status(response.status)
                    .json(data);

            }

            console.log(
                "[Node.js] 6개 도시 날씨 수신 완료"
            );

            res.json(data);

        } catch (error) {

            console.error(
                "[Node.js → FastAPI 오류]",
                error.message
            );

            res.status(502).json({

                error:
                    "FastAPI 서버에 연결할 수 없습니다.",

                detail:
                    "FastAPI가 http://127.0.0.1:8000 에서 실행 중인지 확인하세요."

            });

        }

    }
);


// ========================================
// MySQL 회원 목록
// Node.js → MySQL
// ========================================

app.get(
    "/api/users",
    async (req, res) => {

        console.log(
            "[Node.js] 회원 목록 요청"
        );

        try {

            const [rows] =
                await db.query(
                    "SELECT * FROM userTBL"
                );

            console.log(
                `[Node.js] 회원 ${rows.length}명 조회 완료`
            );

            res.json(rows);

        } catch (error) {

            console.error(
                "[MySQL 오류]",
                error.message
            );

            res.status(500).json({

                error:
                    "회원 데이터를 가져오지 못했습니다.",

                detail:
                    error.message

            });

        }

    }
);


// ========================================
// 서버 시작
// ========================================

app.listen(
    PORT,
    async () => {

        console.log(
            `Node.js 서버 실행: http://localhost:${PORT}`
        );

        console.log(
            `FastAPI 연결 주소: ${FASTAPI_URL}`
        );

        await testDatabase();

    }
);