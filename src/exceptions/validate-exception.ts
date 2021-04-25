import {ValidationResponse} from '../interfaces';

export class ValidateException<T = any> {
    constructor(
        protected error: string | ValidationResponse<T>[],
    ) {
    }

    formatError(): string {
        if (!(this.error instanceof Array)){
            return  this.error;
        }
        const formattedErrors =  this.error.map(
            (errorValidation: ValidationResponse<T>) => {
                const {errors, parsedData} = errorValidation;
                return {
                    parsedData: parsedData,
                    errors: errors.toString(),
                };
            }
        );
        return JSON.stringify(formattedErrors, null, 2);
    }

    public toString(): string {
        return this.formatError();
    }
}
