export default (s: string) => {
  return `
    {
      "type": "screen_sharing_source_type",
      "payload": {
        "value": "${s}"
      }
    }
  `;
};
