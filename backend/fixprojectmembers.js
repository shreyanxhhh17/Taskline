import dotenv from "dotenv";
import mongoose from "mongoose";
import Workspace from "./models/workspace.js";
import Project from "./models/project.js";

dotenv.config();

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const workspaces = await Workspace.find({});

    for (const ws of workspaces) {
      const wsMembers = ws.members;

      const projects = await Project.find({ workspace: ws._id });

      for (const p of projects) {
        p.members = wsMembers;  // Copy correct roles + users
        await p.save();
        console.log(`Updated project ${p._id} with ${wsMembers.length} members`);
      }
    }

    console.log("Migration complete!");
    process.exit();
  } catch (error) {
    console.log("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
