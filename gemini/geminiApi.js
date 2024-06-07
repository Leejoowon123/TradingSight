const { GoogleGenerativeAI } = require("@google/generative-ai");
// import { GoogleGenerativeAI } from "@google/generative-ai"
// import fs from "fs";
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
// function fileToGenerativePart(path, mimeType) {
//   return {
//     inlineData: {
//       data: Buffer.from(fs.readFileSync(path)).toString("base64"),
//       mimeType
//     },
//   };
// }

async function run(imagePath) {

  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "주가 예상 그래프이다. 이를 해석해줘.";

  const imageParts = [
    // fileToGenerativePart("../stockImages/"+document.querySelector('input').value+".png", "image/png"),
    fileToGenerativePart(imagePath, "image/png"),
  ];
  // const imageParts = "../stockImages/"+document.querySelector('input').value+".png";

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();
  // var template = '<div class="line"><span class="chat-box">' + text +'</span></div>';
  // document.querySelector('.chatbot-body').insertAdjacentHTML('beforeend',template);
  console.log(text);
  return text;
}

module.exports = {
  run
};

// document.querySelector('#send').addEventListener('click', function() {
  // run();
// })