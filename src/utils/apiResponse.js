export const success = (res, data = {}, message = "Opération réussie", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const error = (
  res,
  message = "Une erreur est survenue",
  status = 500,
  code = null
) => {
  return res.status(status).json({
    success: false,
    message,
    code,
  });
};
