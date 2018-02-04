import path from 'path';
import helpers from 'yeoman-test';
import assert from 'yeoman-assert';
import faker from 'faker';

const generatorDir = path.join(__dirname, '../src/generators/app');

describe('Generator ts-node-starter', function() {
  describe('when all the questions are answered', function() {
    const name = faker.lorem.word();
    const description = faker.lorem.sentence();
    const authorName = faker.name.firstName() + faker.name.lastName();
    const authorEmail = faker.internet.email();
    const author = { name: authorName, email: authorEmail };

    before(function installGenerator() {
      this.timeout(30000);

      return helpers
        .run(generatorDir)
        .withPrompts({
          name,
          description,
          authorName: author.name,
          authorEmail: author.email
        })
        .withOptions({ skipInstall: true });
    });

    it('should remove the LICENCE file', function() {
      assert.noFile('LICENSE');
    });

    it('should set UNLICENSED in package.json', function() {
      assert.jsonFileContent('package.json', { license: 'UNLICENSED' });
    });

    it('should set the "version" to "0.0.0" in package.json', function() {
      assert.jsonFileContent('package.json', { version: '0.0.0' });
    });

    it('should update the "name" in the package.json', function() {
      assert.jsonFileContent('package.json', { name });
    });

    it('should update the "description" in the package.json', function() {
      assert.jsonFileContent('package.json', { description });
    });

    it('should update the "author" in the package.json', function() {
      assert.jsonFileContent('package.json', { author });
    });

    it('should remove the "repository" from package.json', function() {
      assert.jsonFileContent('package.json', { repository: undefined });
    });

    it('should remove example files', function() {
      assert.noFile('src/sum.ts');
      assert.noFile('test/unit');
      assert.fileContent('src/index.ts', '\n\n');
    });

    it('should update the README.md', function() {
      assert.fileContent('README.md', '# ' + name);
    });

    it('should initialize a git repository', function() {
      assert.file('.git');
    });
  });

  context('when the description is empty', function() {
    before(function installGenerator() {
      this.timeout(30000);

      return helpers
        .run(generatorDir)
        .withPrompts({
          name: faker.lorem.word(),
          description: ''
        })
        .withOptions({ skipInstall: true });
    });

    it('should not set description in the "package.json"', function() {
      assert.jsonFileContent('package.json', { description: undefined });
    });
  });
});
