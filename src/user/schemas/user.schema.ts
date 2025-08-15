import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true, index: true })
  email?: string;

  @Prop()
  password?: string;

  @Prop({ unique: true, sparse: true, index: true })
  phoneNumber?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  picture?: string;

  @Prop()
  googleAccessToken?: string;

  @Prop()
  appJwtToken?: string;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  tempEmail?: string;

  // You can add more fields here like name, profile picture, etc.
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password') && typeof this.password === 'string') {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
