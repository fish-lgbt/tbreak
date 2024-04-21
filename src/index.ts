import { Scraper } from '@the-convocation/twitter-scraper';

const scraper = new Scraper({
	fetch: fetch,
});

type FetchStatsQueueMessage = {
	username: string;
};

type NewUserQueueMessage = {
	username: string;
};

export default {
	async scheduled(event: ScheduledEvent, env: CloudflareEnv, ctx: ExecutionContext) {
		// Fetch all the users we're tracking
		const { results: users } = await env.DATABASE.prepare('SELECT username FROM users').all<{ username: string }>();

		// If there are no users, return
		if (users.length === 0) {
			console.info('No users to fetch stats for');
			return;
		}

		// Queue a fetch stats job for each user
		for (const user of users) {
			await env.QUEUE.send({
				username: user.username,
			});
		}
	},
	async queue(batch: MessageBatch<FetchStatsQueueMessage | NewUserQueueMessage>, env: CloudflareEnv): Promise<void> {
		console.info('Processing queue', batch.queue, batch.messages.length);

		switch (batch.queue) {
			case 'stats':
				// Fetch the stats for each user
				for (const message of batch.messages) {
					// Fetch the user's profile
					const profile = await scraper.getProfile(message.body.username);

					// Save the stats to D1
					await env.DATABASE.prepare('INSERT INTO stats (user_id, followers, following, tweets) VALUES (?, ?, ?, ?)')
						.bind(profile.userId, profile.followersCount, profile.followingCount, profile.tweetsCount)
						.run();
				}
				break;
			default:
				throw new Error(`Unknown queue: ${batch.queue}`);
		}

		console.info('Finished processing queue', batch.queue);
	},
};
