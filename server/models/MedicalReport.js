import mongoose from "mongoose";

const medicalReportSchema = new mongoose.Schema(
  {
    patient: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Patient reference is required"],
      index:    true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Appointment",
      default: null,
    },
    title: {
      type:      String,
      required:  [true, "Report title is required"],
      trim:      true,
      maxLength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type:      String,
      trim:      true,
      maxLength: [500, "Description cannot exceed 500 characters"],
      default:   "",
    },
    category: {
      type:    String,
      enum:    {
        values:  ["Lab Report", "Radiology", "Prescription", "Discharge Summary", "Other"],
        message: "Invalid category",
      },
      default: "Other",
    },
    file: {
      public_id:    { type: String, required: true },
      url:          { type: String, required: true },
      originalName: { type: String, required: true },
      mimeType:     { type: String, required: true },
      size:         { type: Number, required: true },
      resourceType: {
        type:    String,
        enum:    ["image", "raw"],
        default: "raw",
      },
      format: { type: String, default: "" },
    },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

medicalReportSchema.index({ patient: 1, createdAt: -1 });
medicalReportSchema.index({ appointment: 1 });

medicalReportSchema.virtual("fileSizeFormatted").get(function () {
  const bytes = this.file?.size || 0;
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
});

medicalReportSchema.virtual("isImage").get(function () {
  return this.file?.resourceType === "image";
});

medicalReportSchema.virtual("isPDF").get(function () {
  return this.file?.mimeType === "application/pdf";
});

export const MedicalReport = mongoose.model("MedicalReport", medicalReportSchema);
