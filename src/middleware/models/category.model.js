import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const categoryModel = mongoose.model("Category", categorySchema);

export default categoryModel;
