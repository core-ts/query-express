export interface Manager {
  exec(sql: string, args?: any[], ctx?: any): Promise<number>;
  execBatch(statements: Statement[], firstSuccess?: boolean, ctx?: any): Promise<number>;
  query<T>(sql: string, args?: any[], m?: StringMap, bools?: Attribute[], ctx?: any): Promise<T[]>;
}
export interface Statement {
  query: string;
  params?: any[];
}
export interface JStatement {
  query: string;
  params?: any[];
  dates?: number[];
}
export interface StringMap {
  [key: string]: string;
}

export type DataType = 'ObjectId' | 'date' | 'datetime' | 'time'
    | 'boolean' | 'number' | 'integer' | 'string' | 'text'
    | 'object' | 'array' | 'primitives' | 'binary';
export type FormatType = 'currency' | 'percentage' | 'email' | 'url' | 'phone' | 'fax' | 'ipv4' | 'ipv6';

export interface Attribute {
  name?: string;
  field?: string;
  type?: DataType;
  format?: FormatType;
  required?: boolean;
  default?: string|number|Date;
  key?: boolean;
  q?: boolean;
  noinsert?: boolean;
  noupdate?: boolean;
  version?: boolean;
  ignored?: boolean;
  length?: number;
  min?: number;
  max?: number;
  gt?: number;
  lt?: number;
  exp?: RegExp|string;
  code?: string;
  typeof?: Attributes;
  true?: string|number;
  false?: string|number;
}
export interface Attributes {
  [key: string]: Attribute;
}
