import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: 5 * 1024 * 1024, //5mb limit
});

export default upload;
