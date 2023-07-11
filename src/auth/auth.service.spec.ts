import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/user.entity';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];

    fakeUsersService = {
      find: (email) => {
        const filteredUsers = users.filter((user) => user.email === email);

        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;

        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('Can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('Creates a new user with a salted and hashed password', async () => {
    const user = await service.signUp('three@two.com', 'asdf');

    expect(user.password).not.toEqual('asdf');

    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('Throws an error if user signs up with email that is in use', async () => {
    await service.signUp('three@two.com', 'pass');

    await expect(service.signUp('three@two.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('Throws error if signIn is called with an unused email', async () => {
    await expect(service.signIn('a@b.com', 'pass')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Throws error if an invalid password is provided', async () => {
    await service.signUp('one@two.com', 'pass');

    fakeUsersService.find('one@two.com');

    await expect(service.signIn('one@two.com', 'passowrd')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Returns a User if correct password is provided', async () => {
    await service.signUp('one@two.com', 'pass');

    const user = await service.signIn('one@two.com', 'pass');

    expect(user).toBeDefined();
  });
});
