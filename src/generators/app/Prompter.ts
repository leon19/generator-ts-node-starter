import { isString } from 'lodash';
import { Answers, Questions } from 'yeoman-generator';

export class Prompter {
  constructor(private prompt: (questions: Questions) => Promise<Answers>) {}

  async askProjectName(defaultName?: string): Promise<string> {
    const { name } = await this.prompt({
      default: defaultName,
      message: 'Your project name',
      name: 'name',
      type: 'input'
    });

    if (isString(name) && name.trim()) {
      return name.trim();
    }

    return this.askProjectName();
  }

  async askDescription() {
    const { description } = await this.prompt({
      message: 'Your project description',
      name: 'description',
      type: 'input'
    });

    return isString(description) ? description.trim() : '';
  }

  async askAuthorName(defaultAuthorName?: string) {
    const { authorName } = await this.prompt({
      default: defaultAuthorName,
      message: 'Author name',
      name: 'authorName',
      type: 'input'
    });

    return isString(authorName) ? authorName.trim() : '';
  }

  async askAuthorEmail(defaultAuthorEmail?: string) {
    const { authorEmail } = await this.prompt({
      default: defaultAuthorEmail,
      message: 'Author email',
      name: 'authorEmail',
      type: 'input'
    });

    return isString(authorEmail) ? authorEmail.trim() : '';
  }
}
