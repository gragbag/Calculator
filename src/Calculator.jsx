import React, { useState } from "react";

export default function Calculator() {
	const [expression, setExpression] = useState("");
	const [result, setResult] = useState("");
	const [lastResult, setLastResult] = useState(""); // store last result
	const [justEvaluated, setJustEvaluated] = useState(false); // track if "=" was pressed
	const [useAI, setUseAI] = useState(false); // toggle AI mode

	const handleClick = (value) => {
		if (justEvaluated) {
			if (value === "Ans") {
				setExpression(lastResult);
			} else {
				setExpression(value);
			}
			setResult("");
			setJustEvaluated(false);
			return;
		}
		if (value === "Ans") {
			setExpression((prev) => prev + lastResult);
		} else {
			setExpression((prev) => prev + value);
		}
	};

	const handleClear = () => {
		setExpression("");
		setResult("");
		setJustEvaluated(false);
	};

	const handleBackspace = () => {
		setExpression((prev) => prev.slice(0, -1));
	};

	const handleEvaluate = async () => {
		try {
			if (useAI) {
				// --- AI Mode ---
				const response = await fetch("http://localhost:5000/api/ai", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ expression }),
				});
				const data = await response.json();
				console.log(data.result);
				setResult(data.result || "Error");
				setLastResult(data.result || "");
				setJustEvaluated(true);
			} else {
				// --- Local Mode ---
				let expr = expression;
				const openCount = (expr.match(/\(/g) || []).length;
				const closeCount = (expr.match(/\)/g) || []).length;
				if (openCount > closeCount) {
					expr += ")".repeat(openCount - closeCount);
				}

				const jsExpr = expr
					.replace(/sin\(/g, "Math.sin(")
					.replace(/cos\(/g, "Math.cos(")
					.replace(/tan\(/g, "Math.tan(")
					.replace(/log\(/g, "Math.log10(")
					.replace(/ln\(/g, "Math.log(")
					.replace(/exp\(/g, "Math.exp(")
					.replace(/√\(/g, "Math.sqrt(")
					.replace(/π/g, "Math.PI")
					.replace(/\^/g, "**")
					.replace(/\be\b/g, "Math.E");

				const evalResult = eval(jsExpr).toString(); // ⚠️ only safe locally
				setExpression(expr);
				setResult(evalResult);
				setLastResult(evalResult);
				setJustEvaluated(true);
			}
		} catch {
			setResult("Error");
		}
	};

	// Rows of buttons
	const buttonRows = [
		["7", "8", "9", "/"],
		["4", "5", "6", "*"],
		["1", "2", "3", "-"],
		["0", ".", "=", "+"],
		["(", ")", "^", "√("],
		["sin(", "cos(", "tan(", "π"],
		["log(", "ln(", "exp(", "e"],
		["Ans", "C", "⌫"],
	];

	return (
		<div className="flex justify-center items-center h-screen bg-gray-100">
			<div className="w-80 bg-white shadow-2xl rounded-2xl p-4">
				{/* Toggle Mode */}
				<div className="flex justify-between mb-2">
					<span className="text-sm font-bold">Mode: {useAI ? "AI" : "Local"}</span>
					<button className={`px-2 py-1 text-xs rounded ${useAI ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 hover:bg-gray-400"}`} onClick={() => setUseAI((prev) => !prev)}>
						{useAI ? "Switch to Local" : "Switch to AI"}
					</button>
				</div>

				{/* Display */}
				<div className="bg-black text-green-400 font-mono text-right p-3 rounded mb-3 h-16 flex flex-col justify-center">
					<div className="text-xs text-gray-400 overflow-x-auto">{expression || "0"}</div>
					<div className="text-lg font-bold">{result}</div>
				</div>

				{/* Buttons */}
				{!useAI && (
					<div className="flex flex-col gap-2">
						{buttonRows.map((row, ri) => (
							<div key={ri} className="grid grid-cols-4 gap-2">
								{row.map((btn, i) => {
									let classes = "rounded-xl text-lg p-3 shadow bg-gray-200 hover:bg-gray-300";
									if (btn === "=") classes = "rounded-xl text-lg p-3 shadow bg-green-500 text-white hover:bg-green-600";
									else if (btn === "Ans") classes = "rounded-xl text-lg p-3 shadow bg-blue-500 text-white hover:bg-blue-600";
									else if (btn === "C") classes = "rounded-xl text-lg p-3 shadow bg-red-500 text-white hover:bg-red-600";
									else if (btn === "⌫") classes = "rounded-xl text-lg p-3 shadow bg-yellow-400 text-black hover:bg-yellow-500";

									return (
										<button
											key={i}
											className={classes}
											onClick={() => {
												if (btn === "=") handleEvaluate();
												else if (btn === "C") handleClear();
												else if (btn === "⌫") handleBackspace();
												else handleClick(btn);
											}}
										>
											{btn}
										</button>
									);
								})}
							</div>
						))}
					</div>
				)}

				{/* AI input box (replaces buttons) */}
				{useAI && (
					<div className="flex flex-col gap-2">
						<textarea className="w-full p-2 border rounded" value={expression} onChange={(e) => setExpression(e.target.value)} placeholder="Type a math question, e.g. 'integrate x^2 from 0 to 2'" />
						<button className="rounded-xl text-lg p-3 shadow bg-green-500 text-white hover:bg-green-600" onClick={handleEvaluate}>
							Calculate
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
