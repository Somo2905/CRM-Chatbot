import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
      status: "Backend running",
      service: "Tekion CRM Chatbot API"
    });
  });
  
import routes from "./routes/index.js";
app.use("/api", routes);


export default app;
