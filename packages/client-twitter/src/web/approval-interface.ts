import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApprovalQueue } from '../approval-queue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WebApprovalInterface {
    private queue: ApprovalQueue;
    private app: express.Express;
    private port: number;

    constructor(queue: ApprovalQueue, port: number = 3001) {
        this.queue = queue;
        this.port = port;
        this.app = express();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        // Serve static files
        this.app.use(express.static(path.join(__dirname)));
        this.app.use(express.json());

        // Root redirect to approval interface
        this.app.get('/', (req, res) => {
            res.redirect('/twitter-approval');
        });

        // Main approval interface
        this.app.get('/twitter-approval', (req, res) => {
            res.sendFile(path.join(__dirname, 'approval.html'));
        });

        // API Routes
        this.app.get('/api/twitter/pending-tweets', async (req, res) => {
            try {
                const tweets = await this.queue.list('pending');
                res.json(tweets);
            } catch (error) {
                console.error('Error fetching pending tweets:', error);
                res.status(500).json({ error: 'Failed to fetch pending tweets' });
            }
        });

        this.app.post('/api/twitter/approve/:id', async (req, res) => {
            try {
                const { id } = req.params;
                await this.queue.approve(id);
                res.json({ success: true });
            } catch (error) {
                console.error('Error approving tweet:', error);
                res.status(500).json({ error: 'Failed to approve tweet' });
            }
        });

        this.app.post('/api/twitter/reject/:id', async (req, res) => {
            try {
                const { id } = req.params;
                await this.queue.reject(id);
                res.json({ success: true });
            } catch (error) {
                console.error('Error rejecting tweet:', error);
                res.status(500).json({ error: 'Failed to reject tweet' });
            }
        });

        // 404 handler for unmatched routes
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Not found' });
        });

        // Error handling middleware
        this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error('Server error:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
    }

    async start(): Promise<void> {
        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
                console.log(`Twitter approval interface running at http://localhost:${this.port}/twitter-approval`);
                resolve();
            });
        });
    }

    async stop(): Promise<void> {
        // Cleanup and close resources
        await this.queue.close();
    }

    static async create(dbPath?: string, port?: number): Promise<WebApprovalInterface> {
        const queue = new ApprovalQueue(dbPath);
        return new WebApprovalInterface(queue, port);
    }
}

if (require.main === module) {
    (async () => {
        const approvalInterface = await WebApprovalInterface.create();
        try {
            await approvalInterface.start();
        } catch (error) {
            console.error('Fatal error:', error);
            process.exit(1);
        }
    })();
}
