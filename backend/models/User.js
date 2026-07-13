import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: function() { return !this.googleId; },
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
    select: false,
  },
  role: {
    type: String,
    enum: ['owner', 'tenant', 'lawyer', 'admin'],
    default: 'tenant',
  },
  lawyerStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() { return this.role === 'lawyer' ? 'pending' : 'approved'; }
  },
  lawyerDetails: {
    barCouncilNumber: String,
    experience: Number,
    aadharNumber: String,
    certificate: String,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  savedProperties: [{
    type: String
  }],
  profilePic: {
    type: String,
    default: ''
  },
  listedProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String,
    default: null
  }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
