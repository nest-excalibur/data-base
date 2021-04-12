<img src="https://img.shields.io/npm/dt/@nest-excalibur/data-base"></img>
<img src="https://img.shields.io/npm/v/@nest-excalibur/data-base"></img>
<img src="https://img.shields.io/npm/l/@nest-excalibur/data-base"></img>
<img src="https://img.shields.io/github/stars/nest-excalibur/data-base"></img>
<img src="https://img.shields.io/github/issues/nest-excalibur/data-base"></img>

# Data Base Module

With the database module you can configure multiple connections
and massively insert data for testing or production.

## Installation

```shell

npm install @nest-excalibur/data-base

```

## Config connections
A connection can be defined through a constant or through some other configuration module:

```typescript
const MYSQL_CONNECTION_CONFIG: TypeOrmModuleOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 30501,
    username: 'username',
    password: '1234',
    database: 'test',
    name: 'default',
    synchronize: true,
    retryDelay: 40000,
    retryAttempts: 3,
    connectTimeout: 40000,
    keepConnectionAlive: true,
    dropSchema: true,
    charset: 'utf8mb4',
    timezone: 'local',
    entities: [
        ...entities,
    ],
}
```

Just import the `DataBaseModule`, it can handle multiple connections, just type
the name of the database as the key with its respective connection settings as the value.

```typescript
import {DataBaseModule} from '@nest-excalibur/data-base/lib';
import {
    OTHER_MYSQL_CONNECTION_CONFIG, 
    MONGODB_CONNECTION_CONFIG,
    MYSQL_CONNECTION_CONFIG
 } from './config';


@Module({
    imports: [
        DataBaseModule.forRoot(
            {
                connections: {
                    mysql: MYSQL_CONNECTION_CONFIG,
                    mongodb: MONGODB_CONNECTION_CONFIG,
                    otherMysql: OTHER_MYSQL_CONNECTION_CONFIG
                },
                productionFlag: false,
            }
        ),
        ...MODULES,
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
### Logs

```text

  CONNECTION: default                                                             

  Order   Entity                                    Created     Status  File Size 

  1       Product Categories                        9           OK      0.54 Kb   

  2       ProductEntity                             15          OK      1.52 Kb   
```
