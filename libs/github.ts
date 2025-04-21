import type { IssueEvent } from './types';
import { Octokit } from 'octokit';
import OctokitCommitPlugin from 'octokit-commit-multiple-files';
import { assert } from './assets';

const PatchedOctokit = Octokit.plugin(OctokitCommitPlugin);

type CreateCommitOptions = {
  owner: string;
  repo: string;
  branch: string;
  createBranch: boolean;
  base?: string;
  committer?: string;
  author?: string;
  changes: { message: string; files: Record<string, string> }[];
  batchSize?: number;
  forkFromBaseBranch?: string;
};

class Github {
  private octokit: Octokit;

  constructor() {
    const ghToken = process.env.GH_TOKEN;
    assert(ghToken, 'failed to get github token');

    this.octokit = new PatchedOctokit({
      auth: ghToken,
    });
  }

  getOwnerAndRepo() {
    const owner = process.env.GITHUB_REPOSITORY_OWNER;
    assert(owner, 'failed to get repo owner');

    let repo = process.env.GITHUB_REPOSITORY;
    assert(repo, 'failed to get repo name');
    repo = repo.replace(`${owner}/`, '');

    return {
      owner,
      repo,
    };
  }

  async getConnectedIssue(owner: string, repo: string, prBody: string) {
    const issueNumber = Number.parseInt(
      prBody.match(/\[AutoDev\] This PR implements & closes #(\d+),/)?.[1] ||
      '',
    );
    if (!issueNumber) {
      throw new Error('failed to get connected issue');
    }

    return (
      await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      })
    ).data;
  }

  async getIssueEvent() {
    const githubEventPath = process.env.GITHUB_EVENT_PATH;
    assert(githubEventPath, 'failed to get github event path');

    let issueEvent: IssueEvent = (
      await import(githubEventPath, {
        with: { type: 'json' },
      })
    ).default;

    const eventName = process.env.GITHUB_EVENT_NAME;
    assert(eventName, 'failed to get event name');

    const actor = process.env.ACTOR;
    assert(actor, 'failed to get actor');

    if (eventName === 'pull_request_review_comment') {
      const { action, comment, pull_request } = issueEvent as unknown as {
        action: string;
        comment: { body: string };
        pull_request: { body: string };
      };
      const { owner, repo } = this.getOwnerAndRepo();

      issueEvent = {
        actor: {
          login: actor,
        },
        action,
        comment,
        issue: (await this.getConnectedIssue(
          owner,
          repo,
          pull_request.body,
        )) as IssueEvent['issue'],
      };
    }

    return {
      event: {
        ...issueEvent,
        actor: {
          login: actor,
        },
      },
      eventName,
    };
  }

  listRepoWorkflows({ owner, repo }: { owner: string; repo: string }) {
    return this.octokit.rest.actions.listRepoWorkflows({
      owner,
      repo,
    });
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  iterator(action: any, options: any) {
    return this.octokit.paginate.iterator(action, options);
  }

  get actions() {
    return this.octokit.rest.actions;
  }

  get activity() {
    return this.octokit.rest.activity;
  }

  get pulls() {
    return this.octokit.rest.pulls;
  }

  get search() {
    return this.octokit.rest.search;
  }

  get issues() {
    return this.octokit.rest.issues;
  }

  get repos() {
    return this.octokit.rest.repos;
  }

  async getConnectedPr(owner: string, repo: string, issueNumber: number) {
    const connectedEvent = await this.octokit.graphql<{
      repository: {
        issue?: {
          timelineItems: {
            nodes: {
              id: string;
              source: { number: number; state: string };
              __typename: string;
              createdAt: string;
            }[];
          };
        };
      };
    }>(`{
      repository(owner: "${owner}", name: "${repo}") {
        issue(number: ${issueNumber}) {
          timelineItems(itemTypes: [CROSS_REFERENCED_EVENT], first: 1) {
            nodes {
              ... on CrossReferencedEvent {
                id
                createdAt
                source {
                  ... on PullRequest {
                    id
                    number
                    state
                  }
                }
                __typename
              }
            }
          }
        }
      }
    }`);

    let { nodes = [] } = connectedEvent.repository.issue?.timelineItems || {};
    nodes = nodes
      .filter((n) => n.source.state === 'OPEN')
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return nodes[0]?.source.number;
  }

  createOrUpdateFiles(options: CreateCommitOptions): Promise<void> {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return (this.octokit as any).createOrUpdateFiles(options);
  }

  async getFileContent(
    owner: string,
    repo: string,
    branch: string,
    path: string,
  ) {
    const res = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      ref: branch,
      path,
    });
    const data = res.data;

    if ('type' in data && data.type === 'file') {
      return atob(data.content);
    }
  }
}

const github = new Github();

export default github;
