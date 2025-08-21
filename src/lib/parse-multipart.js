import { Readable } from "stream";

export function webRequestToNodeReadable(req) {
  return Readable.from(req.body);
}
