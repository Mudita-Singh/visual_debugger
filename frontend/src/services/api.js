const API_BASE = "http://localhost:8080/api";

export async function getAIExplanation(code, language) {
  try {
    const res = await fetch(`${API_BASE}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    return data.explanation || "No explanation found";
  } catch (err) {
    console.error("Explain error:", err);
    return "Error getting explanation.";
  }
}

export async function getFlowchart(code, language) {
  try {
    const res = await fetch(`${API_BASE}/flowchart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Flowchart error:", err);
    return { nodes: [], edges: [] };
  }
}
