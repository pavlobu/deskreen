export default (q: number) => {
  return `
    {
      "type": "set_video_quality",
      "payload": {
        "value": ${q}
      }
    }
  `;
};
