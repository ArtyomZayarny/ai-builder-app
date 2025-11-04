import type { Request, Response } from 'express';

export function getCurrentUser(req: Request, res: Response): Promise<void>;
export function updateCurrentUser(req: Request, res: Response): Promise<void>;
export function deleteCurrentUser(req: Request, res: Response): Promise<void>;

