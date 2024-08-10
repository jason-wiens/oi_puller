import { Page } from "puppeteer";

export const downloadAttachment = async (args: {
  filename: string;
  link: string;
  page: Page;
}) => {
  const { link, page, filename } = args;
  await page.evaluate(
    (args: { link: string; filename: string }) => {
      const { link, filename } = args;
      const newAnchor = document.createElement("a");
      newAnchor.setAttribute("href", link);
      newAnchor.setAttribute("download", filename);
      document.body.appendChild(newAnchor);
      newAnchor.click();
    },
    { link, filename }
  );
};
