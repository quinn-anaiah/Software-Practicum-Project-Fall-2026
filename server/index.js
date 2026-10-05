import express from "express";
import adminRouter from "./routes/admin.js";
import authRouter from "./routes/auth.js";
import rolesRouter from "./routes/roles.js";
import authRouter from "./routes/auth.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/roles", rolesRouter);
app.use("/api", authRouter);

app.listen(port, () => {
  console.log(`EMR API listening at http://localhost:${port}`);
});
