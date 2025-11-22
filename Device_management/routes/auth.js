const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Register page
router.get('/register', (req, res) => {
  res.render('register', { errors: [] });
});

// Xử lý đăng ký
router.post('/register', async (req, res) => {
  const { username, password, password2 } = req.body;
  let errors = [];
  if (!username || !password || !password2) {
    errors.push({ msg: 'Vui lòng nhập đầy đủ thông tin.' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Mật khẩu nhập lại không khớp.' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Mật khẩu phải có ít nhất 6 ký tự.' });
  }
  if (errors.length > 0) {
    return res.render('register', { errors, username, password, password2 });
  }
  try {
    let user = await User.findOne({ where: { username } });
    if (user) {
      errors.push({ msg: 'Tên đăng nhập đã tồn tại.' });
      return res.render('register', { errors, username, password, password2 });
    }
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash });
    req.flash('success_msg', 'Đăng ký thành công! Bạn có thể đăng nhập.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { errors: [{ msg: 'Lỗi máy chủ, vui lòng thử lại.' }], username, password, password2 });
  }
});

// Login page
router.get('/login', (req, res) => {
  // Lấy error từ flash, nếu không có thì không truyền biến error_msg
  const error_msg = req.flash('error')[0] || req.flash('error_msg')[0] || null;
  if (error_msg) {
    res.render('login', { error_msg });
  } else {
    res.render('login', { error_msg: null });
  }
});

// Login handle
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  });
});

module.exports = router;
