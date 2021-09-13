import {Request, Response} from 'express';
import {Attribute, JStatement, Manager, Statement, StringMap} from './metadata';

export function createProxyController(manager: Manager) {
  const c = new ProxyController(manager.query, manager.exec, manager.execBatch);
  return c;
}
export class ProxyController {
  constructor(protected queryFn: <T>(sql: string, args?: any[], m?: StringMap, bools?: Attribute[], ctx?: any) => Promise<T[]>,
    protected execFn: (sql: string, args?: any[], ctx?: any) => Promise<number>,
    protected execBatchFn: (statements: Statement[], firstSuccess?: boolean, ctx?: any) => Promise<number>,
    public log?: (msg: any, ctx?: any) => void) {
    this.query = this.query.bind(this);
    this.exec = this.exec.bind(this);
    this.execBatch = this.execBatch.bind(this);
  }
  query(req: Request, res: Response) {
    const s: JStatement = req.body;
    if (Array.isArray(s)) {
      res.status(400).end('The request body cannot be an array');
    } else {
      const p = parseDate(s.params, s.dates);
      this.queryFn(s.query, p).then(r => {
        res.status(200).json(r);
      }).catch(err => handleError(err, res, this.log));
    }
  }
  exec(req: Request, res: Response) {
    const s: JStatement = req.body;
    if (Array.isArray(s)) {
      res.status(400).end('The request body cannot be an array');
    } else {
      const p = parseDate(s.params, s.dates);
      this.execFn(s.query, p).then(r => {
        res.status(200).json(r);
      }).catch(err => handleError(err, res, this.log));
    }
  }
  execBatch(req: Request, res: Response) {
    const j: JStatement[] = req.body;
    if (!Array.isArray(j)) {
      res.status(400).end('The request body must be an array');
    } else {
      const s: Statement[] = [];
      for (const x of j) {
        const p = parseDate(x.params, x.dates);
        const y: Statement = {query: x.query, params: p};
        s.push(y);
      }
      const field = req.query['master'];
      let master = false;
      if (field && field.toString() === 'master') {
        master = true;
      }
      this.execBatchFn(s, master).then(r => {
        res.status(200).json(r);
      }).catch(err => handleError(err, res, this.log));
    }
  }
}
export function handleError(err: any, res: Response, log?: (msg: any, ctx?: any) => void) {
  const x = (typeof err === 'string' ? err : JSON.stringify(err));
  if (log) {
    log(x);
    res.status(500).end('Internal Server Error');
  } else {
    res.status(500).json(x).end();
  }
}
export function parseDate(args: any[], dates?: number[]): any[] {
  if (!args || !dates || args.length === 0 || dates.length === 0) {
    return args;
  }
  const l = args.length;
  const l2 = dates.length;
  for (let i = 0; i < l2; i++) {
    const j = dates[i];
    if (j >= l) {
      break;
    }
    const x = args[j];
    if (x) {
      const d = new Date(x);
      if (!(!(d instanceof Date) || d.toString() === 'Invalid Date')) {
        args[j] = d;
      }
    }
  }
  return args;
}
