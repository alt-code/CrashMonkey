#### Test Case
```
[File: {
    [Test: {
        id, desc, filepath, function, inputs, assertions, outputs, type
    },...]
},...]
```

**Test case types**  
Exported function, Root function, Constructor prototype function

**Call sequence**  
```
[Call: {
    context, function, params
}]
```
Values for 'context' and 'function'  
**"."** - no context  
**"name"** - function name  
**"{0}"** - value from call step 0  
**"{root}"** - root module name