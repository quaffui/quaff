import { readFile } from "fs/promises";
import pathExists from "../helpers/pathExists.js";
import generateHash from "../helpers/generateHash.js";

function extractHash(docsPropsContent: string) {
  const hashPattern = /@quaffHash ([a-f0-9]+)/;
  const match = docsPropsContent.match(hashPattern);

  return match?.[1] || null;
}

type InfoObject = {
  needsToBeGenerated: boolean;
  hashProps?: string;
};

export default async function getInfo(
  propsFilePath: string,
  docsPropsFilePath: string
): Promise<InfoObject> {
  if (!(await pathExists(propsFilePath))) {
    return { needsToBeGenerated: false };
  }

  const hashProps = generateHash(await readFile(propsFilePath, "utf8"));

  if (!(await pathExists(docsPropsFilePath))) {
    return { needsToBeGenerated: true, hashProps };
  }

  const hashFromDocsProps = extractHash(await readFile(docsPropsFilePath, "utf8"));
  const needsToBeGenerated = hashProps !== hashFromDocsProps;

  return { needsToBeGenerated, hashProps };
}
