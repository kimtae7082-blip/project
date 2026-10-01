const CITIES = {

    seoul: {
        name: "서울"
    },

    busan: {
        name: "부산"
    },

    incheon: {
        name: "인천"
    },

    daegu: {
        name: "대구"
    },

    daejeon: {
        name: "대전"
    },

    gwangju: {
        name: "광주"
    }

};


// ========================================
// HTML 요소
// ========================================

const terminalLog =
    document.getElementById("terminalLog");

const buzzerCard =
    document.getElementById("buzzerCard");

const buzzerTitle =
    document.getElementById("buzzerTitle");

const buzzerBadge =
    document.getElementById("buzzerBadge");

const buzzerDesc =
    document.getElementById("buzzerDesc");

const weatherResult =
    document.getElementById("weatherResult");

const resultGrid =
    document.getElementById("resultGrid");

const singleButton =
    document.getElementById("btnFetchSingle");

const allButton =
    document.getElementById("btnFetchAll");

const citySelect =
    document.getElementById("citySelect");


// ========================================
// 로그
// ========================================

function log(message) {

    const time =
        new Date().toLocaleTimeString();

    terminalLog.textContent +=
        `\n[${time}] ${message}`;

    terminalLog.scrollTop =
        terminalLog.scrollHeight;
}


// ========================================
// 로그 초기화
// ========================================

function clearLog() {

    terminalLog.textContent =
        "> 로그가 초기화되었습니다.";

}


// ========================================
// 진동벨 상태
// ========================================

function setBuzzerState(
    state,
    title,
    description,
    badgeClass
) {

    buzzerCard.className =
        `buzzer-box mb-4 ${state}`;

    buzzerTitle.textContent =
        title;

    buzzerDesc.textContent =
        description;

    buzzerBadge.className =
        `badge ${badgeClass}`;

    buzzerBadge.textContent =
        state.toUpperCase();

}


// ========================================
// 버튼 잠금
// ========================================

function setButtonsDisabled(
    disabled
) {

    singleButton.disabled =
        disabled;

    allButton.disabled =
        disabled;

    citySelect.disabled =
        disabled;

}


// ========================================
// FastAPI → Node.js
// 단일 날씨 요청
// ========================================

async function fetchCityWeather(
    cityKey,
    signal
) {

    const response =
        await fetch(
            `/api/weather/${cityKey}`,
            {
                signal: signal
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.error ||
            data.detail ||
            `HTTP 오류: ${response.status}`
        );

    }


    return data;

}


// ========================================
// 단일 조회
// async / await
// ========================================

singleButton.addEventListener(
    "click",
    async function () {

        const cityKey =
            citySelect.value;

        const cityInfo =
            CITIES[cityKey];


        weatherResult.classList.add(
            "d-none"
        );

        resultGrid.innerHTML = "";


        setButtonsDisabled(true);


        // Pending
        setBuzzerState(
            "pending",
            "⏳ 진동벨 발급: Pending",
            `${cityInfo.name} 날씨를 요청했습니다. 응답을 기다리는 중...`,
            "bg-warning text-dark"
        );


        log(
            `[주문] ${cityInfo.name} 날씨 요청 시작`
        );


        // 5초 타이머
        const controller =
            new AbortController();

        const timer =
            setTimeout(
                () => {
                    controller.abort();
                },
                5000
            );


        try {

            // async / await
            const weather =
                await fetchCityWeather(
                    cityKey,
                    controller.signal
                );


            clearTimeout(timer);


            // 성공
            setBuzzerState(
                "fulfilled",
                "✅ 진동벨 울림: Fulfilled",
                `${weather.city} 날씨 데이터 수령 성공!`,
                "bg-success"
            );


            log(
                `[완료] ${weather.city} | ` +
                `기온 ${weather.temperature}℃ | ` +
                `습도 ${weather.humidity}% | ` +
                `풍속 ${weather.windSpeed} km/h`
            );


            resultGrid.innerHTML = `

                <div class="col-4">

                    <div class="text-muted small">
                        현재 기온
                    </div>

                    <h3 class="fw-bold text-primary mt-1">
                        ${weather.temperature} ℃
                    </h3>

                </div>


                <div class="col-4">

                    <div class="text-muted small">
                        습도
                    </div>

                    <h3 class="fw-bold text-info mt-1">
                        ${weather.humidity} %
                    </h3>

                </div>


                <div class="col-4">

                    <div class="text-muted small">
                        풍속
                    </div>

                    <h3 class="fw-bold text-secondary mt-1">
                        ${weather.windSpeed} km/h
                    </h3>

                </div>

            `;


            weatherResult.classList.remove(
                "d-none"
            );


        } catch (error) {

            clearTimeout(timer);


            let message;


            if (
                error.name ===
                "AbortError"
            ) {

                message =
                    "5초가 지나 요청이 취소되었습니다.";

            } else {

                message =
                    error.message;

            }


            // 실패
            setBuzzerState(
                "rejected",
                "❌ 주문 실패: Rejected",
                `에러: ${message}`,
                "bg-danger"
            );


            log(
                `[오류] ${message}`
            );


        } finally {

            setButtonsDisabled(false);

        }

    }
);


// ========================================
// 6개 도시 병렬 조회
// ========================================

allButton.addEventListener(
    "click",
    async function () {

        weatherResult.classList.add(
            "d-none"
        );

        resultGrid.innerHTML = "";


        setButtonsDisabled(true);


        setBuzzerState(
            "pending",
            "⏳ 6개 도시 조회 중...",
            "6개 도시의 날씨를 동시에 요청했습니다.",
            "bg-warning text-dark"
        );


        log(
            "[병렬 주문] 6개 도시 요청 시작"
        );


        const startTime =
            performance.now();


        const controller =
            new AbortController();


        const timer =
            setTimeout(
                () => {
                    controller.abort();
                },
                7000
            );


        try {

            const response =
                await fetch(
                    "/api/weather",
                    {
                        signal:
                            controller.signal
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.detail ||
                    `HTTP 오류: ${response.status}`
                );

            }


            clearTimeout(timer);


            const duration =
                (
                    performance.now()
                    - startTime
                ).toFixed(0);


            setBuzzerState(
                "fulfilled",
                "✅ 6개 도시 일괄 수령 완료!",
                `모든 날씨 정보를 ${duration}ms 만에 가져왔습니다.`,
                "bg-success"
            );


            log(
                "[완료] 6개 도시 날씨 조회 완료"
            );


            resultGrid.innerHTML =
                data.map(
                    function (weather) {

                        return `

                            <div class="col-6 col-md-4">

                                <div class="card p-3 border shadow-sm">

                                    <div class="fw-bold">
                                        ${weather.city}
                                    </div>

                                    <div class="h4 fw-bold text-primary my-2">
                                        ${weather.temperature}℃
                                    </div>

                                    <div class="small text-muted">
                                        습도 ${weather.humidity}%
                                    </div>

                                    <div class="small text-secondary">
                                        풍속 ${weather.windSpeed} km/h
                                    </div>

                                </div>

                            </div>

                        `;

                    }
                ).join("");


            weatherResult.classList.remove(
                "d-none"
            );


        } catch (error) {

            clearTimeout(timer);


            let message;


            if (
                error.name ===
                "AbortError"
            ) {

                message =
                    "7초가 지나 요청이 취소되었습니다.";

            } else {

                message =
                    error.message;

            }


            setBuzzerState(
                "rejected",
                "❌ 6개 도시 조회 실패",
                `에러: ${message}`,
                "bg-danger"
            );


            log(
                `[오류] ${message}`
            );


        } finally {

            setButtonsDisabled(false);

        }

    }
);