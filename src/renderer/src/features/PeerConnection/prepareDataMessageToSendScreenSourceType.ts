export default (s: string): string => {
	return `
    {
      "type": "screen_sharing_source_type",
      "payload": {
        "value": "${s}"
      }
    }
  `;
};
