# Get Started

## Installing
There are two ways to install Ditto.

1) First you have to clone the repo from `https://github.com/BananiumLabs/Ditto.git`. Then, run either `yarn install` or `npm install`. From there, either run `yarn link` or `npm link`. Then, you can run `dit` from the command line.

2) The second download method is easier, as you simply download your given operating system's packge from the latest release at [https://github.com/BananiumLabs/Ditto/releases](https://github.com/BananiumLabs/Ditto/releases). From there, run the provided install script and start using Ditto by typing `dit` into the command line.

## Ditto CLI?
To use the Ditto CLI, you simply call `dit`. If you need help, use `dit --help`.

## Writing your first program
Right off the bat, open up your favorite editing software and create a file with the `.dit` extension. This program will be simple, so we'll just make it count up to 10 with a `for` loop. Copy paste the following contents into your file:

```
for i in 0 through 10 do:
    write i
```

Next, run `dit compile ./YOUR_FILE_NAME.dit` in the console. If everything went well in your setup, this should simply write out a file with the same name as your original `.dit` file, but with no file extension (or `.exe`).

That's a binary file. Essentially, Ditto has taken your code and compiled it into a lower level computer language. To run it, go to your file explorer and double click the file. You'll get something like this:

```
0
1
2
3
4
5
6
7
8
9
10
```

From here, you can start expanding your script and express whatever you want through Ditto. For more information on syntax, visit the [syntax summary](syntax_summary.md) page or the [token list](token_list.md) page to learn more about the language.