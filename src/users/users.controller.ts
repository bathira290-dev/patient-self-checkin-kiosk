import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getUsers() {
    return [
      { id: 1, name: 'Athira' },
      { id: 2, name: 'Anu' },
    ];
  }
}
