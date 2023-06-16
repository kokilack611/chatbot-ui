import {NextApiRequest, NextApiResponse} from 'next';

import {OPENAI_API_HOST} from '@/utils/app/const';

import {Message} from '@/types/chat';
import {GoogleBody} from '@/types/google';
import endent from 'endent';
import puppeteer from 'puppeteer';
import {OpenAIModel} from "@/types/openai";
import {JSDOM} from 'jsdom';
import {Readability} from "@mozilla/readability";
import google from 'googlethis';
import {domContentSystemPrompt, googleLinkSListSystemPrompt, initialSystemPrompt} from "@/pages/api/constants";
import {Configuration, OpenAIApi} from "openai";

const runPuppeteerTasks = async (key: string, model: OpenAIModel, systemMessage: Message, messages: Message[], answer: string) => {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        const options = {
            page: 0,
            safe: false, // Safe Search
            parse_ads: false, // If set to true sponsored results will be parsed
            additional_params: {
                // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
                hl: 'en'
            }
        }
        const linkListResponse = await google.search(answer.SEARCH, options);
        const linkListPrompt = googleLinkSListSystemPrompt.concat(endent`\n
Input:
    {{{${JSON.stringify(linkListResponse.results.map(item => item.url).join(', '))}}}}
    Response:`);
        let response = await callGPT(
            key,
            model,
            { role: 'system', content: googleLinkSListSystemPrompt },
            messages,
            {role: 'assistant', content: linkListPrompt}
        )
        while ('GOTO' in response) {
            const url = response.GOTO;
            await page.goto(url);
            const domContent = await page.content()
            const dom = new JSDOM(domContent, {url});
            const reader = new Readability(dom.window.document);
            const article = reader.parse();
            const domContentPrompt = domContentSystemPrompt.concat(endent`\n
       Input:
    (((${article?.textContent.trim()})))
    Response:
    `);
            response = await callGPT(
                key,
                model,
                { role: 'system', content: domContentSystemPrompt },
                messages,
                {role: 'assistant', content: domContentPrompt}
            )
        }
        return response;
    } catch (error) {
        console.log(`An error occurred: ${error}`);
    } finally {
        // Close the browser
        await browser.close();
    }
};

async function callGPT(key: string, model: OpenAIModel, systemMessage: Message, messages: Message[], answerMessage: Message) {
    const restOfTheMessages = messages.slice(0, messages.length - 2);
    const openai = new OpenAIApi(new Configuration({
        apiKey: key || process.env.OPENAI_API_KEY
    }));

    const answerRes = await openai.createChatCompletion({
        model: model.id,
        messages: [
            systemMessage,
            ...restOfTheMessages,
            answerMessage,
        ],
        max_tokens: 1000,
        temperature: 1,
        stream: false,
    });

    const answer = answerRes?.data?.choices[0]?.message?.content;
    return JSON.parse(answer);
}

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    try {
        const {messages, key, model} =
            req.body as GoogleBody;

        const userMessage = messages[messages.length - 1];
        const answerPrompt = initialSystemPrompt.concat(
        endent`Input:
    [[[${userMessage.content.trim()}]]]
    Response:
    `
        );
        const answerMessage: Message = {role: 'user', content: answerPrompt};
        const systemMessage: Message = {role: 'system', content: initialSystemPrompt};

        let answer = await callGPT(key, model, systemMessage, messages, answerMessage);

        if ('SEARCH' in answer) {
            answer = await runPuppeteerTasks(key, model, systemMessage, messages, answer);
        }
        res.status(200).json({answer:answer.ANSWER});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error'})
    }
};

export default handler;
