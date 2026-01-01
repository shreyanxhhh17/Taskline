import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

/**
 * Create a project inside a workspace
 * Automatically assign ALL workspace members to the project
 */
const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const {
      title,
      description,
      status,
      startDate,
      dueDate,
      tags,
    } = req.body;

    // Find workspace
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if the user is part of the workspace
    const isMember = workspace.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Convert tags to array
    const tagArray = tags ? tags.split(",") : [];

    // Create new project with ALL workspace members
    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId,

      // 🔥 FIX: Assign all workspace members to the project
      members: workspace.members,

      createdBy: req.user._id,
    });

    // Add project to workspace
    workspace.projects.push(newProject._id);
    await workspace.save();

    return res.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * Get project details
 */
const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate(
      "members.user",
      "name profilePicture"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * Get all tasks of a project
 */
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate(
      "members.user",
      "name profilePicture"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { createProject, getProjectDetails, getProjectTasks };
