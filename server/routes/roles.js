import { Router } from "express";
import { supabase } from "../services/supabase.js";

const rolesRouter = Router();

rolesRouter.get("/", async (_request, response) => {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name")
    .order("id");

  if (error) {
    console.error("Unable to fetch roles:", error.message);
    return response.status(500).json({ message: "Unable to load roles." });
  }

  return response.json(data);
});

export default rolesRouter;
