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
  const startDate = new Date(2025, 7, 21); // Month is 0-indexed: 7 = August
  let diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

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
    dayBlock.classList.add("scroll-reveal");

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
      qDiv.classList.add("question", "current", "scroll-reveal");
      qDiv.style.background = q.color;

      // Header container with icon and copy button
      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.gap = "10px";
      header.style.position = "relative";

      const iconSpan = document.createElement("span");
      iconSpan.innerHTML = q.icon;
      iconSpan.classList.add("section-icon");
      header.appendChild(iconSpan);

      const titleSpan = document.createElement("span");
      titleSpan.textContent = `Q${q.id} (${q.section})`;
      header.appendChild(titleSpan);

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.type = "button";
      copyBtn.setAttribute("aria-label", "Copy Question & Test Cases");
      copyBtn.innerHTML = "📋";
      header.appendChild(copyBtn);

      // Copy text formatter function
      function formatCopyText(question) {
        let text = `Q${question.id}: ${question.text}\n\n/*\nSample Test Cases:\n`;
        question.testCases.forEach((tc, idx) => {
          text += `Input ${idx + 1}:\n${tc.input}\nOutput ${idx + 1}:\n${tc.output}\n\n`;
        });
        text += "*/";
        return text;
      }

      // Copy button click handler
      copyBtn.addEventListener("click", () => {
        const formattedText = formatCopyText(q);
        navigator.clipboard.writeText(formattedText).then(() => {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = "✅";
          setTimeout(() => (copyBtn.innerHTML = originalText), 1500);
        });
      });

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

    // Display past days (oldest first)
    for (let d = 1; d <= currentDay - 1 && d <= 50; d++) {
      let dayBlock = document.createElement("div");
      dayBlock.classList.add("day-block");
      dayBlock.classList.add("scroll-reveal");

      let dayTitle = document.createElement("div");
      dayTitle.classList.add("day-title");
      dayTitle.textContent = "Day " + d;
      dayBlock.appendChild(dayTitle);

      for (let i = (d - 1) * 2; i < d * 2 && i < allQuestions.length; i++) {
        const q = allQuestions[i];
        let qDiv = document.createElement("div");
        qDiv.classList.add("question", "past", "scroll-reveal");
        qDiv.style.background = q.color;

        // Header container with icon and copy button
        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.gap = "10px";
        header.style.position = "relative";

        const iconSpan = document.createElement("span");
        iconSpan.innerHTML = q.icon;
        iconSpan.classList.add("section-icon");
        header.appendChild(iconSpan);

        const titleSpan = document.createElement("span");
        titleSpan.textContent = `Q${q.id} (${q.section})`;
        header.appendChild(titleSpan);

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.type = "button";
        copyBtn.setAttribute("aria-label", "Copy Question & Test Cases");
        copyBtn.innerHTML = "📋";
        header.appendChild(copyBtn);

        // Copy text formatter function
        function formatCopyText(question) {
          let text = `Q${question.id}: ${question.text}\n\n/*\nSample Test Cases:\n`;
          question.testCases.forEach((tc, idx) => {
            text += `Input ${idx + 1}:\n${tc.input}\nOutput ${idx + 1}:\n${tc.output}\n\n`;
          });
          text += "*/";
          return text;
        }

        // Copy button click handler
        copyBtn.addEventListener("click", () => {
          const formattedText = formatCopyText(q);
          navigator.clipboard.writeText(formattedText).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = "✅";
            setTimeout(() => (copyBtn.innerHTML = originalText), 1500);
          });
        });

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
}

// Scroll reveal - fade and slide on scroll
function scrollRevealInit() {
  const revealElements = document.querySelectorAll('.scroll-reveal');

  function revealOnScroll() {
    const windowHeight = window.innerHeight;

    revealElements.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - 100) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('resize', revealOnScroll);
  revealOnScroll();
}

window.onload = async () => {
  try {
    const data = await loadQuestionsData();
    loadQuestions(data.questionBank);
    scrollRevealInit();
  } catch (error) {
    console.error("Failed to load questions data:", error);
    const container = document.getElementById("question-container");
    container.textContent = "Failed to load questions. Please try again later.";
  }
};
