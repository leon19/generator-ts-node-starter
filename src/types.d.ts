declare module 'yeoman-assert' {
  export function file(file: string): void;

  export function noFile(file: string): void;

  export function jsonFileContent(file: string, partialJson: object): void;

  export function fileContent(file: string, contents: string): void;
}
