### Guide on how to add a new language translation to Deskreen

[As we agreed in our community](https://github.com/pavlobu/deskreen/issues/60), when adding a new language support for Deskreen,
the translations for Deskreen App should be done along with translations for a website too.
Why is that? Because if you translate app only, it doesn't bring any value to users because they
can not read any documentation and important information about Deskreen on a website.

If you are willing to contribute to translate application only and don't want to help with translating a
website, then your submission with new language support will be stalled up until the time when there
is a translation for Deskreen website.
Follow guides on [Deskreen website locales repo](https://github.com/Deskreen/deskreen-website-locales)
for adding your language translation for [Deskreen Website](https://deskreen.com)

## The how-to guides on submitting translations for Deskreen website will be added here soon (within next week). Stay tuned.

You can subscribe to this thread for news on translations:
https://github.com/pavlobu/deskreen/issues/60

<br/>

## Contents

- [Notes on editing `translation.json` files. (Applies to all contributors wether you know how to code or not)](#notes-on-edit)
- [I don't know how to code or I don't know how git works, but I want to help with adding a new language support for Deskreen App and Website](#dont-know-code)
- [I know how to code and I know how git works, where should I start with adding a new language for Deskreen App and Website?](#i-know-code)

<br/>

<a id="notes-on-edit">
<h2>Notes on editing `translation.json` files. (Applies to all contributors wether you know how to code or not)</h2>
</a>

When editing a `translation.json` file, don't change the **left part of translation** before the `:`.
Only change the text between `"` on right side of `:` sign.

#### Example:

Some content of `translation.json`

<a id="edit-orig">
<h6>Before your change (original):</h6>
</a>

```
...
"Hello": "Hello"
...
```

##### Good example, after your change (for example Spanish language support):

```
...
"Hello": "Hola"
...
```

##### **Bad example** of your change (left side is different than in [original](#edit-orig)):

```
...
"Greetings": "Hola"
...
```

### Rule of thumb, don't edit a text on a left side of `:` sign in `translation.json` file. only edit a text between `"` on the right side from `:` symbol.

<br/>
<br/>

<a id="dont-know-code">
<h2>I don't know how to code or I don't know how git works, but I want to help with adding a new language support for Deskreen App and Website</h2>
</a>

### Add new language for Deskreen App if you don't know how to code

You can use any simple text editor to edit `translation.json` file.
Good text editors for different operating systems:

- Windows (Notepad)
- MacOS (TextEdit)
- Linux (gedit, mousepad etc.)

You can grab English language `translation.json` file [here](https://raw.githubusercontent.com/pavlobu/deskreen/master/app/locales/en/translation.json) and use it as a template.
**That file is for a Deskreen App that runs on computer.**

The second English language `translation.json` file you need to edit is [here](https://raw.githubusercontent.com/pavlobu/deskreen/master/app/client/public/locales/en/translation.json)
and use it as a template.
**That file is for a Deskreen Viewer that runs on any device web browser.**

#### How to download `translation.json` file

open link -> right click in browser window -> Save as..

### Add new language for Deskreen Website if you don't know how to code

Follow guides on [Deskreen website locales repo](https://github.com/Deskreen/deskreen-website-locales)

### When finished editing translation.json files

You can send me a Google Drive link to these files for translations of Deskreen App and Website, or attach them to email.
Send your email with files here: pavlobu@gmail.com
Please give different names for the files when attaching them.
Also please include what is language name your translation is for.
After that we will be adding a support for new language and make a new release with your name in changelog :) Big thanks to you!

<br/>
<br/>

<a id="i-know-code">
<h2>I know how to code and I know how git works, where should I start with adding a new language for Deskreen App and Website?</h2>
</a>

### IMPORTANT: Please make sure your PR is 1 or maximum 2 commits length. If it is longer than that, you will be asked to squash your PR commits. If you don't know how to squash, refer [this guide](#dont-know-code)

### Add new language for Deskreen App. Step By Step Guide for coders and people who know how to use git

You need to add it in two places: 1. host app, that runs on a computer and 2. client viewer, that runs in a web browser

#### Let's say you wan to add a language support for Spanish.

#### Host app translations, step by step:

- in `app/locales` create a new directory with [`ISO 639-1`](https://www.loc.gov/standards/iso639-2/php/code_list.php) Code of Spanish which is `es`
- create `app/locales/es/translation.json`
- copy contents of `app/locales/en/translation.json` to `app/locales/es/translation.json`
- edit translations in `app/locales/es/translation.json` **translating only stuff that is on the right side of `:` on each row to Spanish**
- in `app/configs/app.lang.config.ts` add a full language name with iso key in `langISOKeyToLangFullNameMap` map. Example: `es: Espagnol`
- in `app/configs/app.lang.config.ts` add a language iso key in `languages` list. Example: `['en', .... , 'es']`
- on the top of all `translation.json` in `app/locales` add `es: Espagnol` under all languages. Example:
  ```
  ....
  "ru": "Русский",
  "en": "English",
  "ua": "Українська",
  "es": "Espagnol",
  ....
  ```
- In `getShuffledArrayOfHello`(search for arrow function) add a Hello word in your language to `res` list like this: `res.push(translationES.Hello);`. You will first need to import `translationES` on a top of file where this arrow function is. Example: `import translationES from '../locales/es/translation.json'`

- Done with the host app!
- Now proceed with client viewer. Create a directory `es` in `app/client/public/locales`
- create `app/client/public/locales/es/translation.json`
- copy contents of `app/client/public/locales/en/translation.json` to `app/client/public/locales/es/translation.json`
- edit translations in `app/client/public/locales/es/translation.json` **translating only stuff that is on the right side of `:` on each row to Spanish**
- in `app/client/src/config/i18n.ts` in `whitelist` add `es` to the end. Example: `whitelist: ['en', 'ru', 'ua', 'es']`
- Done with client translations!

### Dont forget to test whether your typo fix works. Run app with `yarn start` from `./` root dir of Deskreen project.

### When the Deskreen App translations done, then please fix tests if they are broken. And regenerate snapshots if needed.

### How to regenerate snapshots if you have tests failing when running `yarn test`?

in root `./` folder of project run this:

```
yarn jest --updateSnapshot
```

in Deskreen Viewer `./app/client` folder of project run this:

```
cd app/client
SKIP_PREFLIGHT_CHECK=true yarn test:nowatch -- -u
```

### Run `yarn test-all` locally to make sure you don't have any errors, before submitting your PR

### By this time you should be done with adding a translation.

### Add new language for Deskreen Website. Step By Step Guide for coders and people who know how to use git

Follow guides on [Deskreen website locales repo](https://github.com/Deskreen/deskreen-website-locales)

### IMPORTANT: Please make sure your PR is 1 or maximum 2 commits length. If it is longer than that, you will be asked to squash your PR commits. If you don't know how to squash, refer [this guide](#dont-know-code)

### After that you can submit your PR and it will be reviewed and if it is ok and translations for website are also done, then it will be merged and your translations will be included in new release of Deskreen. Big thanks to you!
