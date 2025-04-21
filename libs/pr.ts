import github from './github.ts';
import { checkQuota } from './quota.ts';
import type { IssueEvent } from './types.ts';

const VALID_COMMENT_PREFIX = '[AutoDev]';

type CreatePROptions = {
	eventName: string;
	issueEvent: IssueEvent;
	owner: string;
	repo: string;
	branch: string;
	label: string;
	placeholderFiles: Record<string, string>;
};

function isValidComment(
	comment: {
		body?: string;
		user?: { login: string } | null;
	},
	login?: string,
) {
	return (
		!comment.body?.includes(VALID_COMMENT_PREFIX) &&
		(login
			? comment.user?.login === login
			: checkWhitelist(comment.user?.login || ''))
	);
}

function checkWhitelist(login: string): boolean {
	const whitelistStr = process.env.WHITELIST;

	if (!whitelistStr) {
		return false;
	}

	const whitelist = whitelistStr.split(',');
	return whitelist.some((item) => item === login);
}

export async function checkValid(
	owner: string,
	repo: string,
	login: string,
): Promise<boolean> {
	const valid = checkWhitelist(login) || (await checkQuota(owner, repo, login));

	return valid;
}

export async function applyPR(
	owner: string,
	repo: string,
	issueNumber: number,
	newBranch: string,
	files: Record<string, string>,
	commitMsg: string,
	labels: string[],
) {
	const baseBranch = 'main';

	await github.createOrUpdateFiles({
		owner,
		repo,
		branch: newBranch,
		createBranch: true,
		// base: baseBranch,
		// forkFromBaseBranch: true,
		changes: [
			{
				message: commitMsg,
				files,
			},
		],
	});

	let pr = (
		await github.search.issuesAndPullRequests({
			q: `is:open is:pr base:${baseBranch} head:${newBranch}+repo:${owner}/${repo}`,
		})
	).data.items[0];

	if (!pr) {
		pr = (
			await github.pulls.create({
				owner,
				repo,
				head: newBranch,
				base: baseBranch,
				title: `${VALID_COMMENT_PREFIX} implements #${issueNumber}`,
				body: `${VALID_COMMENT_PREFIX} This PR implements & closes #${issueNumber}, created by AutoShadcn.`,
			})
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		).data as any;
	}

	github.issues.setLabels({
		owner,
		repo,
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		issue_number: pr!.number,
		labels,
	});

	return pr;
}

async function getPrNumber({
	eventName,
	issueEvent,
	owner,
	repo,
	label,
	placeholderFiles,
}: CreatePROptions) {
	const isPr = Boolean(issueEvent.issue.pull_request);
	if (issueEvent.issue.labels.every((l) => l.name !== label)) {
		throw new Error('label mismatch');
	}

	if (isPr && eventName === 'issues') {
		throw new Error('non-comments event in PR');
	}

	if (
		['issue_comment', 'pull_request_review_comment'].includes(eventName) &&
		issueEvent.comment &&
		!isValidComment(issueEvent.comment)
	) {
		throw new Error('invalid comment');
	}

	if (issueEvent.issue.state !== 'open') {
		throw new Error('closed issue/PR');
	}

	// check whitelist and quota
	const valid = await checkValid(owner, repo, issueEvent.actor.login);
	if (!valid) {
		throw new Error(
			'invalid request, please check the whitelist or quota config',
		);
	}

	const issue = isPr
		? await github.getConnectedIssue(owner, repo, issueEvent.issue.body)
		: issueEvent.issue;

	const branch = `${label}-issue-${issue.number}`;

	let pr: { number: number } = { number: -1 };

	if (isPr) {
		// is PR event
		pr = issueEvent.issue;
	} else {
		const connectedPrNumber = await github.getConnectedPr(
			owner,
			repo,
			issue.number,
		);
		const number = connectedPrNumber
			? (
					await github.pulls.get({
						owner,
						repo,
						pull_number: connectedPrNumber,
					})
				).data.number
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			: (await applyPR(
					owner,
					repo,
					issue.number,
					branch,
					placeholderFiles,
					'[Skip CI] AutoShadcn: init the PR',
					[label],
				))!.number;
		pr = {
			number,
		};
	}

	return {
		pr,
		issue,
	};
}

async function getPromptAndImages(
	owner: string,
	repo: string,
	issue: {
		number: number;
		body?: string | null;
		user?: { login: string } | null;
	},
	pr: { number: number },
	branch: string,
) {
	const prComments = (
		await github.issues.listComments({
			owner,
			repo,
			issue_number: pr.number,
		})
	).data;
	const issueComments = (
		await github.issues.listComments({
			owner,
			repo,
			issue_number: issue.number,
		})
	).data;

	let commentsStr = issueComments
		.concat(prComments)
		.filter((c) => isValidComment(c, issue.user?.login || '-'))
		.sort(
			(a, b) =>
				new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
		)
		.map((c) => c.body)
		.join('\n');

	const prReviews = (
		await github.pulls.listReviewComments({
			owner,
			repo,
			pull_number: pr.number,
		})
	).data;

	for (const r of prReviews
		.filter(
			(r) =>
				isValidComment(r, issue.user?.login || '-') &&
				r.commit_id === r.original_commit_id,
		)
		.sort(
			(a, b) =>
				new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
		)) {
		let lineCode = '';
		if (r.line) {
			const code = await github.getFileContent(owner, repo, branch, r.path);
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			lineCode = (code || '').split('\n')[r.line - 1]!;
		}
		if (lineCode) {
			commentsStr += `\nIn your previous implemented code, I want to modify this part:
\`\`\`
${lineCode}
\`\`\`
by following the instruction:`;
		}
		commentsStr += `\n${r.body}\n`;
	}

	let prompt = `${issue.body || ''}\n${commentsStr}`;
	const regex = /!\[.*?\]\((.*?)\)/g;
	const imgRegex = /<img .*?src="(.*?)".*?>/g;
	const images = [];
	let match: RegExpExecArray | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	while ((match = regex.exec(prompt)) !== null) {
		images.push(match[1]);
	}

	let imgMatch: RegExpExecArray | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	while ((imgMatch = imgRegex.exec(prompt)) !== null) {
		images.push(imgMatch[1]);
	}
	prompt = prompt.replace(regex, '').replace(imgRegex, '');

	return {
		prompt,
		images,
	};
}

export async function getPrInformation(
	label: string,
	placeholderFiles: Record<string, string>,
) {
	const { owner, repo } = github.getOwnerAndRepo();
	const { event: issueEvent, eventName } = await github.getIssueEvent();
	const branch = `${label}-issue-${issueEvent.issue.number}`;
	console.log(
		issueEvent.action,
		eventName,
		issueEvent.issue,
		issueEvent.comment,
		issueEvent.actor,
	);

	const { pr, issue } = await getPrNumber({
		eventName,
		issueEvent,
		owner,
		repo,
		branch,
		label,
		placeholderFiles,
	});
	const { prompt, images } = await getPromptAndImages(
		owner,
		repo,
		issue,
		pr,
		branch,
	);
	const commitMsg = JSON.stringify(
		{
			prompt,
			images,
		},
		null,
		2,
	);

	return {
		commitMsg,
		prompt,
		images,
		owner,
		repo,
		branch,
		issue,
		pr,
	};
}
