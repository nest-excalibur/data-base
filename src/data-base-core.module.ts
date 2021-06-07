import { DataBaseConfig, DataBaseConfigAsyncOptions } from './interfaces';
import { DynamicModule, FactoryProvider, Global, Module, Provider, ValueProvider } from '@nestjs/common';
import { ConfigStore } from './store/config.store';
import { BULKS_CONFIG, CONFIG, LOGS_REPOSITORY } from './constants/inject-keys';
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
        const configProvider: Provider = {
            useValue: config,
            provide: CONFIG,
        };
        const providers: Provider[] = [
            ...DataBaseCoreModule.commonProviders,
            configProvider,
        ];

        return {
            module: DataBaseCoreModule,
            providers,
            exports: providers.filter(
                provider => (provider as ValueProvider | FactoryProvider).provide !== LOGS_REPOSITORY,
            ),
        };
    }


    static forRootAsync(configAsync: DataBaseConfigAsyncOptions): DynamicModule {
        const configProvider: Provider = {
            provide: CONFIG,
            useFactory: configAsync.useFactory,
            inject: configAsync.inject || [],
        };
        const providers: Provider[] = [
            ...DataBaseCoreModule.commonProviders,
            configProvider,
        ];
        return {
            module: DataBaseCoreModule,
            providers,
            exports: providers.filter(
                provider => (provider as ValueProvider | FactoryProvider).provide !== LOGS_REPOSITORY,
            ),
        };
    }

    private static get commonProviders(): Provider[] {
        const bulksConfig = ConfigStore.bulkDataConfigStore;
        const logsRepositoryProvider: ValueProvider = {
            useValue: new LogRepository(),
            provide: LOGS_REPOSITORY,
        };
        const bulksConfigProvider: ValueProvider = {
            useValue: bulksConfig,
            provide: BULKS_CONFIG,
        };
        return [
            logsRepositoryProvider,
            bulksConfigProvider,
            DataBaseService,
        ];
    }
}
