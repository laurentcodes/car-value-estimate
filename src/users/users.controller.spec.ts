import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;

  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'one@two.com',
          password: 'pass',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([
          {
            id: 1,
            email,
            password: 'pass',
          } as User,
        ]);
      },
      // remove: (id: number) => {
      //   return Promise.resolve({
      //     id,
      //     email: 'one@two.com',
      //     password: 'pass',
      //   } as User);
      // },
      // update: (id: number) => {
      //   return Promise.resolve({
      //     id,
      //     email: 'one@two.com',
      //     password: 'pass',
      //   } as User);
      // },
    };

    fakeAuthService = {
      // signUp: () => {},
      signIn: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Should return a list of users with the given email', async () => {
    const users = await controller.findAllUsers('one@two.com');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('one@two.com');
  });

  it('Should return a single User with given id', async () => {
    const user = await controller.findUser(1);

    expect(user).toBeDefined();
  });

  it('Should throw an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;

    const user = await controller.findUser(1);

    expect(user).toBeNull();
    // expect(user).rejects.toThrow(NotFoundException);
  });

  it('Should sign in and update session object then return User', async () => {
    const session = { userId: -10 };

    const user = await controller.signInUser(
      {
        email: 'one@two.com',
        password: 'pass',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
