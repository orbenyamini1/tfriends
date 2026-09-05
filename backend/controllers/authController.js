const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// סכמת אימות נתונים להרשמה (Joi) - מאפשר image
const registerSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    'string.empty': 'שם הוא שדה חובה',
    'string.min': 'השם חייב להכיל לפחות 2 תווים'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'כתובת האימייל אינה תקינה',
    'string.empty': 'אימייל הוא שדה חובה'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'הסיסמה חייבת להיות לפחות 6 תווים',
    'string.empty': 'סיסמה היא שדה חובה'
  })
}).unknown(true);

// סכמת אימות נתונים להתחברות (Joi)
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'כתובת האימייל אינה תקינה',
    'string.empty': 'אימייל הוא שדה חובה'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'סיסמה היא שדה חובה'
  })
});

// סכמת אימות נתונים לעדכון פרופיל (השדות אופציונליים)
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).messages({
    'string.min': 'השם חייב להכיל לפחות 2 תווים'
  }),
  password: Joi.string().allow('').min(6).messages({
    'string.min': 'הסיסמה חייבת להיות לפחות 6 תווים'
  })
}).unknown(true);

/**
 * @desc    Register a new user and return a JWT token
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ message: 'נא למלא את פרטי ההרשמה' });
  }

  const { error } = registerSchema.validate(req.body);
  if (error) {
    error.status = 400;
    return next(error);
  }

  try {
    const { name, email, password } = req.body;
    const profileImage = req.file ? req.file.filename : 'default-avatar.png';

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים' });
    }

    const user = await User.create({
      name,
      email,
      password,
      profileImage
    });

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '30d' }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      token
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ message: 'נא למלא אימייל וסיסמה' });
  }

  const { error } = loginSchema.validate(req.body);
  if (error) {
    error.status = 400;
    return next(error);
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET || 'secret123', 
        { expiresIn: '30d' }
      );

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        token
      });
    } else {
      res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user profile & avatar
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ message: 'אין נתונים לעדכון' });
  }

  const { error } = updateProfileSchema.validate(req.body);
  if (error) {
    error.status = 400;
    return next(error);
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }

    if (req.body.name && req.body.name.trim()) {
      user.name = req.body.name.trim();
    }

    // עדכון סיסמה רק אם הוזנה סיסמה חדשה
    if (req.body.password && req.body.password.trim().length >= 6) {
      user.password = req.body.password.trim();
    }

    // עדכון תמונה רק אם נבחר קובץ חדש
    if (req.file) {
      user.profileImage = req.file.filename;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile
};