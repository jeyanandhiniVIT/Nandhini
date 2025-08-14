import { Request } from 'express';

interface IUserPayload {
  id: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

declare global {
  namespace Express {
    export interface Request {
      user?: IUserPayload;
    }
  }
}
