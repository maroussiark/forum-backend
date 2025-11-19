import xss from "xss-clean";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";

export const sanitize = [
  xss(),            
  hpp(),            
  mongoSanitize()   
];
