async function sendMessage() {
  const message = input.value.trim();
  if (message === "") return;

  input.value = "";
  appendMessage("user", message);

  const chatHistory = getChatHistory();
  chatHistory.push({
    role: "user",
    text: message
  });
  saveChatHistory(chatHistory);

  showTyping();

  const dashboardContext = `
You are an AI assistant for the InfoDash dashboard.

Dashboard Information:
Weather: ${currentWeatherContext || "Weather data unavailable"}
News: ${currentNewsContext || "News data unavailable"}

Provide short, helpful, and friendly answers. Use the dashboard information whenever the user asks about weather or news.
`;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `${dashboardContext}\n\nUser: ${message}`
        }
      ]
    }
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ contents })
      }
    );

    const result = await response.json();

    removeTyping();

    if (result.candidates?.length > 0) {
      const reply = result.candidates[0].content.parts[0].text;

      appendMessage("ai", reply);

      const updatedHistory = getChatHistory();
      updatedHistory.push({
        role: "ai",
        text: reply
      });

      saveChatHistory(updatedHistory);
    } else {
      console.error(result);
      appendMessage(
        "ai",
        result.error?.message || "Unable to generate a response."
      );
    }
  } catch (error) {
    removeTyping();
    console.error(error);
    appendMessage("ai", "Something went wrong. Please try again.");
  }
}

document.getElementById("city-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    fetchAll();
  }
});

document.getElementById("ai-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

renderChips();
document.getElementById("city-input").value = "Delhi";
fetchAll();
