import OpenAI from 'openai';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visitParents } from 'unist-util-visit-parents';
import { remove } from 'unist-util-remove';
import { toMarkdown } from 'mdast-util-to-markdown';
import { retry } from 'ts-retry-promise';

const llm = new OpenAI({
	baseURL: process.env.LLM_BASE_URL,
	apiKey: process.env.LLM_API_KEY,
});

export async function generateCode(
	messages: OpenAI.Chat.ChatCompletionMessageParam[],
	model: string,
) {
	return await retry<{
		code?: string;
		usage?: OpenAI.Completions.CompletionUsage | undefined;
		description: string;
	}>(
		async () => {
			const chatCompletion = await llm.chat.completions.create({
				messages,
				model: model,
				max_tokens: 3000,
				temperature: 0,
			});
			const content = chatCompletion?.choices[0]?.message.content || '';
			console.log('raw output> ', content);

			const codeBlocks: string[] = [];
			const tree = fromMarkdown(content);
			visitParents(tree, 'code', (node) => {
				codeBlocks.push(node.value.trim());
			});
			remove(tree, 'code');

			return {
				code: codeBlocks[0],
				usage: chatCompletion.usage,
				description: toMarkdown(tree),
			};
		},
		{
			delay: 100,
			retries: 3,
      timeout: 30 * 60_000,
		},
	);
}
