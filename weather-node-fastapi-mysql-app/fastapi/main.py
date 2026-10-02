from fastapi import FastAPI
import httpx
import asyncio


app = FastAPI()


# ==============================
# 도시 정보
# ==============================

CITIES = {

    "seoul": {
        "name": "서울",
        "lat": 37.5665,
        "lon": 126.9780
    },

    "busan": {
        "name": "부산",
        "lat": 35.1796,
        "lon": 129.0756
    },

    "incheon": {
        "name": "인천",
        "lat": 37.4563,
        "lon": 126.7052
    },

    "daegu": {
        "name": "대구",
        "lat": 35.8714,
        "lon": 128.6014
    },

    "daejeon": {
        "name": "대전",
        "lat": 36.3504,
        "lon": 127.3845
    },

    "gwangju": {
        "name": "광주",
        "lat": 35.1595,
        "lon": 126.8526
    }

}


# ==============================
# 기본 테스트
# ==============================

@app.get("/")
async def home():

    return {
        "message": "FastAPI 서버가 정상적으로 실행되고 있습니다."
    }


# ==============================
# 상태 확인
# ==============================

@app.get("/health")
async def health():

    return {
        "status": "ok"
    }


# ==============================
# 서울 날씨 테스트
# ==============================

@app.get("/weather/{city_key}")
async def get_weather(city_key: str):

    # 존재하는 도시인지 확인
    if city_key not in CITIES:

        return {
            "error": "존재하지 않는 도시입니다."
        }


    city = CITIES[city_key]


    # Open-Meteo 주소
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={city['lat']}"
        f"&longitude={city['lon']}"
        "&current="
        "temperature_2m,"
        "relative_humidity_2m,"
        "wind_speed_10m"
    )


    # Open-Meteo 요청
    async with httpx.AsyncClient(
        timeout=10
    ) as client:

        response = await client.get(url)


    # HTTP 오류 확인
    response.raise_for_status()


    data = response.json()


    # 현재 날씨
    current = data["current"]


    # 필요한 데이터만 반환
    return {

        "city": city["name"],

        "temperature":
            current["temperature_2m"],

        "humidity":
            current["relative_humidity_2m"],

        "windSpeed":
            current["wind_speed_10m"]

    }
# ==============================
# 6개 도시 날씨 조회
# ==============================

@app.get("/weather")
async def get_all_weather():

    results = []

    async with httpx.AsyncClient(timeout=10) as client:

        # 6개 도시를 동시에 요청
        tasks = []

        for city_key, city in CITIES.items():

            url = (
                "https://api.open-meteo.com/v1/forecast"
                f"?latitude={city['lat']}"
                f"&longitude={city['lon']}"
                "&current="
                "temperature_2m,"
                "relative_humidity_2m,"
                "wind_speed_10m"
            )

            tasks.append(
                client.get(url)
            )

        responses = await asyncio.gather(*tasks)


    # 결과 정리
    for (city_key, city), response in zip(
        CITIES.items(),
        responses
    ):

        response.raise_for_status()

        data = response.json()

        current = data["current"]

        results.append({

            "city": city["name"],

            "temperature":
                current["temperature_2m"],

            "humidity":
                current["relative_humidity_2m"],

            "windSpeed":
                current["wind_speed_10m"]

        })


    return results