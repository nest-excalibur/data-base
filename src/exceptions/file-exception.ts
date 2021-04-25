export class FileException {
    constructor(
        protected error: string,
    ) {
    }

    public toString(): string {
        return this.error.toString();
    }
}
