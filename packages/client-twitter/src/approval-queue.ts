import sqlite3 from "sqlite3";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const { Database } = sqlite3;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PendingTweet {
    id: string;
    content: string;
    metadata: any;
    createdAt: Date;
    status: 'pending' | 'approved' | 'rejected';
    expiresAt: Date;  // Added for timeout functionality
}

export class ApprovalQueue {
    private db: sqlite3.Database;
    private dbPath: string;
    private defaultTimeout: number;
    private webhookUrl?: string;

    constructor(
        dbPath?: string,
        defaultTimeout: number = 24 * 60 * 60 * 1000,
        webhookUrl?: string
    ) {
        this.dbPath = dbPath || path.join(__dirname, 'approval-queue.db');
        this.db = new Database(this.dbPath);
        this.defaultTimeout = defaultTimeout;
        this.webhookUrl = webhookUrl;
        this.initialize();
    }

    private async initialize(): Promise<void> {
        const run = promisify(this.db.run.bind(this.db));
        await run(`
            CREATE TABLE IF NOT EXISTS pending_tweets (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending'
            )
        `);

        setInterval(() => this.cleanupExpired(), 5 * 60 * 1000);
    }

    async add(content: string, metadata: any = {}, timeout?: number): Promise<string> {
        const run = promisify(this.db.run.bind(this.db));
        const id = Date.now().toString();
        const expiresAt = new Date(Date.now() + (timeout || this.defaultTimeout));
        await run(
            'INSERT INTO pending_tweets (id, content, metadata, expires_at) VALUES (?, ?, ?, ?)',
            [id, content, JSON.stringify(metadata), expiresAt.toISOString()]
        );
        return id;
    }

    async approve(id: string): Promise<void> {
        const run = promisify(this.db.run.bind(this.db));
        const result = await run(
            'UPDATE pending_tweets SET status = ? WHERE id = ? AND status = ? AND expires_at > ?',
            ['approved', id, 'pending', new Date().toISOString()]
        );
        if (result.changes === 0) {
            throw new Error(`Tweet ${id} not found, not in pending status, or has expired`);
        }

        // Send webhook notification if configured
        if (this.webhookUrl) {
            const tweet = await this.get(id);
            if (tweet) {
                await this.sendWebhookNotification('approved', tweet);
            }
        }
    }

    async reject(id: string): Promise<void> {
        const run = promisify(this.db.run.bind(this.db));
        const result = await run(
            'UPDATE pending_tweets SET status = ? WHERE id = ? AND status = ? AND expires_at > ?',
            ['rejected', id, 'pending', new Date().toISOString()]
        );
        if (result.changes === 0) {
            throw new Error(`Tweet ${id} not found, not in pending status, or has expired`);
        }

        // Send webhook notification if configured
        if (this.webhookUrl) {
            const tweet = await this.get(id);
            if (tweet) {
                await this.sendWebhookNotification('rejected', tweet);
            }
        }
    }

    async get(id: string): Promise<PendingTweet | null> {
        const get = promisify(this.db.get.bind(this.db));
        const row = await get(
            'SELECT * FROM pending_tweets WHERE id = ?',
            [id]
        );
        if (!row) return null;

        return {
            id: row.id,
            content: row.content,
            metadata: JSON.parse(row.metadata),
            createdAt: new Date(row.created_at),
            expiresAt: new Date(row.expires_at),
            status: row.status as 'pending' | 'approved' | 'rejected'
        };
    }

    async list(status?: 'pending' | 'approved' | 'rejected'): Promise<PendingTweet[]> {
        const all = promisify(this.db.all.bind(this.db));
        const query = status
            ? 'SELECT * FROM pending_tweets WHERE status = ? ORDER BY created_at DESC'
            : 'SELECT * FROM pending_tweets ORDER BY created_at DESC';
        const params = status ? [status] : [];

        const rows = await all(query, params);
        return rows.map(row => ({
            id: row.id,
            content: row.content,
            metadata: JSON.parse(row.metadata),
            createdAt: new Date(row.created_at),
            expiresAt: new Date(row.expires_at),
            status: row.status as 'pending' | 'approved' | 'rejected'
        }));
    }

    private async cleanupExpired(): Promise<void> {
        const run = promisify(this.db.run.bind(this.db));
        await run(
            'UPDATE pending_tweets SET status = ? WHERE status = ? AND expires_at <= ?',
            ['rejected', 'pending', new Date().toISOString()]
        );
    }

    async cleanupOld(maxAge: number): Promise<void> {
        const run = promisify(this.db.run.bind(this.db));
        const cutoff = new Date(Date.now() - maxAge);
        await run(
            'DELETE FROM pending_tweets WHERE created_at < ? AND status = ?',
            [cutoff.toISOString(), 'pending']
        );
    }

    async close(): Promise<void> {
        const close = promisify(this.db.close.bind(this.db));
        await close();
    }

    private async sendWebhookNotification(action: 'approved' | 'rejected', tweet: PendingTweet): Promise<void> {
        if (!this.webhookUrl) return;

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    tweet: {
                        id: tweet.id,
                        content: tweet.content,
                        metadata: tweet.metadata,
                        createdAt: tweet.createdAt,
                        status: tweet.status,
                        expiresAt: tweet.expiresAt,
                    },
                }),
            });

            if (!response.ok) {
                console.error(`Failed to send webhook notification: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error sending webhook notification:', error);
        }
    }
}
