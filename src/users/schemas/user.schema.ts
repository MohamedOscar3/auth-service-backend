import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

export interface UserDocument extends User, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add pre-save hook for password hashing
UserSchema.pre('save', async function (next) {
  try {
    const user = this;

    // Only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
      return next();
    }

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    next();
  } catch (error) {
    Logger.error(`Error hashing password: ${error.message}`, 'UserSchema');
    next(error);
  }
});

// Add method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    Logger.error(`Error comparing passwords: ${error.message}`, 'UserSchema');
    return false;
  }
};
