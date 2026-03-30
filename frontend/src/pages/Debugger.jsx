import React, { useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

// 🔹 Direct backend URL
const BACKEND_URL = "http://localhost:8080";

export default function Debugger() {
  // -------------------- Debugger state --------------------
  const [code, setCode] = useState(
    `public class Hello {
  public static void main(String[] args) {
    int x = 5;
    int y = 10;
    int sum = x + y;
    System.out.println(sum);
  }
}`
  );

  const [language, setLanguage] = useState("Java");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [callStack, setCallStack] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  // -------------------- Run Debugger --------------------
  const runDebugger = async () => {
    setErrorMsg("");
    try {
      const explainResp = await fetch(`${BACKEND_URL}/api/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
        credentials: "include",
      });
      const explainData = await explainResp.json();
      if (!explainResp.ok) throw new Error(explainData.error);
      setExplanation(explainData.explanation || "No explanation available.");

      const flowResp = await fetch(`${BACKEND_URL}/api/flowchart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
        credentials: "include",
      });
      const flowData = await flowResp.json();
      if (!flowResp.ok) throw new Error(flowData.error);
      setNodes(flowData.nodes || []);
      setEdges(flowData.edges || []);

      const matches = [
        ...code.matchAll(/(void|int|public|private|protected)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g),
      ];
      const methods = matches.map((m) => m[2]);
      setCallStack(methods.length ? methods : ["main"]);

      setHistory((prev) => [...prev, { code, time: new Date().toLocaleString() }]);
    } catch (error) {
      console.error("Debugger error:", error);
      setErrorMsg("⚠️ " + error.message);
    }
  };

  // -------------------- Utility functions --------------------
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    alert("Code copied!");
  };

  const clearHistory = () => setHistory([]);

  // -------------------- Render --------------------
  return (
    <div className="p-6 text-white" style={{ background: "#0F172A", minHeight: "100vh" }}>
      <h1 className="text-2xl font-bold text-blue-400 mb-6">Visual Code Debugger</h1>

      {errorMsg && <div className="mb-4 p-3 bg-red-600 rounded">{errorMsg}</div>}

      <div className="grid grid-cols-2 gap-6">
        {/* CODE EDITOR */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Code Editor</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-[300px] p-4 rounded-lg bg-slate-800 text-green-300 font-mono text-sm"
          />
          <div className="flex justify-between items-center mt-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-700 p-2 rounded text-white"
            >
              <option>Java</option>
              <option>Python</option>
              <option>JavaScript</option>
              <option>C</option>
              <option>C++</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="bg-gray-600 px-3 py-2 rounded-lg hover:bg-gray-700"
              >
                Copy
              </button>
              <button
                onClick={runDebugger}
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Run Code
              </button>
            </div>
          </div>
        </div>

        {/* FLOWCHART */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Flowchart</h2>
          <div className="w-full h-[300px] bg-slate-800 rounded-lg">
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* CALL STACK + EXPLANATION */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Call Stack</h2>
          <div className="bg-slate-800 p-4 rounded-lg h-[200px] overflow-auto">
            <ul className="list-disc pl-4">
              {callStack.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">AI Explanation</h2>
          <div className="bg-slate-800 p-4 rounded-lg h-[200px] overflow-auto whitespace-pre-wrap">
            {explanation}
          </div>
        </div>
      </div>

      {/* HISTORY */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">History</h2>
          <button
            onClick={clearHistory}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Clear
          </button>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg h-[150px] overflow-auto">
          {history.length === 0 ? (
            <p className="text-gray-400">No history yet</p>
          ) : (
            <ul className="list-disc pl-4 space-y-1">
              {history.map((item, i) => (
                <li key={i}>
                  <span className="text-blue-300">{item.time}</span> —{" "}
                  <code className="text-green-300">{item.code.slice(0, 25)}...</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
