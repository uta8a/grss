import { Client } from "@notionhq/client";
import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints.d";
import type { Rss } from "@/types/grss";

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const writeRss = async (rss: Rss) => {
  const response: CreatePageResponse = await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_DATABASE_ID || "",
    },
    icon: null,
    cover: null,
    properties: {
      link: {
        type: "url",
        url: rss.link,
      },
      title: {
        type: "title",
        title: [
          {
            text: {
              content: rss.title,
            },
          },
        ],
      },
    },
    children: [],
  });
  console.log(response);
};

export { writeRss };
