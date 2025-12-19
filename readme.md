# Live presentation
Create your presentations in HTML with nice looking math formulas, endless drawing and live and native code execution on your pc via cmd. <br>
In addition you can glance at your notes on the right and take notes while presenting on the bottom, while a secondary window only shows your presentation. <br>
It's super easy to edited your slides while presenting and saving the final state either as html or pdf without wasting space.

## Minimal HTML
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <script src="https://live-presentation.lnoppinger.de/bundle.js"></script>
</head>
<body>
    <section>
        <h1> My live presentation </h1>
    </section>
    <section>
        <p> Text for presentation <br> ... </p>
    </section>
</body>
```

## Full Example HTML
see index.html

## Code runner
### Connection:
webstocket connection to http://localhost:8765 or specified in config.code.url <br><br>
-> sends json:
```
{
    rows: ... ,    // size of web termnal
    columns: ... ,
    cmd: ... ,     // input from web terminal or data-cmd
    files: [
        {
            name: ... ,
            code: ... ,
        },
        ...
    ]
}
```
<- receives string, written to web terminal

### Installation:
npm install ws node-pty <br>
for Windows, Visual Studio build tools 2022 with <br>
"Desktop development with C++" and <br>
"MSVC v143 - VS 2022 C++ x64/x86 Spectre-mitigated libs" is required