const quizData = [
  { question: "日本で一番高い山は？",
    choices: ["富士山", "北岳", "奥穂高岳"], answer: 0 },
  { question: "jig.jp の本社がある福井県の市は？",
    choices: ["鯖江市", "福井市", "敦賀市"], answer: 0 },
  { question: "Webページの「動き」を担当する言語は？",
    choices: ["HTML", "CSS", "JavaScript"], answer: 2 }
];

let currentQuestion = 0;
let score = 0;

function showQuestion() {
  const quiz = quizData[currentQuestion];   // 今の問題を取り出す

  // 問題番号（計算してから結合する）
  const number = currentQuestion + 1;
  document.getElementById("question-number").textContent =
    "第" + number + "問 / 全" + quizData.length + "問";

  // 問題文
  document.getElementById("question").textContent = quiz.question;

  // 選択肢（id の番号と choices の番号をそろえる）
  document.getElementById("choice-0").textContent = quiz.choices[0];
  document.getElementById("choice-1").textContent = quiz.choices[1];
  document.getElementById("choice-2").textContent = quiz.choices[2];

  document.getElementById("result").textContent = "";        // 前の結果を消す
  document.getElementById("next-btn").style.display = "none";
}

function checkAnswer(selected) {
  const quiz = quizData[currentQuestion];
  const resultEl = document.getElementById("result");

  if (selected === quiz.answer) {
    resultEl.textContent = "正解！";
    score = score + 1;
  } else {
    const correctText = quiz.choices[quiz.answer];
    resultEl.textContent = "不正解... 正解は「" + correctText + "」";
  }

  document.getElementById("next-btn").style.display = "inline-block";
}

function nextQuestion() {
  currentQuestion = currentQuestion + 1;

  if (currentQuestion < quizData.length) {
    showQuestion();   // まだ問題がある → 次を表示
  } else {
    showResult();     // 最後まで終わった → 結果へ
  }
}

function showResult() {
  document.getElementById("question-number").textContent = "結果発表！";

  document.getElementById("question").textContent =
    quizData.length + "問中 " + score + "問正解！";

  document.getElementById("choices").style.display = "none";
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("result").textContent = "おつかれさま！";
}

showQuestion();   // ページを開いたら最初の問題を表示
