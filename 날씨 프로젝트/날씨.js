const CITIES={
    seoul: {name: "서울", lat: 37.5665, lon: 126.9780},
    busan: {name: "부산", lat: 35.1796, lon: 129.0756},
    daegu: {name: "대구", lat: 35.8714, lon: 128.6014},
    incheon: {name: "인천", lat: 37.4563, lon: 126.7052},
    gwangju: {name: "광주", lat: 35.1595, lon: 126.8526},
    daejeon: {name: "대전", lat: 36.3504, lon: 127.3845},
};

const logBox = document.getElementById('logBox');
const resultCard = document.getElementById('resultCard');
const cityNameEl = document.getElementById('cityName');
const cityTempEl = document.getElementById('cityTemp');
const cityExtraEl = document.getElementById('cityExtra');

function log(msg) {
    const time = new Date().toLocaleTimeString();
    logBox.textContent += `\n[${time}] ${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
}

function clearLog() {
    logBox.textContent = '> 콘솔이 초기화되었습니다.';
}

document.getElementById('btnFetch').addEventListener('click', () => {
    const cityKey = document.getElementById('citySelect').value;
    const target = CITIES[cityKey];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${target.lat}&longitude=${target.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    log(`1. fetch() 주문서 발송: ${target.name}`);
    resultCard.classList.add('d-none');

    fetch(url)
        .then((response) => {
            log(`2. 서버 응답 도착 (HTTP 상태 코드: ${response.status})`);
            if (!response.ok) {
                throw new Error(`HTTP 오류: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const current = data.current;
            log(`3. JSON 번역 완료! 기온: ${current.temperature_2m}°C, 습도: ${current.relative_humidity_2m}%`);

            cityNameEl.textContent = target.name;
            cityTempEl.textContent = `${current.temperature_2m}°C`;
            cityExtraEl.textContent = `습도: ${current.relative_humidity_2m}%, 풍속: ${current.wind_speed_10m} m/s`;
            resultCard.classList.remove('d-none');

        })

        .catch((error) => {
            log(`❌ 오류 발생: ${error.message}`);
            alert(`날씨 정보를 가져오는 데 실패했습니다: ${error.message}`);
        })
        .finally(() => {
            log('4. fetch() 요청 사이클 완료');
        });
});