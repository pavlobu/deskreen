export function prepareDataMessageToChangeQuality(q: number) {
  return `
    {
      "type": "set_video_quality",
      "payload": {
        "value": ${q}
      }
    }
  `;
}

export function prepareDataMessageToGetSharingSourceType(){
  return `
    {
      "type": "get_sharing_source_type",
      "payload": {
      }
    }
  `;
}
