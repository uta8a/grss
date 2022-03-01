import { getRss } from "@/utils/getRss";
import { writeRss } from "@/utils/writeData";
import { loadYaml } from "@/utils/getList";

const main = async () => {
  const list = loadYaml();
  list.map(async (element) => {
    const grss = await getRss(element.url);
    grss.map((rss) => {
      writeRss(rss);
    });
  });
};

main();
