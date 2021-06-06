import { DataBaseConfig } from './interfaces';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigStore } from './store/config.store';
import { BULKS_CONFIG, CONFIG, ENV_CONFIG, LOGS_REPOSITORY } from './constants/inject-keys';
import { DataBaseService } from './data-base.service';
import { LogRepository } from './utils/log-repository';

@Global()
@Module(
    {
        providers: [
            DataBaseService,
        ],
        exports: [
            DataBaseService,
        ],
    }
)
export class DataBaseCoreModule {
    static forRoot(config: DataBaseConfig): DynamicModule {
        const bulksConfig = ConfigStore.bulkDataConfigStore;
        const configProvider: Provider = {
            useValue: config,
            provide: CONFIG,
        };
        const bulksConfigProvider: Provider = {
            useValue: bulksConfig,
            provide: BULKS_CONFIG,
        };

        const logsRepositoryProvider: Provider = {
            useValue: new LogRepository(),
            provide: LOGS_REPOSITORY,
        };
        return {
            module: DataBaseCoreModule,
            providers: [
                configProvider,
                bulksConfigProvider,
                logsRepositoryProvider,
                DataBaseService,
            ],
            exports: [
                configProvider,
                bulksConfigProvider,
                DataBaseService,
            ]
        };
    }
}
