import Parser from "rss-parser";
import { DateTime } from "luxon";
import { Grss } from "@/types/grss";

type CustomFeed = { foo: string };
type CustomItem = { bar: number };

const parser: Parser<CustomFeed, CustomItem> = new Parser({});

const getRss = async (url): Promise<Grss> => {
  const feeds = await parser.parseURL(url);
  console.log();
  return feeds.items
    .filter((feed) => {
      return (
        DateTime.fromJSDate(new Date(feed.pubDate)) >
        DateTime.local().plus({ days: -1 })
      );
    })
    .map((feed) => {
      return { title: feed.title, link: feed.link };
    });
};
export { getRss };
