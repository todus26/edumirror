console.log("🔍 GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
console.log("🔍 OPENAI_API_KEY:", process.env.OPENAI_API_KEY);
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// API 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

// Whisper를 사용한 음성 텍스트 변환 (로컬 Python 연동, 안정화 버전)
const { spawn } = require("child_process");
const transcribeAudio = async (audioFilePath) => {
  try {
    console.log(`Starting transcription for: ${audioFilePath}`);
    const pythonPath = "python";
    const scriptPath = path.join(__dirname, "whisper_transcribe.py");
    return await new Promise((resolve, reject) => {
      const proc = spawn(pythonPath, [scriptPath, audioFilePath], { shell: true });
      let output = "";
      let errorOutput = "";
      proc.stdout.on("data", (data) => {
        output += data.toString();
      });
      proc.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });
      proc.on("close", (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (err) {
            console.error("[Whisper][Python] JSON 파싱 실패:", output);
            reject(new Error("Whisper 결과 파싱 실패"));
          }
        } else {
          console.error("[Whisper][Python] 오류:", errorOutput);
          reject(new Error("Whisper(Python) 실행 실패: " + errorOutput));
        }
      });
    });
  } catch (error) {
    console.error("Whisper transcription failed:", error);
    throw new Error("음성 텍스트 변환에 실패했습니다");
  }
};

// Gemini를 사용한 종합 분석
const analyzePresentation = async (analysisData) => {
  try {
    const {
      scriptText, // 원본 발표 대본
      transcribedText, // Whisper로 변환된 음성 텍스트
      sessionMetadata, // 발표 메타데이터
      realtimeMetrics, // 실시간 수집된 데이터
    } = analysisData;

    const prompt = `
당신은 발표 분석 전문가입니다. 다음 데이터를 종합적으로 분석하여 발표를 평가해주세요.
결과는 반드시 한국어로 작성해주세요.

## 분석 데이터

### 1. 원본 발표 대본
${scriptText || "대본 없음"}

### 2. 실제 발표 음성 (텍스트 변환)
${transcribedText || "음성 데이터 없음"}

### 3. 발표 메타데이터
- 제목: ${sessionMetadata.title}
- 테마: ${sessionMetadata.theme}
- 예상 시간: ${sessionMetadata.expectedDuration}초
- 실제 시간: ${sessionMetadata.actualDuration}초

### 4. 실시간 측정 데이터
- 평균 음량: ${realtimeMetrics.avgVolume || "N/A"}
- 발화 속도: ${realtimeMetrics.avgSpeakingPace || "N/A"} WPM
- 시선 처리: 청중 ${realtimeMetrics.audienceContactRatio || 0}%
- 슬라이드 전환: ${realtimeMetrics.pageTransitions || 0}회

## 평가 요청

다음 JSON 형식으로 정확히 응답해주세요:

{
    "overall_score": 85,
    "detailed_scores": {
        "expression": 80,
        "comprehension": 90,
        "delivery": 85,
        "engagement": 82
    },
    "speech_analysis": {
        "script_adherence": 0.89,
        "improvisation_quality": "good",
        "key_points_covered": ["주요포인트1", "주요포인트2"],
        "missing_elements": ["빠진내용"],
        "filler_words_count": 5,
        "speaking_pace_evaluation": "적절함"
    },
    "content_analysis": {
        "clarity": "명확한 구조와 논리적 흐름",
        "depth": "주제에 대한 깊이 있는 이해",
        "relevance": "주제와 내용의 일치도 높음"
    },
    "delivery_analysis": {
        "voice_quality": "안정적인 음성",
        "timing": "적절한 속도와 멈춤",
        "engagement": "청중과의 소통 시도"
    },
    "suggestions": [
        {
            "category": "delivery",
            "priority": "high", 
            "description": "구체적인 개선사항",
            "recommendation": "실행 가능한 조언"
        }
    ]
}
`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    // JSON 파싱
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Gemini 응답에서 JSON을 찾을 수 없습니다");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini analysis failed:", error);

    // 폴백 분석 결과
    return {
      overall_score: 75,
      detailed_scores: {
        expression: 70,
        comprehension: 80,
        delivery: 75,
        engagement: 70,
      },
      speech_analysis: {
        script_adherence: 0.8,
        improvisation_quality: "분석 실패",
        key_points_covered: [],
        missing_elements: [],
        filler_words_count: 0,
        speaking_pace_evaluation: "분석 불가",
      },
      content_analysis: {
        clarity: "분석 실패",
        depth: "분석 실패",
        relevance: "분석 실패",
      },
      delivery_analysis: {
        voice_quality: "분석 실패",
        timing: "분석 실패",
        engagement: "분석 실패",
      },
      suggestions: [
        {
          category: "system",
          priority: "low",
          description: "AI 분석에 실패했습니다",
          recommendation: "다시 시도해보세요",
        },
      ],
    };
  }
};

// 대본 분석 (기존 유지, Gemini 사용)
const analyzeScript = async (scriptText) => {
  try {
    const prompt = `다음 발표 대본을 분석해주세요:

"${scriptText}"

다음 JSON 형식으로 응답해주세요:
{
    "word_count": 단어수,
    "estimated_duration": 예상시간(초),
    "key_topics": ["주요", "키워드", "배열"],
    "structure_analysis": "구조 분석",
    "suggestions": ["개선사항1", "개선사항2"]
}`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // 폴백
    return {
      word_count: scriptText.split(" ").length,
      estimated_duration: Math.ceil(scriptText.split(" ").length * 0.5),
      key_topics: [],
      structure_analysis: "분석 실패",
      suggestions: [],
    };
  } catch (error) {
    console.error("Script analysis failed:", error);
    return {
      word_count: scriptText.split(" ").length,
      estimated_duration: Math.ceil(scriptText.split(" ").length * 0.5),
      key_topics: [],
      structure_analysis: "분석 실패",
      suggestions: [],
    };
  }
};

module.exports = {
  transcribeAudio,
  analyzePresentation,
  analyzeScript,
};
