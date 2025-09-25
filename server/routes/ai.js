import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
	try {
		const { expression } = req.body;

		const completion = await client.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content: "You are a calculator. Always return only the final numeric value of the expression, no words, no LaTeX.",
				},
				{ role: "user", content: expression },
			],
		});

		const result = completion.choices[0].message.content.trim();
		res.json({ result });
	} catch (err) {
		console.error("AI Error:", err);
		res.status(500).json({ error: "AI evaluation failed" });
	}
});

export default router;
