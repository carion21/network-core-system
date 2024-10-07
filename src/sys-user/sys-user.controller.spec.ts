import { Test, TestingModule } from '@nestjs/testing';
import { SysUserController } from './sys-user.controller';
import { SysUserService } from './sys-user.service';

describe('SysUserController', () => {
  let controller: SysUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SysUserController],
      providers: [SysUserService],
    }).compile();

    controller = module.get<SysUserController>(SysUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
