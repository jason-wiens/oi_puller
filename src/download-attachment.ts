import { ElementHandle, Page } from "puppeteer";
import path from "path";
import fs from "fs";

export const downloadAttachment = async (args: {
  // link: ElementHandle<HTMLAnchorElement>;
  link: string;
  page: Page;
}) => {
  const { link, page } = args;

  // const filePath = path.join(__dirname, "download-file.pdf");

  // await page.setRequestInterception(true);
  // page.on("request", (request) => {
  //   if (request.url().endsWith(".pdf")) {
  //     request.continue();
  //   } else {
  //     request.abort();
  //   }
  // });

  // // Listen for the response to save the PDF file
  // page.on("response", async (response) => {
  //   if (response.url().includes(".pdf")) {
  //     const buffer = await response.buffer();
  //     fs.writeFileSync(filePath, buffer);
  //     console.log(`PDF downloaded to: ${filePath}`);
  //   }
  // });
  // const href = await page.evaluate((a) => a.getAttribute("href"));
  // const modifiedHref = href?.split("&action")[0]

  await page.evaluate((link: string) => {
    console.log(`Link: ${link}`);
    const newAnchor = document.createElement("a");
    newAnchor.setAttribute("href", link);
    newAnchor.setAttribute("download", "download-file.pdf");
    document.body.appendChild(newAnchor);
    console.log(newAnchor);
    newAnchor.click();
  }, link);
};
