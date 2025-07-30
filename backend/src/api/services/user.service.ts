import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import { createUserSchema, updateUserSchema } from '../validators/user.validators';
import { z } from 'zod';

type UserCreateInput = z.infer<typeof createUserSchema>;
type UserUpdateInput = z.infer<typeof updateUserSchema>;

const prisma = new PrismaClient();

export const userService = {
  createUser: async (data: UserCreateInput): Promise<User> => {
    const { password, joinDate, ...rest } = data;
    const passwordHash = await hash(password, 10);
    return await prisma.user.create({
      data: {
        ...rest,
        passwordHash,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
      },
    });
  },

  getUserById: async (id: string): Promise<User | null> => {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  updateUser: async (id: string, data: UserUpdateInput): Promise<User> => {
    const { joinDate, ...rest } = data;
    return await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
      },
    });
  },

  deleteUser: async (id: string): Promise<User> => {
    return await prisma.user.delete({
      where: { id },
    });
  },

  getAllUsers: async (): Promise<User[]> => {
    return await prisma.user.findMany();
  },
};
