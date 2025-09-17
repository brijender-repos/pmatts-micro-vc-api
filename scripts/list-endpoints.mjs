import listEndpoints from "express-list-endpoints";
import app from "../index.js"; // adjust path to your express app entry

console.log(listEndpoints(app));

