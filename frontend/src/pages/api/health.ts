import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
	status: string;
	timestamp: number;
	uptime: number;
};

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<HealthResponse>
) {
	res.status(200).json({
		status: 'ok',
		timestamp: Date.now(),
		uptime: process.uptime(),
	});
}
