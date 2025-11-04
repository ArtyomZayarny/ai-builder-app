import type { Request, Response } from 'express';

export function register(req: Request, res: Response): Promise<void>;
export function login(req: Request, res: Response): Promise<void>;
export function logout(req: Request, res: Response): Promise<void>;

