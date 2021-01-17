/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const githubApiRepoTagsUrl =
  'https://api.github.com/repos/pavlobu/deskreen/tags';

export default async function getNewVersionTag() {
  let latestVersionTag = '';

  const response = await axios({
    url: githubApiRepoTagsUrl,
    method: 'get',
    headers: { 'User-Agent': 'node.js' },
  });

  const foundTag = response.data.find((tagData: any) => {
    return (tagData.name as string).startsWith('v');
  });

  latestVersionTag = foundTag ? foundTag.name : '';
  latestVersionTag = latestVersionTag.slice(1);

  return latestVersionTag;
}
