import OpenAI from "@openai/openai";
import { fromMarkdown } from 'https://esm.sh/mdast-util-from-markdown@2'
import { visitParents } from 'https://esm.sh/unist-util-visit-parents@6'
import { remove } from 'https://esm.sh/unist-util-remove@4'
import { toMarkdown } from 'https://esm.sh/mdast-util-to-markdown@2'
import { retryAsync } from "https://deno.land/x/retry@v2.0.0/mod.ts";

const llm = new OpenAI({
  baseURL: Deno.env.get("LLM_BASE_URL"),
  apiKey: Deno.env.get("LLM_API_KEY"),
});

export async function generateCode(
  messages: OpenAI.Chat.ChatCompletionMessageParam[] = [],
  model: string,
) {
  return await retryAsync<{
    code: string;
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
      console.log("raw output> ", chatCompletion.choices[0].message.content);

      const codeBlocks: string[] = [];
      const tree = fromMarkdown(
        chatCompletion.choices[0].message.content || ""
      );
      visitParents(tree, "code", (node) => {
        codeBlocks.push(node.value.trim());
      });
      remove(tree, "code");

      return {
        code: codeBlocks[0],
        usage: chatCompletion.usage,
        description: toMarkdown(tree),
      };
    },
    {
      delay: 100,
      maxTry: 3,
    }
  );
}