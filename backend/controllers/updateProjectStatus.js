import Project from "../models/project.js";
import Task from "../models/task.js";

export const updateProjectStatus = async (projectId) => {
  try {
    const tasks = await Task.find({ project: projectId, isArchived: false });

    if (tasks.length === 0) {
      await Project.findByIdAndUpdate(projectId, { status: "Not Started" });
      return;
    }

    const allCompleted = tasks.every(t => t.status == "Completed");
    const anyInProgress = tasks.some(t => t.status == "In Progress");

    if (allCompleted) {
      await Project.findByIdAndUpdate(projectId, { status: "Completed" });
    } else if (anyInProgress) {
      await Project.findByIdAndUpdate(projectId, { status: "In Progress" });
    } else {
      await Project.findByIdAndUpdate(projectId, { status: "Pending" });
    }
  } catch (err) {
    console.log("Error updating project status:", err);
  }
};
