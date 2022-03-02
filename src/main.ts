import { getRss } from "@/utils/getRss";
import { writeRss } from "@/utils/writeData";
import { loadYaml } from "@/utils/getList";

const main = async () => {
  const list = loadYaml();
  list.map(async (element) => {
    const grss = await getRss(element.url);
    grss.map(async (rss) => {
      await writeRss(rss);
    });
  });
};

main().catch((e) => {
  console.log("main Error: ", e);
});
