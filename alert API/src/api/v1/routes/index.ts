import { Router } from "express";
import alertRouter from "./alert.routes";

const v1Router = Router();

v1Router.use('/alerts', alertRouter);

export default v1Router;
