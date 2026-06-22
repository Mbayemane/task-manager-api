import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const dataBaseConfig: SequelizeModuleOptions = process.env.DATABASE_URL
  ? {
      dialect: 'postgres',
      uri: process.env.DATABASE_URL,
      autoLoadModels: true,
      synchronize: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  : {
      dialect: 'sqlite',
      storage: '.db/data.sqlite3',
      autoLoadModels: true,
      synchronize: true,
    };
