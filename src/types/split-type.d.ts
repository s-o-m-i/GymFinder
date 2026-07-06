declare module "split-type" {
  export default class SplitType {
    constructor(
      target: string | Element,
      options?: {
        types?: string;
        tagName?: string;
        lineClass?: string;
        wordClass?: string;
        charClass?: string;
      }
    );
    lines: HTMLElement[] | null;
    words: HTMLElement[] | null;
    chars: HTMLElement[] | null;
    revert(): void;
  }
}
