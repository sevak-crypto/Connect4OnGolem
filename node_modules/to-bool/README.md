# To-Bool
Convert data types to boolean.

## About
This is a very basic utility library to help convert the basic JS data types to boolean. Each type is treated differently:

 * *Boolean* is returned as-is
 * *Function* is assumed to be true
 * *Number* is true for greater-or-less-than 0
 * *Object* is just cast to boolean (`!!`), which works for `null` (as `typeof null === "object"`)
 * *String* is converted to lower-case and compared to `"true"` or `"1"`
 * *Symbol* is currently treated as always-true
 * *Undefined* is always false

If none of these types match the passed item, a `TypeError` is thrown.

## Usage

Usage is super easy:

```
var toBool = require("to-bool");

if (toBool(someVariable)) {
	console.log("It's true.");
}
```
