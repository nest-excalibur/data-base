import {COLORS} from '../constants/colors';
import {GRIDS} from '../constants/grid';
import {BorderedRow, SimpleRowOptions} from '../interfaces/row-options.interface';
import {ConnectionLog} from './log-repository';

export interface Drawable {
    draw(): void;

    build(): any;
}


export class LogTable implements Drawable {


    constructor(
        private readonly logRows: SimpleRow[],
    ) {
    }

    draw(): void {
        console.log(this.build());
    }

    build(): string {
        return this.logRows.reduce((acc, logRow) => acc + logRow.build(), '');
    }


    static makeLogRows(connectionLog: ConnectionLog): SimpleRow[] {
        const entries = Object.entries(connectionLog);

        const logRows: LogBorderedRow[] = [];
        const errorsRows: ErrorLogRow[] = [];

        for (const [connection, logDetails] of entries) {
            const options: BorderedRow = {
                values: [connection],
                grids: GRIDS,
                lateralPath: '║',
                borderColor: COLORS.fgWhite,
                bottomTopPat: '═',
                valueColor: COLORS.fgYellow,
            };

            const subHeaders = {
                ...options,
                valueColor: COLORS.fgBlue,
                values: ['Order', 'Entity', 'Created', 'Status'],
            }
            logRows.push(
                new LogBorderedRow(options),
                new LogBorderedRow(subHeaders),
            );

            let detailsCounter = 0;
            for (const logDetail of logDetails) {

                const isLast = detailsCounter + 1 === logDetails.length;
                const hasErrors = logDetail.errors !== undefined;

                const values: BorderedRow = {
                    ...options,
                    values: [
                        logDetail.creationOrder.toString(),
                        logDetail.entityName,
                        logDetail.created ? logDetail.created.toString() : '0',
                        hasErrors ? 'FAIL' : 'OK',
                    ],
                    borderColor: COLORS.fgWhite,
                    valueColor: hasErrors ? COLORS.fgRed : COLORS.fgGreen,
                    isLast,
                };

                if (hasErrors) {

                    const errorsValues: SimpleRowOptions = {
                        values: [logDetail.entityName, logDetail.errors],
                        valueColor: COLORS.fgRed,
                    }
                    errorsRows.push(
                        new ErrorLogRow(errorsValues),
                    );
                }

                detailsCounter = detailsCounter + 1;
                logRows.push(new LogBorderedRow(values));
            }

        }
        return [
            ...logRows,
            ...errorsRows,
        ];
    }

}


export class SimpleRow implements Drawable {

    constructor(
        protected readonly simpleRowOptions: SimpleRowOptions,
    ) {
    }

    build(): any {
        return this.simpleRowOptions.values.join('\n');
    }

    draw(): void {
        console.log(this.build());
    }

    protected static encloseColor(value: string, color: COLORS) {
        return `${color}${value}${COLORS.reset}`;
    }
}

export class ErrorLogRow extends SimpleRow {


    build(): string {
        return [
            SimpleRow.encloseColor(
                this.simpleRowOptions.values[0],
                this.simpleRowOptions.valueColor ?? COLORS.fgRed,
            ),
            SimpleRow.encloseColor(
                this.simpleRowOptions.values[1].toString(),
                COLORS.fgYellow,
            ),
        ].join('\n');
    }
}


export class LogBorderedRow extends SimpleRow {

    constructor(
        private readonly options: BorderedRow,
    ) {
        super(options);
    }


    build(): string {
        if (!(this.options.grids.length >= this.options.values.length)) {
            throw new Error('Values overflow');
        }
        if (this.options.values.length > 1) {
            return this.buildColumns();
        }
        return this.buildHeader();
    }


    private buildColumns() {
        let cols: string = this.options.values.map(
            (value: string, index: number) => {
                const colLength = this.options.grids[index];
                return this.addSpaces(value, colLength);
            },
        ).join('');

        cols = SimpleRow.encloseColor(cols, this.options.valueColor);
        cols = LogBorderedRow.encloseMargin(cols, this.options.lateralPath, this.options.borderColor);
        const border = this.generateBorder(COLORS.fgWhite, this.options.isLast ? 'bot' : 'mid');
        return cols + '\n' + border + '\n';
    }

    draw(): void {
        console.log(this.build());
    }

    private addSpaces(value: string, colLength: number = this.length) {
        const total = colLength - value.length;
        let response = value;
        for (let i = 0; i < total; i++) {
            response = response + ' ';
        }
        return response;
    }

    private static encloseMargin(value: string, patt: string, color: COLORS = COLORS.bgWhite) {
        return `${color}${patt}${COLORS.reset} ${value} ${color}${patt}${COLORS.reset}`;
    }

    private generateBorder(color: COLORS = COLORS.fgWhite, type?: 'mid' | 'top' | 'bot'): string {

        const {bottomTopPat} = this.options;

        const mid = ['╠', '╣'];
        const top = ['╔', '╗'];
        const bot = ['╚', '╝'];
        let corner = ['═', '═'];
        switch (type) {
            case 'bot':
                corner = bot;
                break;
            case 'top':
                corner = top;
                break;
            case 'mid':
                corner = mid;
                break;
        }
        let response: string = bottomTopPat;
        for (let i = 0; i < this.length + 1; i++) {
            response = response + bottomTopPat;
        }
        response = corner[0] + response + corner[1];
        return LogBorderedRow.encloseColor(response, color);
    }


    buildHeader(): string {
        const {borderColor, values, valueColor, lateralPath} = this.options;
        let rowFormat = this.addSpaces(values[0]);
        rowFormat = LogBorderedRow.encloseColor(rowFormat, valueColor);
        rowFormat = LogBorderedRow.encloseMargin(rowFormat, lateralPath, borderColor);
        const topBorder = this.generateBorder(borderColor, 'top');
        const midBorder = this.generateBorder(borderColor, 'mid');
        return '\n' + topBorder + '\n' + rowFormat + '\n' + midBorder + '\n';
    }


    get length(): number {
        return this.options.grids.reduce((total: number, grid) => total + grid, 0);
    }
}
