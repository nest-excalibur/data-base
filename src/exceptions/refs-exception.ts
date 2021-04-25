export class RefsException {
    constructor(
        protected error: string,
    ) {
    }

    public toString(): string {
        return this.error;
    }
}