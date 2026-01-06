export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Convert buffer to base64 data URL for MongoDB storage
  const base64 = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;
  const dataUrl = `data:${mimeType};base64,${base64}`;

  res.status(200).json({
    success: true,
    data: dataUrl,
    message: "File uploaded successfully",
  });
};
