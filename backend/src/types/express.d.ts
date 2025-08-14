import { Request } from 'express';

interface IUserPayload {
  id: string;
  role: 'ADMIN' | 'EMPLOYEE';
  firstName: string;
  lastName: string;
}

declare global {
  namespace Express {
    export interface Request {
      user?: IUserPayload;
    }
  }
}
