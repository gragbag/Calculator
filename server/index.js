import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/ai.js";

dotenv.config();

console.log("OPENAI_API_KEY loaded?", !!process.env.OPENAI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});
