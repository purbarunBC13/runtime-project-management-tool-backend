import jwt from "jsonwebtoken";
import ResponseHandler from "../utils/responseHandler.js";

export const verifyToken = (req, res, next) => {
  console.log("req.session.jwt", req.session.jwt);
  const token = req.session.jwt;

  if (!token) {
    return ResponseHandler.error(res, "You are unauthorized", 401);
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      return ResponseHandler.error(res, "Token is not valid", 401, err);
    }
    // console.log(payload);
    req.externalId = payload.externalId;
    req.roleId = payload.roleId;
    next();
  });
};
