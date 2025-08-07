import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(username: string): Promise<User | undefined> {
    // This method should find a user by email or phone number
    const user = await this.userModel
      .findOne({ $or: [{ email: username }, { phoneNumber: username }] })
      .exec();
    return user || undefined;
  }

  async create(user: User): Promise<User> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async updateAppJwtToken(
    userId: string,
    appJwtToken: string,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { appJwtToken: appJwtToken }, { new: true })
      .exec();
  }

  async updateUser(
    userId: string,
    update: Partial<User>,
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .exec();
  }

  async findByEmailVerificationToken(
    token: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ emailVerificationToken: token }).exec();
  }
}
