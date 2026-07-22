import { useState } from "react";
import api from "./api/api";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [asking, setAsking] = useState(false);

  const [fileName, setFileName] = useState("");
  const [characters, setCharacters] = useState(0);
  const [aiStatus, setAiStatus] = useState("Not Ready");
  const [pages, setPages] = useState(0);

  // Upload PDF
  
  const uploadPDF = async () => {
  if (!selectedFile) {
    alert("Please select a PDF");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    setLoading(true);

    const uploadResponse = await api.post("/upload", formData);

    setFileName(uploadResponse.data.filename);
    setCharacters(uploadResponse.data.characters);
    setPages(uploadResponse.data.pages);
    setAiStatus("Generating Summary...");

    const summaryResponse = await api.get("/summary");

    setSummary(summaryResponse.data.summary);
    setAiStatus("Ready ✅");
    alert("✅ PDF Uploaded Successfully!");

  } catch (error) {
    console.log(error);
    alert("❌ Upload Failed");
  } finally {
    setLoading(false);
  }
};

  // Generate Summary
  const generateSummary = async () => {
    try {
      setLoading(true);

      const response = await api.get("/summary");

      setSummary(response.data.summary);
    } catch (error) {
      console.log(error);
      alert("❌ Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };
  const copySummary = () => {
  navigator.clipboard.writeText(summary);
  alert("✅ Summary Copied!");
};
  const downloadSummary = () => {
  if (!summary) {
    alert("No summary available!");
    return;
  }

  const element = document.createElement("a");

  const file = new Blob([summary], {
    type: "text/plain",
  });

  element.href = URL.createObjectURL(file);
  element.download = "IntelPlant_Summary.txt";

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

  URL.revokeObjectURL(element.href);
};
  const clearChat = () => {
  setChatHistory([]);
  setQuestion("");
};
  // Ask AI
  const askAI = async () => {
  if (!question.trim()) {
    alert("Please enter a question");
    return;
  }

  try {
    setAsking(true);

    const response = await api.post("/ask", {
      question: question,
    });

    setChatHistory((prev) => [
      ...prev,
      {
        question: question,
        answer: response.data.answer,
      },
    ]);

    setQuestion("");

  } catch (error) {
    console.log(error);
    alert("❌ Failed to get AI response");
  } finally {
    setAsking(false);
  }
};
  
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 p-6">
        <h1 className="text-3xl font-bold text-blue-400">
          🌿 IntelPlant AI
        </h1>

        <p className="text-slate-400 mt-2">
          AI Powered Industrial Document Intelligence
        </p>
      </header>

      
<div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">

 
  <div className="bg-slate-900 rounded-xl p-5 shadow-lg">
    <h3 className="text-slate-400 text-sm">📄 Uploaded File</h3>
    <p className="text-lg font-bold text-white mt-2">
      {fileName || "No File"}
    </p>
  </div>

  <div className="bg-slate-900 rounded-xl p-5 shadow-lg">
    <h3 className="text-slate-400 text-sm">📊 Characters</h3>
    <p className="text-lg font-bold text-green-400 mt-2">
      {characters}
    </p>
  </div>

  <div className="bg-slate-900 rounded-xl p-5 shadow-lg">
    <h3 className="text-slate-400 text-sm">🤖 AI Status</h3>
    <p className="text-lg font-bold text-blue-400 mt-2">
      {aiStatus}
    </p>
  </div>
  <div className="bg-slate-900 rounded-xl p-5 shadow-lg">
  <h3 className="text-slate-400 text-sm">
    📑 Pages
  </h3>

  <p className="text-lg font-bold text-yellow-400 mt-2">
    {pages}
  </p>
  </div>

</div>
<div className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6">


        {/* Upload Card */}
        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg">

          <h2 className="text-xl font-semibold mb-4">
            📄 Upload Industrial Document
          </h2>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="mb-4 w-full rounded-lg border border-slate-700 p-2"
          />

          {selectedFile && (
            <p className="text-green-400 mb-4">
              ✅ {selectedFile.name}
            </p>
          )}

          <button
            onClick={uploadPDF}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-5 py-2 rounded-lg"

          >
            {loading ? "Uploading..." : "Upload PDF"}
        
          </button>

        </div>

        {/* Summary Card */}
        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg">

          <h2 className="text-xl font-semibold mb-4">
            🤖 AI Summary
          </h2>

          <div className="flex flex-wrap gap-3 mb-4">

  <button
    onClick={generateSummary}
    className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg"
  >
    🔄 Generate Summary
  </button>

  <button
    onClick={copySummary}
    className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg"
  >
    📋 Copy Summary
  </button>

  <button
    onClick={downloadSummary}
    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
  >
    📥 Download Summary
  </button>

</div>

          <div className="bg-slate-800 rounded-lg p-4 min-h-[250px] whitespace-pre-wrap text-slate-300 overflow-auto">

            {loading
              ? "⏳ Generating Summary..."
              : summary || "Upload a PDF and click 'Generate Summary'."}

          </div>

        </div>

        {/* Ask AI Card */}
        <div className="md:col-span-2 bg-slate-900 rounded-2xl p-6 shadow-lg">

          <h2 className="text-xl font-semibold mb-4">
            💬 Ask AI
          </h2>

          <input
  type="text"
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !asking) {
      askAI();
    }
  }}
  placeholder="Ask anything about your document..."
  className="w-full p-3 rounded-lg bg-slate-800 outline-none border border-slate-700"
/>
           <div className="flex gap-3 mt-4">

  <button
    onClick={askAI}
    className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg"
  >
    {asking ? "🤖 Thinking..." : "Ask AI"}
  </button>

  <button
    onClick={clearChat}
    className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg"
  >
    🗑 Clear Chat
  </button>

</div>

          
          <div className="mt-6 bg-slate-800 rounded-lg p-4 min-h-[250px] max-h-[400px] overflow-y-auto">

  {chatHistory.length === 0 ? (
    <p className="text-slate-400">
      Ask a question about your uploaded PDF...
    </p>
  ) : (
    chatHistory.map((chat, index) => (
      <div
        key={index}
        className="mb-5 border-b border-slate-700 pb-4"
      >
        <div className="mb-2">
          <span className="text-blue-400 font-semibold">
            👤 You
          </span>

          <p className="mt-1">
            {chat.question}
          </p>
        </div>

        <div>
          <span className="text-green-400 font-semibold">
            🤖 IntelPlant AI
          </span>

          <p className="mt-1 whitespace-pre-wrap">
            {chat.answer}
          </p>
        </div>
      </div>
    ))
  )}

</div>

        </div>

      </div>
    </div>
  );
}

export default App;