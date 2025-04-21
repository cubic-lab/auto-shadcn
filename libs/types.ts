export type IssueEvent = {
	actor: { login: string };
	action: string;
	issue: {
		body: string;
		number: number;
		labels: { name: string }[];
		user: { login: string };
		pull_request?: { url: string };
		state: string;
	};
	comment?: {
		body: string;
	};
};
