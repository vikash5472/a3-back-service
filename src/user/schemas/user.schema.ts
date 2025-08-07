import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop({ unique: true, sparse: true })
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
