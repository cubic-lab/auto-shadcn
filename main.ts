import { join } from 'node:path';
import fs from 'node:fs';
import github from './libs/github.ts';
import { generateCode } from './libs/llm.ts';
import { getPrInformation, applyPR } from './libs/pr.ts';
import { refineCode } from './libs/codex.ts';

const LABEL = 'ui-gen';
const PLACEHOLDER_CODE = 'export default function Preview() { return <p>placeholder</p>; }';
const PREVIEW_FILE_PATH = 'preview-ui/src/Preview.jsx';
const SYSTEM_PROMPT = fs.readFileSync(join(__dirname, '/prompts/ui-gen.md'), 'utf-8');

(async function main() {
	const res = await getPrInformation(LABEL, {
		PREVIEW_FILE_PATH: PLACEHOLDER_CODE,
	});
	if (!res) {
		return;
	}

	const { commitMsg, images, owner, repo, branch, issue, pr } = res;
	let { prompt } = res;
	const currentCode = await github.getFileContent(
		owner,
		repo,
		branch,
		PREVIEW_FILE_PATH,
	);
	if (currentCode !== PLACEHOLDER_CODE) {
		prompt += `
Previously you already implemented the following code, use it as a reference and meet my new requirements:
\`\`\`jsx
${currentCode}
\`\`\`
`;
	}
	const { code, usage, description } = await generateCode(
		[
			{
				role: 'system',
				content: SYSTEM_PROMPT,
			},
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: prompt,
					},
					...images.map(
						(image) =>
							({
								type: 'image_url',
								image_url: {
									url: image,
								},
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							}) as any,
					),
				],
			},
		],
		'qwen-vl-max-latest',
	);
	console.log(JSON.stringify(usage, null, 2));
	await applyPR(
		owner,
		repo,
		issue.number,
		branch,
		{
			'preview-ui/src/Preview.jsx': refineCode(code),
		},
		`[AutoDev] prompt:\r\n${commitMsg}`,
		[LABEL],
	);
	if (description) {
		await github.issues.createComment({
			owner,
			repo,
			issue_number: pr.number,
			body: `[AutoDev]: ${description}`,
		});
	}
})();
