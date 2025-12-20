export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Return the path to the file (relative to the server root / static serve path)
  // We will serve 'uploads' folder at '/uploads' route.
  const filePath = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    data: filePath,
    message: "File uploaded successfully",
  });
};
