const { GoogleGenerativeAI, 
        HarmCategory,
        HarmBlockThreshold, 
      } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyCNoJmeAJ2OsQcBkHt640GrW8dHIX-j6-o");

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(relativePath, mimeType) {
  // __dirname과 path.join()을 사용하여 상대 경로를 절대 경로로 변환
  const absolutePath = path.join(__dirname, relativePath);

  return {
    inlineData: {
      // 절대 경로로 파일을 읽음
      data: Buffer.from(fs.readFileSync(absolutePath)).toString("base64"),
      mimeType
    },
  };
}

async function run(stockCode, imagePath) {

  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const generationConfig = {
    temperature: 1,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};

  const safetySettings = [
      {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
  ];

  const prompt ="Answer the following questions in Korean." + stockCode + " First answer the information, market, issues, and outlook of the stock, and then analyze the image file to interpret the graph.";
  // const prompt ="아래 질문에 대해 한글로 답해줘." + stockCode + "의 주가 예상 그래프이다. 해당 종목의 시황을 분석하여 이를 바탕으로 해석해줘.";

  const imageParts = [
    fileToGenerativePart(imagePath, "image/png"),
  ];

  const result = await model.generateContent([prompt, ...imageParts], {
    generationConfig,
    safetySettings
  });
  
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}

module.exports = {
  run
};