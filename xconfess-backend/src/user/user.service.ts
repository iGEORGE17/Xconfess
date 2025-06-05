import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserProfileDto } from './dto/updateProfile.dto';
import { EmailService } from '../email/email.service';


@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => EmailService))
    private emailService: EmailService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      this.logger.debug(`Finding user by email: ${email}`);
      const user = await this.userRepository.findOne({ where: { email } });

      if (user) {
        this.logger.debug(`User found with ID: ${user.id}`);
      } else {
        this.logger.debug(`No user found with email: ${email}`);
      }

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error finding user by email: ${errorMessage}`);
      throw new InternalServerErrorException(
        `Error finding user: ${errorMessage}`,
      );
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      this.logger.debug(`Finding user by ID: ${id}`);
      const user = await this.userRepository.findOne({ where: { id } });

      if (user) {
        this.logger.debug(`User found with ID: ${user.id}`);
      } else {
        this.logger.debug(`No user found with ID: ${id}`);
      }

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error finding user by ID: ${errorMessage}`);
      throw new InternalServerErrorException(
        `Error finding user: ${errorMessage}`,
      );
    }
  }

  async findByResetToken(token: string): Promise<User | null> {
    try {
      this.logger.debug(`Finding user by reset token`);
      const user = await this.userRepository.findOne({ 
        where: { 
          resetPasswordToken: token,
        },
      });

      if (user) {
        this.logger.debug(`User found with reset token, ID: ${user.id}`);
      } else {
        this.logger.debug(`No user found with reset token`);
      }

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error finding user by reset token: ${errorMessage}`);
      throw new InternalServerErrorException(
        `Error finding user by reset token: ${errorMessage}`,
      );
    }
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    try {
      this.logger.log(`Updating password for user ID: ${userId}`);

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear reset token fields
      await this.userRepository.update(userId, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      this.logger.log(`Password updated successfully for user ID: ${userId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';

      this.logger.error(`Failed to update password for user ID ${userId}: ${errorMessage}`, errorStack);
      throw new InternalServerErrorException(
        `Failed to update password: ${errorMessage}`,
      );
    }
  }

  async setResetPasswordToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    try {
      this.logger.log(`Setting reset password token for user ID: ${userId}`);

      await this.userRepository.update(userId, {
        resetPasswordToken: token,
        resetPasswordExpires: expiresAt,
      });

      this.logger.log(`Reset password token set successfully for user ID: ${userId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';

      this.logger.error(`Failed to set reset token for user ID ${userId}: ${errorMessage}`, errorStack);
      throw new InternalServerErrorException(
        `Failed to set reset token: ${errorMessage}`,
      );
    }
  }

  async create(
    email: string,
    password: string,
    username: string,
  ): Promise<User> {
    try {
      this.logger.log(`Creating new user with email: ${email}`);

      // Hash the password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user entity
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        username,
      });

      // Save user to database
      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User created successfully with ID: ${savedUser.id}`);

      // Send welcome email (fire and forget)
      try {
        await this.emailService.sendWelcomeEmail(savedUser.email, savedUser.username);
        this.logger.log(`Welcome email sent to ${savedUser.email}`);
      } catch (emailError) {
        // Log but don't fail the user registration if email sending fails
        this.logger.error(
          `Failed to send welcome email to ${savedUser.email}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
          emailError instanceof Error ? emailError.stack : ''
        );
      }

      return savedUser;
    } catch (error) {
      // Handle error safely
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';

      this.logger.error(`Failed to create user: ${errorMessage}`, errorStack);
      throw new InternalServerErrorException(
        `Failed to create user: ${errorMessage}`,
      );
    }
  }


  async updateProfile(userId: number, updateDto: UpdateUserProfileDto): Promise<User> {

    try {

      const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, updateDto);

    const updatedProfile = await this.userRepository.save(user);

    this.logger.log(`User profile updated sucessfully for user ID: ${userId}`);

    return updatedProfile
      
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating user profile: ${errorMessage}`);
      throw new InternalServerErrorException(
        `Error updating user profile: ${errorMessage}`,
      );
      
    }
  }
}
