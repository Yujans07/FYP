import multer from "multer";

const storage = multer.memoryStorage(); // or use diskStorage
const upload = multer({ storage });

app.post("/api/users/register", upload.single("avatar"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Missing required parameter - file" });
  }
  
  console.log(req.file); // Debugging
  console.log(req.body); // Debugging

  res.json({ success: true, message: "User registered successfully!" });
});
