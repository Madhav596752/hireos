// src/modules/auth/auth.controller.js
import * as authService from "./auth.service.js";

function handleError(res, err) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({ error: message });
}

export async function register(req, res) {
  try {
    const { name, email, password, company } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    const result = await authService.register({ name, email, password, company });
    res.status(201).json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function getMe(req, res) {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
}

export async function updateProfile(req, res) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
}

export async function changePassword(req, res) {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
}
