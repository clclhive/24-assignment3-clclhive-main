import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [station, setStation] = useState(""); // 역 이름 입력 상태
  const [data, setData] = useState([]); // API 결과 저장
  const [error, setError] = useState(""); // 에러 메시지 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 hook

  const fetchData = async () => {
    try {
      setError(""); // 기존 에러 메시지 초기화
      setData([]); // 이전 데이터 초기화

      const response = await axios.get(
        `http://swopenAPI.seoul.go.kr/api/subway/${process.env.REACT_APP_API_KEY}/json/realtimeStationArrival/0/5/${station}`
      );

      // 응답 데이터 확인
      if (!response.data.realtimeArrivalList || response.data.realtimeArrivalList.length === 0) {
        setError("잘못된 역 이름입니다. 다시 입력해주세요.");
        return;
      }

      // 데이터 설정
      setData(response.data.realtimeArrivalList);
    } catch (error) {
      console.error("API 호출 실패:", error);
      setError("API 호출 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleVisualize = () => {
    navigate("/visualize", { state: { data } }); // 데이터를 시각화 페이지로 전달
  };

  return (
    <div>
      <h1>지하철 실시간 도착 정보</h1>

      {/* 역 이름 입력 필드 */}
      <input
        type="text"
        placeholder="역 이름을 입력하세요"
        value={station}
        onChange={(e) => setStation(e.target.value)} // 입력 값 업데이트
        style={{ padding: "10px", width: "200px", marginBottom: "10px" }}
      />
      <button onClick={fetchData} style={{ padding: "10px 20px", marginLeft: "10px" }}>
        조회
      </button>

      {/* 에러 메시지 표시 */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 데이터 표시 */}
      {data.length > 0 && (
        <div>
          <ul>
            {data.map((item, index) => (
              <li key={index}>
                {item.trainLineNm} - {item.arvlMsg2}
              </li>
            ))}
          </ul>

          {/* 시각화 페이지로 이동 버튼 */}
          <button
            onClick={handleVisualize}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            시각화 보기
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
