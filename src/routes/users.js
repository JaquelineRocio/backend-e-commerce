import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

// Obtener todos los usuarios (excluyendo el hash de la contraseña)
router.get("/", async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");
    res.status(200).send(userList);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener un usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo usuario
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);

    let user = new User({
      name,
      email,
      passwordHash,
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    });
    user = await user.save();

    res.status(201).send(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "User could not be created", error: error.message });
  }
});

// Actualizar un usuario existente
router.put("/:id", async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;

    const userExist = await User.findById(req.params.id);
    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordHash = password
      ? bcrypt.hashSync(password, 10)
      : userExist.passwordHash;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...updateFields, passwordHash },
      { new: true }
    );

    res.status(200).send(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "User could not be updated", error: error.message });
  }
});

// Iniciar sesión
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const secret = process.env.SECRET;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (bcrypt.compareSync(password, user.passwordHash)) {
      const token = jwt.sign(
        { userId: user.id, isAdmin: user.isAdmin },
        secret,
        { expiresIn: "1d" }
      );
      return res.status(200).send({ user: user.email, token });
    } else {
      return res.status(400).send("Invalid password");
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Registrar un nuevo usuario
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);

    let user = new User({
      name,
      email,
      passwordHash,
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    });
    user = await user.save();

    res.status(201).send(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "User could not be created", error: error.message });
  }
});

// Eliminar un usuario
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener el conteo de usuarios
router.get("/get/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).send({ userCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
