import {COLORS} from '../constants/colors';


export interface PrimaryRow {
    length?: number;
    valueColor: COLORS;
    borderColor: COLORS;
    bottomTopPat: string;
    lateralPath: string;
    isLast?: boolean;
}

export interface RowOptions extends PrimaryRow {
    value: string;
}

export interface GridOptions extends PrimaryRow {
    values: string[];
    grid: number[];
}

export  interface SimpleRowOptions {
    values: any[];
    valueColor?: COLORS;
}

export interface  BorderedRow extends SimpleRowOptions{
    borderColor: COLORS;
    bottomTopPat: string;
    grids: number[];
    lateralPath: string;
    isLast?: boolean;
}