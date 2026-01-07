const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Flight search failed",
    error: err,
  });
};

export default errorHandler;
