### Guide on how to fix a typo in translations of Deskreen

## Contents

- [Notes on editing `translation.json` files. (Applies to all contributors wether you know how to code or not)](#notes-on-edit)
- [I don't know how to code or I don't know how git works, but I want to help with fixing a typo for a language used in Deskreen App or Website](#dont-know-code)
- [I know how to code and I know how git works, where should I start with fixing a typo for a language used in Deskreen App or Website?](#i-know-code)

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
<h2>I don't know how to code or I don't know how git works, but I want to help with fixing a typo for a language used in Deskreen App or Website</h2>
</a>

### Fix typo for Deskreen App if you don't know how to code

You can use any simple text editor to edit `translation.json` file.
Good text editors for different operating systems:

- Windows (Notepad)
- MacOS (TextEdit)
- Linux (gedit, mousepad etc.)

#### Download a files for language with typo from here:

Find `translation.json` file for language you need to edit here:

[host app (that runs on computer)](https://github.com/pavlobu/deskreen/tree/master/app/locales)

[client viewer app (that runs in a web browser)](https://github.com/pavlobu/deskreen/tree/master/app/client/public/locales)

You can use any simple text editor to edit `translation.json` file.
Good text editors for different operating systems:

- Windows (Notepad)
- MacOS (TextEdit)
- Linux (gedit, mousepad etc.)

### Fix typo for Deskreen Website if you don't know how to code

Docs coming soon. Stay tuned.

#### How to download `translation.json` file

open **Raw** `translation.json` file -> right click in browser window -> Save as..

### When finished editing translation.json files

You can send me a Google Drive link to these files for translations of Deskreen App or Website, or attach them to email.
Send your email with files here: pavlobu@gmail.com
Please give different names for the files when attaching them.
Also please include what is language name your fix is for.
After that we will be adding your typo fix in new release. Thank you!

<br/>
<br/>

<a id="i-know-code">
<h2>I know how to code and I know how git works, where should I start with fixing a typo for a language used in Deskreen App or Website?</h2>
</a>

### Fix typo for Deskreen App if you know how to code

Find `translation.json` file for language you need to edit here:

[host app (that runs on computer)](https://github.com/pavlobu/deskreen/tree/master/app/locales)

[client viewer app (that runs in a web browser)](https://github.com/pavlobu/deskreen/tree/master/app/client/public/locales)

Fix them and then submit your PR. Thank you!

### Fix typo for Deskreen Website if you know how to code

Docs coming soon. Stay tuned.

### When the Deskreen App edits done, then please fix tests if they are broken. And regenerate snapshots if needed.

### How to regenerate snapshots if you have tests failing when running `yarn test`?

in root `./` folder of project run this:

```
yarn test --updateSnapshot
```

in Deskreen Viewer `./app/client` folder of project run this:

```
cd app/client
SKIP_PREFLIGHT_CHECK=true yarn test:nowatch -- -u
```

### IMPORTANT: Please make sure your PR is 1 or maximum 2 commits length. If it is longer than that, you will be asked to squash your PR commits. If you don't know how to squash, refer [this guide](#dont-know-code)

### After you done fixing, please submit your PR, it will be reviewed and if everything is ok it will be merged and you fix will be included in next release. Thank you!
