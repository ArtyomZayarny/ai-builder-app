import type { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction): void;

