// Load original questions JSON
async function loadQuestionsData() {
  const response = await fetch("questions.json");
  return response.json();
}

// Load additional questions JSON (for days 51-100)
async function loadAdditionalData() {
  const response = await fetch("questions2.json");
  const data = await response.json();
  console.log("Loaded questions2.json:", data.problems); // Debug: Check array length and content
  return data.problems; // Extract the array from "problems" key
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

function createLinkElement(linkUrl) {
  if (!linkUrl) return null;

  const link = document.createElement("a");
  link.href = linkUrl;
  link.target = "_blank";
  link.className = "problem-link";
  link.textContent = "View Problem";

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

// Reusable function to create a question div (handles both original and additional)
function createQuestionDiv(q, isCurrent) {
  // For additional questions, ensure compatibility with original structure
  const compatibleQ = {
    ...q,
    section: q.section || '', // Empty for additional
    icon: q.icon || '', // Empty for additional
    color: q.color || '#f0f0f0', // Default color for additional
    text: q.text || q.title || '', // Use title as text for additional
    testCases: q.testCases || [], // Empty for additional
    video: q.video || q.video_link || '', // video_link for additional
    link: q.link || '' // Only for additional
  };

  const qDiv = document.createElement("div");
  qDiv.classList.add("question", isCurrent ? "current" : "past", "scroll-reveal");
  qDiv.style.background = compatibleQ.color;

  // Header container with icon and copy button
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.gap = "10px";
  header.style.position = "relative";

  const iconSpan = document.createElement("span");
  iconSpan.innerHTML = compatibleQ.icon;
  iconSpan.classList.add("section-icon");
  header.appendChild(iconSpan);

  const titleSpan = document.createElement("span");
  titleSpan.textContent = compatibleQ.section 
    ? `Q${compatibleQ.id} (${compatibleQ.section})` 
    : `Q${compatibleQ.id}`;
  header.appendChild(titleSpan);

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.type = "button";
  copyBtn.setAttribute("aria-label", "Copy Question & Test Cases");
  copyBtn.innerHTML = "📋";
  header.appendChild(copyBtn);

  // Updated copy text formatter (handles both formats)
  function formatCopyText(question) {
    let text = `Q${question.id}: ${question.text}\n`;
    if (question.link) {
      text += `Link: ${question.link}\n`;
    }
    if (question.testCases && question.testCases.length > 0) {
      text += `\n/*\nSample Test Cases:\n`;
      question.testCases.forEach((tc, idx) => {
        text += `Input ${idx + 1}:\n${tc.input}\nOutput ${idx + 1}:\n${tc.output}\n\n`;
      });
      text += "*/";
    }
    return text;
  }

  // Copy button click handler
  copyBtn.addEventListener("click", () => {
    const formattedText = formatCopyText(compatibleQ);
    navigator.clipboard.writeText(formattedText).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = "✅";
      setTimeout(() => (copyBtn.innerHTML = originalText), 1500);
    });
  });

  qDiv.appendChild(header);

  const questionText = document.createElement("pre");
  questionText.textContent = compatibleQ.text;
  qDiv.appendChild(questionText);

  const testCaseElement = createTestCasesElement(compatibleQ.testCases);
  if (testCaseElement) qDiv.appendChild(testCaseElement);

  const videoLinkElement = createVideoLinkElement(compatibleQ.video);
  if (videoLinkElement) qDiv.appendChild(videoLinkElement);

  const linkElement = createLinkElement(compatibleQ.link);
  if (linkElement) qDiv.appendChild(linkElement);

  const notesElement = createNotesElement(compatibleQ.notes);
  if (notesElement) qDiv.appendChild(notesElement);

  return qDiv;
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

function loadQuestions(questionBank, additionalQuestions) {
  const today = new Date();
  const startDate = new Date(2025, 7, 21); // August 21, 2025
  let diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  console.log("Calculated diffDays:", diffDays, "Current Day:", diffDays + 1); // Debug: Verify date

  if (diffDays > 99) {
    diffDays = 99;
  }

  const container = document.getElementById("question-container");
  container.innerHTML = "";

  const allOriginal = flattenQuestions(questionBank); // 100 questions
  const allAdditional = additionalQuestions; // 50 questions from "problems"
  console.log("Original questions count:", allOriginal.length); // Debug
  console.log("Additional questions count:", allAdditional.length); // Debug

  let currentDay = diffDays + 1;

  if (currentDay >= 1 && currentDay <= 100) {
    // Current day block
    let dayBlock = document.createElement("div");
    dayBlock.classList.add("day-block", "scroll-reveal");

    let dayTitle = document.createElement("div");
    dayTitle.classList.add("day-title");
    dayTitle.textContent = `📅 Day ${currentDay} (Today)`;
    dayBlock.appendChild(dayTitle);

    if (currentDay <= 50) {
      // 2 questions from original
      for (
        let i = (currentDay - 1) * 2;
        i < currentDay * 2 && i < allOriginal.length;
        i++
      ) {
        const q = allOriginal[i];
        const qDiv = createQuestionDiv(q, true);
        dayBlock.appendChild(qDiv);
      }
    } else {
      // 1 question from additional (index 0 for day 51, 1 for day 52, etc.)
      const idx = currentDay - 51;
      console.log("Loading additional question for current day at index:", idx); // Debug
      if (idx >= 0 && idx < allAdditional.length) {
        const q = allAdditional[idx];
        console.log("Question loaded:", q); // Debug: Inspect question object
        const qDiv = createQuestionDiv(q, true);
        dayBlock.appendChild(qDiv);
      } else {
        console.log("No additional question available for index:", idx); // Debug
      }
    }

    container.appendChild(dayBlock);

    // Past days (oldest first)
    for (let d = 1; d < currentDay && d <= 100; d++) {
      let dayBlock = document.createElement("div");
      dayBlock.classList.add("day-block", "scroll-reveal");

      let dayTitle = document.createElement("div");
      dayTitle.classList.add("day-title");
      dayTitle.textContent = `Day ${d}`;
      dayBlock.appendChild(dayTitle);

      if (d <= 50) {
        // 2 questions from original
        for (let i = (d - 1) * 2; i < d * 2 && i < allOriginal.length; i++) {
          const q = allOriginal[i];
          const qDiv = createQuestionDiv(q, false);
          dayBlock.appendChild(qDiv);
        }
      } else {
        // 1 question from additional
        const idx = d - 51;
        if (idx >= 0 && idx < allAdditional.length) {
          const q = allAdditional[idx];
          const qDiv = createQuestionDiv(q, false);
          dayBlock.appendChild(qDiv);
        }
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
    const originalData = await loadQuestionsData();
    const additionalData = await loadAdditionalData();
    loadQuestions(originalData.questionBank, additionalData);
    scrollRevealInit();
  } catch (error) {
    console.error("Failed to load questions data:", error);
    const container = document.getElementById("question-container");
    container.textContent = "Failed to load questions. Please try again later.";
  }
};
