import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Bubble } from "react-chartjs-2";

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, BarElement, Tooltip, Legend);

const Visualize = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const data = state?.data || [];

  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return <p>도착 정보를 찾을 수 없습니다. 다시 검색해주세요.</p>;
  }

  // 도착까지 남은 시간 (막대 그래프 데이터)
  const barChartData = {
    labels: data.map((item) => item.trainLineNm),
    datasets: [
      {
        label: "도착까지 남은 시간 (분)",
        data: data.map((item) => {
          const minutes = parseInt(item.arvlMsg2.match(/\d+/)?.[0]) || 0;
          return minutes;
        }),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  // Bubble Chart: 노선별 열차 도착 분포
  const lineCounts = data.reduce((acc, item) => {
    const line = item.trainLineNm || "알 수 없는 노선";
    acc[line] = (acc[line] || 0) + 1;
    return acc;
  }, {});

  const bubbleData = {
    datasets: Object.keys(lineCounts).map((line, index) => ({
      label: line,
      data: [
        {
          x: index + 1, // 노선을 x축에 배치
          y: lineCounts[line], // y축은 열차 수
          r: Math.max(lineCounts[line] * 3, 10), // 버블 크기
        },
      ],
      backgroundColor: `rgba(${(index * 50) % 255}, ${(index * 100) % 255}, 192, 0.6)`,
    })),
  };

  // 도착 예정 시간 분포 (꺾은선 그래프 데이터)
  const timeBuckets = [0, 5, 10, 15, 20]; // 5분 단위로 구간 설정, 20분까지만 포함
  const timeBucketCounts = new Array(timeBuckets.length - 1).fill(0); // 각 구간의 초기값

  data.forEach((item) => {
    const match = item.arvlMsg2.match(/\d+/);
    if (match) {
      const minutes = parseInt(match[0], 10);
      for (let i = 0; i < timeBuckets.length - 1; i++) {
        if (minutes >= timeBuckets[i] && minutes < timeBuckets[i + 1]) {
          timeBucketCounts[i]++;
          break;
        }
      }
    }
  });

  const lineChartData = {
    labels: timeBuckets.slice(0, -1).map((value, index) => `${value}-${timeBuckets[index + 1]}분`),
    datasets: [
      {
        label: "도착 예정 시간 분포",
        data: timeBucketCounts,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div style={{ width: "90%", margin: "0 auto" }}>
      <h1>지하철 도착 정보 시각화</h1>

      {/* 도착까지 남은 시간 (막대 그래프) */}
      <div>
        <h2>도착까지 남은 시간</h2>
        <div style={{ width: "80%", margin: "0 auto" }}>
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return `${context.raw}분 후 도착`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "열차 노선",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "남은 시간 (분)",
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* 노선별 열차 도착 분포 (Bubble Chart) */}
      <div>
        <h2>노선별 열차 도착 분포</h2>
        <div style={{ width: "80%", margin: "0 auto" }}>
          <Bubble
            data={bubbleData}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const { label, raw } = context.dataset;
                      if (!raw || typeof raw.y === "undefined") {
                        return `${label}: 데이터 없음`;
                      }
                      return `${label}: ${raw.y}대`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "노선 (인덱스)",
                  },
                  ticks: {
                    stepSize: 1,
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "열차 수",
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* 도착 예정 시간 분포 (꺾은선 그래프) */}
      <div>
        <h2>도착 예정 시간 분포 (5분 단위, 최대 20분)</h2>
        <div style={{ width: "80%", margin: "0 auto" }}>
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return `${context.raw}대`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "도착 예정 시간 구간 (분)",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "열차 수",
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* 처음 화면으로 돌아가기 버튼 */}
      <button
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        처음 화면으로
      </button>
    </div>
  );
};

export default Visualize;
