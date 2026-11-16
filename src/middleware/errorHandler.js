const errorHandler = (err, _req, res, _next) => {
  if (process.env.NODE_ENV !== "production") console.error(err);
  if (err.name === "ValidationError") return res.status(400).json({ success: false, message: err.message });
  if (err.code === 11000) return res.status(409).json({ success: false, message: "A record with that value already exists" });
  if (err.name === "CastError") return res.status(400).json({ success: false, message: "Invalid resource identifier" });
  const status = err.statusCode || (err.name === "MulterError" ? 400 : 500);
  res.status(status).json({ success: false, message: status === 500 && process.env.NODE_ENV === "production" ? "Internal server error" : err.message || "Internal server error" });
};
export default errorHandler;
