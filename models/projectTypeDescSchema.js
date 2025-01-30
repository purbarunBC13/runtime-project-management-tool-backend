import mongoose from "mongoose";

const projectTypeDescSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    projectTypeDescription: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
  },
  { timestamps: true }
);

const ProjectTypeDesc = mongoose.model(
  "ProjectTypeDesc",
  projectTypeDescSchema
);

export default ProjectTypeDesc;
