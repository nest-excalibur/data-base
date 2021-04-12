export class FileException {
    constructor(
        protected error: any,
    ) {
    }

    public toString(): string {
        return this.error.toString();
    }
}
