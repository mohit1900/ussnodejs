import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password must be atleast 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  notes: [
    {
      noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notes",
      },
    },
  ],

  images: [
    {
      title: {
        type: String,
        required: [true, "Please enter the title of the image"],
      },
      image: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otp_expire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: String,
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

schema.methods.hashOTP = async function (otp) {
  return await bcrypt.hash(otp, 10);
};

schema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
schema.methods.compareOTP = async function (otp) {
  // console.log(otp);
  // console.log(this.otp);
  // console.log(await bcrypt.compare(otp, this.otp));
  return await bcrypt.compare(otp, this.otp);
};

schema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

schema.index({ otp_expire: 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.model("User", schema);
