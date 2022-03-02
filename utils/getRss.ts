import Parser from "rss-parser";
import { DateTime } from "luxon";
import { Grss } from "@/types/grss";
import fetch from "node-fetch";
import * as fs from "fs";
import { TextDecoder } from "text-encoding";
import { fileURLToPath } from "url";
import { Hash } from "crypto";
type CustomFeed = {};
type CustomItem = { updated: number };

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: ["updated"],
  },
});
const getNum = async () => {
  let file = fs.readFileSync(`${process.cwd()}/.enviacr`, "utf-8");
  if (file === undefined) {
    file = "0/0";
  }
  const year = file.split("/")[0];
  const num = file.split("/")[1];
  return [parseInt(year), parseInt(num)];
};
const getRss = async (url): Promise<Grss> => {
  // workaround, iacr atom feed is broken
  if (url === "https://eprint.iacr.org/rss/atom.xml") {
    const req = await fetch(url);
    // console.log(req);
    let rawbody = await req.arrayBuffer();
    const dec = new TextDecoder();
    let strbody = dec.decode(rawbody);
    // console.log(strbody);
    const body = strbody
      .replaceAll(/<content[\s\S]*?<\/content.*?>/gm, "<content></content>")
      .replaceAll(
        /<description[\s\S]*?<\/description.*?>/gm,
        "<description></description>"
      )
      .replaceAll(/^.*category term.*$/gm, "") // workaround for IACR eprint
      .replaceAll(/[^\x00-\x7f]/gm, "") // workaround for unicode invalid
      .replaceAll(/[^\x00-\x7f]/gm, ""); // workaround for unicode invalid
    const feeds = await parser.parseString(body);
    const [prev_year, prev_num] = await getNum(); // get previous iacr num
    let now_year = prev_year;
    let now_num = prev_num;
    let rss = [];
    for (const feed of feeds.items) {
      const splitted = feed.link.split("/");
      const year = parseInt(splitted[splitted.length - 2]);
      const num = parseInt(splitted[splitted.length - 1]);
      if (isNaN(year) || isNaN(num)) {
        throw new Error(`NaN: ${url}`);
      }
      if (year > prev_year) {
        now_num = year > now_year ? num : now_num > num ? now_num : num;
        now_year = year > now_year ? year : now_year;
        rss.push({ title: feed.title, link: feed.link });
      } else if (year < prev_year) {
        continue;
      } else {
        now_num = now_num > num ? now_num : num;
        if (num > prev_num) {
          rss.push({ title: feed.title, link: feed.link });
        }
      }
    }
    fs.writeFileSync(`${process.cwd()}/.enviacr`, `${now_year}/${now_num}`);
    return rss;
  }

  const req = await fetch(url);
  let rawbody = await req.arrayBuffer();
  const dec = new TextDecoder();
  let strbody = dec.decode(rawbody);
  const body = strbody
    .replaceAll(/<content[\s\S]*?<\/content.*?>/gm, "<content></content>")
    .replaceAll(
      /<description[\s\S]*?<\/description.*?>/gm,
      "<description></description>"
    )
    .replaceAll(/^.*category term.*$/gm, "") // workaround for IACR eprint
    .replaceAll(/[^\x00-\x7f]/gm, "") // workaround for unicode invalid
    .replaceAll(/[^\x00-\x7f]/gm, ""); // workaround for unicode invalid
  const feeds = await parser.parseString(body);
  return feeds.items
    .filter((feed) => {
      const date = feed.pubDate;
      if (date === undefined) {
        throw new Error(`Date is not specified: ${url}`);
      }
      if (feed.title === undefined) {
        throw new Error(`title is not specified: ${feed.title}, ${url}`);
      }
      if (feed.link === undefined) {
        throw new Error(`link is not specified: ${feed.title}, ${url}`);
      }
      return (
        DateTime.fromJSDate(new Date(date)) >
        DateTime.local().plus({ days: -1 })
      );
    })
    .map((feed) => {
      return { title: feed.title, link: feed.link };
    });
};
export { getRss };
