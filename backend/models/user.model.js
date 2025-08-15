const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  password: {
    type: String,
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  picture: {
    type: String,
  },
  googleAccessToken: {
    type: String,
  },
  appJwtToken: {
    type: String,
  },
  emailVerificationToken: {
    type: String,
  },
  tempEmail: {
    type: String,
  },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && typeof this.password === 'string') {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
