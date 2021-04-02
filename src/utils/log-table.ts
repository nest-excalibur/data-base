import { COLORS } from '../constants/colors';
import { GRIDS, ROW_LENGTH } from '../constants/grid';
import { GridOptions } from '../interfaces/row-options.interface';
import { ConnectionLog } from './log-repository';

export interface Drawnlable {
    draw(): void;
    build(): string;
}


export class LogTable implements Drawnlable {
    
    
    constructor(
        private readonly logRows: LogRow[],
    ){
    }
    
    draw(): void {
        console.log(this.build());
    }

    build(): string {
        return this.logRows.reduce((acc,logRow) => acc + logRow.build(), '');
    }


    static makeLogRows(connectionLog: ConnectionLog): LogRow[]{
        const entries = Object.entries(connectionLog);

        const rows: LogRow[] = [];

        for (const [connection, logDetails] of entries){
            const options: GridOptions = {
                values: [connection],
                grid: GRIDS,
                lateralPath: '║',
                borderColor: COLORS.fgWhite,
                bottomTopPatt: '═',
                valueColor: COLORS.fgYellow,
            };

            const subHeaders = {
                ...options,
                valueColor: COLORS.fgBlue,
                values: ['Order', 'Entity', 'Created', 'Status'],
            }
            rows.push(
                new LogRow(GRIDS,options),
                new LogRow(GRIDS,subHeaders),
            );

            let detailsCounter = 0;
            for (const logDetail of logDetails){
                
                const isLast =  detailsCounter + 1 === logDetails.length;

                const values: GridOptions = {
                    ...options,
                    values: [
                        logDetail.creationOrder.toString(),
                        logDetail.entityName,
                        logDetail.created ? logDetail.created.toString() : '0',
                        logDetail.errors ? 'FAIL' : 'OK',
                    ],
                    borderColor: COLORS.fgWhite,
                    valueColor:  logDetail.errors ? COLORS.fgRed : COLORS.fgGreen,
                    isLast,
                };
                detailsCounter = detailsCounter + 1;
                rows.push(new LogRow(GRIDS, values));
            }

        }
        return rows;
    }

}




export class LogRow implements Drawnlable{
    
    constructor(
        private readonly grids: number[],
        private readonly options: GridOptions,
    ){

    }

    
    build(): string {
        if (!(this.grids.length >= this.options.values.length)){
            throw new Error('Values overflow');
        }
        if (this.options.values.length > 1){
            return this.buildColumns();
        }
        return this.buildHeader();   
    }


    private buildColumns(){
        let cols: string = this.options.values.map(
            (value: string, index: number) => {
                const colLength = this.grids[index];
                return this.addSpaces(value, colLength);
            }
        ).join('');

        cols = this.encloseColor(cols, this.options.valueColor);
        cols = this.encloseMargin(cols, this.options.lateralPath, this.options.borderColor);
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

    
    private encloseColor(value: string, color: COLORS) {
        return `${color}${value}${COLORS.reset}`;
    }

    private encloseMargin(value: string, patt: string, color: COLORS = COLORS.bgWhite) {
        return `${color}${patt}${COLORS.reset} ${value} ${color}${patt}${COLORS.reset}`;
    }

    private generateBorder(color: COLORS = COLORS.fgWhite, type?: 'mid' | 'top' | 'bot'): string {
        
        const {bottomTopPatt} = this.options;

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
        let response: string = bottomTopPatt;
        for (let i = 0; i < this.length + 1; i++) {
            response = response + bottomTopPatt;
        }
        response = corner[0] + response + corner[1];
        return this.encloseColor(response, color);
    }


    buildHeader(): string {
        const {borderColor, values, valueColor, lateralPath} = this.options;
        let rowFormat = this.addSpaces(values[0]);
        rowFormat = this.encloseColor(rowFormat, valueColor);
        rowFormat = this.encloseMargin(rowFormat, lateralPath, borderColor);
        const topBorder = this.generateBorder( borderColor, 'top');
        const midBorder = this.generateBorder( borderColor, 'mid');
        return '\n' + topBorder + '\n' + rowFormat + '\n' + midBorder + '\n';
    }


    get length(): number{
        return this.grids.reduce ( (total: number,grid) => total + grid, 0 );        
    }
}
