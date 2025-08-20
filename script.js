// Load questions JSON (replace path if necessary)
async function loadQuestionsData() {
  const response = await fetch("questions.json");
  return response.json();
}

function createTestCasesElement(testCases) {
  if (!testCases || testCases.length === 0) return null;

  const details = document.createElement("details");
  details.classList.add("testcases");
  const summary = document.createElement("summary");
  summary.textContent = "Show Sample Test Cases";
  details.appendChild(summary);

  testCases.forEach(({ input, output }, idx) => {
    const container = document.createElement("div");
    container.classList.add("testcase");

    const inputLabel = document.createElement("b");
    inputLabel.textContent = `Input ${idx + 1}:`;
    const inputPre = document.createElement("pre");
    inputPre.textContent = input;

    const outputLabel = document.createElement("b");
    outputLabel.textContent = `Output ${idx + 1}:`;
    const outputPre = document.createElement("pre");
    outputPre.textContent = output;

    container.appendChild(inputLabel);
    container.appendChild(inputPre);
    container.appendChild(outputLabel);
    container.appendChild(outputPre);

    details.appendChild(container);
  });

  return details;
}

function createVideoLinkElement(videoUrl) {
  if (!videoUrl) return null;
  const link = document.createElement("a");
  link.href = videoUrl;
  link.target = "_blank";
  link.className = "video-link";
  link.textContent = "Watch Video";
  return link;
}

function createNotesElement(notes) {
  if (!notes) return null;
  const div = document.createElement("div");
  div.className = "notes";
  if (typeof notes === "object" && notes.type === "image") {
    const img = document.createElement("img");
    img.src = notes.value;
    img.alt = "Notes image";
    img.style.maxWidth = "100%";
    img.style.display = "block";
    div.appendChild(img);
  } else if (typeof notes === "object" && notes.type === "text") {
    div.textContent = notes.value;
  } else if (typeof notes === "string") {
    div.textContent = notes;
  }
  return div;
}

function flattenQuestions(bank) {
  let all = [];
  bank.forEach((sec) => {
    sec.questions.forEach((q) => {
      all.push({
        ...q,
        section: sec.section,
        icon: sec.icon,
        color: sec.color,
      });
    });
  });
  return all;
}

function loadQuestions(questionBank) {
  const today = new Date();
  const startDate = new Date(2025, 8, 20);
  let diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  // Cap the day count to max 50 days (zero-based = 49)
  if (diffDays > 49) {
    diffDays = 49;
  }

  const container = document.getElementById("question-container");
  container.innerHTML = "";

  const allQuestions = flattenQuestions(questionBank);
  let currentDay = diffDays + 1;

  if (diffDays >= 0 && currentDay <= 50) {
    let dayBlock = document.createElement("div");
    dayBlock.classList.add("day-block");
    let dayTitle = document.createElement("div");
    dayTitle.classList.add("day-title");
    dayTitle.textContent = `📅 Day ${currentDay} (Today)`;
    dayBlock.appendChild(dayTitle);

    for (
      let i = (currentDay - 1) * 2;
      i < currentDay * 2 && i < allQuestions.length;
      i++
    ) {
      const q = allQuestions[i];
      let qDiv = document.createElement("div");
      qDiv.classList.add("question", "current");
      qDiv.style.background = q.color;

      const header = document.createElement("div");
      header.innerHTML = `<span class="section-icon">${q.icon}</span><b>Q${q.id}</b> (${q.section})`;
      qDiv.appendChild(header);

      const questionText = document.createElement("p");
      questionText.textContent = q.text;
      qDiv.appendChild(questionText);

      const testCaseElement = createTestCasesElement(q.testCases);
      if (testCaseElement) qDiv.appendChild(testCaseElement);

      const videoLinkElement = createVideoLinkElement(q.video);
      if (videoLinkElement) qDiv.appendChild(videoLinkElement);

      const notesElement = createNotesElement(q.notes);
      if (notesElement) qDiv.appendChild(notesElement);

      dayBlock.appendChild(qDiv);
    }
    container.appendChild(dayBlock);
  }

  // Display past days in chronological order (oldest first)
  for (let d = 1; d <= currentDay - 1 && d <= 50; d++) {
    let dayBlock = document.createElement("div");
    dayBlock.classList.add("day-block");
    let dayTitle = document.createElement("div");
    dayTitle.classList.add("day-title");
    dayTitle.textContent = "Day " + d;
    dayBlock.appendChild(dayTitle);

    for (let i = (d - 1) * 2; i < d * 2 && i < allQuestions.length; i++) {
      const q = allQuestions[i];
      let qDiv = document.createElement("div");
      qDiv.classList.add("question", "past");
      qDiv.style.background = q.color;

      const header = document.createElement("div");
      header.innerHTML = `<span class="section-icon">${q.icon}</span><b>Q${q.id}</b> (${q.section})`;
      qDiv.appendChild(header);

      const questionText = document.createElement("p");
      questionText.textContent = q.text;
      qDiv.appendChild(questionText);

      const testCaseElement = createTestCasesElement(q.testCases);
      if (testCaseElement) qDiv.appendChild(testCaseElement);

      const videoLinkElement = createVideoLinkElement(q.video);
      if (videoLinkElement) qDiv.appendChild(videoLinkElement);

      const notesElement = createNotesElement(q.notes);
      if (notesElement) qDiv.appendChild(notesElement);

      dayBlock.appendChild(qDiv);
    }
    container.appendChild(dayBlock);
  }
}

window.onload = async () => {
  try {
    const data = await loadQuestionsData();
    loadQuestions(data.questionBank);
  } catch (error) {
    console.error("Failed to load questions data:", error);
    const container = document.getElementById("question-container");
    container.textContent = "Failed to load questions. Please try again later.";
  }
};

