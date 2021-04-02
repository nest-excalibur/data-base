import {ValidationResponse} from '../interfaces/validation.response';

export class ValidateException<T = any> {
    constructor(
        protected error: any | ValidationResponse<T>[],
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
        return  JSON.stringify(formattedErrors, null, ' ');
    }

    public toString() {
        return this.formatError();
    }
}
