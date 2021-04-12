import { COLORS } from '../constants/colors';
import { GRIDS } from '../constants/grid';
import { BorderedRow, SimpleRowOptions } from '../interfaces';
import { ConnectionLog } from './log-repository';

export interface Drawable {
  draw(): void;

  build(): string;
}


export class LogTable implements Drawable {


  constructor(
    private readonly logRows: SimpleRow[]
  ) {
  }

  draw(): void {
    console.log(this.build());
  }

  build(): string {
    return this.logRows.reduce(
      (acc: string, logRow: SimpleRow) => acc + logRow.build(),
      ''
    );
  }


  static makeLogRows(connectionLog: ConnectionLog, lightBorder = false): SimpleRow[] {
    const entries = Object.entries(connectionLog);

    const logRows: LogBorderedRow[] = [];
    const errorsRows: ErrorLogRow[] = [];

    for (const [connection, logDetails] of entries) {
      const options: SimpleRowOptions = {
        values: [ 'CONNECTION: ' + connection],
        valueColor: COLORS.fgYellow
      };

      const borderOptions: BorderedRow = {
        lateralPath: lightBorder ? ' ' :'║',
        borderColor: COLORS.fgWhite,
        bottomTopPat: lightBorder ? ' ' : '═',
        lightBorder: lightBorder,
        grids: GRIDS
      };

      const subHeaders = {
        ...options,
        valueColor: COLORS.fgBlue,
        values: ['Order', 'Entity', 'Created', 'Status', 'File Size']
      };
      logRows.push(
        new LogBorderedRow(options, borderOptions),
        new LogBorderedRow(subHeaders, borderOptions)
      );

      let detailsCounter = 0;
      for (const logDetail of logDetails) {

        const isLast = detailsCounter + 1 === logDetails.length;
        const hasErrors = logDetail.errors !== undefined;

        const values: SimpleRowOptions = {
          ...options,
          values: [
            logDetail.creationOrder.toString(),
            logDetail.entityName,
            logDetail.created ? logDetail.created.toString() : '0',
            hasErrors ? 'FAIL' : 'OK',
            logDetail.fileSize + ' Kb',
          ],
          valueColor: hasErrors ? COLORS.fgRed : COLORS.fgGreen
        };
        const valuesBorderedOptions: BorderedRow = {
          ...borderOptions,
          borderColor: COLORS.fgWhite,
          isLast
        };

        if (hasErrors) {

          const errorsValues: SimpleRowOptions = {
            values: [logDetail.entityName, logDetail.errors],
            valueColor: COLORS.fgRed
          };
          errorsRows.push(
            new ErrorLogRow(errorsValues)
          );
        }

        detailsCounter = detailsCounter + 1;
        logRows.push(new LogBorderedRow(values, valuesBorderedOptions));
      }

    }
    return [
      ...logRows,
      ...errorsRows
    ];
  }

}


export class SimpleRow implements Drawable {

  constructor(
    protected readonly simpleRowOptions: SimpleRowOptions
  ) {
  }

  build(): string {
    return this.simpleRowOptions.values.join('\n');
  }

  draw(): void {
    console.log(this.build());
  }

  protected static encloseColor(value: string, color: COLORS): string {
    return `${color}${value}${COLORS.reset}`;
  }
}

export class ErrorLogRow extends SimpleRow {


  build(): string {
    return [
      SimpleRow.encloseColor(
        this.simpleRowOptions.values[0],
        this.simpleRowOptions.valueColor ?? COLORS.fgRed
      ),
      SimpleRow.encloseColor(
        this.simpleRowOptions.values[1].toString(),
        COLORS.fgYellow
      )
    ].join('\n');
  }
}

export enum BorderType {
  MID = 'mid',
  TOP = 'top',
  BOT = 'bot',
}

export class LogBorderedRow extends SimpleRow {

  constructor(
    private readonly options: SimpleRowOptions,
    private readonly borderOptions: BorderedRow
  ) {
    super(options);
  }


  build(): string {
    if (!(this.borderOptions.grids.length >= this.options.values.length)) {
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
        const colLength = this.borderOptions.grids[index];
        return this.addSpaces(value, colLength);
      }
    ).join('');

    cols = SimpleRow.encloseColor(cols, this.options.valueColor);
    cols = LogBorderedRow.encloseMargin(cols, this.borderOptions.lateralPath, this.borderOptions.borderColor);
    const border = this.generateBorder(COLORS.fgWhite, this.borderOptions.isLast ? BorderType.BOT : BorderType.MID);
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

  private generateBorder(color: COLORS = COLORS.fgWhite, type?: BorderType): string {

    const { bottomTopPat } = this.borderOptions;
    let corner = this.defaultBorder;
    switch (type) {
      case BorderType.BOT:
        corner = this.botBorder;
        break;
      case BorderType.TOP:
        corner = this.topBorder;
        break;
      case BorderType.MID:
        corner = this.midBorder;
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
    const { borderColor, values, valueColor, lateralPath } = {
      ...this.borderOptions,
      ...this.options
    };
    let rowFormat = this.addSpaces(values[0]);
    rowFormat = LogBorderedRow.encloseColor(rowFormat, valueColor);
    rowFormat = LogBorderedRow.encloseMargin(rowFormat, lateralPath, borderColor);
    const topBorder = this.generateBorder(borderColor, BorderType.TOP);
    const midBorder = this.generateBorder(borderColor, BorderType.MID);
    return '\n' + topBorder + '\n' + rowFormat + '\n' + midBorder + '\n';
  }


  get length(): number {
    return this.borderOptions.grids.reduce((total: number, grid) => total + grid, 0);
  }

  protected get midBorder(): [string, string] {
    return this.borderOptions.lightBorder ? [' ', ' '] : ['╠', '╣'];
  }

  protected get topBorder(): [string, string] {
    return this.borderOptions.lightBorder ? [' ', ' '] : ['╔', '╗'];
  }

  protected get botBorder(): [string, string] {
    return this.borderOptions.lightBorder ? [' ', ' '] : ['╚', '╝'];
  }

  protected get defaultBorder(): [string, string] {
    return this.borderOptions.lightBorder ? [' ', ' '] : ['=', '='];
  }
}
