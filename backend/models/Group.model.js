import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: [10, "Group name cannot exceed 10 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [30, "Description cannot exceed 30 characters"],
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: true,
    },
    groupAvatar: {
      type: String,
      default:
        "https://res.cloudinary.com/deptiq3kd/image/upload/v1755669235/samples/balloons.jpg",
    },
  },
  { timestamps: true }
);

// Ensure admin is always included in members
groupSchema.pre("save", function (next) {
  if (!this.members.includes(this.admin)) {
    this.members.push(this.admin);
  }
  next();
});

export const Group = mongoose.model("Group", groupSchema);
