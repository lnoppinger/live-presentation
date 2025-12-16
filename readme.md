# Live presentation

## Full Example HTML
```html
<!DOCTYPE html>
<html lang="de">
<head>
    <script src="https://live-presentation.lnoppinger.de/bundle.js"></script>
    <title> Title </title>
</head>
<body>
    <section>
        <h1> My live presentation </h1>
    </section>

    <section>
        <p> Text for presentation <br> ... <br> <br> Press N to see notes </p>
        <aside>
            Notes displayed next to the slide on the right
        </aside>
        <footer>
            Notes taken while presenting (can be edited)
        </footer>
    </section>

    <section>
        <code data-cmd="java main.java" data-file="main.java"> 
            public class Main {
                ...
            }
        </code>
        <code data-cmd="java main.java" data-file="test.java"> 
            public class Test {
                ...
            }
        </code>
        <code data-cmd="java main.java" data-file="test2.java" data-hidden> 
            public class Test2 {
                ...
            }
        </code>
    </section>

    <section>
        <p> Text above canvas</p>
        <canvas width="500" height="300"> </canvas>
    </section>

    <section>
        <p> Important Math</p>
        <math>
            a^2 + b^2 = c^2
        </math>
        <canvas data-flex> </canvas>
    </section>

    <script>
        config.canvas.colors = ["yellow", "darkgreen", "lightblue", "pink", "violet", "brown", "lightgray", "turquoise", "green", "red", "var(--black)", "blue"]
    </script>
</body>
```

## Minimal HTML
```html
<!DOCTYPE html>
<html lang="de">
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