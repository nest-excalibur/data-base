<img src="https://img.shields.io/npm/dt/@nest-excalibur/data-base"></img>
<img src="https://img.shields.io/npm/v/@nest-excalibur/data-base"></img>
<img src="https://img.shields.io/npm/l/@nest-excalibur/data-base"></img>
<img src="https://img.shields.io/github/stars/nest-excalibur/data-base"></img>
<img src="https://img.shields.io/github/issues/nest-excalibur/data-base"></img>

# Database Module

With the database module you can insert massively data for testing or production.

## Installation

```shell
npm i --save-dev @nest-excalibur/common-api

npm install @nest-excalibur/data-base

```


Just import the `DataBaseModule`

```typescript

import { TypeOrmModule } from '@nestjs/typeorm';
import {DataBaseModule} from '@nest-excalibur/data-base/lib';


@Module({
    imports: [

        DataBaseModule.forRoot({productionFlag: false}),

        TypeOrmModule.forRoot({
             // Your database connection config
        }),

    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
```

If you want use an asynchronous configuration, for example, the following code shows how to use the `forRootAsync` 
through by using `ConfigService`:


```typescript

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';


import {DataBaseModule} from '@nest-excalibur/data-base/lib';



@Module({
    imports: [

        ConfigModule.forRoot({
          isGlobal: true,
        }),

        DataBaseModule.forRootAsync({
          useFactory: (configService: ConfigService) => {
               const production = configService.get<boolean>('production');
               return {
                 productionFlag: production,
               };
            },
          inject: [ConfigService],
        }),

        TypeOrmModule.forRoot({
             // Your database connection config
        }),

    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
```

### Create BulkData
To insert bulk data either for development or production, the module can be used to set the way the data will be created.

```typescript
import {Module} from '@nestjs/common';
import {DataBaseModule} from '@nest-excalibur/data-base/lib';

@Module({
    imports: [
        DataBaseModule
          .forBulkData(
            {
                dtoClassValidation: UserCreateDTO,
                pathDev: '/src/modules/users/bulks/development/users.json',
                pathProd: '/dist/modules/users/bulks/production/users.json',
                aliasName: 'users',
                creationOrder: 1,
                entity: UserEntity,
            },
        ),
        TypeOrmModule.forFeature([UserEntity]),
    ],
})
export class UsersModule {
}
```

* dtoClassValidation: DTO Class for validation
* pathDev: Path of the file with the data for development
* pathProd: Path of the file with the data for production
* aliasName: Alias for the entity (show on logs).
* creationOrder: Order in which the data will be created, this is necessary if the data depends on other data (foreing key). The order can be repeated in other modules.
* entity: Entity Class.
* connection: Database connection name.

> You can use `js` files instead `json` files.

It is a fact that json files are not taken into account when building the project with the typescript transpiler.
However, you can use multiple npm packages to handle this like [cpy](https://www.npmjs.com/package/cp).

To create start massive insertion just use the `DataBaseService` on the `AppModule`

In this example, the massive insertion is handle on `onModuleInit` method:

```typescript

import { DataBaseService } from '@nest-excalibur/data-base/lib';


export class AppModule implements OnModuleInit {

  constructor(
    private readonly dataBaseService: DataBaseService,
  ) {

  }


  onModuleInit() {
    this.dataBaseService
      .insertData()
      .then(
        _ => this.dataBaseService.showSummary(),
      );
  }
    
  
}

```

## Handle mongoDB refs to other documents
MongoDB Object ids are unique and It will be an issue handle the refs toward other documents at the creating 
the test data.

To handle this is necesary add the documents on the following way:

Lets suppose we have two documents `users` and `posts` where `posts` has a reference with  `users`.

`users.json`


```json
[
  {
    "$metaID": 1,
    "name": "Mara"
  },
  {
    "$metaID": 2,
    "name": "Deleon"
  }
]
```



> add `$metaID` key for the index


On `posts.json` just add the reference according with the `$metaID` of `users.json`:

```json
[
  {
    "user": 1,
    "title": "POST 1"
  },
  {
    "user": 2,
    "title": "POST 2"
  }
]  
```

Especify on the module the referenced attribute with its respective entity class

`post.module.ts`

```typescript
@Module({
    imports: [
        TypeOrmModule.forFeature([PostEntity], 'mongo_conn'),
        DataBaseModule.forBulkData(
            {
                pathDev: '/src/post/bulks/development/posts.json',
                creationOrder: 2,
                entity: PostEntity,
                connection: 'mongo_conn',
                dtoClassValidation: PostCreateDTO,
                refs: {
                    user: UserEntity,
                }
            },
        ),
    ],
})
export class PostModule { }
```



``` 
### Logs

```text

  CONNECTION: default                                                                                

  Order   Entity                                    Created     Status  File Size   Refs             

  1       Product Categories                        9           OK      0.54 Kb     --               

  2       ProductEntity                             15          OK      1.52 Kb     --               



  CONNECTION: mongo_conn                                                                         

  Order   Entity                                    Created     Status  File Size   Refs             

  1       UserEntity                                96          OK      4.97 Kb     --               

  2       PostEntity                                19          OK      0.5 Kb      user   
```
